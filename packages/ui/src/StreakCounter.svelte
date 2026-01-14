<script lang="ts">
  /**
   * Streak Counter Component
   *
   * Displays user's learning streak with Saffron Yellow (زعفرانی) styling.
   * Features:
   * - Animated flame icon
   * - Heat levels based on streak length
   * - Persian day label
   * - Celebration animation for milestones
   */

  export let streak: number = 0;
  export let showLabel: boolean = true;
  export let showFlame: boolean = true;
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let compact: boolean = false;

  // Heat levels based on streak
  $: heatLevel = getHeatLevel(streak);
  $: isMilestone = streak > 0 && streak % 7 === 0; // Weekly milestones

  function getHeatLevel(days: number): 'cold' | 'warm' | 'hot' | 'burning' {
    if (days === 0) return 'cold';
    if (days < 7) return 'warm';
    if (days < 30) return 'hot';
    return 'burning';
  }

  // Format streak number for display
  function formatStreak(days: number): string {
    if (days >= 1000) {
      return Math.floor(days / 1000) + 'k';
    }
    return days.toString();
  }
</script>

<div
  class="streak streak-{size} streak-{heatLevel}"
  class:streak-compact={compact}
  class:streak-milestone={isMilestone}
  title="{streak} روز پشت سر هم"
  role="status"
  aria-label="Streak: {streak} days"
>
  {#if showFlame}
    <span class="streak-flame" class:animate={streak > 0}>
      {#if heatLevel === 'cold'}
        <svg viewBox="0 0 24 24" fill="currentColor" class="flame-icon">
          <path d="M12 22c4.97 0 9-3.58 9-8 0-2.21-.89-4.21-2.34-5.66-.35-.35-.92-.1-.92.39 0 .84-.36 1.63-.94 2.19-.41.41-1.06.15-1.11-.42C15.54 8.82 14.29 7.5 12.5 7c-.39-.11-.75.24-.75.64 0 1.1-.45 2.14-1.25 2.94-.57.57-1.5.17-1.5-.64 0-1.93-.94-3.63-2.39-4.69-.26-.19-.64-.07-.72.24C5.29 7.57 5 8.26 5 9c0 1.33.52 2.54 1.37 3.43.59.62.07 1.57-.7 1.57H5c-.55 0-1 .45-1 1v1c0 3.31 3.13 6 7 6h1v.01z" opacity="0.3"/>
        </svg>
      {:else}
        <svg viewBox="0 0 24 24" fill="currentColor" class="flame-icon">
          <path d="M12 22c4.97 0 9-3.58 9-8 0-2.52-1.18-4.87-3.17-6.39-.41-.31-.99-.07-1.09.45-.31 1.58-1.55 2.94-3.24 2.94-1.24 0-2.4-.69-3.01-1.77-.23-.41-.73-.55-1.09-.28C7.52 10.28 6 12.79 6 15.5c0 3.59 2.69 6.5 6 6.5z"/>
          <ellipse cx="12" cy="17" rx="2.5" ry="3" fill="var(--color-streak-200, #fde68a)"/>
        </svg>
      {/if}
    </span>
  {/if}

  <div class="streak-content">
    <span class="streak-value">{formatStreak(streak)}</span>
    {#if showLabel && !compact}
      <span class="streak-label" dir="rtl">روز</span>
    {/if}
  </div>

  {#if isMilestone}
    <span class="milestone-badge">
      <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12">
        <path fill-rule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clip-rule="evenodd"/>
      </svg>
    </span>
  {/if}
</div>

<style>
  .streak {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2, 0.5rem);
    padding: var(--space-2, 0.5rem) var(--space-4, 1rem);
    border-radius: var(--radius-full, 9999px);
    background: var(--color-streak-50, #fffbeb);
    border: 2px solid var(--color-streak-200, #fde68a);
    transition: all var(--transition-normal, 200ms) ease;
    position: relative;
  }

  /* === Size Variants === */

  .streak-sm {
    padding: var(--space-1, 0.25rem) var(--space-3, 0.75rem);
    gap: var(--space-1, 0.25rem);
    --flame-size: 1.25rem;
    --value-size: 1rem;
    --label-size: 0.7rem;
  }

  .streak-md {
    padding: var(--space-2, 0.5rem) var(--space-4, 1rem);
    gap: var(--space-2, 0.5rem);
    --flame-size: 1.5rem;
    --value-size: 1.25rem;
    --label-size: 0.75rem;
  }

  .streak-lg {
    padding: var(--space-3, 0.75rem) var(--space-5, 1.25rem);
    gap: var(--space-2, 0.5rem);
    --flame-size: 2rem;
    --value-size: 1.5rem;
    --label-size: 0.85rem;
  }

  .streak-compact {
    padding: var(--space-1, 0.25rem) var(--space-2, 0.5rem);
    gap: var(--space-1, 0.25rem);
  }

  /* === Heat Level Variants === */

  .streak-cold {
    background: var(--color-neutral-100, #f5f0e8);
    border-color: var(--color-neutral-200, #e8e0d5);
    color: var(--color-neutral-400, #a69b8a);
  }

  .streak-cold .streak-flame {
    color: var(--color-neutral-300, #d4c9b9);
  }

  .streak-warm {
    background: var(--color-streak-50, #fffbeb);
    border-color: var(--color-streak-200, #fde68a);
  }

  .streak-warm .streak-flame {
    color: var(--color-streak-400, #fbbf24);
  }

  .streak-hot {
    background: linear-gradient(135deg, var(--color-streak-50, #fffbeb), var(--color-streak-100, #fef3c7));
    border-color: var(--color-streak-400, #fbbf24);
    box-shadow: 0 2px 8px -2px rgba(245, 158, 11, 0.3);
  }

  .streak-hot .streak-flame {
    color: var(--color-streak, #f59e0b);
  }

  .streak-burning {
    background: linear-gradient(135deg, var(--color-streak-100, #fef3c7), var(--color-error-50, #fef2f2));
    border-color: var(--color-streak, #f59e0b);
    box-shadow:
      0 4px 12px -2px rgba(245, 158, 11, 0.4),
      0 0 0 2px rgba(245, 158, 11, 0.1);
  }

  .streak-burning .streak-flame {
    color: var(--color-streak-600, #d97706);
  }

  /* === Flame Icon === */

  .streak-flame {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--flame-size);
    line-height: 1;
  }

  .flame-icon {
    width: var(--flame-size);
    height: var(--flame-size);
  }

  .streak-flame.animate {
    animation: flame-flicker 0.5s ease-in-out infinite;
  }

  @keyframes flame-flicker {
    0%, 100% { transform: scale(1) rotate(-2deg); }
    25% { transform: scale(1.05) rotate(2deg); }
    50% { transform: scale(0.95) rotate(-1deg); }
    75% { transform: scale(1.02) rotate(1deg); }
  }

  /* === Content === */

  .streak-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    line-height: 1.1;
    gap: 1px;
  }

  .streak-value {
    font-size: var(--value-size);
    font-weight: var(--font-extrabold, 800);
    color: var(--color-streak-700, #b45309);
    font-variant-numeric: tabular-nums;
  }

  .streak-cold .streak-value {
    color: var(--color-neutral-500, #78716c);
  }

  .streak-label {
    font-size: var(--label-size);
    font-weight: var(--font-medium, 500);
    color: var(--color-neutral-500, #78716c);
  }

  /* === Milestone Badge === */

  .streak-milestone {
    animation: milestone-glow 2s ease-in-out infinite;
  }

  @keyframes milestone-glow {
    0%, 100% { box-shadow: 0 4px 12px -2px rgba(245, 158, 11, 0.4); }
    50% { box-shadow: 0 4px 20px -2px rgba(245, 158, 11, 0.6); }
  }

  .milestone-badge {
    position: absolute;
    top: -6px;
    right: -6px;
    background: var(--color-achievement, #d4af37);
    color: white;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 6px -1px rgba(212, 175, 55, 0.5);
    animation: badge-bounce 1s ease-in-out infinite alternate;
  }

  @keyframes badge-bounce {
    0% { transform: scale(1); }
    100% { transform: scale(1.1); }
  }

  /* Dark mode adjustments */
  :global([data-theme="dark"]) .streak-cold {
    background: var(--color-neutral-100, #292524);
    border-color: var(--color-neutral-200, #44403c);
  }

  :global([data-theme="dark"]) .streak-warm,
  :global([data-theme="dark"]) .streak-hot,
  :global([data-theme="dark"]) .streak-burning {
    background: rgba(255, 251, 235, 0.1);
  }

  :global([data-theme="dark"]) .streak-value {
    color: var(--color-streak-light, #fbbf24);
  }
</style>
