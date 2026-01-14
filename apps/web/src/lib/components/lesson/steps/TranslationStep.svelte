<script lang="ts">
  import type { TranslationStep } from "$lib/content-model";
  import { createEventDispatcher } from "svelte";
  import BiDiText from "$lib/components/ui/BiDiText.svelte";
  import AudioButton from "$lib/components/ui/AudioButton.svelte";
  import { detectDirection } from "$lib/utils/bidi";

  export let step: TranslationStep;
  export let lessonId: string = '';

  const dispatch = createEventDispatcher();

  // Parse template into parts with blanks
  $: parts = step.sentenceTemplate.split(/(\{[0-9]+\})/g);
  $: blankCount = step.correctAnswers?.length || step.options?.length || 0;
  // For translation, the answer is always German (LTR), but detect from template content if available
  $: answerDir = detectDirection(step.options?.join(' ') || step.sentenceTemplate);

  // Initialize selectedAnswers reactively based on blankCount
  let selectedAnswers: (number | null)[] = [];
  $: if (blankCount > 0 && selectedAnswers.length !== blankCount) {
    selectedAnswers = Array(blankCount).fill(null);
  }

  let isAnswered = false;
  let isCorrect = false;
  let canRetry = false;

  function selectOption(optionIndex: number) {
    if (isAnswered) return;
    // Find first unfilled blank
    const emptyIdx = selectedAnswers.findIndex(a => a === null);
    if (emptyIdx !== -1) {
      selectedAnswers[emptyIdx] = optionIndex;
      selectedAnswers = [...selectedAnswers];
    }
  }

  function clearBlank(blankIndex: number) {
    if (isAnswered) return;
    selectedAnswers[blankIndex] = null;
    selectedAnswers = [...selectedAnswers];
  }

  function checkAnswers() {
    if (selectedAnswers.some(a => a === null)) return;

    isAnswered = true;
    isCorrect = selectedAnswers.every((answer, i) => answer === step.correctAnswers[i]);

    if (!isCorrect) {
      canRetry = true;
    }

    dispatch('answer', {
      correct: isCorrect,
      allowContinue: isCorrect
    });
  }

  function retry() {
    selectedAnswers = Array(blankCount).fill(null);
    isAnswered = false;
    isCorrect = false;
    canRetry = false;
  }

  function getBlankIndex(part: string): number {
    const match = part.match(/\{([0-9]+)\}/);
    return match ? parseInt(match[1]) : -1;
  }
</script>

<div class="translation-container">
  <div class="source-text">
    <span class="label">Translate:</span>
    <p class="text" dir="rtl"><BiDiText text={step.sourceText} /></p>
  </div>

  <div class="answer-area" dir={answerDir} class:correct={isAnswered && isCorrect} class:wrong={isAnswered && !isCorrect}>
    {#each parts as part}
      {#if part.match(/\{[0-9]+\}/)}
        {@const blankIdx = getBlankIndex(part)}
        <span class="blank-wrapper">
          {#if blankIdx >= 0 && blankIdx < selectedAnswers.length && selectedAnswers[blankIdx] !== null && step.options[selectedAnswers[blankIdx]] !== undefined}
            <button
              class="filled-blank"
              class:correct-word={isAnswered && selectedAnswers[blankIdx] === step.correctAnswers[blankIdx]}
              class:wrong-word={isAnswered && selectedAnswers[blankIdx] !== step.correctAnswers[blankIdx]}
              on:click={() => clearBlank(blankIdx)}
              disabled={isAnswered}
            >
              {step.options[selectedAnswers[blankIdx]]}
            </button>
          {:else}
            <span class="empty-blank">___</span>
          {/if}
        </span>
      {:else if part.trim()}
        <span class="text-part">{part}</span>
      {/if}
    {/each}
  </div>

  <div class="options-grid">
    {#each step.options as option, i}
      <button
        class="option-btn"
        class:used={selectedAnswers.includes(i)}
        on:click={() => selectOption(i)}
        disabled={isAnswered || selectedAnswers.includes(i)}
      >
        {option}
      </button>
    {/each}
  </div>

  {#if !isAnswered && selectedAnswers.every(a => a !== null)}
    <button class="check-btn" on:click={checkAnswers}>
      بررسی پاسخ
    </button>
  {/if}

  {#if isAnswered && isCorrect}
    <div class="success-section">
      <p class="feedback-text success">آفرین! صحیح است</p>
      <div class="audio-row">
        <p class="correct-translation">{step.correctTranslation.de}</p>
        <AudioButton
          text={step.correctTranslation.de}
          {lessonId}
          audioId="{step.id}-translation"
          size="md"
        />
      </div>
    </div>
  {/if}

  {#if canRetry}
    <div class="retry-section">
      <p class="feedback-text">پاسخ صحیح نیست!</p>
      <p class="correct-answer">
        <strong>پاسخ صحیح:</strong> {step.correctTranslation.de}
      </p>
      {#if step.feedback?.explanation}
        <p class="explanation" dir="rtl"><BiDiText text={step.feedback.explanation} /></p>
      {/if}
      <button class="retry-btn" on:click={retry}>تلاش مجدد</button>
    </div>
  {/if}
</div>

<style>
  .translation-container {
    display: flex;
    flex-direction: column;
    gap: var(--space-6, 1.5rem);
  }

  .source-text {
    text-align: center;
  }

  .source-text .label {
    display: block;
    font-size: var(--text-sm, 0.875rem);
    color: var(--color-neutral-500, #78716c);
    margin-bottom: var(--space-2, 0.5rem);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .source-text .text {
    font-size: var(--text-xl, 1.25rem);
    color: var(--color-neutral-800, #292524);
    font-weight: var(--font-semibold, 600);
    margin: 0;
  }

  .answer-area {
    padding: var(--space-6, 1.5rem);
    background: var(--glass-bg, rgba(253, 251, 247, 0.85));
    border: 2px dashed var(--color-neutral-300, #d4c9b9);
    border-radius: var(--radius-xl, 1rem);
    backdrop-filter: blur(var(--glass-blur, 12px));
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2, 0.5rem);
    justify-content: center;
    align-items: baseline;
    font-size: var(--text-lg, 1.125rem);
    min-height: 4rem;
    transition: all var(--transition-normal, 200ms);
  }

  .answer-area.correct {
    background: linear-gradient(135deg, rgba(234, 179, 8, 0.1), rgba(234, 179, 8, 0.05));
    border-color: var(--color-success-500, #eab308);
    border-style: solid;
  }

  .answer-area.wrong {
    background: linear-gradient(135deg, rgba(169, 30, 30, 0.1), rgba(169, 30, 30, 0.05));
    border-color: var(--color-error-500, #a91e1e);
    border-style: solid;
  }

  .text-part {
    color: var(--color-neutral-500, #78716c);
  }

  .blank-wrapper {
    display: inline-block;
    margin: 0 var(--space-1, 0.25rem);
  }

  .empty-blank {
    display: inline-block;
    min-width: 3rem;
    border-bottom: 2px dashed var(--color-neutral-400, #a69b8a);
    color: var(--color-neutral-400, #a69b8a);
    text-align: center;
  }

  .filled-blank {
    display: inline-block;
    padding: var(--space-1, 0.25rem) var(--space-3, 0.75rem);
    background: linear-gradient(135deg, var(--color-primary-100, #cffafe), var(--color-primary-50, #ecfeff));
    border: 2px solid var(--color-primary-300, #67e8f9);
    border-radius: var(--radius-md, 0.5rem);
    color: var(--color-primary-700, #155e75);
    font-weight: var(--font-semibold, 600);
    font-size: var(--text-base, 1rem);
    cursor: pointer;
    transition: all var(--transition-normal, 200ms);
  }

  .filled-blank:hover:not(:disabled) {
    background: var(--color-primary-200, #a5f3fc);
    transform: scale(1.02);
  }

  .filled-blank.correct-word {
    background: linear-gradient(135deg, var(--color-success-100, #fef9c3), var(--color-success-50, #fefce8));
    border-color: var(--color-success-400, #facc15);
    color: var(--color-success-700, #a16207);
  }

  .filled-blank.wrong-word {
    background: linear-gradient(135deg, var(--color-error-100, #fee2e2), var(--color-error-50, #fef2f2));
    border-color: var(--color-error-400, #c84b4b);
    color: var(--color-error-600, #8b1a1a);
  }

  .filled-blank:disabled {
    cursor: default;
  }

  .options-grid {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3, 0.75rem);
    justify-content: center;
  }

  .option-btn {
    padding: var(--space-3, 0.75rem) var(--space-4, 1rem);
    border: 2px solid var(--glass-border, rgba(212, 201, 185, 0.5));
    border-radius: var(--radius-lg, 0.75rem);
    background: var(--glass-bg, rgba(253, 251, 247, 0.95));
    font-size: var(--text-base, 1rem);
    color: var(--color-neutral-700, #44403c);
    cursor: pointer;
    transition: all var(--transition-normal, 200ms);
    min-height: 44px;
  }

  .option-btn:hover:not(:disabled) {
    border-color: var(--color-primary-400, #22d3ee);
    background: var(--color-primary-50, #ecfeff);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md, 0 4px 15px rgba(0, 0, 0, 0.08));
  }

  .option-btn.used {
    opacity: 0.3;
    cursor: default;
  }

  .option-btn:disabled {
    cursor: default;
  }

  .check-btn {
    padding: var(--space-4, 1rem) var(--space-8, 2rem);
    background: linear-gradient(135deg, var(--color-primary-500, #0891b2), var(--color-primary-600, #0e7490));
    color: white;
    border: none;
    border-radius: var(--radius-full, 9999px);
    font-size: var(--text-base, 1rem);
    font-weight: var(--font-semibold, 600);
    cursor: pointer;
    align-self: center;
    transition: all var(--transition-normal, 200ms);
    box-shadow: 0 4px 15px rgba(8, 145, 178, 0.3);
    min-height: 48px;
  }

  .check-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(8, 145, 178, 0.4);
  }

  .success-section {
    padding: var(--space-6, 1.5rem);
    background: linear-gradient(135deg, rgba(234, 179, 8, 0.15), rgba(234, 179, 8, 0.05));
    border: 2px solid var(--color-success-400, #facc15);
    border-radius: var(--radius-lg, 0.75rem);
    text-align: center;
  }

  .audio-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-3, 0.75rem);
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
  }

  .feedback-text {
    font-weight: var(--font-semibold, 600);
    text-align: center;
    margin: 0;
  }

  .feedback-text.success {
    color: var(--color-success-600, #ca8a04);
    font-size: var(--text-lg, 1.125rem);
  }

  .retry-section .feedback-text {
    color: var(--color-error-600, #8b1a1a);
  }

  .correct-answer, .correct-translation {
    color: var(--color-neutral-800, #292524);
    margin: 0;
  }

  .explanation {
    color: var(--color-neutral-500, #78716c);
    font-size: var(--text-sm, 0.875rem);
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
    margin-top: var(--space-2, 0.5rem);
    transition: all var(--transition-normal, 200ms);
    min-height: 44px;
  }

  .retry-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(169, 30, 30, 0.3);
  }

  /* Dark Mode */
  :global([data-theme="dark"]) .source-text .text {
    color: var(--color-neutral-100, #f5f0e8);
  }

  :global([data-theme="dark"]) .answer-area {
    background: rgba(28, 25, 23, 0.85);
    border-color: var(--color-neutral-600, #57534e);
  }

  :global([data-theme="dark"]) .option-btn {
    background: rgba(28, 25, 23, 0.95);
    color: var(--color-neutral-200, #e8e0d5);
  }

  :global([data-theme="dark"]) .correct-answer,
  :global([data-theme="dark"]) .correct-translation {
    color: var(--color-neutral-100, #f5f0e8);
  }
</style>
