/**
 * Theme Store
 *
 * Manages dark/light mode with system preference detection.
 * Persists user preference to localStorage.
 */

import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'app-theme';

/**
 * Get the initial theme from localStorage or default to 'system'
 */
function getInitialTheme(): Theme {
  if (!browser) return 'system';

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }
  return 'system';
}

/**
 * Resolve 'system' theme to actual light/dark based on OS preference
 */
function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === 'system') {
    if (!browser) return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme;
}

/**
 * Apply theme to document
 */
function applyTheme(resolved: ResolvedTheme): void {
  if (!browser) return;

  document.documentElement.setAttribute('data-theme', resolved);

  // Also set class for Tailwind dark mode
  if (resolved === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

/**
 * Create the theme store
 */
function createThemeStore() {
  const { subscribe, set, update } = writable<Theme>(getInitialTheme());

  // Initialize theme on creation
  if (browser) {
    const initial = getInitialTheme();
    applyTheme(resolveTheme(initial));

    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
      // Re-apply if using system theme
      update((current) => {
        if (current === 'system') {
          applyTheme(resolveTheme('system'));
        }
        return current;
      });
    });
  }

  return {
    subscribe,

    /**
     * Set the theme preference
     */
    set: (value: Theme) => {
      if (browser) {
        localStorage.setItem(STORAGE_KEY, value);
        applyTheme(resolveTheme(value));
      }
      set(value);
    },

    /**
     * Toggle between light and dark (ignoring system)
     */
    toggle: () => {
      update((current) => {
        const resolved = resolveTheme(current);
        const next: Theme = resolved === 'light' ? 'dark' : 'light';
        if (browser) {
          localStorage.setItem(STORAGE_KEY, next);
          applyTheme(next);
        }
        return next;
      });
    },

    /**
     * Cycle through: light -> dark -> system
     */
    cycle: () => {
      update((current) => {
        let next: Theme;
        if (current === 'light') next = 'dark';
        else if (current === 'dark') next = 'system';
        else next = 'light';

        if (browser) {
          localStorage.setItem(STORAGE_KEY, next);
          applyTheme(resolveTheme(next));
        }
        return next;
      });
    },

    /**
     * Initialize theme (call on mount)
     */
    init: () => {
      if (browser) {
        const theme = getInitialTheme();
        applyTheme(resolveTheme(theme));
        set(theme);
      }
    },
  };
}

// Export the theme store
export const theme = createThemeStore();

// Derived store for the resolved theme (always 'light' or 'dark')
export const resolvedTheme = derived(theme, ($theme) => resolveTheme($theme));

// Derived store for checking if dark mode is active
export const isDarkMode = derived(resolvedTheme, ($resolved) => $resolved === 'dark');
