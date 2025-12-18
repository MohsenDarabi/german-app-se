<script lang="ts">
  import { db } from '$lib/db';
  import { syncEngine } from '$lib/services/syncEngine';
  import { supabase } from '$lib/supabase/client';
  import { goto } from '$app/navigation';

  let migrating = false;
  let error: string | null = null;
  let hasLocalData = false;

  // Check if user has local data
  import { onMount } from 'svelte';
  onMount(async () => {
    const vocabCount = await db.vocab.count();
    const progressCount = await db.lessonProgress.count();
    hasLocalData = vocabCount > 0 || progressCount > 0;
  });

  async function migrateData() {
    migrating = true;
    error = null;

    try {
      // Check if user is signed in
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Redirect to auth page
        goto('/auth');
        return;
      }

      // Perform full sync - pushes all local data to cloud
      await syncEngine.sync();

      // Success
      alert('✅ Migration complete! Your data is now synced to the cloud.');
      goto('/');
    } catch (err: any) {
      console.error('Migration error:', err);
      error = err.message || 'Migration failed. Please try again.';
    } finally {
      migrating = false;
    }
  }
</script>

<svelte:head>
  <title>Migrate Your Data - Deutschlern</title>
</svelte:head>

<div class="migrate-page">
  <div class="migrate-card">
    <div class="icon">☁️</div>
    <h1>Migrate Your Data</h1>
    <p class="subtitle">
      We've added cloud sync! Your progress is currently stored locally on this device.
    </p>

    {#if hasLocalData}
      <div class="info-box">
        <h3>What will happen:</h3>
        <ul>
          <li>✅ Your vocabulary and lesson progress will be saved to the cloud</li>
          <li>🔄 Your data will sync across all your devices</li>
          <li>💾 Your local data will be preserved as a backup</li>
          <li>🔒 Only you can access your data (secured by Google login)</li>
        </ul>
      </div>
    {:else}
      <div class="empty-notice">
        <p>No local data found. You can still sign in to start using cloud sync for future progress.</p>
      </div>
    {/if}

    {#if error}
      <div class="error-message">
        {error}
      </div>
    {/if}

    <button
      class="migrate-btn"
      on:click={migrateData}
      disabled={migrating}
    >
      {migrating ? 'Migrating...' : hasLocalData ? 'Sign In & Migrate Data' : 'Sign In to Continue'}
    </button>

    <a href="/" class="skip-link">Skip for now</a>

    <div class="note">
      <strong>Note:</strong> If you skip this step, your progress will remain local only.
      You can always migrate later by signing in.
    </div>
  </div>
</div>

<style>
  .migrate-page {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 2rem 1rem;
  }

  .migrate-card {
    background: white;
    padding: 3rem 2rem;
    border-radius: 1.5rem;
    text-align: center;
    max-width: 550px;
    width: 100%;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  }

  .icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  h1 {
    font-size: 2rem;
    margin-bottom: 0.5rem;
    color: #1e293b;
    font-weight: 800;
  }

  .subtitle {
    color: #64748b;
    margin-bottom: 2rem;
    font-size: 1rem;
    line-height: 1.6;
  }

  .info-box {
    background: #f8fafc;
    border: 2px solid #e2e8f0;
    border-radius: 1rem;
    padding: 1.5rem;
    margin-bottom: 2rem;
    text-align: left;
  }

  .info-box h3 {
    color: #1e293b;
    font-size: 1rem;
    font-weight: 700;
    margin-bottom: 1rem;
  }

  .info-box ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .info-box li {
    color: #475569;
    font-size: 0.9rem;
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .empty-notice {
    background: #fef3c7;
    border: 2px solid #fbbf24;
    border-radius: 1rem;
    padding: 1.5rem;
    margin-bottom: 2rem;
  }

  .empty-notice p {
    color: #92400e;
    margin: 0;
    font-size: 0.9rem;
  }

  .error-message {
    background: #fee2e2;
    color: #991b1b;
    padding: 1rem;
    border-radius: 0.75rem;
    margin-bottom: 1.5rem;
    font-size: 0.875rem;
  }

  .migrate-btn {
    width: 100%;
    padding: 1rem 1.5rem;
    background: linear-gradient(135deg, #3b82f6 0%, #22c55e 100%);
    color: white;
    border: none;
    border-radius: 0.75rem;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    margin-bottom: 1rem;
  }

  .migrate-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
  }

  .migrate-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .skip-link {
    display: inline-block;
    color: #3b82f6;
    text-decoration: none;
    font-weight: 600;
    font-size: 0.9rem;
    transition: color 0.2s;
    margin-bottom: 2rem;
  }

  .skip-link:hover {
    color: #2563eb;
  }

  .note {
    background: #f1f5f9;
    border-radius: 0.5rem;
    padding: 1rem;
    font-size: 0.85rem;
    color: #475569;
    text-align: left;
    margin-top: 1.5rem;
  }

  .note strong {
    color: #1e293b;
  }

  @media (max-width: 600px) {
    .migrate-card {
      padding: 2rem 1.5rem;
    }

    h1 {
      font-size: 1.75rem;
    }
  }
</style>
