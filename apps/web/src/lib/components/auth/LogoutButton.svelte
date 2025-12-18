<!-- src/lib/components/auth/LogoutButton.svelte -->
<script lang="ts">
  import { supabase } from '$lib/supabase/client';

  async function handleSignOut() {
    await supabase.auth.signOut();
    // Force full page reload to clear server-side session
    window.location.href = '/login';
  }
</script>

<button on:click={handleSignOut} class="logout-btn">
  خروج
</button>

<style>
  .logout-btn {
    padding: 0.4rem 0.9rem;
    border-radius: 999px;
    border: none;
    cursor: pointer;
    font-size: 0.9rem;
  }
</style>