// src/routes/+layout.ts - Client-side layout loader for Capacitor compatibility
import type { LayoutLoad } from './$types';

// Disable SSR entirely - everything runs client-side
export const ssr = false;

// Don't prerender - use SPA mode
export const prerender = false;

export const load: LayoutLoad = async () => {
  // User auth is handled client-side via Supabase
  // No server-side user data needed
  return {
    user: null
  };
};
