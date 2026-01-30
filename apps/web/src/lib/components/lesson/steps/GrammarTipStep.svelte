<script lang="ts">
  import type { GrammarTipStep } from "@pkg/content-model";
  import VocabPillList from "$lib/components/shared/VocabPillList.svelte";
  import BiDiText from "$lib/components/ui/BiDiText.svelte";
  import AudioButton from "$lib/components/ui/AudioButton.svelte";

  export let step: GrammarTipStep;
  export let lessonId: string = '';

  // Check if content contains vocab pairs pattern (e.g., "vier (۴)، fünf (۵)")
  function hasVocabPairs(text: string): boolean {
    return /[a-zA-ZäöüßÄÖÜẞ]+\s*\([^)]+\)[،,]/.test(text);
  }

  // Simple markdown parser for grammar tips
  function parseMarkdown(text: string): string {
    return text
      // Escape HTML first
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Bold: **text**
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      // Remove table separator rows (2, 3, 4, or 5 columns)
      .replace(/\|[-\s]+\|[-\s]+\|[-\s]+\|[-\s]+\|[-\s]+\|/g, '')
      .replace(/\|[-\s]+\|[-\s]+\|[-\s]+\|[-\s]+\|/g, '')
      .replace(/\|[-\s]+\|[-\s]+\|[-\s]+\|/g, '')
      .replace(/\|[-\s]+\|[-\s]+\|/g, '')
      // Tables: 5 columns
      .replace(/\|([^|\n]+)\|([^|\n]+)\|([^|\n]+)\|([^|\n]+)\|([^|\n]+)\|/g, '<span class="table-row"><span class="table-cell">$1</span><span class="table-cell">$2</span><span class="table-cell">$3</span><span class="table-cell">$4</span><span class="table-cell">$5</span></span>')
      // Tables: 4 columns
      .replace(/\|([^|\n]+)\|([^|\n]+)\|([^|\n]+)\|([^|\n]+)\|/g, '<span class="table-row"><span class="table-cell">$1</span><span class="table-cell">$2</span><span class="table-cell">$3</span><span class="table-cell">$4</span></span>')
      // Tables: 3 columns
      .replace(/\|([^|\n]+)\|([^|\n]+)\|([^|\n]+)\|/g, '<span class="table-row"><span class="table-cell">$1</span><span class="table-cell">$2</span><span class="table-cell">$3</span></span>')
      // Tables: 2 columns
      .replace(/\|([^|\n]+)\|([^|\n]+)\|/g, '<span class="table-row"><span class="table-cell">$1</span><span class="table-cell">$2</span></span>')
      // Bullet points: • item
      .replace(/^[•]\s*(.+)$/gm, '<span class="bullet-item">$1</span>')
      // Line breaks
      .replace(/\n\n+/g, '</p><p>')
      .replace(/\n/g, '<br>');
  }

  $: isVocabList = hasVocabPairs(step.content);
  $: parsedContent = parseMarkdown(step.content);
  // Pronunciation guide: when content instructs to click AND examples are single words (no spaces)
  $: isPronunciationGuide = step.content.includes('کلیک کنید') &&
    step.examples?.every(ex => !ex.de.includes(' '));
</script>

<div class="grammar-card" dir="rtl">
  <div class="icon-header">
    <span class="bulb-icon">💡</span>
    <h2 class="step-title"><BiDiText text={step.title || 'نکته گرامری'} /></h2>
  </div>

  {#if isVocabList}
    <VocabPillList text={step.content} variant="warning" />
  {:else}
    <div class="grammar-text" dir="rtl">{@html parsedContent}</div>
  {/if}

  {#if step.examples && step.examples.length > 0}
    <div class="examples-section" class:pronunciation-guide={isPronunciationGuide}>
      {#if !isPronunciationGuide}
        <h3 class="examples-title">مثال‌ها:</h3>
      {/if}
      {#each step.examples as example, idx (idx)}
        {#if isPronunciationGuide}
          <div class="example-item inline-example">
            <AudioButton
              text={example.de}
              {lessonId}
              audioId="{step.id}-example{idx}"
              size="sm"
            />
            <span class="example-de" dir="ltr">{example.de}</span>
            <span class="example-fa"><BiDiText text={example.fa} /></span>
          </div>
        {:else}
          <div class="example-item">
            <div class="example-row">
              <AudioButton
                text={example.de}
                {lessonId}
                audioId="{step.id}-example{idx}"
                size="sm"
              />
              <p class="example-de" dir="ltr">{example.de}</p>
            </div>
            <p class="example-fa"><BiDiText text={example.fa} /></p>
          </div>
        {/if}
      {/each}
    </div>
  {/if}
</div>

<style>
  .grammar-card {
    background: var(--color-neutral-50, #fdfbf7);
    border-radius: var(--radius-xl, 1rem);
    padding: var(--space-6, 1.5rem);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  .icon-header {
    display: flex;
    align-items: center;
    gap: var(--space-2, 0.5rem);
    margin-bottom: var(--space-4, 1rem);
  }

  .bulb-icon {
    font-size: 1.5rem;
  }

  .step-title {
    font-size: var(--text-lg, 1.125rem);
    font-weight: var(--font-bold, 700);
    color: var(--color-neutral-800, #292524);
  }

  .grammar-text {
    font-size: var(--text-base, 1rem);
    line-height: 1.8;
    color: var(--color-neutral-700, #44403c);
  }

  .grammar-text :global(strong) {
    font-weight: var(--font-bold, 700);
    color: var(--color-primary-600, #0e7490);
  }

  .grammar-text :global(p) {
    margin-bottom: var(--space-3, 0.75rem);
  }

  .grammar-text :global(.table-row) {
    display: flex;
    flex-direction: row-reverse;
    border-bottom: 1px solid var(--color-neutral-200, #e8e0d5);
    padding: var(--space-2, 0.5rem) 0;
  }

  .grammar-text :global(.table-cell) {
    flex: 1;
    padding: var(--space-1, 0.25rem) var(--space-2, 0.5rem);
    text-align: center;
  }

  .grammar-text :global(.table-cell:first-child) {
    text-align: right;
  }

  .grammar-text :global(.table-cell:last-child) {
    text-align: left;
    direction: ltr;
    color: var(--color-primary-600, #0e7490);
    font-weight: var(--font-medium, 500);
  }

  .grammar-text :global(.bullet-item) {
    display: block;
    padding-right: 1.25rem;
    position: relative;
    margin-bottom: var(--space-1, 0.25rem);
  }

  .grammar-text :global(.bullet-item)::before {
    content: '•';
    position: absolute;
    right: 0;
    color: var(--color-primary-500, #0891b2);
  }

  .examples-section {
    margin-top: var(--space-4, 1rem);
    padding-top: var(--space-4, 1rem);
    border-top: 1px solid var(--color-neutral-200, #e8e0d5);
  }

  .examples-title {
    font-size: var(--text-sm, 0.875rem);
    font-weight: var(--font-bold, 700);
    margin-bottom: var(--space-3, 0.75rem);
    color: var(--color-neutral-500, #78716c);
  }

  .example-item {
    margin-bottom: var(--space-3, 0.75rem);
  }

  .example-row {
    display: flex;
    align-items: center;
    gap: var(--space-2, 0.5rem);
    margin-bottom: var(--space-1, 0.25rem);
  }

  .example-item.inline-example {
    display: flex;
    align-items: center;
    gap: var(--space-3, 0.75rem);
    padding: var(--space-3, 0.75rem);
    background: white;
    border-radius: var(--radius-lg, 0.75rem);
    margin-bottom: var(--space-2, 0.5rem);
    transition: all var(--transition-normal, 200ms);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  .example-item.inline-example:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateX(-4px);
  }

  .example-de {
    font-size: var(--text-lg, 1.125rem);
    font-weight: var(--font-semibold, 600);
    color: var(--color-primary-600, #0e7490);
    min-width: 3rem;
  }

  .example-fa {
    font-size: var(--text-base, 1rem);
    color: var(--color-neutral-600, #57534e);
    margin: 0;
    padding-right: var(--space-8, 2rem);
  }

  .inline-example .example-fa {
    margin-right: auto;
    padding-right: 0;
  }

  .pronunciation-guide {
    margin-top: var(--space-3, 0.75rem);
  }

  /* Dark Mode - use hardcoded colors since CSS variables swap */
  :global([data-theme="dark"]) .grammar-card {
    background: #292524;
  }

  :global([data-theme="dark"]) .step-title {
    color: #f5f0e8;
  }

  :global([data-theme="dark"]) .grammar-text {
    color: #d4c9b9;
  }

  :global([data-theme="dark"]) .grammar-text :global(strong) {
    color: #22d3ee;
  }

  :global([data-theme="dark"]) .grammar-text :global(.table-row) {
    border-color: #44403c;
  }

  :global([data-theme="dark"]) .grammar-text :global(.table-cell:last-child) {
    color: #22d3ee;
  }

  :global([data-theme="dark"]) .grammar-text :global(.bullet-item)::before {
    color: #22d3ee;
  }

  :global([data-theme="dark"]) .examples-section {
    border-color: #44403c;
  }

  :global([data-theme="dark"]) .examples-title {
    color: #a69b8a;
  }

  :global([data-theme="dark"]) .example-item.inline-example {
    background: #44403c;
  }

  :global([data-theme="dark"]) .example-de {
    color: #22d3ee;
  }

  :global([data-theme="dark"]) .example-fa {
    color: #a69b8a;
  }

  :global([data-theme="dark"]) .example-row p.example-de {
    color: #22d3ee;
  }
</style>
