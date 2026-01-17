<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import GlassCrackOverlay from './GlassCrackOverlay.svelte';

  export let id: string;
  export let text: string;
  export let language: 'de' | 'fa';
  export let state: 'idle' | 'selected' | 'cracking' | 'deactivated' = 'idle';

  const dispatch = createEventDispatcher<{ select: { id: string } }>();

  let audioContext: AudioContext | null = null;

  // Synthesize a realistic glass crack/shatter sound using Web Audio API
  function playGlassCrackSound() {
    try {
      // Create or resume audio context
      if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      const now = audioContext.currentTime;
      const duration = 0.4;

      // Master gain for overall volume
      const masterGain = audioContext.createGain();
      masterGain.connect(audioContext.destination);
      masterGain.gain.setValueAtTime(0.25, now);
      masterGain.gain.exponentialDecayTo?.(0.01, now + duration) ||
        masterGain.gain.exponentialRampToValueAtTime(0.01, now + duration);

      // Layer 1: Initial sharp crack (noise burst with high-pass filter)
      const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.15, audioContext.sampleRate);
      const noiseData = noiseBuffer.getChannelData(0);
      for (let i = 0; i < noiseData.length; i++) {
        // Sharp attack, quick decay
        const envelope = Math.exp(-i / (audioContext.sampleRate * 0.02));
        noiseData[i] = (Math.random() * 2 - 1) * envelope;
      }

      const noiseSource = audioContext.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const highPass = audioContext.createBiquadFilter();
      highPass.type = 'highpass';
      highPass.frequency.setValueAtTime(2000, now);
      highPass.Q.setValueAtTime(1, now);

      const noiseGain = audioContext.createGain();
      noiseGain.gain.setValueAtTime(1, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

      noiseSource.connect(highPass);
      highPass.connect(noiseGain);
      noiseGain.connect(masterGain);
      noiseSource.start(now);

      // Layer 2: Glass resonance (high frequency sine tones)
      const frequencies = [3200, 4800, 6400, 8000];
      frequencies.forEach((freq, i) => {
        const osc = audioContext!.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq + Math.random() * 200, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.7, now + 0.15);

        const oscGain = audioContext!.createGain();
        oscGain.gain.setValueAtTime(0.08 - i * 0.015, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15 + i * 0.02);

        osc.connect(oscGain);
        oscGain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.2);
      });

      // Layer 3: Tinkling shards (delayed high pings)
      for (let i = 0; i < 5; i++) {
        const delay = 0.05 + Math.random() * 0.15;
        const pingOsc = audioContext.createOscillator();
        pingOsc.type = 'sine';
        pingOsc.frequency.setValueAtTime(5000 + Math.random() * 4000, now + delay);

        const pingGain = audioContext.createGain();
        pingGain.gain.setValueAtTime(0, now);
        pingGain.gain.setValueAtTime(0.04, now + delay);
        pingGain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.08);

        pingOsc.connect(pingGain);
        pingGain.connect(masterGain);
        pingOsc.start(now + delay);
        pingOsc.stop(now + delay + 0.1);
      }

    } catch (e) {
      // Audio not supported, fail silently
      console.warn('Audio not supported:', e);
    }
  }

  function handleClick() {
    if (state === 'idle') {
      dispatch('select', { id });
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if ((e.key === 'Enter' || e.key === ' ') && state === 'idle') {
      e.preventDefault();
      dispatch('select', { id });
    }
  }

  // Play crack sound when cracking starts
  $: if (state === 'cracking') {
    playGlassCrackSound();
  }

  $: cardClasses = [
    'burn-card',
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

  {#if state === 'selected'}
    <div class="selection-ring"></div>
  {/if}
</button>

<style>
  .burn-card {
    position: relative;
    width: 100%;
    aspect-ratio: 1.4;
    min-height: 70px;
    max-height: 90px;
    padding: var(--space-3);
    border-radius: var(--radius-xl);
    border: 2px solid var(--color-neutral-200);
    background: var(--color-neutral-50);
    cursor: pointer;
    font-family: var(--font-sans);
    font-size: var(--text-base);
    font-weight: var(--font-semibold);
    color: var(--color-neutral-800);
    display: flex;
    align-items: center;
    justify-content: center;
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease,
      background-color 0.2s ease,
      border-color 0.2s ease,
      opacity 0.3s ease,
      filter 0.3s ease;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    overflow: hidden;
  }

  /* Language-specific styling */
  .burn-card.lang-de {
    font-size: var(--text-base);
  }

  .burn-card.lang-fa {
    font-size: var(--text-lg);
  }

  .card-text {
    position: relative;
    z-index: 2;
    text-align: center;
    line-height: var(--leading-tight);
    word-break: break-word;
  }

  /* Idle state */
  .burn-card.state-idle:hover {
    border-color: var(--color-primary-300);
    background: var(--color-primary-50);
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  .burn-card.state-idle:active {
    transform: scale(0.98);
  }

  /* Selected state */
  .burn-card.state-selected {
    border-color: var(--color-primary-500);
    background: var(--color-primary-100);
    box-shadow: var(--shadow-primary), 0 0 0 4px var(--color-primary-100);
    transform: scale(1.05);
  }

  .selection-ring {
    position: absolute;
    inset: -4px;
    border: 2px solid var(--color-primary-400);
    border-radius: calc(var(--radius-xl) + 4px);
    animation: pulse-ring 1s ease-out infinite;
    pointer-events: none;
  }

  @keyframes pulse-ring {
    0% {
      opacity: 1;
      transform: scale(1);
    }
    100% {
      opacity: 0;
      transform: scale(1.1);
    }
  }

  /* Cracking state */
  .burn-card.state-cracking {
    pointer-events: none;
    animation: shake-crack 0.4s ease-out;
  }

  @keyframes shake-crack {
    0%, 100% { transform: translateX(0); }
    10% { transform: translateX(-3px) rotate(-1deg); }
    20% { transform: translateX(3px) rotate(1deg); }
    30% { transform: translateX(-3px) rotate(-1deg); }
    40% { transform: translateX(3px) rotate(1deg); }
    50% { transform: translateX(-2px); }
    60% { transform: translateX(2px); }
    70% { transform: translateX(-1px); }
    80% { transform: translateX(1px); }
  }

  /* Deactivated state */
  .burn-card.state-deactivated {
    opacity: 0.45;
    filter: grayscale(60%);
    transform: scale(0.95);
    pointer-events: none;
    cursor: default;
    border-color: var(--color-neutral-300);
    background: var(--color-neutral-100);
  }

  /* Success checkmark badge */
  .checkmark-badge {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 24px;
    height: 24px;
    background: var(--color-gem-500);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: 0 2px 8px rgba(5, 150, 105, 0.4);
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

  /* Dark mode */
  :global([data-theme="dark"]) .burn-card {
    background: var(--color-neutral-100);
    border-color: var(--color-neutral-300);
    color: var(--color-neutral-900);
  }

  :global([data-theme="dark"]) .burn-card.state-idle:hover {
    background: var(--color-primary-900);
    border-color: var(--color-primary-600);
  }

  :global([data-theme="dark"]) .burn-card.state-selected {
    background: var(--color-primary-800);
    border-color: var(--color-primary-500);
  }

  :global([data-theme="dark"]) .burn-card.state-deactivated {
    background: var(--color-neutral-200);
    border-color: var(--color-neutral-400);
  }

  /* Accessibility */
  .burn-card:focus-visible {
    outline: 2px solid var(--color-primary-500);
    outline-offset: 2px;
  }

  .burn-card:disabled {
    cursor: default;
  }
</style>
