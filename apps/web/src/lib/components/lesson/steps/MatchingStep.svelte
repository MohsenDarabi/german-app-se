<script lang="ts">
  import type { MatchingStep } from "$lib/content-model";
  import { createEventDispatcher } from "svelte";
  import BiDiText from "$lib/components/ui/BiDiText.svelte";

  export let step: MatchingStep;
  export let lessonId: string = '';

  const dispatch = createEventDispatcher<{ answer: { correct: boolean; allowContinue: boolean } }>();

  // Fisher-Yates shuffle
  function shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  // State
  let shuffledGerman = shuffle([...step.items]);
  let shuffledPersian = shuffle([...step.matches]);

  let selectedGermanId: string | null = null;
  let selectedPersianId: string | null = null;
  let matchedPairs: Map<string, string> = new Map();
  let lastMatchedGerman: string | null = null;
  let lastMatchedPersian: string | null = null;
  let isComplete = false;

  $: totalPairs = step.items.length;
  $: completedPairs = matchedPairs.size;

  function isPairCorrect(germanId: string, persianId: string): boolean {
    return step.correctPairs.some(
      ([correctGerman, correctPersian]) => correctGerman === germanId && correctPersian === persianId
    );
  }

  function isGermanMatched(id: string): boolean {
    return matchedPairs.has(id);
  }

  function isPersianMatched(id: string): boolean {
    return Array.from(matchedPairs.values()).includes(id);
  }

  function selectGerman(id: string) {
    if (isGermanMatched(id) || isComplete) return;

    if (selectedGermanId === id) {
      selectedGermanId = null;
    } else {
      selectedGermanId = id;
      tryMatch();
    }
  }

  function selectPersian(id: string) {
    if (isPersianMatched(id) || isComplete) return;

    if (selectedPersianId === id) {
      selectedPersianId = null;
    } else {
      selectedPersianId = id;
      tryMatch();
    }
  }

  function tryMatch() {
    if (!selectedGermanId || !selectedPersianId) return;

    const correct = isPairCorrect(selectedGermanId, selectedPersianId);

    if (correct) {
      lastMatchedGerman = selectedGermanId;
      lastMatchedPersian = selectedPersianId;

      matchedPairs.set(selectedGermanId, selectedPersianId);
      matchedPairs = matchedPairs;

      setTimeout(() => {
        lastMatchedGerman = null;
        lastMatchedPersian = null;
      }, 500);

      if (matchedPairs.size === totalPairs) {
        isComplete = true;
        dispatch('answer', {
          correct: true,
          allowContinue: true
        });
      }
    }

    selectedGermanId = null;
    selectedPersianId = null;
  }
</script>

<div class="matching-container">
  {#if step.instruction}
    <p class="instruction" dir="rtl"><BiDiText text={step.instruction} /></p>
  {/if}

  <!-- Progress dots -->
  <div class="progress-dots">
    {#each Array(totalPairs) as _, i (i)}
      <span class="dot" class:completed={i < completedPairs}></span>
    {/each}
  </div>

  <!-- Two columns -->
  <div class="columns">
    <!-- German column (left) -->
    <div class="column">
      {#each shuffledGerman as item (item.id)}
        {@const isMatched = isGermanMatched(item.id)}
        {@const isJustMatched = lastMatchedGerman === item.id}
        {@const isSelected = selectedGermanId === item.id}
        {@const isWaiting = selectedPersianId && !isMatched}
        <button
          class="match-item"
          class:selected={isSelected}
          class:waiting={isWaiting && !isSelected}
          class:matched={isMatched && !isJustMatched}
          class:just-matched={isJustMatched}
          on:click={() => selectGerman(item.id)}
          disabled={isMatched}
        >
          {#if isSelected}
            <span class="selected-badge">●</span>
          {/if}
          {#if isMatched}
            <span class="check">✓</span>
          {/if}
          <span class="item-text" class:struck={isMatched}>{item.text}</span>
        </button>
      {/each}
    </div>

    <!-- Persian column (right) -->
    <div class="column">
      {#each shuffledPersian as item (item.id)}
        {@const isMatched = isPersianMatched(item.id)}
        {@const isJustMatched = lastMatchedPersian === item.id}
        {@const isSelected = selectedPersianId === item.id}
        {@const isWaiting = selectedGermanId && !isMatched}
        <button
          class="match-item persian"
          class:selected={isSelected}
          class:waiting={isWaiting && !isSelected}
          class:matched={isMatched && !isJustMatched}
          class:just-matched={isJustMatched}
          on:click={() => selectPersian(item.id)}
          disabled={isMatched}
          dir="rtl"
        >
          {#if isSelected}
            <span class="selected-badge">●</span>
          {/if}
          {#if isMatched}
            <span class="check">✓</span>
          {/if}
          <span class="item-text" class:struck={isMatched}>{item.text}</span>
        </button>
      {/each}
    </div>
  </div>

  <!-- Completion message -->
  {#if isComplete}
    <div class="success-message">
      <span class="success-icon">✓</span>
      <span dir="rtl">آفرین!</span>
    </div>
  {/if}
</div>

<style>
  .matching-container {
    display: flex;
    flex-direction: column;
    gap: var(--space-4, 1rem);
  }

  .instruction {
    font-size: var(--text-base, 1rem);
    color: var(--color-neutral-400, #a69b8a);
    text-align: center;
    margin: 0;
  }

  /* Progress dots */
  .progress-dots {
    display: flex;
    justify-content: center;
    gap: var(--space-2, 0.5rem);
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--color-neutral-200, #e8e0d5);
    transition: all var(--transition-normal, 200ms);
  }

  .dot.completed {
    background: var(--color-gem-400, #34d399);
  }

  /* Two columns */
  .columns {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-3, 0.75rem);
  }

  .column {
    display: flex;
    flex-direction: column;
    gap: var(--space-2, 0.5rem);
  }

  /* Base match item */
  .match-item {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2, 0.5rem);
    padding: var(--space-3, 0.75rem) var(--space-4, 1rem);
    min-height: 48px;
    border: 2px solid var(--color-neutral-200, #e8e0d5);
    border-radius: var(--radius-lg, 0.75rem);
    background: var(--color-neutral-50, #fdfbf7);
    font-size: var(--text-base, 1rem);
    font-weight: var(--font-medium, 500);
    color: var(--color-neutral-700, #44403c);
    cursor: pointer;
    transition: all var(--transition-normal, 200ms);
  }

  .match-item.persian {
    flex-direction: row-reverse;
  }

  .item-text {
    flex: 1;
    text-align: center;
  }

  .match-item:hover:not(:disabled):not(.matched) {
    border-color: var(--color-primary-300, #67e8f9);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  /* Selected - VERY prominent with pulsing badge */
  .match-item.selected {
    border-color: var(--color-primary-500, #0891b2);
    border-width: 3px;
    background: var(--color-primary-100, #cffafe);
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(8, 145, 178, 0.3);
    font-weight: var(--font-semibold, 600);
  }

  .selected-badge {
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--color-primary-500, #0891b2);
    color: white;
    font-size: 0.6rem;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: badge-pulse 0.8s ease-in-out infinite;
    box-shadow: 0 2px 8px rgba(8, 145, 178, 0.4);
  }

  @keyframes badge-pulse {
    0%, 100% { transform: translateX(-50%) scale(1); }
    50% { transform: translateX(-50%) scale(1.2); }
  }

  /* Waiting - hint for selecting from other column */
  .match-item.waiting {
    border-color: var(--color-primary-200, #a5f3fc);
    background: var(--color-primary-50, #ecfeff);
  }

  /* Just matched - flash green */
  .match-item.just-matched {
    border-color: var(--color-gem-400, #34d399);
    background: var(--color-gem-100, #d1fae5);
    animation: match-flash 0.5s ease-out;
  }

  @keyframes match-flash {
    0% { transform: scale(1.1); background: var(--color-gem-300, #6ee7b7); }
    100% { transform: scale(1); }
  }

  /* Matched - collapsed/shrunk with checkmark */
  .match-item.matched {
    min-height: 36px;
    padding: var(--space-2, 0.5rem) var(--space-3, 0.75rem);
    border-color: var(--color-gem-200, #a7f3d0);
    background: var(--color-gem-50, #ecfdf5);
    opacity: 0.6;
    font-size: var(--text-sm, 0.875rem);
    cursor: default;
    transform: scale(0.95);
  }

  .check {
    color: var(--color-gem-500, #10b981);
    font-size: 0.85rem;
    font-weight: bold;
  }

  .item-text.struck {
    color: var(--color-gem-600, #059669);
  }

  .match-item:disabled {
    cursor: default;
  }

  /* Success message */
  .success-message {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2, 0.5rem);
    padding: var(--space-3, 0.75rem);
    color: var(--color-gem-600, #059669);
    font-weight: var(--font-semibold, 600);
    animation: success-appear 0.3s ease-out;
  }

  @keyframes success-appear {
    0% { opacity: 0; transform: translateY(10px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  .success-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background: var(--color-gem-500, #10b981);
    color: white;
    border-radius: 50%;
    font-size: 0.875rem;
  }

  /* Dark Mode */
  :global([data-theme="dark"]) .match-item {
    background: var(--color-neutral-100, #292524);
    border-color: var(--color-neutral-200, #44403c);
    color: var(--color-neutral-200, #e8e0d5);
  }

  :global([data-theme="dark"]) .match-item.selected {
    background: rgba(8, 145, 178, 0.3);
    border-color: var(--color-primary-400, #22d3ee);
  }

  :global([data-theme="dark"]) .selected-badge {
    background: var(--color-primary-400, #22d3ee);
  }

  :global([data-theme="dark"]) .match-item.waiting {
    background: rgba(8, 145, 178, 0.15);
  }

  :global([data-theme="dark"]) .match-item.just-matched {
    background: rgba(16, 185, 129, 0.3);
  }

  :global([data-theme="dark"]) .match-item.matched {
    background: rgba(16, 185, 129, 0.15);
    border-color: var(--color-gem-600, #059669);
  }

  :global([data-theme="dark"]) .item-text.struck {
    color: var(--color-gem-400, #34d399);
  }

  :global([data-theme="dark"]) .check {
    color: var(--color-gem-400, #34d399);
  }

  :global([data-theme="dark"]) .dot {
    background: var(--color-neutral-300, #57534e);
  }
</style>
