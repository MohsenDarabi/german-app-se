<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase/client';
  import { goto } from '$app/navigation';

  let isLoading = false;
  let error: string | null = null;

  onMount(() => {
    // Check if this is an email confirmation redirect with tokens in hash
    // If so, forward to /auth/callback to handle it properly
    if (window.location.hash && window.location.hash.includes('access_token')) {
      console.log('[Auth] Detected tokens in hash, forwarding to callback...');
      window.location.href = '/auth/callback' + window.location.hash;
    }
  });

  async function signInWithGoogle() {
    try {
      isLoading = true;
      error = null;

      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (signInError) {
        error = signInError.message;
        console.error('Login error:', signInError);
      }
    } catch (err) {
      error = 'Failed to sign in. Please try again.';
      console.error('Unexpected error:', err);
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Sign In - Deutschlern</title>
</svelte:head>

<div class="auth-page">
  <div class="auth-card">
    <div class="logo">🇩🇪</div>
    <h1>Welcome to Deutschlern</h1>
    <p class="subtitle">Master German with interactive lessons and flashcards</p>

    {#if error}
      <div class="error-message">
        {error}
      </div>
    {/if}

    <button
      class="google-btn"
      on:click={signInWithGoogle}
      disabled={isLoading}
    >
      <span class="google-icon">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      </span>
      {isLoading ? 'Signing in...' : 'Sign in with Google'}
    </button>

    <div class="divider">
      <span>or</span>
    </div>

    <p class="offline-notice">
      Continue without signing in to try the app.<br />
      Your progress will only be saved locally.
    </p>
    <a href="/" class="skip-link">Continue without signing in →</a>
  </div>

  <div class="benefits">
    <h3>Why sign in?</h3>
    <ul>
      <li>
        <span class="benefit-icon">☁️</span>
        <div>
          <strong>Cloud Sync</strong>
          <p>Access your progress from any device</p>
        </div>
      </li>
      <li>
        <span class="benefit-icon">🔄</span>
        <div>
          <strong>Auto Backup</strong>
          <p>Never lose your learning progress</p>
        </div>
      </li>
      <li>
        <span class="benefit-icon">📱</span>
        <div>
          <strong>Multi-Device</strong>
          <p>Switch between phone, tablet, and computer</p>
        </div>
      </li>
    </ul>
  </div>
</div>

<style>
  .auth-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 2rem 1rem;
    gap: 2rem;
  }

  .auth-card {
    background: white;
    padding: 3rem 2rem;
    border-radius: 1.5rem;
    text-align: center;
    max-width: 420px;
    width: 100%;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  }

  .logo {
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
  }

  .error-message {
    background: #fee2e2;
    color: #991b1b;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    margin-bottom: 1rem;
    font-size: 0.875rem;
  }

  .google-btn {
    width: 100%;
    padding: 1rem 1.5rem;
    background: #4285f4;
    color: white;
    border: none;
    border-radius: 0.75rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    transition: all 0.2s;
    box-shadow: 0 4px 12px rgba(66, 133, 244, 0.3);
  }

  .google-btn:hover:not(:disabled) {
    background: #357ae8;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(66, 133, 244, 0.4);
  }

  .google-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .google-icon {
    background: white;
    border-radius: 0.25rem;
    padding: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .divider {
    position: relative;
    text-align: center;
    margin: 2rem 0 1.5rem;
  }

  .divider::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: #e2e8f0;
  }

  .divider span {
    position: relative;
    background: white;
    padding: 0 1rem;
    color: #94a3b8;
    font-size: 0.875rem;
  }

  .offline-notice {
    font-size: 0.875rem;
    color: #64748b;
    line-height: 1.6;
    margin-bottom: 1rem;
  }

  .skip-link {
    display: inline-block;
    color: #3b82f6;
    text-decoration: none;
    font-weight: 600;
    font-size: 0.9rem;
    transition: color 0.2s;
  }

  .skip-link:hover {
    color: #2563eb;
  }

  .benefits {
    background: white;
    padding: 2rem;
    border-radius: 1.5rem;
    max-width: 420px;
    width: 100%;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }

  .benefits h3 {
    text-align: center;
    color: #1e293b;
    margin-bottom: 1.5rem;
    font-size: 1.25rem;
    font-weight: 700;
  }

  .benefits ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .benefits li {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
  }

  .benefit-icon {
    font-size: 1.5rem;
    flex-shrink: 0;
  }

  .benefits strong {
    display: block;
    color: #1e293b;
    margin-bottom: 0.25rem;
    font-size: 0.9rem;
  }

  .benefits p {
    color: #64748b;
    font-size: 0.85rem;
    margin: 0;
  }

  @media (max-width: 600px) {
    .auth-page {
      padding: 1rem;
    }

    .auth-card {
      padding: 2rem 1.5rem;
    }

    .benefits {
      padding: 1.5rem;
    }

    h1 {
      font-size: 1.75rem;
    }
  }
</style>
