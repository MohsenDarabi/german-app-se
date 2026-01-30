<script lang="ts">
  import type { WordOrderStep } from "@pkg/content-model";
  import { createEventDispatcher } from "svelte";
  import BiDiText from "$lib/components/ui/BiDiText.svelte";
  import AudioButton from "$lib/components/ui/AudioButton.svelte";
  import { detectDirection } from "$lib/utils/bidi";

  export let step: WordOrderStep;
  export let lessonId: string = '';

  const dispatch = createEventDispatcher<{ answer: { correct: boolean; allowContinue: boolean } }>();

  let selectedWords: number[] = [];
  let isAnswered = false;
  let isCorrect = false;
  let canRetry = false;

  $: availableWords = step.words.map((_, i) => i).filter(i => !selectedWords.includes(i));
  // Detect direction from the correct sentence or words
  $: sentenceDir = detectDirection(step.correctSentence?.de || step.words.join(' '));

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
    <p class="instruction" dir="rtl"><BiDiText text={step.instruction} /></p>
  {/if}

  <div class="answer-area" dir={sentenceDir} class:correct={isAnswered && isCorrect} class:wrong={isAnswered && !isCorrect}>
    {#if selectedWords.length === 0}
      <span class="placeholder">روی کلمات زیر بزنید تا جمله بسازید</span>
    {:else}
      {#each selectedWords as wordIdx, i (i)}
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

  <div class="words-pool" dir={sentenceDir}>
    {#each step.words as word, i (i)}
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
      بررسی پاسخ
    </button>
  {/if}

  {#if isAnswered && isCorrect}
    <div class="success-section">
      <p class="feedback-text success">آفرین! صحیح است</p>
      <div class="audio-row">
        <AudioButton
          text={step.correctSentence.de}
          {lessonId}
          audioId="{step.id}-sentence"
          size="md"
        />
      </div>
      <p class="translation">{step.correctSentence.fa}</p>
    </div>
  {/if}

  {#if canRetry}
    <div class="retry-section">
      <p class="feedback-text">پاسخ صحیح نیست!</p>
      <p class="correct-answer">
        <strong>پاسخ صحیح:</strong> {step.correctSentence.de}
      </p>
      <p class="translation">{step.correctSentence.fa}</p>
      {#if step.feedback?.explanation}
        <p class="explanation" dir="rtl"><BiDiText text={step.feedback.explanation} /></p>
      {/if}
      <button class="retry-btn" on:click={retry}>تلاش مجدد</button>
    </div>
  {/if}
</div>

<style>
  .word-order-container {
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

  .answer-area {
    min-height: 4rem;
    padding: var(--space-4, 1rem);
    background: var(--glass-bg, rgba(253, 251, 247, 0.85));
    border: 2px dashed var(--color-neutral-300, #d4c9b9);
    border-radius: var(--radius-xl, 1rem);
    backdrop-filter: blur(var(--glass-blur, 12px));
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2, 0.5rem);
    justify-content: center;
    align-items: center;
    transition: all var(--transition-normal, 200ms);
  }

  .answer-area.correct {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05));
    border-color: var(--color-gem-400, #34d399);
    border-style: solid;
  }

  .answer-area.wrong {
    background: linear-gradient(135deg, rgba(169, 30, 30, 0.1), rgba(169, 30, 30, 0.05));
    border-color: var(--color-error-400, #c84b4b);
    border-style: solid;
  }

  .placeholder {
    color: var(--color-neutral-400, #a69b8a);
    font-style: italic;
  }

  .words-pool {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3, 0.75rem);
    justify-content: center;
  }

  .word-chip {
    padding: var(--space-3, 0.75rem) var(--space-4, 1rem);
    border: 2px solid var(--glass-border, rgba(212, 201, 185, 0.5));
    border-radius: var(--radius-lg, 0.75rem);
    background: var(--glass-bg, rgba(253, 251, 247, 0.95));
    font-size: var(--text-base, 1rem);
    color: var(--color-neutral-700, #44403c);
    cursor: pointer;
    transition: all var(--transition-normal, 200ms);
    min-height: 44px;
  }

  .word-chip:hover:not(:disabled) {
    border-color: var(--color-primary-400, #22d3ee);
    background: var(--color-primary-50, #ecfeff);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md, 0 4px 15px rgba(0, 0, 0, 0.08));
  }

  .word-chip.used {
    opacity: 0.3;
    cursor: default;
  }

  .word-chip.selected {
    background: linear-gradient(135deg, var(--color-primary-100, #cffafe), var(--color-primary-50, #ecfeff));
    border-color: var(--color-primary-500, #0891b2);
    color: var(--color-primary-700, #155e75);
    font-weight: var(--font-semibold, 600);
  }

  .word-chip:disabled {
    cursor: default;
  }

  .check-btn {
    padding: var(--space-4, 1rem) var(--space-8, 2rem);
    background: linear-gradient(135deg, var(--color-primary-500, #0891b2), var(--color-primary-600, #0e7490));
    color: white;
    border: none;
    border-radius: var(--radius-full, 9999px);
    font-size: var(--text-base, 1rem);
    font-weight: var(--font-semibold, 600);
    cursor: pointer;
    align-self: center;
    transition: all var(--transition-normal, 200ms);
    box-shadow: 0 4px 15px rgba(8, 145, 178, 0.3);
    min-height: 48px;
  }

  .check-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(8, 145, 178, 0.4);
  }

  .success-section {
    padding: var(--space-6, 1.5rem);
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05));
    border: 2px solid var(--color-gem-400, #34d399);
    border-radius: var(--radius-lg, 0.75rem);
    text-align: center;
  }

  .audio-row {
    display: flex;
    justify-content: center;
    margin: var(--space-2, 0.5rem) 0;
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
  }

  .feedback-text.success {
    color: var(--color-gem-600, #059669);
    font-size: var(--text-lg, 1.125rem);
  }

  .retry-section .feedback-text {
    color: var(--color-error-600, #8b1a1a);
  }

  .correct-answer {
    color: var(--color-neutral-800, #292524);
    margin: 0;
  }

  .translation {
    color: var(--color-neutral-500, #78716c);
    font-style: italic;
    margin: 0;
  }

  .explanation {
    color: var(--color-neutral-500, #78716c);
    font-size: var(--text-sm, 0.875rem);
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
    margin-top: var(--space-2, 0.5rem);
    transition: all var(--transition-normal, 200ms);
    min-height: 44px;
  }

  .retry-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(169, 30, 30, 0.3);
  }

  /* Dark Mode */
  :global([data-theme="dark"]) .answer-area {
    background: rgba(28, 25, 23, 0.85);
    border-color: var(--color-neutral-600, #57534e);
  }

  :global([data-theme="dark"]) .word-chip {
    background: rgba(28, 25, 23, 0.95);
    color: var(--color-neutral-200, #e8e0d5);
  }

  :global([data-theme="dark"]) .correct-answer {
    color: var(--color-neutral-100, #f5f0e8);
  }
</style>
