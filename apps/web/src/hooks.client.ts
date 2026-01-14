// apps/web/src/hooks.client.ts
import type { HandleClientError } from '@sveltejs/kit';

if (import.meta.env.PROD && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js');
}

export const handleError: HandleClientError = ({ error, event }) => {
  console.error('Client error:', error);

  return {
    message: 'An error occurred',
    code: (error as Error)?.name || 'UNKNOWN'
  };
};
