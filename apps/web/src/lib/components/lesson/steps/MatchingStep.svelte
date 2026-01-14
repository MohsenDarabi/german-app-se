<script lang="ts">
  import type { MatchingStep } from "$lib/content-model";
  import { createEventDispatcher } from "svelte";
  import BiDiText from "$lib/components/ui/BiDiText.svelte";

  export let step: MatchingStep;
  export let lessonId: string = '';

  const dispatch = createEventDispatcher();

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
  let matchedPairs: Map<string, string> = new Map(); // german id -> persian id
  let lastMatchedGerman: string | null = null;
  let lastMatchedPersian: string | null = null;
  let isComplete = false;

  $: totalPairs = step.items.length;
  $: completedPairs = matchedPairs.size;

  // Check if a pair is correct
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
      // Store for animation
      lastMatchedGerman = selectedGermanId;
      lastMatchedPersian = selectedPersianId;

      // Add to matched
      matchedPairs.set(selectedGermanId, selectedPersianId);
      matchedPairs = matchedPairs;

      // Clear animation after delay
      setTimeout(() => {
        lastMatchedGerman = null;
        lastMatchedPersian = null;
      }, 500);

      // Check completion
      if (matchedPairs.size === totalPairs) {
        isComplete = true;
        dispatch('answer', {
          correct: true,
          allowContinue: true
        });
      }
    }

    // Reset selection
    selectedGermanId = null;
    selectedPersianId = null;
  }

  function getGermanState(id: string): string {
    if (lastMatchedGerman === id) return 'just-matched';
    if (isGermanMatched(id)) return 'matched';
    if (selectedGermanId === id) return 'selected';
    if (selectedPersianId && !isGermanMatched(id)) return 'selectable';
    return 'default';
  }

  function getPersianState(id: string): string {
    if (lastMatchedPersian === id) return 'just-matched';
    if (isPersianMatched(id)) return 'matched';
    if (selectedPersianId === id) return 'selected';
    if (selectedGermanId && !isPersianMatched(id)) return 'selectable';
    return 'default';
  }
</script>

<div class="matching-container">
  {#if step.instruction}
    <p class="instruction" dir="rtl"><BiDiText text={step.instruction} /></p>
  {/if}

  <!-- Progress dots -->
  <div class="progress-dots">
    {#each Array(totalPairs) as _, i}
      <span class="dot" class:completed={i < completedPairs}></span>
    {/each}
  </div>

  <!-- Two columns -->
  <div class="columns">
    <!-- German column (left) -->
    <div class="column">
      {#each shuffledGerman as item (item.id)}
        {@const state = getGermanState(item.id)}
        <button
          class="match-item"
          class:selected={state === 'selected'}
          class:selectable={state === 'selectable'}
          class:matched={state === 'matched'}
          class:just-matched={state === 'just-matched'}
          on:click={() => selectGerman(item.id)}
          disabled={isGermanMatched(item.id)}
        >
          {#if state === 'selected'}
            <span class="selected-indicator">●</span>
          {/if}
          <span class="item-text">{item.text}</span>
        </button>
      {/each}
    </div>

    <!-- Persian column (right) -->
    <div class="column">
      {#each shuffledPersian as item (item.id)}
        {@const state = getPersianState(item.id)}
        <button
          class="match-item persian"
          class:selected={state === 'selected'}
          class:selectable={state === 'selectable'}
          class:matched={state === 'matched'}
          class:just-matched={state === 'just-matched'}
          on:click={() => selectPersian(item.id)}
          disabled={isPersianMatched(item.id)}
          dir="rtl"
        >
          {#if state === 'selected'}
            <span class="selected-indicator">●</span>
          {/if}
          <span class="item-text">{item.text}</span>
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

  /* Two columns side by side */
  .columns {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-4, 1rem);
  }

  .column {
    display: flex;
    flex-direction: column;
    gap: var(--space-2, 0.5rem);
  }

  /* Match item */
  .match-item {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2, 0.5rem);
    padding: var(--space-3, 0.75rem) var(--space-4, 1rem);
    min-height: 44px;
    border: 2px solid var(--color-neutral-200, #e8e0d5);
    border-radius: var(--radius-lg, 0.75rem);
    background: var(--color-neutral-50, #fdfbf7);
    font-size: var(--text-base, 1rem);
    font-weight: var(--font-medium, 500);
    color: var(--color-neutral-700, #44403c);
    cursor: pointer;
    transition: all var(--transition-normal, 200ms);
    text-align: center;
    position: relative;
  }

  .match-item.persian {
    flex-direction: row-reverse;
  }

  .item-text {
    flex: 1;
  }

  .selected-indicator {
    color: var(--color-primary-500, #0891b2);
    font-size: 0.75rem;
    animation: pulse-dot 1s infinite;
  }

  @keyframes pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(0.8); }
  }

  .match-item:hover:not(:disabled):not(.matched) {
    border-color: var(--color-primary-300, #67e8f9);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  /* Selected - very prominent */
  .match-item.selected {
    border-color: var(--color-primary-500, #0891b2);
    border-width: 3px;
    background: var(--color-primary-100, #cffafe);
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(8, 145, 178, 0.3);
    font-weight: var(--font-semibold, 600);
  }

  /* Selectable - hint for other column */
  .match-item.selectable {
    border-color: var(--color-primary-200, #a5f3fc);
    background: var(--color-primary-50, #ecfeff);
  }

  /* Just matched - green flash */
  .match-item.just-matched {
    border-color: var(--color-gem-400, #34d399);
    background: var(--color-gem-50, #ecfdf5);
    animation: match-pop 0.4s ease-out;
  }

  @keyframes match-pop {
    0% { transform: scale(1.08); }
    100% { transform: scale(1); }
  }

  /* Matched - muted */
  .match-item.matched {
    border-color: var(--color-gem-200, #a7f3d0);
    background: var(--color-gem-50, #ecfdf5);
    color: var(--color-gem-600, #059669);
    opacity: 0.7;
    cursor: default;
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
    padding: var(--space-2, 0.5rem);
    color: var(--color-gem-600, #059669);
    font-weight: var(--font-semibold, 600);
  }

  .success-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    background: var(--color-gem-500, #10b981);
    color: white;
    border-radius: 50%;
    font-size: 0.75rem;
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
    border-width: 3px;
  }

  :global([data-theme="dark"]) .selected-indicator {
    color: var(--color-primary-400, #22d3ee);
  }

  :global([data-theme="dark"]) .match-item.selectable {
    background: rgba(8, 145, 178, 0.1);
  }

  :global([data-theme="dark"]) .match-item.just-matched {
    background: rgba(16, 185, 129, 0.2);
  }

  :global([data-theme="dark"]) .match-item.matched {
    background: rgba(16, 185, 129, 0.15);
    border-color: var(--color-gem-600, #059669);
    color: var(--color-gem-400, #34d399);
  }

  :global([data-theme="dark"]) .dot {
    background: var(--color-neutral-300, #57534e);
  }
</style>
