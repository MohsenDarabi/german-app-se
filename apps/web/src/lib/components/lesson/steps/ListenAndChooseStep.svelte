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
    gap: 1.5rem;
  }

  .instruction {
    font-size: 1.3rem;
    font-weight: 700;
    color: #1e293b;
    text-align: center;
    margin: 0;
  }

  /* Audio Section */
  .audio-section {
    display: flex;
    justify-content: center;
    padding: 1rem 0;
  }

  .play-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1.5rem 3rem;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    border: none;
    border-radius: 1rem;
    color: white;
    cursor: pointer;
    transition: all 0.2s;
  }

  .play-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
  }

  .play-btn:active {
    transform: scale(0.98);
  }

  .play-btn.playing {
    background: linear-gradient(135deg, #f59e0b, #d97706);
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
    font-size: 1rem;
    font-weight: 600;
  }

  /* Options */
  .options-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .option-btn {
    padding: 1rem 1.25rem;
    border: 2px solid #e2e8f0;
    border-radius: 0.75rem;
    background: white;
    font-size: 1.1rem;
    color: #334155;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .option-btn:hover:not(.disabled) {
    border-color: #3b82f6;
    background: #eff6ff;
  }

  .option-btn.correct {
    border-color: #22c55e;
    background: #f0fdf4;
    color: #15803d;
    font-weight: 600;
  }

  .option-btn.wrong {
    border-color: #ef4444;
    background: #fef2f2;
    color: #b91c1c;
  }

  .option-btn.disabled {
    cursor: default;
  }

  .option-text {
    flex: 1;
  }

  .icon {
    font-size: 1.2rem;
    margin-left: 0.5rem;
  }

  /* Translation */
  .translation-box {
    padding: 1rem 1.25rem;
    background: #f0fdf4;
    border: 2px solid #22c55e;
    border-radius: 0.75rem;
    display: flex;
    gap: 0.5rem;
  }

  .translation-label {
    font-weight: 600;
    color: #15803d;
  }

  .translation-text {
    color: #166534;
  }

  /* Retry */
  .retry-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    background: #fef2f2;
    border: 2px solid #fecaca;
    border-radius: 0.75rem;
  }

  .feedback-text {
    color: #b91c1c;
    font-weight: 600;
    text-align: center;
    margin: 0;
  }

  .retry-btn {
    padding: 0.75rem 2rem;
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 999px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }

  .retry-btn:hover {
    background: #dc2626;
  }
</style>
