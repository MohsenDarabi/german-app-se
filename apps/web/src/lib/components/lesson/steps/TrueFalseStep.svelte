<script lang="ts">
  import type { TrueFalseStep } from "@pkg/content-model";
  import { createEventDispatcher } from "svelte";
  import BiDiText from "$lib/components/ui/BiDiText.svelte";
  import AudioButton from "$lib/components/ui/AudioButton.svelte";

  export let step: TrueFalseStep;
  export let lessonId: string = '';

  const dispatch = createEventDispatcher<{ answer: { correct: boolean; allowContinue: boolean } }>();

  let selectedAnswer: boolean | null = null;
  let isAnswered = false;
  let isCorrect = false;
  let canRetry = false;
  let showHint = false;

  function selectAnswer(answer: boolean) {
    if (isAnswered) return;

    selectedAnswer = answer;
    isAnswered = true;
    isCorrect = answer === step.correctAnswer;

    if (!isCorrect) {
      canRetry = true;
    }

    dispatch('answer', {
      correct: isCorrect,
      allowContinue: isCorrect
    });
  }

  function retry() {
    selectedAnswer = null;
    isAnswered = false;
    isCorrect = false;
    canRetry = false;
  }

  function toggleHint() {
    showHint = !showHint;
  }

  // Check if statement is pure German (no Persian/Arabic characters)
  $: isPureGerman = !/[\u0600-\u06FF]/.test(step.statement);
  // Check if we have a vocab hint available
  $: hasVocabHint = isPureGerman && step.vocabHint && Object.keys(step.vocabHint.words || {}).length > 0;
</script>

<div class="true-false-container">
  {#if step.instruction}
    <p class="instruction" dir="rtl"><BiDiText text={step.instruction} /></p>
  {/if}

  <div class="statement-card">
    <div class="statement-row">
      <p class="statement" dir="rtl"><BiDiText text={step.statement} /></p>
      {#if isPureGerman}
        <AudioButton
          text={step.statement}
          {lessonId}
          audioId="{step.id}-statement"
          size="md"
        />
      {/if}
    </div>
    {#if step.statementExplanation}
      <p class="statement-explanation" dir="rtl"><BiDiText text={step.statementExplanation} /></p>
    {/if}

    {#if hasVocabHint}
      <button class="hint-toggle" on:click={toggleHint} dir="rtl">
        <span class="hint-icon">{showHint ? '🔽' : '💡'}</span>
        <span>{showHint ? 'بستن راهنما' : 'نیاز به کمک؟'}</span>
      </button>

      {#if showHint}
        <div class="hint-content" dir="rtl">
          <p class="hint-intro">این کلمات را قبلاً یاد گرفتید:</p>
          <div class="hint-words">
            {#each Object.entries(step.vocabHint?.words || {}) as [de, fa] (de)}
              <span class="hint-word">
                <span class="de" dir="ltr">{de}</span>
                <span class="sep">=</span>
                <span class="fa">{fa}</span>
              </span>
            {/each}
          </div>
          {#if step.vocabHint?.translation}
            <p class="hint-translation">ترجمه: {step.vocabHint.translation}</p>
          {/if}
        </div>
      {/if}
    {/if}
  </div>

  <div class="options-row">
    <button
      class="option-btn true-btn"
      class:selected={selectedAnswer === true}
      class:correct={isAnswered && step.correctAnswer === true}
      class:wrong={isAnswered && selectedAnswer === true && !isCorrect}
      on:click={() => selectAnswer(true)}
      disabled={isAnswered}
    >
      <span class="icon">✓</span>
      <span class="label">درست</span>
    </button>

    <button
      class="option-btn false-btn"
      class:selected={selectedAnswer === false}
      class:correct={isAnswered && step.correctAnswer === false}
      class:wrong={isAnswered && selectedAnswer === false && !isCorrect}
      on:click={() => selectAnswer(false)}
      disabled={isAnswered}
    >
      <span class="icon">✗</span>
      <span class="label">نادرست</span>
    </button>
  </div>

  {#if isAnswered && isCorrect}
    <div class="success-section">
      <p class="feedback-text success">آفرین! صحیح است</p>
      {#if step.feedback?.explanation}
        <p class="explanation" dir="rtl"><BiDiText text={step.feedback.explanation} /></p>
      {/if}
    </div>
  {/if}

  {#if canRetry}
    <div class="retry-section">
      <p class="feedback-text">پاسخ صحیح نیست!</p>
      <p class="correct-answer">
        پاسخ صحیح: <strong>{step.correctAnswer ? 'درست' : 'نادرست'}</strong>
      </p>
      {#if step.feedback?.explanation}
        <p class="explanation" dir="rtl"><BiDiText text={step.feedback.explanation} /></p>
      {/if}
      <button class="retry-btn" on:click={retry}>تلاش مجدد</button>
    </div>
  {/if}
</div>

<style>
  .true-false-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .instruction {
    font-size: 1.1rem;
    color: #64748b;
    text-align: center;
    margin: 0;
  }

  .statement-card {
    padding: 1.5rem;
    background: #f8fafc;
    border: 2px solid #e2e8f0;
    border-radius: 1rem;
    text-align: center;
  }

  .statement-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
  }

  .statement {
    font-size: 1.4rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
    line-height: 1.4;
  }

  .statement-explanation {
    font-size: 1rem;
    color: #64748b;
    margin: 0.75rem 0 0;
    font-style: italic;
  }

  .hint-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    background: transparent;
    border: 1px dashed #94a3b8;
    border-radius: 0.5rem;
    color: #64748b;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .hint-toggle:hover {
    border-color: #3b82f6;
    color: #3b82f6;
    background: #eff6ff;
  }

  .hint-icon {
    font-size: 1rem;
  }

  .hint-content {
    margin-top: 0.75rem;
    padding: 1rem;
    background: #f0f9ff;
    border: 1px solid #bae6fd;
    border-radius: 0.5rem;
  }

  .hint-intro {
    font-size: 0.85rem;
    color: #0369a1;
    margin: 0 0 0.75rem;
    font-weight: 500;
  }

  .hint-words {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
  }

  .hint-word {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.5rem;
    background: white;
    border-radius: 0.25rem;
    font-size: 0.9rem;
  }

  .hint-word .de {
    font-weight: 600;
    color: #0369a1;
  }

  .hint-word .sep {
    color: #94a3b8;
  }

  .hint-word .fa {
    color: #475569;
  }

  .hint-translation {
    margin: 0.75rem 0 0;
    padding-top: 0.75rem;
    border-top: 1px dashed #bae6fd;
    font-size: 0.9rem;
    color: #475569;
    text-align: center;
  }

  .options-row {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }

  .option-btn {
    flex: 1;
    max-width: 150px;
    padding: 1.25rem 1rem;
    border: 3px solid #e2e8f0;
    border-radius: 1rem;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .option-btn .icon {
    font-size: 2rem;
    font-weight: bold;
  }

  .option-btn .label {
    font-size: 1.1rem;
    font-weight: 600;
  }

  .true-btn {
    color: #16a34a;
  }

  .true-btn:hover:not(:disabled) {
    border-color: #22c55e;
    background: #f0fdf4;
  }

  .false-btn {
    color: #dc2626;
  }

  .false-btn:hover:not(:disabled) {
    border-color: #ef4444;
    background: #fef2f2;
  }

  .option-btn.correct {
    border-color: #22c55e;
    background: #dcfce7;
  }

  .option-btn.wrong {
    border-color: #ef4444;
    background: #fee2e2;
  }

  .option-btn:disabled {
    cursor: default;
  }

  .success-section {
    padding: 1.5rem;
    background: #f0fdf4;
    border: 2px solid #86efac;
    border-radius: 0.75rem;
    text-align: center;
  }

  .retry-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 1.5rem;
    background: #fef2f2;
    border: 2px solid #fecaca;
    border-radius: 0.75rem;
  }

  .feedback-text {
    font-weight: 600;
    text-align: center;
    margin: 0;
    font-size: 1.1rem;
  }

  .feedback-text.success {
    color: #15803d;
  }

  .retry-section .feedback-text {
    color: #b91c1c;
  }

  .correct-answer {
    color: #1e293b;
    margin: 0;
  }

  .explanation {
    color: #64748b;
    font-size: 0.95rem;
    text-align: center;
    margin: 0;
    line-height: 1.5;
  }

  .retry-btn {
    padding: 0.75rem 2rem;
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 999px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    margin-top: 0.5rem;
  }

  .retry-btn:hover {
    background: #dc2626;
  }
</style>
