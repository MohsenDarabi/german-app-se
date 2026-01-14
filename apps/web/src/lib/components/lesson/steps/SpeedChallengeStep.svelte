<script lang="ts">
  import type { SpeedChallengeStep } from "$lib/content-model";
  import { createEventDispatcher, onMount, onDestroy } from "svelte";

  export let step: SpeedChallengeStep;
  export let lessonId: string = '';

  const dispatch = createEventDispatcher();

  // Game state
  let gameState: 'ready' | 'playing' | 'finished' = 'ready';
  let timeRemaining: number;
  let currentQuestionIndex = 0;
  let score = 0;
  let combo = 0;
  let maxCombo = 0;
  let correctCount = 0;
  let wrongCount = 0;
  let timer: ReturnType<typeof setInterval> | null = null;

  // Feedback state
  let lastAnswerCorrect: boolean | null = null;
  let showFeedback = false;

  // Initialize time
  $: timeRemaining = step.timeLimit || 60;
  $: currentQuestion = step.questions[currentQuestionIndex];
  $: basePoints = step.basePoints || 10;
  $: comboMultiplier = step.comboEnabled !== false ? Math.min(combo + 1, 5) : 1;

  function startGame() {
    gameState = 'playing';
    timeRemaining = step.timeLimit || 60;
    currentQuestionIndex = 0;
    score = 0;
    combo = 0;
    maxCombo = 0;
    correctCount = 0;
    wrongCount = 0;

    // Start timer
    timer = setInterval(() => {
      timeRemaining--;
      if (timeRemaining <= 0) {
        endGame();
      }
    }, 1000);
  }

  function endGame() {
    gameState = 'finished';
    if (timer) {
      clearInterval(timer);
      timer = null;
    }

    // Dispatch completion event
    dispatch('answer', {
      correct: true, // Allow continue
      score,
      correctCount,
      wrongCount,
      maxCombo,
      allowContinue: true
    });
  }

  function selectAnswer(index: number) {
    if (gameState !== 'playing') return;

    const isCorrect = index === currentQuestion.correctAnswerIndex;

    // Show feedback briefly
    lastAnswerCorrect = isCorrect;
    showFeedback = true;
    setTimeout(() => {
      showFeedback = false;
    }, 300);

    if (isCorrect) {
      correctCount++;
      combo++;
      maxCombo = Math.max(maxCombo, combo);
      score += basePoints * comboMultiplier;
    } else {
      wrongCount++;
      combo = 0;
    }

    // Move to next question or loop back
    if (currentQuestionIndex < step.questions.length - 1) {
      currentQuestionIndex++;
    } else {
      // Shuffle and restart from beginning
      currentQuestionIndex = 0;
    }
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  onDestroy(() => {
    if (timer) {
      clearInterval(timer);
    }
  });
</script>

<div class="speed-challenge">
  {#if gameState === 'ready'}
    <!-- Start Screen -->
    <div class="start-screen">
      <div class="title-icon">&#9889;</div>
      <h2 class="title">{step.title || 'Speed Challenge!'}</h2>
      <p class="instruction">{step.instruction || 'Answer as many as you can!'}</p>
      <div class="time-info">
        <span class="time-icon">&#9200;</span>
        <span>{step.timeLimit || 60} seconds</span>
      </div>
      <button class="start-btn" on:click={startGame}>
        Start!
      </button>
    </div>

  {:else if gameState === 'playing'}
    <!-- Game Screen -->
    <div class="game-screen">
      <!-- Header with timer and combo -->
      <div class="game-header">
        <div class="timer" class:warning={timeRemaining <= 10}>
          <span class="timer-icon">&#9200;</span>
          <span class="timer-value">{formatTime(timeRemaining)}</span>
        </div>
        {#if step.comboEnabled !== false && combo > 0}
          <div class="combo">
            <span class="combo-fire">&#128293;</span>
            <span class="combo-value">x{comboMultiplier}</span>
          </div>
        {/if}
      </div>

      <!-- Score display -->
      <div class="score-bar">
        <span class="score">Score: {score}</span>
        <span class="progress">{correctCount}/{step.questions.length}</span>
      </div>

      <!-- Question -->
      <div class="question-card" class:correct-flash={showFeedback && lastAnswerCorrect} class:wrong-flash={showFeedback && !lastAnswerCorrect}>
        <h3 class="question-text">{currentQuestion.question}</h3>
      </div>

      <!-- Options Grid -->
      <div class="options-grid" class:four-options={currentQuestion.options.length === 4}>
        {#each currentQuestion.options as option, i (i)}
          <button
            class="option-btn"
            on:click={() => selectAnswer(i)}
          >
            {option}
          </button>
        {/each}
      </div>
    </div>

  {:else if gameState === 'finished'}
    <!-- Results Screen -->
    <div class="results-screen">
      <div class="results-icon">&#127942;</div>
      <h2 class="results-title">Time's Up!</h2>

      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-value">{score}</span>
          <span class="stat-label">Points</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{correctCount}</span>
          <span class="stat-label">Correct</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{wrongCount}</span>
          <span class="stat-label">Wrong</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">x{maxCombo + 1}</span>
          <span class="stat-label">Max Combo</span>
        </div>
      </div>

      <button class="play-again-btn" on:click={startGame}>
        Play Again
      </button>
    </div>
  {/if}
</div>

<style>
  .speed-challenge {
    display: flex;
    flex-direction: column;
    min-height: 400px;
  }

  /* Start Screen */
  .start-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: var(--space-8, 2rem);
    gap: var(--space-4, 1rem);
  }

  .title-icon {
    font-size: 5rem;
    animation: pulse-glow 2s ease-in-out infinite;
  }

  @keyframes pulse-glow {
    0%, 100% { filter: drop-shadow(0 0 10px rgba(245, 158, 11, 0.5)); }
    50% { filter: drop-shadow(0 0 25px rgba(245, 158, 11, 0.8)); }
  }

  .title {
    font-size: var(--text-2xl, 1.5rem);
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

  .time-info {
    display: flex;
    align-items: center;
    gap: var(--space-2, 0.5rem);
    font-size: var(--text-lg, 1.125rem);
    color: var(--color-neutral-600, #57534e);
    padding: var(--space-2, 0.5rem) var(--space-4, 1rem);
    background: var(--glass-bg, rgba(253, 251, 247, 0.85));
    border: 1px solid var(--glass-border, rgba(212, 201, 185, 0.3));
    border-radius: var(--radius-full, 9999px);
  }

  .time-icon {
    font-size: 1.3rem;
  }

  .start-btn {
    margin-top: var(--space-4, 1rem);
    padding: var(--space-4, 1rem) var(--space-8, 2rem);
    font-size: var(--text-xl, 1.25rem);
    font-weight: var(--font-bold, 700);
    color: white;
    background: linear-gradient(135deg, var(--color-primary-500, #0891b2), var(--color-primary-600, #0e7490));
    border: none;
    border-radius: var(--radius-full, 9999px);
    cursor: pointer;
    transition: all var(--transition-normal, 200ms);
    box-shadow: 0 4px 20px rgba(8, 145, 178, 0.3);
    min-height: 56px;
    min-width: 180px;
  }

  .start-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 25px rgba(8, 145, 178, 0.4);
  }

  /* Game Screen */
  .game-screen {
    display: flex;
    flex-direction: column;
    gap: var(--space-4, 1rem);
    padding: var(--space-4, 1rem);
  }

  .game-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .timer {
    display: flex;
    align-items: center;
    gap: var(--space-2, 0.5rem);
    font-size: var(--text-2xl, 1.5rem);
    font-weight: var(--font-bold, 700);
    color: var(--color-neutral-800, #292524);
    padding: var(--space-2, 0.5rem) var(--space-4, 1rem);
    background: var(--glass-bg, rgba(253, 251, 247, 0.85));
    border: 1px solid var(--glass-border, rgba(212, 201, 185, 0.3));
    border-radius: var(--radius-md, 0.5rem);
  }

  .timer.warning {
    background: linear-gradient(135deg, rgba(169, 30, 30, 0.1), rgba(169, 30, 30, 0.05));
    border-color: var(--color-error-400, #c84b4b);
    color: var(--color-error-500, #a91e1e);
    animation: pulse 1s infinite;
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }

  .timer-icon {
    font-size: 1.3rem;
  }

  .combo {
    display: flex;
    align-items: center;
    gap: var(--space-1, 0.25rem);
    font-size: var(--text-2xl, 1.5rem);
    font-weight: var(--font-bold, 700);
    color: var(--color-streak, #f59e0b);
    padding: var(--space-2, 0.5rem) var(--space-4, 1rem);
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.05));
    border: 1px solid var(--color-streak-light, #fbbf24);
    border-radius: var(--radius-md, 0.5rem);
    animation: combo-pop 0.3s ease-out;
  }

  @keyframes combo-pop {
    0% { transform: scale(1.3); }
    100% { transform: scale(1); }
  }

  .combo-fire {
    font-size: 1.5rem;
  }

  .score-bar {
    display: flex;
    justify-content: space-between;
    padding: var(--space-2, 0.5rem) var(--space-4, 1rem);
    background: var(--glass-bg, rgba(253, 251, 247, 0.85));
    border: 1px solid var(--glass-border, rgba(212, 201, 185, 0.3));
    border-radius: var(--radius-md, 0.5rem);
    font-weight: var(--font-semibold, 600);
    color: var(--color-neutral-600, #57534e);
  }

  .question-card {
    padding: var(--space-8, 2rem);
    background: var(--glass-bg, rgba(253, 251, 247, 0.95));
    border: 2px solid var(--glass-border, rgba(212, 201, 185, 0.5));
    border-radius: var(--radius-xl, 1rem);
    text-align: center;
    transition: all 0.15s;
    backdrop-filter: blur(var(--glass-blur, 12px));
  }

  .question-card.correct-flash {
    background: linear-gradient(135deg, rgba(234, 179, 8, 0.2), rgba(234, 179, 8, 0.1));
    border-color: var(--color-success-400, #facc15);
  }

  .question-card.wrong-flash {
    background: linear-gradient(135deg, rgba(169, 30, 30, 0.15), rgba(169, 30, 30, 0.05));
    border-color: var(--color-error-400, #c84b4b);
  }

  .question-text {
    font-size: var(--text-2xl, 1.5rem);
    font-weight: var(--font-bold, 700);
    color: var(--color-neutral-800, #292524);
    margin: 0;
  }

  .options-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-3, 0.75rem);
  }

  .options-grid.four-options {
    grid-template-columns: 1fr 1fr;
  }

  .option-btn {
    padding: var(--space-4, 1rem) var(--space-3, 0.75rem);
    font-size: var(--text-lg, 1.125rem);
    font-weight: var(--font-semibold, 600);
    color: var(--color-neutral-700, #44403c);
    background: var(--glass-bg, rgba(253, 251, 247, 0.95));
    border: 2px solid var(--glass-border, rgba(212, 201, 185, 0.5));
    border-radius: var(--radius-lg, 0.75rem);
    cursor: pointer;
    transition: all var(--transition-fast, 150ms);
    min-height: 56px;
  }

  .option-btn:hover {
    border-color: var(--color-primary-400, #22d3ee);
    background: var(--color-primary-50, #ecfeff);
    transform: scale(1.02);
  }

  .option-btn:active {
    transform: scale(0.98);
  }

  /* Results Screen */
  .results-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: var(--space-8, 2rem);
    gap: var(--space-6, 1.5rem);
  }

  .results-icon {
    font-size: 5rem;
    animation: bounce 0.6s ease-in-out infinite alternate;
  }

  @keyframes bounce {
    from { transform: translateY(0); }
    to { transform: translateY(-12px); }
  }

  .results-title {
    font-size: var(--text-2xl, 1.5rem);
    font-weight: var(--font-bold, 700);
    background: linear-gradient(135deg, var(--color-success-600, #ca8a04), var(--color-success-500, #eab308));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-4, 1rem);
    width: 100%;
    max-width: 300px;
  }

  .stat-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--space-4, 1rem);
    background: var(--glass-bg, rgba(253, 251, 247, 0.85));
    border: 1px solid var(--glass-border, rgba(212, 201, 185, 0.3));
    border-radius: var(--radius-lg, 0.75rem);
    transition: all var(--transition-fast, 150ms);
  }

  .stat-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-md, 0 4px 15px rgba(0, 0, 0, 0.08));
  }

  .stat-value {
    font-size: var(--text-2xl, 1.5rem);
    font-weight: var(--font-bold, 700);
    color: var(--color-primary-600, #0e7490);
  }

  .stat-label {
    font-size: var(--text-sm, 0.875rem);
    color: var(--color-neutral-500, #78716c);
  }

  .play-again-btn {
    margin-top: var(--space-4, 1rem);
    padding: var(--space-4, 1rem) var(--space-8, 2rem);
    font-size: var(--text-lg, 1.125rem);
    font-weight: var(--font-semibold, 600);
    color: white;
    background: linear-gradient(135deg, var(--color-success-500, #eab308), var(--color-success-600, #ca8a04));
    border: none;
    border-radius: var(--radius-full, 9999px);
    cursor: pointer;
    transition: all var(--transition-normal, 200ms);
    box-shadow: 0 4px 15px var(--color-success-glow, rgba(234, 179, 8, 0.3));
    min-height: 48px;
  }

  .play-again-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 20px var(--color-success-glow, rgba(234, 179, 8, 0.4));
  }

  /* Dark Mode */
  :global([data-theme="dark"]) .timer {
    background: rgba(28, 25, 23, 0.85);
    color: var(--color-neutral-100, #f5f0e8);
  }

  :global([data-theme="dark"]) .question-card {
    background: rgba(28, 25, 23, 0.95);
  }

  :global([data-theme="dark"]) .question-text {
    color: var(--color-neutral-100, #f5f0e8);
  }

  :global([data-theme="dark"]) .option-btn {
    background: rgba(28, 25, 23, 0.95);
    color: var(--color-neutral-200, #e8e0d5);
  }

  :global([data-theme="dark"]) .stat-card {
    background: rgba(28, 25, 23, 0.85);
  }

  :global([data-theme="dark"]) .stat-value {
    color: var(--color-primary-400, #22d3ee);
  }
</style>
