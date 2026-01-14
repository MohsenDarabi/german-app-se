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

  // Create mixed items from both columns
  type MixedItem = {
    id: string;
    text: string;
    type: 'german' | 'persian';
    originalId: string;
  };

  function createMixedItems(): MixedItem[] {
    const germanItems: MixedItem[] = step.items.map(item => ({
      id: `de-${item.id}`,
      text: item.text,
      type: 'german' as const,
      originalId: item.id
    }));

    const persianItems: MixedItem[] = step.matches.map(match => ({
      id: `fa-${match.id}`,
      text: match.text,
      type: 'persian' as const,
      originalId: match.id
    }));

    return shuffle([...germanItems, ...persianItems]);
  }

  // State
  let mixedItems = createMixedItems();
  let selectedItem: MixedItem | null = null;
  let matchedPairs: Map<string, string> = new Map(); // german originalId -> persian originalId
  let matchedItemIds: Set<string> = new Set(); // All matched item IDs (for styling)
  let lastMatchedIds: Set<string> = new Set(); // For animation
  let isComplete = false;

  $: totalPairs = step.items.length;
  $: completedPairs = matchedPairs.size;
  $: progressDots = Array(totalPairs).fill(false).map((_, i) => i < completedPairs);

  // Check if a pair is correct
  function isPairCorrect(germanId: string, persianId: string): boolean {
    return step.correctPairs.some(
      ([correctGerman, correctPersian]) => correctGerman === germanId && correctPersian === persianId
    );
  }

  function handleItemClick(item: MixedItem) {
    if (matchedItemIds.has(item.id) || isComplete) return;

    if (!selectedItem) {
      // First selection
      selectedItem = item;
    } else if (selectedItem.id === item.id) {
      // Deselect
      selectedItem = null;
    } else if (selectedItem.type === item.type) {
      // Same type - switch selection
      selectedItem = item;
    } else {
      // Different types - try to match
      const germanItem = selectedItem.type === 'german' ? selectedItem : item;
      const persianItem = selectedItem.type === 'persian' ? selectedItem : item;

      // Check if correct
      const correct = isPairCorrect(germanItem.originalId, persianItem.originalId);

      if (correct) {
        // Add to matched
        matchedPairs.set(germanItem.originalId, persianItem.originalId);
        matchedPairs = matchedPairs; // trigger reactivity

        matchedItemIds.add(germanItem.id);
        matchedItemIds.add(persianItem.id);
        matchedItemIds = matchedItemIds; // trigger reactivity

        // Animation tracking
        lastMatchedIds = new Set([germanItem.id, persianItem.id]);
        setTimeout(() => {
          lastMatchedIds = new Set();
        }, 600);

        // Check if all matched
        if (matchedPairs.size === totalPairs) {
          isComplete = true;
          dispatch('answer', {
            correct: true,
            allowContinue: true
          });
        }
      } else {
        // Wrong match - shake and reset selection
        // Could add shake animation here
      }

      selectedItem = null;
    }
  }

  function getItemState(item: MixedItem): string {
    if (lastMatchedIds.has(item.id)) return 'just-matched';
    if (matchedItemIds.has(item.id)) return 'matched';
    if (selectedItem?.id === item.id) return 'selected';
    if (selectedItem && selectedItem.type !== item.type && !matchedItemIds.has(item.id)) return 'selectable';
    return 'default';
  }
</script>

<div class="matching-container">
  {#if step.instruction}
    <p class="instruction" dir="rtl"><BiDiText text={step.instruction} /></p>
  {/if}

  <!-- Progress dots -->
  <div class="progress-dots">
    {#each progressDots as completed, i}
      <span class="dot" class:completed></span>
    {/each}
  </div>

  <!-- Mixed items grid -->
  <div class="items-grid">
    {#each mixedItems as item (item.id)}
      {@const state = getItemState(item)}
      <button
        class="match-item"
        class:german={item.type === 'german'}
        class:persian={item.type === 'persian'}
        class:selected={state === 'selected'}
        class:selectable={state === 'selectable'}
        class:matched={state === 'matched'}
        class:just-matched={state === 'just-matched'}
        on:click={() => handleItemClick(item)}
        disabled={matchedItemIds.has(item.id)}
      >
        <span class="flag">{item.type === 'german' ? '🇩🇪' : '🇮🇷'}</span>
        <span class="text" dir={item.type === 'persian' ? 'rtl' : 'ltr'}>{item.text}</span>
      </button>
    {/each}
  </div>

  <!-- Completion message -->
  {#if isComplete}
    <div class="success-message">
      <span class="success-icon">✓</span>
      <span dir="rtl">آفرین! همه جفت‌ها صحیح</span>
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
    color: var(--color-neutral-500, #78716c);
    text-align: center;
    margin: 0;
  }

  /* Progress dots */
  .progress-dots {
    display: flex;
    justify-content: center;
    gap: var(--space-2, 0.5rem);
    padding: var(--space-2, 0.5rem) 0;
  }

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--color-neutral-200, #e8e0d5);
    transition: all var(--transition-normal, 200ms);
  }

  .dot.completed {
    background: var(--color-gem-400, #34d399);
    transform: scale(1.1);
  }

  /* Items grid - 2 columns */
  .items-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-3, 0.75rem);
  }

  /* Match item */
  .match-item {
    display: flex;
    align-items: center;
    gap: var(--space-2, 0.5rem);
    padding: var(--space-3, 0.75rem);
    min-height: 48px;
    border: 2px solid var(--color-neutral-200, #e8e0d5);
    border-radius: var(--radius-lg, 0.75rem);
    background: var(--color-neutral-50, #fdfbf7);
    cursor: pointer;
    transition: all var(--transition-normal, 200ms);
    text-align: left;
  }

  .match-item.persian {
    text-align: right;
    flex-direction: row-reverse;
  }

  .match-item:hover:not(:disabled):not(.matched) {
    border-color: var(--color-primary-300, #67e8f9);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  /* Selected state - lifted */
  .match-item.selected {
    border-color: var(--color-primary-500, #0891b2);
    background: var(--color-primary-50, #ecfeff);
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(8, 145, 178, 0.2);
  }

  /* Selectable state - waiting for match */
  .match-item.selectable {
    border-color: var(--color-primary-300, #67e8f9);
    animation: pulse-border 1s infinite;
  }

  @keyframes pulse-border {
    0%, 100% { border-color: var(--color-primary-300, #67e8f9); }
    50% { border-color: var(--color-primary-500, #0891b2); }
  }

  /* Just matched - green glow animation */
  .match-item.just-matched {
    border-color: var(--color-gem-400, #34d399);
    background: var(--color-gem-50, #ecfdf5);
    animation: match-glow 0.6s ease-out;
  }

  @keyframes match-glow {
    0% {
      transform: scale(1.05);
      box-shadow: 0 0 20px rgba(16, 185, 129, 0.5);
    }
    100% {
      transform: scale(1);
      box-shadow: none;
    }
  }

  /* Matched state - muted */
  .match-item.matched {
    border-color: var(--color-neutral-200, #e8e0d5);
    background: var(--color-neutral-100, #f5f0e8);
    opacity: 0.6;
    cursor: default;
  }

  .match-item:disabled {
    cursor: default;
  }

  .flag {
    font-size: 1rem;
    flex-shrink: 0;
  }

  .text {
    font-size: var(--text-base, 1rem);
    font-weight: var(--font-medium, 500);
    color: var(--color-neutral-700, #44403c);
    flex: 1;
  }

  .match-item.matched .text {
    color: var(--color-neutral-400, #a69b8a);
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
    animation: fade-in 0.3s ease-out;
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

  @keyframes fade-in {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* Dark Mode */
  :global([data-theme="dark"]) .match-item {
    background: var(--color-neutral-100, #292524);
    border-color: var(--color-neutral-200, #44403c);
  }

  :global([data-theme="dark"]) .match-item .text {
    color: var(--color-neutral-200, #e8e0d5);
  }

  :global([data-theme="dark"]) .match-item.selected {
    background: rgba(8, 145, 178, 0.15);
  }

  :global([data-theme="dark"]) .match-item.just-matched {
    background: rgba(16, 185, 129, 0.15);
  }

  :global([data-theme="dark"]) .match-item.matched {
    background: var(--color-neutral-100, #292524);
    opacity: 0.5;
  }

  :global([data-theme="dark"]) .match-item.matched .text {
    color: var(--color-neutral-400, #78716c);
  }

  :global([data-theme="dark"]) .dot {
    background: var(--color-neutral-300, #57534e);
  }
</style>
