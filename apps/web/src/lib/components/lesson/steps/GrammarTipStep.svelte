<script lang="ts">
  import type { GrammarTipStep } from "$lib/content-model";
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
      {#each step.examples as example, idx}
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
    background: linear-gradient(135deg, var(--color-success-50, #fefce8), rgba(234, 179, 8, 0.1));
    border: 2px solid var(--color-success-400, #facc15);
    border-radius: var(--radius-xl, 1rem);
    padding: var(--space-6, 1.5rem);
    color: var(--color-success-800, #854d0e);
  }

  .icon-header {
    display: flex;
    align-items: center;
    gap: var(--space-2, 0.5rem);
    margin-bottom: var(--space-3, 0.75rem);
  }

  .bulb-icon {
    font-size: 1.75rem;
    animation: glow 2s ease-in-out infinite;
  }

  @keyframes glow {
    0%, 100% { filter: brightness(1); }
    50% { filter: brightness(1.2); }
  }

  .step-title {
    font-size: var(--text-lg, 1.125rem);
    font-weight: var(--font-bold, 700);
    background: linear-gradient(135deg, var(--color-success-700, #a16207), var(--color-success-600, #ca8a04));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .grammar-text {
    font-size: var(--text-base, 1rem);
    line-height: 1.8;
  }

  .grammar-text :global(strong) {
    font-weight: var(--font-bold, 700);
    color: var(--color-success-900, #713f12);
  }

  .grammar-text :global(p) {
    margin-bottom: var(--space-3, 0.75rem);
  }

  .grammar-text :global(.table-row) {
    display: flex;
    flex-direction: row-reverse;
    border-bottom: 1px solid var(--color-success-300, #fde047);
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
    color: var(--color-success-500, #eab308);
  }

  .examples-section {
    margin-top: var(--space-4, 1rem);
    padding-top: var(--space-4, 1rem);
    border-top: 1px solid var(--color-success-300, #fde047);
  }

  .examples-title {
    font-size: var(--text-sm, 0.875rem);
    font-weight: var(--font-bold, 700);
    margin-bottom: var(--space-2, 0.5rem);
    color: var(--color-success-700, #a16207);
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
    padding: var(--space-2, 0.5rem) var(--space-3, 0.75rem);
    background: rgba(255, 255, 255, 0.6);
    border-radius: var(--radius-md, 0.5rem);
    margin-bottom: var(--space-2, 0.5rem);
    transition: all var(--transition-normal, 200ms);
  }

  .example-item.inline-example:hover {
    background: rgba(255, 255, 255, 0.8);
    transform: translateX(-4px);
  }

  .example-de {
    font-size: var(--text-base, 1rem);
    font-weight: var(--font-semibold, 600);
    color: var(--color-success-900, #713f12);
    min-width: 3rem;
  }

  .example-fa {
    font-size: var(--text-sm, 0.875rem);
    color: var(--color-success-700, #a16207);
    font-style: italic;
    margin: 0;
    padding-right: var(--space-8, 2rem);
  }

  .inline-example .example-fa {
    font-style: normal;
    margin-right: auto;
    padding-right: 0;
  }

  .pronunciation-guide {
    margin-top: var(--space-3, 0.75rem);
  }

  /* Dark Mode */
  :global([data-theme="dark"]) .grammar-card {
    background: linear-gradient(135deg, rgba(234, 179, 8, 0.15), rgba(234, 179, 8, 0.05));
    border-color: var(--color-success-500, #eab308);
    color: var(--color-success-200, #fef08a);
  }

  :global([data-theme="dark"]) .step-title {
    background: linear-gradient(135deg, var(--color-success-400, #facc15), var(--color-success-300, #fde047));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  :global([data-theme="dark"]) .grammar-text :global(strong) {
    color: var(--color-success-300, #fde047);
  }

  :global([data-theme="dark"]) .example-item.inline-example {
    background: rgba(0, 0, 0, 0.2);
  }

  :global([data-theme="dark"]) .example-de {
    color: var(--color-success-300, #fde047);
  }
</style>
