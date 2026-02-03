// apps/web/src/hooks.client.ts
import type { HandleClientError } from '@sveltejs/kit';

if (import.meta.env.PROD && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js');
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handleError: HandleClientError = ({ error, event }) => {
  const err = error as Error;
  console.error('Client error details:', {
    name: err?.name,
    message: err?.message,
    stack: err?.stack,
    error: err
  });

  return {
    message: err?.message || 'An error occurred',
    code: err?.name || 'UNKNOWN'
  };
};
