<script lang="ts">
  import type { WordQuizStep, MultipleChoiceStep } from "$lib/content-model";
  import { createEventDispatcher } from "svelte";
  import BiDiText from "$lib/components/ui/BiDiText.svelte";
  import AudioButton from "$lib/components/ui/AudioButton.svelte";

  export let step: WordQuizStep | MultipleChoiceStep | any;
  export let lessonId: string = '';

  let selectedIndex: number | null = null;
  let isAnswered = false;
  let canRetry = false;

  const dispatch = createEventDispatcher();

  // Support both old and new field names
  $: question = (step as any).question || (step as any).prompt;
  $: correctAnswer = (step as any).correctAnswerIndex ?? (step as any).answer;

  function selectOption(index: number) {
    if (isAnswered) return; // Prevent changing answer

    selectedIndex = index;
    isAnswered = true;

    const isCorrect = index === correctAnswer;

    if (!isCorrect) {
      canRetry = true;
    }

    // Dispatch event to parent with detailed info
    dispatch('answer', {
      correct: isCorrect,
      userAnswer: step.options[index],
      correctAnswer: step.options[correctAnswer],
      allowContinue: isCorrect // Only allow continue if correct
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

  {#if canRetry}
    <div class="retry-section">
      <p class="feedback-text">❌ دوباره امتحان کنید! پاسخ صحیح بالا مشخص شده است.</p>
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
</style>