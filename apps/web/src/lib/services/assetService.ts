/**
 * Asset Service for CDN-based content delivery
 *
 * Handles loading assets from Cloudflare R2 CDN with hash-based audio deduplication.
 * Falls back to local assets if CDN is not configured.
 */

import { browser } from '$app/environment';
import { writable, get } from 'svelte/store';
import { PUBLIC_R2_URL } from '$env/static/public';

// Types
interface Manifest {
  id: string;
  version: string;
  name: { source: string; target: string };
  flag: string;
  levels: string[];
  freeLessons: number;
  audioMap: Record<string, string>; // "lessonId/audioId" -> hash
  stats: {
    totalAudioFiles: number;
    totalAudioReferences: number;
    deduplicationSavings: string;
  };
  updatedAt: string;
}

interface SharedManifest {
  version: string;
  type: 'shared';
  images: Record<string, string>; // assetId -> path
  stats: {
    totalImages: number;
  };
  updatedAt: string;
}

interface AssetServiceState {
  initialized: boolean;
  loading: boolean;
  error: string | null;
  languagePair: string;
  manifest: Manifest | null;
}

// CDN base URL from environment
const CDN_BASE = PUBLIC_R2_URL || '';

// Service state store
const state = writable<AssetServiceState>({
  initialized: false,
  loading: false,
  error: null,
  languagePair: 'de-fa',
  manifest: null,
});

// Cache for manifests (by language pair)
const manifestCache = new Map<string, Manifest>();

// Shared manifest (language-agnostic images)
let sharedManifest: SharedManifest | null = null;
let sharedManifestLoading = false;

/**
 * Check if CDN is configured
 */
export function isCdnEnabled(): boolean {
  return !!CDN_BASE;
}

/**
 * Get current CDN base URL
 */
export function getCdnBase(): string {
  return CDN_BASE;
}

/**
 * Initialize shared resources (images, characters)
 * This is language-agnostic and only needs to be called once
 */
export async function initShared(): Promise<void> {
  if (!browser) return;
  if (!CDN_BASE) return;
  if (sharedManifest || sharedManifestLoading) return;

  sharedManifestLoading = true;

  try {
    const url = `${CDN_BASE}/shared/manifest.json`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to load shared manifest: ${response.status}`);
    }

    sharedManifest = await response.json();
    console.log('AssetService: Loaded shared manifest', {
      images: sharedManifest?.stats.totalImages,
    });
  } catch (error) {
    console.warn('AssetService: Failed to load shared manifest, using local fallback', error);
  } finally {
    sharedManifestLoading = false;
  }
}

/**
 * Initialize the asset service with a language pair
 * Loads the manifest from CDN
 */
export async function init(languagePair: string = 'de-fa'): Promise<void> {
  if (!browser) return;
  if (!CDN_BASE) {
    console.warn('AssetService: CDN not configured, using local assets');
    // Still update the language pair for local asset path resolution
    state.update(s => ({ ...s, initialized: true, languagePair }));
    return;
  }

  // Check cache first
  if (manifestCache.has(languagePair)) {
    state.update(s => ({
      ...s,
      initialized: true,
      languagePair,
      manifest: manifestCache.get(languagePair)!,
    }));
    return;
  }

  state.update(s => ({ ...s, loading: true, error: null }));

  try {
    const url = `${CDN_BASE}/${languagePair}/manifest.json`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to load manifest: ${response.status}`);
    }

    const manifest: Manifest = await response.json();
    manifestCache.set(languagePair, manifest);

    state.update(s => ({
      ...s,
      initialized: true,
      loading: false,
      languagePair,
      manifest,
    }));

    console.log(`AssetService: Loaded ${languagePair} manifest`, {
      audioFiles: manifest.stats.totalAudioFiles,
      references: manifest.stats.totalAudioReferences,
      savings: manifest.stats.deduplicationSavings,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('AssetService: Failed to initialize', error);

    state.update(s => ({
      ...s,
      loading: false,
      error: message,
      initialized: true, // Still mark as initialized to allow fallback
      languagePair, // IMPORTANT: Update language pair even on failure for correct local fallback paths
      manifest: null, // Clear manifest to force local path fallback
    }));
  }
}

/**
 * Get audio URL for a lesson step
 * Returns CDN URL if available, otherwise returns local path
 * Local paths include language pair for multi-language support
 */
export function getAudioUrl(lessonId: string, audioId: string): string {
  const currentState = get(state);
  const langPair = currentState.languagePair || 'de-fa';

  // If CDN not configured or manifest not loaded, use local path with language pair
  if (!CDN_BASE || !currentState.manifest) {
    return `/audio/${langPair}/${lessonId}/${audioId}.mp3`;
  }

  const key = `${lessonId}/${audioId}`;
  const hash = currentState.manifest.audioMap[key];

  if (!hash) {
    // Audio not in manifest, fall back to local with language pair
    console.warn(`AssetService: Audio not found in manifest: ${key}`);
    return `/audio/${langPair}/${lessonId}/${audioId}.mp3`;
  }

  return `${CDN_BASE}/${currentState.languagePair}/audio/by-hash/${hash}.mp3`;
}

/**
 * Get image URL by asset ID
 * Images are shared across all languages (loaded from shared/ folder)
 */
export function getImageUrl(imageId: string): string {
  // Try shared manifest first (CDN path)
  if (CDN_BASE && sharedManifest) {
    const path = sharedManifest.images[imageId];
    if (path) {
      return `${CDN_BASE}/shared${path}`;
    }
  }

  // Local fallback
  // Note: asset-resolver.ts handles full path lookup via asset-registry
  // This is a last-resort fallback for unknown imageIds
  return `/images/greetings/${imageId}.png`;
}

/**
 * Get all audio hashes for a lesson (for preloading)
 */
export function getLessonAudioHashes(lessonId: string): string[] {
  const currentState = get(state);

  if (!currentState.manifest) return [];

  const hashes = new Set<string>();
  const prefix = `${lessonId}/`;

  for (const [key, hash] of Object.entries(currentState.manifest.audioMap)) {
    if (key.startsWith(prefix)) {
      hashes.add(hash);
    }
  }

  return [...hashes];
}

/**
 * Preload audio for a lesson
 * Fetches all unique audio files to populate browser cache
 */
export async function preloadLesson(lessonId: string): Promise<void> {
  if (!browser || !CDN_BASE) return;

  const currentState = get(state);
  if (!currentState.manifest) return;

  const hashes = getLessonAudioHashes(lessonId);

  console.log(`AssetService: Preloading ${hashes.length} audio files for ${lessonId}`);

  const preloads = hashes.map(hash => {
    const url = `${CDN_BASE}/${currentState.languagePair}/audio/by-hash/${hash}.mp3`;
    return fetch(url).then(r => r.blob()).catch(() => null);
  });

  await Promise.all(preloads);
}

/**
 * Get manifest stats
 */
export function getStats(): Manifest['stats'] | null {
  return get(state).manifest?.stats || null;
}

/**
 * Get current state (for debugging)
 */
export function getState(): AssetServiceState {
  return get(state);
}

/**
 * Subscribe to state changes
 */
export const subscribe = state.subscribe;

// Export state store for Svelte components
export { state as assetServiceState };
