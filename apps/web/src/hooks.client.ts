// apps/web/src/hooks.client.ts

if (import.meta.env.PROD && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js');
}

export {};
