import { writable } from 'svelte/store';
import { browser } from '$app/environment';

function createDevModeStore() {
  // Initialize from localStorage if available
  const initialValue = browser && localStorage.getItem('devMode') === 'true';
  const { subscribe, set, update } = writable(initialValue);

  return {
    subscribe,
    toggle: () => {
      update(v => {
        const newValue = !v;
        if (browser) {
          localStorage.setItem('devMode', String(newValue));
        }
        return newValue;
      });
    },
    set: (value: boolean) => {
      if (browser) {
        localStorage.setItem('devMode', String(value));
      }
      set(value);
    }
  };
}

export const devMode = createDevModeStore();
