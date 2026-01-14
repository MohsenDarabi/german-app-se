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

    // Get the actual German text for review system
    const userText = choice === "formal" ? step.formalOption.text : step.informalOption.text;
    const correctText = step.correctAnswer === "formal" ? step.formalOption.text : step.informalOption.text;

    dispatch('answer', {
      correct: choice === step.correctAnswer,
      userAnswer: userText,
      correctAnswer: correctText,
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

  <!-- Options - labels hidden until answered -->
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
      <span class="option-text">{step.formalOption.text}</span>
      {#if isAnswered}
        <span class="option-label revealed" dir="rtl">{step.formalOption.label || 'رسمی (Sie)'}</span>
        {#if step.correctAnswer === "formal"}
          <span class="result-icon">✅</span>
        {:else if selectedAnswer === "formal"}
          <span class="result-icon">❌</span>
        {/if}
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
      <span class="option-text">{step.informalOption.text}</span>
      {#if isAnswered}
        <span class="option-label revealed" dir="rtl">{step.informalOption.label || 'غیررسمی (Du)'}</span>
        {#if step.correctAnswer === "informal"}
          <span class="result-icon">✅</span>
        {:else if selectedAnswer === "informal"}
          <span class="result-icon">❌</span>
        {/if}
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
    gap: var(--space-6, 1.5rem);
  }

  .instruction {
    font-size: var(--text-xl, 1.25rem);
    font-weight: var(--font-bold, 700);
    color: var(--color-neutral-800, #292524);
    text-align: center;
    margin: 0;
  }

  /* Scenario */
  .scenario-box {
    display: flex;
    align-items: flex-start;
    gap: var(--space-4, 1rem);
    padding: var(--space-4, 1rem);
    background: var(--glass-bg, rgba(253, 251, 247, 0.85));
    border: 2px solid var(--glass-border, rgba(212, 201, 185, 0.5));
    border-radius: var(--radius-xl, 1rem);
    backdrop-filter: blur(var(--glass-blur, 12px));
  }

  .scenario-icon {
    font-size: 2.5rem;
    flex-shrink: 0;
  }

  .scenario-text {
    font-size: var(--text-lg, 1.125rem);
    color: var(--color-neutral-700, #44403c);
    line-height: 1.7;
    margin: 0;
  }

  /* Options */
  .options-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-4, 1rem);
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
    gap: var(--space-3, 0.75rem);
    padding: var(--space-6, 1.5rem) var(--space-4, 1rem);
    background: var(--glass-bg, rgba(253, 251, 247, 0.95));
    border: 3px solid var(--glass-border, rgba(212, 201, 185, 0.5));
    border-radius: var(--radius-xl, 1rem);
    cursor: pointer;
    transition: all var(--transition-normal, 200ms);
    position: relative;
    min-height: 120px;
  }

  .option-card:hover:not(.disabled) {
    border-color: var(--color-primary-400, #22d3ee);
    background: var(--color-primary-50, #ecfeff);
    transform: translateY(-4px);
    box-shadow: var(--shadow-md, 0 4px 15px rgba(0, 0, 0, 0.08));
  }

  .option-card.selected {
    border-color: var(--color-primary-500, #0891b2);
    background: var(--color-primary-100, #cffafe);
  }

  .option-card.correct {
    border-color: var(--color-gem-400, #34d399);
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05));
  }

  .option-card.wrong {
    border-color: var(--color-error-400, #c84b4b);
    background: linear-gradient(135deg, rgba(169, 30, 30, 0.1), rgba(169, 30, 30, 0.05));
  }

  .option-card.disabled {
    cursor: default;
  }

  .option-label {
    font-size: var(--text-sm, 0.875rem);
    font-weight: var(--font-semibold, 600);
    color: var(--color-neutral-500, #78716c);
    letter-spacing: 0.5px;
  }

  .option-label.revealed {
    margin-top: var(--space-2, 0.5rem);
    padding: var(--space-1, 0.25rem) var(--space-3, 0.75rem);
    background: var(--color-neutral-100, #f5f0e8);
    border-radius: var(--radius-full, 9999px);
    font-size: var(--text-sm, 0.875rem);
  }

  .option-text {
    font-size: var(--text-lg, 1.125rem);
    font-weight: var(--font-semibold, 600);
    color: var(--color-neutral-800, #292524);
    text-align: center;
  }

  .result-icon {
    position: absolute;
    top: var(--space-2, 0.5rem);
    right: var(--space-2, 0.5rem);
    font-size: 1.25rem;
  }

  /* Explanation */
  .explanation-box {
    padding: var(--space-4, 1rem);
    border-radius: var(--radius-xl, 1rem);
    border: 2px solid;
  }

  .explanation-box.correct {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05));
    border-color: var(--color-gem-400, #34d399);
  }

  .explanation-box.wrong {
    background: linear-gradient(135deg, rgba(169, 30, 30, 0.1), rgba(169, 30, 30, 0.05));
    border-color: var(--color-error-400, #c84b4b);
  }

  .explanation-header {
    display: flex;
    align-items: center;
    gap: var(--space-2, 0.5rem);
    font-weight: var(--font-bold, 700);
    margin-bottom: var(--space-3, 0.75rem);
  }

  .explanation-box.correct .explanation-header {
    color: var(--color-gem-700, #047857);
  }

  .explanation-box.wrong .explanation-header {
    color: var(--color-error-600, #8b1a1a);
  }

  .header-icon {
    font-size: 1.25rem;
  }

  .explanation-text {
    color: var(--color-neutral-700, #44403c);
    line-height: 1.7;
    margin: 0;
  }

  .persian-note {
    margin-top: var(--space-4, 1rem);
    padding-top: var(--space-4, 1rem);
    border-top: 1px dashed var(--color-neutral-300, #d4c9b9);
  }

  .note-label {
    font-weight: var(--font-semibold, 600);
    color: var(--color-neutral-600, #57534e);
    display: block;
    margin-bottom: var(--space-2, 0.5rem);
  }

  .persian-note p {
    margin: 0;
    color: var(--color-neutral-500, #78716c);
    line-height: 1.6;
  }

  /* Retry */
  .retry-btn {
    align-self: center;
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
  :global([data-theme="dark"]) .instruction {
    color: var(--color-neutral-100, #f5f0e8);
  }

  :global([data-theme="dark"]) .scenario-box {
    background: rgba(28, 25, 23, 0.85);
  }

  :global([data-theme="dark"]) .scenario-text {
    color: var(--color-neutral-200, #e8e0d5);
  }

  :global([data-theme="dark"]) .option-card {
    background: rgba(28, 25, 23, 0.95);
  }

  :global([data-theme="dark"]) .option-text {
    color: var(--color-neutral-100, #f5f0e8);
  }

  :global([data-theme="dark"]) .explanation-text {
    color: var(--color-neutral-200, #e8e0d5);
  }
</style>
