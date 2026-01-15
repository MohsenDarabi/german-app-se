import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Custom storage adapter that uses localStorage (works better in Capacitor WebView)
const localStorageAdapter = {
  getItem: (key: string): string | null => {
    if (!isBrowser) return null;
    return localStorage.getItem(key);
  },
  setItem: (key: string, value: string): void => {
    if (!isBrowser) return;
    localStorage.setItem(key, value);
  },
  removeItem: (key: string): void => {
    if (!isBrowser) return;
    localStorage.removeItem(key);
  }
};

// Create Supabase client with localStorage storage
// This works reliably in both web browsers and Capacitor WebView
export const supabase = createClient(
  PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      storage: localStorageAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);
