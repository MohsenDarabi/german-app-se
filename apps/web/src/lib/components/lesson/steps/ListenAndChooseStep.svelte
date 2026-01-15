<script lang="ts">
  import type { ListenAndChooseStep } from "$lib/content-model";
  import { createEventDispatcher, onMount, onDestroy } from "svelte";
  import { playGerman, stopAudio } from '$lib/utils/audio';

  export let step: ListenAndChooseStep;
  export let lessonId: string = '';

  const dispatch = createEventDispatcher<{
    answer: { correct: boolean; userAnswer: string; correctAnswer: string; allowContinue: boolean };
  }>();

  let selectedIndex: number | null = null;
  let isAnswered = false;
  let canRetry = false;
  let isPlaying = false;
  let hasPlayed = false;
  let mounted = false;
  let autoPlayTimer: ReturnType<typeof setTimeout> | null = null;
  let currentStepId = '';

  $: correctAnswer = step.correctAnswerIndex;

  // Handle step initialization
  function initStep(stepId: string) {
    if (currentStepId === stepId) return; // Already initialized
    currentStepId = stepId;

    selectedIndex = null;
    isAnswered = false;
    canRetry = false;
    hasPlayed = false;
    isPlaying = false;

    // Clear any pending auto-play timer
    if (autoPlayTimer) {
      clearTimeout(autoPlayTimer);
      autoPlayTimer = null;
    }

    // Auto-play with delay
    if (step.autoPlay && mounted) {
      autoPlayTimer = setTimeout(() => {
        autoPlayTimer = null;
        if (!isAnswered && !isPlaying && currentStepId === stepId) {
          playAudio();
        }
      }, 600);
    }
  }

  // Watch for step changes (only after mount)
  $: if (mounted && step.id) {
    initStep(step.id);
  }

  onMount(() => {
    mounted = true;
    initStep(step.id);
  });

  onDestroy(() => {
    mounted = false;
    if (autoPlayTimer) {
      clearTimeout(autoPlayTimer);
    }
    stopAudio();
  });

  async function playAudio() {
    if (isPlaying) {
      stopAudio();
      isPlaying = false;
      return;
    }

    isPlaying = true;
    hasPlayed = true;
    try {
      await playGerman(step.germanText, lessonId);
    } finally {
      isPlaying = false;
    }
  }

  function selectOption(index: number) {
    if (isAnswered) return;

    selectedIndex = index;
    isAnswered = true;

    const isCorrect = index === correctAnswer;

    if (!isCorrect) {
      canRetry = true;
    }

    dispatch('answer', {
      correct: isCorrect,
      userAnswer: step.options[index],
      correctAnswer: step.options[correctAnswer],
      allowContinue: isCorrect
    });
  }

  function retry() {
    selectedIndex = null;
    isAnswered = false;
    canRetry = false;
  }
</script>

<div class="listen-choose-container">
  <!-- Instruction -->
  <h2 class="instruction" dir="rtl">{step.instruction || 'چه شنیدید؟'}</h2>

  <!-- Large Audio Button -->
  <div class="audio-section">
    <button
      class="play-btn"
      class:playing={isPlaying}
      on:click={playAudio}
      title={isPlaying ? 'توقف' : 'پخش صدا'}
    >
      {#if isPlaying}
        <span class="play-icon">&#9632;</span>
        <span class="play-text">در حال پخش...</span>
      {:else}
        <span class="play-icon">&#128266;</span>
        <span class="play-text">{hasPlayed ? 'پخش مجدد' : 'پخش صدا'}</span>
      {/if}
    </button>
  </div>

  <!-- Options -->
  <div class="options-list">
    {#each step.options as option, i (i)}
      <button
        class="option-btn"
        class:selected={selectedIndex === i}
        class:correct={isAnswered && i === correctAnswer}
        class:wrong={isAnswered && selectedIndex === i && i !== correctAnswer}
        class:disabled={isAnswered}
        on:click={() => selectOption(i)}
        disabled={isAnswered}
      >
        <span class="option-text">{option}</span>

        {#if isAnswered && i === correctAnswer}
          <span class="icon">&#9989;</span>
        {:else if isAnswered && selectedIndex === i && i !== correctAnswer}
          <span class="icon">&#10060;</span>
        {/if}
      </button>
    {/each}
  </div>

  <!-- Translation (shown after correct answer) -->
  {#if isAnswered && selectedIndex === correctAnswer && step.translation}
    <div class="translation-box" dir="rtl">
      <span class="translation-label">ترجمه:</span>
      <span class="translation-text">{step.translation}</span>
    </div>
  {/if}

  <!-- Retry section -->
  {#if canRetry}
    <div class="retry-section">
      <p class="feedback-text" dir="rtl">&#10060; دوباره امتحان کنید! پاسخ صحیح بالا مشخص شده است.</p>
      <button class="retry-btn" on:click={retry}>
        &#128260; تلاش مجدد
      </button>
    </div>
  {/if}
</div>

<style>
  .listen-choose-container {
    display: flex;
    flex-direction: column;
    gap: var(--space-6, 1.5rem);
  }

  .instruction {
    font-size: var(--text-xl, 1.25rem);
    font-weight: var(--font-bold, 700);
    color: var(--color-neutral-800, #292524);
    text-align: center;
    margin: 0;
  }

  /* Audio Section */
  .audio-section {
    display: flex;
    justify-content: center;
    padding: var(--space-4, 1rem) 0;
  }

  .play-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2, 0.5rem);
    padding: var(--space-6, 1.5rem) var(--space-8, 2rem);
    background: linear-gradient(135deg, var(--color-primary-500, #0891b2), var(--color-primary-600, #0e7490));
    border: none;
    border-radius: var(--radius-xl, 1rem);
    color: white;
    cursor: pointer;
    transition: all var(--transition-normal, 200ms);
    box-shadow: 0 4px 20px rgba(8, 145, 178, 0.3);
    min-width: 180px;
  }

  .play-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 25px rgba(8, 145, 178, 0.4);
  }

  .play-btn:active {
    transform: scale(0.98);
  }

  .play-btn.playing {
    background: linear-gradient(135deg, var(--color-streak, #f59e0b), var(--color-streak-light, #fbbf24));
    box-shadow: 0 4px 20px var(--color-streak-glow, rgba(245, 158, 11, 0.4));
    animation: pulse 1s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
  }

  .play-icon {
    font-size: 2.5rem;
  }

  .play-text {
    font-size: var(--text-base, 1rem);
    font-weight: var(--font-semibold, 600);
  }

  /* Options */
  .options-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-3, 0.75rem);
  }

  .option-btn {
    padding: var(--space-4, 1rem) var(--space-4, 1rem);
    border: 2px solid var(--glass-border, rgba(212, 201, 185, 0.5));
    border-radius: var(--radius-lg, 0.75rem);
    background: var(--glass-bg, rgba(253, 251, 247, 0.95));
    font-size: var(--text-lg, 1.125rem);
    color: var(--color-neutral-700, #44403c);
    cursor: pointer;
    transition: all var(--transition-normal, 200ms);
    text-align: left;
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: 56px;
  }

  .option-btn:hover:not(.disabled) {
    border-color: var(--color-primary-400, #22d3ee);
    background: var(--color-primary-50, #ecfeff);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md, 0 4px 15px rgba(0, 0, 0, 0.08));
  }

  .option-btn.correct {
    border-color: var(--color-gem-400, #34d399);
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05));
    color: var(--color-gem-700, #047857);
    font-weight: var(--font-semibold, 600);
  }

  .option-btn.wrong {
    border-color: var(--color-error-400, #c84b4b);
    background: linear-gradient(135deg, rgba(169, 30, 30, 0.1), rgba(169, 30, 30, 0.05));
    color: var(--color-error-600, #8b1a1a);
  }

  .option-btn.disabled {
    cursor: default;
  }

  .option-text {
    flex: 1;
  }

  .icon {
    font-size: 1.2rem;
    margin-left: var(--space-2, 0.5rem);
  }

  /* Translation */
  .translation-box {
    padding: var(--space-4, 1rem) var(--space-4, 1rem);
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05));
    border: 2px solid var(--color-gem-400, #34d399);
    border-radius: var(--radius-lg, 0.75rem);
    display: flex;
    gap: var(--space-2, 0.5rem);
  }

  .translation-label {
    font-weight: var(--font-semibold, 600);
    color: var(--color-gem-700, #047857);
  }

  .translation-text {
    color: var(--color-gem-800, #065f46);
  }

  /* Retry */
  .retry-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-4, 1rem);
    padding: var(--space-6, 1.5rem);
    background: linear-gradient(135deg, rgba(169, 30, 30, 0.1), rgba(169, 30, 30, 0.05));
    border: 2px solid var(--color-error-400, #c84b4b);
    border-radius: var(--radius-lg, 0.75rem);
  }

  .feedback-text {
    color: var(--color-error-600, #8b1a1a);
    font-weight: var(--font-semibold, 600);
    text-align: center;
    margin: 0;
  }

  .retry-btn {
    padding: var(--space-3, 0.75rem) var(--space-8, 2rem);
    background: linear-gradient(135deg, var(--color-error-500, #a91e1e), var(--color-error-600, #8b1a1a));
    color: white;
    border: none;
    border-radius: var(--radius-full, 9999px);
    font-size: var(--text-base, 1rem);
    font-weight: var(--font-semibold, 600);
    cursor: pointer;
    transition: all var(--transition-normal, 200ms);
    min-height: 44px;
  }

  .retry-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(169, 30, 30, 0.3);
  }

  /* Dark Mode */
  :global([data-theme="dark"]) .instruction {
    color: var(--color-neutral-100, #f5f0e8);
  }

  :global([data-theme="dark"]) .option-btn {
    background: rgba(28, 25, 23, 0.95);
    color: var(--color-neutral-200, #e8e0d5);
  }

  :global([data-theme="dark"]) .translation-text {
    color: var(--color-gem-300, #6ee7b7);
  }
</style>
