<script lang="ts">
  import type { VocabularyItem } from "@pkg/content-model";
  import WordPill from "./WordPill.svelte";
  import NounCard from "./NounCard.svelte";
  import VerbCard from "./VerbCard.svelte";
  import { selectedWord } from "./assistantStore";

  export let vocabulary: VocabularyItem[];

  // Find the selected item
  $: selectedItem = vocabulary.find(v => v.de === $selectedWord);

  // Group vocabulary by type
  $: nouns = vocabulary.filter(v => v.grammar?.noun);
  $: verbs = vocabulary.filter(v => v.grammar?.verb);
  $: others = vocabulary.filter(v => !v.grammar?.noun && !v.grammar?.verb);

  function clearSelection() {
    selectedWord.set(null);
  }
</script>

<div class="content-overview" dir="rtl">
  {#if selectedItem}
    <!-- Word Detail View -->
    <div class="word-detail">
      <button class="back-btn" on:click={clearSelection}>
        → برگشت به لیست
      </button>

      {#if selectedItem.grammar?.noun}
        <NounCard
          word={selectedItem.de}
          translation={selectedItem.fa}
          grammar={selectedItem.grammar.noun}
        />
      {:else if selectedItem.grammar?.verb}
        <VerbCard
          word={selectedItem.de}
          translation={selectedItem.fa}
          grammar={selectedItem.grammar.verb}
        />
      {:else}
        <!-- Generic word card -->
        <div class="generic-card">
          <h3 class="word">{selectedItem.de}</h3>
          <p class="translation">{selectedItem.fa}</p>
          {#if selectedItem.grammar?.pos}
            <span class="pos-badge">{selectedItem.grammar.pos}</span>
          {/if}
        </div>
      {/if}
    </div>
  {:else}
    <!-- Vocabulary List View -->
    <div class="vocabulary-list">
      <h3 class="section-title">📚 واژگان این درس</h3>
      <p class="hint">روی کلمات کلیک کنید تا جزئیات گرامری را ببینید.</p>

      {#if nouns.length > 0}
        <div class="category">
          <h4 class="category-title">اسم‌ها (Substantive)</h4>
          <div class="pills-container">
            {#each nouns as item (item.de)}
              <WordPill {item} />
            {/each}
          </div>
        </div>
      {/if}

      {#if verbs.length > 0}
        <div class="category">
          <h4 class="category-title">فعل‌ها (Verben)</h4>
          <div class="pills-container">
            {#each verbs as item (item.de)}
              <WordPill {item} />
            {/each}
          </div>
        </div>
      {/if}

      {#if others.length > 0}
        <div class="category">
          <h4 class="category-title">سایر واژگان</h4>
          <div class="pills-container">
            {#each others as item (item.de)}
              <WordPill {item} />
            {/each}
          </div>
        </div>
      {/if}

      {#if vocabulary.length === 0}
        <div class="empty-state">
          <p>هیچ واژه‌ای برای این درس تعریف نشده است.</p>
        </div>
      {/if}

      <!-- Legend -->
      <div class="legend">
        <h4 class="legend-title">راهنمای رنگ‌ها:</h4>
        <div class="legend-items">
          <span class="legend-item"><span class="dot masculine"></span> der (مذکر)</span>
          <span class="legend-item"><span class="dot feminine"></span> die (مونث)</span>
          <span class="legend-item"><span class="dot neuter"></span> das (خنثی)</span>
          <span class="legend-item"><span class="dot verb"></span> فعل</span>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .content-overview {
    padding: 1rem;
    height: 100%;
    overflow-y: auto;
  }

  .word-detail {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .back-btn {
    padding: 0.5rem 1rem;
    background: transparent;
    border: 1px solid var(--color-neutral-300, #d4c9b9);
    border-radius: 0.5rem;
    font-size: 0.875rem;
    color: var(--color-neutral-600, #57534e);
    cursor: pointer;
    align-self: flex-start;
    transition: all 0.2s;
  }

  .back-btn:hover {
    background: var(--color-neutral-100, #f5f0e8);
  }

  .vocabulary-list {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .section-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-neutral-800, #292524);
    margin: 0;
  }

  .hint {
    font-size: 0.875rem;
    color: var(--color-neutral-500, #78716c);
    margin: 0;
  }

  .category {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .category-title {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--color-neutral-600, #57534e);
    margin: 0;
  }

  .pills-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .generic-card {
    background: var(--color-neutral-100, #f5f0e8);
    border-radius: 1rem;
    padding: 1.5rem;
    text-align: center;
  }

  .generic-card .word {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-primary-600, #0891b2);
    margin: 0 0 0.5rem 0;
  }

  .generic-card .translation {
    font-size: 1rem;
    color: var(--color-neutral-600, #57534e);
    margin: 0 0 0.75rem 0;
  }

  .generic-card .pos-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    background: var(--color-neutral-200, #e8e0d5);
    border-radius: 9999px;
    font-size: 0.75rem;
    color: var(--color-neutral-600, #57534e);
  }

  .empty-state {
    text-align: center;
    padding: 2rem;
    color: var(--color-neutral-500, #78716c);
  }

  .legend {
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px dashed var(--color-neutral-300, #d4c9b9);
  }

  .legend-title {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--color-neutral-500, #78716c);
    margin: 0 0 0.5rem 0;
  }

  .legend-items {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.75rem;
    color: var(--color-neutral-600, #57534e);
  }

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  .dot.masculine { background: #3b82f6; }
  .dot.feminine { background: #ec4899; }
  .dot.neuter { background: #10b981; }
  .dot.verb { background: #8b5cf6; }

  /* Dark Mode */
  :global([data-theme="dark"]) .section-title { color: #f5f0e8; }
  :global([data-theme="dark"]) .hint { color: #a69b8a; }
  :global([data-theme="dark"]) .category-title { color: #d4c9b9; }
  :global([data-theme="dark"]) .back-btn {
    border-color: #57534e;
    color: #a69b8a;
  }
  :global([data-theme="dark"]) .back-btn:hover {
    background: #44403c;
  }
  :global([data-theme="dark"]) .generic-card {
    background: #44403c;
  }
  :global([data-theme="dark"]) .generic-card .word { color: #22d3ee; }
  :global([data-theme="dark"]) .generic-card .translation { color: #a69b8a; }
  :global([data-theme="dark"]) .legend { border-color: #57534e; }
  :global([data-theme="dark"]) .legend-title { color: #a69b8a; }
  :global([data-theme="dark"]) .legend-item { color: #d4c9b9; }
</style>
