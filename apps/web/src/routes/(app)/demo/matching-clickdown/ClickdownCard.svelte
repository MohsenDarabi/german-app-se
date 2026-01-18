<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import GlassCrackOverlay from '../matching-burn/GlassCrackOverlay.svelte';

  export let id: string;
  export let text: string;
  export let language: 'de' | 'fa';
  export let state: 'idle' | 'selected' | 'cracking' | 'deactivated' = 'idle';

  const dispatch = createEventDispatcher<{ select: { id: string } }>();

  let crackAudio: HTMLAudioElement | null = null;

  function playGlassCrackSound() {
    try {
      if (!crackAudio) {
        crackAudio = new Audio('/audio/effects/glass-crack.m4a');
      }
      crackAudio.currentTime = 0;
      crackAudio.volume = 0.5;
      crackAudio.play().catch(() => {});
    } catch (e) {
      // Audio not supported, fail silently
    }
  }

  function handleClick() {
    if (state === 'idle' || state === 'selected') {
      dispatch('select', { id });
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if ((e.key === 'Enter' || e.key === ' ') && (state === 'idle' || state === 'selected')) {
      e.preventDefault();
      dispatch('select', { id });
    }
  }

  // Play crack sound when cracking starts
  $: if (state === 'cracking') {
    playGlassCrackSound();
  }

  $: cardClasses = [
    'clickdown-card',
    `state-${state}`,
    `lang-${language}`
  ].filter(Boolean).join(' ');
</script>

<button
  class={cardClasses}
  on:click={handleClick}
  on:keydown={handleKeydown}
  disabled={state === 'deactivated' || state === 'cracking'}
  aria-label="{language === 'de' ? 'German' : 'Persian'}: {text}"
  aria-pressed={state === 'selected'}
  data-id={id}
>
  <span class="card-text" dir={language === 'fa' ? 'rtl' : 'ltr'}>
    {text}
  </span>

  <!-- Glass crack effect overlay -->
  <GlassCrackOverlay active={state === 'cracking'} />

  {#if state === 'deactivated'}
    <div class="checkmark-badge">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    </div>
  {/if}
</button>

<style>
  .clickdown-card {
    position: relative;
    width: 100%;
    aspect-ratio: 1.4;
    min-height: 70px;
    max-height: 90px;
    padding: var(--space-3);
    border-radius: var(--radius-xl);
    border: 2px solid var(--color-primary-500);
    background: linear-gradient(145deg, var(--color-neutral-50) 0%, var(--color-neutral-100) 100%);
    cursor: pointer;
    font-family: var(--font-sans);
    font-size: var(--text-base);
    font-weight: var(--font-semibold);
    color: var(--color-neutral-800);
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    overflow: hidden;

    /* 3D raised effect with Persian turquoise */
    box-shadow:
      4px 4px 0px var(--color-primary-500),
      4px 4px 8px rgba(8, 145, 178, 0.2);
    transform: translate(0, 0);
    transition:
      transform 0.1s ease,
      box-shadow 0.1s ease,
      background 0.15s ease,
      border-color 0.15s ease,
      opacity 0.3s ease,
      filter 0.3s ease;
  }

  /* Language-specific styling */
  .clickdown-card.lang-de {
    font-size: var(--text-base);
  }

  .clickdown-card.lang-fa {
    font-size: var(--text-lg);
  }

  .card-text {
    position: relative;
    z-index: 2;
    text-align: center;
    line-height: var(--leading-tight);
    word-break: break-word;
  }

  /* Idle state - hover effect */
  .clickdown-card.state-idle:hover {
    background: linear-gradient(145deg, var(--color-primary-50) 0%, var(--color-primary-100) 100%);
    border-color: var(--color-primary-400);
    box-shadow:
      4px 4px 0px var(--color-primary-400),
      4px 4px 12px rgba(8, 145, 178, 0.3);
  }

  /* Active press (momentary) */
  .clickdown-card.state-idle:active {
    transform: translate(2px, 2px);
    box-shadow:
      2px 2px 0px var(--color-primary-500),
      2px 2px 4px rgba(8, 145, 178, 0.15);
  }

  /* Selected state - pressed down and stays */
  .clickdown-card.state-selected {
    transform: translate(4px, 4px);
    box-shadow: 0px 0px 0px var(--color-primary-500);
    background: linear-gradient(145deg, var(--color-primary-100) 0%, var(--color-primary-200) 100%);
    border-color: var(--color-primary-600);
  }

  /* Cracking state */
  .clickdown-card.state-cracking {
    transform: translate(4px, 4px);
    box-shadow: 0px 0px 0px var(--color-primary-500);
    pointer-events: none;
    animation: shake-crack 0.4s ease-out;
  }

  @keyframes shake-crack {
    0%, 100% { transform: translate(4px, 4px); }
    10% { transform: translate(1px, 4px) rotate(-1deg); }
    20% { transform: translate(7px, 4px) rotate(1deg); }
    30% { transform: translate(1px, 4px) rotate(-1deg); }
    40% { transform: translate(7px, 4px) rotate(1deg); }
    50% { transform: translate(2px, 4px); }
    60% { transform: translate(6px, 4px); }
    70% { transform: translate(3px, 4px); }
    80% { transform: translate(5px, 4px); }
  }

  /* Deactivated state - uses success gold tint */
  .clickdown-card.state-deactivated {
    opacity: 0.55;
    filter: grayscale(40%);
    transform: translate(4px, 4px);
    box-shadow: 0px 0px 0px var(--color-neutral-300);
    pointer-events: none;
    cursor: default;
    border-color: var(--color-gem-400);
    background: linear-gradient(145deg, var(--color-gem-50) 0%, var(--color-neutral-100) 100%);
  }

  /* Success checkmark badge - emerald green */
  .checkmark-badge {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 24px;
    height: 24px;
    background: linear-gradient(135deg, var(--color-gem-500) 0%, var(--color-gem-600) 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow:
      0 2px 8px rgba(5, 150, 105, 0.4),
      2px 2px 0px var(--color-gem-700);
    animation: pop-in 0.3s var(--transition-bounce);
    z-index: 3;
  }

  .checkmark-badge svg {
    width: 14px;
    height: 14px;
  }

  @keyframes pop-in {
    0% {
      transform: scale(0);
      opacity: 0;
    }
    50% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  /* Dark mode - Persian Night */
  :global([data-theme="dark"]) .clickdown-card {
    background: linear-gradient(145deg, var(--color-neutral-100) 0%, var(--color-neutral-200) 100%);
    border-color: var(--color-primary-400);
    color: var(--color-neutral-900);
    box-shadow:
      4px 4px 0px var(--color-primary-400),
      4px 4px 8px rgba(34, 211, 238, 0.15);
  }

  :global([data-theme="dark"]) .clickdown-card.state-idle:hover {
    background: linear-gradient(145deg, var(--color-primary-900) 0%, var(--color-primary-800) 100%);
    border-color: var(--color-primary-300);
    box-shadow:
      4px 4px 0px var(--color-primary-300),
      4px 4px 12px rgba(34, 211, 238, 0.25);
  }

  :global([data-theme="dark"]) .clickdown-card.state-selected {
    background: linear-gradient(145deg, var(--color-primary-800) 0%, var(--color-primary-700) 100%);
    border-color: var(--color-primary-400);
  }

  :global([data-theme="dark"]) .clickdown-card.state-deactivated {
    background: linear-gradient(145deg, var(--color-neutral-200) 0%, var(--color-neutral-300) 100%);
    border-color: var(--color-gem-500);
    box-shadow: 0px 0px 0px var(--color-neutral-400);
  }

  /* Accessibility */
  .clickdown-card:focus-visible {
    outline: 2px solid var(--color-primary-400);
    outline-offset: 2px;
  }

  .clickdown-card:disabled {
    cursor: default;
  }
</style>
