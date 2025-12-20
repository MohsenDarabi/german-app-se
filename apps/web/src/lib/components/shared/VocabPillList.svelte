<script lang="ts">
  /**
   * Smart component that parses text containing German-Persian pairs
   * Formats:
   * - "vier (۴)، fünf (۵)"
   * - "vier (چهار)، fünf (پنج)"
   * And renders them as VocabPill components
   */
  import VocabPill from './VocabPill.svelte';

  export let text: string = '';
  export let size: 'small' | 'medium' | 'large' = 'medium';
  export let variant: 'default' | 'primary' | 'success' | 'warning' = 'default';

  interface VocabItem {
    german: string;
    persian: string;
    number: string;
  }

  // Parse the text into structured vocab items
  function parseVocabText(text: string): { prefix: string; items: VocabItem[] } {
    // Extract prefix (e.g., "اعداد ۴ تا ۱۰:")
    const colonIndex = text.indexOf(':');
    const prefix = colonIndex !== -1 ? text.substring(0, colonIndex + 1).trim() : '';
    const content = colonIndex !== -1 ? text.substring(colonIndex + 1).trim() : text;

    // Split by Arabic comma (،) or regular comma (,)
    const parts = content.split(/[،,]/);

    const items: VocabItem[] = parts
      .map(part => {
        part = part.trim();
        if (!part) return null;

        // Match pattern: "word (translation)" or "word(translation)"
        // Examples: "vier (۴)", "vier (چهار)", "vier(۴)"
        const match = part.match(/^([a-zA-ZäöüßÄÖÜẞ]+)\s*\(([^)]+)\)/);

        if (match) {
          const german = match[1].trim();
          const persianOrNumber = match[2].trim();

          // Check if it's a Persian number (contains Persian digits)
          const isPersianNumber = /[۰-۹]/.test(persianOrNumber);

          return {
            german,
            persian: isPersianNumber ? '' : persianOrNumber,
            number: isPersianNumber ? persianOrNumber : ''
          };
        }

        return null;
      })
      .filter((item): item is VocabItem => item !== null);

    return { prefix, items };
  }

  $: parsed = parseVocabText(text);
  $: hasItems = parsed.items.length > 0;
</script>

{#if hasItems}
  <div class="vocab-pill-list">
    {#if parsed.prefix}
      <div class="prefix" dir="rtl">{parsed.prefix}</div>
    {/if}

    <div class="pills-grid">
      {#each parsed.items as item}
        <VocabPill
          german={item.german}
          persian={item.persian}
          number={item.number}
          {size}
          {variant}
        />
      {/each}
    </div>
  </div>
{:else}
  <!-- Fallback: display as regular text if parsing fails -->
  <p class="fallback-text" dir="rtl">{text}</p>
{/if}

<style>
  .vocab-pill-list {
    width: 100%;
  }

  .prefix {
    font-size: 0.95rem;
    font-weight: 600;
    color: #475569;
    margin-bottom: 0.75rem;
    font-family: 'Vazirmatn', sans-serif;
  }

  .pills-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    align-items: stretch;
  }

  .fallback-text {
    font-size: 1rem;
    line-height: 1.6;
    color: #334155;
  }

  /* Responsive */
  @media (max-width: 640px) {
    .pills-grid {
      gap: 0.5rem;
    }

    .prefix {
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
    }
  }
</style>
