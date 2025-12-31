<script lang="ts">
  import type { WordHuntStep } from "$lib/content-model";
  import { createEventDispatcher, onMount } from "svelte";

  export let step: WordHuntStep;
  export let lessonId: string = '';

  const dispatch = createEventDispatcher();

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

  $: totalWords = step.words.length;
  $: gridSize = step.gridSize || 6;

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
    grid = Array(gridSize).fill(null).map((_, row) =>
      Array(gridSize).fill(null).map((_, col) => ({
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
    const sortedWords = [...step.words].sort((a, b) => b.word.length - a.word.length);

    // Try to place each word
    for (const wordInfo of sortedWords) {
      const word = wordInfo.word.toUpperCase();
      const placed = placeWord(word, wordInfo.translation);
      if (!placed) {
        console.warn(`Could not place word: ${word}`);
      }
    }

    // Fill empty cells with random German letters
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        if (!grid[row][col].letter) {
          grid[row][col].letter = GERMAN_LETTERS[Math.floor(Math.random() * GERMAN_LETTERS.length)];
        }
      }
    }
  }

  function placeWord(word: string, translation: string): boolean {
    const directions = step.directions || ['horizontal', 'vertical'];
    const maxAttempts = 100;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const direction = directions[Math.floor(Math.random() * directions.length)];
      const { dRow, dCol } = getDirectionDelta(direction);

      // Calculate valid starting positions
      const maxRow = gridSize - (dRow > 0 ? word.length : 1);
      const maxCol = gridSize - (dCol > 0 ? word.length : 1);
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

        if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) {
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
      if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
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
    if (!step.showHints) return '';

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
    {#each placedWords as word}
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
    style="--grid-size: {gridSize}"
  >
    {#each grid as row, rowIdx}
      {#each row as cell, colIdx}
        <button
          class="grid-cell"
          class:selected={cell.selected}
          class:found={cell.found}
          class:hint={step.showHints && placedWords.some(w => !w.found && w.cells[0]?.row === rowIdx && w.cells[0]?.col === colIdx)}
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

  /* Word list */
  .word-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
    max-width: 100%;
  }

  .word-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.35rem 0.75rem;
    background: #f1f5f9;
    border: 2px solid #e2e8f0;
    border-radius: 999px;
    font-size: 0.85rem;
    transition: all 0.3s;
  }

  .word-item.found {
    background: #dcfce7;
    border-color: #22c55e;
    text-decoration: line-through;
    opacity: 0.8;
  }

  .word-german {
    font-weight: 700;
    color: #1e293b;
  }

  .word-translation {
    color: #64748b;
    font-size: 0.8rem;
  }

  .word-check {
    color: #22c55e;
    font-weight: 700;
  }

  /* Grid */
  .grid-container {
    display: grid;
    grid-template-columns: repeat(var(--grid-size), 1fr);
    gap: 3px;
    background: #e2e8f0;
    padding: 3px;
    border-radius: 0.75rem;
    width: 100%;
    max-width: 350px;
    aspect-ratio: 1;
  }

  .grid-cell {
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    border: none;
    font-size: 1.1rem;
    font-weight: 700;
    color: #1e293b;
    cursor: pointer;
    transition: all 0.15s;
    border-radius: 4px;
    text-transform: uppercase;
  }

  .grid-cell:hover:not(:disabled) {
    background: #f1f5f9;
  }

  .grid-cell.selected {
    background: #fef3c7;
    color: #92400e;
  }

  .grid-cell.found {
    background: #dcfce7;
    color: #166534;
  }

  .grid-cell.hint {
    box-shadow: inset 0 0 0 2px #3b82f6;
  }

  .grid-cell:disabled {
    cursor: default;
  }

  /* Smaller cells for larger grids */
  @container (max-width: 350px) {
    .grid-cell {
      font-size: 0.9rem;
    }
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
