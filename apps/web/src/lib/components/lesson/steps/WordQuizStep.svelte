<script lang="ts">
  import type { WordQuizStep, MultipleChoiceStep } from "$lib/content-model";
  import { createEventDispatcher } from "svelte";
  import BiDiText from "$lib/components/ui/BiDiText.svelte";

  export let step: WordQuizStep | MultipleChoiceStep | any;

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
      <p class="feedback-text">❌ Try again! The correct answer is highlighted above.</p>
      <button class="retry-btn" on:click={retry}>
        🔄 Retry
      </button>
    </div>
  {/if}
</div>

<style>
  .quiz-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  .question {
    font-size: 1.3rem;
    font-weight: 700;
    color: #1e293b;
    text-align: center;
  }
  .options-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  .option-btn {
    padding: 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 0.75rem;
    background: white;
    font-size: 1rem;
    color: #334155;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .option-btn:hover:not(.disabled) {
    border-color: #cbd5e1;
    background: #f8fafc;
  }
  
  /* Selected State (Neutral/Blue before validation? No, instant validation) */
  
  /* Correct Answer (Green) */
  .option-btn.correct {
    border-color: #22c55e;
    background: #f0fdf4;
    color: #15803d;
    font-weight: 600;
  }

  /* Wrong Selection (Red) */
  .option-btn.wrong {
    border-color: #ef4444;
    background: #fef2f2;
    color: #b91c1c;
  }

  .option-btn.disabled {
    cursor: default;
  }

  .icon {
    font-size: 1.2rem;
  }

  .retry-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    background: #fef2f2;
    border: 2px solid #fecaca;
    border-radius: 0.75rem;
    margin-top: 1rem;
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