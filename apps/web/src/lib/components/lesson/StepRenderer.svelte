<script lang="ts">
  import type { LessonStep } from "@pkg/content-model";
  import DialogStep from "./steps/DialogStep.svelte";
  import GrammarTipStep from "./steps/GrammarTipStep.svelte";
  import GrammarPopupStep from "./steps/GrammarPopupStep.svelte";
  import WordQuizStep from "./steps/WordQuizStep.svelte";
  import NewWordStep from "./steps/NewWordStep.svelte";
  import FillInBlankStep from "./steps/FillInBlankStep.svelte";
  import WordOrderStep from "./steps/WordOrderStep.svelte";
  import MatchingStep from "./steps/MatchingStep.svelte";
  import TranslationStep from "./steps/TranslationStep.svelte";
  import TrueFalseStep from "./steps/TrueFalseStep.svelte";
  import SpeedChallengeStep from "./steps/SpeedChallengeStep.svelte";
  import CompletionStep from "./steps/CompletionStep.svelte";
  import ListenAndChooseStep from "./steps/ListenAndChooseStep.svelte";
  import FormalityChoiceStep from "./steps/FormalityChoiceStep.svelte";
  import MemoryMatchStep from "./steps/MemoryMatchStep.svelte";
  import WordHuntStep from "./steps/WordHuntStep.svelte";
  import RapidFireStep from "./steps/RapidFireStep.svelte";
  // ChatSimulatorStep disabled - will be replaced by AI chatbot
  // import ChatSimulatorStep from "./steps/ChatSimulatorStep.svelte";
  import VocabCheckStep from "./steps/VocabCheckStep.svelte";
  import SpellingStep from "./steps/SpellingStep.svelte";
  import ComprehensionStep from "./steps/ComprehensionStep.svelte";
  import DictationStep from "./steps/DictationStep.svelte";
  import StoryStep from "./steps/StoryStep.svelte";

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
  {:else if step.type === "grammar-popup"}
    <GrammarPopupStep {step} {lessonId} />
  {:else if step.type === "dialog"}
    <DialogStep {step} {lessonId} on:answer />
  {:else if step.type === "fill-in-blank"}
    <FillInBlankStep {step} {lessonId} on:answer />
  {:else if step.type === "word-order"}
    <WordOrderStep {step} {lessonId} on:answer />
  {:else if step.type === "matching"}
    <MatchingStep {step} {lessonId} on:answer />
  {:else if step.type === "translation"}
    <TranslationStep {step} {lessonId} on:answer />
  {:else if step.type === "true-false"}
    <TrueFalseStep {step} {lessonId} on:answer />
  {:else if step.type === "speed-challenge"}
    <SpeedChallengeStep {step} {lessonId} on:answer />
  {:else if step.type === "completion"}
    <CompletionStep {step} {lessonId} on:answer />
  {:else if step.type === "listen-and-choose"}
    <ListenAndChooseStep {step} {lessonId} on:answer />
  {:else if step.type === "formality-choice"}
    <FormalityChoiceStep {step} {lessonId} on:answer />
  {:else if step.type === "memory-match"}
    <MemoryMatchStep {step} {lessonId} on:answer />
  {:else if step.type === "word-hunt"}
    <WordHuntStep {step} {lessonId} on:answer />
  {:else if step.type === "rapid-fire"}
    <RapidFireStep {step} {lessonId} on:answer />
  {:else if step.type === "chat-simulator"}
    <!-- Chat simulator disabled - will be replaced by AI chatbot -->
    <div class="disabled-step" dir="rtl">
      <p>این قابلیت به زودی با چت‌بات هوشمند جایگزین می‌شود.</p>
    </div>
  {:else if step.type === "vocab-check"}
    <VocabCheckStep {step} {lessonId} on:answer />
  {:else if step.type === "spelling"}
    <SpellingStep {step} {lessonId} on:answer />
  {:else if step.type === "comprehension"}
    <ComprehensionStep {step} {lessonId} on:answer />
  {:else if step.type === "dictation"}
    <DictationStep {step} {lessonId} on:answer />
  {:else if step.type === "story"}
    <StoryStep {step} {lessonId} on:answer />
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
  .disabled-step {
    padding: 2rem;
    background: #f8fafc;
    border: 2px dashed #cbd5e1;
    border-radius: 0.75rem;
    text-align: center;
    color: #64748b;
  }
</style>
