<script lang="ts">
  import MatchingClickdownGame from './MatchingClickdownGame.svelte';
  import { theme, isDarkMode } from '$lib/stores/theme';

  // Sample word pairs for demo
  const wordPairs = [
    { id: '1', german: 'Haus', persian: 'خانه' },
    { id: '2', german: 'Katze', persian: 'گربه' },
    { id: '3', german: 'Buch', persian: 'کتاب' },
    { id: '4', german: 'Wasser', persian: 'آب' },
    { id: '5', german: 'Apfel', persian: 'سیب' },
    { id: '6', german: 'Tisch', persian: 'میز' }
  ];

  let completedMatches: string[] = [];
  let gameComponent: MatchingClickdownGame;
  let showCelebration = false;

  function handleMatchComplete(event: CustomEvent<{ pairId: string }>) {
    completedMatches = [...completedMatches, event.detail.pairId];
  }

  function handleGameComplete() {
    showCelebration = true;
    setTimeout(() => {
      showCelebration = false;
    }, 3000);
  }

  function resetGame() {
    completedMatches = [];
    showCelebration = false;
    gameComponent?.reset();
  }
</script>

<svelte:head>
  <title>Matching Clickdown Demo - German Learning App</title>
</svelte:head>

<div class="demo-container">
  <!-- Header -->
  <header class="demo-header">
    <p class="demo-subtitle">جفت‌ها را پیدا کنید</p>

    <button class="theme-toggle" on:click={() => theme.toggle()}>
      {$isDarkMode ? 'Light' : 'Dark'}
    </button>
  </header>

  <!-- Game area -->
  <div class="game-area">
    <MatchingClickdownGame
      bind:this={gameComponent}
      pairs={wordPairs}
      on:matchComplete={handleMatchComplete}
      on:gameComplete={handleGameComplete}
    />
  </div>

  <!-- Controls -->
  <div class="controls">
    <button class="reset-button" on:click={resetGame}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
      </svg>
      شروع مجدد
    </button>
  </div>

  <!-- Celebration overlay -->
  {#if showCelebration}
    <div class="celebration-overlay">
      <div class="celebration-content">
        <div class="celebration-icon">🎉</div>
        <h2 class="celebration-title">آفرین!</h2>
        <p class="celebration-subtitle">Excellent! All pairs matched!</p>
      </div>
    </div>
  {/if}
</div>

<style>
  .demo-container {
    max-width: 500px;
    margin: 0 auto;
    padding: var(--space-4);
    min-height: 100%;
    display: flex;
    flex-direction: column;
  }

  .demo-header {
    text-align: center;
    margin-bottom: var(--space-4);
    position: relative;
  }

  .demo-subtitle {
    font-size: var(--text-lg);
    font-weight: var(--font-medium);
    color: var(--color-neutral-600);
    margin: 0;
    direction: rtl;
  }

  .theme-toggle {
    position: absolute;
    top: 0;
    right: 0;
    padding: var(--space-1-5) var(--space-3);
    border-radius: var(--radius-full);
    border: 1px solid var(--color-neutral-200);
    background: var(--color-neutral-50);
    font-size: var(--text-xs);
    font-weight: var(--font-medium);
    color: var(--color-neutral-600);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .theme-toggle:hover {
    background: var(--color-neutral-100);
  }

  .game-area {
    flex: 1;
    display: flex;
    align-items: flex-start;
    justify-content: center;
  }

  .controls {
    display: flex;
    justify-content: center;
    padding: var(--space-6) 0;
  }

  .reset-button {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-5);
    border-radius: var(--radius-xl);
    border: 2px solid var(--color-primary-500);
    background: linear-gradient(145deg, var(--color-neutral-50) 0%, var(--color-neutral-100) 100%);
    font-family: var(--font-sans);
    font-size: var(--text-sm);
    font-weight: var(--font-semibold);
    color: var(--color-neutral-700);
    cursor: pointer;
    box-shadow:
      3px 3px 0px var(--color-primary-500),
      3px 3px 6px rgba(8, 145, 178, 0.15);
    transform: translate(0, 0);
    transition: all 0.1s ease;
    direction: rtl;
  }

  .reset-button:hover {
    background: linear-gradient(145deg, var(--color-primary-50) 0%, var(--color-primary-100) 100%);
    border-color: var(--color-primary-400);
    box-shadow:
      3px 3px 0px var(--color-primary-400),
      3px 3px 10px rgba(8, 145, 178, 0.25);
  }

  .reset-button:active {
    transform: translate(3px, 3px);
    box-shadow: 0px 0px 0px var(--color-primary-500);
  }

  .reset-button svg {
    width: 18px;
    height: 18px;
    color: var(--color-primary-600);
  }

  /* Celebration overlay */
  .celebration-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fade-in 0.3s ease;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .celebration-content {
    background: var(--glass-bg-strong);
    backdrop-filter: blur(var(--glass-blur-strong));
    border-radius: var(--radius-3xl);
    padding: var(--space-10) var(--space-12);
    text-align: center;
    animation: scale-bounce 0.4s var(--transition-bounce);
    box-shadow: var(--shadow-2xl);
  }

  @keyframes scale-bounce {
    0% {
      transform: scale(0.8);
      opacity: 0;
    }
    50% {
      transform: scale(1.05);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  .celebration-icon {
    font-size: 64px;
    margin-bottom: var(--space-4);
    animation: bounce-subtle 0.6s ease-in-out infinite alternate;
  }

  @keyframes bounce-subtle {
    from {
      transform: translateY(0);
    }
    to {
      transform: translateY(-10px);
    }
  }

  .celebration-title {
    font-size: var(--text-3xl);
    font-weight: var(--font-extrabold);
    color: var(--color-gem-600);
    margin: 0 0 var(--space-2);
    direction: rtl;
  }

  .celebration-subtitle {
    font-size: var(--text-base);
    color: var(--color-neutral-600);
    margin: 0;
  }

  /* Dark mode - Persian Night */
  :global([data-theme="dark"]) .demo-subtitle {
    color: var(--color-neutral-500);
  }

  :global([data-theme="dark"]) .theme-toggle {
    background: var(--color-neutral-200);
    border-color: var(--color-neutral-300);
    color: var(--color-neutral-800);
  }

  :global([data-theme="dark"]) .reset-button {
    background: linear-gradient(145deg, var(--color-neutral-100) 0%, var(--color-neutral-200) 100%);
    border-color: var(--color-primary-400);
    color: var(--color-neutral-900);
    box-shadow:
      3px 3px 0px var(--color-primary-400),
      3px 3px 6px rgba(34, 211, 238, 0.1);
  }

  :global([data-theme="dark"]) .reset-button:hover {
    background: linear-gradient(145deg, var(--color-primary-900) 0%, var(--color-primary-800) 100%);
    border-color: var(--color-primary-300);
    box-shadow:
      3px 3px 0px var(--color-primary-300),
      3px 3px 10px rgba(34, 211, 238, 0.2);
  }

  :global([data-theme="dark"]) .reset-button svg {
    color: var(--color-primary-400);
  }

  :global([data-theme="dark"]) .celebration-title {
    color: var(--color-gem-400);
  }

  :global([data-theme="dark"]) .celebration-subtitle {
    color: var(--color-neutral-500);
  }
</style>
