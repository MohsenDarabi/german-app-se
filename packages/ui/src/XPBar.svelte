<script lang="ts">
  /**
   * XP Bar Component
   *
   * Animated XP progress bar with Persian Indigo (لاجوردی) styling.
   * Features:
   * - Level badge display
   * - Smooth progress animations
   * - Shine effect on the progress bar
   * - XP gain animation support
   * - Accessible with ARIA attributes
   */

  import { createEventDispatcher, onMount } from 'svelte';

  export let currentXP: number = 0;
  export let levelXP: number = 100;
  export let level: number = 1;
  export let showLabel: boolean = true;
  export let animate: boolean = true;
  export let size: 'sm' | 'md' | 'lg' = 'md';

  const dispatch = createEventDispatcher();

  let displayXP = 0;
  let showGainAnimation = false;
  let prevXP = currentXP;

  $: progress = Math.min((displayXP / levelXP) * 100, 100);

  // Animate XP changes
  $: if (currentXP !== prevXP && animate) {
    animateXPChange(prevXP, currentXP);
    prevXP = currentXP;
  }

  // On mount, set initial display XP
  onMount(() => {
    if (animate) {
      setTimeout(() => {
        displayXP = currentXP;
      }, 100);
    } else {
      displayXP = currentXP;
    }
  });

  function animateXPChange(from: number, to: number) {
    const diff = to - from;
    if (diff > 0) {
      // XP gained - show animation
      showGainAnimation = true;
      dispatch('xpGain', { amount: diff });
      setTimeout(() => {
        showGainAnimation = false;
      }, 1000);
    }

    // Smooth number animation
    const duration = 500;
    const steps = 30;
    const stepValue = diff / steps;
    let current = from;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      current += stepValue;
      displayXP = Math.round(current);

      if (step >= steps) {
        clearInterval(interval);
        displayXP = to;

        // Check for level up
        if (to >= levelXP) {
          dispatch('levelUp', { level: level + 1 });
        }
      }
    }, duration / steps);
  }
</script>

<div
  class="xp-bar xp-bar-{size}"
  role="progressbar"
  aria-valuenow={currentXP}
  aria-valuemin={0}
  aria-valuemax={levelXP}
  aria-label="Experience points: {currentXP} out of {levelXP}"
>
  <!-- Level Badge -->
  <div class="level-badge" class:pulse={showGainAnimation}>
    <span class="level-number">{level}</span>
  </div>

  <!-- Progress Track -->
  <div class="xp-track">
    <div
      class="xp-fill"
      class:animating={showGainAnimation}
      style="width: {progress}%"
    >
      <div class="xp-shine" />
    </div>
  </div>

  <!-- XP Text -->
  {#if showLabel}
    <span class="xp-text" dir="ltr">
      {displayXP}/{levelXP}
    </span>
  {/if}

  <!-- XP Gain Popup -->
  {#if showGainAnimation}
    <div class="xp-popup">
      +{currentXP - prevXP} XP
    </div>
  {/if}
</div>

<style>
  .xp-bar {
    display: flex;
    align-items: center;
    gap: var(--space-3, 0.75rem);
    width: 100%;
    position: relative;
  }

  /* === Size Variants === */

  .xp-bar-sm {
    --badge-size: 28px;
    --track-height: 8px;
    --font-size: 0.7rem;
  }

  .xp-bar-md {
    --badge-size: 36px;
    --track-height: 12px;
    --font-size: 0.8rem;
  }

  .xp-bar-lg {
    --badge-size: 44px;
    --track-height: 16px;
    --font-size: 0.9rem;
  }

  /* === Level Badge === */

  .level-badge {
    width: var(--badge-size);
    height: var(--badge-size);
    min-width: var(--badge-size);
    border-radius: 50%;
    background: linear-gradient(
      135deg,
      var(--color-xp, #4f46e5),
      var(--color-xp-600, #4338ca)
    );
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: var(--font-bold, 700);
    font-size: calc(var(--badge-size) * 0.4);
    box-shadow:
      var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1)),
      0 2px 8px -1px rgba(79, 70, 229, 0.4);
    transition: transform var(--transition-bounce, 400ms cubic-bezier(0.68, -0.55, 0.265, 1.55));
  }

  .level-badge.pulse {
    animation: badge-pulse 0.5s ease-out;
  }

  @keyframes badge-pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }

  .level-number {
    line-height: 1;
  }

  /* === Progress Track === */

  .xp-track {
    flex: 1;
    height: var(--track-height);
    background: var(--color-neutral-200, #e8e0d5);
    border-radius: var(--radius-full, 9999px);
    overflow: hidden;
    position: relative;
  }

  .xp-fill {
    height: 100%;
    background: linear-gradient(
      90deg,
      var(--color-xp, #4f46e5),
      var(--color-xp-light, #818cf8)
    );
    border-radius: var(--radius-full, 9999px);
    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
  }

  .xp-fill.animating {
    animation: glow-pulse 1s ease-out;
  }

  @keyframes glow-pulse {
    0%, 100% { box-shadow: none; }
    50% { box-shadow: 0 0 16px 4px var(--color-xp-glow, rgba(79, 70, 229, 0.4)); }
  }

  /* Shine effect */
  .xp-shine {
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.4),
      transparent
    );
    animation: shine 3s ease-in-out infinite;
    animation-delay: 1s;
  }

  @keyframes shine {
    0% { left: -100%; }
    30%, 100% { left: 100%; }
  }

  /* === XP Text === */

  .xp-text {
    font-size: var(--font-size);
    font-weight: var(--font-medium, 500);
    color: var(--color-neutral-500, #78716c);
    min-width: 55px;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  /* === XP Gain Popup === */

  .xp-popup {
    position: absolute;
    top: -30px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--color-xp, #4f46e5);
    color: white;
    padding: var(--space-1, 0.25rem) var(--space-3, 0.75rem);
    border-radius: var(--radius-full, 9999px);
    font-size: var(--text-sm, 0.875rem);
    font-weight: var(--font-bold, 700);
    white-space: nowrap;
    animation: float-up 1s ease-out forwards;
    box-shadow: 0 4px 12px -2px rgba(79, 70, 229, 0.5);
  }

  @keyframes float-up {
    0% {
      opacity: 1;
      transform: translateX(-50%) translateY(0) scale(1);
    }
    100% {
      opacity: 0;
      transform: translateX(-50%) translateY(-30px) scale(1.1);
    }
  }

  /* Dark mode adjustments */
  :global([data-theme="dark"]) .xp-track {
    background: var(--color-neutral-200, #44403c);
  }

  :global([data-theme="dark"]) .xp-text {
    color: var(--color-neutral-500, #a69b8a);
  }
</style>
