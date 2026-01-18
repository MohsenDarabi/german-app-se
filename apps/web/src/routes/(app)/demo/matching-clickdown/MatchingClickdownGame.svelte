<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import ClickdownCard from './ClickdownCard.svelte';

  interface WordPair {
    id: string;
    german: string;
    persian: string;
  }

  export let pairs: WordPair[] = [];

  const dispatch = createEventDispatcher<{
    matchComplete: { pairId: string };
    gameComplete: void;
  }>();

  interface CardData {
    id: string;
    pairId: string;
    text: string;
    language: 'de' | 'fa';
    state: 'idle' | 'selected' | 'cracking' | 'deactivated';
  }

  let cards: CardData[] = [];
  let selectedCard: CardData | null = null;
  let isAnimating = false;

  // Initialize and shuffle cards
  $: if (pairs.length > 0 && cards.length === 0) {
    initializeCards();
  }

  function initializeCards() {
    const allCards: CardData[] = [];

    pairs.forEach((pair) => {
      allCards.push({
        id: `${pair.id}-de`,
        pairId: pair.id,
        text: pair.german,
        language: 'de',
        state: 'idle'
      });
      allCards.push({
        id: `${pair.id}-fa`,
        pairId: pair.id,
        text: pair.persian,
        language: 'fa',
        state: 'idle'
      });
    });

    // Shuffle using Fisher-Yates
    for (let i = allCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allCards[i], allCards[j]] = [allCards[j], allCards[i]];
    }

    cards = allCards;
  }

  async function handleCardSelect(event: CustomEvent<{ id: string }>) {
    if (isAnimating) return;

    const cardId = event.detail.id;
    const card = cards.find(c => c.id === cardId);

    if (!card || card.state === 'deactivated' || card.state === 'cracking') return;

    if (!selectedCard) {
      // First card selected - press it down
      selectedCard = card;
      cards = cards.map(c =>
        c.id === cardId ? { ...c, state: 'selected' } : c
      );
    } else if (selectedCard.id === cardId) {
      // Same card clicked - release it (deselect)
      selectedCard = null;
      cards = cards.map(c =>
        c.id === cardId ? { ...c, state: 'idle' } : c
      );
    } else {
      // Second card selected - check for match
      const isMatch = selectedCard.pairId === card.pairId;

      if (isMatch) {
        // Press second card down, then crack both
        cards = cards.map(c =>
          c.id === cardId ? { ...c, state: 'selected' } : c
        );
        await delay(150); // Brief moment to see both pressed
        await startCrackAnimation(selectedCard, card);
      } else {
        // Wrong match - press second card briefly, then release both
        cards = cards.map(c =>
          c.id === cardId ? { ...c, state: 'selected' } : c
        );
        await delay(300); // Show both pressed briefly
        cards = cards.map(c =>
          c.id === selectedCard!.id || c.id === cardId
            ? { ...c, state: 'idle' }
            : c
        );
        selectedCard = null;
      }
    }
  }

  async function startCrackAnimation(card1: CardData, card2: CardData) {
    isAnimating = true;

    // Set both cards to cracking state
    cards = cards.map(c =>
      c.id === card1.id || c.id === card2.id
        ? { ...c, state: 'cracking' }
        : c
    );

    // Wait for crack animation to complete
    await delay(900);

    // Transition to deactivated state
    cards = cards.map(c =>
      c.id === card1.id || c.id === card2.id
        ? { ...c, state: 'deactivated' }
        : c
    );

    // Cleanup
    selectedCard = null;
    isAnimating = false;

    dispatch('matchComplete', { pairId: card1.pairId });

    // Check for game completion
    const allDeactivated = cards.every(c => c.state === 'deactivated');
    if (allDeactivated) {
      await delay(300);
      dispatch('gameComplete');
    }
  }

  function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  export function reset() {
    cards = [];
    selectedCard = null;
    isAnimating = false;
    initializeCards();
  }
</script>

<div class="matching-game">
  <div class="cards-grid">
    {#each cards as card (card.id)}
      <ClickdownCard
        id={card.id}
        text={card.text}
        language={card.language}
        state={card.state}
        on:select={handleCardSelect}
      />
    {/each}
  </div>
</div>

<style>
  .matching-game {
    position: relative;
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
  }

  .cards-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-4);
    padding: var(--space-2);
  }

  /* Responsive adjustments */
  @media (min-width: 500px) {
    .cards-grid {
      grid-template-columns: repeat(4, 1fr);
      gap: var(--space-5);
    }
  }
</style>
