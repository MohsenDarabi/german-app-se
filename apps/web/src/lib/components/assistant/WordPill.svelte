<script lang="ts">
  import type { VocabularyItem } from "@pkg/content-model";
  import { openWordDetails } from "./assistantStore";

  export let item: VocabularyItem;

  // Determine pill color based on grammar
  function getPillClass(): string {
    const grammar = item.grammar;

    if (!grammar) return 'pill-default';

    // Nouns - color by article
    if (grammar.noun) {
      switch (grammar.noun.artikel) {
        case 'm': return 'pill-masculine';
        case 'f': return 'pill-feminine';
        case 'n': return 'pill-neuter';
      }
    }

    // Verbs
    if (grammar.verb) return 'pill-verb';

    // By POS
    if (grammar.pos === 'adjective') return 'pill-adjective';
    if (grammar.pos === 'adverb') return 'pill-adverb';
    if (grammar.pos === 'phrase') return 'pill-phrase';

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

  $: pillClass = getPillClass();
  $: article = getArticle();
</script>

<button
  class="word-pill {pillClass}"
  on:click={() => openWordDetails(item.de)}
>
  {#if article}
    <span class="article">{article}</span>
  {/if}
  <span class="word">{item.de}</span>
</button>

<style>
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

  .article {
    font-size: 0.75rem;
    opacity: 0.8;
  }

  .word {
    font-weight: 600;
  }

  /* Masculine (der) - Blue */
  .pill-masculine {
    background: linear-gradient(135deg, #dbeafe, #bfdbfe);
    color: #1e40af;
    border-color: #3b82f6;
  }

  .pill-masculine:hover {
    background: #bfdbfe;
  }

  /* Feminine (die) - Pink */
  .pill-feminine {
    background: linear-gradient(135deg, #fce7f3, #fbcfe8);
    color: #9d174d;
    border-color: #ec4899;
  }

  .pill-feminine:hover {
    background: #fbcfe8;
  }

  /* Neuter (das) - Green */
  .pill-neuter {
    background: linear-gradient(135deg, #d1fae5, #a7f3d0);
    color: #047857;
    border-color: #10b981;
  }

  .pill-neuter:hover {
    background: #a7f3d0;
  }

  /* Verb - Purple */
  .pill-verb {
    background: linear-gradient(135deg, #ede9fe, #ddd6fe);
    color: #5b21b6;
    border-color: #8b5cf6;
  }

  .pill-verb:hover {
    background: #ddd6fe;
  }

  /* Adjective - Orange */
  .pill-adjective {
    background: linear-gradient(135deg, #ffedd5, #fed7aa);
    color: #9a3412;
    border-color: #f97316;
  }

  .pill-adjective:hover {
    background: #fed7aa;
  }

  /* Adverb - Teal */
  .pill-adverb {
    background: linear-gradient(135deg, #ccfbf1, #99f6e4);
    color: #0f766e;
    border-color: #14b8a6;
  }

  .pill-adverb:hover {
    background: #99f6e4;
  }

  /* Phrase - Yellow */
  .pill-phrase {
    background: linear-gradient(135deg, #fef9c3, #fef08a);
    color: #78350f;
    border-color: #facc15;
  }

  .pill-phrase:hover {
    background: #fef08a;
  }

  /* Default - Gray */
  .pill-default {
    background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
    color: #374151;
    border-color: #9ca3af;
  }

  .pill-default:hover {
    background: #e5e7eb;
  }

  /* Dark Mode */
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

  :global([data-theme="dark"]) .pill-default {
    background: linear-gradient(135deg, rgba(156, 163, 175, 0.2), rgba(156, 163, 175, 0.1));
    color: #d1d5db;
    border-color: #6b7280;
  }
</style>
