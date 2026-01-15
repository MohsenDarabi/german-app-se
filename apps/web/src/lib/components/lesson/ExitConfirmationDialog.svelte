<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';

  export let isOpen = false;
  export let progress = 0;

  const dispatch = createEventDispatcher<{
    continue: void;
    exit: void;
  }>();

  function handleContinue() {
    dispatch('continue');
  }

  function handleExit() {
    dispatch('exit');
  }

  function handleKeydown(e: KeyboardEvent) {
    if (!isOpen) return;
    if (e.key === 'Escape') {
      handleContinue();
    }
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      handleContinue();
    }
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeydown);
  });

  onDestroy(() => {
    window.removeEventListener('keydown', handleKeydown);
  });
</script>

{#if isOpen}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="dialog-backdrop" on:click={handleBackdropClick}>
    <div class="dialog-content" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
      <h2 id="dialog-title" class="dialog-title" dir="rtl">آیا می‌خواهید خارج شوید؟</h2>

      <p class="progress-text" dir="rtl">
        شما <span class="progress-value">{progress}%</span> از درس را تکمیل کرده‌اید
      </p>

      <div class="dialog-actions">
        <button class="btn-continue" on:click={handleContinue}>
          ادامه درس
        </button>
        <button class="btn-exit" on:click={handleExit}>
          خروج
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  /* Backdrop with blur */
  .dialog-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    display: flex;
    align-items: flex-end;
    justify-content: center;
    z-index: 1000;
    padding: 0;
  }

  /* Mobile: Bottom sheet style */
  .dialog-content {
    width: 100%;
    max-width: 100%;
    background: var(--color-neutral-50, #faf8f5);
    border-radius: var(--radius-2xl, 1.5rem) var(--radius-2xl, 1.5rem) 0 0;
    padding: var(--space-6, 1.5rem);
    padding-bottom: calc(var(--space-6, 1.5rem) + env(safe-area-inset-bottom, 0px));
    box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.15);
    animation: slide-up 0.3s ease-out;
  }

  @keyframes slide-up {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  /* Tablet+: Centered modal */
  @media (min-width: 768px) {
    .dialog-backdrop {
      align-items: center;
      padding: var(--space-4, 1rem);
    }

    .dialog-content {
      max-width: 400px;
      border-radius: var(--radius-2xl, 1.5rem);
      padding-bottom: var(--space-6, 1.5rem);
      animation: fade-scale 0.2s ease-out;
    }

    @keyframes fade-scale {
      from {
        transform: scale(0.95);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }
  }

  .dialog-title {
    font-size: var(--text-xl, 1.25rem);
    font-weight: var(--font-bold, 700);
    color: var(--color-neutral-800, #292524);
    margin: 0 0 var(--space-3, 0.75rem);
    text-align: center;
  }

  .progress-text {
    font-size: var(--text-base, 1rem);
    color: var(--color-neutral-600, #57534e);
    margin: 0 0 var(--space-6, 1.5rem);
    text-align: center;
  }

  .progress-value {
    font-weight: var(--font-bold, 700);
    color: var(--color-primary-600, #0e7490);
  }

  .dialog-actions {
    display: flex;
    flex-direction: column;
    gap: var(--space-3, 0.75rem);
  }

  .btn-continue {
    width: 100%;
    padding: var(--space-4, 1rem);
    background: var(--color-primary-500, #0891b2);
    color: white;
    border: none;
    border-radius: var(--radius-xl, 1rem);
    font-size: var(--text-lg, 1.125rem);
    font-weight: var(--font-semibold, 600);
    cursor: pointer;
    min-height: 52px;
    transition: transform 0.15s ease, background 0.15s ease;
  }

  .btn-continue:hover {
    background: var(--color-primary-600, #0e7490);
    transform: scale(1.02);
  }

  .btn-continue:active {
    transform: scale(0.98);
  }

  .btn-exit {
    width: 100%;
    padding: var(--space-3, 0.75rem);
    background: transparent;
    color: var(--color-neutral-500, #78716c);
    border: none;
    border-radius: var(--radius-lg, 0.75rem);
    font-size: var(--text-base, 1rem);
    font-weight: var(--font-medium, 500);
    cursor: pointer;
    min-height: 44px;
    transition: color 0.15s ease, background 0.15s ease;
  }

  .btn-exit:hover {
    color: var(--color-neutral-700, #44403c);
    background: var(--color-neutral-100, #f5f0e8);
  }

  /* Dark mode */
  :global([data-theme="dark"]) .dialog-content {
    background: var(--color-neutral-100, #292524);
  }

  :global([data-theme="dark"]) .dialog-title {
    color: var(--color-neutral-50, #f5f0e8);
  }

  :global([data-theme="dark"]) .progress-text {
    color: var(--color-neutral-400, #a69b8a);
  }

  :global([data-theme="dark"]) .progress-value {
    color: var(--color-primary-400, #22d3ee);
  }

  :global([data-theme="dark"]) .btn-continue {
    background: var(--color-primary-600, #0891b2);
  }

  :global([data-theme="dark"]) .btn-continue:hover {
    background: var(--color-primary-500, #06b6d4);
  }

  :global([data-theme="dark"]) .btn-exit {
    color: var(--color-neutral-400, #a69b8a);
  }

  :global([data-theme="dark"]) .btn-exit:hover {
    color: var(--color-neutral-200, #d4c9b9);
    background: var(--color-neutral-50, #44403c);
  }
</style>
