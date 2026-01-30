<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import LogoutButton from "../auth/LogoutButton.svelte";
  import { getState } from '$lib/services/assetService';
  import { StreakCounter } from '@pkg/ui';
  import { theme, isDarkMode } from '$lib/stores/theme';
  import { db } from '$lib/db';
  import { liveQuery } from 'dexie';

  export let user: { email: string } | null = null;

  // Mobile menu state
  let isMenuOpen = false;

  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
  }

  function closeMenu() {
    isMenuOpen = false;
  }

  // Close menu on click outside
  function handleClickOutside(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (isMenuOpen && !target.closest('.menu-container') && !target.closest('.hamburger-btn')) {
      closeMenu();
    }
  }

  onMount(() => {
    document.addEventListener('click', handleClickOutside);
  });

  onDestroy(() => {
    document.removeEventListener('click', handleClickOutside);
  });

  // Get current language pair
  const currentLanguage = getState().languagePair || 'de-fa';

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
      <nav class="nav-links desktop-only">
        <a href="/" class="nav-link">درس‌ها</a>
        <a href="/vocabulary" class="nav-link">واژگان</a>
        <a href="/practice" class="nav-link">تمرین</a>
        <a href="/progress" class="nav-link">پیشرفت</a>
      </nav>
    {/if}
  </div>

  <!-- Desktop: show all items -->
  <div class="navbar-right desktop-only">
    {#if user && $userStats}
      <div class="streak-wrapper">
        <StreakCounter streak={$userStats.streak || 0} size="sm" compact />
      </div>
    {/if}

    <a href="/languages" class="language-switch" title="تغییر زبان">
      <span class="lang-flag">{languageFlags[currentLanguage] || '🌐'}</span>
      <span class="lang-code">{currentLanguage.split('-')[0].toUpperCase()}</span>
    </a>

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

  <!-- Mobile: hamburger menu -->
  <div class="navbar-right mobile-only">
    {#if !user}
      <a href="/login" class="login-link">ورود</a>
    {/if}

    <button class="hamburger-btn" on:click={toggleMenu} title="منو">
      <span class="hamburger-icon">{isMenuOpen ? '✕' : '☰'}</span>
    </button>
  </div>

  <!-- Mobile Menu Panel -->
  {#if isMenuOpen}
    <div class="menu-container">
      <nav class="mobile-menu" dir="rtl">
        {#if user && $userStats}
          <div class="menu-item streak-item">
            <StreakCounter streak={$userStats.streak || 0} size="sm" />
            <span class="menu-label">روزهای متوالی</span>
          </div>
        {/if}

        <a href="/languages" class="menu-item" on:click={closeMenu}>
          <span class="menu-icon">{languageFlags[currentLanguage] || '🌐'}</span>
          <span class="menu-label">تغییر زبان</span>
        </a>

        <button class="menu-item" on:click={() => { theme.toggle(); closeMenu(); }}>
          <span class="menu-icon">{$isDarkMode ? '☀️' : '🌙'}</span>
          <span class="menu-label">{$isDarkMode ? 'حالت روشن' : 'حالت تاریک'}</span>
        </button>

        {#if user}
          <div class="menu-divider"></div>
          <div class="menu-item user-item">
            <span class="menu-icon">👤</span>
            <span class="menu-label user-email-menu">{user.email}</span>
          </div>
          <div class="menu-item">
            <LogoutButton />
          </div>
        {/if}
      </nav>
    </div>
  {/if}
</header>

<style>
  .navbar {
    position: sticky;
    top: 0;
    z-index: var(--z-sticky, 20);
    display: flex;
    justify-content: space-between;
    align-items: center;
    /* Mobile-first: account for safe area on notched phones */
    padding: var(--space-2, 0.5rem) var(--space-3, 0.75rem);
    padding-top: calc(var(--space-2, 0.5rem) + env(safe-area-inset-top, 0px));
    padding-left: calc(var(--space-3, 0.75rem) + env(safe-area-inset-left, 0px));
    padding-right: calc(var(--space-3, 0.75rem) + env(safe-area-inset-right, 0px));
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

  /* Mobile is default (mobile-first) */
  /* Hide desktop-only elements on mobile */
  .desktop-only {
    display: none;
  }

  .mobile-only {
    display: flex;
  }

  .brand-subtitle {
    display: none;
  }

  /* Hamburger Button */
  .hamburger-btn {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.15);
    border: none;
    border-radius: var(--radius-lg, 0.5rem);
    cursor: pointer;
    transition: all var(--transition-fast, 150ms) ease;
  }

  .hamburger-btn:hover {
    background: rgba(255, 255, 255, 0.25);
  }

  .hamburger-icon {
    font-size: var(--text-lg, 1.125rem);
    color: #fff;
  }

  /* Mobile Menu Container */
  .menu-container {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 100;
    padding: var(--space-2, 0.5rem);
    padding-left: calc(var(--space-2, 0.5rem) + env(safe-area-inset-left, 0px));
    padding-right: calc(var(--space-2, 0.5rem) + env(safe-area-inset-right, 0px));
  }

  .mobile-menu {
    background: var(--color-neutral-50, #faf8f5);
    border-radius: var(--radius-xl, 1rem);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    padding: var(--space-2, 0.5rem);
    animation: menu-slide-down 0.2s ease-out;
  }

  @keyframes menu-slide-down {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .menu-item {
    display: flex;
    align-items: center;
    gap: var(--space-3, 0.75rem);
    width: 100%;
    padding: var(--space-3, 0.75rem);
    background: transparent;
    border: none;
    border-radius: var(--radius-lg, 0.75rem);
    font-size: var(--text-base, 1rem);
    color: var(--color-neutral-700, #44403c);
    cursor: pointer;
    text-decoration: none;
    transition: background 0.15s ease;
    min-height: 44px;
  }

  .menu-item:hover {
    background: var(--color-neutral-100, #f5f0e8);
  }

  .menu-icon {
    font-size: var(--text-lg, 1.125rem);
    flex-shrink: 0;
  }

  .menu-label {
    flex: 1;
    text-align: right;
    font-weight: var(--font-medium, 500);
  }

  .menu-divider {
    height: 1px;
    background: var(--color-neutral-200, #e8e0d5);
    margin: var(--space-2, 0.5rem) 0;
  }

  .streak-item {
    justify-content: flex-end;
    gap: var(--space-2, 0.5rem);
  }

  .user-email-menu {
    font-size: var(--text-sm, 0.875rem);
    color: var(--color-neutral-500, #78716c);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Tablet and up: show desktop layout, hide mobile */
  @media (min-width: 769px) {
    .navbar {
      padding: var(--space-3, 0.75rem) var(--space-6, 1.5rem);
      padding-top: var(--space-3, 0.75rem);
      padding-left: var(--space-6, 1.5rem);
      padding-right: var(--space-6, 1.5rem);
    }

    .desktop-only {
      display: flex;
    }

    .mobile-only {
      display: none;
    }

    .menu-container {
      display: none;
    }

    .brand-subtitle {
      display: block;
    }

    .user-email {
      display: block;
    }

    .language-switch .lang-code {
      display: inline;
    }

    .nav-links {
      gap: var(--space-1, 0.25rem);
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

  /* Dark mode for mobile menu */
  :global([data-theme="dark"]) .mobile-menu {
    background: var(--color-neutral-100, #292524);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }

  :global([data-theme="dark"]) .menu-item {
    color: var(--color-neutral-200, #d4c9b9);
  }

  :global([data-theme="dark"]) .menu-item:hover {
    background: var(--color-neutral-50, #44403c);
  }

  :global([data-theme="dark"]) .menu-divider {
    background: var(--color-neutral-50, #44403c);
  }
</style>
