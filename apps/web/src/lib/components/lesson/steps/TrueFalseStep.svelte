<script lang="ts">
  import type { TrueFalseStep } from "$lib/content-model";
  import { createEventDispatcher } from "svelte";

  export let step: TrueFalseStep;

  const dispatch = createEventDispatcher();

  let selectedAnswer: boolean | null = null;
  let isAnswered = false;
  let isCorrect = false;
  let canRetry = false;

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
</script>

<div class="true-false-container">
  {#if step.instruction}
    <p class="instruction">{step.instruction}</p>
  {/if}

  <div class="statement-card">
    <p class="statement">{step.statement}</p>
    {#if step.statementExplanation}
      <p class="statement-explanation">{step.statementExplanation}</p>
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
      <span class="label">True</span>
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
      <span class="label">False</span>
    </button>
  </div>

  {#if isAnswered && isCorrect}
    <div class="success-section">
      <p class="feedback-text success">Correct!</p>
      {#if step.feedback?.explanation}
        <p class="explanation">{step.feedback.explanation}</p>
      {/if}
    </div>
  {/if}

  {#if canRetry}
    <div class="retry-section">
      <p class="feedback-text">Not quite!</p>
      <p class="correct-answer">
        The correct answer is: <strong>{step.correctAnswer ? 'True' : 'False'}</strong>
      </p>
      {#if step.feedback?.explanation}
        <p class="explanation">{step.feedback.explanation}</p>
      {/if}
      <button class="retry-btn" on:click={retry}>Retry</button>
    </div>
  {/if}
</div>

<style>
  .true-false-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .instruction {
    font-size: 1.1rem;
    color: #64748b;
    text-align: center;
    margin: 0;
  }

  .statement-card {
    padding: 1.5rem;
    background: #f8fafc;
    border: 2px solid #e2e8f0;
    border-radius: 1rem;
    text-align: center;
  }

  .statement {
    font-size: 1.4rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
    line-height: 1.4;
  }

  .statement-explanation {
    font-size: 1rem;
    color: #64748b;
    margin: 0.75rem 0 0;
    font-style: italic;
  }

  .options-row {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }

  .option-btn {
    flex: 1;
    max-width: 150px;
    padding: 1.25rem 1rem;
    border: 3px solid #e2e8f0;
    border-radius: 1rem;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .option-btn .icon {
    font-size: 2rem;
    font-weight: bold;
  }

  .option-btn .label {
    font-size: 1.1rem;
    font-weight: 600;
  }

  .true-btn {
    color: #16a34a;
  }

  .true-btn:hover:not(:disabled) {
    border-color: #22c55e;
    background: #f0fdf4;
  }

  .false-btn {
    color: #dc2626;
  }

  .false-btn:hover:not(:disabled) {
    border-color: #ef4444;
    background: #fef2f2;
  }

  .option-btn.correct {
    border-color: #22c55e;
    background: #dcfce7;
  }

  .option-btn.wrong {
    border-color: #ef4444;
    background: #fee2e2;
  }

  .option-btn:disabled {
    cursor: default;
  }

  .success-section {
    padding: 1.5rem;
    background: #f0fdf4;
    border: 2px solid #86efac;
    border-radius: 0.75rem;
    text-align: center;
  }

  .retry-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 1.5rem;
    background: #fef2f2;
    border: 2px solid #fecaca;
    border-radius: 0.75rem;
  }

  .feedback-text {
    font-weight: 600;
    text-align: center;
    margin: 0;
    font-size: 1.1rem;
  }

  .feedback-text.success {
    color: #15803d;
  }

  .retry-section .feedback-text {
    color: #b91c1c;
  }

  .correct-answer {
    color: #1e293b;
    margin: 0;
  }

  .explanation {
    color: #64748b;
    font-size: 0.95rem;
    text-align: center;
    margin: 0;
    line-height: 1.5;
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
    margin-top: 0.5rem;
  }

  .retry-btn:hover {
    background: #dc2626;
  }
</style>
