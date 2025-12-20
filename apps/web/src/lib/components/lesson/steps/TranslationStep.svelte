<script lang="ts">
  import type { TranslationStep } from "$lib/content-model";
  import { createEventDispatcher } from "svelte";
  import BiDiText from "$lib/components/ui/BiDiText.svelte";
  import { detectDirection } from "$lib/utils/bidi";

  export let step: TranslationStep;

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
      <p class="correct-translation">{step.correctTranslation.de}</p>
    </div>
  {/if}

  {#if canRetry}
    <div class="retry-section">
      <p class="feedback-text">پاسخ صحیح نیست!</p>
      <p class="correct-answer">
        <strong>پاسخ صحیح:</strong> {step.correctTranslation.de}
      </p>
      {#if step.feedback?.explanation}
        <p class="explanation">{step.feedback.explanation}</p>
      {/if}
      <button class="retry-btn" on:click={retry}>تلاش مجدد</button>
    </div>
  {/if}
</div>

<style>
  .translation-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .source-text {
    text-align: center;
  }

  .source-text .label {
    display: block;
    font-size: 0.9rem;
    color: #64748b;
    margin-bottom: 0.5rem;
  }

  .source-text .text {
    font-size: 1.3rem;
    color: #1e293b;
    font-weight: 600;
    margin: 0;
  }

  .answer-area {
    padding: 1.5rem;
    background: #f8fafc;
    border: 2px dashed #cbd5e1;
    border-radius: 1rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
    align-items: baseline;
    font-size: 1.2rem;
    min-height: 4rem;
  }

  .answer-area.correct {
    background: #f0fdf4;
    border-color: #22c55e;
    border-style: solid;
  }

  .answer-area.wrong {
    background: #fef2f2;
    border-color: #ef4444;
    border-style: solid;
  }

  .text-part {
    color: #64748b;
  }

  .blank-wrapper {
    display: inline-block;
    margin: 0 0.125rem;
  }

  .empty-blank {
    display: inline-block;
    min-width: 3rem;
    border-bottom: 2px dashed #94a3b8;
    color: #94a3b8;
    text-align: center;
  }

  .filled-blank {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    background: #dbeafe;
    border: none;
    border-radius: 0.5rem;
    color: #1e40af;
    font-weight: 600;
    font-size: 1.1rem;
    cursor: pointer;
  }

  .filled-blank:hover:not(:disabled) {
    background: #bfdbfe;
  }

  .filled-blank.correct-word {
    background: #dcfce7;
    color: #15803d;
  }

  .filled-blank.wrong-word {
    background: #fee2e2;
    color: #b91c1c;
  }

  .filled-blank:disabled {
    cursor: default;
  }

  .options-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: center;
  }

  .option-btn {
    padding: 0.75rem 1.25rem;
    border: 2px solid #e2e8f0;
    border-radius: 0.75rem;
    background: white;
    font-size: 1rem;
    color: #334155;
    cursor: pointer;
    transition: all 0.2s;
  }

  .option-btn:hover:not(:disabled) {
    border-color: #3b82f6;
    background: #eff6ff;
  }

  .option-btn.used {
    opacity: 0.3;
    cursor: default;
  }

  .option-btn:disabled {
    cursor: default;
  }

  .check-btn {
    padding: 1rem 2rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 999px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    align-self: center;
  }

  .check-btn:hover {
    background: #2563eb;
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
  }

  .feedback-text.success {
    color: #15803d;
    font-size: 1.2rem;
  }

  .retry-section .feedback-text {
    color: #b91c1c;
  }

  .correct-answer, .correct-translation {
    color: #1e293b;
    margin: 0;
  }

  .explanation {
    color: #64748b;
    font-size: 0.95rem;
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
    margin-top: 0.5rem;
  }

  .retry-btn:hover {
    background: #dc2626;
  }
</style>
