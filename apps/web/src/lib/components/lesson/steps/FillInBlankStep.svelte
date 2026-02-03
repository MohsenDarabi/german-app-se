<script lang="ts">
  import type { FillInBlankStep } from "@pkg/content-model";
  import { createEventDispatcher } from "svelte";
  import BiDiText from "$lib/components/ui/BiDiText.svelte";
  import AudioButton from "$lib/components/ui/AudioButton.svelte";
  import { detectDirection } from "$lib/utils/bidi";
  import { getErrorLabel } from '$lib/db';

  export let step: FillInBlankStep;
  export let lessonId: string = '';

  $: feedbackTip = step.feedbackTip;

  const dispatch = createEventDispatcher<{ answer: { correct: boolean; allowContinue: boolean; errorCategory?: string; feedbackExplanation?: string } }>();

  // Parse sentence into parts with blanks
  $: parts = step.sentence.split(/(\{[0-9]+\})/g);
  $: blankCount = step.correctAnswers?.length || 0;
  $: sentenceDir = detectDirection(step.sentence);

  // Initialize selectedAnswers reactively based on blankCount
  let selectedAnswers: (number | null)[] = [];
  $: if (blankCount > 0 && selectedAnswers.length !== blankCount) {
    selectedAnswers = Array(blankCount).fill(null);
  }

  let isAnswered = false;
  let isCorrect = false;
  let canRetry = false;

  function selectOption(blankIndex: number, optionIndex: number) {
    if (isAnswered) return;
    selectedAnswers[blankIndex] = optionIndex;
    selectedAnswers = [...selectedAnswers]; // trigger reactivity
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
      allowContinue: isCorrect,
      errorCategory: feedbackTip?.errorCategory,
      feedbackExplanation: isCorrect ? feedbackTip?.onCorrect : feedbackTip?.onWrong
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

<div class="fill-blank-container">
  {#if step.instruction}
    <p class="instruction" dir="rtl"><BiDiText text={step.instruction} /></p>
  {/if}

  <div class="sentence-area" dir={sentenceDir}>
    {#each parts as part, i (i)}
      {#if part.match(/\{[0-9]+\}/)}
        {@const blankIdx = getBlankIndex(part)}
        <span class="blank-wrapper">
          {#if blankIdx >= 0 && blankIdx < selectedAnswers.length && selectedAnswers[blankIdx] !== null && step.options[selectedAnswers[blankIdx]] !== undefined}
            <span
              class="filled-blank"
              class:correct={isAnswered && selectedAnswers[blankIdx] === step.correctAnswers[blankIdx]}
              class:wrong={isAnswered && selectedAnswers[blankIdx] !== step.correctAnswers[blankIdx]}
            >
              {step.options[selectedAnswers[blankIdx]]}
            </span>
          {:else}
            <span class="empty-blank">___</span>
          {/if}
        </span>
      {:else}
        <span class="text-part">{part}</span>
      {/if}
    {/each}
  </div>

  <div class="options-grid">
    {#each step.options as option, i (i)}
      <button
        class="option-btn"
        class:selected={selectedAnswers.includes(i)}
        class:disabled={isAnswered}
        on:click={() => {
          // Find first unfilled blank
          const emptyIdx = selectedAnswers.findIndex(a => a === null);
          if (emptyIdx !== -1) {
            selectOption(emptyIdx, i);
          }
        }}
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
      {#if feedbackTip?.onCorrect}
        <div class="feedback-tip-content correct">
          <p class="tip-message">{feedbackTip.onCorrect}</p>
        </div>
      {/if}
      <div class="audio-row">
        <AudioButton
          text={step.sentence.replace(/\{[0-9]+\}/g, (match) => {
            const idx = parseInt(match.slice(1, -1));
            return step.options[step.correctAnswers[idx]] || '';
          })}
          {lessonId}
          audioId="{step.id}-sentence"
          size="md"
        />
      </div>
    </div>
  {/if}

  {#if canRetry}
    <div class="retry-section">
      {#if feedbackTip?.onWrong}
        <div class="feedback-tip-content wrong">
          <span class="tip-icon">💡</span>
          <p class="tip-message">{feedbackTip.onWrong}</p>
          {#if feedbackTip.errorCategory}
            <span class="error-badge">{getErrorLabel(feedbackTip.errorCategory)}</span>
          {/if}
          {#if feedbackTip.rule}
            <p class="rule-hint">📚 {feedbackTip.rule}</p>
          {/if}
        </div>
      {:else}
        <p class="feedback-text">دوباره امتحان کنید!</p>
        {#if step.feedback?.explanation}
          <p class="explanation" dir="rtl"><BiDiText text={step.feedback.explanation} /></p>
        {/if}
      {/if}
      <button class="retry-btn" on:click={retry}>تلاش مجدد</button>
    </div>
  {/if}
</div>

<style>
  .fill-blank-container {
    display: flex;
    flex-direction: column;
    gap: var(--space-6, 1.5rem);
  }

  .instruction {
    font-size: var(--text-base, 1rem);
    color: var(--color-neutral-400, #a69b8a);
    text-align: center;
    margin: 0;
  }

  /* Clean sentence area - no border, just the content */
  .sentence-area {
    font-size: var(--text-xl, 1.25rem);
    line-height: 2.2;
    text-align: center;
    padding: var(--space-4, 1rem) var(--space-2, 0.5rem);
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: baseline;
    gap: var(--space-1, 0.25rem);
  }

  .text-part {
    color: var(--color-neutral-700, #44403c);
  }

  .blank-wrapper {
    display: inline-block;
    margin: 0 var(--space-1, 0.25rem);
  }

  .empty-blank {
    display: inline-block;
    min-width: 4rem;
    padding: var(--space-1, 0.25rem) var(--space-2, 0.5rem);
    background: var(--color-neutral-100, #f5f0e8);
    border-radius: var(--radius-md, 0.5rem);
    color: var(--color-neutral-400, #a69b8a);
    text-align: center;
  }

  .filled-blank {
    display: inline-block;
    padding: var(--space-1, 0.25rem) var(--space-3, 0.75rem);
    background: var(--color-primary-100, #cffafe);
    border-radius: var(--radius-md, 0.5rem);
    color: var(--color-primary-700, #155e75);
    font-weight: var(--font-semibold, 600);
  }

  .filled-blank.correct {
    background: var(--color-gem-100, #d1fae5);
    color: var(--color-gem-700, #047857);
  }

  .filled-blank.wrong {
    background: var(--color-error-100, #fee2e2);
    color: var(--color-error-600, #8b1a1a);
  }

  .options-grid {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2, 0.5rem);
    justify-content: center;
    padding: var(--space-2, 0.5rem) 0;
  }

  /* Clean option buttons - subtle background, no borders */
  .option-btn {
    padding: var(--space-2-5, 0.625rem) var(--space-4, 1rem);
    border: none;
    border-radius: var(--radius-full, 9999px);
    background: var(--color-neutral-100, #f5f0e8);
    font-size: var(--text-base, 1rem);
    color: var(--color-neutral-700, #44403c);
    cursor: pointer;
    transition: all var(--transition-normal, 200ms);
    min-height: 44px;
  }

  .option-btn:hover:not(:disabled) {
    background: var(--color-primary-100, #cffafe);
    color: var(--color-primary-700, #155e75);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(8, 145, 178, 0.15);
  }

  .option-btn.selected {
    opacity: 0.3;
    cursor: default;
    transform: none;
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
    padding: var(--space-4, 1rem);
    text-align: center;
  }

  .audio-row {
    display: flex;
    justify-content: center;
    margin-top: var(--space-3, 0.75rem);
  }

  .retry-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-3, 0.75rem);
    padding: var(--space-4, 1rem);
  }

  .feedback-text {
    font-weight: var(--font-semibold, 600);
    text-align: center;
    margin: 0;
  }

  .feedback-text.success {
    color: var(--color-gem-600, #059669);
  }

  .retry-section .feedback-text {
    color: var(--color-error-600, #8b1a1a);
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
    transition: all var(--transition-normal, 200ms);
    min-height: 44px;
  }

  .retry-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(169, 30, 30, 0.3);
  }

  .feedback-tip-content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-2, 0.5rem);
    padding: var(--space-4, 1rem);
    border-radius: var(--radius-lg, 0.75rem);
    text-align: right;
    direction: rtl;
    width: 100%;
    margin-bottom: var(--space-3, 0.75rem);
  }

  .feedback-tip-content.correct {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05));
    border: 2px solid var(--color-gem-400, #34d399);
  }

  .feedback-tip-content.wrong {
    background: linear-gradient(135deg, rgba(250, 204, 21, 0.15), rgba(250, 204, 21, 0.05));
    border: 2px solid #facc15;
  }

  .tip-icon {
    font-size: 1.5rem;
  }

  .tip-message {
    font-size: var(--text-base, 1rem);
    line-height: 1.6;
    margin: 0;
  }

  .feedback-tip-content.correct .tip-message {
    color: var(--color-gem-700, #047857);
  }

  .feedback-tip-content.wrong .tip-message {
    color: #78350f;
  }

  .error-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    background: #fef08a;
    border: 1px solid #facc15;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 600;
    color: #78350f;
  }

  .rule-hint {
    font-size: var(--text-sm, 0.875rem);
    color: #92400e;
    margin: 0;
    padding-top: var(--space-2, 0.5rem);
    border-top: 1px solid rgba(250, 204, 21, 0.3);
    width: 100%;
  }

  /* Dark Mode */
  :global([data-theme="dark"]) .text-part {
    color: var(--color-neutral-200, #e8e0d5);
  }

  :global([data-theme="dark"]) .empty-blank {
    background: var(--color-neutral-200, #44403c);
    color: var(--color-neutral-500, #78716c);
  }

  :global([data-theme="dark"]) .option-btn {
    background: var(--color-neutral-200, #44403c);
    color: var(--color-neutral-700, #e8e0d5);
  }

  :global([data-theme="dark"]) .option-btn:hover:not(:disabled) {
    background: var(--color-primary-700, #155e75);
    color: var(--color-primary-100, #cffafe);
  }
</style>
