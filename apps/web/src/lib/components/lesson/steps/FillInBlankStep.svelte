<script lang="ts">
  import type { FillInBlankStep } from "@pkg/content-model";
  import { createEventDispatcher } from "svelte";
  import BiDiText from "$lib/components/ui/BiDiText.svelte";
  import AudioButton from "$lib/components/ui/AudioButton.svelte";
  import { detectDirection } from "$lib/utils/bidi";

  export let step: FillInBlankStep;
  export let lessonId: string = '';

  const dispatch = createEventDispatcher();

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

<div class="fill-blank-container">
  {#if step.instruction}
    <p class="instruction" dir="rtl"><BiDiText text={step.instruction} /></p>
  {/if}

  <div class="sentence-area" dir={sentenceDir}>
    {#each parts as part}
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
    {#each step.options as option, i}
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
      <p class="feedback-text">دوباره امتحان کنید!</p>
      {#if step.feedback?.explanation}
        <p class="explanation" dir="rtl"><BiDiText text={step.feedback.explanation} /></p>
      {/if}
      <button class="retry-btn" on:click={retry}>تلاش مجدد</button>
    </div>
  {/if}
</div>

<style>
  .fill-blank-container {
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

  .sentence-area {
    font-size: 1.3rem;
    line-height: 2;
    text-align: center;
    padding: 1.5rem;
    background: #f8fafc;
    border-radius: 1rem;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: baseline;
    gap: 0.25rem;
  }

  .text-part {
    color: #1e293b;
  }

  .blank-wrapper {
    display: inline-block;
    margin: 0 0.25rem;
  }

  .empty-blank {
    display: inline-block;
    min-width: 4rem;
    border-bottom: 2px dashed #94a3b8;
    color: #94a3b8;
    text-align: center;
  }

  .filled-blank {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    background: #dbeafe;
    border-radius: 0.5rem;
    color: #1e40af;
    font-weight: 600;
  }

  .filled-blank.correct {
    background: #dcfce7;
    color: #15803d;
  }

  .filled-blank.wrong {
    background: #fee2e2;
    color: #b91c1c;
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

  .option-btn.selected {
    opacity: 0.5;
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
    padding: 1rem;
    background: #f0fdf4;
    border: 2px solid #86efac;
    border-radius: 0.75rem;
    text-align: center;
  }

  .audio-row {
    display: flex;
    justify-content: center;
    margin-top: 0.75rem;
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
  }

  .feedback-text {
    font-weight: 600;
    text-align: center;
    margin: 0;
  }

  .feedback-text.success {
    color: #15803d;
  }

  .retry-section .feedback-text {
    color: #b91c1c;
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
  }

  .retry-btn:hover {
    background: #dc2626;
  }
</style>
