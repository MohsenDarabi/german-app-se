<script lang="ts">
  import type { WordHuntStep } from "@pkg/content-model";
  import { createEventDispatcher, onMount } from "svelte";

  export let step: WordHuntStep;
  export let lessonId: string = '';

  const dispatch = createEventDispatcher<{
    answer: { correct: boolean; userAnswer: string; correctAnswer: string; allowContinue: boolean };
  }>();

  interface Cell {
    letter: string;
    row: number;
    col: number;
    selected: boolean;
    found: boolean;
    wordId: string | null; // Which word this cell belongs to (if found)
  }

  interface PlacedWord {
    word: string;
    translation: string;
    found: boolean;
    cells: { row: number; col: number }[];
  }

  let grid: Cell[][] = [];
  let placedWords: PlacedWord[] = [];
  let selectedCells: Cell[] = [];
  let foundCount = 0;
  let gameComplete = false;
  let timeOut = false;
  let timeRemaining = step.timeLimit || 0;
  let timerInterval: ReturnType<typeof setInterval> | null = null;
  let selectionStart: Cell | null = null;

  // Access extended step properties (may exist in content but not in schema type)
  $: stepAny = step as unknown as Record<string, unknown>;
  // Use targetWords from schema, with fallback for legacy "words" property
  $: words = step.targetWords || (stepAny.words as unknown[]) || [];
  $: totalWords = words.length;
  // gridSize can be { rows, cols } object or legacy number
  $: gridSizeObj = step.gridSize || { rows: 6, cols: 6 };
  $: gridRows = typeof gridSizeObj === 'number' ? gridSizeObj : gridSizeObj.rows;
  $: gridCols = typeof gridSizeObj === 'number' ? gridSizeObj : gridSizeObj.cols;
  // Extended properties
  $: showHints = stepAny.showHints as boolean;
  $: directions = (stepAny.directions as string[]) || ['horizontal', 'vertical'];

  // German letter frequencies for filling empty cells
  const GERMAN_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ';

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
    generateGrid();
    foundCount = 0;
    gameComplete = false;
    timeOut = false;
    selectedCells = [];
    selectionStart = null;
  }

  function generateGrid() {
    // Initialize empty grid
    grid = Array(gridRows).fill(null).map((_, row) =>
      Array(gridCols).fill(null).map((_, col) => ({
        letter: '',
        row,
        col,
        selected: false,
        found: false,
        wordId: null
      }))
    );

    placedWords = [];

    // Sort words by length (longest first for better placement)
    // Handle both old format (array of objects with word/translation) and new format (array of strings)
    const sortedWords = [...words].map(w => typeof w === 'string' ? { word: w, translation: '' } : w).sort((a, b) => b.word.length - a.word.length);

    // Try to place each word
    for (const wordInfo of sortedWords) {
      const word = wordInfo.word.toUpperCase();
      const placed = placeWord(word, wordInfo.translation);
      if (!placed) {
        console.warn(`Could not place word: ${word}`);
      }
    }

    // Fill empty cells with random German letters
    for (let row = 0; row < gridRows; row++) {
      for (let col = 0; col < gridCols; col++) {
        if (!grid[row][col].letter) {
          grid[row][col].letter = GERMAN_LETTERS[Math.floor(Math.random() * GERMAN_LETTERS.length)];
        }
      }
    }
  }

  function placeWord(word: string, translation: string): boolean {
    const maxAttempts = 100;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const direction = directions[Math.floor(Math.random() * directions.length)];
      const { dRow, dCol } = getDirectionDelta(direction);

      // Calculate valid starting positions
      const maxRow = gridRows - (dRow > 0 ? word.length : 1);
      const maxCol = gridCols - (dCol > 0 ? word.length : 1);
      const minRow = dRow < 0 ? word.length - 1 : 0;
      const minCol = dCol < 0 ? word.length - 1 : 0;

      if (maxRow < minRow || maxCol < minCol) continue;

      const startRow = minRow + Math.floor(Math.random() * (maxRow - minRow + 1));
      const startCol = minCol + Math.floor(Math.random() * (maxCol - minCol + 1));

      // Check if word fits without conflicts
      const cells: { row: number; col: number }[] = [];
      let canPlace = true;

      for (let i = 0; i < word.length; i++) {
        const row = startRow + i * dRow;
        const col = startCol + i * dCol;

        if (row < 0 || row >= gridRows || col < 0 || col >= gridCols) {
          canPlace = false;
          break;
        }

        const existingLetter = grid[row][col].letter;
        if (existingLetter && existingLetter !== word[i]) {
          canPlace = false;
          break;
        }

        cells.push({ row, col });
      }

      if (canPlace) {
        // Place the word
        for (let i = 0; i < word.length; i++) {
          const { row, col } = cells[i];
          grid[row][col].letter = word[i];
        }

        placedWords.push({
          word,
          translation,
          found: false,
          cells
        });

        return true;
      }
    }

    return false;
  }

  function getDirectionDelta(direction: string): { dRow: number; dCol: number } {
    switch (direction) {
      case 'horizontal': return { dRow: 0, dCol: 1 };
      case 'vertical': return { dRow: 1, dCol: 0 };
      case 'diagonal': return { dRow: 1, dCol: 1 };
      default: return { dRow: 0, dCol: 1 };
    }
  }

  function startTimer() {
    timeRemaining = step.timeLimit;
    timerInterval = setInterval(() => {
      timeRemaining--;
      if (timeRemaining <= 0) {
        if (timerInterval) clearInterval(timerInterval);
        timeOut = true;
      }
    }, 1000);
  }

  function handleCellClick(cell: Cell) {
    if (gameComplete || timeOut || cell.found) return;

    if (!selectionStart) {
      // Start new selection
      selectionStart = cell;
      cell.selected = true;
      selectedCells = [cell];
      grid = grid;
    } else {
      // Extend selection - check if valid direction
      const dRow = Math.sign(cell.row - selectionStart.row);
      const dCol = Math.sign(cell.col - selectionStart.col);

      // Only allow straight lines (horizontal, vertical, diagonal)
      const isValidDirection =
        (dRow === 0 || dCol === 0 || Math.abs(dRow) === Math.abs(dCol));

      if (!isValidDirection) {
        clearSelection();
        return;
      }

      // Build path from start to this cell
      const pathCells = getPathCells(selectionStart, cell);

      if (pathCells.length === 0) {
        clearSelection();
        return;
      }

      // Update selection
      clearCellSelection();
      selectedCells = pathCells;
      for (const c of pathCells) {
        grid[c.row][c.col].selected = true;
      }
      grid = grid;

      // Check if selection forms a word
      checkForWord();
    }
  }

  function getPathCells(start: Cell, end: Cell): Cell[] {
    const dRow = Math.sign(end.row - start.row);
    const dCol = Math.sign(end.col - start.col);
    const distance = Math.max(Math.abs(end.row - start.row), Math.abs(end.col - start.col));

    const cells: Cell[] = [];
    for (let i = 0; i <= distance; i++) {
      const row = start.row + i * dRow;
      const col = start.col + i * dCol;
      if (row >= 0 && row < gridRows && col >= 0 && col < gridCols) {
        cells.push(grid[row][col]);
      }
    }

    return cells;
  }

  function clearCellSelection() {
    for (const cell of selectedCells) {
      if (!cell.found) {
        grid[cell.row][cell.col].selected = false;
      }
    }
  }

  function clearSelection() {
    clearCellSelection();
    selectedCells = [];
    selectionStart = null;
    grid = grid;
  }

  function checkForWord() {
    const selectedWord = selectedCells.map(c => c.letter).join('');
    const reversedWord = selectedCells.map(c => c.letter).reverse().join('');

    for (const placedWord of placedWords) {
      if (placedWord.found) continue;

      if (selectedWord === placedWord.word || reversedWord === placedWord.word) {
        // Found a word!
        placedWord.found = true;
        foundCount++;

        // Mark cells as found
        for (const cell of selectedCells) {
          grid[cell.row][cell.col].found = true;
          grid[cell.row][cell.col].wordId = placedWord.word;
        }

        // Clear selection state
        selectionStart = null;
        selectedCells = [];
        grid = grid;
        placedWords = placedWords;

        // Check for game completion
        if (foundCount === totalWords) {
          completeGame();
        }

        return;
      }
    }

    // No match yet - keep selection visible so user can extend it
    // Selection will be cleared when user clicks outside valid direction
    // or when they start a new selection by clicking a non-adjacent cell
  }

  function completeGame() {
    gameComplete = true;
    if (timerInterval) clearInterval(timerInterval);

    dispatch('answer', {
      correct: true,
      userAnswer: `Found ${foundCount} words`,
      correctAnswer: `All ${totalWords} words found`,
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

  function getHintClass(word: PlacedWord): string {
    if (word.found) return '';
    if (!showHints) return '';

    // Highlight first letter position
    const firstCell = word.cells[0];
    return `hint-${firstCell.row}-${firstCell.col}`;
  }
</script>

<div class="wordhunt-container">
  <!-- Header -->
  <h2 class="instruction" dir="rtl">{step.instruction || 'کلمات آلمانی را در جدول پیدا کنید!'}</h2>

  <!-- Stats bar -->
  <div class="stats-bar">
    <div class="stat">
      <span class="stat-icon">🔍</span>
      <span class="stat-value">{foundCount}/{totalWords}</span>
      <span class="stat-label" dir="rtl">پیدا شده</span>
    </div>

    {#if step.timeLimit > 0}
      <div class="stat" class:warning={timeRemaining <= 10}>
        <span class="stat-icon">⏱️</span>
        <span class="stat-value">{formatTime(timeRemaining)}</span>
      </div>
    {/if}
  </div>

  <!-- Word list -->
  <div class="word-list" dir="rtl">
    {#each placedWords as word (word.word)}
      <div class="word-item" class:found={word.found}>
        <span class="word-german">{word.word}</span>
        <span class="word-translation">{word.translation}</span>
        {#if word.found}
          <span class="word-check">✓</span>
        {/if}
      </div>
    {/each}
  </div>

  <!-- Grid -->
  <div
    class="grid-container"
    style="--grid-size: {gridCols}"
  >
    {#each grid as row, rowIdx (rowIdx)}
      {#each row as cell, colIdx (`${rowIdx}:${colIdx}`)}
        <button
          class="grid-cell"
          class:selected={cell.selected}
          class:found={cell.found}
          class:hint={showHints && placedWords.some(w => !w.found && w.cells[0]?.row === rowIdx && w.cells[0]?.col === colIdx)}
          on:click={() => handleCellClick(cell)}
          disabled={gameComplete || timeOut}
        >
          {cell.letter}
        </button>
      {/each}
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
        آفرین! همه کلمات را پیدا کردید!
      </p>
    </div>
  {/if}

  <!-- Reset button -->
  {#if !gameComplete && !timeOut}
    <button class="reset-btn" on:click={resetGame}>
      🔄 شروع مجدد
    </button>
  {/if}
</div>

<style>
  .wordhunt-container {
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

  /* Word list */
  .word-list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2, 0.5rem);
    justify-content: center;
    max-width: 100%;
  }

  .word-item {
    display: flex;
    align-items: center;
    gap: var(--space-2, 0.5rem);
    padding: var(--space-1, 0.25rem) var(--space-3, 0.75rem);
    background: var(--glass-bg, rgba(253, 251, 247, 0.95));
    border: 2px solid var(--glass-border, rgba(212, 201, 185, 0.5));
    border-radius: var(--radius-full, 9999px);
    font-size: var(--text-sm, 0.875rem);
    transition: all var(--transition-normal, 200ms);
  }

  .word-item.found {
    background: linear-gradient(135deg, rgba(234, 179, 8, 0.15), rgba(234, 179, 8, 0.05));
    border-color: var(--color-success-400, #facc15);
    text-decoration: line-through;
    opacity: 0.8;
  }

  .word-german {
    font-weight: var(--font-bold, 700);
    color: var(--color-neutral-800, #292524);
  }

  .word-translation {
    color: var(--color-neutral-500, #78716c);
    font-size: var(--text-xs, 0.75rem);
  }

  .word-check {
    color: var(--color-success-500, #eab308);
    font-weight: var(--font-bold, 700);
  }

  /* Grid */
  .grid-container {
    display: grid;
    grid-template-columns: repeat(var(--grid-size), 1fr);
    gap: 3px;
    background: var(--color-neutral-300, #d4c9b9);
    padding: 3px;
    border-radius: var(--radius-lg, 0.75rem);
    width: 100%;
    max-width: 350px;
    aspect-ratio: 1;
    box-shadow: var(--shadow-md, 0 4px 15px rgba(0, 0, 0, 0.08));
  }

  .grid-cell {
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-neutral-50, #fdfbf7);
    border: none;
    font-size: var(--text-lg, 1.125rem);
    font-weight: var(--font-bold, 700);
    color: var(--color-neutral-700, #44403c);
    cursor: pointer;
    transition: all var(--transition-fast, 150ms);
    border-radius: var(--radius-sm, 0.375rem);
    text-transform: uppercase;
  }

  .grid-cell:hover:not(:disabled) {
    background: var(--color-primary-50, #ecfeff);
  }

  .grid-cell.selected {
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.1));
    color: var(--color-streak, #f59e0b);
    box-shadow: inset 0 0 0 2px var(--color-streak, #f59e0b);
  }

  .grid-cell.found {
    background: linear-gradient(135deg, rgba(234, 179, 8, 0.2), rgba(234, 179, 8, 0.1));
    color: var(--color-success-700, #a16207);
  }

  .grid-cell.hint {
    box-shadow: inset 0 0 0 2px var(--color-primary-500, #0891b2);
  }

  .grid-cell:disabled {
    cursor: default;
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

  :global([data-theme="dark"]) .grid-cell {
    background: var(--color-neutral-800, #292524);
    color: var(--color-neutral-200, #e8e0d5);
  }

  :global([data-theme="dark"]) .word-item {
    background: rgba(28, 25, 23, 0.95);
  }

  :global([data-theme="dark"]) .word-german {
    color: var(--color-neutral-100, #f5f0e8);
  }
</style>
