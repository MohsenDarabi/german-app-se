<script lang="ts">
  import { onMount } from 'svelte';
  import NavBar from './../lib/components/layout/NavBar.svelte';
  import AppFooter from './../lib/components/layout/AppFooter.svelte';
  import { syncEngine } from '$lib/services/syncEngine';
  import { supabase } from '$lib/supabase/client';

  export let data;

  // Initialize sync engine when app loads
  onMount(async () => {
    // Initial sync on load if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      console.log('[App] User authenticated, initializing sync...');
      await syncEngine.sync();
      syncEngine.startBackgroundSync();
    } else {
      console.log('[App] No authenticated user, sync disabled');
    }

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[App] Auth state changed:', event);

      if (event === 'SIGNED_IN' && session) {
        console.log('[App] User signed in, starting sync...');
        await syncEngine.sync();
        syncEngine.startBackgroundSync();
      } else if (event === 'SIGNED_OUT') {
        console.log('[App] User signed out, stopping sync...');
        syncEngine.stopBackgroundSync();
      }
    });

    // Cleanup on component destroy
    return () => {
      authListener.subscription.unsubscribe();
      syncEngine.stopBackgroundSync();
    };
  });
</script>

<div class="app-shell">
  <NavBar user={data.user} />

  <main class="app-main">
    <slot />
  </main>

  <AppFooter />
</div>

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
</style>
