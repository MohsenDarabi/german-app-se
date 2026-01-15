<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { supabase } from '$lib/supabase/client';
  import { page } from '$app/stores';
  import { browser } from '$app/environment';

  let error: string | null = null;
  let message: string | null = null;
  let status: string = 'در حال بررسی...';

  onMount(async () => {
    if (!browser) return;

    try {
      status = 'در حال پردازش توکن...';

      // Get the full URL including hash
      const fullUrl = window.location.href;
      console.log('[Auth Callback] Processing URL:', fullUrl);

      // First, check if there are hash params (OAuth/email confirmation flow)
      if (window.location.hash && window.location.hash.length > 1) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const tokenType = hashParams.get('type');

        console.log('[Auth Callback] Hash params found:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          type: tokenType
        });

        if (accessToken && refreshToken) {
          status = 'در حال تنظیم نشست...';

          const { data, error: setSessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (setSessionError) {
            console.error('[Auth Callback] Error setting session:', setSessionError);
            error = 'خطا در ورود: ' + setSessionError.message;
            setTimeout(() => goto('/login'), 3000);
            return;
          }

          if (data.session) {
            console.log('[Auth Callback] Session created successfully');
            message = tokenType === 'signup'
              ? 'ایمیل شما تأیید شد! در حال انتقال...'
              : 'ورود موفق! در حال انتقال...';

            // Clean up the URL hash
            window.history.replaceState(null, '', window.location.pathname);

            setTimeout(() => {
              window.location.href = '/';
            }, 1000);
            return;
          } else {
            console.log('[Auth Callback] No session in response');
          }
        }
      }

      // Check for PKCE flow tokens in query params
      const tokenHash = $page.url.searchParams.get('token_hash');
      const type = $page.url.searchParams.get('type');

      if (tokenHash && type) {
        status = 'در حال تأیید ایمیل...';
        console.log('[Auth Callback] PKCE token found, verifying...');

        const { data, error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type as 'signup' | 'email' | 'recovery' | 'invite' | 'email_change'
        });

        if (verifyError) {
          console.error('[Auth Callback] OTP verification error:', verifyError);
          error = 'خطا در تأیید ایمیل: ' + verifyError.message;
          setTimeout(() => goto('/login'), 3000);
          return;
        }

        if (data.session) {
          message = 'ایمیل شما تأیید شد! در حال انتقال...';
          setTimeout(() => {
            window.location.href = '/';
          }, 1000);
          return;
        }
      }

      // Fallback: check for existing session
      status = 'در حال بررسی نشست...';
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('[Auth Callback] Session error:', sessionError);
        error = sessionError.message;
        setTimeout(() => goto('/login'), 3000);
        return;
      }

      if (session) {
        console.log('[Auth Callback] Existing session found');
        message = 'ورود موفق! در حال انتقال...';
        setTimeout(() => {
          window.location.href = '/';
        }, 500);
      } else {
        console.log('[Auth Callback] No session found');
        error = 'نشست یافت نشد. لطفاً دوباره وارد شوید.';
        setTimeout(() => goto('/login'), 2000);
      }
    } catch (err: any) {
      console.error('[Auth Callback] Unexpected error:', err);
      error = 'خطای غیرمنتظره: ' + (err.message || 'Unknown error');
      setTimeout(() => goto('/login'), 3000);
    }
  });
</script>

<svelte:head>
  <title>Signing In... - Deutschlern</title>
</svelte:head>

<div class="loading-page" dir="rtl">
  <div class="loading-content">
    {#if error}
      <div class="error-icon">❌</div>
      <h2>خطا در احراز هویت</h2>
      <p class="error-message">{error}</p>
      <p class="redirect-notice">در حال انتقال به صفحه ورود...</p>
    {:else if message}
      <div class="success-icon">✅</div>
      <h2>موفق!</h2>
      <p class="success-message">{message}</p>
    {:else}
      <div class="spinner"></div>
      <h2>در حال ورود...</h2>
      <p>{status}</p>
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
