<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";
  import StepRenderer from "$lib/components/lesson/StepRenderer.svelte";
  import LessonReview from "$lib/components/lesson/LessonReview.svelte";
  import ExitConfirmationDialog from "$lib/components/lesson/ExitConfirmationDialog.svelte";
  import LessonSettingsMenu from "$lib/components/lesson/LessonSettingsMenu.svelte";
  import { lessonStore, currentStep } from "../../../lessonStore";
  import {
    saveWrongAnswer,
    getUnreviewedWrongAnswers,
    markWrongAnswersReviewed,
    completeLessonWithStats
  } from "$lib/services/progressService";
  import { stopAudio } from "$lib/utils/audio";
  import * as contentService from "$lib/services/contentService";
  import type { WrongAnswer } from "$lib/db";

  export let data;

  // Smart pre-caching: preload next lesson when near completion
  let preloadTriggered = false;
  $: if (browser && !preloadTriggered && $lessonStore.currentStepIndex >= $lessonStore.lesson?.steps?.length - 2) {
    preloadTriggered = true;
    contentService.preloadNextLesson(data.lessonId);
  }

  // Exit dialog and menu state
  let showExitDialog = false;
  let showSettingsMenu = false;

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

  // Keyboard shortcut handler for Continue button
  function handleKeydown(e: KeyboardEvent) {
    // Enter or Space triggers continue when enabled
    if ((e.key === 'Enter' || e.key === ' ') && $lessonStore.canContinue && !$lessonStore.isComplete && !showReviewScreen) {
      e.preventDefault();
      handleContinue();
    }
  }

  // Initialize store when data changes (or on mount)
  onMount(() => {
    if (data.lesson) {
      lessonStore.init(data.lesson, data.langPair);
    }
    // Add keyboard listener
    window.addEventListener('keydown', handleKeydown);
  });

  onDestroy(() => {
    // Clean up keyboard listener (only in browser)
    if (browser) {
      window.removeEventListener('keydown', handleKeydown);
      // Stop any playing audio when leaving the page
      stopAudio();
    }
  });

  // Check for end-of-lesson review when lesson is complete
  /* eslint-disable svelte/infinite-reactive-loop -- intentional: guards prevent re-triggering */
  $: if ($lessonStore.isComplete && !showReviewScreen && !completionStats) {
    handleLessonEnd();
  }
  /* eslint-enable svelte/infinite-reactive-loop */

  function handleContinue() {
    // Stop any playing audio before moving to next step
    stopAudio();
    lessonStore.nextStep();
  }

  // Game step types that shouldn't track wrong answers (they report summary stats, not individual Q&A)
  const gameStepTypes = ['rapid-fire', 'memory-match', 'vocab-check', 'word-hunt', 'speed-challenge'];

  async function handleAnswer(event: CustomEvent) {
    const { correct, userAnswer, correctAnswer, allowContinue } = event.detail;

    if (correct) {
      console.log("✅ Correct Answer!");
      lessonStore.enableContinue();
    } else {
      console.log("❌ Wrong Answer - Must retry");

      // Skip wrong answer tracking for game steps (they report summary stats, not individual Q&A)
      if (!gameStepTypes.includes($currentStep.type)) {
        await saveWrongAnswer({
          lessonId: data.lesson.id,
          stepId: $currentStep.id,
          stepType: $currentStep.type,
          question: getQuestionText($currentStep),
          userAnswer: userAnswer || 'unknown',
          correctAnswer: correctAnswer || 'unknown'
        });
      }

      // Don't enable continue - user must retry
      if (allowContinue === false) {
        lessonStore.disableContinue();
      }
    }
  }

  // eslint-disable-next-line svelte/infinite-reactive-loop -- guarded by conditions in reactive block
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

  // eslint-disable-next-line svelte/infinite-reactive-loop -- guarded by conditions in reactive block
  async function finishLesson() {
    // Award XP, update streak, mark lesson as complete
    completionStats = await completeLessonWithStats(
      data.langPair,
      data.lesson.id,
      data.lesson.steps.length
    );
  }

  function backToDashboard() {
    // Force full page reload to ensure liveQuery picks up database changes
    window.location.href = '/';
  }

  // Exit button handler - show dialog if lesson started, otherwise exit directly
  function handleExitClick() {
    if ($lessonStore.currentIndex > 0) {
      showExitDialog = true;
    } else {
      backToDashboard();
    }
  }

  function handleExitDialogContinue() {
    showExitDialog = false;
  }

  function handleExitDialogExit() {
    showExitDialog = false;
    backToDashboard();
  }

  function toggleSettingsMenu() {
    showSettingsMenu = !showSettingsMenu;
  }

  function closeSettingsMenu() {
    showSettingsMenu = false;
  }

  // Calculate progress percentage for exit dialog
  $: progressPercent = Math.round(($lessonStore.currentIndex / (data.lesson?.steps?.length || 1)) * 100);
</script>

<div class="lesson-layout">
  <header class="lesson-header">
    <button class="exit-btn" on:click={handleExitClick} title="خروج">
      ✕
    </button>
    <div class="progress-bar">
      <div
        class="progress-fill"
        style="width: {($lessonStore.currentIndex / (data.lesson.steps.length || 1)) * 100}%"
      ></div>
    </div>
    <span class="step-counter">{$lessonStore.currentIndex + 1}/{data.lesson.steps.length}</span>
    <div class="menu-wrapper">
      <button class="menu-btn" on:click={toggleSettingsMenu} title="تنظیمات">
        ⋮
      </button>
      <LessonSettingsMenu isOpen={showSettingsMenu} on:close={closeSettingsMenu} />
    </div>
  </header>

  <main class="lesson-content">
    {#if completionStats}
      <!-- Final completion screen with stats -->
      <div class="completion-screen">
        <div class="completion-icon">🎉</div>
        <h2>درس تمام شد!</h2>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-icon-wrapper">
              <span class="stat-icon">📊</span>
            </div>
            <span class="stat-value">{completionStats.score}%</span>
            <span class="stat-label">امتیاز</span>
          </div>
          <div class="stat-item">
            <div class="stat-icon-wrapper">
              <span class="stat-icon">⭐</span>
            </div>
            <span class="stat-value">+{completionStats.xpEarned}</span>
            <span class="stat-label">XP کسب شده</span>
          </div>
        </div>
        <button class="finish-btn" on:click={backToDashboard}>
          <span>🏠</span>
          <span>بازگشت به صفحه اصلی</span>
        </button>
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
        <span class="shortcut-hint">↵</span>
      </button>
    </footer>
  {/if}
</div>

<!-- Exit Confirmation Dialog -->
<ExitConfirmationDialog
  isOpen={showExitDialog}
  progress={progressPercent}
  on:continue={handleExitDialogContinue}
  on:exit={handleExitDialogExit}
/>

<style>
  /*
   * Clean, full-height lesson layout (Busuu-style)
   * No card - content breathes with full space
   */
  .lesson-layout {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
    /* No background - inherits from app shell */
    height: 100%;
    min-height: 400px;
    overflow: hidden;
  }

  .lesson-header {
    flex-shrink: 0;
    padding: var(--space-2, 0.5rem) var(--space-3, 0.75rem);
    padding-top: calc(var(--space-2, 0.5rem) + env(safe-area-inset-top, 0px));
    display: flex;
    align-items: center;
    gap: var(--space-3, 0.75rem);
    z-index: 10;
  }

  .exit-btn {
    /* 44px minimum touch target */
    width: 44px;
    height: 44px;
    border-radius: var(--radius-full, 50%);
    border: none;
    background: var(--color-neutral-100, #f5f0e8);
    color: var(--color-neutral-500, #78716c);
    font-size: 1.1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--transition-normal, 200ms);
    flex-shrink: 0;
  }

  .exit-btn:hover {
    background: var(--color-neutral-200, #e8e0d5);
    color: var(--color-neutral-700, #44403c);
    transform: scale(1.05);
  }

  .menu-wrapper {
    position: relative;
    flex-shrink: 0;
  }

  .menu-btn {
    width: 44px;
    height: 44px;
    border-radius: var(--radius-full, 50%);
    border: none;
    background: var(--color-neutral-100, #f5f0e8);
    color: var(--color-neutral-500, #78716c);
    font-size: 1.4rem;
    font-weight: bold;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--transition-normal, 200ms);
  }

  .menu-btn:hover {
    background: var(--color-neutral-200, #e8e0d5);
    color: var(--color-neutral-700, #44403c);
    transform: scale(1.05);
  }

  .step-counter {
    font-size: var(--text-sm, 0.875rem);
    font-weight: var(--font-bold, 700);
    color: var(--color-xp-500, #4f46e5);
    white-space: nowrap;
    flex-shrink: 0;
    background: var(--color-xp-50, #eef2ff);
    padding: var(--space-1, 0.25rem) var(--space-3, 0.75rem);
    border-radius: var(--radius-full, 9999px);
  }

  .progress-bar {
    flex: 1;
    height: 8px;
    background: var(--color-neutral-200, #e8e0d5);
    border-radius: var(--radius-full, 9999px);
    overflow: hidden;
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--color-xp-500, #4f46e5), var(--color-primary-500, #0891b2));
    transition: width 0.5s ease;
    border-radius: var(--radius-full, 9999px);
    box-shadow: 0 0 8px var(--color-xp-glow, rgba(79, 70, 229, 0.4));
  }

  /* Content - THIS IS THE ONLY SCROLL CONTAINER */
  .lesson-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: var(--space-3, 0.75rem);
    /* Smooth scrolling for iOS */
    -webkit-overflow-scrolling: touch;
    /* Hide scrollbar but keep functionality */
    scrollbar-width: thin;
  }

  /* Webkit scrollbar styling */
  .lesson-content::-webkit-scrollbar {
    width: 4px;
  }

  .lesson-content::-webkit-scrollbar-track {
    background: transparent;
  }

  .lesson-content::-webkit-scrollbar-thumb {
    background: var(--color-neutral-300, #d4c9b9);
    border-radius: var(--radius-full, 9999px);
  }

  .step-animation {
    width: 100%;
    animation: fadeSlideIn 0.3s ease;
  }

  @keyframes fadeSlideIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Footer with continue button */
  .lesson-footer {
    flex-shrink: 0;
    padding: var(--space-4, 1rem) var(--space-3, 0.75rem);
    z-index: 10;
  }

  .continue-btn {
    width: 100%;
    display: flex;
    /* 44px minimum touch target */
    min-height: 48px;
    padding: var(--space-3, 0.75rem);
    border-radius: var(--radius-xl, 1rem);
    background: linear-gradient(135deg, var(--color-success-500, #eab308), var(--color-success-600, #ca8a04));
    color: var(--color-neutral-900, #1c1917);
    font-weight: var(--font-bold, 700);
    font-size: var(--text-base, 1rem);
    border: none;
    cursor: pointer;
    transition: all var(--transition-normal, 200ms);
    box-shadow: 0 4px 15px rgba(234, 179, 8, 0.3);
    align-items: center;
    justify-content: center;
    gap: var(--space-2, 0.5rem);
  }

  /* Larger screens */
  @media (min-width: 480px) {
    .lesson-header {
      padding: var(--space-4, 1rem);
      gap: var(--space-3, 0.75rem);
    }

    .exit-btn {
      width: 40px;
      height: 40px;
    }

    .progress-bar {
      height: 10px;
    }

    .lesson-content {
      padding: var(--space-4, 1rem);
    }

    .lesson-footer {
      padding: var(--space-4, 1rem);
    }

    .continue-btn {
      padding: var(--space-4, 1rem);
    }
  }

  .continue-btn:disabled {
    background: var(--color-neutral-300, #d4c9b9);
    color: var(--color-neutral-500, #78716c);
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
  }

  .continue-btn:not(:disabled):hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(234, 179, 8, 0.4);
  }

  .continue-btn:not(:disabled):active {
    transform: scale(0.98);
  }

  .shortcut-hint {
    opacity: 0.7;
    font-size: 0.9em;
    background: rgba(0, 0, 0, 0.1);
    padding: 2px 8px;
    border-radius: var(--radius-sm, 0.375rem);
  }

  /* Completion Screen */
  .completion-screen {
    text-align: center;
    padding: var(--space-8, 2rem);
    background: var(--glass-bg, rgba(253, 251, 247, 0.85));
    border: 1px solid var(--glass-border, rgba(212, 201, 185, 0.3));
    border-radius: var(--radius-2xl, 1.5rem);
    backdrop-filter: blur(var(--glass-blur, 12px));
    animation: fadeSlideIn 0.4s ease;
  }

  .completion-icon {
    font-size: 4rem;
    margin-bottom: var(--space-4, 1rem);
    animation: bounce-celebration 0.6s ease-in-out;
  }

  @keyframes bounce-celebration {
    0%, 100% { transform: translateY(0) scale(1); }
    30% { transform: translateY(-20px) scale(1.1); }
    50% { transform: translateY(-10px) scale(1.05); }
    70% { transform: translateY(-15px) scale(1.08); }
  }

  .completion-screen h2 {
    font-size: var(--text-2xl, 1.5rem);
    font-weight: var(--font-extrabold, 800);
    margin-bottom: var(--space-6, 1.5rem);
    background: linear-gradient(135deg, var(--color-success-500, #eab308), var(--color-primary-500, #0891b2));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-4, 1rem);
    max-width: 400px;
    margin: 0 auto var(--space-8, 2rem);
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--space-4, 1rem);
    background: var(--glass-bg, rgba(253, 251, 247, 0.95));
    border: 2px solid var(--glass-border, rgba(212, 201, 185, 0.3));
    border-radius: var(--radius-xl, 1rem);
    transition: all var(--transition-normal, 200ms);
  }

  .stat-item:first-child {
    border-color: var(--color-xp-400, #818cf8);
    background: linear-gradient(135deg, rgba(79, 70, 229, 0.1), var(--glass-bg));
  }

  .stat-item:last-child {
    border-color: var(--color-success-400, #facc15);
    background: linear-gradient(135deg, rgba(234, 179, 8, 0.1), var(--glass-bg));
  }

  .stat-item:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md, 0 4px 15px rgba(0, 0, 0, 0.08));
  }

  .stat-icon-wrapper {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-neutral-100, #f5f0e8);
    border-radius: var(--radius-lg, 0.75rem);
    margin-bottom: var(--space-2, 0.5rem);
  }

  .stat-icon {
    font-size: 1.5rem;
  }

  .stat-value {
    font-size: var(--text-2xl, 1.5rem);
    font-weight: var(--font-bold, 700);
    color: var(--color-neutral-800, #292524);
    margin-bottom: var(--space-1, 0.25rem);
  }

  .stat-item:first-child .stat-value {
    color: var(--color-xp-600, #4338ca);
  }

  .stat-item:last-child .stat-value {
    color: var(--color-success-600, #ca8a04);
  }

  .stat-label {
    font-size: var(--text-sm, 0.875rem);
    color: var(--color-neutral-500, #78716c);
  }

  .finish-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2, 0.5rem);
    margin-top: var(--space-4, 1rem);
    padding: var(--space-4, 1rem) var(--space-8, 2rem);
    background: linear-gradient(135deg, var(--color-primary-500, #0891b2), var(--color-primary-600, #0e7490));
    color: white;
    text-decoration: none;
    border: none;
    border-radius: var(--radius-full, 9999px);
    font-weight: var(--font-bold, 700);
    font-size: var(--text-lg, 1.125rem);
    cursor: pointer;
    transition: all var(--transition-normal, 200ms);
    box-shadow: 0 4px 15px rgba(8, 145, 178, 0.3);
    min-height: 48px;
  }

  .finish-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(8, 145, 178, 0.4);
  }

  .finish-btn:active {
    transform: scale(0.98);
  }

  /* Dark Mode - use hardcoded colors since CSS variables swap */
  :global([data-theme="dark"]) .lesson-content::-webkit-scrollbar-thumb {
    background: #57534e;
  }

  :global([data-theme="dark"]) .exit-btn {
    background: #44403c;
    color: #a69b8a;
  }

  :global([data-theme="dark"]) .exit-btn:hover {
    background: #57534e;
    color: #e8e0d5;
  }

  :global([data-theme="dark"]) .menu-btn {
    background: #44403c;
    color: #a69b8a;
  }

  :global([data-theme="dark"]) .menu-btn:hover {
    background: #57534e;
    color: #e8e0d5;
  }

  :global([data-theme="dark"]) .step-counter {
    background: rgba(79, 70, 229, 0.25);
    color: #a5b4fc;
  }

  :global([data-theme="dark"]) .progress-bar {
    background: #44403c;
  }

  :global([data-theme="dark"]) .completion-screen {
    background: #292524;
    border-color: #44403c;
  }

  :global([data-theme="dark"]) .completion-screen h2 {
    background: linear-gradient(135deg, #facc15, #22d3ee);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  :global([data-theme="dark"]) .stat-item {
    background: #292524;
    border-color: #44403c;
  }

  :global([data-theme="dark"]) .stat-item:first-child {
    border-color: #4f46e5;
    background: linear-gradient(135deg, rgba(79, 70, 229, 0.2), #292524);
  }

  :global([data-theme="dark"]) .stat-item:last-child {
    border-color: #eab308;
    background: linear-gradient(135deg, rgba(234, 179, 8, 0.2), #292524);
  }

  :global([data-theme="dark"]) .stat-icon-wrapper {
    background: #44403c;
  }

  :global([data-theme="dark"]) .stat-value {
    color: #f5f0e8;
  }

  :global([data-theme="dark"]) .stat-item:first-child .stat-value {
    color: #a5b4fc;
  }

  :global([data-theme="dark"]) .stat-item:last-child .stat-value {
    color: #fbbf24;
  }

  :global([data-theme="dark"]) .stat-label {
    color: #a69b8a;
  }

  :global([data-theme="dark"]) .continue-btn:disabled {
    background: #44403c;
    color: #78716c;
  }

  :global([data-theme="dark"]) .finish-btn {
    background: linear-gradient(135deg, #0891b2, #0e7490);
  }
</style>
