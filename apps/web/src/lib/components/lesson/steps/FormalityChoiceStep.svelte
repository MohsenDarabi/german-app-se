<script lang="ts">
  import type { FormalityChoiceStep } from "$lib/content-model";
  import { createEventDispatcher } from "svelte";

  export let step: FormalityChoiceStep;
  export let lessonId: string = '';

  const dispatch = createEventDispatcher();

  let selectedAnswer: "formal" | "informal" | null = null;
  let isAnswered = false;

  $: isCorrect = selectedAnswer === step.correctAnswer;

  function selectOption(choice: "formal" | "informal") {
    if (isAnswered) return;

    selectedAnswer = choice;
    isAnswered = true;

    dispatch('answer', {
      correct: choice === step.correctAnswer,
      userAnswer: choice,
      correctAnswer: step.correctAnswer,
      allowContinue: choice === step.correctAnswer
    });
  }

  function retry() {
    selectedAnswer = null;
    isAnswered = false;
  }
</script>

<div class="formality-container">
  <!-- Instruction -->
  <h2 class="instruction" dir="rtl">{step.instruction || 'رسمی یا غیررسمی؟'}</h2>

  <!-- Scenario -->
  <div class="scenario-box" dir="rtl">
    <div class="scenario-icon">🎭</div>
    <p class="scenario-text">{step.scenario}</p>
  </div>

  <!-- Options -->
  <div class="options-row">
    <!-- Formal Option -->
    <button
      class="option-card"
      class:selected={selectedAnswer === "formal"}
      class:correct={isAnswered && step.correctAnswer === "formal"}
      class:wrong={isAnswered && selectedAnswer === "formal" && step.correctAnswer !== "formal"}
      class:disabled={isAnswered}
      on:click={() => selectOption("formal")}
      disabled={isAnswered}
    >
      <span class="option-label" dir="rtl">{step.formalOption.label || 'رسمی (Sie)'}</span>
      <span class="option-text">{step.formalOption.text}</span>
      {#if isAnswered && step.correctAnswer === "formal"}
        <span class="result-icon">✅</span>
      {:else if isAnswered && selectedAnswer === "formal"}
        <span class="result-icon">❌</span>
      {/if}
    </button>

    <!-- Informal Option -->
    <button
      class="option-card"
      class:selected={selectedAnswer === "informal"}
      class:correct={isAnswered && step.correctAnswer === "informal"}
      class:wrong={isAnswered && selectedAnswer === "informal" && step.correctAnswer !== "informal"}
      class:disabled={isAnswered}
      on:click={() => selectOption("informal")}
      disabled={isAnswered}
    >
      <span class="option-label" dir="rtl">{step.informalOption.label || 'غیررسمی (Du)'}</span>
      <span class="option-text">{step.informalOption.text}</span>
      {#if isAnswered && step.correctAnswer === "informal"}
        <span class="result-icon">✅</span>
      {:else if isAnswered && selectedAnswer === "informal"}
        <span class="result-icon">❌</span>
      {/if}
    </button>
  </div>

  <!-- Explanation (shown after answering) -->
  {#if isAnswered}
    <div class="explanation-box" class:correct={isCorrect} class:wrong={!isCorrect}>
      <div class="explanation-header" dir="rtl">
        {#if isCorrect}
          <span class="header-icon">💡</span>
          <span>آفرین! توضیح:</span>
        {:else}
          <span class="header-icon">📚</span>
          <span>توضیح:</span>
        {/if}
      </div>
      <p class="explanation-text" dir="rtl">{step.explanation}</p>

      {#if step.persianNote}
        <div class="persian-note" dir="rtl">
          <span class="note-label">🇮🇷 مقایسه با فارسی:</span>
          <p>{step.persianNote}</p>
        </div>
      {/if}
    </div>
  {/if}

  <!-- Retry button (if wrong) -->
  {#if isAnswered && !isCorrect}
    <button class="retry-btn" on:click={retry}>
      🔄 تلاش مجدد
    </button>
  {/if}
</div>

<style>
  .formality-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .instruction {
    font-size: 1.3rem;
    font-weight: 700;
    color: #1e293b;
    text-align: center;
    margin: 0;
  }

  /* Scenario */
  .scenario-box {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.25rem;
    background: linear-gradient(135deg, #f8fafc, #f1f5f9);
    border: 2px solid #e2e8f0;
    border-radius: 1rem;
  }

  .scenario-icon {
    font-size: 2rem;
    flex-shrink: 0;
  }

  .scenario-text {
    font-size: 1.1rem;
    color: #334155;
    line-height: 1.6;
    margin: 0;
  }

  /* Options */
  .options-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  @media (max-width: 500px) {
    .options-row {
      grid-template-columns: 1fr;
    }
  }

  .option-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 1.5rem 1rem;
    background: white;
    border: 3px solid #e2e8f0;
    border-radius: 1rem;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
  }

  .option-card:hover:not(.disabled) {
    border-color: #3b82f6;
    background: #eff6ff;
    transform: translateY(-2px);
  }

  .option-card.selected {
    border-color: #3b82f6;
    background: #eff6ff;
  }

  .option-card.correct {
    border-color: #22c55e;
    background: #f0fdf4;
  }

  .option-card.wrong {
    border-color: #ef4444;
    background: #fef2f2;
  }

  .option-card.disabled {
    cursor: default;
  }

  .option-label {
    font-size: 0.9rem;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .option-text {
    font-size: 1.2rem;
    font-weight: 600;
    color: #1e293b;
    text-align: center;
  }

  .result-icon {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    font-size: 1.25rem;
  }

  /* Explanation */
  .explanation-box {
    padding: 1.25rem;
    border-radius: 1rem;
    border: 2px solid;
  }

  .explanation-box.correct {
    background: #f0fdf4;
    border-color: #22c55e;
  }

  .explanation-box.wrong {
    background: #fef2f2;
    border-color: #fecaca;
  }

  .explanation-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 700;
    margin-bottom: 0.75rem;
  }

  .explanation-box.correct .explanation-header {
    color: #15803d;
  }

  .explanation-box.wrong .explanation-header {
    color: #b91c1c;
  }

  .header-icon {
    font-size: 1.25rem;
  }

  .explanation-text {
    color: #334155;
    line-height: 1.6;
    margin: 0;
  }

  .persian-note {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px dashed #cbd5e1;
  }

  .note-label {
    font-weight: 600;
    color: #475569;
    display: block;
    margin-bottom: 0.5rem;
  }

  .persian-note p {
    margin: 0;
    color: #64748b;
    line-height: 1.5;
  }

  /* Retry */
  .retry-btn {
    align-self: center;
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
