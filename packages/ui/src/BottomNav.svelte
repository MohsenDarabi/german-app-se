<script lang="ts">
  import { page } from '$app/stores';

  type NavItem = {
    href: string;
    icon: string;
    activeIcon: string;
    label: string;
  };

  const navItems: NavItem[] = [
    { href: '/', icon: '🏠', activeIcon: '🏡', label: 'خانه' },
    { href: '/practice', icon: '🎯', activeIcon: '🎯', label: 'تمرین' },
    { href: '/vocabulary', icon: '📖', activeIcon: '📚', label: 'واژگان' },
    { href: '/progress', icon: '📊', activeIcon: '📈', label: 'پیشرفت' },
    { href: '/review/flashcards', icon: '🎴', activeIcon: '🃏', label: 'مرور' },
  ];

  function isActive(href: string, currentPath: string): boolean {
    if (href === '/') {
      return currentPath === '/';
    }
    return currentPath.startsWith(href);
  }

  $: currentPath = $page.url.pathname;
</script>

<nav class="bottom-nav" dir="rtl">
  {#each navItems as item}
    {@const active = isActive(item.href, currentPath)}
    <a
      href={item.href}
      class="nav-item"
      class:active
      aria-current={active ? 'page' : undefined}
    >
      <span class="nav-icon" class:active>
        {active ? item.activeIcon : item.icon}
      </span>
      <span class="nav-label">{item.label}</span>
      {#if active}
        <span class="active-indicator"></span>
      {/if}
    </a>
  {/each}
</nav>

<style>
  .bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    display: none; /* Hidden by default, shown on mobile */
    justify-content: space-around;
    align-items: center;
    padding: var(--space-2, 0.5rem) var(--space-2, 0.5rem);
    padding-bottom: max(var(--space-2, 0.5rem), env(safe-area-inset-bottom));
    background: var(--glass-bg, rgba(253, 251, 247, 0.92));
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-top: 1px solid var(--glass-border, rgba(212, 201, 185, 0.4));
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
  }

  /* Show on mobile */
  @media (max-width: 768px) {
    .bottom-nav {
      display: flex;
    }
  }

  .nav-item {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-1, 0.25rem);
    padding: var(--space-2, 0.5rem) var(--space-3, 0.75rem);
    min-width: 56px;
    min-height: 48px;
    text-decoration: none;
    color: var(--color-neutral-500, #78716c);
    border-radius: var(--radius-lg, 0.75rem);
    transition: all var(--transition-normal, 200ms);
  }

  .nav-item:hover {
    background: rgba(0, 0, 0, 0.03);
  }

  .nav-item.active {
    color: var(--color-primary-600, #0e7490);
  }

  .nav-icon {
    font-size: 1.4rem;
    line-height: 1;
    transition: transform var(--transition-bounce, 400ms cubic-bezier(0.68, -0.55, 0.265, 1.55));
  }

  .nav-icon.active {
    transform: scale(1.15);
  }

  .nav-label {
    font-size: var(--text-xs, 0.75rem);
    font-weight: var(--font-semibold, 600);
    white-space: nowrap;
  }

  .active-indicator {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 24px;
    height: 3px;
    background: linear-gradient(90deg, var(--color-primary-500, #0891b2), var(--color-xp-500, #4f46e5));
    border-radius: 0 0 var(--radius-full, 9999px) var(--radius-full, 9999px);
    animation: slideIn 0.3s ease;
  }

  @keyframes slideIn {
    from {
      width: 0;
      opacity: 0;
    }
    to {
      width: 24px;
      opacity: 1;
    }
  }

  /* Dark Mode */
  :global([data-theme="dark"]) .bottom-nav {
    background: rgba(28, 25, 23, 0.92);
    border-color: rgba(68, 64, 60, 0.4);
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
  }

  :global([data-theme="dark"]) .nav-item {
    color: var(--color-neutral-400, #a69b8a);
  }

  :global([data-theme="dark"]) .nav-item:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  :global([data-theme="dark"]) .nav-item.active {
    color: var(--color-primary-400, #22d3ee);
  }
</style>
