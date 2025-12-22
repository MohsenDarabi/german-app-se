<script lang="ts">
  import type { LessonStep } from "$lib/content-model";
  import DialogStep from "./steps/DialogStep.svelte";
  import GrammarTipStep from "./steps/GrammarTipStep.svelte";
  import WordQuizStep from "./steps/WordQuizStep.svelte";
  import NewWordStep from "./steps/NewWordStep.svelte";
  import FillInBlankStep from "./steps/FillInBlankStep.svelte";
  import WordOrderStep from "./steps/WordOrderStep.svelte";
  import TranslationStep from "./steps/TranslationStep.svelte";
  import TrueFalseStep from "./steps/TrueFalseStep.svelte";

  export let step: LessonStep;
  export let lessonId: string = '';
</script>

<div class="step-wrapper">
  {#if step.type === "word-quiz" || step.type === "multiple-choice"}
    <WordQuizStep {step} {lessonId} on:answer />
  {:else if step.type === "new-word"}
    <NewWordStep {step} {lessonId} />
  {:else if step.type === "grammar-tip"}
    <GrammarTipStep {step} {lessonId} />
  {:else if step.type === "dialog"}
    <DialogStep {step} {lessonId} />
  {:else if step.type === "fill-in-blank"}
    <FillInBlankStep {step} {lessonId} on:answer />
  {:else if step.type === "word-order"}
    <WordOrderStep {step} {lessonId} on:answer />
  {:else if step.type === "translation"}
    <TranslationStep {step} {lessonId} on:answer />
  {:else if step.type === "true-false"}
    <TrueFalseStep {step} {lessonId} on:answer />
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