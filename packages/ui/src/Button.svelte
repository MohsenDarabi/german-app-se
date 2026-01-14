<script lang="ts">
  /**
   * Button Component
   *
   * A touch-friendly button with Persian-inspired styling and micro-animations.
   * Features:
   * - Multiple variants: primary, secondary, success, error, ghost
   * - Size options: sm, md, lg
   * - Loading state with spinner
   * - Haptic feedback on mobile
   * - Accessibility support
   */

  import { createEventDispatcher } from 'svelte';

  export let variant: 'primary' | 'secondary' | 'success' | 'error' | 'ghost' = 'primary';
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let disabled = false;
  export let loading = false;
  export let fullWidth = false;
  export let type: 'button' | 'submit' | 'reset' = 'button';
  export let haptic = true;

  const dispatch = createEventDispatcher();

  function handleClick(e: MouseEvent) {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }

    // Haptic feedback on mobile devices
    if (haptic && 'vibrate' in navigator) {
      try {
        navigator.vibrate(10);
      } catch {
        // Ignore if vibration fails
      }
    }

    dispatch('click', e);
  }

  // Handle keyboard activation
  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!disabled && !loading) {
        dispatch('click', e);
      }
    }
  }
</script>

<button
  class="btn btn-{variant} btn-{size}"
  class:btn-full={fullWidth}
  class:btn-loading={loading}
  {type}
  disabled={disabled || loading}
  aria-disabled={disabled || loading}
  aria-busy={loading}
  on:click={handleClick}
  on:keydown={handleKeyDown}
  {...$$restProps}
>
  {#if loading}
    <span class="btn-spinner" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" stroke-opacity="0.25" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round" />
      </svg>
    </span>
  {/if}
  <span class="btn-content" class:btn-content-hidden={loading}>
    <slot />
  </span>
</button>

<style>
  .btn {
    /* Base styles */
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2, 0.5rem);
    border: none;
    border-radius: var(--radius-full, 9999px);
    font-family: var(--font-sans, inherit);
    font-weight: var(--font-semibold, 600);
    cursor: pointer;
    user-select: none;
    white-space: nowrap;
    overflow: hidden;

    /* Touch-friendly sizing */
    min-height: var(--touch-target-min, 44px);

    /* Transitions */
    transition:
      transform var(--transition-fast, 100ms) ease,
      box-shadow var(--transition-normal, 200ms) ease,
      background-color var(--transition-normal, 200ms) ease,
      opacity var(--transition-normal, 200ms) ease;
  }

  /* Ripple effect overlay */
  .btn::after {
    content: '';
    position: absolute;
    inset: 0;
    background: currentColor;
    opacity: 0;
    transition: opacity var(--transition-fast, 100ms) ease;
    pointer-events: none;
  }

  .btn:active:not(:disabled)::after {
    opacity: 0.1;
  }

  /* Hover lift effect */
  .btn:hover:not(:disabled) {
    transform: translateY(-2px);
  }

  /* Press effect */
  .btn:active:not(:disabled) {
    transform: translateY(0) scale(0.98);
  }

  /* Focus ring */
  .btn:focus-visible {
    outline: 2px solid var(--color-primary-400, #22d3ee);
    outline-offset: 2px;
  }

  /* Disabled state */
  .btn:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  /* === Size Variants === */

  .btn-sm {
    height: var(--button-height-sm, 36px);
    padding: var(--space-2, 0.5rem) var(--space-4, 1rem);
    font-size: var(--text-sm, 0.875rem);
  }

  .btn-md {
    height: var(--button-height-md, 44px);
    padding: var(--space-3, 0.75rem) var(--space-6, 1.5rem);
    font-size: var(--text-base, 1rem);
  }

  .btn-lg {
    height: var(--button-height-lg, 52px);
    padding: var(--space-4, 1rem) var(--space-8, 2rem);
    font-size: var(--text-lg, 1.125rem);
  }

  /* === Color Variants === */

  /* Primary: Persian Turquoise */
  .btn-primary {
    background: linear-gradient(
      135deg,
      var(--color-primary-500, #0891b2),
      var(--color-primary-600, #0e7490)
    );
    color: white;
    box-shadow:
      var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1)),
      0 4px 14px -2px rgba(8, 145, 178, 0.3);
  }

  .btn-primary:hover:not(:disabled) {
    box-shadow:
      var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1)),
      0 8px 20px -2px rgba(8, 145, 178, 0.4);
  }

  /* Secondary: Warm neutral */
  .btn-secondary {
    background: var(--color-neutral-100, #f5f0e8);
    color: var(--color-neutral-700, #44403c);
    border: 1px solid var(--color-neutral-200, #e8e0d5);
    box-shadow: var(--shadow-sm, 0 1px 3px 0 rgba(0, 0, 0, 0.1));
  }

  .btn-secondary:hover:not(:disabled) {
    background: var(--color-neutral-200, #e8e0d5);
    box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
  }

  /* Success: Persian Gold */
  .btn-success {
    background: linear-gradient(
      135deg,
      var(--color-success-500, #eab308),
      var(--color-success-600, #ca8a04)
    );
    color: var(--color-neutral-900, #1c1917);
    box-shadow:
      var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1)),
      0 4px 14px -2px rgba(234, 179, 8, 0.3);
  }

  .btn-success:hover:not(:disabled) {
    box-shadow:
      var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1)),
      0 8px 20px -2px rgba(234, 179, 8, 0.4);
  }

  /* Error: Persian Burgundy */
  .btn-error {
    background: linear-gradient(
      135deg,
      var(--color-error-500, #b91c1c),
      var(--color-error-600, #991b1b)
    );
    color: white;
    box-shadow:
      var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1)),
      0 4px 14px -2px rgba(185, 28, 28, 0.25);
  }

  .btn-error:hover:not(:disabled) {
    box-shadow:
      var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1)),
      0 8px 20px -2px rgba(185, 28, 28, 0.35);
  }

  /* Ghost: Transparent with hover */
  .btn-ghost {
    background: transparent;
    color: var(--color-neutral-600, #57534e);
    box-shadow: none;
  }

  .btn-ghost:hover:not(:disabled) {
    background: var(--color-neutral-100, #f5f0e8);
    transform: none;
  }

  .btn-ghost:active:not(:disabled) {
    background: var(--color-neutral-200, #e8e0d5);
  }

  /* === Full Width === */

  .btn-full {
    width: 100%;
  }

  /* === Loading State === */

  .btn-loading {
    cursor: wait;
  }

  .btn-spinner {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .btn-spinner svg {
    width: 1.25em;
    height: 1.25em;
    animation: spin 1s linear infinite;
  }

  .btn-content {
    display: flex;
    align-items: center;
    gap: var(--space-2, 0.5rem);
    transition: opacity var(--transition-fast, 100ms) ease;
  }

  .btn-content-hidden {
    opacity: 0;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
</style>
