<script lang="ts">
  import type { VocabularyItem } from "@pkg/content-model";
  import WordPill from "./WordPill.svelte";

  export let vocabulary: VocabularyItem[];

  // Group vocabulary by type
  $: nouns = vocabulary.filter(v => v.grammar?.noun);
  $: verbs = vocabulary.filter(v => v.grammar?.verb);
  $: others = vocabulary.filter(v => !v.grammar?.noun && !v.grammar?.verb);
</script>

<div class="content-overview" dir="rtl">
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
</div>

<style>
  .content-overview {
    padding: 1rem;
    height: 100%;
    overflow-y: auto;
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
  :global([data-theme="dark"]) .legend { border-color: #57534e; }
  :global([data-theme="dark"]) .legend-title { color: #a69b8a; }
  :global([data-theme="dark"]) .legend-item { color: #d4c9b9; }
</style>
