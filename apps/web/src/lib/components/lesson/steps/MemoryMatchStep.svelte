<script lang="ts">
  import type { MemoryMatchStep } from "@pkg/content-model";
  import { createEventDispatcher, onMount } from "svelte";

  export let step: MemoryMatchStep;
  export let lessonId: string = '';

  const dispatch = createEventDispatcher<{
    answer: { correct: boolean; userAnswer: string; correctAnswer: string; allowContinue: boolean };
  }>();

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
  // Access extended step properties (may exist in content but not in schema type)
  // Using unknown cast to avoid template expression issues
  $: stepAny = step as unknown as Record<string, unknown>;
  $: columns = (stepAny.columns as number) || (totalCards <= 6 ? 3 : totalCards <= 8 ? 4 : totalCards <= 12 ? 4 : 5);
  $: stepInstruction = (stepAny.instruction as string) || 'کارت‌های همسان را پیدا کنید!';
  $: showAttempts = stepAny.showAttempts as boolean;

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
  <h2 class="instruction" dir="rtl">{stepInstruction}</h2>

  <!-- Stats bar -->
  <div class="stats-bar">
    {#if showAttempts}
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
    gap: var(--space-4, 1rem);
    align-items: center;
    padding: var(--space-2, 0.5rem);
  }

  .instruction {
    font-size: var(--text-lg, 1.125rem);
    font-weight: var(--font-bold, 700);
    color: var(--color-neutral-800, #292524);
    text-align: center;
    margin: 0;
  }

  /* Stats bar */
  .stats-bar {
    display: flex;
    justify-content: center;
    gap: var(--space-6, 1.5rem);
    padding: var(--space-2, 0.5rem) var(--space-4, 1rem);
    background: var(--glass-bg, rgba(253, 251, 247, 0.85));
    border: 1px solid var(--glass-border, rgba(212, 201, 185, 0.3));
    border-radius: var(--radius-full, 9999px);
    font-size: var(--text-sm, 0.875rem);
  }

  .stat {
    display: flex;
    align-items: center;
    gap: var(--space-2, 0.5rem);
  }

  .stat-icon {
    font-size: 1.2rem;
  }

  .stat-value {
    font-size: var(--text-lg, 1.125rem);
    font-weight: var(--font-bold, 700);
    color: var(--color-neutral-800, #292524);
  }

  .stat-label {
    font-size: var(--text-sm, 0.875rem);
    color: var(--color-neutral-500, #78716c);
  }

  .stat.warning .stat-value {
    color: var(--color-error-500, #a91e1e);
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
    gap: var(--space-2, 0.5rem);
    width: 100%;
    max-width: 450px;
  }

  /* Card */
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

  @media (max-height: 700px) {
    .card-grid {
      gap: var(--space-1, 0.25rem);
    }
  }

  .card:disabled {
    cursor: default;
  }

  .card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    transition: transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
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
    border-radius: var(--radius-lg, 0.75rem);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-1, 0.25rem);
  }

  .card-front {
    background: linear-gradient(135deg, var(--color-primary-500, #0891b2), var(--color-primary-600, #0e7490));
    color: white;
    border: 3px solid var(--color-primary-600, #0e7490);
    box-shadow: 0 4px 15px rgba(8, 145, 178, 0.3);
  }

  .card-icon {
    font-size: 2rem;
  }

  .card-back {
    background: var(--color-neutral-50, #fdfbf7);
    border: 3px solid var(--glass-border, rgba(212, 201, 185, 0.5));
    transform: rotateY(180deg);
    padding: var(--space-2, 0.5rem);
  }

  .card.german .card-back {
    border-color: var(--color-success-400, #facc15);
    background: linear-gradient(135deg, rgba(234, 179, 8, 0.15), rgba(234, 179, 8, 0.05));
  }

  .card.persian .card-back {
    border-color: var(--color-gem, #059669);
    background: linear-gradient(135deg, rgba(5, 150, 105, 0.1), rgba(5, 150, 105, 0.05));
  }

  .card.matched .card-back {
    opacity: 0.6;
  }

  .card-text {
    font-size: var(--text-sm, 0.875rem);
    font-weight: var(--font-semibold, 600);
    color: var(--color-neutral-800, #292524);
    text-align: center;
    word-break: break-word;
    line-height: 1.2;
  }

  .card-type {
    font-size: var(--text-sm, 0.875rem);
  }

  .compact .card-text {
    font-size: var(--text-xs, 0.75rem);
  }

  /* Timeout */
  .timeout-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-3, 0.75rem);
    padding: var(--space-6, 1.5rem) var(--space-8, 2rem);
    background: linear-gradient(135deg, rgba(169, 30, 30, 0.1), rgba(169, 30, 30, 0.05));
    border: 2px solid var(--color-error-400, #c84b4b);
    border-radius: var(--radius-xl, 1rem);
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
    font-size: var(--text-lg, 1.125rem);
    font-weight: var(--font-semibold, 600);
    color: var(--color-error-600, #8b1a1a);
    margin: 0;
    text-align: center;
  }

  .retry-btn {
    margin-top: var(--space-2, 0.5rem);
    padding: var(--space-3, 0.75rem) var(--space-6, 1.5rem);
    background: linear-gradient(135deg, var(--color-error-500, #a91e1e), var(--color-error-600, #8b1a1a));
    border: none;
    border-radius: var(--radius-full, 9999px);
    font-size: var(--text-base, 1rem);
    font-weight: var(--font-semibold, 600);
    color: white;
    cursor: pointer;
    transition: all var(--transition-normal, 200ms);
    min-height: 44px;
  }

  .retry-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(169, 30, 30, 0.3);
  }

  /* Completion */
  .completion-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-3, 0.75rem);
    padding: var(--space-6, 1.5rem) var(--space-8, 2rem);
    background: linear-gradient(135deg, rgba(234, 179, 8, 0.15), rgba(234, 179, 8, 0.05));
    border: 2px solid var(--color-success-400, #facc15);
    border-radius: var(--radius-xl, 1rem);
  }

  .completion-icon {
    font-size: 3.5rem;
    animation: bounce 0.6s ease-in-out infinite alternate;
    filter: drop-shadow(0 0 10px rgba(234, 179, 8, 0.5));
  }

  @keyframes bounce {
    from { transform: translateY(0); }
    to { transform: translateY(-10px); }
  }

  .completion-text {
    font-size: var(--text-lg, 1.125rem);
    font-weight: var(--font-semibold, 600);
    color: var(--color-success-700, #a16207);
    margin: 0;
    text-align: center;
  }

  /* Reset button */
  .reset-btn {
    padding: var(--space-3, 0.75rem) var(--space-6, 1.5rem);
    background: var(--glass-bg, rgba(253, 251, 247, 0.95));
    border: 2px solid var(--glass-border, rgba(212, 201, 185, 0.5));
    border-radius: var(--radius-full, 9999px);
    font-size: var(--text-base, 1rem);
    font-weight: var(--font-semibold, 600);
    color: var(--color-neutral-600, #57534e);
    cursor: pointer;
    transition: all var(--transition-normal, 200ms);
    min-height: 44px;
  }

  .reset-btn:hover {
    background: var(--color-neutral-100, #f5f0e8);
    border-color: var(--color-neutral-400, #a69b8a);
  }

  /* Dark Mode */
  :global([data-theme="dark"]) .instruction {
    color: var(--color-neutral-100, #f5f0e8);
  }

  :global([data-theme="dark"]) .card-back {
    background: var(--color-neutral-800, #292524);
  }

  :global([data-theme="dark"]) .card-text {
    color: var(--color-neutral-100, #f5f0e8);
  }
</style>
