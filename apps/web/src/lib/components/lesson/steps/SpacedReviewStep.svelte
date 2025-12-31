<script lang="ts">
  import type { SpacedReviewStep, ReviewWord } from "$lib/content-model";
  import { createEventDispatcher } from "svelte";

  export let step: SpacedReviewStep;
  export let lessonId: string = '';

  const dispatch = createEventDispatcher();

  interface ReviewedWord extends ReviewWord {
    rating: 'easy' | 'medium' | 'hard' | null;
    revealed: boolean;
  }

  let words: ReviewedWord[] = step.words.map(w => ({
    ...w,
    rating: null,
    revealed: false
  }));

  let currentIndex = 0;
  let reviewComplete = false;

  // Stats
  let easyCount = 0;
  let mediumCount = 0;
  let hardCount = 0;

  $: currentWord = words[currentIndex];
  $: progress = (currentIndex / words.length) * 100;
  $: totalReviewed = easyCount + mediumCount + hardCount;

  function revealWord() {
    if (currentWord) {
      words[currentIndex].revealed = true;
      words = words;
    }
  }

  function rateWord(rating: 'easy' | 'medium' | 'hard') {
    if (!currentWord) return;

    words[currentIndex].rating = rating;
    words = words;

    // Update counts
    if (rating === 'easy') easyCount++;
    else if (rating === 'medium') mediumCount++;
    else if (rating === 'hard') hardCount++;

    // Move to next or complete
    if (currentIndex < words.length - 1) {
      currentIndex++;
    } else {
      completeReview();
    }
  }

  function completeReview() {
    reviewComplete = true;

    // Calculate mastery score (easy = 100%, medium = 70%, hard = 40%)
    const masteryScore = Math.round(
      ((easyCount * 100) + (mediumCount * 70) + (hardCount * 40)) / words.length
    );

    dispatch('answer', {
      correct: masteryScore >= 60,
      userAnswer: `Easy: ${easyCount}, Medium: ${mediumCount}, Hard: ${hardCount}`,
      correctAnswer: `Mastery: ${masteryScore}%`,
      allowContinue: true
    });
  }

  function getMasteryEmoji(): string {
    const masteryScore = ((easyCount * 100) + (mediumCount * 70) + (hardCount * 40)) / words.length;
    if (masteryScore >= 90) return '🏆';
    if (masteryScore >= 70) return '🌟';
    if (masteryScore >= 50) return '💪';
    return '📚';
  }
</script>

<div class="review-container">
  {#if !reviewComplete}
    <!-- Progress -->
    <div class="progress-section">
      <div class="progress-bar">
        <div class="progress-fill" style="width: {progress}%"></div>
      </div>
      <span class="progress-text">{currentIndex + 1} / {words.length}</span>
    </div>

    <!-- Instruction -->
    <h2 class="instruction" dir="rtl">{step.instruction}</h2>

    <!-- Flashcard -->
    <div class="flashcard" class:revealed={currentWord?.revealed}>
      <div class="card-front">
        <span class="german-word">{currentWord?.german}</span>
        <span class="flag">🇩🇪</span>

        {#if !currentWord?.revealed}
          <button class="reveal-btn" on:click={revealWord}>
            نمایش ترجمه 👀
          </button>
        {/if}
      </div>

      {#if currentWord?.revealed}
        <div class="card-back">
          <span class="persian-word" dir="rtl">{currentWord?.persian}</span>
          <span class="flag">🇮🇷</span>

          {#if step.showExamples && currentWord?.example}
            <div class="example">
              <span class="example-label">مثال:</span>
              <span class="example-text">{currentWord.example}</span>
            </div>
          {/if}
        </div>

        <!-- Rating buttons -->
        <div class="rating-section">
          <p class="rating-prompt" dir="rtl">این کلمه چقدر برایتان آسان بود؟</p>
          <div class="rating-buttons">
            <button class="rating-btn easy" on:click={() => rateWord('easy')}>
              <span class="rating-icon">😊</span>
              <span class="rating-label">آسان</span>
            </button>
            <button class="rating-btn medium" on:click={() => rateWord('medium')}>
              <span class="rating-icon">🤔</span>
              <span class="rating-label">متوسط</span>
            </button>
            <button class="rating-btn hard" on:click={() => rateWord('hard')}>
              <span class="rating-icon">😓</span>
              <span class="rating-label">سخت</span>
            </button>
          </div>
        </div>
      {/if}
    </div>

    <!-- Stats bar -->
    <div class="stats-bar">
      <div class="stat easy">
        <span class="stat-emoji">😊</span>
        <span class="stat-count">{easyCount}</span>
      </div>
      <div class="stat medium">
        <span class="stat-emoji">🤔</span>
        <span class="stat-count">{mediumCount}</span>
      </div>
      <div class="stat hard">
        <span class="stat-emoji">😓</span>
        <span class="stat-count">{hardCount}</span>
      </div>
    </div>
  {:else}
    <!-- Completion screen -->
    <div class="completion-screen">
      <span class="completion-emoji">{getMasteryEmoji()}</span>
      <h2 class="completion-title" dir="rtl">مرور کامل شد!</h2>

      <div class="final-stats">
        <div class="final-stat">
          <span class="final-emoji">😊</span>
          <span class="final-count">{easyCount}</span>
          <span class="final-label" dir="rtl">آسان</span>
        </div>
        <div class="final-stat">
          <span class="final-emoji">🤔</span>
          <span class="final-count">{mediumCount}</span>
          <span class="final-label" dir="rtl">متوسط</span>
        </div>
        <div class="final-stat">
          <span class="final-emoji">😓</span>
          <span class="final-count">{hardCount}</span>
          <span class="final-label" dir="rtl">سخت</span>
        </div>
      </div>

      <div class="mastery-bar">
        <div class="mastery-fill" style="width: {((easyCount * 100) + (mediumCount * 70) + (hardCount * 40)) / words.length}%"></div>
      </div>
      <p class="mastery-text" dir="rtl">
        میزان تسلط: {Math.round(((easyCount * 100) + (mediumCount * 70) + (hardCount * 40)) / words.length)}%
      </p>

      <p class="tip" dir="rtl">
        💡 کلمات سخت را بیشتر تمرین کنید!
      </p>
    </div>
  {/if}
</div>

<style>
  .review-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 1rem;
    max-width: 400px;
    margin: 0 auto;
  }

  /* Progress */
  .progress-section {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .progress-bar {
    flex: 1;
    height: 8px;
    background: #e2e8f0;
    border-radius: 999px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #8b5cf6, #7c3aed);
    transition: width 0.3s;
  }

  .progress-text {
    font-size: 0.9rem;
    font-weight: 600;
    color: #64748b;
    min-width: 50px;
  }

  .instruction {
    font-size: 1rem;
    font-weight: 600;
    color: #475569;
    text-align: center;
    margin: 0;
  }

  /* Flashcard */
  .flashcard {
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 1.5rem;
    padding: 2rem;
    text-align: center;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  }

  .flashcard.revealed {
    border-color: #8b5cf6;
  }

  .card-front, .card-back {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .card-back {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 2px dashed #e2e8f0;
  }

  .german-word {
    font-size: 2rem;
    font-weight: 700;
    color: #1e293b;
  }

  .persian-word {
    font-size: 1.5rem;
    font-weight: 600;
    color: #7c3aed;
  }

  .flag {
    font-size: 1.5rem;
  }

  .reveal-btn {
    margin-top: 1rem;
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
    border: none;
    border-radius: 999px;
    color: white;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s;
  }

  .reveal-btn:hover {
    transform: scale(1.05);
  }

  .example {
    margin-top: 1rem;
    padding: 0.75rem;
    background: #f8fafc;
    border-radius: 0.75rem;
    width: 100%;
  }

  .example-label {
    font-size: 0.8rem;
    color: #64748b;
    display: block;
    margin-bottom: 0.25rem;
  }

  .example-text {
    font-size: 0.95rem;
    color: #475569;
    font-style: italic;
  }

  /* Rating */
  .rating-section {
    margin-top: 1.5rem;
  }

  .rating-prompt {
    font-size: 0.9rem;
    color: #64748b;
    margin: 0 0 1rem 0;
  }

  .rating-buttons {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
  }

  .rating-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 0.75rem 1.25rem;
    border: 2px solid #e2e8f0;
    border-radius: 1rem;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
  }

  .rating-btn.easy:hover {
    border-color: #22c55e;
    background: #f0fdf4;
  }

  .rating-btn.medium:hover {
    border-color: #f59e0b;
    background: #fffbeb;
  }

  .rating-btn.hard:hover {
    border-color: #ef4444;
    background: #fef2f2;
  }

  .rating-icon {
    font-size: 1.5rem;
  }

  .rating-label {
    font-size: 0.85rem;
    font-weight: 600;
    color: #475569;
  }

  /* Stats bar */
  .stats-bar {
    display: flex;
    justify-content: center;
    gap: 2rem;
  }

  .stat {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 999px;
  }

  .stat.easy {
    background: #dcfce7;
  }

  .stat.medium {
    background: #fef3c7;
  }

  .stat.hard {
    background: #fee2e2;
  }

  .stat-emoji {
    font-size: 1.2rem;
  }

  .stat-count {
    font-size: 1.1rem;
    font-weight: 700;
    color: #1e293b;
  }

  /* Completion screen */
  .completion-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 2rem;
    text-align: center;
  }

  .completion-emoji {
    font-size: 4rem;
    animation: bounce 0.6s ease-in-out infinite alternate;
  }

  @keyframes bounce {
    from { transform: translateY(0); }
    to { transform: translateY(-10px); }
  }

  .completion-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
  }

  .final-stats {
    display: flex;
    gap: 1.5rem;
    margin: 1rem 0;
  }

  .final-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 1rem;
    background: #f8fafc;
    border-radius: 1rem;
    min-width: 70px;
  }

  .final-emoji {
    font-size: 1.5rem;
  }

  .final-count {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
  }

  .final-label {
    font-size: 0.8rem;
    color: #64748b;
  }

  .mastery-bar {
    width: 100%;
    height: 12px;
    background: #e2e8f0;
    border-radius: 999px;
    overflow: hidden;
  }

  .mastery-fill {
    height: 100%;
    background: linear-gradient(90deg, #22c55e, #16a34a);
    transition: width 0.5s;
  }

  .mastery-text {
    font-size: 1.1rem;
    font-weight: 600;
    color: #166534;
    margin: 0.5rem 0 0 0;
  }

  .tip {
    font-size: 0.9rem;
    color: #64748b;
    margin: 1rem 0 0 0;
    padding: 0.75rem;
    background: #fef3c7;
    border-radius: 0.75rem;
  }
</style>
