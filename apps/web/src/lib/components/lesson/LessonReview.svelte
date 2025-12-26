<script lang="ts">
  import type { WrongAnswer } from '$lib/db';
  import { createEventDispatcher, onMount } from 'svelte';

  export let wrongAnswers: WrongAnswer[];

  const dispatch = createEventDispatcher();

  let currentReviewIndex = 0;
  let selectedAnswer: string | null = null;
  let reviewCorrect: Set<number> = new Set();

  $: currentWrong = wrongAnswers[currentReviewIndex];
  $: allReviewed = reviewCorrect.size === wrongAnswers.length;
  $: isLastReview = currentReviewIndex === wrongAnswers.length - 1;

  // Extract options from the original question if available
  // For now, we'll create a simple quiz with the correct answer and the user's wrong answer
  function getOptions(wrong: typeof currentWrong) {
    if (!wrong) return [];
    return [wrong.correctAnswer, wrong.userAnswer]
      .filter((v, i, arr) => v && v !== 'unknown' && arr.indexOf(v) === i);
  }

  $: options = getOptions(currentWrong);

  // Skip corrupted data - use onMount and function instead of reactive statement
  function skipIfCorrupted() {
    if (currentWrong && options.length === 0) {
      reviewCorrect.add(currentReviewIndex);
      reviewCorrect = reviewCorrect;
      if (!isLastReview) {
        setTimeout(() => { currentReviewIndex++; skipIfCorrupted(); }, 0);
      }
    }
  }

  // Check on mount
  onMount(() => skipIfCorrupted());

  function selectOption(option: string) {
    if (selectedAnswer) return; // Already answered this review

    selectedAnswer = option;

    if (option === currentWrong.correctAnswer) {
      // Correct! Mark as reviewed
      reviewCorrect.add(currentReviewIndex);
      reviewCorrect = reviewCorrect; // Trigger reactivity

      // Auto-advance after a short delay
      setTimeout(() => {
        if (!isLastReview) {
          currentReviewIndex++;
          selectedAnswer = null;
        }
      }, 1000);
    }
  }

  function retry() {
    selectedAnswer = null;
  }

  function completeReview() {
    dispatch('complete', {
      reviewedIds: wrongAnswers.map(w => w.id!)
    });
  }
</script>

<div class="review-container" dir="rtl">
  <div class="review-header">
    <h2>📝 زمان مرور!</h2>
    <p>بیایید سوالاتی که اشتباه پاسخ دادید را تمرین کنیم.</p>
    <div class="review-progress">
      {currentReviewIndex + 1} / {wrongAnswers.length}
    </div>
  </div>

  {#if currentWrong}
    <div class="review-question-card">
      <h3 class="question">{currentWrong.question || `سوال ${currentReviewIndex + 1}`}</h3>

      <div class="options-grid">
        {#each options as option}
          <button
            class="option-btn"
            class:selected={selectedAnswer === option}
            class:correct={selectedAnswer && option === currentWrong.correctAnswer}
            class:wrong={selectedAnswer === option && option !== currentWrong.correctAnswer}
            on:click={() => selectOption(option)}
            disabled={!!selectedAnswer}
          >
            {option}

            {#if selectedAnswer && option === currentWrong.correctAnswer}
              <span class="icon">✅</span>
            {:else if selectedAnswer === option && option !== currentWrong.correctAnswer}
              <span class="icon">❌</span>
            {/if}
          </button>
        {/each}
      </div>

      {#if selectedAnswer && selectedAnswer !== currentWrong.correctAnswer}
        <div class="retry-section">
          <p class="feedback-text">دوباره امتحان کنید!</p>
          <button class="retry-btn" on:click={retry}>
            🔄 تلاش مجدد
          </button>
        </div>
      {/if}
    </div>
  {/if}

  {#if allReviewed}
    <div class="completion-section">
      <h3>🎉 آفرین!</h3>
      <p>شما همه سوالات را مرور کردید. حالا آماده تکمیل درس هستید.</p>
      <button class="complete-btn" on:click={completeReview}>
        تکمیل درس
      </button>
    </div>
  {/if}
</div>

<style>
  .review-container {
    max-width: 600px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  .review-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .review-header h2 {
    font-size: 1.8rem;
    color: #1e293b;
    margin-bottom: 0.5rem;
  }

  .review-header p {
    color: #64748b;
    margin-bottom: 1rem;
  }

  .review-progress {
    display: inline-block;
    padding: 0.5rem 1rem;
    background: #e0f2fe;
    color: #0369a1;
    border-radius: 999px;
    font-weight: 600;
    font-size: 0.9rem;
  }

  .review-question-card {
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 1rem;
    padding: 2rem;
    margin-bottom: 2rem;
  }

  .question {
    font-size: 1.3rem;
    font-weight: 700;
    color: #1e293b;
    text-align: center;
    margin-bottom: 1.5rem;
  }

  .options-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.75rem;
    margin-bottom: 1rem;
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

  .option-btn:hover:not(:disabled) {
    border-color: #cbd5e1;
    background: #f8fafc;
  }

  .option-btn.correct {
    border-color: #22c55e;
    background: #f0fdf4;
    color: #15803d;
    font-weight: 600;
  }

  .option-btn.wrong {
    border-color: #ef4444;
    background: #fef2f2;
    color: #b91c1c;
  }

  .option-btn:disabled {
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

  .completion-section {
    text-align: center;
    padding: 2rem;
    background: #f0fdf4;
    border: 2px solid #86efac;
    border-radius: 1rem;
  }

  .completion-section h3 {
    font-size: 1.5rem;
    color: #15803d;
    margin-bottom: 0.5rem;
  }

  .completion-section p {
    color: #166534;
    margin-bottom: 1.5rem;
  }

  .complete-btn {
    padding: 1rem 2rem;
    background: #22c55e;
    color: white;
    border: none;
    border-radius: 999px;
    font-size: 1.1rem;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.2s;
  }

  .complete-btn:hover {
    background: #16a34a;
  }
</style>
