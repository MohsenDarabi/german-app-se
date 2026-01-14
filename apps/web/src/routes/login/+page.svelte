<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase/client';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { getOAuthRedirectUrl, initDeepLinkHandler } from '$lib/services/deepLinkHandler';

  let email = '';
  let password = '';
  let error = '';
  let isLoading = false;

  onMount(() => {
    // Initialize deep link handler for OAuth callbacks
    initDeepLinkHandler();

    // Check for error in URL params
    const urlError = $page.url.searchParams.get('error');
    if (urlError) {
      error = urlError === 'auth_failed' ? 'خطا در احراز هویت' : urlError;
    }
  });

  async function handleGoogleSignIn() {
    try {
      isLoading = true;
      error = '';

      const redirectUrl = getOAuthRedirectUrl();
      console.log('[Login] OAuth redirect URL:', redirectUrl);

      // Get the OAuth URL from Supabase
      const { data, error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            prompt: 'select_account'
          },
          skipBrowserRedirect: true // Don't auto-redirect, we'll handle it
        }
      });

      if (signInError) {
        error = signInError.message;
        return;
      }

      if (data?.url) {
        // Open OAuth in external browser (required by Google)
        const { Capacitor } = await import('@capacitor/core');

        if (Capacitor.isNativePlatform()) {
          const { Browser } = await import('@capacitor/browser');
          console.log('[Login] Opening OAuth in external browser:', data.url);
          await Browser.open({ url: data.url });
        } else {
          // Web: redirect normally
          window.location.href = data.url;
        }
      }
    } catch (err: any) {
      error = 'خطا در ورود با گوگل';
      console.error('Google sign-in error:', err);
    } finally {
      isLoading = false;
    }
  }

  async function handleEmailSignIn(event: Event) {
    event.preventDefault();
    try {
      isLoading = true;
      error = '';

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        error = 'ایمیل یا رمز عبور اشتباه است';
      } else {
        goto('/');
      }
    } catch (err: any) {
      error = 'خطا در ورود';
      console.error('Email sign-in error:', err);
    } finally {
      isLoading = false;
    }
  }
</script>

<section class="login-layout">
  <div class="hero">
    <h1>یادگیری آلمانی و انگلیسی از صفر، مخصوص فارسی‌زبان‌ها</h1>
    <p>
      مسیرت را از فارسی شروع کن، واژه‌ها، جملات و دیالوگ‌های روزمره را
      قدم‌به‌قدم یاد بگیر و پیشرفتت را هر روز ببین.
    </p>

    <ul class="features">
      <li>درس‌های کوتاه و قابل فهم</li>
      <li>مثال‌های واقعی از زندگی مهاجرتی</li>
      <li>پیشرفت مرحله‌به‌مرحله و قابل اندازه‌گیری</li>
    </ul>
  </div>

  <div class="card">
    <h2>ورود به حساب کاربری</h2>
    <p class="card-subtitle">برای ادامه یادگیری، وارد حساب خودت شو.</p>

    {#if error}
      <p class="error">{error}</p>
    {/if}

    <button class="google-btn" on:click={handleGoogleSignIn} disabled={isLoading}>
      <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
      {isLoading ? 'در حال ورود...' : 'ورود با گوگل'}
    </button>

    <div class="divider">یا با ایمیل</div>

    <form on:submit={handleEmailSignIn} class="form">
      <label>
        ایمیل
        <input
          name="email"
          type="email"
          bind:value={email}
          placeholder="مثلاً: you@example.com"
          required
          disabled={isLoading}
        />
      </label>

      <label>
        رمز عبور
        <input
          name="password"
          type="password"
          bind:value={password}
          placeholder="•••••••"
          required
          disabled={isLoading}
        />
      </label>

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'در حال ورود...' : 'ورود'}
      </button>

      <p class="hint">
        حساب کاربری ندارید؟ با گوگل وارد شوید تا حساب جدید ساخته شود.
      </p>
    </form>
  </div>
</section>

<style>
  .login-layout {
    display: grid;
    grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
    gap: 2rem;
    align-items: center;
    min-height: calc(100vh - 140px);
  }

  .hero h1 {
    font-size: 1.9rem;
    line-height: 1.3;
    margin-bottom: 0.75rem;
    color: #0f172a;
  }

  .hero p {
    font-size: 0.95rem;
    color: #475569;
    max-width: 30rem;
    margin-bottom: 1rem;
  }

  .features {
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    font-size: 0.9rem;
    color: #334155;
  }

  .features li::before {
    content: '• ';
    color: #1d4ed8;
    font-weight: 700;
  }

  .card {
    background: #ffffff;
    border-radius: 1rem;
    padding: 1.6rem 1.5rem;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.12);
    border: 1px solid rgba(148, 163, 184, 0.25);
  }

  .google-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    background: #fff;
    color: #374151;
    border: 1px solid #e5e7eb;
    padding: 0.6rem;
    border-radius: 999px;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    margin-bottom: 1.25rem;
  }

  .google-btn:hover {
    background: #f9fafb;
    border-color: #d1d5db;
  }

  .divider {
    display: flex;
    align-items: center;
    text-align: center;
    color: #94a3b8;
    font-size: 0.85rem;
    margin-bottom: 1.25rem;
  }

  .divider::before,
  .divider::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid #e2e8f0;
  }

  .divider::before {
    margin-left: 0.75rem;
  }

  .divider::after {
    margin-right: 0.75rem;
  }

  .card h2 {
    font-size: 1.3rem;
    margin-bottom: 0.25rem;
  }

  .card-subtitle {
    font-size: 0.85rem;
    color: #64748b;
    margin-bottom: 1.25rem;
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.9rem;
  }

  input {
    padding: 0.55rem 0.8rem;
    border-radius: 0.7rem;
    border: 1px solid #cbd5e1;
    font-size: 0.9rem;
  }

  p {
    color: #c0e909;
  }

  input:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.3);
  }

  button {
    margin-top: 0.5rem;
    padding: 0.6rem 1rem;
    border-radius: 999px;
    border: none;
    cursor: pointer;
    background: linear-gradient(90deg, #1d4ed8, #3b82f6);
    color: #fff;
    font-weight: 500;
    font-size: 0.95rem;
  }

  button:hover {
    filter: brightness(1.05);
  }

  .error {
    background: #fee2e2;
    color: #991b1b;
    border-radius: 0.6rem;
    padding: 0.4rem 0.6rem;
    font-size: 0.8rem;
    margin-bottom: 0.4rem;
  }

  .hint {
    font-size: 0.8rem;
    color: #64748b;
    margin-top: 0.5rem;
  }

  code {
    background: #e0f2fe;
    padding: 0.1rem 0.35rem;
    border-radius: 0.35rem;
  }

  @media (max-width: 900px) {
    .login-layout {
      grid-template-columns: minmax(0, 1fr);
      text-align: right;
    }

    .hero {
      order: -1;
    }
  }

  @media (max-width: 640px) {
    .card {
      padding: 1.3rem 1.1rem;
    }

    .hero h1 {
      font-size: 1.4rem;
    }
  }
</style>