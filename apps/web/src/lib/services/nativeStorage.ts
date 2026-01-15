/**
 * Native Storage Service
 *
 * Cross-platform storage abstraction for offline audio files.
 * - Web: Uses Cache API (via service worker)
 * - Native (Capacitor): Uses Filesystem plugin
 */

import { browser } from '$app/environment';
import { getCdnBase, getState } from './assetService';

// Check if running in Capacitor
let isNative = false;
let Filesystem: typeof import('@capacitor/filesystem').Filesystem | null = null;
let Directory: typeof import('@capacitor/filesystem').Directory | null = null;

// Initialize Capacitor plugins if available
async function initCapacitor() {
  if (!browser) return;

  try {
    const capacitor = await import('@capacitor/core');
    isNative = capacitor.Capacitor.isNativePlatform();

    if (isNative) {
      const fs = await import('@capacitor/filesystem');
      Filesystem = fs.Filesystem;
      Directory = fs.Directory;
    }
  } catch {
    // Capacitor not available (web-only build)
    isNative = false;
  }
}

// Initialize on module load
const initPromise = initCapacitor();

/**
 * Storage service for audio files
 */
class NativeStorageService {
  private cdnBase: string = '';

  constructor() {
    if (browser) {
      this.cdnBase = getCdnBase();
    }
  }

  /**
   * Check if running on native platform
   */
  async isNativePlatform(): Promise<boolean> {
    await initPromise;
    return isNative;
  }

  /**
   * Save audio file by content hash
   */
  async saveAudioByHash(languagePair: string, hash: string, data: Blob): Promise<void> {
    await initPromise;

    if (isNative && Filesystem && Directory) {
      // Native: Save to filesystem
      const fileName = `${hash}.mp3`;
      const dirPath = `audio/${languagePair}`;

      // Ensure directory exists
      try {
        await Filesystem.mkdir({
          path: dirPath,
          directory: Directory.Data,
          recursive: true,
        });
      } catch {
        // Directory might already exist
      }

      // Convert Blob to base64
      const base64 = await this.blobToBase64(data);

      await Filesystem.writeFile({
        path: `${dirPath}/${fileName}`,
        data: base64,
        directory: Directory.Data,
      });
    } else {
      // Web: Use Cache API via service worker
      const url = `${this.cdnBase}/${languagePair}/audio/by-hash/${hash}.mp3`;
      const cache = await caches.open('cdn-assets-v1');
      const response = new Response(data, {
        headers: { 'Content-Type': 'audio/mpeg' },
      });
      await cache.put(url, response);
    }
  }

  /**
   * Get audio file by content hash
   */
  async getAudioByHash(languagePair: string, hash: string): Promise<Blob | null> {
    await initPromise;

    if (isNative && Filesystem && Directory) {
      // Native: Read from filesystem
      const fileName = `${hash}.mp3`;
      const dirPath = `audio/${languagePair}`;

      try {
        const result = await Filesystem.readFile({
          path: `${dirPath}/${fileName}`,
          directory: Directory.Data,
        });

        // Convert base64 to Blob
        return this.base64ToBlob(result.data as string, 'audio/mpeg');
      } catch {
        return null;
      }
    } else {
      // Web: Check Cache API
      const url = `${this.cdnBase}/${languagePair}/audio/by-hash/${hash}.mp3`;
      const cache = await caches.open('cdn-assets-v1');
      const response = await cache.match(url);

      if (response) {
        return await response.blob();
      }
      return null;
    }
  }

  /**
   * Check if audio file exists locally
   */
  async hasAudioByHash(languagePair: string, hash: string): Promise<boolean> {
    await initPromise;

    if (isNative && Filesystem && Directory) {
      const fileName = `${hash}.mp3`;
      const dirPath = `audio/${languagePair}`;

      try {
        await Filesystem.stat({
          path: `${dirPath}/${fileName}`,
          directory: Directory.Data,
        });
        return true;
      } catch {
        return false;
      }
    } else {
      const url = `${this.cdnBase}/${languagePair}/audio/by-hash/${hash}.mp3`;
      const cache = await caches.open('cdn-assets-v1');
      const response = await cache.match(url);
      return !!response;
    }
  }

  /**
   * Delete audio files for a lesson
   */
  async deleteLesson(languagePair: string, audioHashes: string[]): Promise<void> {
    await initPromise;

    if (isNative && Filesystem && Directory) {
      const dirPath = `audio/${languagePair}`;

      for (const hash of audioHashes) {
        try {
          await Filesystem.deleteFile({
            path: `${dirPath}/${hash}.mp3`,
            directory: Directory.Data,
          });
        } catch {
          // File might not exist
        }
      }
    } else {
      const cache = await caches.open('cdn-assets-v1');

      for (const hash of audioHashes) {
        const url = `${this.cdnBase}/${languagePair}/audio/by-hash/${hash}.mp3`;
        await cache.delete(url);
      }
    }
  }

  /**
   * Get total storage used
   */
  async getStorageUsed(): Promise<number> {
    await initPromise;

    if (isNative && Filesystem && Directory) {
      // Native: Sum up all audio file sizes
      try {
        const state = getState();
        const languagePair = state.languagePair;
        const dirPath = `audio/${languagePair}`;

        const contents = await Filesystem.readdir({
          path: dirPath,
          directory: Directory.Data,
        });

        let totalSize = 0;
        for (const file of contents.files) {
          if (file.size) {
            totalSize += file.size;
          }
        }
        return totalSize;
      } catch {
        return 0;
      }
    } else {
      // Web: Calculate cache size
      const cache = await caches.open('cdn-assets-v1');
      const keys = await cache.keys();
      let totalSize = 0;

      for (const request of keys) {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      }

      return totalSize;
    }
  }

  /**
   * Get set of downloaded hashes for a language pair
   */
  async getDownloadedHashes(languagePair: string): Promise<Set<string>> {
    await initPromise;

    const hashes = new Set<string>();

    if (isNative && Filesystem && Directory) {
      try {
        const dirPath = `audio/${languagePair}`;
        const contents = await Filesystem.readdir({
          path: dirPath,
          directory: Directory.Data,
        });

        for (const file of contents.files) {
          if (file.name.endsWith('.mp3')) {
            hashes.add(file.name.replace('.mp3', ''));
          }
        }
      } catch {
        // Directory might not exist
      }
    } else {
      const cache = await caches.open('cdn-assets-v1');
      const keys = await cache.keys();
      const prefix = `${this.cdnBase}/${languagePair}/audio/by-hash/`;

      for (const request of keys) {
        if (request.url.startsWith(prefix)) {
          const hash = request.url.replace(prefix, '').replace('.mp3', '');
          hashes.add(hash);
        }
      }
    }

    return hashes;
  }

  /**
   * Clear all cached audio for a language pair
   */
  async clearLanguagePair(languagePair: string): Promise<void> {
    await initPromise;

    if (isNative && Filesystem && Directory) {
      try {
        await Filesystem.rmdir({
          path: `audio/${languagePair}`,
          directory: Directory.Data,
          recursive: true,
        });
      } catch {
        // Directory might not exist
      }
    } else {
      const cache = await caches.open('cdn-assets-v1');
      const keys = await cache.keys();
      const prefix = `${this.cdnBase}/${languagePair}/`;

      for (const request of keys) {
        if (request.url.startsWith(prefix)) {
          await cache.delete(request);
        }
      }
    }
  }

  // Helper: Convert Blob to base64
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // Helper: Convert base64 to Blob
  private base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }
}

// Export singleton instance
export const nativeStorage = new NativeStorageService();
