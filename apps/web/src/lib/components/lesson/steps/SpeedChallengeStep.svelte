<script lang="ts">
  import type { SpeedChallengeStep } from "$lib/content-model";
  import { createEventDispatcher, onMount, onDestroy } from "svelte";

  export let step: SpeedChallengeStep;
  export let lessonId: string = '';

  const dispatch = createEventDispatcher<{
    answer: {
      correct: boolean;
      score: number;
      correctCount: number;
      wrongCount: number;
      maxCombo: number;
      allowContinue: boolean;
    };
  }>();

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
    padding: 2rem;
    gap: 1rem;
  }

  .title-icon {
    font-size: 4rem;
  }

  .title {
    font-size: 1.75rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
  }

  .instruction {
    font-size: 1.1rem;
    color: #64748b;
    margin: 0;
  }

  .time-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.2rem;
    color: #475569;
    padding: 0.5rem 1rem;
    background: #f1f5f9;
    border-radius: 999px;
  }

  .time-icon {
    font-size: 1.3rem;
  }

  .start-btn {
    margin-top: 1rem;
    padding: 1rem 3rem;
    font-size: 1.25rem;
    font-weight: 700;
    color: white;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    border: none;
    border-radius: 999px;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .start-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
  }

  /* Game Screen */
  .game-screen {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .game-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .timer {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    padding: 0.5rem 1rem;
    background: #f1f5f9;
    border-radius: 0.5rem;
  }

  .timer.warning {
    background: #fef2f2;
    color: #dc2626;
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
    gap: 0.25rem;
    font-size: 1.5rem;
    font-weight: 700;
    color: #ea580c;
    padding: 0.5rem 1rem;
    background: #fff7ed;
    border-radius: 0.5rem;
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
    padding: 0.5rem 1rem;
    background: #f8fafc;
    border-radius: 0.5rem;
    font-weight: 600;
    color: #475569;
  }

  .question-card {
    padding: 2rem;
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 1rem;
    text-align: center;
    transition: all 0.15s;
  }

  .question-card.correct-flash {
    background: #dcfce7;
    border-color: #22c55e;
  }

  .question-card.wrong-flash {
    background: #fef2f2;
    border-color: #ef4444;
  }

  .question-text {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
  }

  .options-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }

  .options-grid.four-options {
    grid-template-columns: 1fr 1fr;
  }

  .option-btn {
    padding: 1.25rem 1rem;
    font-size: 1.1rem;
    font-weight: 600;
    color: #334155;
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 0.75rem;
    cursor: pointer;
    transition: all 0.15s;
  }

  .option-btn:hover {
    border-color: #3b82f6;
    background: #eff6ff;
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
    padding: 2rem;
    gap: 1.5rem;
  }

  .results-icon {
    font-size: 4rem;
  }

  .results-title {
    font-size: 1.75rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    width: 100%;
    max-width: 300px;
  }

  .stat-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem;
    background: #f8fafc;
    border-radius: 0.75rem;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
  }

  .stat-label {
    font-size: 0.85rem;
    color: #64748b;
  }

  .play-again-btn {
    margin-top: 1rem;
    padding: 1rem 2rem;
    font-size: 1.1rem;
    font-weight: 600;
    color: white;
    background: linear-gradient(135deg, #22c55e, #16a34a);
    border: none;
    border-radius: 999px;
    cursor: pointer;
    transition: transform 0.2s;
  }

  .play-again-btn:hover {
    transform: scale(1.05);
  }
</style>
