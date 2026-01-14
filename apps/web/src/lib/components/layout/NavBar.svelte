<script lang="ts">
  import LogoutButton from "../auth/LogoutButton.svelte";
  import { getState } from '$lib/services/assetService';
  import { StreakCounter } from '@pkg/ui';
  import { theme, isDarkMode } from '$lib/stores/theme';
  import { db } from '$lib/db';
  import { liveQuery } from 'dexie';

  export let user: { email: string } | null = null;

  // Get current language pair
  $: currentLanguage = getState().languagePair || 'de-fa';

  // Get user stats for streak display
  const userStats = liveQuery(() => db.users.get(1));

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
      <div class="brand-logo">
        <span class="logo-text">DL</span>
      </div>
      <div class="brand-text">
        <span class="brand-title">Deutschlern</span>
        <span class="brand-subtitle">آموزش زبان برای فارسی‌زبان‌ها</span>
      </div>
    </a>

    {#if user}
      <nav class="nav-links">
        <a href="/" class="nav-link">درس‌ها</a>
        <a href="/vocabulary" class="nav-link">واژگان</a>
        <a href="/practice" class="nav-link">تمرین</a>
        <a href="/progress" class="nav-link">پیشرفت</a>
      </nav>
    {/if}
  </div>

  <div class="navbar-right">
    <!-- Streak Counter (mobile-friendly) -->
    {#if user && $userStats}
      <div class="streak-wrapper">
        <StreakCounter streak={$userStats.streak || 0} size="sm" compact />
      </div>
    {/if}

    <!-- Language Switch -->
    <a href="/languages" class="language-switch" title="تغییر زبان">
      <span class="lang-flag">{languageFlags[currentLanguage] || '🌐'}</span>
      <span class="lang-code">{currentLanguage.split('-')[0].toUpperCase()}</span>
    </a>

    <!-- Theme Toggle -->
    <button class="theme-toggle" on:click={() => theme.toggle()} title="تغییر تم">
      {$isDarkMode ? '☀️' : '🌙'}
    </button>

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
    z-index: var(--z-sticky, 20);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-3, 0.75rem) var(--space-6, 1.5rem);
    /* Persian Turquoise gradient */
    background: linear-gradient(
      135deg,
      var(--color-primary-600, #0e7490),
      var(--color-primary-500, #0891b2)
    );
    color: #fff;
    box-shadow:
      var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1)),
      0 4px 20px -4px rgba(8, 145, 178, 0.3);
    transition: background var(--transition-normal, 200ms) ease;
  }

  /* Dark mode navbar */
  :global([data-theme="dark"]) .navbar {
    background: linear-gradient(
      135deg,
      var(--color-neutral-200, #44403c),
      var(--color-neutral-100, #292524)
    );
    box-shadow:
      var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.3)),
      0 4px 20px -4px rgba(0, 0, 0, 0.4);
  }

  .navbar-left {
    display: flex;
    align-items: center;
    gap: var(--space-5, 1.25rem);
  }

  .brand {
    display: flex;
    align-items: center;
    gap: var(--space-3, 0.75rem);
    text-decoration: none;
    color: inherit;
  }

  .brand-logo {
    width: 36px;
    height: 36px;
    border-radius: var(--radius-xl, 0.75rem);
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform var(--transition-bounce, 400ms cubic-bezier(0.68, -0.55, 0.265, 1.55));
  }

  .brand:hover .brand-logo {
    transform: scale(1.1) rotate(-5deg);
  }

  .logo-text {
    font-weight: var(--font-bold, 700);
    font-size: var(--text-sm, 0.875rem);
    letter-spacing: 0.05em;
  }

  .brand-text {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .brand-title {
    font-weight: var(--font-bold, 700);
    font-size: var(--text-base, 1rem);
    letter-spacing: 0.02em;
  }

  .brand-subtitle {
    font-size: var(--text-xs, 0.75rem);
    opacity: 0.85;
  }

  .nav-links {
    display: flex;
    gap: var(--space-1, 0.25rem);
  }

  .nav-link {
    color: rgba(255, 255, 255, 0.9);
    text-decoration: none;
    padding: var(--space-2, 0.5rem) var(--space-3, 0.75rem);
    border-radius: var(--radius-lg, 0.5rem);
    font-size: var(--text-sm, 0.875rem);
    font-weight: var(--font-medium, 500);
    transition: all var(--transition-fast, 150ms) ease;
  }

  .nav-link:hover {
    background: rgba(255, 255, 255, 0.15);
    color: #fff;
  }

  .navbar-right {
    display: flex;
    align-items: center;
    gap: var(--space-3, 0.75rem);
  }

  .streak-wrapper {
    display: flex;
  }

  .language-switch {
    display: flex;
    align-items: center;
    gap: var(--space-1, 0.25rem);
    background: rgba(255, 255, 255, 0.15);
    padding: var(--space-2, 0.5rem) var(--space-3, 0.75rem);
    border-radius: var(--radius-full, 9999px);
    text-decoration: none;
    color: #fff;
    font-size: var(--text-sm, 0.875rem);
    transition: all var(--transition-fast, 150ms) ease;
  }

  .language-switch:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-1px);
  }

  .lang-flag {
    font-size: var(--text-base, 1rem);
  }

  .lang-code {
    font-weight: var(--font-medium, 500);
  }

  .theme-toggle {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.15);
    border: none;
    border-radius: var(--radius-full, 9999px);
    cursor: pointer;
    font-size: var(--text-base, 1rem);
    transition: all var(--transition-fast, 150ms) ease;
  }

  .theme-toggle:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: rotate(15deg);
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: var(--space-2, 0.5rem);
  }

  .user-email {
    font-size: var(--text-xs, 0.75rem);
    background: rgba(255, 255, 255, 0.15);
    padding: var(--space-1, 0.25rem) var(--space-3, 0.75rem);
    border-radius: var(--radius-full, 9999px);
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .login-link {
    color: #fff;
    text-decoration: none;
    padding: var(--space-2, 0.5rem) var(--space-4, 1rem);
    border-radius: var(--radius-full, 9999px);
    border: 2px solid rgba(255, 255, 255, 0.5);
    font-size: var(--text-sm, 0.875rem);
    font-weight: var(--font-medium, 500);
    transition: all var(--transition-fast, 150ms) ease;
  }

  .login-link:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.8);
    transform: translateY(-1px);
  }

  /* Mobile Responsive */
  @media (max-width: 768px) {
    .navbar {
      padding: var(--space-2, 0.5rem) var(--space-4, 1rem);
    }

    .nav-links {
      display: none;
    }

    .brand-subtitle {
      display: none;
    }

    .user-email {
      display: none;
    }

    .language-switch .lang-code {
      display: none;
    }
  }

  @media (max-width: 480px) {
    .brand-title {
      font-size: var(--text-sm, 0.875rem);
    }

    .brand-logo {
      width: 32px;
      height: 32px;
    }
  }
</style>
