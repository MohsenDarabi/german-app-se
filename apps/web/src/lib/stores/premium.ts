/**
 * Premium Store
 *
 * Manages premium subscription status and offline downloads.
 * Syncs with Supabase for server-side verification.
 */

import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';
import { db, type DownloadedLesson } from '$lib/db';
import { supabase } from '$lib/supabase/client';
import { getLessonAudioHashes, getState } from '$lib/services/assetService';

// Types
interface PremiumState {
  isPremium: boolean;
  expiresAt: string | null;
  loading: boolean;
  error: string | null;
}

interface DownloadState {
  downloading: string | null; // lessonId currently downloading
  progress: number; // 0-100
  downloadedLessons: Map<string, DownloadedLesson>;
  totalCacheSize: number;
}

// Stores
const premiumState = writable<PremiumState>({
  isPremium: false,
  expiresAt: null,
  loading: false,
  error: null,
});

const downloadState = writable<DownloadState>({
  downloading: null,
  progress: 0,
  downloadedLessons: new Map(),
  totalCacheSize: 0,
});

// Derived stores
export const isPremium = derived(premiumState, $s => $s.isPremium);
export const premiumExpiresAt = derived(premiumState, $s => $s.expiresAt);
export const premiumLoading = derived(premiumState, $s => $s.loading);
export const premiumError = derived(premiumState, $s => $s.error);

export const downloading = derived(downloadState, $s => $s.downloading);
export const downloadProgress = derived(downloadState, $s => $s.progress);
export const downloadedLessons = derived(downloadState, $s => [...$s.downloadedLessons.values()]);
export const totalCacheSize = derived(downloadState, $s => $s.totalCacheSize);

/**
 * Check if a specific lesson is downloaded for offline use
 */
export function isLessonDownloaded(languagePair: string, lessonId: string): boolean {
  const state = get(downloadState);
  const key = `${languagePair}:${lessonId}`;
  return state.downloadedLessons.has(key);
}

/**
 * Initialize premium status from Supabase and load downloaded lessons
 */
export async function initPremium(): Promise<void> {
  if (!browser) return;

  premiumState.update(s => ({ ...s, loading: true, error: null }));

  try {
    // Check Supabase for premium status
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Fetch premium status from user metadata or profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_premium, premium_expires_at')
        .eq('id', user.id)
        .single();

      if (profile) {
        const isPremium = profile.is_premium &&
          (!profile.premium_expires_at || new Date(profile.premium_expires_at) > new Date());

        premiumState.update(s => ({
          ...s,
          isPremium,
          expiresAt: profile.premium_expires_at,
          loading: false,
        }));

        // Update local DB
        await db.users.where('email').equals(user.email!).modify({
          isPremium,
          premiumExpiresAt: profile.premium_expires_at,
        });

        // Notify service worker
        notifyServiceWorker({ type: 'SET_PREMIUM', data: { value: isPremium } });
      }
    }

    // Load downloaded lessons from IndexedDB
    const lessons = await db.downloadedLessons.toArray();
    const lessonsMap = new Map<string, DownloadedLesson>();

    for (const lesson of lessons) {
      lessonsMap.set(`${lesson.languagePair}:${lesson.lessonId}`, lesson);
    }

    downloadState.update(s => ({
      ...s,
      downloadedLessons: lessonsMap,
    }));

    // Get cache size from service worker
    await updateCacheSize();

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load premium status';
    premiumState.update(s => ({ ...s, loading: false, error: message }));
  }
}

/**
 * Download a lesson for offline use (premium only)
 */
export async function downloadLesson(languagePair: string, lessonId: string): Promise<void> {
  if (!browser) return;

  const state = get(premiumState);
  if (!state.isPremium) {
    throw new Error('Premium subscription required for offline downloads');
  }

  // Get audio hashes for this lesson
  const audioHashes = getLessonAudioHashes(lessonId);

  if (audioHashes.length === 0) {
    throw new Error('No audio files found for this lesson');
  }

  downloadState.update(s => ({ ...s, downloading: lessonId, progress: 0 }));

  try {
    // Send cache request to service worker
    await notifyServiceWorkerAndWait({
      type: 'CACHE_LESSON',
      data: { languagePair, audioHashes },
    });

    // Record in IndexedDB
    const downloadedLesson: DownloadedLesson = {
      languagePair,
      lessonId,
      audioHashes,
      downloadedAt: new Date().toISOString(),
      sizeBytes: 0, // Will be updated by cache size check
      version: getState().manifest?.version || '1.0.0',
    };

    await db.downloadedLessons.put(downloadedLesson);

    // Update local state
    downloadState.update(s => {
      const newMap = new Map(s.downloadedLessons);
      newMap.set(`${languagePair}:${lessonId}`, downloadedLesson);
      return { ...s, downloading: null, progress: 100, downloadedLessons: newMap };
    });

    // Refresh cache size
    await updateCacheSize();

  } catch (error) {
    downloadState.update(s => ({ ...s, downloading: null, progress: 0 }));
    throw error;
  }
}

/**
 * Delete a downloaded lesson
 */
export async function deleteDownloadedLesson(languagePair: string, lessonId: string): Promise<void> {
  if (!browser) return;

  const key = `${languagePair}:${lessonId}`;
  const state = get(downloadState);
  const lesson = state.downloadedLessons.get(key);

  if (!lesson) return;

  // Send delete request to service worker
  await notifyServiceWorkerAndWait({
    type: 'DELETE_LESSON',
    data: { languagePair, audioHashes: lesson.audioHashes },
  });

  // Remove from IndexedDB
  await db.downloadedLessons
    .where('[languagePair+lessonId]')
    .equals([languagePair, lessonId])
    .delete();

  // Update local state
  downloadState.update(s => {
    const newMap = new Map(s.downloadedLessons);
    newMap.delete(key);
    return { ...s, downloadedLessons: newMap };
  });

  // Refresh cache size
  await updateCacheSize();
}

/**
 * Update cache size from service worker
 */
async function updateCacheSize(): Promise<void> {
  if (!browser) return;

  const size = await getCacheSizeFromServiceWorker();
  downloadState.update(s => ({ ...s, totalCacheSize: size }));
}

/**
 * Send message to service worker
 */
function notifyServiceWorker(message: { type: string; data?: unknown }): void {
  if (!browser || !navigator.serviceWorker?.controller) return;
  navigator.serviceWorker.controller.postMessage(message);
}

/**
 * Send message to service worker and wait for completion
 */
async function notifyServiceWorkerAndWait(message: { type: string; data?: unknown }): Promise<void> {
  if (!browser || !navigator.serviceWorker?.controller) {
    throw new Error('Service worker not available');
  }

  return new Promise((resolve, reject) => {
    const channel = new MessageChannel();

    channel.port1.onmessage = (event) => {
      if (event.data.error) {
        reject(new Error(event.data.error));
      } else {
        resolve();
      }
    };

    navigator.serviceWorker.controller!.postMessage(message, [channel.port2]);

    // Timeout after 60 seconds
    setTimeout(() => reject(new Error('Service worker timeout')), 60000);
  });
}

/**
 * Get cache size from service worker
 */
async function getCacheSizeFromServiceWorker(): Promise<number> {
  if (!browser || !navigator.serviceWorker?.controller) return 0;

  return new Promise((resolve) => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'CACHE_SIZE') {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
        resolve(event.data.size || 0);
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);
    navigator.serviceWorker.controller!.postMessage({ type: 'GET_CACHE_SIZE' });

    // Timeout after 5 seconds
    setTimeout(() => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
      resolve(0);
    }, 5000);
  });
}

/**
 * Format bytes to human readable
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// Export stores
export { premiumState, downloadState };
