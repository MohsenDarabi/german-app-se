<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import AuthGuard from '$lib/components/auth/AuthGuard.svelte';
  import { auth } from '$lib/stores/auth';
  import { syncEngine } from '$lib/services/syncEngine';
  // Asset service is initialized by lesson pages with the correct language pair
// import { init as initAssetService } from '$lib/services/assetService';
  import { initDeepLinkHandler } from '$lib/services/deepLinkHandler';
  import { theme } from '$lib/stores/theme';
  // languagePreference no longer needed here - lesson pages handle asset service init

  // Import design tokens
  import '$lib/styles/tokens.css';

  // Store unsubscribe function
  let unsubscribeAuth: (() => void) | null = null;

  onMount(() => {
    // Initialize theme system
    theme.init();

    // Initialize deep link handler for OAuth callbacks
    initDeepLinkHandler();

    // Asset service is now initialized by lesson pages with the lesson's language pair
    // This ensures audio matches the lesson content, not the user's preference

    // Subscribe to auth changes for sync engine
    unsubscribeAuth = auth.subscribe(async (state) => {
      if (state.isInitialized && !state.isLoading) {
        if (state.user) {
          try {
            await syncEngine.sync();
            syncEngine.startBackgroundSync();
          } catch (e) {
            console.warn('[App] Sync failed:', e);
          }
        } else {
          syncEngine.stopBackgroundSync();
        }
      }
    });
  });

  onDestroy(() => {
    unsubscribeAuth?.();
    syncEngine.stopBackgroundSync();
  });
</script>

<AuthGuard>
  <slot />
</AuthGuard>

<style>
  /*
   * Root Layout - Global styles only
   * Navigation is handled by layout groups: (app) and (lesson)
   */

  /* Global BiDi (Bidirectional Text) Styles */
  :global(.bidi-rtl) {
    direction: rtl;
    unicode-bidi: isolate;
    text-align: right;
  }

  :global(.bidi-ltr) {
    direction: ltr;
    unicode-bidi: isolate;
    display: inline;
  }

  :global(.bidi-mixed) {
    unicode-bidi: plaintext;
  }

  /* Global transitions for theme switching */
  :global(*) {
    transition-property: background-color, border-color, color;
    transition-duration: 200ms;
    transition-timing-function: ease;
  }

  /* Disable transitions on page load to prevent flash */
  :global(.no-transitions *) {
    transition: none !important;
  }
</style>
