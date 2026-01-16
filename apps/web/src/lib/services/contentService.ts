/**
 * Content Service for CDN-based lesson delivery
 *
 * Handles loading lesson JSON from Cloudflare R2 CDN with:
 * - IndexedDB caching for offline access
 * - Smart pre-caching (current + next lesson)
 * - Local fallback for development
 * - Version checking for content updates
 */

import { browser } from '$app/environment';
import { writable, get } from 'svelte/store';
import { PUBLIC_R2_URL } from '$env/static/public';
import { LessonSchema, type Lesson } from '@pkg/content-model';
import * as assetService from './assetService';

// Types
export interface ContentIndex {
  version: string;
  languagePair: string;
  name: { source: string; target: string };
  flag: string;
  levels: Record<string, {
    modules: number;
    lessons: number;
    totalMinutes: number;
  }>;
  lessons: LessonMeta[];
  stats: {
    totalLessons: number;
    totalMinutes: number;
    totalSize: number;
  };
  updatedAt: string;
}

export interface LessonMeta {
  id: string;
  level: string;
  module: number;
  lessonNumber: number;
  title: { de: string; fa: string };
  estimatedMinutes: number;
  stepCount: number;
  vocabularyCount: number;
  tags: string[];
  size: number;
}

interface CachedLesson {
  id: string;
  languagePair: string;
  data: Lesson;
  cachedAt: string;
  version: string;
}

interface ContentServiceState {
  initialized: boolean;
  loading: boolean;
  error: string | null;
  languagePair: string;
  contentIndex: ContentIndex | null;
  cdnEnabled: boolean;
}

// CDN base URL from environment
const CDN_BASE = PUBLIC_R2_URL || '';
const CONTENT_CDN_ENABLED = true; // Enable by default when CDN_BASE is configured

// Service state store
const state = writable<ContentServiceState>({
  initialized: false,
  loading: false,
  error: null,
  languagePair: 'de-fa',
  contentIndex: null,
  cdnEnabled: !!CDN_BASE && CONTENT_CDN_ENABLED,
});

// In-memory cache for lesson data
const lessonCache = new Map<string, Lesson>();

// IndexedDB for persistent offline storage
const DB_NAME = 'ContentCache';
const DB_VERSION = 1;
const LESSON_STORE = 'lessons';
const INDEX_STORE = 'indexes';

let dbPromise: Promise<IDBDatabase> | null = null;

/**
 * Open IndexedDB connection
 */
function openDB(): Promise<IDBDatabase> {
  if (!browser) return Promise.reject(new Error('Not in browser'));

  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Store for cached lessons
      if (!db.objectStoreNames.contains(LESSON_STORE)) {
        const lessonStore = db.createObjectStore(LESSON_STORE, { keyPath: ['languagePair', 'id'] });
        lessonStore.createIndex('languagePair', 'languagePair', { unique: false });
        lessonStore.createIndex('cachedAt', 'cachedAt', { unique: false });
      }

      // Store for content indexes
      if (!db.objectStoreNames.contains(INDEX_STORE)) {
        db.createObjectStore(INDEX_STORE, { keyPath: 'languagePair' });
      }
    };
  });

  return dbPromise;
}

/**
 * Get lesson from IndexedDB cache
 */
async function getFromCache(languagePair: string, lessonId: string): Promise<CachedLesson | null> {
  if (!browser) return null;

  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(LESSON_STORE, 'readonly');
      const store = tx.objectStore(LESSON_STORE);
      const request = store.get([languagePair, lessonId]);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  } catch (e) {
    console.warn('ContentService: Cache read error', e);
    return null;
  }
}

/**
 * Save lesson to IndexedDB cache
 */
async function saveToCache(languagePair: string, lessonId: string, data: Lesson, version: string): Promise<void> {
  if (!browser) return;

  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(LESSON_STORE, 'readwrite');
      const store = tx.objectStore(LESSON_STORE);
      const cached: CachedLesson = {
        id: lessonId,
        languagePair,
        data,
        cachedAt: new Date().toISOString(),
        version,
      };
      const request = store.put(cached);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (e) {
    console.warn('ContentService: Cache write error', e);
  }
}

/**
 * Check if lesson is cached
 */
export async function isContentCached(lessonId: string): Promise<boolean> {
  const currentState = get(state);
  const cached = await getFromCache(currentState.languagePair, lessonId);
  return cached !== null;
}

/**
 * Check if CDN is enabled and configured
 */
export function isCdnEnabled(): boolean {
  return get(state).cdnEnabled;
}

/**
 * Get CDN base URL
 */
export function getCdnBase(): string {
  return CDN_BASE;
}

/**
 * Initialize content service for a language pair
 * Loads the content index from CDN
 */
export async function init(languagePair: string = 'de-fa'): Promise<void> {
  if (!browser) return;

  const currentState = get(state);

  // If already initialized for this language, skip
  if (currentState.initialized && currentState.languagePair === languagePair) {
    return;
  }

  // If CDN not configured, just update language pair
  if (!CDN_BASE || !CONTENT_CDN_ENABLED) {
    console.warn('ContentService: CDN not configured, using local content');
    state.update(s => ({ ...s, initialized: true, languagePair, cdnEnabled: false }));
    return;
  }

  state.update(s => ({ ...s, loading: true, error: null }));

  try {
    const url = `${CDN_BASE}/${languagePair}/content/index.json`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to load content index: ${response.status}`);
    }

    const contentIndex: ContentIndex = await response.json();

    state.update(s => ({
      ...s,
      initialized: true,
      loading: false,
      languagePair,
      contentIndex,
      cdnEnabled: true,
    }));

    console.log(`ContentService: Loaded ${languagePair} index`, {
      lessons: contentIndex.stats.totalLessons,
      totalSize: `${(contentIndex.stats.totalSize / 1024).toFixed(1)} KB`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.warn('ContentService: Failed to load index, falling back to local', error);
    state.update(s => ({
      ...s,
      loading: false,
      error: message,
      initialized: true,
      languagePair,
      cdnEnabled: false,
    }));
  }
}

/**
 * Module folders to search for lessons (for local fallback)
 */
const MODULE_FOLDERS = ['module-01', 'module-02', 'module-03', 'module-04', 'module-05', 'module-06', 'module-07', 'module-08'];

/**
 * Load a lesson from CDN (with local fallback)
 * Caches the lesson for offline access
 */
export async function loadLesson(lessonId: string): Promise<Lesson> {
  const currentState = get(state);
  const languagePair = currentState.languagePair;

  // Check in-memory cache first
  const cacheKey = `${languagePair}:${lessonId}`;
  if (lessonCache.has(cacheKey)) {
    return lessonCache.get(cacheKey)!;
  }

  // Check IndexedDB cache
  const cached = await getFromCache(languagePair, lessonId);
  if (cached) {
    const lesson = LessonSchema.parse(cached.data);
    lessonCache.set(cacheKey, lesson);
    return lesson;
  }

  // Determine lesson level from ID (e.g., "A1-M01-L01" -> "A1")
  const level = lessonId.split('-')[0];

  // Try CDN first if enabled
  if (currentState.cdnEnabled && CDN_BASE) {
    try {
      const url = `${CDN_BASE}/${languagePair}/content/${level}/lessons/${lessonId}.json`;
      const response = await fetch(url);

      if (response.ok) {
        const json = await response.json();
        const lesson = LessonSchema.parse(json);

        // Cache the lesson
        lessonCache.set(cacheKey, lesson);
        await saveToCache(languagePair, lessonId, lesson, currentState.contentIndex?.version || '1.0.0');

        return lesson;
      }
    } catch (e) {
      console.error(`ContentService: CDN fetch/parse failed for ${lessonId}:`, e);
    }
  }

  // Fall back to local content
  for (const moduleFolder of MODULE_FOLDERS) {
    const url = `/content/${languagePair}/${level}/${moduleFolder}/${lessonId}.json`;

    try {
      const response = await fetch(url);
      if (response.ok) {
        const json = await response.json();
        const lesson = LessonSchema.parse(json);

        // Cache the lesson
        lessonCache.set(cacheKey, lesson);
        await saveToCache(languagePair, lessonId, lesson, '1.0.0');

        return lesson;
      }
    } catch {
      continue;
    }
  }

  throw new Error(`Lesson not found: ${lessonId}`);
}

/**
 * Get the next lesson ID based on current lesson
 */
export function getNextLessonId(currentLessonId: string): string | null {
  const currentState = get(state);

  // If we have content index, use it
  if (currentState.contentIndex) {
    const lessons = currentState.contentIndex.lessons;
    const currentIndex = lessons.findIndex(l => l.id === currentLessonId);
    if (currentIndex >= 0 && currentIndex < lessons.length - 1) {
      return lessons[currentIndex + 1].id;
    }
    return null;
  }

  // Parse lesson ID: A1-M01-L01 -> level=A1, module=1, lesson=1
  const match = currentLessonId.match(/^(A\d+)-M(\d+)-L(\d+)$/);
  if (!match) return null;

  const [, level, moduleStr, lessonStr] = match;
  const moduleNum = parseInt(moduleStr, 10);
  const lessonNum = parseInt(lessonStr, 10);

  // Try next lesson in same module
  const nextLessonId = `${level}-M${moduleNum.toString().padStart(2, '0')}-L${(lessonNum + 1).toString().padStart(2, '0')}`;

  // If module has more lessons (assume max 10 per module)
  if (lessonNum < 10) {
    return nextLessonId;
  }

  // Try first lesson of next module
  return `${level}-M${(moduleNum + 1).toString().padStart(2, '0')}-L01`;
}

/**
 * Pre-load the next lesson for smart caching
 * Called when user is near completion of current lesson
 */
export async function preloadNextLesson(currentLessonId: string): Promise<void> {
  const nextId = getNextLessonId(currentLessonId);
  if (!nextId) return;

  // Check if already cached
  if (await isContentCached(nextId)) {
    console.log(`ContentService: Next lesson ${nextId} already cached`);
    return;
  }

  try {
    console.log(`ContentService: Pre-loading next lesson ${nextId}`);
    await loadLesson(nextId);

    // Also preload audio for the lesson
    await assetService.preloadLesson(nextId);
  } catch (e) {
    // Silently fail - pre-loading is best-effort
    console.warn(`ContentService: Failed to preload ${nextId}`, e);
  }
}

/**
 * Download a lesson for offline use (premium feature)
 * This explicitly downloads and caches the lesson content and audio
 */
export async function downloadLesson(lessonId: string, isPremium: boolean = false): Promise<void> {
  if (!isPremium) {
    throw new Error('Premium subscription required for downloads');
  }

  // Load and cache the lesson JSON
  await loadLesson(lessonId);

  // Preload all audio for the lesson
  await assetService.preloadLesson(lessonId);

  console.log(`ContentService: Downloaded lesson ${lessonId} for offline use`);
}

/**
 * Download all lessons in a module (premium feature)
 */
export async function downloadModule(
  moduleId: string,
  lessonIds: string[],
  isPremium: boolean = false,
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  if (!isPremium) {
    throw new Error('Premium subscription required for downloads');
  }

  for (let i = 0; i < lessonIds.length; i++) {
    await downloadLesson(lessonIds[i], isPremium);
    onProgress?.(i + 1, lessonIds.length);
  }

  console.log(`ContentService: Downloaded module ${moduleId} (${lessonIds.length} lessons)`);
}

/**
 * Get lesson metadata from content index
 */
export function getLessonMeta(lessonId: string): LessonMeta | null {
  const currentState = get(state);
  if (!currentState.contentIndex) return null;
  return currentState.contentIndex.lessons.find(l => l.id === lessonId) || null;
}

/**
 * Get all lessons for a level
 */
export function getLessonsForLevel(level: string): LessonMeta[] {
  const currentState = get(state);
  if (!currentState.contentIndex) return [];
  return currentState.contentIndex.lessons.filter(l => l.level === level);
}

/**
 * Clear all cached content
 */
export async function clearCache(): Promise<void> {
  if (!browser) return;

  lessonCache.clear();

  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction([LESSON_STORE, INDEX_STORE], 'readwrite');
      tx.objectStore(LESSON_STORE).clear();
      tx.objectStore(INDEX_STORE).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    console.log('ContentService: Cache cleared');
  } catch (e) {
    console.warn('ContentService: Failed to clear cache', e);
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{ lessonCount: number; totalSize: number }> {
  if (!browser) return { lessonCount: 0, totalSize: 0 };

  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(LESSON_STORE, 'readonly');
      const store = tx.objectStore(LESSON_STORE);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const lessons = request.result as CachedLesson[];
        const totalSize = lessons.reduce((sum, l) => sum + JSON.stringify(l.data).length, 0);
        resolve({ lessonCount: lessons.length, totalSize });
      };
    });
  } catch (e) {
    return { lessonCount: 0, totalSize: 0 };
  }
}

/**
 * Get current service state
 */
export function getState(): ContentServiceState {
  return get(state);
}

/**
 * Subscribe to state changes
 */
export const subscribe = state.subscribe;

// Export state store for Svelte components
export { state as contentServiceState };
