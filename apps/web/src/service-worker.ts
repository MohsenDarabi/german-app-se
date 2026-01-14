/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

import { build, files, version } from '$service-worker';

const CACHE = `deutschlern-cache-${version}`;
const CDN_CACHE = 'cdn-assets-v1';

// CDN base URL (matches PUBLIC_R2_URL in .env)
const CDN_HOSTS = ['pub-a0290b06f1ea45d5b65ac647cc69df34.r2.dev'];

// چیزهایی که می‌خوایم از قبل کش کنیم:
// - build: خروجی‌های باندل شده SvelteKit
// - files: فایل‌های داخل /static
const PRECACHE_URLS = [...build, ...files];

// Premium status (communicated from main thread)
let isPremium = false;

self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await cache.addAll(PRECACHE_URLS);

      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) =>
          // Keep CDN cache across versions
          key === CACHE || key === CDN_CACHE ? Promise.resolve() : caches.delete(key)
        )
      );

      await self.clients.claim();
    })()
  );
});

// Handle messages from main thread
self.addEventListener('message', (event: ExtendableMessageEvent) => {
  const { type, data } = event.data || {};
  const port = event.ports?.[0]; // MessageChannel port for response

  switch (type) {
    case 'SET_PREMIUM':
      isPremium = data.value;
      port?.postMessage({ success: true });
      break;

    case 'CACHE_LESSON':
      // Premium feature: explicitly cache all audio for a lesson
      event.waitUntil(
        cacheLessonAssets(data)
          .then(() => port?.postMessage({ success: true }))
          .catch((e) => port?.postMessage({ error: e.message }))
      );
      break;

    case 'DELETE_LESSON':
      // Premium feature: clear cached lesson audio
      event.waitUntil(
        deleteLessonCache(data)
          .then(() => port?.postMessage({ success: true }))
          .catch((e) => port?.postMessage({ error: e.message }))
      );
      break;

    case 'GET_CACHE_SIZE':
      // Report CDN cache size
      event.waitUntil(getCacheSize().then(size => {
        event.source?.postMessage({ type: 'CACHE_SIZE', size });
      }));
      break;
  }
});

// Premium: Cache all audio for a lesson (for offline use)
async function cacheLessonAssets(data: { languagePair: string; audioHashes: string[] }) {
  const cache = await caches.open(CDN_CACHE);
  const cdnBase = `https://${CDN_HOSTS[0]}`;

  for (const hash of data.audioHashes) {
    const url = `${cdnBase}/${data.languagePair}/audio/by-hash/${hash}.mp3`;
    try {
      const response = await fetch(url);
      if (response.ok) {
        await cache.put(url, response);
      }
    } catch (e) {
      console.warn(`Failed to cache audio: ${hash}`, e);
    }
  }
}

// Premium: Delete cached lesson audio
async function deleteLessonCache(data: { languagePair: string; audioHashes: string[] }) {
  const cache = await caches.open(CDN_CACHE);
  const cdnBase = `https://${CDN_HOSTS[0]}`;

  for (const hash of data.audioHashes) {
    const url = `${cdnBase}/${data.languagePair}/audio/by-hash/${hash}.mp3`;
    await cache.delete(url);
  }
}

// Get total size of CDN cache
async function getCacheSize(): Promise<number> {
  const cache = await caches.open(CDN_CACHE);
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

self.addEventListener('fetch', (event: FetchEvent) => {
  const request = event.request;

  // فقط GET
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Check if this is a CDN request
  const isCdnRequest = CDN_HOSTS.includes(url.host);

  // Handle CDN requests (audio/images from R2)
  if (isCdnRequest) {
    // ⭐ Cache-first for ALL users (reduces R2 reads by 83%)
    // First fetch: get from R2, store in cache
    // Subsequent fetches: serve from cache (no R2 hit)
    event.respondWith(cdnCacheFirst(request));
    return;
  }

  const sameOrigin = url.origin === self.location.origin;
  if (!sameOrigin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          return await fetch(request);
        } catch {
          const cache = await caches.open(CACHE);
          return (await cache.match('/')) ?? Response.error();
        }
      })()
    );
    return;
  }


  // 2) Assets (js/css/fonts) → cache-first
  const isAsset =
    url.pathname.startsWith('/_app/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.ttf');

  if (isAsset) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // 3) Images / Audio → cache-first (برای اپ آموزشی خیلی مهمه)
  const isMedia =
    request.destination === 'image' ||
    request.destination === 'audio' ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.mp3') ||
    url.pathname.endsWith('.m4a') ||
    url.pathname.endsWith('.ogg');

  if (isMedia) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // 4) API/JSON → network-first (اگر قطع بود از کش)
  const wantsJson =
    request.headers.get('accept')?.includes('application/json') ||
    url.pathname.startsWith('/api/') ||
    url.pathname.endsWith('.json');

  if (wantsJson) {
    event.respondWith(networkFirst(request));
    return;
  }

  // پیش‌فرض: شبکه با fallback به کش
  event.respondWith(networkFirst(request));
});

async function cacheFirst(request: Request): Promise<Response> {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  const fresh = await fetch(request);
  if (fresh.ok) cache.put(request, fresh.clone());
  return fresh;
}

async function networkFirst(request: Request): Promise<Response> {
  const cache = await caches.open(CACHE);
  try {
    const fresh = await fetch(request);
    if (fresh.ok) cache.put(request, fresh.clone());
    return fresh;
  } catch {
    const cached = await cache.match(request);
    return cached ?? Response.error();
  }
}

/**
 * Cache-first strategy for CDN assets (audio, images)
 * Uses separate CDN cache that persists across app versions
 */
async function cdnCacheFirst(request: Request): Promise<Response> {
  const cache = await caches.open(CDN_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const fresh = await fetch(request);
    if (fresh.ok) {
      // Clone response before caching (response can only be read once)
      cache.put(request, fresh.clone());
    }
    return fresh;
  } catch (e) {
    // Return error response if fetch fails and nothing in cache
    console.warn('CDN fetch failed:', request.url, e);
    return Response.error();
  }
}
