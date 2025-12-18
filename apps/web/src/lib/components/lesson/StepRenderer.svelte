<script lang="ts">
  import type { LessonStep } from "@pkg/content-model";
  import DialogStep from "./steps/DialogStep.svelte";
  import GrammarTipStep from "./steps/GrammarTipStep.svelte";
  import WordQuizStep from "./steps/WordQuizStep.svelte";
  import NewWordStep from "./steps/NewWordStep.svelte";

  export let step: LessonStep;
</script>

<div class="step-wrapper">
  {#if step.type === "word-quiz" || step.type === "multiple-choice"}
    <WordQuizStep {step} on:answer />
  {:else if step.type === "new-word"}
    <NewWordStep {step} />
  {:else if step.type === "grammar-tip"}
    <GrammarTipStep {step} />
  {:else if step.type === "dialog"}
    <DialogStep {step} />
  {:else}
    <div class="unknown-step">
      <p>Unknown step type: {step.type}</p>
      <pre>{JSON.stringify(step, null, 2)}</pre>
    </div>
  {/if}
</div>

<style>
  .step-wrapper {
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
  }
  .unknown-step {
    padding: 2rem;
    background: #fef2f2;
    border: 2px solid #ef4444;
    border-radius: 0.75rem;
    color: #b91c1c;
  }
  .unknown-step pre {
    margin-top: 1rem;
    padding: 1rem;
    background: white;
    border-radius: 0.5rem;
    overflow: auto;
    font-size: 0.85rem;
  }
</style>