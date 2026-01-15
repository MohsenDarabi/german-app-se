<script lang="ts">
  import NavBar from '$lib/components/layout/NavBar.svelte';
  import AppFooter from '$lib/components/layout/AppFooter.svelte';
  import { BottomNav } from '@pkg/ui';
  import { currentUser } from '$lib/stores/auth';

  // Get user info for NavBar
  $: userInfo = $currentUser ? {
    email: $currentUser.email ?? '',
    name: $currentUser.user_metadata?.name ?? $currentUser.email ?? ''
  } : null;
</script>

<div class="app-shell">
  <NavBar user={userInfo} />

  <main class="app-main">
    <slot />
  </main>

  <AppFooter />

  <!-- Mobile Bottom Navigation -->
  <BottomNav />
</div>

<style>
  /*
   * App Shell with Navigation
   * Single scroll point architecture for standard app pages
   */
  .app-shell {
    height: 100vh;
    height: 100dvh;
    display: flex;
    flex-direction: column;
    background: radial-gradient(
      circle at top,
      var(--color-primary-50) 0%,
      var(--color-neutral-50) 40%,
      var(--color-neutral-100) 100%
    );
    color: var(--color-neutral-800);
    overflow: hidden;
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
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
  }

  /* Tablet: centered layout */
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
</style>
