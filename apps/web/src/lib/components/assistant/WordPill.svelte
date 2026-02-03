<script lang="ts">
  import type { VocabularyItem } from "@pkg/content-model";
  import { onMount } from "svelte";
  import { selectedWord } from "./assistantStore";

  export let item: VocabularyItem;

  // Popover state - derived from store
  let pillElement: HTMLButtonElement;
  let popoverElement: HTMLDivElement;
  let popoverPosition: 'below' | 'above' = 'below';

  // Check if this pill's popover should be shown
  $: showPopover = $selectedWord === item.de;

  // Persian translations for grammar terms
  const POS_LABELS: Record<string, string> = {
    'noun': 'اسم',
    'verb': 'فعل',
    'adjective': 'صفت',
    'adverb': 'قید',
    'phrase': 'عبارت',
    'preposition': 'حرف اضافه',
    'pronoun': 'ضمیر',
    'conjunction': 'حرف ربط',
    'interjection': 'حرف ندا',
    'particle': 'ادات'
  };

  // Gender labels in Persian
  const GENDER_LABELS: Record<string, string> = {
    'm': 'مذکر',
    'f': 'مونث',
    'n': 'خنثی'
  };

  // Determine pill color based on grammar
  function getPillClass(): string {
    const grammar = item.grammar;
    if (!grammar) return 'pill-default';

    if (grammar.noun) {
      switch (grammar.noun.artikel) {
        case 'm': return 'pill-masculine';
        case 'f': return 'pill-feminine';
        case 'n': return 'pill-neuter';
      }
    }

    if (grammar.verb) return 'pill-verb';
    if (grammar.pos === 'adjective') return 'pill-adjective';
    if (grammar.pos === 'adverb') return 'pill-adverb';
    if (grammar.pos === 'phrase') return 'pill-phrase';
    if (grammar.pos === 'interjection') return 'pill-phrase';

    return 'pill-default';
  }

  // Get article prefix for nouns
  function getArticle(): string {
    if (item.grammar?.noun) {
      switch (item.grammar.noun.artikel) {
        case 'm': return 'der';
        case 'f': return 'die';
        case 'n': return 'das';
      }
    }
    return '';
  }

  // Get Persian POS label
  function getPosLabel(): string {
    if (item.grammar?.noun) return POS_LABELS['noun'];
    if (item.grammar?.verb) return POS_LABELS['verb'];
    if (item.grammar?.pos) return POS_LABELS[item.grammar.pos] || item.grammar.pos;
    return '';
  }

  // Get gender info for nouns
  function getGenderInfo(): { article: string; label: string; color: string } | null {
    if (!item.grammar?.noun) return null;
    const artikel = item.grammar.noun.artikel;
    const colors: Record<string, string> = {
      'm': '#3b82f6',
      'f': '#ec4899',
      'n': '#10b981'
    };
    return {
      article: getArticle(),
      label: GENDER_LABELS[artikel] || '',
      color: colors[artikel] || '#9ca3af'
    };
  }

  // Toggle popover
  function togglePopover(event: MouseEvent) {
    event.stopPropagation();

    if (showPopover) {
      // Close this popover
      selectedWord.set(null);
      return;
    }

    // Calculate position
    if (pillElement) {
      const rect = pillElement.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      popoverPosition = spaceBelow < 200 && spaceAbove > spaceBelow ? 'above' : 'below';
    }

    // Open this popover (closes any other open popover)
    selectedWord.set(item.de);
  }

  // Close popover when clicking outside
  function handleClickOutside(event: MouseEvent) {
    if (showPopover && popoverElement && !popoverElement.contains(event.target as Node) &&
        pillElement && !pillElement.contains(event.target as Node)) {
      selectedWord.set(null);
    }
  }

  onMount(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  });

  $: pillClass = item && getPillClass();
  $: article = item && getArticle();
  $: posLabel = item && getPosLabel();
  $: genderInfo = item && getGenderInfo();
</script>

<div class="pill-wrapper">
  <button
    bind:this={pillElement}
    class="word-pill {pillClass}"
    class:active={showPopover}
    on:click={togglePopover}
  >
    {#if article}
      <span class="article">{article}</span>
    {/if}
    <span class="word">{item.de}</span>
  </button>

  {#if showPopover}
    <div
      bind:this={popoverElement}
      class="popover {popoverPosition}"
      dir="rtl"
    >
      <div class="popover-content">
        <!-- German word -->
        <div class="popover-word" dir="ltr">
          {#if genderInfo}
            <span class="popover-article" style="color: {genderInfo.color}">{genderInfo.article}</span>
          {/if}
          <span class="popover-de">{item.de}</span>
        </div>

        <!-- Persian translation -->
        <div class="popover-translation">{item.fa}</div>

        <!-- Grammar info -->
        <div class="popover-grammar">
          {#if genderInfo}
            <span class="grammar-badge" style="background: {genderInfo.color}20; color: {genderInfo.color}; border-color: {genderInfo.color}">
              {genderInfo.label}
            </span>
          {/if}
          {#if posLabel}
            <span class="grammar-badge pos">{posLabel}</span>
          {/if}
          {#if item.grammar?.noun?.plural}
            <span class="plural-info">جمع: {item.grammar.noun.plural}</span>
          {/if}
        </div>
      </div>
      <div class="popover-arrow {popoverPosition}"></div>
    </div>
  {/if}
</div>

<style>
  .pill-wrapper {
    position: relative;
    display: inline-block;
  }

  .word-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.375rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s;
    border: 2px solid transparent;
  }

  .word-pill:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .word-pill.active {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .article {
    font-size: 0.75rem;
    opacity: 0.8;
  }

  .word {
    font-weight: 600;
  }

  /* Popover styles */
  .popover {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    min-width: 160px;
    max-width: 280px;
    background: white;
    border-radius: 0.75rem;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15), 0 2px 10px rgba(0, 0, 0, 0.1);
    border: 1px solid var(--color-neutral-200, #e8e0d5);
    animation: popoverIn 0.15s ease-out;
  }

  .popover.below {
    top: calc(100% + 8px);
  }

  .popover.above {
    bottom: calc(100% + 8px);
  }

  @keyframes popoverIn {
    from {
      opacity: 0;
      transform: translateX(-50%) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) scale(1);
    }
  }

  .popover-content {
    padding: 0.875rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .popover-word {
    display: flex;
    align-items: baseline;
    gap: 0.375rem;
    justify-content: center;
  }

  .popover-article {
    font-size: 0.9rem;
    font-weight: 500;
  }

  .popover-de {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-primary-600, #0891b2);
  }

  .popover-translation {
    font-size: 1rem;
    color: var(--color-neutral-600, #57534e);
    text-align: center;
  }

  .popover-grammar {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
    justify-content: center;
    align-items: center;
  }

  .grammar-badge {
    display: inline-block;
    padding: 0.2rem 0.5rem;
    border-radius: 9999px;
    font-size: 0.7rem;
    font-weight: 500;
    border: 1px solid;
  }

  .grammar-badge.pos {
    background: var(--color-neutral-100, #f5f0e8);
    color: var(--color-neutral-600, #57534e);
    border-color: var(--color-neutral-300, #d4c9b9);
  }

  .plural-info {
    font-size: 0.75rem;
    color: var(--color-neutral-500, #78716c);
  }

  /* Arrow */
  .popover-arrow {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
  }

  .popover-arrow.below {
    top: -8px;
    border-bottom: 8px solid white;
  }

  .popover-arrow.above {
    bottom: -8px;
    border-top: 8px solid white;
  }

  /* Pill color variants */
  .pill-masculine {
    background: linear-gradient(135deg, #dbeafe, #bfdbfe);
    color: #1e40af;
    border-color: #3b82f6;
  }
  .pill-masculine:hover { background: #bfdbfe; }

  .pill-feminine {
    background: linear-gradient(135deg, #fce7f3, #fbcfe8);
    color: #9d174d;
    border-color: #ec4899;
  }
  .pill-feminine:hover { background: #fbcfe8; }

  .pill-neuter {
    background: linear-gradient(135deg, #d1fae5, #a7f3d0);
    color: #047857;
    border-color: #10b981;
  }
  .pill-neuter:hover { background: #a7f3d0; }

  .pill-verb {
    background: linear-gradient(135deg, #ede9fe, #ddd6fe);
    color: #5b21b6;
    border-color: #8b5cf6;
  }
  .pill-verb:hover { background: #ddd6fe; }

  .pill-adjective {
    background: linear-gradient(135deg, #ffedd5, #fed7aa);
    color: #9a3412;
    border-color: #f97316;
  }
  .pill-adjective:hover { background: #fed7aa; }

  .pill-adverb {
    background: linear-gradient(135deg, #ccfbf1, #99f6e4);
    color: #0f766e;
    border-color: #14b8a6;
  }
  .pill-adverb:hover { background: #99f6e4; }

  .pill-phrase {
    background: linear-gradient(135deg, #fef9c3, #fef08a);
    color: #78350f;
    border-color: #facc15;
  }
  .pill-phrase:hover { background: #fef08a; }

  .pill-default {
    background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
    color: #374151;
    border-color: #9ca3af;
  }
  .pill-default:hover { background: #e5e7eb; }

  /* Dark Mode */
  :global([data-theme="dark"]) .popover {
    background: #292524;
    border-color: #44403c;
  }

  :global([data-theme="dark"]) .popover-arrow.below {
    border-bottom-color: #292524;
  }

  :global([data-theme="dark"]) .popover-arrow.above {
    border-top-color: #292524;
  }

  :global([data-theme="dark"]) .popover-de {
    color: #22d3ee;
  }

  :global([data-theme="dark"]) .popover-translation {
    color: #d4c9b9;
  }

  :global([data-theme="dark"]) .grammar-badge.pos {
    background: #44403c;
    color: #d4c9b9;
    border-color: #57534e;
  }

  :global([data-theme="dark"]) .plural-info {
    color: #a69b8a;
  }

  :global([data-theme="dark"]) .pill-masculine {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.1));
    color: #93c5fd;
    border-color: #3b82f6;
  }

  :global([data-theme="dark"]) .pill-feminine {
    background: linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(236, 72, 153, 0.1));
    color: #f9a8d4;
    border-color: #ec4899;
  }

  :global([data-theme="dark"]) .pill-neuter {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.1));
    color: #6ee7b7;
    border-color: #10b981;
  }

  :global([data-theme="dark"]) .pill-verb {
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.1));
    color: #c4b5fd;
    border-color: #8b5cf6;
  }

  :global([data-theme="dark"]) .pill-phrase {
    background: linear-gradient(135deg, rgba(250, 204, 21, 0.2), rgba(250, 204, 21, 0.1));
    color: #fef08a;
    border-color: #facc15;
  }

  :global([data-theme="dark"]) .pill-default {
    background: linear-gradient(135deg, rgba(156, 163, 175, 0.2), rgba(156, 163, 175, 0.1));
    color: #d1d5db;
    border-color: #6b7280;
  }
</style>
