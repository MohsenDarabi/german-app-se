<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { theme } from '$lib/stores/theme';

  export let isOpen = false;

  const dispatch = createEventDispatcher<{
    close: void;
  }>();

  let isDark = false;

  // Subscribe to theme changes
  const unsubscribe = theme.subscribe(t => {
    isDark = t === 'dark';
  });

  function toggleTheme() {
    theme.toggle();
  }

  function handleClickOutside(e: MouseEvent) {
    if (!isOpen) return;
    const target = e.target as HTMLElement;
    if (!target.closest('.menu-container')) {
      dispatch('close');
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (!isOpen) return;
    if (e.key === 'Escape') {
      dispatch('close');
    }
  }

  onMount(() => {
    document.addEventListener('click', handleClickOutside, true);
    window.addEventListener('keydown', handleKeydown);
  });

  onDestroy(() => {
    unsubscribe();
    document.removeEventListener('click', handleClickOutside, true);
    window.removeEventListener('keydown', handleKeydown);
  });
</script>

{#if isOpen}
  <div class="menu-container" role="menu">
    <div class="menu-panel">
      <button class="menu-item" on:click={toggleTheme} role="menuitem">
        <span class="menu-icon">{isDark ? '☀️' : '🌙'}</span>
        <span class="menu-label" dir="rtl">{isDark ? 'حالت روشن' : 'حالت تاریک'}</span>
      </button>

      <a href="/vocabulary" class="menu-item" role="menuitem">
        <span class="menu-icon">📖</span>
        <span class="menu-label" dir="rtl">واژگان من</span>
      </a>

      <button class="menu-item" role="menuitem" disabled>
        <span class="menu-icon">❓</span>
        <span class="menu-label" dir="rtl">راهنما</span>
      </button>
    </div>
  </div>
{/if}

<style>
  .menu-container {
    position: absolute;
    top: 100%;
    right: 0;
    z-index: 100;
    padding-top: var(--space-2, 0.5rem);
  }

  /* Mobile: Full-width dropdown */
  .menu-panel {
    background: var(--color-neutral-50, #faf8f5);
    border-radius: var(--radius-xl, 1rem);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    padding: var(--space-2, 0.5rem);
    min-width: 180px;
    animation: fade-down 0.15s ease-out;
  }

  @keyframes fade-down {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Tablet+: Fixed width */
  @media (min-width: 768px) {
    .menu-panel {
      min-width: 200px;
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

  .menu-item:hover:not(:disabled) {
    background: var(--color-neutral-100, #f5f0e8);
  }

  .menu-item:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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

  /* Dark mode */
  :global([data-theme="dark"]) .menu-panel {
    background: var(--color-neutral-100, #292524);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }

  :global([data-theme="dark"]) .menu-item {
    color: var(--color-neutral-200, #d4c9b9);
  }

  :global([data-theme="dark"]) .menu-item:hover:not(:disabled) {
    background: var(--color-neutral-50, #44403c);
  }
</style>
