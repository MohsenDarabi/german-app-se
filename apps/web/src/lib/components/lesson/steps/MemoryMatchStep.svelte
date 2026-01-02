<script lang="ts">
  import type { MemoryMatchStep } from "$lib/content-model";
  import { createEventDispatcher, onMount } from "svelte";

  export let step: MemoryMatchStep;
  export let lessonId: string = '';

  const dispatch = createEventDispatcher();

  interface Card {
    id: string;
    pairId: string;
    text: string;
    type: 'german' | 'persian';
    flipped: boolean;
    matched: boolean;
  }

  let cards: Card[] = [];
  let flippedCards: Card[] = [];
  let attempts = 0;
  let matchedPairs = 0;
  let isChecking = false;
  let gameComplete = false;
  let timeOut = false;
  let timeRemaining = step.timeLimit || 0;
  let timerInterval: ReturnType<typeof setInterval> | null = null;

  $: totalPairs = step.pairs.length;
  $: totalCards = totalPairs * 2;
  // Calculate columns to minimize rows while keeping reasonable card size
  // Prefer wider grids to avoid scrolling
  $: columns = step.columns || (totalCards <= 6 ? 3 : totalCards <= 8 ? 4 : totalCards <= 12 ? 4 : 5);

  onMount(() => {
    initGame();
    if (step.timeLimit > 0) {
      startTimer();
    }
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  });

  function initGame() {
    // Create cards from pairs
    const newCards: Card[] = [];

    step.pairs.forEach((pair, index) => {
      const pairId = `pair-${index}`;
      newCards.push({
        id: `${pairId}-de`,
        pairId: pairId,
        text: pair.de,
        type: 'german',
        flipped: false,
        matched: false
      });
      newCards.push({
        id: `${pairId}-fa`,
        pairId: pairId,
        text: pair.fa,
        type: 'persian',
        flipped: false,
        matched: false
      });
    });

    // Shuffle cards
    cards = shuffleArray(newCards);
    flippedCards = [];
    attempts = 0;
    matchedPairs = 0;
    gameComplete = false;
    timeOut = false;
  }

  function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  function startTimer() {
    timeRemaining = step.timeLimit;
    timerInterval = setInterval(() => {
      timeRemaining--;
      if (timeRemaining <= 0) {
        if (timerInterval) clearInterval(timerInterval);
        // Time's up - show timeout message, require retry
        // Don't dispatch as wrong answer (memory games don't fit review system)
        timeOut = true;
      }
    }, 1000);
  }

  function flipCard(card: Card) {
    if (isChecking || card.flipped || card.matched || gameComplete || timeOut) return;
    if (flippedCards.length >= 2) return;

    // Flip the card
    card.flipped = true;
    cards = cards; // Trigger reactivity
    flippedCards = [...flippedCards, card];

    // Check for match when two cards are flipped
    if (flippedCards.length === 2) {
      attempts++;
      isChecking = true;

      const [first, second] = flippedCards;

      if (first.pairId === second.pairId) {
        // Match found!
        setTimeout(() => {
          first.matched = true;
          second.matched = true;
          cards = cards;
          flippedCards = [];
          isChecking = false;
          matchedPairs++;

          // Check if game complete
          if (matchedPairs === totalPairs) {
            completeGame();
          }
        }, 500);
      } else {
        // No match - flip back
        setTimeout(() => {
          first.flipped = false;
          second.flipped = false;
          cards = cards;
          flippedCards = [];
          isChecking = false;
        }, 1000);
      }
    }
  }

  function completeGame() {
    gameComplete = true;
    if (timerInterval) clearInterval(timerInterval);

    dispatch('answer', {
      correct: true,
      userAnswer: `${attempts} attempts`,
      correctAnswer: `Completed in ${attempts} attempts`,
      allowContinue: true
    });
  }

  function resetGame() {
    if (timerInterval) clearInterval(timerInterval);
    initGame();
    if (step.timeLimit > 0) {
      startTimer();
    }
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
</script>

<div class="memory-container">
  <!-- Header -->
  <h2 class="instruction" dir="rtl">{step.instruction || 'کارت‌های همسان را پیدا کنید!'}</h2>

  <!-- Stats bar -->
  <div class="stats-bar">
    {#if step.showAttempts}
      <div class="stat">
        <span class="stat-icon">🎯</span>
        <span class="stat-value">{attempts}</span>
        <span class="stat-label" dir="rtl">تلاش</span>
      </div>
    {/if}

    <div class="stat">
      <span class="stat-icon">✨</span>
      <span class="stat-value">{matchedPairs}/{totalPairs}</span>
      <span class="stat-label" dir="rtl">جفت</span>
    </div>

    {#if step.timeLimit > 0}
      <div class="stat" class:warning={timeRemaining <= 10}>
        <span class="stat-icon">⏱️</span>
        <span class="stat-value">{formatTime(timeRemaining)}</span>
      </div>
    {/if}
  </div>

  <!-- Game grid -->
  <div
    class="card-grid"
    class:compact={cards.length > 8}
    style="--columns: {columns}"
  >
    {#each cards as card (card.id)}
      <button
        class="card"
        class:flipped={card.flipped || card.matched}
        class:matched={card.matched}
        class:german={card.type === 'german' && (card.flipped || card.matched)}
        class:persian={card.type === 'persian' && (card.flipped || card.matched)}
        on:click={() => flipCard(card)}
        disabled={card.matched || gameComplete}
      >
        <div class="card-inner">
          <div class="card-front">
            <span class="card-icon">❓</span>
          </div>
          <div class="card-back">
            <span class="card-text" dir={card.type === 'persian' ? 'rtl' : 'ltr'}>
              {card.text}
            </span>
            <span class="card-type">
              {card.type === 'german' ? '🇩🇪' : '🇮🇷'}
            </span>
          </div>
        </div>
      </button>
    {/each}
  </div>

  <!-- Timeout message -->
  {#if timeOut}
    <div class="timeout-box">
      <span class="timeout-icon">⏰</span>
      <p class="timeout-text" dir="rtl">
        وقت تمام شد! دوباره تلاش کنید.
      </p>
      <button class="retry-btn" on:click={resetGame}>
        🔄 تلاش مجدد
      </button>
    </div>
  {/if}

  <!-- Completion message -->
  {#if gameComplete}
    <div class="completion-box">
      <span class="completion-icon">🎉</span>
      <p class="completion-text" dir="rtl">
        آفرین! همه جفت‌ها را در {attempts} تلاش پیدا کردید!
      </p>
    </div>
  {/if}

  <!-- Reset button (only when game is in progress) -->
  {#if !gameComplete && !timeOut}
    <button class="reset-btn" on:click={resetGame}>
      🔄 شروع مجدد
    </button>
  {/if}
</div>

<style>
  .memory-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    padding: 0.5rem;
  }

  .instruction {
    font-size: 1.1rem;
    font-weight: 700;
    color: #1e293b;
    text-align: center;
    margin: 0;
  }

  /* Stats bar */
  .stats-bar {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    padding: 0.5rem 1rem;
    background: #f8fafc;
    border-radius: 999px;
    font-size: 0.9rem;
  }

  .stat {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .stat-icon {
    font-size: 1.2rem;
  }

  .stat-value {
    font-size: 1.1rem;
    font-weight: 700;
    color: #1e293b;
  }

  .stat-label {
    font-size: 0.85rem;
    color: #64748b;
  }

  .stat.warning .stat-value {
    color: #ef4444;
    animation: pulse 1s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  /* Card grid */
  .card-grid {
    display: grid;
    grid-template-columns: repeat(var(--columns), 1fr);
    gap: 0.5rem;
    width: 100%;
    max-width: 450px;
  }

  /* Card - sized to fit screen without scrolling */
  .card {
    aspect-ratio: 1;
    perspective: 1000px;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    min-width: 0;
    width: 100%;
  }

  /* Responsive card sizing */
  @media (max-height: 700px) {
    .card-grid {
      gap: 0.35rem;
    }
  }

  .card:disabled {
    cursor: default;
  }

  .card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    transition: transform 0.5s;
    transform-style: preserve-3d;
  }

  .card.flipped .card-inner {
    transform: rotateY(180deg);
  }

  .card-front, .card-back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    border-radius: 0.75rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
  }

  .card-front {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
    border: 3px solid #1d4ed8;
  }

  .card-icon {
    font-size: 2rem;
  }

  .card-back {
    background: white;
    border: 3px solid #e2e8f0;
    transform: rotateY(180deg);
    padding: 0.5rem;
  }

  .card.german .card-back {
    border-color: #fbbf24;
    background: #fffbeb;
  }

  .card.persian .card-back {
    border-color: #34d399;
    background: #ecfdf5;
  }

  .card.matched .card-back {
    opacity: 0.7;
  }

  .card-text {
    font-size: 0.8rem;
    font-weight: 600;
    color: #1e293b;
    text-align: center;
    word-break: break-word;
    line-height: 1.2;
  }

  .card-type {
    font-size: 0.85rem;
  }

  .compact .card-text {
    font-size: 0.7rem;
  }

  /* Timeout */
  .timeout-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 1.5rem 2rem;
    background: #fef2f2;
    border: 2px solid #ef4444;
    border-radius: 1rem;
  }

  .timeout-icon {
    font-size: 3rem;
    animation: shake 0.5s ease-in-out;
  }

  @keyframes shake {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(-10deg); }
    75% { transform: rotate(10deg); }
  }

  .timeout-text {
    font-size: 1.1rem;
    font-weight: 600;
    color: #b91c1c;
    margin: 0;
    text-align: center;
  }

  .retry-btn {
    margin-top: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: #ef4444;
    border: none;
    border-radius: 999px;
    font-size: 1rem;
    font-weight: 600;
    color: white;
    cursor: pointer;
    transition: all 0.2s;
  }

  .retry-btn:hover {
    background: #dc2626;
  }

  /* Completion */
  .completion-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 1.5rem 2rem;
    background: #f0fdf4;
    border: 2px solid #22c55e;
    border-radius: 1rem;
  }

  .completion-icon {
    font-size: 3rem;
    animation: bounce 0.6s ease-in-out infinite alternate;
  }

  @keyframes bounce {
    from { transform: translateY(0); }
    to { transform: translateY(-10px); }
  }

  .completion-text {
    font-size: 1.1rem;
    font-weight: 600;
    color: #15803d;
    margin: 0;
    text-align: center;
  }

  /* Reset button */
  .reset-btn {
    padding: 0.75rem 1.5rem;
    background: #f1f5f9;
    border: 2px solid #e2e8f0;
    border-radius: 999px;
    font-size: 0.95rem;
    font-weight: 600;
    color: #475569;
    cursor: pointer;
    transition: all 0.2s;
  }

  .reset-btn:hover {
    background: #e2e8f0;
    border-color: #cbd5e1;
  }
</style>
