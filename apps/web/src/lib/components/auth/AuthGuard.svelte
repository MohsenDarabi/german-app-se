<script lang="ts">
  import { onMount } from 'svelte';
  import { goto, beforeNavigate } from '$app/navigation';
  import { page } from '$app/stores';
  import { auth, isAuthenticated, isLoading } from '$lib/stores/auth';

  // Public routes that don't require authentication
  const PUBLIC_ROUTES = ['/login', '/auth', '/auth/callback'];

  // Check if current path is public
  function isPublicRoute(path: string): boolean {
    return PUBLIC_ROUTES.some(route => path === route || path.startsWith(route + '/'));
  }

  // Block navigation to protected routes when not authenticated
  beforeNavigate(({ to, cancel }) => {
    if (!to) return;

    const targetPath = to.url.pathname;
    const state = auth.getState();

    // If auth not initialized yet, let it proceed (AuthGuard will handle after init)
    if (!state.isInitialized) return;

    // Block navigation to protected routes when not authenticated
    if (!state.user && !isPublicRoute(targetPath)) {
      cancel();
      goto('/login', { replaceState: true });
      return;
    }

    // Block navigation to login when already authenticated
    if (state.user && targetPath === '/login') {
      cancel();
      goto('/', { replaceState: true });
      return;
    }
  });

  // Reactive: redirect when auth state changes
  $: {
    if ($auth.isInitialized && !$auth.isLoading) {
      const currentPath = $page.url.pathname;

      if (!$isAuthenticated && !isPublicRoute(currentPath)) {
        // Not authenticated and on protected route -> redirect to login
        goto('/login', { replaceState: true });
      } else if ($isAuthenticated && currentPath === '/login') {
        // Authenticated and on login page -> redirect to home
        goto('/', { replaceState: true });
      }
    }
  }

  onMount(() => {
    // Initialize auth on mount
    auth.initialize();
  });
</script>

{#if $auth.isLoading || !$auth.isInitialized}
  <!-- Loading state while checking authentication -->
  <div class="auth-loading">
    <div class="auth-loading-content">
      <div class="spinner"></div>
      <p>در حال بررسی احراز هویت...</p>
    </div>
  </div>
{:else if $isAuthenticated || isPublicRoute($page.url.pathname)}
  <!-- Render children only if authenticated OR on public route -->
  <slot />
{:else}
  <!-- Fallback loading while redirect happens -->
  <div class="auth-loading">
    <div class="auth-loading-content">
      <div class="spinner"></div>
      <p>در حال انتقال به صفحه ورود...</p>
    </div>
  </div>
{/if}

<style>
  .auth-loading {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #eff6ff 0%, #f8fafc 50%, #f1f5f9 100%);
    z-index: 9999;
  }

  .auth-loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }

  .spinner {
    width: 48px;
    height: 48px;
    border: 4px solid #e2e8f0;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  .auth-loading-content p {
    color: #475569;
    font-size: 1rem;
    font-weight: 500;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
