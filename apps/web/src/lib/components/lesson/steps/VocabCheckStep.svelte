<script lang="ts">
  import type { VocabCheckStep, VocabCheckWord } from "$lib/content-model";
  import { createEventDispatcher } from "svelte";

  export let step: VocabCheckStep;
  export let lessonId: string = '';

  const dispatch = createEventDispatcher<{
    answer: { correct: boolean; userAnswer: string; correctAnswer: string; allowContinue: boolean };
  }>();

  interface CheckedWord extends VocabCheckWord {
    rating: 'easy' | 'medium' | 'hard' | null;
    revealed: boolean;
  }

  let words: CheckedWord[] = step.words.map(w => ({
    ...w,
    rating: null,
    revealed: false
  }));

  let currentIndex = 0;
  let checkComplete = false;

  // Stats
  let easyCount = 0;
  let mediumCount = 0;
  let hardCount = 0;

  $: currentWord = words[currentIndex];
  $: progress = (currentIndex / words.length) * 100;
  $: totalChecked = easyCount + mediumCount + hardCount;

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
      completeCheck();
    }
  }

  function completeCheck() {
    checkComplete = true;

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

<div class="check-container">
  {#if !checkComplete}
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
        <span class="german-word">{currentWord?.de}</span>
        <span class="flag">🇩🇪</span>

        {#if !currentWord?.revealed}
          <button class="reveal-btn" on:click={revealWord}>
            نمایش ترجمه 👀
          </button>
        {/if}
      </div>

      {#if currentWord?.revealed}
        <div class="card-back">
          <span class="persian-word" dir="rtl">{currentWord?.fa}</span>
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
  .check-container {
    display: flex;
    flex-direction: column;
    gap: var(--space-6, 1.5rem);
    padding: var(--space-4, 1rem);
    max-width: 400px;
    margin: 0 auto;
  }

  /* Progress */
  .progress-section {
    display: flex;
    align-items: center;
    gap: var(--space-4, 1rem);
  }

  .progress-bar {
    flex: 1;
    height: 8px;
    background: var(--color-neutral-200, #e8e0d5);
    border-radius: var(--radius-full, 9999px);
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--color-xp, #4f46e5), var(--color-xp-light, #818cf8));
    transition: width 0.3s;
  }

  .progress-text {
    font-size: var(--text-sm, 0.875rem);
    font-weight: var(--font-semibold, 600);
    color: var(--color-neutral-500, #78716c);
    min-width: 50px;
  }

  .instruction {
    font-size: var(--text-base, 1rem);
    font-weight: var(--font-semibold, 600);
    color: var(--color-neutral-600, #57534e);
    text-align: center;
    margin: 0;
  }

  /* Flashcard */
  .flashcard {
    background: var(--glass-bg, rgba(253, 251, 247, 0.95));
    border: 2px solid var(--glass-border, rgba(212, 201, 185, 0.5));
    border-radius: var(--radius-xl, 1rem);
    padding: var(--space-8, 2rem);
    text-align: center;
    box-shadow: var(--shadow-lg, 0 8px 30px rgba(0, 0, 0, 0.1));
    backdrop-filter: blur(var(--glass-blur, 12px));
  }

  .flashcard.revealed {
    border-color: var(--color-xp, #4f46e5);
  }

  .card-front, .card-back {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2, 0.5rem);
  }

  .card-back {
    margin-top: var(--space-6, 1.5rem);
    padding-top: var(--space-6, 1.5rem);
    border-top: 2px dashed var(--color-neutral-300, #d4c9b9);
  }

  .german-word {
    font-size: var(--text-3xl, 2rem);
    font-weight: var(--font-bold, 700);
    color: var(--color-neutral-800, #292524);
  }

  .persian-word {
    font-size: var(--text-2xl, 1.5rem);
    font-weight: var(--font-semibold, 600);
    color: var(--color-xp, #4f46e5);
  }

  .flag {
    font-size: 1.5rem;
  }

  .reveal-btn {
    margin-top: var(--space-4, 1rem);
    padding: var(--space-3, 0.75rem) var(--space-6, 1.5rem);
    background: linear-gradient(135deg, var(--color-xp, #4f46e5), var(--color-xp-light, #818cf8));
    border: none;
    border-radius: var(--radius-full, 9999px);
    color: white;
    font-size: var(--text-base, 1rem);
    font-weight: var(--font-semibold, 600);
    cursor: pointer;
    transition: all var(--transition-normal, 200ms);
    min-height: 44px;
  }

  .reveal-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 15px var(--color-xp-glow, rgba(79, 70, 229, 0.4));
  }

  .example {
    margin-top: var(--space-4, 1rem);
    padding: var(--space-3, 0.75rem);
    background: var(--color-neutral-100, #f5f0e8);
    border-radius: var(--radius-lg, 0.75rem);
    width: 100%;
  }

  .example-label {
    font-size: var(--text-sm, 0.875rem);
    color: var(--color-neutral-500, #78716c);
    display: block;
    margin-bottom: var(--space-1, 0.25rem);
  }

  .example-text {
    font-size: var(--text-base, 1rem);
    color: var(--color-neutral-600, #57534e);
    font-style: italic;
  }

  /* Rating */
  .rating-section {
    margin-top: var(--space-6, 1.5rem);
  }

  .rating-prompt {
    font-size: var(--text-sm, 0.875rem);
    color: var(--color-neutral-500, #78716c);
    margin: 0 0 var(--space-4, 1rem) 0;
  }

  .rating-buttons {
    display: flex;
    gap: var(--space-3, 0.75rem);
    justify-content: center;
  }

  .rating-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-1, 0.25rem);
    padding: var(--space-3, 0.75rem) var(--space-4, 1rem);
    border: 2px solid var(--glass-border, rgba(212, 201, 185, 0.5));
    border-radius: var(--radius-xl, 1rem);
    background: var(--color-neutral-50, #fdfbf7);
    cursor: pointer;
    transition: all var(--transition-normal, 200ms);
    min-height: 80px;
    min-width: 80px;
  }

  .rating-btn.easy:hover {
    border-color: var(--color-success-400, #facc15);
    background: linear-gradient(135deg, rgba(234, 179, 8, 0.15), rgba(234, 179, 8, 0.05));
    transform: translateY(-4px);
  }

  .rating-btn.medium:hover {
    border-color: var(--color-streak, #f59e0b);
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.05));
    transform: translateY(-4px);
  }

  .rating-btn.hard:hover {
    border-color: var(--color-error-400, #c84b4b);
    background: linear-gradient(135deg, rgba(169, 30, 30, 0.1), rgba(169, 30, 30, 0.05));
    transform: translateY(-4px);
  }

  .rating-icon {
    font-size: 1.75rem;
  }

  .rating-label {
    font-size: var(--text-sm, 0.875rem);
    font-weight: var(--font-semibold, 600);
    color: var(--color-neutral-600, #57534e);
  }

  /* Stats bar */
  .stats-bar {
    display: flex;
    justify-content: center;
    gap: var(--space-6, 1.5rem);
  }

  .stat {
    display: flex;
    align-items: center;
    gap: var(--space-2, 0.5rem);
    padding: var(--space-2, 0.5rem) var(--space-4, 1rem);
    border-radius: var(--radius-full, 9999px);
  }

  .stat.easy {
    background: linear-gradient(135deg, rgba(234, 179, 8, 0.2), rgba(234, 179, 8, 0.1));
  }

  .stat.medium {
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.1));
  }

  .stat.hard {
    background: linear-gradient(135deg, rgba(169, 30, 30, 0.15), rgba(169, 30, 30, 0.05));
  }

  .stat-emoji {
    font-size: 1.2rem;
  }

  .stat-count {
    font-size: var(--text-lg, 1.125rem);
    font-weight: var(--font-bold, 700);
    color: var(--color-neutral-800, #292524);
  }

  /* Completion screen */
  .completion-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-4, 1rem);
    padding: var(--space-8, 2rem);
    text-align: center;
  }

  .completion-emoji {
    font-size: 5rem;
    animation: bounce 0.6s ease-in-out infinite alternate;
    filter: drop-shadow(0 0 15px rgba(234, 179, 8, 0.5));
  }

  @keyframes bounce {
    from { transform: translateY(0); }
    to { transform: translateY(-12px); }
  }

  .completion-title {
    font-size: var(--text-2xl, 1.5rem);
    font-weight: var(--font-bold, 700);
    background: linear-gradient(135deg, var(--color-success-600, #ca8a04), var(--color-success-500, #eab308));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
  }

  .final-stats {
    display: flex;
    gap: var(--space-4, 1rem);
    margin: var(--space-4, 1rem) 0;
  }

  .final-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-1, 0.25rem);
    padding: var(--space-4, 1rem);
    background: var(--glass-bg, rgba(253, 251, 247, 0.85));
    border: 1px solid var(--glass-border, rgba(212, 201, 185, 0.3));
    border-radius: var(--radius-xl, 1rem);
    min-width: 80px;
  }

  .final-emoji {
    font-size: 1.75rem;
  }

  .final-count {
    font-size: var(--text-2xl, 1.5rem);
    font-weight: var(--font-bold, 700);
    color: var(--color-neutral-800, #292524);
  }

  .final-label {
    font-size: var(--text-sm, 0.875rem);
    color: var(--color-neutral-500, #78716c);
  }

  .mastery-bar {
    width: 100%;
    height: 12px;
    background: var(--color-neutral-200, #e8e0d5);
    border-radius: var(--radius-full, 9999px);
    overflow: hidden;
  }

  .mastery-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--color-success-500, #eab308), var(--color-success-400, #facc15));
    transition: width 0.5s;
  }

  .mastery-text {
    font-size: var(--text-lg, 1.125rem);
    font-weight: var(--font-semibold, 600);
    color: var(--color-success-700, #a16207);
    margin: var(--space-2, 0.5rem) 0 0 0;
  }

  .tip {
    font-size: var(--text-sm, 0.875rem);
    color: var(--color-success-700, #a16207);
    margin: var(--space-4, 1rem) 0 0 0;
    padding: var(--space-3, 0.75rem);
    background: linear-gradient(135deg, rgba(234, 179, 8, 0.2), rgba(234, 179, 8, 0.1));
    border: 1px solid var(--color-success-400, #facc15);
    border-radius: var(--radius-lg, 0.75rem);
  }

  /* Dark Mode - use hardcoded colors since CSS variables swap */
  :global([data-theme="dark"]) .flashcard {
    background: #44403c;
    border-color: #57534e;
  }

  :global([data-theme="dark"]) .german-word {
    color: #f5f0e8;
  }

  :global([data-theme="dark"]) .persian-word {
    color: #a5b4fc;
  }

  :global([data-theme="dark"]) .instruction {
    color: #a69b8a;
  }

  :global([data-theme="dark"]) .progress-text {
    color: #a69b8a;
  }

  :global([data-theme="dark"]) .rating-btn {
    background: #44403c;
    border-color: #57534e;
  }

  :global([data-theme="dark"]) .rating-label {
    color: #e8e0d5;
  }

  :global([data-theme="dark"]) .rating-prompt {
    color: #a69b8a;
  }

  :global([data-theme="dark"]) .stat-count {
    color: #f5f0e8;
  }

  :global([data-theme="dark"]) .final-stat {
    background: #44403c;
    border-color: #57534e;
  }

  :global([data-theme="dark"]) .final-count {
    color: #f5f0e8;
  }

  :global([data-theme="dark"]) .final-label {
    color: #a69b8a;
  }

  :global([data-theme="dark"]) .example {
    background: #292524;
  }

  :global([data-theme="dark"]) .example-label {
    color: #78716c;
  }

  :global([data-theme="dark"]) .example-text {
    color: #d4c9b9;
  }
</style>
