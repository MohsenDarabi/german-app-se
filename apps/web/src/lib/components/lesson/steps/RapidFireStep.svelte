<script lang="ts">
  import type { RapidFireStep, RapidFireQuestion } from "$lib/content-model";
  import { createEventDispatcher, onMount, onDestroy } from "svelte";

  export let step: RapidFireStep;
  export let lessonId: string = '';

  const dispatch = createEventDispatcher();

  let currentIndex = 0;
  let score = 0;
  let streak = 0;
  let maxStreak = 0;
  let correctCount = 0;
  let gameStarted = false;
  let gameComplete = false;
  let showResult: 'correct' | 'wrong' | null = null;
  let timeRemaining = step.timePerQuestion || 0;
  let timerInterval: ReturnType<typeof setInterval> | null = null;

  // Swipe state
  let cardElement: HTMLElement;
  let startX = 0;
  let currentX = 0;
  let isDragging = false;
  let swipeDirection: 'left' | 'right' | null = null;

  $: currentQuestion = step.questions[currentIndex] as RapidFireQuestion;
  $: totalQuestions = step.questions.length;
  $: progress = (currentIndex / totalQuestions) * 100;
  $: cardRotation = isDragging ? (currentX - startX) / 15 : 0;
  $: cardTranslateX = isDragging ? currentX - startX : 0;

  onMount(() => {
    // Add document-level mouse listeners for drag tracking
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  });

  onDestroy(() => {
    if (timerInterval) clearInterval(timerInterval);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  });

  function startGame() {
    gameStarted = true;
    if (step.timePerQuestion > 0) {
      startQuestionTimer();
    }
  }

  function startQuestionTimer() {
    timeRemaining = step.timePerQuestion;
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      timeRemaining--;
      if (timeRemaining <= 0) {
        // Time's up - count as wrong
        handleAnswer(currentQuestion.correctSide === 'left' ? 'right' : 'left');
      }
    }, 1000);
  }

  // Touch handlers
  function handleTouchStart(e: TouchEvent) {
    if (gameComplete || showResult) return;
    startX = e.touches[0].clientX;
    currentX = startX;
    isDragging = true;
  }

  function handleTouchMove(e: TouchEvent) {
    if (!isDragging) return;
    currentX = e.touches[0].clientX;
    updateSwipeDirection();
  }

  function handleTouchEnd() {
    if (!isDragging) return;
    finishSwipe();
  }

  // Mouse handlers
  function handleMouseDown(e: MouseEvent) {
    if (gameComplete || showResult) return;
    startX = e.clientX;
    currentX = startX;
    isDragging = true;
  }

  function handleMouseMove(e: MouseEvent) {
    if (!isDragging) return;
    currentX = e.clientX;
    updateSwipeDirection();
  }

  function handleMouseUp() {
    if (!isDragging) return;
    finishSwipe();
  }

  function updateSwipeDirection() {
    const diff = currentX - startX;
    if (Math.abs(diff) > 30) {
      swipeDirection = diff > 0 ? 'right' : 'left';
    } else {
      swipeDirection = null;
    }
  }

  function finishSwipe() {
    const diff = currentX - startX;
    const threshold = 80; // Minimum swipe distance to trigger answer

    if (Math.abs(diff) > threshold) {
      const direction = diff > 0 ? 'right' : 'left';
      handleAnswer(direction);
    }

    // Reset swipe state
    isDragging = false;
    startX = 0;
    currentX = 0;
    swipeDirection = null;
  }

  function handleButtonClick(direction: 'left' | 'right') {
    if (gameComplete || showResult) return;
    handleAnswer(direction);
  }

  function handleAnswer(direction: 'left' | 'right') {
    if (timerInterval) clearInterval(timerInterval);

    const isCorrect = direction === currentQuestion.correctSide;

    if (isCorrect) {
      correctCount++;
      streak++;
      if (streak > maxStreak) maxStreak = streak;
      score += step.basePoints * (streak > 1 ? streak : 1);
      showResult = 'correct';
    } else {
      streak = 0;
      showResult = 'wrong';
    }

    // Show result briefly, then move to next
    setTimeout(() => {
      showResult = null;

      if (currentIndex < totalQuestions - 1) {
        currentIndex++;
        if (step.timePerQuestion > 0) {
          startQuestionTimer();
        }
      } else {
        completeGame();
      }
    }, 600);
  }

  function completeGame() {
    gameComplete = true;
    if (timerInterval) clearInterval(timerInterval);

    const scorePercent = Math.round((correctCount / totalQuestions) * 100);

    dispatch('answer', {
      correct: scorePercent >= 60,
      userAnswer: `${correctCount}/${totalQuestions} correct, streak: ${maxStreak}`,
      correctAnswer: `Score: ${score} points`,
      allowContinue: true
    });
  }

  function getFireEmoji(streak: number): string {
    if (streak >= 10) return '🔥🔥🔥';
    if (streak >= 5) return '🔥🔥';
    if (streak >= 3) return '🔥';
    return '';
  }
</script>

<div class="rapidfire-container">
  {#if !gameStarted}
    <!-- Start screen -->
    <div class="start-screen">
      <h2 class="title">{step.title || 'چالش سریع!'}</h2>
      <p class="instruction" dir="rtl">{step.instruction || 'به چپ یا راست بکشید!'}</p>

      <div class="how-to-play" dir="rtl">
        <div class="swipe-demo">
          <span class="arrow left">👈</span>
          <span class="card-demo">🇩🇪</span>
          <span class="arrow right">👉</span>
        </div>
        <p>کلمه آلمانی را ببینید و به سمت ترجمه درست بکشید!</p>
      </div>

      <div class="stats-preview">
        <div class="stat-item">
          <span class="stat-icon">❓</span>
          <span class="stat-value">{totalQuestions}</span>
          <span class="stat-label" dir="rtl">سوال</span>
        </div>
        {#if step.timePerQuestion > 0}
          <div class="stat-item">
            <span class="stat-icon">⏱️</span>
            <span class="stat-value">{step.timePerQuestion}s</span>
            <span class="stat-label" dir="rtl">هر سوال</span>
          </div>
        {/if}
      </div>

      <button class="start-btn" on:click={startGame}>
        شروع! 🚀
      </button>
    </div>
  {:else if gameComplete}
    <!-- Results screen -->
    <div class="results-screen">
      <h2 class="results-title">🎯 نتیجه</h2>

      <div class="results-stats">
        <div class="result-item big">
          <span class="result-value">{score}</span>
          <span class="result-label">امتیاز</span>
        </div>

        <div class="result-row">
          <div class="result-item">
            <span class="result-value">{correctCount}/{totalQuestions}</span>
            <span class="result-label">درست</span>
          </div>
          <div class="result-item">
            <span class="result-value">{maxStreak} {getFireEmoji(maxStreak)}</span>
            <span class="result-label">بهترین استریک</span>
          </div>
        </div>
      </div>

      <div class="result-message" dir="rtl">
        {#if correctCount === totalQuestions}
          عالی! همه را درست جواب دادید! 🏆
        {:else if correctCount >= totalQuestions * 0.8}
          خیلی خوب! تقریباً همه درست! 🌟
        {:else if correctCount >= totalQuestions * 0.6}
          خوب بود! ادامه بده! 💪
        {:else}
          تمرین بیشتر لازمه! 📚
        {/if}
      </div>
    </div>
  {:else}
    <!-- Game screen -->
    <div class="game-screen">
      <!-- Progress bar -->
      <div class="progress-bar">
        <div class="progress-fill" style="width: {progress}%"></div>
      </div>

      <!-- Stats row -->
      <div class="stats-row">
        <div class="stat">
          <span class="stat-value">{currentIndex + 1}/{totalQuestions}</span>
        </div>
        <div class="stat score">
          <span class="stat-value">{score}</span>
          <span class="stat-icon">⭐</span>
        </div>
        {#if step.showStreak && streak > 0}
          <div class="stat streak" class:fire={streak >= 3}>
            <span class="stat-value">{streak}</span>
            <span class="stat-icon">{getFireEmoji(streak) || '🎯'}</span>
          </div>
        {/if}
        {#if step.timePerQuestion > 0}
          <div class="stat timer" class:urgent={timeRemaining <= 1}>
            <span class="stat-value">{timeRemaining}</span>
            <span class="stat-icon">⏱️</span>
          </div>
        {/if}
      </div>

      <!-- Swipe area -->
      <div class="swipe-area">
        <!-- Left option -->
        <div class="option left" class:highlighted={swipeDirection === 'left'}>
          <span class="option-text" dir="auto">{currentQuestion.left}</span>
          <button class="option-btn" on:click={() => handleButtonClick('left')}>
            👈
          </button>
        </div>

        <!-- Card - shows the prompt (word to match) -->
        <div
          class="card"
          class:correct={showResult === 'correct'}
          class:wrong={showResult === 'wrong'}
          class:dragging={isDragging}
          bind:this={cardElement}
          style="transform: translateX({cardTranslateX}px) rotate({cardRotation}deg)"
          on:touchstart={handleTouchStart}
          on:touchmove={handleTouchMove}
          on:touchend={handleTouchEnd}
          on:mousedown={handleMouseDown}
          role="button"
          tabindex="0"
        >
          <span class="card-text">{currentQuestion.prompt}</span>
          <span class="card-flag">🤔</span>
        </div>

        <!-- Right option -->
        <div class="option right" class:highlighted={swipeDirection === 'right'}>
          <span class="option-text" dir="auto">{currentQuestion.right}</span>
          <button class="option-btn" on:click={() => handleButtonClick('right')}>
            👉
          </button>
        </div>
      </div>

      <!-- Result feedback -->
      {#if showResult}
        <div class="feedback" class:correct={showResult === 'correct'} class:wrong={showResult === 'wrong'}>
          {showResult === 'correct' ? '✓ درست!' : '✗ اشتباه!'}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .rapidfire-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--space-4, 1rem);
    min-height: 400px;
  }

  /* Start screen */
  .start-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-6, 1.5rem);
    text-align: center;
  }

  .title {
    font-size: var(--text-3xl, 2rem);
    font-weight: var(--font-bold, 700);
    background: linear-gradient(135deg, var(--color-streak, #f59e0b), var(--color-streak-light, #fbbf24));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
  }

  .instruction {
    font-size: var(--text-lg, 1.125rem);
    color: var(--color-neutral-500, #78716c);
    margin: 0;
  }

  .how-to-play {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-3, 0.75rem);
    padding: var(--space-4, 1rem);
  }

  .swipe-demo {
    display: flex;
    align-items: center;
    gap: var(--space-4, 1rem);
    font-size: 2rem;
  }

  .arrow {
    animation: bounce-horizontal 1s infinite alternate;
  }

  .arrow.left {
    animation-direction: alternate-reverse;
  }

  @keyframes bounce-horizontal {
    from { transform: translateX(-5px); }
    to { transform: translateX(5px); }
  }

  .card-demo {
    font-size: 2.5rem;
  }

  .how-to-play p {
    font-size: var(--text-sm, 0.875rem);
    color: var(--color-neutral-500, #78716c);
    margin: 0;
  }

  .stats-preview {
    display: flex;
    gap: var(--space-8, 2rem);
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-1, 0.25rem);
  }

  .stat-item .stat-icon {
    font-size: 1.5rem;
  }

  .stat-item .stat-value {
    font-size: var(--text-xl, 1.25rem);
    font-weight: var(--font-bold, 700);
    color: var(--color-neutral-800, #292524);
  }

  .stat-item .stat-label {
    font-size: var(--text-sm, 0.875rem);
    color: var(--color-neutral-500, #78716c);
  }

  .start-btn {
    padding: var(--space-4, 1rem) var(--space-8, 2rem);
    background: linear-gradient(135deg, var(--color-streak, #f59e0b), var(--color-streak-light, #fbbf24));
    border: none;
    border-radius: var(--radius-full, 9999px);
    font-size: var(--text-xl, 1.25rem);
    font-weight: var(--font-bold, 700);
    color: white;
    cursor: pointer;
    transition: all var(--transition-normal, 200ms);
    box-shadow: 0 4px 15px var(--color-streak-glow, rgba(245, 158, 11, 0.4));
    min-height: 56px;
  }

  .start-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 20px var(--color-streak-glow, rgba(245, 158, 11, 0.5));
  }

  /* Game screen */
  .game-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    gap: var(--space-4, 1rem);
  }

  .progress-bar {
    width: 100%;
    height: 6px;
    background: var(--color-neutral-200, #e8e0d5);
    border-radius: var(--radius-full, 9999px);
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--color-streak, #f59e0b), var(--color-streak-light, #fbbf24));
    transition: width 0.3s;
  }

  .stats-row {
    display: flex;
    justify-content: center;
    gap: var(--space-4, 1rem);
    padding: var(--space-2, 0.5rem);
  }

  .stat {
    display: flex;
    align-items: center;
    gap: var(--space-1, 0.25rem);
    padding: var(--space-1, 0.25rem) var(--space-3, 0.75rem);
    background: var(--color-neutral-100, #f5f0e8);
    border-radius: var(--radius-full, 9999px);
    font-size: var(--text-sm, 0.875rem);
  }

  .stat .stat-value {
    font-weight: var(--font-bold, 700);
    color: var(--color-neutral-700, #44403c);
  }

  .stat.score {
    background: var(--color-success-100, #fef9c3);
  }

  .stat.score .stat-value {
    color: var(--color-success-700, #a16207);
  }

  .stat.streak {
    background: var(--color-streak-100, #fef3c7);
  }

  .stat.streak .stat-value {
    color: var(--color-streak-600, #d97706);
  }

  .stat.streak.fire {
    animation: pulse-fire 0.5s ease-in-out infinite;
  }

  @keyframes pulse-fire {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }

  .stat.timer {
    background: var(--color-primary-50, #ecfeff);
    border-color: var(--color-primary-300, #67e8f9);
  }

  .stat.timer.urgent {
    background: linear-gradient(135deg, rgba(169, 30, 30, 0.15), rgba(169, 30, 30, 0.05));
    border-color: var(--color-error-400, #c84b4b);
    animation: pulse-urgent 0.3s ease-in-out infinite;
  }

  @keyframes pulse-urgent {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }

  /* Swipe area */
  .swipe-area {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-4, 1rem);
    width: 100%;
    padding: var(--space-4, 1rem) 0;
    min-height: 200px;
  }

  .option {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2, 0.5rem);
    padding: var(--space-3, 0.75rem);
    background: var(--glass-bg, rgba(253, 251, 247, 0.85));
    border: 2px solid var(--glass-border, rgba(212, 201, 185, 0.5));
    border-radius: var(--radius-xl, 1rem);
    min-width: 80px;
    transition: all var(--transition-normal, 200ms);
  }

  .option.highlighted {
    border-color: var(--color-streak, #f59e0b);
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.05));
    transform: scale(1.08);
  }

  .option.left.highlighted {
    border-color: var(--color-primary-500, #0891b2);
    background: var(--color-primary-50, #ecfeff);
  }

  .option-text {
    font-size: var(--text-sm, 0.875rem);
    font-weight: var(--font-semibold, 600);
    color: var(--color-neutral-600, #57534e);
    text-align: center;
    max-width: 90px;
    word-wrap: break-word;
  }

  .option-btn {
    width: 50px;
    height: 50px;
    border: none;
    border-radius: 50%;
    background: var(--color-neutral-200, #e8e0d5);
    font-size: 1.5rem;
    cursor: pointer;
    transition: all var(--transition-normal, 200ms);
  }

  .option-btn:hover {
    background: var(--color-neutral-300, #d4c9b9);
    transform: scale(1.1);
  }

  /* Card */
  .card {
    width: 140px;
    height: 180px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-3, 0.75rem);
    background: var(--glass-bg, rgba(253, 251, 247, 0.95));
    border: 3px solid var(--glass-border, rgba(212, 201, 185, 0.5));
    border-radius: var(--radius-xl, 1rem);
    box-shadow: var(--shadow-lg, 0 8px 30px rgba(0, 0, 0, 0.1));
    cursor: grab;
    user-select: none;
    touch-action: none;
    transition: transform 0.1s, border-color 0.2s, background 0.2s;
  }

  .card.dragging {
    cursor: grabbing;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }

  .card.correct {
    border-color: var(--color-gem-400, #34d399);
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05));
  }

  .card.wrong {
    border-color: var(--color-error-400, #c84b4b);
    background: linear-gradient(135deg, rgba(169, 30, 30, 0.1), rgba(169, 30, 30, 0.05));
  }

  .card-text {
    font-size: var(--text-2xl, 1.5rem);
    font-weight: var(--font-bold, 700);
    color: var(--color-neutral-800, #292524);
    text-align: center;
  }

  .card-flag {
    font-size: 1.5rem;
  }

  /* Feedback */
  .feedback {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: var(--space-4, 1rem) var(--space-8, 2rem);
    border-radius: var(--radius-xl, 1rem);
    font-size: var(--text-xl, 1.25rem);
    font-weight: var(--font-bold, 700);
    animation: pop 0.3s ease-out;
  }

  .feedback.correct {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.1));
    color: var(--color-gem-700, #047857);
    border: 2px solid var(--color-gem-400, #34d399);
  }

  .feedback.wrong {
    background: linear-gradient(135deg, rgba(169, 30, 30, 0.15), rgba(169, 30, 30, 0.05));
    color: var(--color-error-600, #8b1a1a);
    border: 2px solid var(--color-error-400, #c84b4b);
  }

  @keyframes pop {
    0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
    100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
  }

  /* Results screen - clean, no borders */
  .results-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-4, 1rem);
    text-align: center;
    padding: var(--space-4, 1rem) 0;
  }

  .results-title {
    font-size: var(--text-xl, 1.25rem);
    font-weight: var(--font-semibold, 600);
    color: var(--color-streak, #f59e0b);
    margin: 0;
  }

  .results-stats {
    display: flex;
    flex-direction: column;
    gap: var(--space-4, 1rem);
    align-items: center;
  }

  /* Big score - just large text, no box */
  .result-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--space-2, 0.5rem);
  }

  .result-item.big {
    padding: var(--space-4, 1rem);
  }

  .result-item.big .result-value {
    font-size: 4rem;
    font-weight: var(--font-extrabold, 800);
    color: var(--color-neutral-800, #292524);
    line-height: 1;
  }

  .result-row {
    display: flex;
    gap: var(--space-8, 2rem);
  }

  .result-value {
    font-size: var(--text-xl, 1.25rem);
    font-weight: var(--font-bold, 700);
    color: var(--color-neutral-700, #44403c);
  }

  .result-label {
    font-size: var(--text-sm, 0.875rem);
    color: var(--color-neutral-400, #a69b8a);
  }

  .result-message {
    font-size: var(--text-base, 1rem);
    font-weight: var(--font-medium, 500);
    color: var(--color-gem-600, #059669);
    padding: var(--space-3, 0.75rem) var(--space-6, 1.5rem);
    background: var(--color-gem-50, #ecfdf5);
    border-radius: var(--radius-full, 9999px);
  }

  /* Dark Mode */
  :global([data-theme="dark"]) .card {
    background: rgba(28, 25, 23, 0.95);
  }

  :global([data-theme="dark"]) .card-text {
    color: var(--color-neutral-100, #f5f0e8);
  }

  :global([data-theme="dark"]) .option {
    background: rgba(28, 25, 23, 0.85);
  }

  :global([data-theme="dark"]) .option-text {
    color: var(--color-neutral-200, #e8e0d5);
  }

  :global([data-theme="dark"]) .result-item.big .result-value {
    color: var(--color-neutral-100, #f5f0e8);
  }

  :global([data-theme="dark"]) .result-value {
    color: var(--color-neutral-200, #e8e0d5);
  }

  :global([data-theme="dark"]) .result-message {
    background: rgba(5, 150, 105, 0.15);
    color: var(--color-gem-400, #34d399);
  }

  :global([data-theme="dark"]) .stat {
    background: var(--color-neutral-200, #44403c);
  }
</style>
