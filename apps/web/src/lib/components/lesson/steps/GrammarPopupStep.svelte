<script lang="ts">
  import type { GrammarPopupStep } from "@pkg/content-model";
  import BiDiText from "$lib/components/ui/BiDiText.svelte";
  import AudioButton from "$lib/components/ui/AudioButton.svelte";

  export let step: GrammarPopupStep;
  export let lessonId: string = '';

  // Highlight specific words in text
  function highlightText(text: string, highlights: string[] = []): string {
    if (!highlights || highlights.length === 0) return escapeHtml(text);

    let result = escapeHtml(text);
    for (const word of highlights) {
      const escapedWord = escapeHtml(word);
      const regex = new RegExp(`(${escapedWord})`, 'gi');
      result = result.replace(regex, '<mark>$1</mark>');
    }
    return result;
  }

  function escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  $: highlightedExplanation = highlightText(step.explanation, step.highlights);
</script>

<div class="grammar-popup-card" dir="rtl">
  <div class="popup-header">
    <span class="bulb-icon">💡</span>
    <h2 class="popup-title"><BiDiText text={step.title || 'نکته!'} /></h2>
  </div>

  <div class="explanation-text">
    <!-- eslint-disable-next-line svelte/no-at-html-tags -- Content from trusted lesson JSON -->
    {@html highlightedExplanation}
  </div>

  {#if step.examples && step.examples.length > 0}
    <div class="examples-section">
      <h3 class="examples-label">مثال‌ها:</h3>
      {#each step.examples as example, idx (idx)}
        <div class="example-card">
          <div class="example-german">
            <AudioButton
              text={example.de}
              {lessonId}
              audioId="{step.id}-example{idx}"
              size="sm"
            />
            <!-- eslint-disable-next-line svelte/no-at-html-tags -- Content from trusted lesson JSON -->
          <span class="german-text" dir="ltr">{@html highlightText(example.de, example.highlights || step.highlights)}</span>
          </div>
          <div class="example-persian">
            <BiDiText text={example.fa} />
          </div>
        </div>
      {/each}
    </div>
  {/if}

  {#if step.grammarConcept}
    <div class="concept-badge">
      <span class="badge-icon">📚</span>
      <span class="badge-text">{step.grammarConcept}</span>
    </div>
  {/if}
</div>

<style>
  .grammar-popup-card {
    background: linear-gradient(135deg, #fef9c3 0%, #fef08a 100%);
    border-radius: var(--radius-xl, 1rem);
    padding: var(--space-6, 1.5rem);
    box-shadow: 0 4px 12px rgba(250, 204, 21, 0.2);
    border: 2px solid #facc15;
  }

  .popup-header {
    display: flex;
    align-items: center;
    gap: var(--space-3, 0.75rem);
    margin-bottom: var(--space-4, 1rem);
  }

  .bulb-icon {
    font-size: 2rem;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  }

  .popup-title {
    font-size: var(--text-xl, 1.25rem);
    font-weight: var(--font-bold, 700);
    color: #92400e;
    margin: 0;
  }

  .explanation-text {
    font-size: var(--text-lg, 1.125rem);
    line-height: 1.8;
    color: #78350f;
    margin-bottom: var(--space-4, 1rem);
  }

  .explanation-text :global(mark) {
    background: #fde047;
    padding: 0.1em 0.3em;
    border-radius: 0.25rem;
    font-weight: var(--font-semibold, 600);
    color: #78350f;
  }

  .examples-section {
    background: rgba(255, 255, 255, 0.7);
    border-radius: var(--radius-lg, 0.75rem);
    padding: var(--space-4, 1rem);
    margin-top: var(--space-4, 1rem);
  }

  .examples-label {
    font-size: var(--text-sm, 0.875rem);
    font-weight: var(--font-bold, 700);
    color: #92400e;
    margin-bottom: var(--space-3, 0.75rem);
  }

  .example-card {
    background: white;
    border-radius: var(--radius-md, 0.5rem);
    padding: var(--space-3, 0.75rem);
    margin-bottom: var(--space-2, 0.5rem);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    transition: transform var(--transition-normal, 200ms);
  }

  .example-card:hover {
    transform: translateX(-4px);
  }

  .example-card:last-child {
    margin-bottom: 0;
  }

  .example-german {
    display: flex;
    align-items: center;
    gap: var(--space-2, 0.5rem);
    margin-bottom: var(--space-2, 0.5rem);
  }

  .german-text {
    font-size: var(--text-lg, 1.125rem);
    font-weight: var(--font-semibold, 600);
    color: #0e7490;
  }

  .german-text :global(mark) {
    background: #fde047;
    padding: 0.1em 0.2em;
    border-radius: 0.2rem;
    color: #78350f;
  }

  .example-persian {
    font-size: var(--text-base, 1rem);
    color: #57534e;
    padding-right: var(--space-8, 2rem);
  }

  .concept-badge {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2, 0.5rem);
    background: #fef08a;
    border-radius: var(--radius-full, 9999px);
    padding: var(--space-2, 0.5rem) var(--space-4, 1rem);
    margin-top: var(--space-4, 1rem);
    font-size: var(--text-sm, 0.875rem);
    color: #78350f;
  }

  .badge-icon {
    font-size: 1rem;
  }

  .badge-text {
    font-weight: var(--font-medium, 500);
  }

  /* Dark Mode */
  :global([data-theme="dark"]) .grammar-popup-card {
    background: linear-gradient(135deg, #422006 0%, #713f12 100%);
    border-color: #854d0e;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  :global([data-theme="dark"]) .popup-title {
    color: #fde047;
  }

  :global([data-theme="dark"]) .explanation-text {
    color: #fef08a;
  }

  :global([data-theme="dark"]) .explanation-text :global(mark) {
    background: #854d0e;
    color: #fef08a;
  }

  :global([data-theme="dark"]) .examples-section {
    background: rgba(0, 0, 0, 0.3);
  }

  :global([data-theme="dark"]) .examples-label {
    color: #fde047;
  }

  :global([data-theme="dark"]) .example-card {
    background: #292524;
  }

  :global([data-theme="dark"]) .german-text {
    color: #22d3ee;
  }

  :global([data-theme="dark"]) .german-text :global(mark) {
    background: #854d0e;
    color: #fef08a;
  }

  :global([data-theme="dark"]) .example-persian {
    color: #a69b8a;
  }

  :global([data-theme="dark"]) .concept-badge {
    background: #854d0e;
    color: #fef08a;
  }
</style>
