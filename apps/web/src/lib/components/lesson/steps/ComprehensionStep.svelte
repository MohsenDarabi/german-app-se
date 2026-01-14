<script lang="ts">
  import type { ComprehensionStep, ComprehensionQuestion } from "$lib/content-model";
  import { createEventDispatcher, onMount } from "svelte";
  import BiDiText from "$lib/components/ui/BiDiText.svelte";
  import AudioButton from "$lib/components/ui/AudioButton.svelte";

  export let step: ComprehensionStep;
  export let lessonId: string = '';

  const dispatch = createEventDispatcher();

  type AnswerState = {
    selectedIndex: number | null;
    isAnswered: boolean;
    isCorrect: boolean;
  };

  // State
  let showTranslation = false;
  let currentQuestionIndex = 0;
  let answerStates: AnswerState[] = [];
  let allQuestionsAnswered = false;
  let correctCount = 0;

  onMount(() => {
    // Initialize answer states for all questions
    answerStates = step.questions.map(() => ({
      selectedIndex: null,
      isAnswered: false,
      isCorrect: false
    }));
  });

  $: currentQuestion = step.questions[currentQuestionIndex];
  $: currentAnswerState = answerStates[currentQuestionIndex] || {
    selectedIndex: null,
    isAnswered: false,
    isCorrect: false
  };

  function selectOption(optionIndex: number) {
    if (currentAnswerState.isAnswered) return;

    const isCorrect = optionIndex === currentQuestion.correctAnswerIndex;

    answerStates[currentQuestionIndex] = {
      selectedIndex: optionIndex,
      isAnswered: true,
      isCorrect
    };
    answerStates = answerStates;

    if (isCorrect) {
      correctCount++;
    }
  }

  function nextQuestion() {
    if (currentQuestionIndex < step.questions.length - 1) {
      currentQuestionIndex++;
    } else {
      // All questions answered
      allQuestionsAnswered = true;
      dispatch('answer', {
        correct: correctCount === step.questions.length,
        allowContinue: true,
        score: correctCount / step.questions.length
      });
    }
  }

  function retryQuestion() {
    answerStates[currentQuestionIndex] = {
      selectedIndex: null,
      isAnswered: false,
      isCorrect: false
    };
    answerStates = answerStates;
  }

  function toggleTranslation() {
    showTranslation = !showTranslation;
  }
</script>

<div class="comprehension-container">
  <!-- Instruction -->
  <p class="instruction" dir="rtl">
    <BiDiText text={step.instruction || 'متن را بخوانید و به سوالات پاسخ دهید'} />
  </p>

  <!-- Media (if present) -->
  {#if step.media}
    <div class="media-section">
      {#if step.media.type === 'audio'}
        <div class="audio-player">
          <audio
            controls
            src={step.media.url}
            autoplay={step.media.autoPlay}
          >
            Your browser does not support audio.
          </audio>
        </div>
      {:else if step.media.type === 'video'}
        <div class="video-player">
          <video
            controls
            src={step.media.url}
            autoplay={step.media.autoPlay}
          >
            Your browser does not support video.
          </video>
        </div>
      {/if}
    </div>
  {/if}

  <!-- Passage -->
  <div class="passage-section">
    <div class="passage-header">
      <span class="passage-label">متن</span>
      {#if step.showTranslationToggle}
        <button class="translation-toggle" on:click={toggleTranslation}>
          {showTranslation ? 'پنهان کردن ترجمه' : 'نمایش ترجمه'}
        </button>
      {/if}
    </div>

    <div class="passage-card">
      <p class="passage-text german">{step.passage.de}</p>
      {#if showTranslation}
        <p class="passage-text persian" dir="rtl">{step.passage.fa}</p>
      {/if}

      {#if step.allowReplay && !step.media}
        <div class="audio-row">
          <AudioButton
            text={step.passage.de}
            {lessonId}
            audioId="{step.id}-passage"
            size="md"
          />
        </div>
      {/if}
    </div>
  </div>

  <!-- Questions Section -->
  {#if !allQuestionsAnswered}
    <div class="questions-section">
      <div class="question-progress">
        <span>سوال {currentQuestionIndex + 1} از {step.questions.length}</span>
        <div class="progress-dots">
          {#each step.questions as _, i}
            <span
              class="dot"
              class:active={i === currentQuestionIndex}
              class:answered={answerStates[i]?.isAnswered}
              class:correct={answerStates[i]?.isCorrect}
              class:wrong={answerStates[i]?.isAnswered && !answerStates[i]?.isCorrect}
            ></span>
          {/each}
        </div>
      </div>

      <div class="question-card">
        <p class="question-text">
          <BiDiText text={currentQuestion.question} />
        </p>
        {#if currentQuestion.questionTranslation && !currentAnswerState.isAnswered}
          <p class="question-translation" dir="rtl">{currentQuestion.questionTranslation}</p>
        {/if}

        <div class="options-list">
          {#each currentQuestion.options as option, i}
            <button
              class="option-btn"
              class:selected={currentAnswerState.selectedIndex === i}
              class:correct={currentAnswerState.isAnswered && i === currentQuestion.correctAnswerIndex}
              class:wrong={currentAnswerState.isAnswered && currentAnswerState.selectedIndex === i && !currentAnswerState.isCorrect}
              disabled={currentAnswerState.isAnswered}
              on:click={() => selectOption(i)}
            >
              <span class="option-letter">{String.fromCharCode(65 + i)}</span>
              <span class="option-text"><BiDiText text={option} /></span>
            </button>
          {/each}
        </div>

        <!-- Feedback for current question -->
        {#if currentAnswerState.isAnswered}
          <div class="question-feedback" class:success={currentAnswerState.isCorrect} class:error={!currentAnswerState.isCorrect}>
            {#if currentAnswerState.isCorrect}
              <p class="feedback-text">آفرین! درست است</p>
            {:else}
              <p class="feedback-text">پاسخ صحیح: {currentQuestion.options[currentQuestion.correctAnswerIndex]}</p>
            {/if}

            {#if currentQuestion.explanation}
              <p class="explanation">{currentQuestion.explanation}</p>
            {/if}

            <div class="action-buttons">
              {#if !currentAnswerState.isCorrect}
                <button class="retry-btn" on:click={retryQuestion}>تلاش مجدد</button>
              {/if}
              <button class="next-btn" on:click={nextQuestion}>
                {currentQuestionIndex < step.questions.length - 1 ? 'سوال بعدی' : 'پایان'}
              </button>
            </div>
          </div>
        {/if}
      </div>
    </div>
  {:else}
    <!-- Summary -->
    <div class="summary-section">
      <div class="summary-icon">
        {#if correctCount === step.questions.length}
          <span class="perfect">🎉</span>
        {:else if correctCount >= step.questions.length / 2}
          <span class="good">👍</span>
        {:else}
          <span class="try-again">💪</span>
        {/if}
      </div>

      <p class="summary-text">
        {correctCount} از {step.questions.length} پاسخ صحیح
      </p>

      <div class="summary-bar">
        <div
          class="summary-fill"
          style="width: {(correctCount / step.questions.length) * 100}%"
        ></div>
      </div>
    </div>
  {/if}
</div>

<style>
  .comprehension-container {
    display: flex;
    flex-direction: column;
    gap: var(--space-6, 1.5rem);
  }

  .instruction {
    font-size: var(--text-lg, 1.125rem);
    color: var(--color-neutral-500, #78716c);
    text-align: center;
    margin: 0;
  }

  .media-section {
    width: 100%;
  }

  .audio-player audio,
  .video-player video {
    width: 100%;
    border-radius: var(--radius-lg, 0.75rem);
  }

  .passage-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-2, 0.5rem);
  }

  .passage-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .passage-label {
    font-size: var(--text-sm, 0.875rem);
    font-weight: var(--font-semibold, 600);
    color: var(--color-neutral-500, #78716c);
  }

  .translation-toggle {
    font-size: var(--text-sm, 0.875rem);
    color: var(--color-primary-500, #0891b2);
    background: none;
    border: none;
    cursor: pointer;
    text-decoration: underline;
    transition: color var(--transition-fast, 150ms);
  }

  .translation-toggle:hover {
    color: var(--color-primary-600, #0e7490);
  }

  .passage-card {
    padding: var(--space-4, 1rem);
    background: var(--glass-bg, rgba(253, 251, 247, 0.85));
    border: 2px solid var(--glass-border, rgba(212, 201, 185, 0.5));
    border-radius: var(--radius-xl, 1rem);
    backdrop-filter: blur(var(--glass-blur, 12px));
  }

  .passage-text {
    margin: 0;
    line-height: 1.8;
  }

  .passage-text.german {
    font-size: var(--text-lg, 1.125rem);
    color: var(--color-neutral-800, #292524);
  }

  .passage-text.persian {
    font-size: var(--text-base, 1rem);
    color: var(--color-neutral-500, #78716c);
    margin-top: var(--space-4, 1rem);
    padding-top: var(--space-4, 1rem);
    border-top: 1px solid var(--glass-border, rgba(212, 201, 185, 0.3));
  }

  .audio-row {
    margin-top: var(--space-4, 1rem);
    text-align: center;
  }

  .questions-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-4, 1rem);
  }

  .question-progress {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: var(--text-sm, 0.875rem);
    color: var(--color-neutral-500, #78716c);
  }

  .progress-dots {
    display: flex;
    gap: var(--space-2, 0.5rem);
  }

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--color-neutral-300, #d4c9b9);
    transition: all var(--transition-normal, 200ms);
  }

  .dot.active {
    background: var(--color-primary-500, #0891b2);
    transform: scale(1.3);
  }

  .dot.correct {
    background: var(--color-gem-500, #10b981);
  }

  .dot.wrong {
    background: var(--color-error-500, #a91e1e);
  }

  .question-card {
    padding: var(--space-6, 1.5rem);
    background: var(--glass-bg, rgba(253, 251, 247, 0.95));
    border: 2px solid var(--glass-border, rgba(212, 201, 185, 0.5));
    border-radius: var(--radius-xl, 1rem);
    backdrop-filter: blur(var(--glass-blur, 12px));
  }

  .question-text {
    font-size: var(--text-lg, 1.125rem);
    font-weight: var(--font-semibold, 600);
    color: var(--color-neutral-800, #292524);
    margin: 0 0 var(--space-2, 0.5rem);
    text-align: center;
  }

  .question-translation {
    font-size: var(--text-base, 1rem);
    color: var(--color-neutral-500, #78716c);
    margin: 0 0 var(--space-4, 1rem);
    text-align: center;
  }

  .options-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-3, 0.75rem);
  }

  .option-btn {
    display: flex;
    align-items: center;
    gap: var(--space-3, 0.75rem);
    padding: var(--space-4, 1rem);
    border: 2px solid var(--glass-border, rgba(212, 201, 185, 0.5));
    border-radius: var(--radius-lg, 0.75rem);
    background: var(--color-neutral-50, #fdfbf7);
    cursor: pointer;
    transition: all var(--transition-normal, 200ms);
    text-align: left;
    min-height: 56px;
  }

  .option-btn:hover:not(:disabled) {
    border-color: var(--color-primary-400, #22d3ee);
    background: var(--color-primary-50, #ecfeff);
    transform: translateY(-2px);
  }

  .option-btn.selected {
    border-color: var(--color-primary-500, #0891b2);
    background: var(--color-primary-100, #cffafe);
  }

  .option-btn.correct {
    border-color: var(--color-gem-400, #34d399);
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05));
  }

  .option-btn.wrong {
    border-color: var(--color-error-400, #c84b4b);
    background: linear-gradient(135deg, rgba(169, 30, 30, 0.1), rgba(169, 30, 30, 0.05));
  }

  .option-btn:disabled {
    cursor: default;
  }

  .option-letter {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--color-neutral-200, #e8e0d5);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: var(--font-bold, 700);
    font-size: var(--text-sm, 0.875rem);
    color: var(--color-neutral-600, #57534e);
    flex-shrink: 0;
  }

  .option-btn.correct .option-letter {
    background: var(--color-gem-500, #10b981);
    color: white;
  }

  .option-btn.wrong .option-letter {
    background: var(--color-error-500, #a91e1e);
    color: white;
  }

  .option-text {
    font-size: var(--text-base, 1rem);
    color: var(--color-neutral-800, #292524);
  }

  .question-feedback {
    margin-top: var(--space-4, 1rem);
    padding: var(--space-4, 1rem);
    border-radius: var(--radius-lg, 0.75rem);
    text-align: center;
  }

  .question-feedback.success {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05));
    border: 1px solid var(--color-gem-400, #34d399);
  }

  .question-feedback.error {
    background: linear-gradient(135deg, rgba(169, 30, 30, 0.1), rgba(169, 30, 30, 0.05));
    border: 1px solid var(--color-error-400, #c84b4b);
  }

  .feedback-text {
    font-weight: var(--font-semibold, 600);
    margin: 0 0 var(--space-2, 0.5rem);
  }

  .question-feedback.success .feedback-text {
    color: var(--color-gem-700, #047857);
  }

  .question-feedback.error .feedback-text {
    color: var(--color-neutral-800, #292524);
  }

  .explanation {
    font-size: var(--text-sm, 0.875rem);
    color: var(--color-neutral-500, #78716c);
    margin: 0 0 var(--space-4, 1rem);
  }

  .action-buttons {
    display: flex;
    gap: var(--space-3, 0.75rem);
    justify-content: center;
  }

  .retry-btn {
    padding: var(--space-2, 0.5rem) var(--space-6, 1.5rem);
    background: transparent;
    color: var(--color-error-500, #a91e1e);
    border: 2px solid var(--color-error-400, #c84b4b);
    border-radius: var(--radius-full, 9999px);
    font-size: var(--text-base, 1rem);
    font-weight: var(--font-semibold, 600);
    cursor: pointer;
    transition: all var(--transition-fast, 150ms);
    min-height: 44px;
  }

  .retry-btn:hover {
    background: linear-gradient(135deg, rgba(169, 30, 30, 0.1), rgba(169, 30, 30, 0.05));
  }

  .next-btn {
    padding: var(--space-2, 0.5rem) var(--space-6, 1.5rem);
    background: linear-gradient(135deg, var(--color-primary-500, #0891b2), var(--color-primary-600, #0e7490));
    color: white;
    border: none;
    border-radius: var(--radius-full, 9999px);
    font-size: var(--text-base, 1rem);
    font-weight: var(--font-semibold, 600);
    cursor: pointer;
    transition: all var(--transition-normal, 200ms);
    min-height: 44px;
  }

  .next-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(8, 145, 178, 0.3);
  }

  .summary-section {
    padding: var(--space-8, 2rem);
    background: linear-gradient(135deg, rgba(234, 179, 8, 0.15), rgba(234, 179, 8, 0.05));
    border: 2px solid var(--color-success-400, #facc15);
    border-radius: var(--radius-xl, 1rem);
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-4, 1rem);
  }

  .summary-icon {
    font-size: 3.5rem;
    animation: bounce 0.6s ease-in-out infinite alternate;
  }

  @keyframes bounce {
    from { transform: translateY(0); }
    to { transform: translateY(-10px); }
  }

  .summary-text {
    font-size: var(--text-xl, 1.25rem);
    font-weight: var(--font-semibold, 600);
    color: var(--color-success-700, #a16207);
    margin: 0;
  }

  .summary-bar {
    width: 100%;
    max-width: 200px;
    height: 10px;
    background: var(--color-neutral-200, #e8e0d5);
    border-radius: var(--radius-full, 9999px);
    overflow: hidden;
  }

  .summary-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--color-success-500, #eab308), var(--color-success-400, #facc15));
    border-radius: var(--radius-full, 9999px);
    transition: width 0.5s ease-out;
  }

  /* Dark Mode */
  :global([data-theme="dark"]) .passage-card {
    background: rgba(28, 25, 23, 0.85);
  }

  :global([data-theme="dark"]) .passage-text.german {
    color: var(--color-neutral-100, #f5f0e8);
  }

  :global([data-theme="dark"]) .question-card {
    background: rgba(28, 25, 23, 0.95);
  }

  :global([data-theme="dark"]) .question-text {
    color: var(--color-neutral-100, #f5f0e8);
  }

  :global([data-theme="dark"]) .option-btn {
    background: rgba(28, 25, 23, 0.95);
  }

  :global([data-theme="dark"]) .option-text {
    color: var(--color-neutral-100, #f5f0e8);
  }
</style>
