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
      // Remove table separator rows |------|------|
      .replace(/\|[-]+\|[-]+\|/g, '')
      // Tables: | col | col |
      .replace(/\|([^|\n]+)\|([^|\n]+)\|/g, '<span class="table-row"><span class="table-cell">$1</span><span class="table-cell">$2</span></span>')
      // Line breaks
      .replace(/\n\n+/g, '</p><p>')
      .replace(/\n/g, '<br>');
  }

  $: isVocabList = hasVocabPairs(step.content);
  $: parsedContent = parseMarkdown(step.content);
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
    <div class="examples-section">
      <h3 class="examples-title">مثال‌ها:</h3>
      {#each step.examples as example, idx}
        <div class="example-item">
          <div class="example-row">
            <p class="example-de" dir="ltr">{example.de}</p>
            <AudioButton
              text={example.de}
              {lessonId}
              audioId="{step.id}-example{idx}"
              size="sm"
            />
          </div>
          <p class="example-fa"><BiDiText text={example.fa} /></p>
        </div>
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
    border-bottom: 1px solid #fcd34d;
    padding: 0.25rem 0;
  }

  .grammar-text :global(.table-cell) {
    flex: 1;
    padding: 0.25rem 0.5rem;
    unicode-bidi: plaintext; /* Auto-detect text direction for mixed content */
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
    padding-left: 1rem;
  }
  .example-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .example-de {
    font-size: 0.95rem;
    color: #78350f;
    margin-bottom: 0.25rem;
    margin: 0;
  }
  .example-fa {
    font-size: 0.85rem;
    color: #92400e;
    font-style: italic;
  }
</style>
