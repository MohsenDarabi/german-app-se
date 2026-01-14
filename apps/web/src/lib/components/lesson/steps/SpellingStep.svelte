<script lang="ts">
  import type { SpellingStep } from "$lib/content-model";
  import { createEventDispatcher, onMount } from "svelte";
  import BiDiText from "$lib/components/ui/BiDiText.svelte";
  import AudioButton from "$lib/components/ui/AudioButton.svelte";

  export let step: SpellingStep;
  export let lessonId: string = '';

  const dispatch = createEventDispatcher();

  // Generate letters from word + optional distractors
  let availableLetters: { letter: string; id: string; used: boolean }[] = [];
  let selectedLetters: { letter: string; id: string }[] = [];
  let isCorrect = false;
  let isWrong = false;
  let canRetry = false;
  let showHint = false;

  const DISTRACTOR_LETTERS = 'ÄÖÜABCDEFGHIJKLMNOPQRSTUVWXYZ';

  onMount(() => {
    initializeLetters();
  });

  function initializeLetters() {
    // Get letters from the word
    const wordLetters = step.word.split('');

    // Add distractor letters if enabled
    let allLetters = [...wordLetters];
    if (step.includeDistractors) {
      const count = step.distractorCount || 2;
      for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(Math.random() * DISTRACTOR_LETTERS.length);
        allLetters.push(DISTRACTOR_LETTERS[randomIndex]);
      }
    }

    // Override with provided letters if available
    if (step.letters && step.letters.length > 0) {
      allLetters = [...step.letters];
    }

    // Shuffle and create letter objects
    availableLetters = shuffleArray(allLetters).map((letter, index) => ({
      letter,
      id: `${letter}-${index}`,
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

  function selectLetter(letterObj: { letter: string; id: string; used: boolean }) {
    if (letterObj.used || isCorrect) return;

    // Mark as used
    availableLetters = availableLetters.map(l =>
      l.id === letterObj.id ? { ...l, used: true } : l
    );

    // Add to selected
    selectedLetters = [...selectedLetters, { letter: letterObj.letter, id: letterObj.id }];

    // Check if word is complete
    if (selectedLetters.length === step.word.length) {
      checkAnswer();
    }
  }

  function removeLetter(index: number) {
    if (isCorrect) return;

    const removed = selectedLetters[index];

    // Return to available
    availableLetters = availableLetters.map(l =>
      l.id === removed.id ? { ...l, used: false } : l
    );

    // Remove from selected
    selectedLetters = selectedLetters.filter((_, i) => i !== index);

    // Reset wrong state
    isWrong = false;
    canRetry = false;
  }

  function checkAnswer() {
    const enteredWord = selectedLetters.map(l => l.letter).join('');
    isCorrect = enteredWord === step.word;

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
    // Reset all letters
    availableLetters = availableLetters.map(l => ({ ...l, used: false }));
    selectedLetters = [];
    isWrong = false;
    canRetry = false;
  }

  function clearAll() {
    availableLetters = availableLetters.map(l => ({ ...l, used: false }));
    selectedLetters = [];
    isWrong = false;
  }
</script>

<div class="spelling-container">
  <p class="instruction" dir="rtl">
    <BiDiText text={step.instruction || 'این کلمه را هجی کنید'} />
  </p>

  <!-- Translation hint -->
  <div class="hint-section">
    <p class="translation" dir="rtl">{step.translation}</p>
    {#if step.phonetic}
      <button class="hint-toggle" on:click={() => showHint = !showHint}>
        {showHint ? 'پنهان کردن تلفظ' : 'نمایش تلفظ'}
      </button>
      {#if showHint}
        <p class="phonetic">[{step.phonetic}]</p>
      {/if}
    {/if}
  </div>

  <!-- Image if provided -->
  {#if step.showImage && step.image}
    <div class="image-container">
      <img src={step.image} alt={step.word} />
    </div>
  {/if}

  <!-- Selected letters / answer area -->
  <div class="answer-area" class:correct={isCorrect} class:wrong={isWrong}>
    <div class="letter-slots">
      {#each Array(step.word.length) as _, i}
        <div
          class="letter-slot"
          class:filled={selectedLetters[i]}
          on:click={() => selectedLetters[i] && removeLetter(i)}
          on:keypress={(e) => e.key === 'Enter' && selectedLetters[i] && removeLetter(i)}
          role="button"
          tabindex={selectedLetters[i] ? 0 : -1}
        >
          {selectedLetters[i]?.letter || ''}
        </div>
      {/each}
    </div>

    {#if selectedLetters.length > 0 && !isCorrect}
      <button class="clear-btn" on:click={clearAll}>پاک کردن</button>
    {/if}
  </div>

  <!-- Available letters -->
  <div class="letters-grid">
    {#each availableLetters as letterObj (letterObj.id)}
      <button
        class="letter-btn"
        class:used={letterObj.used}
        disabled={letterObj.used || isCorrect}
        on:click={() => selectLetter(letterObj)}
      >
        {letterObj.letter}
      </button>
    {/each}
  </div>

  <!-- Feedback -->
  {#if isCorrect}
    <div class="success-section">
      <p class="feedback-text success">آفرین! درست نوشتید</p>
      <div class="word-row">
        <span class="correct-word">{step.word}</span>
        <AudioButton
          text={step.word}
          {lessonId}
          audioId="{step.id}-word"
          size="md"
        />
      </div>
      {#if step.feedback?.explanation}
        <p class="explanation" dir="rtl"><BiDiText text={step.feedback.explanation} /></p>
      {/if}
    </div>
  {/if}

  {#if canRetry}
    <div class="retry-section">
      <p class="feedback-text error">درست نیست! دوباره تلاش کنید</p>
      <button class="retry-btn" on:click={retry}>تلاش مجدد</button>
    </div>
  {/if}
</div>

<style>
  .spelling-container {
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

  .hint-toggle {
    font-size: var(--text-sm, 0.875rem);
    color: var(--color-primary-500, #0891b2);
    background: none;
    border: none;
    cursor: pointer;
    text-decoration: underline;
    transition: color var(--transition-fast, 150ms);
  }

  .hint-toggle:hover {
    color: var(--color-primary-600, #0e7490);
  }

  .phonetic {
    font-size: var(--text-base, 1rem);
    color: var(--color-neutral-500, #78716c);
    font-style: italic;
    margin: 0;
  }

  .image-container {
    width: 100%;
    max-width: 200px;
  }

  .image-container img {
    width: 100%;
    border-radius: var(--radius-lg, 0.75rem);
    box-shadow: var(--shadow-md, 0 4px 15px rgba(0, 0, 0, 0.08));
  }

  .answer-area {
    width: 100%;
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
    border-color: var(--color-success-400, #facc15);
    border-style: solid;
    background: linear-gradient(135deg, rgba(234, 179, 8, 0.15), rgba(234, 179, 8, 0.05));
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

  .letter-slots {
    display: flex;
    gap: var(--space-2, 0.5rem);
    flex-wrap: wrap;
    justify-content: center;
  }

  .letter-slot {
    width: 48px;
    height: 56px;
    border: 2px dashed var(--color-neutral-300, #d4c9b9);
    border-radius: var(--radius-md, 0.5rem);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: var(--font-bold, 700);
    color: var(--color-neutral-800, #292524);
    background: var(--color-neutral-50, #fdfbf7);
    transition: all var(--transition-normal, 200ms);
  }

  .letter-slot.filled {
    border-style: solid;
    border-color: var(--color-primary-500, #0891b2);
    background: linear-gradient(135deg, var(--color-primary-100, #cffafe), var(--color-primary-50, #ecfeff));
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(8, 145, 178, 0.2);
  }

  .letter-slot.filled:hover {
    background: var(--color-primary-200, #a5f3fc);
    transform: scale(1.08);
    box-shadow: 0 4px 12px rgba(8, 145, 178, 0.3);
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

  .letters-grid {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3, 0.75rem);
    justify-content: center;
    max-width: 320px;
  }

  .letter-btn {
    width: 52px;
    height: 52px;
    border: 2px solid var(--glass-border, rgba(212, 201, 185, 0.5));
    border-radius: var(--radius-lg, 0.75rem);
    background: var(--glass-bg, rgba(253, 251, 247, 0.95));
    font-size: 1.4rem;
    font-weight: var(--font-bold, 700);
    color: var(--color-neutral-700, #44403c);
    cursor: pointer;
    transition: all var(--transition-normal, 200ms);
    box-shadow: var(--shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.04));
  }

  .letter-btn:hover:not(:disabled) {
    border-color: var(--color-primary-400, #22d3ee);
    background: var(--color-primary-50, #ecfeff);
    transform: translateY(-3px);
    box-shadow: var(--shadow-md, 0 4px 15px rgba(0, 0, 0, 0.08));
  }

  .letter-btn:active:not(:disabled) {
    transform: translateY(0) scale(0.95);
  }

  .letter-btn.used {
    opacity: 0.25;
    cursor: default;
    transform: none;
  }

  .success-section {
    width: 100%;
    padding: var(--space-6, 1.5rem);
    background: linear-gradient(135deg, rgba(234, 179, 8, 0.15), rgba(234, 179, 8, 0.05));
    border: 2px solid var(--color-success-400, #facc15);
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
    color: var(--color-success-700, #a16207);
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
    color: var(--color-success-600, #ca8a04);
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

  :global([data-theme="dark"]) .letter-slot {
    background: rgba(28, 25, 23, 0.95);
    color: var(--color-neutral-100, #f5f0e8);
  }

  :global([data-theme="dark"]) .letter-btn {
    background: rgba(28, 25, 23, 0.95);
    color: var(--color-neutral-200, #e8e0d5);
  }

  :global([data-theme="dark"]) .correct-word {
    color: var(--color-success-400, #facc15);
  }
</style>
