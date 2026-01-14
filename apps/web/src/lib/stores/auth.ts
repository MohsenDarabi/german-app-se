// Centralized Auth Store - Industry Standard Pattern
import { writable, derived, get } from 'svelte/store';
import { supabase } from '$lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;
}

const initialState: AuthState = {
  user: null,
  session: null,
  isLoading: true,
  isInitialized: false
};

// Create the auth store
function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>(initialState);

  return {
    subscribe,

    // Initialize auth - call once on app start
    async initialize() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('[Auth] Session error:', error);
          set({ user: null, session: null, isLoading: false, isInitialized: true });
          return;
        }

        set({
          user: session?.user ?? null,
          session: session,
          isLoading: false,
          isInitialized: true
        });

        // Listen for auth changes
        supabase.auth.onAuthStateChange((_event, session) => {
          update(state => ({
            ...state,
            user: session?.user ?? null,
            session: session
          }));
        });

      } catch (e) {
        console.error('[Auth] Initialize error:', e);
        set({ user: null, session: null, isLoading: false, isInitialized: true });
      }
    },

    // Sign out
    async signOut() {
      update(state => ({ ...state, isLoading: true }));
      await supabase.auth.signOut();
      set({ user: null, session: null, isLoading: false, isInitialized: true });
    },

    // Get current state synchronously
    getState(): AuthState {
      return get({ subscribe });
    }
  };
}

export const auth = createAuthStore();

// Derived stores for convenience
export const isAuthenticated = derived(auth, $auth => !!$auth.user);
export const isLoading = derived(auth, $auth => $auth.isLoading);
export const currentUser = derived(auth, $auth => $auth.user);
