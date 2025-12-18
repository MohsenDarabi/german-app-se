/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

import { build, files, version } from '$service-worker';

const CACHE = `deutschlern-cache-${version}`;

// چیزهایی که می‌خوایم از قبل کش کنیم:
// - build: خروجی‌های باندل شده SvelteKit
// - files: فایل‌های داخل /static
const PRECACHE_URLS = [...build, ...files];

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
          key === CACHE ? Promise.resolve() : caches.delete(key)
        )
      );

      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event: FetchEvent) => {
  const request = event.request;

  // فقط GET
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

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
