<script lang="ts">
  import type { SyllableSpellingStep } from "@pkg/content-model";
  import { createEventDispatcher, onMount } from "svelte";
  import BiDiText from "$lib/components/ui/BiDiText.svelte";
  import AudioButton from "$lib/components/ui/AudioButton.svelte";

  export let step: SyllableSpellingStep;
  export let lessonId: string = '';

  const dispatch = createEventDispatcher<{ answer: { correct: boolean; allowContinue: boolean } }>();

  // State
  let availableSyllables: { syllable: string; id: string; used: boolean }[] = [];
  let selectedSyllables: { syllable: string; id: string }[] = [];
  let isCorrect = false;
  let isWrong = false;
  let canRetry = false;

  onMount(() => {
    initializeSyllables();
  });

  function initializeSyllables() {
    // Combine correct syllables with distractors
    const allSyllables = [...step.syllables];

    if (step.distractors) {
      allSyllables.push(...step.distractors);
    }

    // Shuffle and create syllable objects
    availableSyllables = shuffleArray(allSyllables).map((syllable, index) => ({
      syllable,
      id: `${syllable}-${index}`,
      used: false
    }));
  }

  function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  function selectSyllable(syllableObj: { syllable: string; id: string; used: boolean }) {
    if (syllableObj.used || isCorrect) return;

    // Mark as used
    availableSyllables = availableSyllables.map(s =>
      s.id === syllableObj.id ? { ...s, used: true } : s
    );

    // Add to selected
    selectedSyllables = [...selectedSyllables, { syllable: syllableObj.syllable, id: syllableObj.id }];

    // Check if we have enough syllables (could be correct or wrong)
    if (selectedSyllables.length === step.syllables.length) {
      checkAnswer();
    }
  }

  function removeSyllable(index: number) {
    if (isCorrect) return;

    const removed = selectedSyllables[index];

    // Return to available
    availableSyllables = availableSyllables.map(s =>
      s.id === removed.id ? { ...s, used: false } : s
    );

    // Remove from selected
    selectedSyllables = selectedSyllables.filter((_, i) => i !== index);

    // Reset wrong state
    isWrong = false;
    canRetry = false;
  }

  function checkAnswer() {
    const builtWord = selectedSyllables.map(s => s.syllable).join('');
    // Compare without spaces and punctuation (for phrases like "Wie heißt du?")
    const normalizeForComparison = (str: string) => str.replace(/[\s.!?،؟]+/g, '');
    const expectedWord = normalizeForComparison(step.word);
    isCorrect = normalizeForComparison(builtWord) === expectedWord;

    if (isCorrect) {
      dispatch('answer', {
        correct: true,
        allowContinue: true
      });
    } else {
      isWrong = true;
      canRetry = true;
      dispatch('answer', {
        correct: false,
        allowContinue: false
      });
    }
  }

  function retry() {
    // Reset all syllables
    availableSyllables = availableSyllables.map(s => ({ ...s, used: false }));
    selectedSyllables = [];
    isWrong = false;
    canRetry = false;
  }

  function clearAll() {
    availableSyllables = availableSyllables.map(s => ({ ...s, used: false }));
    selectedSyllables = [];
    isWrong = false;
  }
</script>

<div class="syllable-spelling-container">
  <p class="instruction" dir="rtl">
    <BiDiText text={step.instruction || 'قطعات را کنار هم بگذارید'} />
  </p>

  <!-- Translation -->
  <div class="hint-section">
    <p class="translation" dir="rtl">{step.translation}</p>
  </div>

  <!-- Drop zone / answer area -->
  <div class="answer-area" class:correct={isCorrect} class:wrong={isWrong}>
    <div class="syllable-slots">
      {#if selectedSyllables.length === 0}
        <div class="empty-hint">قطعات را انتخاب کنید</div>
      {:else}
        {#each selectedSyllables as syllableObj, i (syllableObj.id)}
          <button
            class="syllable-slot filled"
            on:click={() => removeSyllable(i)}
            disabled={isCorrect}
          >
            {syllableObj.syllable}
          </button>
        {/each}
      {/if}
    </div>

    {#if selectedSyllables.length > 0 && !isCorrect}
      <button class="clear-btn" on:click={clearAll}>پاک کردن</button>
    {/if}
  </div>

  <!-- Available syllables -->
  <div class="syllables-grid">
    {#each availableSyllables as syllableObj (syllableObj.id)}
      <button
        class="syllable-btn"
        class:used={syllableObj.used}
        disabled={syllableObj.used || isCorrect}
        on:click={() => selectSyllable(syllableObj)}
      >
        {syllableObj.syllable}
      </button>
    {/each}
  </div>

  <!-- Feedback -->
  {#if isCorrect}
    <div class="success-section">
      <p class="feedback-text success">آفرین! درست چیدید</p>
      <div class="word-row">
        <span class="correct-word">{step.word}</span>
        <AudioButton
          text={step.word}
          {lessonId}
          audioId="{step.id}-word"
          size="md"
        />
      </div>
      {#if step.feedbackTip?.onCorrect}
        <p class="explanation" dir="rtl"><BiDiText text={step.feedbackTip.onCorrect} /></p>
      {/if}
    </div>
  {/if}

  {#if canRetry}
    <div class="retry-section">
      <p class="feedback-text error">ترتیب درست نیست! دوباره تلاش کنید</p>
      {#if step.feedbackTip?.onWrong}
        <p class="explanation" dir="rtl"><BiDiText text={step.feedbackTip.onWrong} /></p>
      {/if}
      <button class="retry-btn" on:click={retry}>تلاش مجدد</button>
    </div>
  {/if}
</div>

<style>
  .syllable-spelling-container {
    display: flex;
    flex-direction: column;
    gap: var(--space-6, 1.5rem);
    align-items: center;
  }

  .instruction {
    font-size: var(--text-lg, 1.125rem);
    color: var(--color-neutral-500, #78716c);
    text-align: center;
    margin: 0;
  }

  .hint-section {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2, 0.5rem);
  }

  .translation {
    font-size: var(--text-xl, 1.25rem);
    font-weight: var(--font-bold, 700);
    color: var(--color-neutral-800, #292524);
    margin: 0;
  }

  .phonetic-hint {
    font-size: var(--text-base, 1rem);
    color: var(--color-neutral-500, #78716c);
    font-style: italic;
    margin: 0;
  }

  .answer-area {
    width: 100%;
    min-height: 100px;
    padding: var(--space-6, 1.5rem);
    background: var(--glass-bg, rgba(253, 251, 247, 0.85));
    border: 3px dashed var(--color-neutral-300, #d4c9b9);
    border-radius: var(--radius-xl, 1rem);
    backdrop-filter: blur(var(--glass-blur, 12px));
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-4, 1rem);
    transition: all var(--transition-normal, 200ms);
  }

  .answer-area.correct {
    border-color: var(--color-gem-400, #34d399);
    border-style: solid;
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05));
  }

  .answer-area.wrong {
    border-color: var(--color-error-400, #c84b4b);
    border-style: solid;
    background: linear-gradient(135deg, rgba(169, 30, 30, 0.1), rgba(169, 30, 30, 0.05));
    animation: shake 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-8px); }
    40% { transform: translateX(8px); }
    60% { transform: translateX(-6px); }
    80% { transform: translateX(6px); }
  }

  .syllable-slots {
    display: flex;
    gap: var(--space-2, 0.5rem);
    flex-wrap: wrap;
    justify-content: center;
    min-height: 56px;
    align-items: center;
  }

  .empty-hint {
    color: var(--color-neutral-400, #a69b8a);
    font-size: var(--text-base, 1rem);
    font-style: italic;
  }

  .syllable-slot {
    padding: var(--space-3, 0.75rem) var(--space-5, 1.25rem);
    border: 2px solid var(--color-primary-500, #0891b2);
    border-radius: var(--radius-lg, 0.75rem);
    background: linear-gradient(135deg, var(--color-primary-100, #cffafe), var(--color-primary-50, #ecfeff));
    font-size: 1.25rem;
    font-weight: var(--font-bold, 700);
    color: var(--color-primary-700, #155e75);
    cursor: pointer;
    transition: all var(--transition-normal, 200ms);
    box-shadow: 0 2px 8px rgba(8, 145, 178, 0.2);
  }

  .syllable-slot:hover:not(:disabled) {
    background: var(--color-primary-200, #a5f3fc);
    transform: scale(1.05);
  }

  .clear-btn {
    font-size: var(--text-sm, 0.875rem);
    color: var(--color-error-500, #a91e1e);
    background: none;
    border: 1px solid var(--color-error-400, #c84b4b);
    border-radius: var(--radius-md, 0.5rem);
    padding: var(--space-2, 0.5rem) var(--space-4, 1rem);
    cursor: pointer;
    transition: all var(--transition-fast, 150ms);
    min-height: 36px;
  }

  .clear-btn:hover {
    background: linear-gradient(135deg, rgba(169, 30, 30, 0.1), rgba(169, 30, 30, 0.05));
  }

  .syllables-grid {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3, 0.75rem);
    justify-content: center;
    max-width: 400px;
  }

  .syllable-btn {
    padding: var(--space-3, 0.75rem) var(--space-5, 1.25rem);
    border: 2px solid var(--glass-border, rgba(212, 201, 185, 0.5));
    border-radius: var(--radius-lg, 0.75rem);
    background: var(--glass-bg, rgba(253, 251, 247, 0.95));
    font-size: 1.2rem;
    font-weight: var(--font-bold, 700);
    color: var(--color-neutral-700, #44403c);
    cursor: pointer;
    transition: all var(--transition-normal, 200ms);
    box-shadow: var(--shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.04));
    min-width: 70px;
  }

  .syllable-btn:hover:not(:disabled) {
    border-color: var(--color-primary-400, #22d3ee);
    background: var(--color-primary-50, #ecfeff);
    transform: translateY(-3px);
    box-shadow: var(--shadow-md, 0 4px 15px rgba(0, 0, 0, 0.08));
  }

  .syllable-btn:active:not(:disabled) {
    transform: translateY(0) scale(0.95);
  }

  .syllable-btn.used {
    opacity: 0.25;
    cursor: default;
    transform: none;
  }

  .success-section {
    width: 100%;
    padding: var(--space-6, 1.5rem);
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05));
    border: 2px solid var(--color-gem-400, #34d399);
    border-radius: var(--radius-lg, 0.75rem);
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-3, 0.75rem);
  }

  .word-row {
    display: flex;
    align-items: center;
    gap: var(--space-3, 0.75rem);
  }

  .correct-word {
    font-size: var(--text-2xl, 1.5rem);
    font-weight: var(--font-bold, 700);
    color: var(--color-gem-700, #047857);
  }

  .retry-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-3, 0.75rem);
    padding: var(--space-6, 1.5rem);
    background: linear-gradient(135deg, rgba(169, 30, 30, 0.1), rgba(169, 30, 30, 0.05));
    border: 2px solid var(--color-error-400, #c84b4b);
    border-radius: var(--radius-lg, 0.75rem);
    width: 100%;
  }

  .feedback-text {
    font-weight: var(--font-semibold, 600);
    text-align: center;
    margin: 0;
    font-size: var(--text-lg, 1.125rem);
  }

  .feedback-text.success {
    color: var(--color-gem-600, #059669);
  }

  .feedback-text.error {
    color: var(--color-error-600, #8b1a1a);
  }

  .explanation {
    color: var(--color-neutral-500, #78716c);
    font-size: var(--text-sm, 0.875rem);
    text-align: center;
    margin: 0;
    line-height: 1.6;
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
  :global([data-theme="dark"]) .translation {
    color: var(--color-neutral-100, #f5f0e8);
  }

  :global([data-theme="dark"]) .answer-area {
    background: rgba(28, 25, 23, 0.85);
    border-color: var(--color-neutral-600, #57534e);
  }

  :global([data-theme="dark"]) .syllable-slot {
    background: rgba(8, 145, 178, 0.2);
    color: var(--color-primary-300, #67e8f9);
  }

  :global([data-theme="dark"]) .syllable-btn {
    background: rgba(28, 25, 23, 0.95);
    color: var(--color-neutral-200, #e8e0d5);
  }

  :global([data-theme="dark"]) .correct-word {
    color: var(--color-gem-400, #34d399);
  }

  :global([data-theme="dark"]) .empty-hint {
    color: var(--color-neutral-500, #78716c);
  }
</style>
