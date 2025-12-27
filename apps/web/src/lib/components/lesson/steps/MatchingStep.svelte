<script lang="ts">
  import type { MatchingStep } from "$lib/content-model";
  import { createEventDispatcher, onMount } from "svelte";
  import BiDiText from "$lib/components/ui/BiDiText.svelte";

  export let step: MatchingStep;
  export let lessonId: string = '';

  const dispatch = createEventDispatcher();

  // State
  let selectedItemId: string | null = null;
  let matchedPairs: [string, string][] = [];
  let isAnswered = false;
  let isCorrect = false;
  let canRetry = false;
  let shuffledMatches: typeof step.matches = [];

  // Shuffle matches on mount
  onMount(() => {
    if (step.shuffleTargets !== false) {
      shuffledMatches = [...step.matches].sort(() => Math.random() - 0.5);
    } else {
      shuffledMatches = [...step.matches];
    }
  });

  // Check if an item is already matched
  function isItemMatched(itemId: string): boolean {
    return matchedPairs.some(([item]) => item === itemId);
  }

  // Check if a match is already used
  function isMatchUsed(matchId: string): boolean {
    return matchedPairs.some(([, match]) => match === matchId);
  }

  // Get the match id for a matched item
  function getMatchForItem(itemId: string): string | null {
    const pair = matchedPairs.find(([item]) => item === itemId);
    return pair ? pair[1] : null;
  }

  // Check if a specific pair is correct
  function isPairCorrect(itemId: string, matchId: string): boolean {
    return step.correctPairs.some(
      ([correctItem, correctMatch]) => correctItem === itemId && correctMatch === matchId
    );
  }

  function selectItem(itemId: string) {
    if (isAnswered || isItemMatched(itemId)) return;
    selectedItemId = itemId;
  }

  function selectMatch(matchId: string) {
    if (isAnswered || !selectedItemId || isMatchUsed(matchId)) return;

    // Create the pair
    matchedPairs = [...matchedPairs, [selectedItemId, matchId]];
    selectedItemId = null;
  }

  function removePair(itemId: string) {
    if (isAnswered) return;
    matchedPairs = matchedPairs.filter(([item]) => item !== itemId);
  }

  function checkAnswer() {
    if (matchedPairs.length !== step.items.length) return;

    isAnswered = true;

    // Check if all pairs are correct
    isCorrect = matchedPairs.every(([itemId, matchId]) =>
      isPairCorrect(itemId, matchId)
    );

    if (!isCorrect) {
      canRetry = true;
    }

    dispatch('answer', {
      correct: isCorrect,
      allowContinue: isCorrect
    });
  }

  function retry() {
    matchedPairs = [];
    selectedItemId = null;
    isAnswered = false;
    isCorrect = false;
    canRetry = false;
    // Reshuffle
    if (step.shuffleTargets !== false) {
      shuffledMatches = [...step.matches].sort(() => Math.random() - 0.5);
    }
  }

  // Get the text for a match by ID
  function getMatchText(matchId: string): string {
    const match = step.matches.find(m => m.id === matchId);
    return match?.text || '';
  }

  // Get the text for an item by ID
  function getItemText(itemId: string): string {
    const item = step.items.find(i => i.id === itemId);
    return item?.text || '';
  }
</script>

<div class="matching-container">
  {#if step.instruction}
    <p class="instruction" dir="rtl"><BiDiText text={step.instruction} /></p>
  {/if}

  <div class="columns">
    <!-- Left column: Items (German words) -->
    <div class="column items-column">
      {#each step.items as item}
        {@const matched = isItemMatched(item.id)}
        {@const matchId = getMatchForItem(item.id)}
        {@const pairCorrect = matchId ? isPairCorrect(item.id, matchId) : false}
        <button
          class="match-chip"
          class:selected={selectedItemId === item.id}
          class:matched={matched}
          class:correct={isAnswered && matched && pairCorrect}
          class:wrong={isAnswered && matched && !pairCorrect}
          on:click={() => matched ? removePair(item.id) : selectItem(item.id)}
          disabled={isAnswered}
        >
          <span class="item-text">{item.text}</span>
          {#if matched}
            <span class="matched-text">{getMatchText(matchId || '')}</span>
          {/if}
        </button>
      {/each}
    </div>

    <!-- Right column: Matches (translations) -->
    <div class="column matches-column" dir="rtl">
      {#each shuffledMatches as match}
        {@const used = isMatchUsed(match.id)}
        <button
          class="match-chip"
          class:used={used}
          class:selectable={selectedItemId !== null && !used}
          on:click={() => selectMatch(match.id)}
          disabled={isAnswered || used || selectedItemId === null}
        >
          {match.text}
        </button>
      {/each}
    </div>
  </div>

  {#if !isAnswered && matchedPairs.length === step.items.length}
    <button class="check-btn" on:click={checkAnswer}>
      بررسی پاسخ
    </button>
  {/if}

  {#if selectedItemId && !isAnswered}
    <p class="hint" dir="rtl">حالا روی ترجمه صحیح بزنید</p>
  {/if}

  {#if isAnswered && isCorrect}
    <div class="success-section">
      <p class="feedback-text success">آفرین! همه جفت‌ها صحیح هستند</p>
      {#if step.feedback?.explanation}
        <p class="explanation" dir="rtl">{step.feedback.explanation}</p>
      {/if}
    </div>
  {/if}

  {#if canRetry}
    <div class="retry-section">
      <p class="feedback-text">بعضی جفت‌ها اشتباه هستند!</p>
      <div class="correct-pairs">
        <p><strong>پاسخ صحیح:</strong></p>
        {#each step.correctPairs as [itemId, matchId]}
          <p class="correct-pair">
            {getItemText(itemId)} = {getMatchText(matchId)}
          </p>
        {/each}
      </div>
      {#if step.feedback?.explanation}
        <p class="explanation" dir="rtl">{step.feedback.explanation}</p>
      {/if}
      <button class="retry-btn" on:click={retry}>تلاش مجدد</button>
    </div>
  {/if}
</div>

<style>
  .matching-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .instruction {
    font-size: 1.1rem;
    color: #64748b;
    text-align: center;
    margin: 0;
  }

  .columns {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .column {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .match-chip {
    padding: 0.875rem 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 0.75rem;
    background: white;
    font-size: 1rem;
    color: #334155;
    cursor: pointer;
    transition: all 0.2s;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .match-chip:hover:not(:disabled):not(.matched) {
    border-color: #3b82f6;
    background: #eff6ff;
  }

  .match-chip.selected {
    border-color: #3b82f6;
    background: #dbeafe;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  }

  .match-chip.selectable {
    border-color: #22c55e;
    background: #f0fdf4;
    animation: pulse 1s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }

  .match-chip.matched {
    background: #f1f5f9;
    border-color: #94a3b8;
    cursor: pointer;
  }

  .match-chip.used {
    opacity: 0.3;
    cursor: default;
  }

  .match-chip.correct {
    background: #f0fdf4;
    border-color: #22c55e;
  }

  .match-chip.wrong {
    background: #fef2f2;
    border-color: #ef4444;
  }

  .match-chip:disabled {
    cursor: default;
  }

  .item-text {
    font-weight: 500;
  }

  .matched-text {
    font-size: 0.85rem;
    color: #64748b;
    font-style: italic;
  }

  .hint {
    text-align: center;
    color: #3b82f6;
    font-size: 0.95rem;
    margin: 0;
  }

  .check-btn {
    padding: 1rem 2rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 999px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    align-self: center;
  }

  .check-btn:hover {
    background: #2563eb;
  }

  .success-section {
    padding: 1.5rem;
    background: #f0fdf4;
    border: 2px solid #86efac;
    border-radius: 0.75rem;
    text-align: center;
  }

  .retry-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 1.5rem;
    background: #fef2f2;
    border: 2px solid #fecaca;
    border-radius: 0.75rem;
  }

  .feedback-text {
    font-weight: 600;
    text-align: center;
    margin: 0;
  }

  .feedback-text.success {
    color: #15803d;
    font-size: 1.2rem;
  }

  .retry-section .feedback-text {
    color: #b91c1c;
  }

  .correct-pairs {
    text-align: center;
  }

  .correct-pair {
    margin: 0.25rem 0;
    color: #1e293b;
  }

  .explanation {
    color: #64748b;
    font-size: 0.95rem;
    text-align: center;
    margin: 0;
  }

  .retry-btn {
    padding: 0.75rem 2rem;
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 999px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    margin-top: 0.5rem;
  }

  .retry-btn:hover {
    background: #dc2626;
  }
</style>
