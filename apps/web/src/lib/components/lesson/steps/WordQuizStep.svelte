<script lang="ts">
  import type { MultipleChoiceStep } from "@pkg/content-model";
  import { createEventDispatcher } from "svelte";
  import BiDiText from "$lib/components/ui/BiDiText.svelte";
  import AudioButton from "$lib/components/ui/AudioButton.svelte";
  import { getErrorLabel } from '$lib/db';

  export let step: MultipleChoiceStep | any;
  export let lessonId: string = '';

  let selectedIndex: number | null = null;
  let isAnswered = false;
  let canRetry = false;
  let showFeedback = false;

  const dispatch = createEventDispatcher<{ answer: { correct: boolean; allowContinue: boolean; userAnswer?: string; correctAnswer?: string; errorCategory?: string; feedbackExplanation?: string } }>();

  // Support both old and new field names
  $: question = (step as any).question || (step as any).prompt;
  $: correctAnswer = (step as any).correctAnswerIndex ?? (step as any).answer;
  $: feedbackTip = (step as any).feedbackTip;

  function selectOption(index: number) {
    if (isAnswered) return; // Prevent changing answer

    selectedIndex = index;
    isAnswered = true;
    showFeedback = true;

    const isCorrect = index === correctAnswer;

    if (!isCorrect) {
      canRetry = true;
    }

    // Dispatch event to parent with detailed info including feedback
    dispatch('answer', {
      correct: isCorrect,
      userAnswer: step.options[index],
      correctAnswer: step.options[correctAnswer],
      allowContinue: isCorrect, // Only allow continue if correct
      errorCategory: feedbackTip?.errorCategory,
      feedbackExplanation: isCorrect ? feedbackTip?.onCorrect : feedbackTip?.onWrong
    });
  }

  function retry() {
    selectedIndex = null;
    isAnswered = false;
    canRetry = false;
  }
</script>

<div class="quiz-container">
  <h2 class="question" dir="rtl"><BiDiText text={question} /></h2>

  <div class="options-grid">
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
        {option}

        {#if isAnswered && i === correctAnswer}
          <span class="icon">✅</span>
        {:else if isAnswered && selectedIndex === i && i !== correctAnswer}
          <span class="icon">❌</span>
        {/if}
      </button>
    {/each}
  </div>

  {#if showFeedback && feedbackTip}
    <div class="feedback-section" class:correct={selectedIndex === correctAnswer} class:wrong={selectedIndex !== correctAnswer}>
      {#if selectedIndex === correctAnswer && feedbackTip.onCorrect}
        <div class="feedback-content correct">
          <span class="feedback-icon">✅</span>
          <p class="feedback-message">{feedbackTip.onCorrect}</p>
        </div>
      {:else if selectedIndex !== correctAnswer && feedbackTip.onWrong}
        <div class="feedback-content wrong">
          <span class="feedback-icon">💡</span>
          <p class="feedback-message">{feedbackTip.onWrong}</p>
          {#if feedbackTip.errorCategory}
            <span class="error-badge">{getErrorLabel(feedbackTip.errorCategory)}</span>
          {/if}
          {#if feedbackTip.rule}
            <p class="rule-hint">📚 {feedbackTip.rule}</p>
          {/if}
        </div>
      {/if}
    </div>
  {/if}

  {#if canRetry}
    <div class="retry-section">
      {#if !feedbackTip?.onWrong}
        <p class="feedback-text">❌ دوباره امتحان کنید! پاسخ صحیح بالا مشخص شده است.</p>
      {/if}
      <button class="retry-btn" on:click={retry}>
        🔄 تلاش مجدد
      </button>
    </div>
  {/if}
</div>

<style>
  .quiz-container {
    display: flex;
    flex-direction: column;
    gap: var(--space-6, 1.5rem);
  }

  .question {
    font-size: var(--text-xl, 1.25rem);
    font-weight: var(--font-bold, 700);
    color: var(--color-neutral-800, #292524);
    text-align: center;
  }

  .options-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-3, 0.75rem);
  }

  .option-btn {
    padding: var(--space-4, 1rem);
    border: 2px solid var(--glass-border, rgba(212, 201, 185, 0.5));
    border-radius: var(--radius-lg, 0.75rem);
    background: var(--glass-bg, rgba(253, 251, 247, 0.95));
    font-size: var(--text-base, 1rem);
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

  .icon {
    font-size: 1.2rem;
    margin-left: var(--space-2, 0.5rem);
  }

  .feedback-section {
    padding: var(--space-4, 1rem);
    border-radius: var(--radius-lg, 0.75rem);
    margin-top: var(--space-3, 0.75rem);
  }

  .feedback-section.correct {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05));
    border: 2px solid var(--color-gem-400, #34d399);
  }

  .feedback-section.wrong {
    background: linear-gradient(135deg, rgba(250, 204, 21, 0.15), rgba(250, 204, 21, 0.05));
    border: 2px solid #facc15;
  }

  .feedback-content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-2, 0.5rem);
    text-align: right;
    direction: rtl;
  }

  .feedback-icon {
    font-size: 1.5rem;
  }

  .feedback-message {
    font-size: var(--text-base, 1rem);
    line-height: 1.6;
    margin: 0;
  }

  .feedback-content.correct .feedback-message {
    color: var(--color-gem-700, #047857);
  }

  .feedback-content.wrong .feedback-message {
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

  .retry-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-4, 1rem);
    padding: var(--space-6, 1.5rem);
    background: linear-gradient(135deg, rgba(169, 30, 30, 0.1), rgba(169, 30, 30, 0.05));
    border: 2px solid var(--color-error-400, #c84b4b);
    border-radius: var(--radius-lg, 0.75rem);
    margin-top: var(--space-4, 1rem);
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

  /* Dark Mode - use hardcoded colors since CSS variables swap */
  :global([data-theme="dark"]) .question {
    color: #f5f0e8;
  }

  :global([data-theme="dark"]) .option-btn {
    background: #44403c;
    border-color: #57534e;
    color: #f5f0e8;
  }

  :global([data-theme="dark"]) .option-btn:hover:not(.disabled) {
    background: #57534e;
    border-color: #22d3ee;
  }

  :global([data-theme="dark"]) .option-btn.correct {
    background: rgba(16, 185, 129, 0.2);
    border-color: #34d399;
    color: #34d399;
  }

  :global([data-theme="dark"]) .option-btn.wrong {
    background: rgba(169, 30, 30, 0.2);
    border-color: #f87171;
    color: #fca5a5;
  }

  :global([data-theme="dark"]) .retry-section {
    background: rgba(169, 30, 30, 0.15);
    border-color: #f87171;
  }

  :global([data-theme="dark"]) .feedback-text {
    color: #fca5a5;
  }

  :global([data-theme="dark"]) .feedback-section.correct {
    background: rgba(16, 185, 129, 0.15);
    border-color: #34d399;
  }

  :global([data-theme="dark"]) .feedback-section.wrong {
    background: rgba(250, 204, 21, 0.1);
    border-color: #854d0e;
  }

  :global([data-theme="dark"]) .feedback-content.correct .feedback-message {
    color: #6ee7b7;
  }

  :global([data-theme="dark"]) .feedback-content.wrong .feedback-message {
    color: #fef08a;
  }

  :global([data-theme="dark"]) .error-badge {
    background: #854d0e;
    border-color: #a16207;
    color: #fef08a;
  }

  :global([data-theme="dark"]) .rule-hint {
    color: #fde047;
    border-color: rgba(250, 204, 21, 0.2);
  }
</style>
