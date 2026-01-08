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
    <!-- svelte-ignore svelte/no-at-html-tags -->
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
    background-color: #fffbeb; /* Amber-50 */
    border: 1px solid #fcd34d; /* Amber-300 */
    border-radius: 1rem;
    padding: 1.5rem;
    color: #92400e; /* Amber-800 */
  }
  .icon-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }
  .bulb-icon {
    font-size: 1.5rem;
  }
  .step-title {
    font-size: 1.1rem;
    font-weight: 700;
  }
  .grammar-text {
    font-size: 1rem;
    line-height: 1.8;
  }

  .grammar-text :global(strong) {
    font-weight: 700;
    color: #78350f;
  }

  .grammar-text :global(p) {
    margin-bottom: 0.75rem;
  }

  .grammar-text :global(.table-row) {
    display: flex;
    flex-direction: row-reverse; /* RTL: first column on right */
    border-bottom: 1px solid #fcd34d;
    padding: 0.5rem 0;
  }

  .grammar-text :global(.table-cell) {
    flex: 1;
    padding: 0.25rem 0.5rem;
    text-align: center;
  }

  .grammar-text :global(.table-cell:first-child) {
    text-align: right; /* Persian numbers on right */
  }

  .grammar-text :global(.table-cell:last-child) {
    text-align: left; /* German words on left */
    direction: ltr;
  }

  .grammar-text :global(.bullet-item) {
    display: block;
    padding-right: 1.25rem;
    position: relative;
    margin-bottom: 0.25rem;
  }

  .grammar-text :global(.bullet-item)::before {
    content: '•';
    position: absolute;
    right: 0;
    color: #d97706;
  }
  .examples-section {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #fcd34d;
  }
  .examples-title {
    font-size: 0.95rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }
  .example-item {
    margin-bottom: 0.75rem;
  }
  .example-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.25rem;
  }
  .example-item.inline-example {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 0.75rem;
    background: rgba(255,255,255,0.5);
    border-radius: 0.5rem;
    margin-bottom: 0.5rem;
  }
  .example-de {
    font-size: 1rem;
    font-weight: 600;
    color: #78350f;
    min-width: 3rem;
  }
  .example-fa {
    font-size: 0.9rem;
    color: #92400e;
    font-style: italic;
    margin: 0;
    padding-right: 2rem;
  }
  .inline-example .example-fa {
    font-style: normal;
    margin-right: auto;
    padding-right: 0;
  }
  .pronunciation-guide {
    margin-top: 0.75rem;
  }
</style>
