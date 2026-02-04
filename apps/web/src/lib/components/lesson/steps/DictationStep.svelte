<script lang="ts">
  import type { DictationStep } from "@pkg/content-model";
  import { createEventDispatcher } from "svelte";
  import { playGerman, stopAudio } from "$lib/utils/audio";

  export let step: DictationStep;
  export let lessonId: string = '';

  const dispatch = createEventDispatcher<{ answer: { correct: boolean; allowContinue: boolean; userAnswer?: string; correctAnswer?: string } }>();

  // Difficulty configuration
  const DICTATION_CONFIG = {
    A1: {
      maxRepeats: 99,
      showTranslation: true,
      showFirstLetter: true,
      playbackSpeed: 0.85,
      acceptThreshold: 0.7,
    },
    A2: {
      maxRepeats: 5,
      showTranslation: true,
      showFirstLetter: false,
      playbackSpeed: 0.9,
      acceptThreshold: 0.8,
    },
    B1: {
      maxRepeats: 3,
      showTranslation: false,
      showFirstLetter: false,
      playbackSpeed: 1.0,
      acceptThreshold: 0.9,
    },
    B2: {
      maxRepeats: 1,
      showTranslation: false,
      showFirstLetter: false,
      playbackSpeed: 1.0,
      acceptThreshold: 0.95,
    },
  };

  $: difficulty = step.difficulty || 'A1';
  $: config = DICTATION_CONFIG[difficulty];
  $: maxRepeats = step.maxRepeats ?? config.maxRepeats;
  $: showHints = step.showHints ?? config.showTranslation;

  let userInput = '';
  let repeatCount = 0;
  let showFeedback = false;
  let isCorrect = false;
  let isPlaying = false;

  async function playAudio() {
    if (repeatCount >= maxRepeats || isPlaying) return;

    repeatCount++;
    isPlaying = true;

    try {
      await playGerman(step.targetText, lessonId, step.audioId || `${step.id}-audio`);
    } catch (e) {
      console.error('Error playing audio:', e);
    } finally {
      isPlaying = false;
    }
  }

  function checkAnswer() {
    // Normalize both strings for comparison (ignore punctuation and case)
    const normalizedInput = normalizeText(userInput);
    const normalizedTarget = normalizeText(step.targetText);

    // Check for exact match (after normalization)
    isCorrect = normalizedInput === normalizedTarget;

    // Track if only punctuation is different (for showing "پاسخ کامل")
    const onlyPunctuationDiff = isCorrect && userInput.trim() !== step.targetText;

    showFeedback = true;

    dispatch('answer', {
      correct: isCorrect,
      userAnswer: userInput,
      correctAnswer: step.targetText,
      allowContinue: isCorrect,
    });
  }

  // Normalize text: remove punctuation, normalize whitespace (KEEP capitalization for German!)
  // German capitalization rules are important:
  // - First letter of sentence must be capital
  // - All nouns must be capitalized
  // - Formal "Sie" (you) must be capitalized (vs "sie" = they)
  function normalizeText(text: string): string {
    return text
      .replace(/[.!?،؟]+/g, '') // Remove common punctuation (German and Persian)
      .replace(/\s+/g, ' ')     // Normalize whitespace
      .trim();                   // Trim AFTER punctuation removal to catch "auch !" → "auch " → "auch"
  }

  function retry() {
    showFeedback = false;
    userInput = '';
    isCorrect = false;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && userInput.trim() && !showFeedback) {
      checkAnswer();
    }
  }
</script>

<div class="dictation-container" dir="rtl">
  <h2 class="step-title">🎧 بنویسید چه شنیدید</h2>

  <!-- Audio Player -->
  <div class="audio-section">
    <button
      class="play-btn"
      class:playing={isPlaying}
      on:click={playAudio}
      disabled={repeatCount >= maxRepeats || isPlaying}
    >
      {#if isPlaying}
        <span class="btn-icon">🔊</span>
        <span>در حال پخش...</span>
      {:else if repeatCount === 0}
        <span class="btn-icon">🔊</span>
        <span>پخش صدا</span>
      {:else if repeatCount < maxRepeats}
        <span class="btn-icon">🔄</span>
        <span>پخش مجدد ({maxRepeats - repeatCount} باقی)</span>
      {:else}
        <span class="btn-icon">🚫</span>
        <span>پایان تکرار</span>
      {/if}
    </button>

    {#if difficulty !== 'A1'}
      <span class="difficulty-badge">سطح: {difficulty}</span>
    {/if}
  </div>

  <!-- Hints (level-dependent) -->
  <div class="hints-section">
    {#if showHints}
      <p class="hint translation">💡 معنی: {step.translation}</p>
    {/if}
    {#if config.showFirstLetter && step.targetText.length > 0}
      <p class="hint first-letter">🔤 حرف اول: <strong dir="ltr">{step.targetText[0]}...</strong></p>
    {/if}
  </div>

  <!-- Input Field -->
  <div class="input-section">
    <input
      type="text"
      bind:value={userInput}
      on:keydown={handleKeydown}
      placeholder="اینجا بنویسید..."
      class="dictation-input"
      class:correct={showFeedback && isCorrect}
      class:wrong={showFeedback && !isCorrect}
      disabled={showFeedback && isCorrect}
      dir="ltr"
    />
  </div>

  <!-- Submit Button -->
  {#if !showFeedback}
    <button
      class="check-btn"
      on:click={checkAnswer}
      disabled={!userInput.trim()}
    >
      بررسی پاسخ
    </button>
  {/if}

  <!-- Feedback -->
  {#if showFeedback}
    <div class="feedback" class:correct={isCorrect} class:wrong={!isCorrect}>
      {#if isCorrect}
        <div class="feedback-header">
          <span class="feedback-icon">✅</span>
          <p class="result">آفرین!</p>
        </div>
        {#if userInput.trim() !== step.targetText}
          <p class="correct-answer" dir="ltr">پاسخ کامل: <strong>{step.targetText}</strong></p>
        {/if}
      {:else}
        <div class="feedback-header">
          <span class="feedback-icon">❌</span>
          <p class="result">اشتباه!</p>
        </div>
        <p class="correct-answer" dir="ltr">پاسخ صحیح: <strong>{step.targetText}</strong></p>
        <p class="translation-hint">معنی: {step.translation}</p>
        <button class="retry-btn" on:click={retry}>
          🔄 تلاش مجدد
        </button>
      {/if}
    </div>
  {/if}
</div>

<style>
  .dictation-container {
    display: flex;
    flex-direction: column;
    gap: var(--space-4, 1rem);
    max-width: 100%;
  }

  .step-title {
    font-size: var(--text-xl, 1.25rem);
    font-weight: var(--font-bold, 700);
    color: var(--color-neutral-800, #292524);
    text-align: center;
    margin-bottom: var(--space-2, 0.5rem);
  }

  /* Audio Section */
  .audio-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2, 0.5rem);
  }

  .play-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2, 0.5rem);
    width: 100%;
    max-width: 300px;
    padding: var(--space-4, 1rem) var(--space-6, 1.5rem);
    background: linear-gradient(135deg, var(--color-primary-500, #06b6d4), var(--color-primary-600, #0891b2));
    color: white;
    border: none;
    border-radius: var(--radius-xl, 1rem);
    font-size: var(--text-lg, 1.125rem);
    font-weight: var(--font-semibold, 600);
    cursor: pointer;
    transition: all var(--transition-normal, 200ms);
    box-shadow: 0 4px 15px rgba(6, 182, 212, 0.3);
  }

  .play-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(6, 182, 212, 0.4);
  }

  .play-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .play-btn.playing {
    background: linear-gradient(135deg, #8b5cf6, #6366f1);
    animation: pulse 1.5s infinite;
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.02); }
  }

  .btn-icon {
    font-size: 1.3rem;
  }

  .difficulty-badge {
    padding: 0.25rem 0.75rem;
    background: rgba(139, 92, 246, 0.1);
    color: #6366f1;
    border-radius: var(--radius-full, 9999px);
    font-size: var(--text-sm, 0.875rem);
    font-weight: 600;
  }

  /* Hints Section */
  .hints-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-2, 0.5rem);
    padding: var(--space-3, 0.75rem);
    background: rgba(250, 204, 21, 0.1);
    border-radius: var(--radius-lg, 0.75rem);
    border: 1px dashed #facc15;
  }

  .hint {
    font-size: var(--text-base, 1rem);
    color: #78350f;
    margin: 0;
  }

  .hint strong {
    color: var(--color-primary-600, #0891b2);
    font-family: monospace;
    font-size: 1.1em;
  }

  /* Input Section */
  .input-section {
    width: 100%;
  }

  .dictation-input {
    width: 100%;
    padding: var(--space-4, 1rem);
    font-size: var(--text-xl, 1.25rem);
    border: 2px solid var(--color-neutral-300, #d4c9b9);
    border-radius: var(--radius-lg, 0.75rem);
    background: white;
    text-align: center;
    font-family: inherit;
    transition: all var(--transition-normal, 200ms);
  }

  .dictation-input:focus {
    outline: none;
    border-color: var(--color-primary-500, #06b6d4);
    box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.2);
  }

  .dictation-input.correct {
    border-color: var(--color-gem-500, #10b981);
    background: rgba(16, 185, 129, 0.05);
  }

  .dictation-input.wrong {
    border-color: var(--color-error-500, #ef4444);
    background: rgba(239, 68, 68, 0.05);
  }

  .dictation-input::placeholder {
    color: var(--color-neutral-400, #a69b8a);
  }

  /* Check Button */
  .check-btn {
    padding: var(--space-4, 1rem) var(--space-8, 2rem);
    background: linear-gradient(135deg, var(--color-gem-500, #10b981), var(--color-gem-600, #059669));
    color: white;
    border: none;
    border-radius: var(--radius-full, 9999px);
    font-size: var(--text-base, 1rem);
    font-weight: var(--font-semibold, 600);
    cursor: pointer;
    align-self: center;
    transition: all var(--transition-normal, 200ms);
    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
  }

  .check-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
  }

  .check-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Feedback */
  .feedback {
    padding: var(--space-4, 1rem);
    border-radius: var(--radius-xl, 1rem);
    text-align: center;
  }

  .feedback.correct {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05));
    border: 2px solid var(--color-gem-400, #34d399);
  }

  .feedback.wrong {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05));
    border: 2px solid var(--color-error-400, #f87171);
  }

  .feedback-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2, 0.5rem);
    margin-bottom: var(--space-2, 0.5rem);
  }

  .feedback-icon {
    font-size: 1.5rem;
  }

  .result {
    font-size: var(--text-lg, 1.125rem);
    font-weight: var(--font-bold, 700);
    margin: 0;
  }

  .feedback.correct .result {
    color: var(--color-gem-700, #047857);
  }

  .feedback.wrong .result {
    color: var(--color-error-700, #b91c1c);
  }

  .correct-answer {
    font-size: var(--text-base, 1rem);
    color: var(--color-neutral-700, #44403c);
    margin: var(--space-2, 0.5rem) 0;
  }

  .correct-answer strong {
    color: var(--color-primary-600, #0891b2);
    font-size: 1.1em;
  }

  .translation-hint {
    font-size: var(--text-sm, 0.875rem);
    color: var(--color-neutral-500, #78716c);
    margin: var(--space-2, 0.5rem) 0;
  }

  .retry-btn {
    margin-top: var(--space-3, 0.75rem);
    padding: var(--space-3, 0.75rem) var(--space-6, 1.5rem);
    background: linear-gradient(135deg, var(--color-error-500, #ef4444), var(--color-error-600, #dc2626));
    color: white;
    border: none;
    border-radius: var(--radius-full, 9999px);
    font-size: var(--text-base, 1rem);
    font-weight: var(--font-semibold, 600);
    cursor: pointer;
    transition: all var(--transition-normal, 200ms);
  }

  .retry-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
  }

  /* Dark Mode */
  :global([data-theme="dark"]) .step-title {
    color: #f5f0e8;
  }

  :global([data-theme="dark"]) .hints-section {
    background: rgba(250, 204, 21, 0.1);
    border-color: #854d0e;
  }

  :global([data-theme="dark"]) .hint {
    color: #fef08a;
  }

  :global([data-theme="dark"]) .dictation-input {
    background: #44403c;
    border-color: #57534e;
    color: #f5f0e8;
  }

  :global([data-theme="dark"]) .dictation-input:focus {
    border-color: #22d3ee;
    box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.2);
  }

  :global([data-theme="dark"]) .dictation-input::placeholder {
    color: #78716c;
  }

  :global([data-theme="dark"]) .feedback.correct {
    background: rgba(16, 185, 129, 0.15);
    border-color: #34d399;
  }

  :global([data-theme="dark"]) .feedback.wrong {
    background: rgba(239, 68, 68, 0.15);
    border-color: #f87171;
  }

  :global([data-theme="dark"]) .feedback.correct .result {
    color: #6ee7b7;
  }

  :global([data-theme="dark"]) .feedback.wrong .result {
    color: #fca5a5;
  }

  :global([data-theme="dark"]) .correct-answer {
    color: #d4c9b9;
  }

  :global([data-theme="dark"]) .correct-answer strong {
    color: #22d3ee;
  }

  :global([data-theme="dark"]) .translation-hint {
    color: #a69b8a;
  }

  :global([data-theme="dark"]) .difficulty-badge {
    background: rgba(139, 92, 246, 0.2);
    color: #a5b4fc;
  }
</style>
