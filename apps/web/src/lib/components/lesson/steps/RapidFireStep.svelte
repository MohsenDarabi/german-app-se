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
    // Add touch and mouse listeners
    if (cardElement) {
      cardElement.addEventListener('touchstart', handleTouchStart, { passive: true });
      cardElement.addEventListener('touchmove', handleTouchMove, { passive: true });
      cardElement.addEventListener('touchend', handleTouchEnd);
      cardElement.addEventListener('mousedown', handleMouseDown);
    }
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
          <span class="option-text" dir="rtl">{currentQuestion.optionLeft}</span>
          <button class="option-btn" on:click={() => handleButtonClick('left')}>
            👈
          </button>
        </div>

        <!-- Card -->
        <div
          class="card"
          class:correct={showResult === 'correct'}
          class:wrong={showResult === 'wrong'}
          class:dragging={isDragging}
          bind:this={cardElement}
          style="transform: translateX({cardTranslateX}px) rotate({cardRotation}deg)"
        >
          <span class="card-text">{currentQuestion.question}</span>
          <span class="card-flag">🇩🇪</span>
        </div>

        <!-- Right option -->
        <div class="option right" class:highlighted={swipeDirection === 'right'}>
          <span class="option-text" dir="rtl">{currentQuestion.optionRight}</span>
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
    padding: 1rem;
    min-height: 400px;
  }

  /* Start screen */
  .start-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    text-align: center;
  }

  .title {
    font-size: 2rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
  }

  .instruction {
    font-size: 1.1rem;
    color: #64748b;
    margin: 0;
  }

  .how-to-play {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    background: #f8fafc;
    border-radius: 1rem;
  }

  .swipe-demo {
    display: flex;
    align-items: center;
    gap: 1rem;
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
    font-size: 0.9rem;
    color: #64748b;
    margin: 0;
  }

  .stats-preview {
    display: flex;
    gap: 2rem;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }

  .stat-item .stat-icon {
    font-size: 1.5rem;
  }

  .stat-item .stat-value {
    font-size: 1.3rem;
    font-weight: 700;
    color: #1e293b;
  }

  .stat-item .stat-label {
    font-size: 0.8rem;
    color: #64748b;
  }

  .start-btn {
    padding: 1rem 3rem;
    background: linear-gradient(135deg, #f97316, #ea580c);
    border: none;
    border-radius: 999px;
    font-size: 1.3rem;
    font-weight: 700;
    color: white;
    cursor: pointer;
    transition: transform 0.2s;
  }

  .start-btn:hover {
    transform: scale(1.05);
  }

  /* Game screen */
  .game-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    gap: 1rem;
  }

  .progress-bar {
    width: 100%;
    height: 6px;
    background: #e2e8f0;
    border-radius: 999px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #f97316, #ea580c);
    transition: width 0.3s;
  }

  .stats-row {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    padding: 0.5rem;
  }

  .stat {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.35rem 0.75rem;
    background: #f1f5f9;
    border-radius: 999px;
    font-size: 0.9rem;
  }

  .stat .stat-value {
    font-weight: 700;
    color: #1e293b;
  }

  .stat.score {
    background: #fef3c7;
  }

  .stat.streak {
    background: #fee2e2;
  }

  .stat.streak.fire {
    background: #fecaca;
    animation: pulse-fire 0.5s ease-in-out infinite;
  }

  @keyframes pulse-fire {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }

  .stat.timer {
    background: #e0f2fe;
  }

  .stat.timer.urgent {
    background: #fee2e2;
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
    gap: 1rem;
    width: 100%;
    padding: 1rem 0;
    min-height: 200px;
  }

  .option {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: #f8fafc;
    border: 2px solid #e2e8f0;
    border-radius: 1rem;
    min-width: 80px;
    transition: all 0.2s;
  }

  .option.highlighted {
    border-color: #f97316;
    background: #fff7ed;
    transform: scale(1.05);
  }

  .option.left.highlighted {
    border-color: #3b82f6;
    background: #eff6ff;
  }

  .option-text {
    font-size: 0.85rem;
    font-weight: 600;
    color: #475569;
    text-align: center;
    max-width: 90px;
    word-wrap: break-word;
  }

  .option-btn {
    width: 50px;
    height: 50px;
    border: none;
    border-radius: 50%;
    background: #e2e8f0;
    font-size: 1.5rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .option-btn:hover {
    background: #cbd5e1;
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
    gap: 0.75rem;
    background: white;
    border: 3px solid #e2e8f0;
    border-radius: 1rem;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    cursor: grab;
    user-select: none;
    transition: transform 0.1s, border-color 0.2s, background 0.2s;
  }

  .card.dragging {
    cursor: grabbing;
    box-shadow: 0 8px 30px rgba(0,0,0,0.15);
  }

  .card.correct {
    border-color: #22c55e;
    background: #f0fdf4;
  }

  .card.wrong {
    border-color: #ef4444;
    background: #fef2f2;
  }

  .card-text {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
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
    padding: 1rem 2rem;
    border-radius: 1rem;
    font-size: 1.3rem;
    font-weight: 700;
    animation: pop 0.3s ease-out;
  }

  .feedback.correct {
    background: #dcfce7;
    color: #166534;
  }

  .feedback.wrong {
    background: #fee2e2;
    color: #991b1b;
  }

  @keyframes pop {
    0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
    100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
  }

  /* Results screen */
  .results-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    text-align: center;
  }

  .results-title {
    font-size: 2rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
  }

  .results-stats {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }

  .result-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem 2rem;
    background: #f8fafc;
    border-radius: 1rem;
  }

  .result-item.big {
    background: linear-gradient(135deg, #fef3c7, #fde68a);
    padding: 1.5rem 3rem;
  }

  .result-item.big .result-value {
    font-size: 3rem;
    color: #92400e;
  }

  .result-row {
    display: flex;
    gap: 1rem;
  }

  .result-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
  }

  .result-label {
    font-size: 0.9rem;
    color: #64748b;
  }

  .result-message {
    font-size: 1.1rem;
    font-weight: 600;
    color: #475569;
    padding: 1rem;
    background: #f0fdf4;
    border-radius: 1rem;
  }
</style>
