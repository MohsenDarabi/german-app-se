/**
 * Language Preference Store
 *
 * Manages the user's selected language pair with localStorage persistence
 * and optional Supabase sync for authenticated users.
 */

import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';

// Types
export interface LanguagePack {
  id: string;
  name: {
    source: string;
    target: string;
  };
  flag: string;
  levels: string[];
  available: boolean;
}

export interface LanguagePreferenceState {
  selectedPair: string;
  isOnboarded: boolean;
  loading: boolean;
}

const STORAGE_KEY = 'language-preference';
const ONBOARDING_KEY = 'onboarding-complete';

// Available language packs (single source of truth)
export const LANGUAGE_PACKS: LanguagePack[] = [
  {
    id: 'de-fa',
    name: { source: 'Deutsch', target: 'آلمانی' },
    flag: '🇩🇪',
    levels: ['A1', 'A2', 'B1', 'B2'],
    available: true,
  },
  {
    id: 'en-fa',
    name: { source: 'English', target: 'انگلیسی' },
    flag: '🇬🇧',
    levels: ['A1', 'A2', 'B1', 'B2'],
    available: true,
  },
  {
    id: 'fr-fa',
    name: { source: 'Français', target: 'فرانسوی' },
    flag: '🇫🇷',
    levels: ['A1', 'A2', 'B1', 'B2'],
    available: false,
  },
];

// Get initial state from localStorage
function getInitialState(): LanguagePreferenceState {
  if (!browser) {
    return { selectedPair: 'de-fa', isOnboarded: false, loading: false };
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  const onboarded = localStorage.getItem(ONBOARDING_KEY) === 'true';

  return {
    selectedPair: stored || 'de-fa',
    isOnboarded: onboarded,
    loading: false,
  };
}

// Create the store
function createLanguagePreferenceStore() {
  const { subscribe, set, update } = writable<LanguagePreferenceState>(getInitialState());

  return {
    subscribe,

    /**
     * Set language preference (with persistence)
     */
    setLanguage: (pair: string) => {
      const pack = LANGUAGE_PACKS.find(p => p.id === pair);
      if (!pack?.available) return;

      if (browser) {
        localStorage.setItem(STORAGE_KEY, pair);
      }

      update(s => ({ ...s, selectedPair: pair }));
    },

    /**
     * Complete onboarding
     */
    completeOnboarding: () => {
      if (browser) {
        localStorage.setItem(ONBOARDING_KEY, 'true');
      }
      update(s => ({ ...s, isOnboarded: true }));
    },

    /**
     * Reset onboarding (for testing)
     */
    resetOnboarding: () => {
      if (browser) {
        localStorage.removeItem(ONBOARDING_KEY);
        localStorage.removeItem(STORAGE_KEY);
      }
      set({ selectedPair: 'de-fa', isOnboarded: false, loading: false });
    },

    /**
     * Get current language pack details
     */
    getCurrentPack: (): LanguagePack | undefined => {
      const state = get({ subscribe });
      return LANGUAGE_PACKS.find(p => p.id === state.selectedPair);
    },

    /**
     * Get state synchronously
     */
    getState: (): LanguagePreferenceState => {
      return get({ subscribe });
    },
  };
}

export const languagePreference = createLanguagePreferenceStore();

// Derived stores for convenience
export const selectedPair = derived(languagePreference, $s => $s.selectedPair);
export const isOnboarded = derived(languagePreference, $s => $s.isOnboarded);
export const currentLanguagePack = derived(
  languagePreference,
  $s => LANGUAGE_PACKS.find(p => p.id === $s.selectedPair)
);
