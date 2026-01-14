<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import NavBar from '$lib/components/layout/NavBar.svelte';
  import AppFooter from '$lib/components/layout/AppFooter.svelte';
  import AuthGuard from '$lib/components/auth/AuthGuard.svelte';
  import { BottomNav } from '@pkg/ui';
  import { auth, currentUser, isAuthenticated } from '$lib/stores/auth';
  import { syncEngine } from '$lib/services/syncEngine';
  import { init as initAssetService } from '$lib/services/assetService';
  import { initDeepLinkHandler } from '$lib/services/deepLinkHandler';
  import { theme } from '$lib/stores/theme';

  // Import design tokens
  import '$lib/styles/tokens.css';

  export let data: { user?: { email: string; name: string } | null } = {};

  // Store unsubscribe function
  let unsubscribeAuth: (() => void) | null = null;

  onMount(() => {
    // Initialize theme system
    theme.init();

    // Initialize deep link handler for OAuth callbacks
    initDeepLinkHandler();

    // Initialize asset service
    try {
      initAssetService('de-fa');
    } catch (e) {
      console.warn('[App] Asset service init failed:', e);
    }

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

  // Get user info for NavBar
  $: userInfo = $currentUser ? {
    email: $currentUser.email ?? '',
    name: $currentUser.user_metadata?.name ?? $currentUser.email ?? ''
  } : null;
</script>

<AuthGuard>
  <div class="app-shell">
    <NavBar user={userInfo} />

    <main class="app-main">
      <slot />
    </main>

    <AppFooter />

    <!-- Mobile Bottom Navigation -->
    <BottomNav />
  </div>
</AuthGuard>

<style>
  /*
   * App Shell - Single scroll point architecture
   * The shell is exactly viewport height with no overflow
   * Only .app-main scrolls (or child components with overflow-y: auto)
   */
  .app-shell {
    height: 100vh;
    height: 100dvh; /* Dynamic viewport height for mobile */
    display: flex;
    flex-direction: column;
    /* Warm cream Persian-inspired background gradient */
    background: radial-gradient(
      circle at top,
      var(--color-primary-50) 0%,
      var(--color-neutral-50) 40%,
      var(--color-neutral-100) 100%
    );
    color: var(--color-neutral-800);
    transition: background var(--transition-slow), color var(--transition-slow);
    /* Prevent ALL overflow - scrolling happens inside app-main */
    overflow: hidden;
    /* Fill entire screen edge-to-edge */
    width: 100%;
    position: relative;
  }

  /* Dark mode background */
  :global([data-theme="dark"]) .app-shell {
    background: radial-gradient(
      circle at top,
      var(--color-neutral-100) 0%,
      var(--color-neutral-50) 100%
    );
  }

  /* Mobile-first: app-main is THE scroll container */
  .app-main {
    flex: 1;
    width: 100%;
    max-width: 100%;
    margin: 0;
    padding: var(--space-2);
    padding-left: calc(var(--space-2) + env(safe-area-inset-left, 0px));
    padding-right: calc(var(--space-2) + env(safe-area-inset-right, 0px));
    padding-bottom: calc(70px + env(safe-area-inset-bottom, 0px));
    box-sizing: border-box;
    /* THIS is the single scroll point for the app */
    overflow-y: auto;
    overflow-x: hidden;
    /* Smooth scrolling for iOS */
    -webkit-overflow-scrolling: touch;
  }

  /* Tablet: slightly more padding, centered */
  @media (min-width: 769px) {
    .app-main {
      max-width: 900px;
      margin: 0 auto;
      padding: var(--space-6) var(--space-4) var(--space-8);
    }
  }

  /* Desktop: wider container */
  @media (min-width: 1024px) {
    .app-main {
      max-width: 1100px;
      padding-inline: var(--space-4);
    }
  }

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
