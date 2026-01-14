<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import NavBar from '$lib/components/layout/NavBar.svelte';
  import AppFooter from '$lib/components/layout/AppFooter.svelte';
  import AuthGuard from '$lib/components/auth/AuthGuard.svelte';
  import { auth, currentUser, isAuthenticated } from '$lib/stores/auth';
  import { syncEngine } from '$lib/services/syncEngine';
  import { init as initAssetService } from '$lib/services/assetService';
  import { initDeepLinkHandler } from '$lib/services/deepLinkHandler';

  export let data: { user?: { email: string; name: string } | null } = {};

  // Store unsubscribe function
  let unsubscribeAuth: (() => void) | null = null;

  onMount(() => {
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
  </div>
</AuthGuard>

<style>
  .app-shell {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: radial-gradient(circle at top, #eff6ff 0, #f9fafb 45%, #f1f5f9 100%);
  }

  .app-main {
    flex: 1;
    max-width: 1100px;
    width: 100%;
    margin: 0 auto;
    padding: 1.5rem 1rem 2rem;
  }

  @media (min-width: 1024px) {
    .app-main {
      padding-inline: 0;
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
</style>
