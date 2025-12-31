<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import StepRenderer from "$lib/components/lesson/StepRenderer.svelte";
  import LessonReview from "$lib/components/lesson/LessonReview.svelte";
  import { lessonStore, currentStep } from "../../../lessonStore";
  import {
    saveWrongAnswer,
    getUnreviewedWrongAnswers,
    markWrongAnswersReviewed,
    completeLessonWithStats
  } from "$lib/services/progressService";
  import type { WrongAnswer } from "$lib/db";

  export let data;

  // Helper to extract question text from various step types
  function getQuestionText(step: any): string {
    // Different step types use different field names
    if (step.question) return step.question;
    if (step.statement) return step.statement; // true-false
    if (step.sourceText) return step.sourceText; // translation
    if (step.sentence) return step.sentence; // fill-in-blank
    // formality-choice: use scenario for context in review
    if (step.type === 'formality-choice' && step.scenario) return step.scenario;
    if (step.instruction) return step.instruction; // word-order, fill-in-blank
    if (step.word?.de) return step.word.de; // new-word
    if (step.title) return step.title; // dialog, grammar-tip
    return `Step ${step.id || 'unknown'}`;
  }

  let showReviewScreen = false;
  let wrongAnswersToReview: WrongAnswer[] = [];
  let completionStats: { score: number; xpEarned: number } | null = null;

  // Initialize store when data changes (or on mount)
  onMount(() => {
    if (data.lesson) {
      lessonStore.init(data.lesson);
    }
  });

  // Check for end-of-lesson review when lesson is complete
  $: if ($lessonStore.isComplete && !showReviewScreen && !completionStats) {
    handleLessonEnd();
  }

  function handleContinue() {
    lessonStore.nextStep();
  }

  async function handleAnswer(event: CustomEvent) {
    const { correct, userAnswer, correctAnswer, allowContinue } = event.detail;

    if (correct) {
      console.log("✅ Correct Answer!");
      lessonStore.enableContinue();
    } else {
      console.log("❌ Wrong Answer - Must retry");

      // Track wrong answer for end-of-lesson review
      await saveWrongAnswer({
        lessonId: data.lesson.id,
        stepId: $currentStep.id,
        stepType: $currentStep.type,
        question: getQuestionText($currentStep),
        userAnswer: userAnswer || 'unknown',
        correctAnswer: correctAnswer || 'unknown'
      });

      // Don't enable continue - user must retry
      if (allowContinue === false) {
        lessonStore.disableContinue();
      }
    }
  }

  async function handleLessonEnd() {
    // Check for wrong answers that need review
    wrongAnswersToReview = await getUnreviewedWrongAnswers(data.lesson.id);

    if (wrongAnswersToReview.length > 0) {
      // Show review screen
      showReviewScreen = true;
    } else {
      // No wrong answers - complete immediately
      await finishLesson();
    }
  }

  async function handleReviewComplete(event: CustomEvent) {
    const { reviewedIds } = event.detail;

    // Mark wrong answers as reviewed
    await markWrongAnswersReviewed(reviewedIds);

    // Complete the lesson
    await finishLesson();
  }

  async function finishLesson() {
    // Award XP, update streak, mark lesson as complete
    completionStats = await completeLessonWithStats(
      data.lesson.id,
      data.lesson.steps.length
    );
  }

  function backToDashboard() {
    // Force full page reload to ensure liveQuery picks up database changes
    window.location.href = '/';
  }
</script>

<div class="lesson-layout">
  <header class="lesson-header">
    <div class="progress-bar">
      <div 
        class="progress-fill" 
        style="width: {($lessonStore.currentIndex / (data.lesson.steps.length || 1)) * 100}%"
      ></div>
    </div>
  </header>

  <main class="lesson-content">
    {#if completionStats}
      <!-- Final completion screen with stats -->
      <div class="completion-screen">
        <h2>🎉 درس تمام شد!</h2>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-icon">📊</span>
            <span class="stat-value">{completionStats.score}%</span>
            <span class="stat-label">امتیاز</span>
          </div>
          <div class="stat-item">
            <span class="stat-icon">⭐</span>
            <span class="stat-value">+{completionStats.xpEarned}</span>
            <span class="stat-label">امتیاز کسب شده</span>
          </div>
        </div>
        <button class="finish-btn" on:click={backToDashboard}>بازگشت به صفحه اصلی</button>
      </div>
    {:else if showReviewScreen}
      <!-- Review screen for wrong answers -->
      <LessonReview
        wrongAnswers={wrongAnswersToReview}
        on:complete={handleReviewComplete}
      />
    {:else if $currentStep}
      <!-- Regular lesson steps -->
      {#key $currentStep.id}
        <div class="step-animation">
          <StepRenderer step={$currentStep} lessonId={data.lesson.id} on:answer={handleAnswer} />
        </div>
      {/key}
    {/if}
  </main>

  {#if !$lessonStore.isComplete && !showReviewScreen}
    <footer class="lesson-footer">
      <button
        class="continue-btn"
        disabled={!$lessonStore.canContinue}
        on:click={handleContinue}
      >
        ادامه
      </button>
    </footer>
  {/if}
</div>

<style>
  .lesson-layout {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 64px); 
    max-width: 600px;
    margin: 0 auto;
    background: #fff;
  }

  .lesson-header {
    padding: 1rem;
  }

  .progress-bar {
    height: 8px;
    background: #e2e8f0;
    border-radius: 999px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: #3b82f6;
    transition: width 0.3s ease;
  }

  .lesson-content {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .lesson-footer {
    padding: 1rem;
    border-top: 1px solid #f1f5f9;
  }

  .continue-btn {
    width: 100%;
    padding: 0.8rem;
    border-radius: 0.75rem;
    background: #22c55e;
    color: white;
    font-weight: 700;
    font-size: 1rem;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
  }

  .continue-btn:disabled {
    background: #cbd5e1;
    color: #94a3b8;
    cursor: not-allowed;
  }

  .continue-btn:not(:disabled):hover {
    background: #16a34a;
  }

  .completion-screen {
    text-align: center;
    padding: 2rem;
  }

  .completion-screen h2 {
    font-size: 2rem;
    margin-bottom: 2rem;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    max-width: 400px;
    margin: 0 auto 2rem;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1.5rem;
    background: #f8fafc;
    border: 2px solid #e2e8f0;
    border-radius: 1rem;
  }

  .stat-icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  .stat-value {
    font-size: 1.8rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 0.25rem;
  }

  .stat-label {
    font-size: 0.9rem;
    color: #64748b;
  }

  .finish-btn {
    display: inline-block;
    margin-top: 1rem;
    padding: 1rem 2rem;
    background: #3b82f6;
    color: white;
    text-decoration: none;
    border: none;
    border-radius: 999px;
    font-weight: 700;
    font-size: 1.1rem;
    cursor: pointer;
    transition: background 0.2s;
  }

  .finish-btn:hover {
    background: #2563eb;
  }
</style>
