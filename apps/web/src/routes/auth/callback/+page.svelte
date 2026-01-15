<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { supabase } from '$lib/supabase/client';
  import { page } from '$app/stores';

  let error: string | null = null;
  let message: string | null = null;

  onMount(async () => {
    try {
      // Check for email confirmation tokens in URL (query params)
      const token = $page.url.searchParams.get('token');
      const type = $page.url.searchParams.get('type');
      const tokenHash = $page.url.searchParams.get('token_hash');

      // Handle email confirmation (Supabase PKCE flow)
      if (tokenHash && type) {
        console.log('[Auth Callback] Email confirmation detected, type:', type);

        const { data, error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type as 'signup' | 'email' | 'recovery' | 'invite' | 'email_change'
        });

        if (verifyError) {
          console.error('[Auth Callback] Email verification error:', verifyError);
          error = 'خطا در تأیید ایمیل: ' + verifyError.message;
          setTimeout(() => goto('/login'), 3000);
          return;
        }

        if (data.session) {
          console.log('[Auth Callback] Email verified, session created');
          message = 'ایمیل شما تأیید شد! در حال انتقال...';
          setTimeout(() => {
            window.location.href = '/';
          }, 1500);
          return;
        }
      }

      // Check if there's a hash fragment with OAuth tokens
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');

      if (accessToken && refreshToken) {
        console.log('[Auth Callback] OAuth tokens found in URL, setting session...');

        // Explicitly set the session from the OAuth tokens
        const { data, error: setSessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (setSessionError) {
          console.error('[Auth Callback] Error setting session:', setSessionError);
          error = setSessionError.message;
          setTimeout(() => goto('/login'), 3000);
          return;
        }

        if (data.session) {
          console.log('[Auth Callback] Session set successfully, redirecting to dashboard...');
          // Clean up the URL hash
          window.location.hash = '';
          // Use window.location instead of goto to ensure cookies are sent
          window.location.href = '/';
          return;
        }
      }

      // Fallback: try to get existing session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('[Auth Callback] Auth callback error:', sessionError);
        error = sessionError.message;
        setTimeout(() => goto('/login'), 3000);
        return;
      }

      if (session) {
        console.log('[Auth Callback] Login successful, redirecting to dashboard...');
        window.location.href = '/';
      } else {
        console.log('[Auth Callback] No session found, redirecting to login...');
        goto('/login');
      }
    } catch (err) {
      console.error('[Auth Callback] Unexpected error during auth callback:', err);
      error = 'An unexpected error occurred';
      setTimeout(() => goto('/login'), 3000);
    }
  });
</script>

<svelte:head>
  <title>Signing In... - Deutschlern</title>
</svelte:head>

<div class="loading-page">
  <div class="loading-content">
    {#if error}
      <div class="error-icon">❌</div>
      <h2>Authentication Failed</h2>
      <p class="error-message">{error}</p>
      <p class="redirect-notice">Redirecting to sign in page...</p>
    {:else if message}
      <div class="success-icon">✅</div>
      <h2>ایمیل تأیید شد!</h2>
      <p class="success-message">{message}</p>
    {:else}
      <div class="spinner"></div>
      <h2>Signing you in...</h2>
      <p>Please wait while we complete your authentication</p>
    {/if}
  </div>
</div>

<style>
  .loading-page {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .loading-content {
    text-align: center;
    background: white;
    padding: 3rem 2rem;
    border-radius: 1.5rem;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    max-width: 400px;
  }

  .spinner {
    width: 60px;
    height: 60px;
    border: 4px solid #e2e8f0;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1.5rem;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .error-icon,
  .success-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .success-message {
    color: #059669;
    font-weight: 500;
  }

  h2 {
    font-size: 1.5rem;
    color: #1e293b;
    margin-bottom: 0.75rem;
    font-weight: 700;
  }

  p {
    color: #64748b;
    font-size: 0.95rem;
    margin: 0;
  }

  .error-message {
    color: #dc2626;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  .redirect-notice {
    color: #94a3b8;
    font-size: 0.875rem;
    margin-top: 1rem;
  }
</style>
