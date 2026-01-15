// Centralized Auth Store - Industry Standard Pattern
import { writable, derived, get } from 'svelte/store';
import { supabase } from '$lib/supabase/client';
import { db } from '$lib/db';
import type { User, Session } from '@supabase/supabase-js';

const LAST_USER_KEY = 'lastAuthUserId';

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

        // Check if user changed - clear local DB if different user
        if (session?.user) {
          await this.handleUserChange(session.user.id);
        }

        set({
          user: session?.user ?? null,
          session: session,
          isLoading: false,
          isInitialized: true
        });

        // Listen for auth changes
        supabase.auth.onAuthStateChange(async (_event, session) => {
          // Check for user change on auth state change
          if (session?.user) {
            await this.handleUserChange(session.user.id);
          }

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

    // Handle user change - clear local DB if different user logs in
    async handleUserChange(newUserId: string) {
      if (typeof window === 'undefined') return;

      const lastUserId = localStorage.getItem(LAST_USER_KEY);

      if (lastUserId && lastUserId !== newUserId) {
        console.log('[Auth] User changed, clearing local database...');
        try {
          // Clear all user-specific data from IndexedDB
          await db.lessonProgress.clear();
          await db.vocab.clear();
          await db.wrongAnswers.clear();
          await db.users.clear();
          // Clear sync timestamp so fresh data is pulled
          localStorage.removeItem('lastSyncTimestamp');
          console.log('[Auth] Local database cleared for new user');
        } catch (e) {
          console.error('[Auth] Error clearing local database:', e);
        }
      }

      // Store current user ID
      localStorage.setItem(LAST_USER_KEY, newUserId);
    },

    // Sign out
    async signOut() {
      update(state => ({ ...state, isLoading: true }));
      await supabase.auth.signOut();
      // Clear local DB on sign out to prevent data leakage
      try {
        await db.lessonProgress.clear();
        await db.vocab.clear();
        await db.wrongAnswers.clear();
        await db.users.clear();
        localStorage.removeItem('lastSyncTimestamp');
        localStorage.removeItem(LAST_USER_KEY);
      } catch (e) {
        console.error('[Auth] Error clearing local database on sign out:', e);
      }
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
