<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase/client';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { getOAuthRedirectUrl, initDeepLinkHandler } from '$lib/services/deepLinkHandler';
  import { Button } from '@pkg/ui';

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

<section class="login-layout" dir="rtl">
  <!-- Hero Section -->
  <div class="hero">
    <div class="hero-badge">
      <span class="badge-icon">🇩🇪</span>
      <span class="badge-text">Deutschlern</span>
    </div>

    <h1 class="hero-title">
      یادگیری آلمانی و انگلیسی از صفر،
      <span class="highlight">مخصوص فارسی‌زبان‌ها</span>
    </h1>

    <p class="hero-description">
      مسیرت را از فارسی شروع کن، واژه‌ها، جملات و دیالوگ‌های روزمره را
      قدم‌به‌قدم یاد بگیر و پیشرفتت را هر روز ببین.
    </p>

    <ul class="features">
      <li>
        <span class="feature-icon">📚</span>
        <span class="feature-text">درس‌های کوتاه و قابل فهم</span>
      </li>
      <li>
        <span class="feature-icon">🌍</span>
        <span class="feature-text">مثال‌های واقعی از زندگی مهاجرتی</span>
      </li>
      <li>
        <span class="feature-icon">📈</span>
        <span class="feature-text">پیشرفت مرحله‌به‌مرحله و قابل اندازه‌گیری</span>
      </li>
    </ul>

    <!-- Decorative Elements -->
    <div class="hero-decoration">
      <div class="deco-circle deco-1"></div>
      <div class="deco-circle deco-2"></div>
      <div class="deco-circle deco-3"></div>
    </div>
  </div>

  <!-- Login Card -->
  <div class="card">
    <div class="card-header">
      <h2>ورود به حساب کاربری</h2>
      <p class="card-subtitle">برای ادامه یادگیری، وارد حساب خودت شو.</p>
    </div>

    {#if error}
      <div class="error-message">
        <span class="error-icon">⚠️</span>
        <span>{error}</span>
      </div>
    {/if}

    <button class="google-btn" on:click={handleGoogleSignIn} disabled={isLoading}>
      <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
      <span>{isLoading ? 'در حال ورود...' : 'ورود با گوگل'}</span>
    </button>

    <div class="divider">
      <span>یا با ایمیل</span>
    </div>

    <form on:submit={handleEmailSignIn} class="form">
      <div class="input-group">
        <label for="email">ایمیل</label>
        <input
          id="email"
          name="email"
          type="email"
          bind:value={email}
          placeholder="مثلاً: you@example.com"
          required
          disabled={isLoading}
        />
      </div>

      <div class="input-group">
        <label for="password">رمز عبور</label>
        <input
          id="password"
          name="password"
          type="password"
          bind:value={password}
          placeholder="•••••••"
          required
          disabled={isLoading}
        />
      </div>

      <button type="submit" class="submit-btn" disabled={isLoading}>
        {isLoading ? 'در حال ورود...' : 'ورود'}
      </button>

      <p class="hint">
        حساب کاربری ندارید؟ با گوگل وارد شوید تا حساب جدید ساخته شود.
      </p>
    </form>
  </div>
</section>

<style>
  /* Mobile-first: single column, full width */
  .login-layout {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-4, 1rem);
    align-items: center;
    min-height: calc(100vh - 120px);
    min-height: calc(100dvh - 120px);
    padding: var(--space-3, 0.75rem);
    padding-left: calc(var(--space-3, 0.75rem) + env(safe-area-inset-left, 0px));
    padding-right: calc(var(--space-3, 0.75rem) + env(safe-area-inset-right, 0px));
    width: 100%;
    max-width: 100%;
    margin: 0;
    box-sizing: border-box;
  }

  /* Tablet: two columns */
  @media (min-width: 900px) {
    .login-layout {
      grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
      gap: var(--space-8, 2rem);
      padding: var(--space-6, 1.5rem);
      max-width: 1200px;
      margin: 0 auto;
    }
  }

  /* Hero Section - Mobile first */
  .hero {
    position: relative;
    padding: var(--space-3, 0.75rem);
    text-align: center;
    order: -1;
  }

  @media (min-width: 900px) {
    .hero {
      padding: var(--space-6, 1.5rem);
      text-align: right;
      order: 0;
    }
  }

  .hero-badge {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2, 0.5rem);
    background: linear-gradient(135deg, var(--color-primary-100, #cffafe), var(--color-primary-50, #ecfeff));
    padding: var(--space-2, 0.5rem) var(--space-4, 1rem);
    border-radius: var(--radius-full, 9999px);
    margin-bottom: var(--space-4, 1rem);
    box-shadow: 0 2px 8px rgba(8, 145, 178, 0.15);
  }

  .badge-icon {
    font-size: var(--text-lg, 1.125rem);
  }

  .badge-text {
    font-weight: var(--font-bold, 700);
    color: var(--color-primary-700, #155e75);
    font-size: var(--text-sm, 0.875rem);
  }

  /* Mobile-first title */
  .hero-title {
    font-size: var(--text-xl, 1.25rem);
    line-height: 1.3;
    margin: 0 0 var(--space-3, 0.75rem);
    color: var(--color-neutral-800, #292524);
    font-weight: var(--font-extrabold, 800);
  }

  @media (min-width: 640px) {
    .hero-title {
      font-size: var(--text-2xl, 1.5rem);
      margin: 0 0 var(--space-4, 1rem);
    }
  }

  @media (min-width: 900px) {
    .hero-title {
      font-size: var(--text-3xl, 1.875rem);
    }
  }

  .hero-title .highlight {
    background: linear-gradient(135deg, var(--color-primary-500, #0891b2), var(--color-xp-500, #4f46e5));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* Mobile-first description */
  .hero-description {
    font-size: var(--text-sm, 0.875rem);
    color: var(--color-neutral-600, #57534e);
    max-width: 100%;
    margin: 0 auto var(--space-4, 1rem);
    line-height: 1.6;
  }

  @media (min-width: 640px) {
    .hero-description {
      font-size: var(--text-base, 1rem);
      line-height: 1.7;
      margin: 0 0 var(--space-6, 1.5rem);
    }
  }

  @media (min-width: 900px) {
    .hero-description {
      max-width: 30rem;
    }
  }

  /* Features List - Mobile first */
  .features {
    list-style: none;
    padding: 0;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: var(--space-2, 0.5rem);
    max-width: 400px;
  }

  @media (min-width: 900px) {
    .features {
      gap: var(--space-3, 0.75rem);
      max-width: none;
      margin: 0;
    }
  }

  .features li {
    display: flex;
    align-items: center;
    gap: var(--space-3, 0.75rem);
    padding: var(--space-3, 0.75rem) var(--space-4, 1rem);
    background: var(--glass-bg, rgba(253, 251, 247, 0.85));
    border: 1px solid var(--glass-border, rgba(212, 201, 185, 0.3));
    border-radius: var(--radius-lg, 0.75rem);
    backdrop-filter: blur(var(--glass-blur, 12px));
    transition: all var(--transition-normal, 200ms);
  }

  .features li:hover {
    transform: translateX(-4px);
    border-color: var(--color-primary-300, #67e8f9);
    box-shadow: var(--shadow-sm, 0 2px 4px rgba(0, 0, 0, 0.05));
  }

  .feature-icon {
    font-size: var(--text-lg, 1.125rem);
  }

  .feature-text {
    font-size: var(--text-sm, 0.875rem);
    color: var(--color-neutral-700, #44403c);
    font-weight: var(--font-medium, 500);
  }

  /* Decorative Elements - Hidden on mobile, shown on desktop */
  .hero-decoration {
    display: none;
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
    z-index: -1;
  }

  @media (min-width: 900px) {
    .hero-decoration {
      display: block;
    }
  }

  .deco-circle {
    position: absolute;
    border-radius: 50%;
    opacity: 0.15;
  }

  .deco-1 {
    width: 200px;
    height: 200px;
    background: var(--color-primary-400, #22d3ee);
    top: -50px;
    right: -50px;
    animation: float 6s ease-in-out infinite;
  }

  .deco-2 {
    width: 150px;
    height: 150px;
    background: var(--color-xp-400, #818cf8);
    bottom: 20%;
    left: -30px;
    animation: float 8s ease-in-out infinite reverse;
  }

  .deco-3 {
    width: 100px;
    height: 100px;
    background: var(--color-streak-400, #fbbf24);
    top: 40%;
    right: 10%;
    animation: float 5s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
  }

  /* Login Card - Mobile first */
  .card {
    background: var(--glass-bg, rgba(253, 251, 247, 0.95));
    border: 1px solid var(--glass-border, rgba(212, 201, 185, 0.3));
    border-radius: var(--radius-xl, 1rem);
    padding: var(--space-4, 1rem);
    backdrop-filter: blur(var(--glass-blur, 12px));
    box-shadow:
      0 10px 30px rgba(0, 0, 0, 0.08),
      0 0 0 1px rgba(255, 255, 255, 0.5) inset;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }

  @media (min-width: 640px) {
    .card {
      padding: var(--space-6, 1.5rem);
      border-radius: var(--radius-2xl, 1.5rem);
    }
  }

  @media (min-width: 900px) {
    .card {
      padding: var(--space-8, 2rem);
      box-shadow:
        0 20px 50px rgba(0, 0, 0, 0.1),
        0 0 0 1px rgba(255, 255, 255, 0.5) inset;
    }
  }

  .card-header {
    text-align: center;
    margin-bottom: var(--space-6, 1.5rem);
  }

  .card-header h2 {
    font-size: var(--text-xl, 1.25rem);
    font-weight: var(--font-bold, 700);
    color: var(--color-neutral-800, #292524);
    margin: 0 0 var(--space-2, 0.5rem);
  }

  .card-subtitle {
    font-size: var(--text-sm, 0.875rem);
    color: var(--color-neutral-500, #78716c);
    margin: 0;
  }

  /* Error Message */
  .error-message {
    display: flex;
    align-items: center;
    gap: var(--space-2, 0.5rem);
    background: linear-gradient(135deg, var(--color-error-50, #fef2f2), rgba(185, 28, 28, 0.05));
    color: var(--color-error-600, #8b1a1a);
    border: 1px solid var(--color-error-200, #fecaca);
    border-radius: var(--radius-lg, 0.75rem);
    padding: var(--space-3, 0.75rem) var(--space-4, 1rem);
    font-size: var(--text-sm, 0.875rem);
    margin-bottom: var(--space-4, 1rem);
  }

  .error-icon {
    font-size: var(--text-base, 1rem);
  }

  /* Google Button */
  .google-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-3, 0.75rem);
    background: white;
    color: var(--color-neutral-700, #44403c);
    border: 2px solid var(--color-neutral-200, #e8e0d5);
    padding: var(--space-3, 0.75rem) var(--space-4, 1rem);
    border-radius: var(--radius-full, 9999px);
    font-size: var(--text-base, 1rem);
    font-weight: var(--font-medium, 500);
    cursor: pointer;
    transition: all var(--transition-normal, 200ms);
    min-height: 48px;
  }

  .google-btn:hover:not(:disabled) {
    background: var(--color-neutral-50, #fdfbf7);
    border-color: var(--color-neutral-300, #d4c9b9);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md, 0 4px 12px rgba(0, 0, 0, 0.1));
  }

  .google-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  /* Divider */
  .divider {
    display: flex;
    align-items: center;
    text-align: center;
    color: var(--color-neutral-400, #a69b8a);
    font-size: var(--text-sm, 0.875rem);
    margin: var(--space-6, 1.5rem) 0;
  }

  .divider::before,
  .divider::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid var(--color-neutral-200, #e8e0d5);
  }

  .divider span {
    padding: 0 var(--space-3, 0.75rem);
  }

  /* Form */
  .form {
    display: flex;
    flex-direction: column;
    gap: var(--space-4, 1rem);
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-2, 0.5rem);
  }

  .input-group label {
    font-size: var(--text-sm, 0.875rem);
    font-weight: var(--font-medium, 500);
    color: var(--color-neutral-700, #44403c);
  }

  .input-group input {
    padding: var(--space-3, 0.75rem) var(--space-4, 1rem);
    border-radius: var(--radius-lg, 0.75rem);
    border: 2px solid var(--color-neutral-200, #e8e0d5);
    font-size: var(--text-base, 1rem);
    background: white;
    transition: all var(--transition-fast, 150ms);
    min-height: 48px;
  }

  .input-group input:focus {
    outline: none;
    border-color: var(--color-primary-500, #0891b2);
    box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.15);
  }

  .input-group input:disabled {
    background: var(--color-neutral-100, #f5f0e8);
    cursor: not-allowed;
  }

  /* Submit Button */
  .submit-btn {
    margin-top: var(--space-2, 0.5rem);
    padding: var(--space-3, 0.75rem) var(--space-6, 1.5rem);
    border-radius: var(--radius-full, 9999px);
    border: none;
    cursor: pointer;
    background: linear-gradient(135deg, var(--color-primary-500, #0891b2), var(--color-primary-600, #0e7490));
    color: white;
    font-weight: var(--font-semibold, 600);
    font-size: var(--text-base, 1rem);
    min-height: 48px;
    transition: all var(--transition-normal, 200ms);
    box-shadow: 0 4px 15px rgba(8, 145, 178, 0.3);
  }

  .submit-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(8, 145, 178, 0.4);
  }

  .submit-btn:active:not(:disabled) {
    transform: translateY(0) scale(0.98);
  }

  .submit-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  /* Hint */
  .hint {
    font-size: var(--text-sm, 0.875rem);
    color: var(--color-neutral-500, #78716c);
    text-align: center;
    margin: var(--space-2, 0.5rem) 0 0;
  }

  /* Dark Mode - use hardcoded colors since CSS variables swap in dark mode */
  :global([data-theme="dark"]) .hero-title {
    color: #f5f0e8;
  }

  :global([data-theme="dark"]) .hero-description {
    color: #d4c9b9;
  }

  :global([data-theme="dark"]) .card {
    background: rgba(28, 25, 23, 0.95);
    border-color: rgba(68, 64, 60, 0.3);
  }

  :global([data-theme="dark"]) .card-header h2 {
    color: #f5f0e8;
  }

  :global([data-theme="dark"]) .card-subtitle {
    color: #a69b8a;
  }

  :global([data-theme="dark"]) .google-btn {
    background: #44403c;
    color: #f5f0e8;
    border-color: #57534e;
  }

  :global([data-theme="dark"]) .google-btn:hover:not(:disabled) {
    background: #57534e;
    border-color: #78716c;
  }

  :global([data-theme="dark"]) .divider {
    color: #78716c;
  }

  :global([data-theme="dark"]) .divider::before,
  :global([data-theme="dark"]) .divider::after {
    border-color: #44403c;
  }

  :global([data-theme="dark"]) .input-group label {
    color: #e8e0d5;
  }

  :global([data-theme="dark"]) .input-group input {
    background: #44403c;
    border-color: #57534e;
    color: #f5f0e8;
  }

  :global([data-theme="dark"]) .input-group input:focus {
    border-color: #22d3ee;
    box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.15);
  }

  :global([data-theme="dark"]) .input-group input::placeholder {
    color: #78716c;
  }

  :global([data-theme="dark"]) .features li {
    background: rgba(28, 25, 23, 0.85);
    border-color: rgba(68, 64, 60, 0.3);
  }

  :global([data-theme="dark"]) .feature-text {
    color: #e8e0d5;
  }

  :global([data-theme="dark"]) .hero-badge {
    background: linear-gradient(135deg, rgba(8, 145, 178, 0.2), rgba(8, 145, 178, 0.1));
  }

  :global([data-theme="dark"]) .badge-text {
    color: #67e8f9;
  }

  :global([data-theme="dark"]) .hint {
    color: #a69b8a;
  }

  /* Feature hover effect - only on desktop */
  @media (min-width: 900px) {
    .features li:hover {
      transform: translateX(-4px);
    }
  }
</style>
