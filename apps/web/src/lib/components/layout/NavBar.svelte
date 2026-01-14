<script lang="ts">
  import LogoutButton from "../auth/LogoutButton.svelte";
  import { getState } from '$lib/services/assetService';

  export let user: { email: string } | null = null;

  // Get current language pair
  $: currentLanguage = getState().languagePair || 'de-fa';

  // Language display info
  const languageFlags: Record<string, string> = {
    'de-fa': '🇩🇪',
    'en-fa': '🇬🇧',
    'fr-fa': '🇫🇷',
  };
</script>

<header class="navbar">
  <div class="navbar-left">
    <a href="/" class="brand">
      <div class="brand-logo">DL</div>
      <div class="brand-text">
        <span class="brand-title">Deutschlern</span>
        <span class="brand-subtitle">آموزش آلمانی و انگلیسی برای فارسی‌زبان‌ها</span>
      </div>
    </a>

    {#if user}
      <nav class="nav-links">
        <a href="/">درس‌ها</a>
        <a href="/vocabulary">واژگان</a>
        <a href="/practice">تمرین‌ها</a>
        <a href="/progress">پیشرفت من</a>
      </nav>
    {/if}
  </div>

  <div class="navbar-right">
    <a href="/languages" class="language-switch" title="تغییر زبان">
      <span class="lang-flag">{languageFlags[currentLanguage] || '🌐'}</span>
      <span class="lang-code">{currentLanguage.split('-')[0].toUpperCase()}</span>
    </a>

    {#if user}
      <div class="user-info">
        <span class="user-email">{user.email}</span>
        <LogoutButton />
      </div>
    {:else}
      <a href="/login" class="login-link">ورود</a>
    {/if}
  </div>
</header>

<style>
  .navbar {
    position: sticky;
    top: 0;
    z-index: 20;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.6rem 1.5rem;
    background: linear-gradient(90deg, #1d61d1, #3b82f6);
    color: #fff;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  }

  .navbar-left {
    display: flex;
    align-items: center;
    gap: 1.25rem;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    text-decoration: none;
    color: inherit;
  }

  .brand-logo {
    width: 32px;
    height: 32px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.9rem;
  }

  .brand-text {
    display: flex;
    flex-direction: column;
  }

  .brand-title {
    font-weight: 700;
    font-size: 1rem;
    letter-spacing: 0.03em;
  }

  .brand-subtitle {
    font-size: 0.75rem;
    opacity: 0.9;
  }

  .nav-links {
    display: flex;
    gap: 0.75rem;
    font-size: 0.9rem;
  }

  .nav-links a {
    color: rgba(255, 255, 255, 0.92);
    text-decoration: none;
    padding: 0.25rem 0.6rem;
    border-radius: 999px;
  }

  .nav-links a:hover {
    background: rgba(255, 255, 255, 0.18);
  }

  .navbar-right {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .language-switch {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    background: rgba(255, 255, 255, 0.12);
    padding: 0.35rem 0.65rem;
    border-radius: 999px;
    text-decoration: none;
    color: #fff;
    transition: background 0.2s ease;
  }

  .language-switch:hover {
    background: rgba(255, 255, 255, 0.22);
  }

  .lang-flag {
    font-size: 1rem;
  }

  .lang-code {
    font-size: 0.8rem;
    font-weight: 500;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .user-email {
    font-size: 0.8rem;
    background: rgba(255, 255, 255, 0.12);
    padding: 0.25rem 0.6rem;
    border-radius: 999px;
  }

  .login-link {
    color: #fff;
    text-decoration: none;
    padding: 0.3rem 0.9rem;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.7);
    font-size: 0.85rem;
  }

  .login-link:hover {
    background: rgba(255, 255, 255, 0.16);
  }

  @media (max-width: 720px) {
    .nav-links {
      display: none;
    }

    .brand-subtitle {
      display: none;
    }

    .navbar {
      padding-inline: 1rem;
    }
  }
</style>

