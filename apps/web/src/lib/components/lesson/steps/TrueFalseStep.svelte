<script lang="ts">
  import type { TrueFalseStep } from "@pkg/content-model";
  import { createEventDispatcher } from "svelte";
  import BiDiText from "$lib/components/ui/BiDiText.svelte";
  import AudioButton from "$lib/components/ui/AudioButton.svelte";

  export let step: TrueFalseStep;
  export let lessonId: string = '';

  const dispatch = createEventDispatcher<{ answer: { correct: boolean; allowContinue: boolean } }>();

  let selectedAnswer: boolean | null = null;
  let isAnswered = false;
  let isCorrect = false;
  let canRetry = false;
  let showHint = false;

  function selectAnswer(answer: boolean) {
    if (isAnswered) return;

    selectedAnswer = answer;
    isAnswered = true;
    isCorrect = answer === step.correctAnswer;

    if (!isCorrect) {
      canRetry = true;
    }

    dispatch('answer', {
      correct: isCorrect,
      allowContinue: isCorrect
    });
  }

  function retry() {
    selectedAnswer = null;
    isAnswered = false;
    isCorrect = false;
    canRetry = false;
  }

  function toggleHint() {
    showHint = !showHint;
  }

  // Check if statement is pure German (no Persian/Arabic characters)
  $: isPureGerman = !/[\u0600-\u06FF]/.test(step.statement);
  // Check if we have a vocab hint available
  $: hasVocabHint = isPureGerman && step.vocabHint && Object.keys(step.vocabHint.words || {}).length > 0;
</script>

<div class="true-false-container">
  {#if step.instruction}
    <p class="instruction" dir="rtl"><BiDiText text={step.instruction} /></p>
  {/if}

  <div class="statement-card">
    <div class="statement-row">
      <p class="statement" dir="rtl"><BiDiText text={step.statement} /></p>
      {#if isPureGerman}
        <AudioButton
          text={step.statement}
          {lessonId}
          audioId="{step.id}-statement"
          size="md"
        />
      {/if}
    </div>
    {#if step.statementExplanation}
      <p class="statement-explanation" dir="rtl"><BiDiText text={step.statementExplanation} /></p>
    {/if}

    {#if hasVocabHint}
      <button class="hint-toggle" on:click={toggleHint} dir="rtl">
        <span class="hint-icon">{showHint ? '🔽' : '💡'}</span>
        <span>{showHint ? 'بستن راهنما' : 'نیاز به کمک؟'}</span>
      </button>

      {#if showHint}
        <div class="hint-content" dir="rtl">
          <p class="hint-intro">این کلمات را قبلاً یاد گرفتید:</p>
          <div class="hint-words">
            {#each Object.entries(step.vocabHint?.words || {}) as [de, fa] (de)}
              <span class="hint-word">
                <span class="de" dir="ltr">{de}</span>
                <span class="sep">=</span>
                <span class="fa">{fa}</span>
              </span>
            {/each}
          </div>
          {#if step.vocabHint?.translation}
            <p class="hint-translation">ترجمه: {step.vocabHint.translation}</p>
          {/if}
        </div>
      {/if}
    {/if}
  </div>

  <div class="options-row">
    <button
      class="option-btn true-btn"
      class:selected={selectedAnswer === true}
      class:correct={isAnswered && step.correctAnswer === true}
      class:wrong={isAnswered && selectedAnswer === true && !isCorrect}
      on:click={() => selectAnswer(true)}
      disabled={isAnswered}
    >
      <span class="icon">✓</span>
      <span class="label">درست</span>
    </button>

    <button
      class="option-btn false-btn"
      class:selected={selectedAnswer === false}
      class:correct={isAnswered && step.correctAnswer === false}
      class:wrong={isAnswered && selectedAnswer === false && !isCorrect}
      on:click={() => selectAnswer(false)}
      disabled={isAnswered}
    >
      <span class="icon">✗</span>
      <span class="label">نادرست</span>
    </button>
  </div>

  {#if isAnswered && isCorrect}
    <div class="success-section">
      <p class="feedback-text success">آفرین! صحیح است</p>
      {#if step.feedback?.explanation}
        <p class="explanation" dir="rtl"><BiDiText text={step.feedback.explanation} /></p>
      {/if}
    </div>
  {/if}

  {#if canRetry}
    <div class="retry-section">
      <p class="feedback-text">پاسخ صحیح نیست!</p>
      <p class="correct-answer">
        پاسخ صحیح: <strong>{step.correctAnswer ? 'درست' : 'نادرست'}</strong>
      </p>
      {#if step.feedback?.explanation}
        <p class="explanation" dir="rtl"><BiDiText text={step.feedback.explanation} /></p>
      {/if}
      <button class="retry-btn" on:click={retry}>تلاش مجدد</button>
    </div>
  {/if}
</div>

<style>
  .true-false-container {
    display: flex;
    flex-direction: column;
    gap: var(--space-6, 1.5rem);
  }

  .instruction {
    font-size: var(--text-lg, 1.125rem);
    color: var(--color-neutral-500, #78716c);
    text-align: center;
    margin: 0;
  }

  .statement-card {
    padding: var(--space-6, 1.5rem);
    background: var(--glass-bg, rgba(253, 251, 247, 0.85));
    border: 2px solid var(--glass-border, rgba(212, 201, 185, 0.3));
    border-radius: var(--radius-xl, 1rem);
    backdrop-filter: blur(var(--glass-blur, 12px));
    text-align: center;
  }

  .statement-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-3, 0.75rem);
  }

  .statement {
    font-size: var(--text-xl, 1.25rem);
    font-weight: var(--font-semibold, 600);
    color: var(--color-neutral-800, #292524);
    margin: 0;
    line-height: 1.5;
  }

  .statement-explanation {
    font-size: var(--text-base, 1rem);
    color: var(--color-neutral-500, #78716c);
    margin: var(--space-3, 0.75rem) 0 0;
    font-style: italic;
  }

  .hint-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2, 0.5rem);
    margin-top: var(--space-4, 1rem);
    padding: var(--space-2, 0.5rem) var(--space-4, 1rem);
    background: transparent;
    border: 1px dashed var(--color-neutral-400, #a69b8a);
    border-radius: var(--radius-md, 0.5rem);
    color: var(--color-neutral-500, #78716c);
    font-size: var(--text-sm, 0.875rem);
    cursor: pointer;
    transition: all var(--transition-normal, 200ms);
  }

  .hint-toggle:hover {
    border-color: var(--color-primary-500, #0891b2);
    color: var(--color-primary-600, #0e7490);
    background: var(--color-primary-50, #ecfeff);
  }

  .hint-icon {
    font-size: 1rem;
  }

  .hint-content {
    margin-top: var(--space-3, 0.75rem);
    padding: var(--space-4, 1rem);
    background: linear-gradient(135deg, var(--color-primary-50, #ecfeff), rgba(8, 145, 178, 0.05));
    border: 1px solid var(--color-primary-200, #a5f3fc);
    border-radius: var(--radius-md, 0.5rem);
  }

  .hint-intro {
    font-size: var(--text-sm, 0.875rem);
    color: var(--color-primary-700, #155e75);
    margin: 0 0 var(--space-3, 0.75rem);
    font-weight: var(--font-medium, 500);
  }

  .hint-words {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2, 0.5rem);
    justify-content: center;
  }

  .hint-word {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1, 0.25rem);
    padding: var(--space-1, 0.25rem) var(--space-2, 0.5rem);
    background: white;
    border-radius: var(--radius-sm, 0.375rem);
    font-size: var(--text-sm, 0.875rem);
  }

  .hint-word .de {
    font-weight: var(--font-semibold, 600);
    color: var(--color-primary-700, #155e75);
  }

  .hint-word .sep {
    color: var(--color-neutral-400, #a69b8a);
  }

  .hint-word .fa {
    color: var(--color-neutral-600, #57534e);
  }

  .hint-translation {
    margin: var(--space-3, 0.75rem) 0 0;
    padding-top: var(--space-3, 0.75rem);
    border-top: 1px dashed var(--color-primary-200, #a5f3fc);
    font-size: var(--text-sm, 0.875rem);
    color: var(--color-neutral-600, #57534e);
    text-align: center;
  }

  .options-row {
    display: flex;
    gap: var(--space-4, 1rem);
    justify-content: center;
  }

  .option-btn {
    flex: 1;
    max-width: 150px;
    padding: var(--space-4, 1rem);
    border: 3px solid var(--glass-border, rgba(212, 201, 185, 0.5));
    border-radius: var(--radius-xl, 1rem);
    background: var(--glass-bg, rgba(253, 251, 247, 0.95));
    cursor: pointer;
    transition: all var(--transition-normal, 200ms);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2, 0.5rem);
    min-height: 80px;
  }

  .option-btn .icon {
    font-size: 2rem;
    font-weight: bold;
  }

  .option-btn .label {
    font-size: var(--text-base, 1rem);
    font-weight: var(--font-semibold, 600);
  }

  .true-btn {
    color: var(--color-success-600, #ca8a04);
  }

  .true-btn:hover:not(:disabled) {
    border-color: var(--color-success-400, #facc15);
    background: linear-gradient(135deg, rgba(234, 179, 8, 0.1), rgba(234, 179, 8, 0.05));
    transform: translateY(-2px);
  }

  .false-btn {
    color: var(--color-error-500, #a91e1e);
  }

  .false-btn:hover:not(:disabled) {
    border-color: var(--color-error-400, #c84b4b);
    background: linear-gradient(135deg, rgba(169, 30, 30, 0.1), rgba(169, 30, 30, 0.05));
    transform: translateY(-2px);
  }

  .option-btn.correct {
    border-color: var(--color-gem-400, #34d399);
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.1));
    box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
  }

  .option-btn.wrong {
    border-color: var(--color-error-400, #c84b4b);
    background: linear-gradient(135deg, rgba(169, 30, 30, 0.15), rgba(169, 30, 30, 0.08));
  }

  .option-btn:disabled {
    cursor: default;
  }

  .success-section {
    padding: var(--space-6, 1.5rem);
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05));
    border: 2px solid var(--color-gem-400, #34d399);
    border-radius: var(--radius-lg, 0.75rem);
    text-align: center;
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
    font-size: var(--text-lg, 1.125rem);
  }

  .feedback-text.success {
    color: var(--color-gem-600, #059669);
  }

  .retry-section .feedback-text {
    color: var(--color-error-600, #8b1a1a);
  }

  .correct-answer {
    color: var(--color-neutral-800, #292524);
    margin: 0;
  }

  .explanation {
    color: var(--color-neutral-500, #78716c);
    font-size: var(--text-sm, 0.875rem);
    text-align: center;
    margin: 0;
    line-height: 1.5;
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
  :global([data-theme="dark"]) .statement-card {
    background: rgba(28, 25, 23, 0.85);
    border-color: rgba(68, 64, 60, 0.3);
  }

  :global([data-theme="dark"]) .statement {
    color: var(--color-neutral-100, #f5f0e8);
  }

  :global([data-theme="dark"]) .option-btn {
    background: rgba(28, 25, 23, 0.95);
  }

  :global([data-theme="dark"]) .correct-answer {
    color: var(--color-neutral-100, #f5f0e8);
  }
</style>
