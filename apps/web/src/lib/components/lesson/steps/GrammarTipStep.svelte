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

  $: isVocabList = hasVocabPairs(step.content);
</script>

<div class="grammar-card" dir="rtl">
  <div class="icon-header">
    <span class="bulb-icon">💡</span>
    <h2 class="step-title"><BiDiText text={step.title || 'نکته گرامری'} /></h2>
  </div>

  {#if isVocabList}
    <VocabPillList text={step.content} variant="warning" />
  {:else}
    <p class="grammar-text"><BiDiText text={step.content} /></p>
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
    line-height: 1.6;
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
