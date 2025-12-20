<script lang="ts">
  import type { WordOrderStep } from "$lib/content-model";
  import { createEventDispatcher } from "svelte";

  export let step: WordOrderStep;

  const dispatch = createEventDispatcher();

  let selectedWords: number[] = [];
  let isAnswered = false;
  let isCorrect = false;
  let canRetry = false;

  $: availableWords = step.words.map((_, i) => i).filter(i => !selectedWords.includes(i));

  function selectWord(index: number) {
    if (isAnswered) return;
    selectedWords = [...selectedWords, index];
  }

  function removeWord(position: number) {
    if (isAnswered) return;
    selectedWords = selectedWords.filter((_, i) => i !== position);
  }

  function checkAnswer() {
    if (selectedWords.length !== step.words.length) return;

    isAnswered = true;
    isCorrect = selectedWords.every((wordIdx, i) => wordIdx === step.correctOrder[i]);

    if (!isCorrect) {
      canRetry = true;
    }

    dispatch('answer', {
      correct: isCorrect,
      allowContinue: isCorrect
    });
  }

  function retry() {
    selectedWords = [];
    isAnswered = false;
    isCorrect = false;
    canRetry = false;
  }
</script>

<div class="word-order-container">
  {#if step.instruction}
    <p class="instruction">{step.instruction}</p>
  {/if}

  <div class="answer-area" class:correct={isAnswered && isCorrect} class:wrong={isAnswered && !isCorrect}>
    {#if selectedWords.length === 0}
      <span class="placeholder">Tap words below to build the sentence</span>
    {:else}
      {#each selectedWords as wordIdx, i}
        <button
          class="word-chip selected"
          on:click={() => removeWord(i)}
          disabled={isAnswered}
        >
          {step.words[wordIdx]}
        </button>
      {/each}
    {/if}
  </div>

  <div class="words-pool">
    {#each step.words as word, i}
      <button
        class="word-chip"
        class:used={selectedWords.includes(i)}
        on:click={() => selectWord(i)}
        disabled={isAnswered || selectedWords.includes(i)}
      >
        {word}
      </button>
    {/each}
  </div>

  {#if !isAnswered && selectedWords.length === step.words.length}
    <button class="check-btn" on:click={checkAnswer}>
      Check Answer
    </button>
  {/if}

  {#if isAnswered && isCorrect}
    <div class="success-section">
      <p class="feedback-text success">Correct!</p>
      <p class="translation">{step.correctSentence.fa}</p>
    </div>
  {/if}

  {#if canRetry}
    <div class="retry-section">
      <p class="feedback-text">Not quite right!</p>
      <p class="correct-answer">
        <strong>Correct:</strong> {step.correctSentence.de}
      </p>
      <p class="translation">{step.correctSentence.fa}</p>
      {#if step.feedback?.explanation}
        <p class="explanation">{step.feedback.explanation}</p>
      {/if}
      <button class="retry-btn" on:click={retry}>Retry</button>
    </div>
  {/if}
</div>

<style>
  .word-order-container {
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

  .answer-area {
    min-height: 4rem;
    padding: 1rem;
    background: #f8fafc;
    border: 2px dashed #cbd5e1;
    border-radius: 1rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
    align-items: center;
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

  .placeholder {
    color: #94a3b8;
    font-style: italic;
  }

  .words-pool {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: center;
  }

  .word-chip {
    padding: 0.75rem 1.25rem;
    border: 2px solid #e2e8f0;
    border-radius: 0.75rem;
    background: white;
    font-size: 1rem;
    color: #334155;
    cursor: pointer;
    transition: all 0.2s;
  }

  .word-chip:hover:not(:disabled) {
    border-color: #3b82f6;
    background: #eff6ff;
  }

  .word-chip.used {
    opacity: 0.3;
    cursor: default;
  }

  .word-chip.selected {
    background: #dbeafe;
    border-color: #3b82f6;
    color: #1e40af;
  }

  .word-chip:disabled {
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

  .correct-answer {
    color: #1e293b;
    margin: 0;
  }

  .translation {
    color: #64748b;
    font-style: italic;
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
