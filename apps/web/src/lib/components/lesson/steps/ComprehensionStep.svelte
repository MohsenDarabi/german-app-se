<script lang="ts">
  import type { ComprehensionStep, ComprehensionQuestion } from "@pkg/content-model";
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
    gap: 1.5rem;
  }

  .instruction {
    font-size: 1.1rem;
    color: #64748b;
    text-align: center;
    margin: 0;
  }

  .media-section {
    width: 100%;
  }

  .audio-player audio,
  .video-player video {
    width: 100%;
    border-radius: 0.75rem;
  }

  .passage-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .passage-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .passage-label {
    font-size: 0.9rem;
    font-weight: 600;
    color: #64748b;
  }

  .translation-toggle {
    font-size: 0.85rem;
    color: #3b82f6;
    background: none;
    border: none;
    cursor: pointer;
    text-decoration: underline;
  }

  .passage-card {
    padding: 1.25rem;
    background: #f8fafc;
    border: 2px solid #e2e8f0;
    border-radius: 1rem;
  }

  .passage-text {
    margin: 0;
    line-height: 1.7;
  }

  .passage-text.german {
    font-size: 1.1rem;
    color: #1e293b;
  }

  .passage-text.persian {
    font-size: 1rem;
    color: #64748b;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e2e8f0;
  }

  .audio-row {
    margin-top: 1rem;
    text-align: center;
  }

  .questions-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .question-progress {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.9rem;
    color: #64748b;
  }

  .progress-dots {
    display: flex;
    gap: 0.5rem;
  }

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #e2e8f0;
    transition: all 0.2s;
  }

  .dot.active {
    background: #3b82f6;
    transform: scale(1.2);
  }

  .dot.correct {
    background: #22c55e;
  }

  .dot.wrong {
    background: #ef4444;
  }

  .question-card {
    padding: 1.5rem;
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 1rem;
  }

  .question-text {
    font-size: 1.15rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 0.5rem;
    text-align: center;
  }

  .question-translation {
    font-size: 0.95rem;
    color: #64748b;
    margin: 0 0 1rem;
    text-align: center;
  }

  .options-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .option-btn {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 0.75rem;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
  }

  .option-btn:hover:not(:disabled) {
    border-color: #3b82f6;
    background: #eff6ff;
  }

  .option-btn.selected {
    border-color: #3b82f6;
    background: #dbeafe;
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

  .option-letter {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #f1f5f9;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.9rem;
    color: #64748b;
    flex-shrink: 0;
  }

  .option-btn.correct .option-letter {
    background: #22c55e;
    color: white;
  }

  .option-btn.wrong .option-letter {
    background: #ef4444;
    color: white;
  }

  .option-text {
    font-size: 1rem;
    color: #1e293b;
  }

  .question-feedback {
    margin-top: 1rem;
    padding: 1rem;
    border-radius: 0.75rem;
    text-align: center;
  }

  .question-feedback.success {
    background: #f0fdf4;
    border: 1px solid #86efac;
  }

  .question-feedback.error {
    background: #fef2f2;
    border: 1px solid #fecaca;
  }

  .feedback-text {
    font-weight: 600;
    margin: 0 0 0.5rem;
  }

  .question-feedback.success .feedback-text {
    color: #15803d;
  }

  .question-feedback.error .feedback-text {
    color: #1e293b;
  }

  .explanation {
    font-size: 0.9rem;
    color: #64748b;
    margin: 0 0 1rem;
  }

  .action-buttons {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
  }

  .retry-btn {
    padding: 0.6rem 1.5rem;
    background: white;
    color: #ef4444;
    border: 2px solid #ef4444;
    border-radius: 999px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
  }

  .retry-btn:hover {
    background: #fef2f2;
  }

  .next-btn {
    padding: 0.6rem 1.5rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 999px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
  }

  .next-btn:hover {
    background: #2563eb;
  }

  .summary-section {
    padding: 2rem;
    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
    border: 2px solid #86efac;
    border-radius: 1rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .summary-icon {
    font-size: 3rem;
  }

  .summary-text {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
  }

  .summary-bar {
    width: 100%;
    max-width: 200px;
    height: 8px;
    background: #e2e8f0;
    border-radius: 4px;
    overflow: hidden;
  }

  .summary-fill {
    height: 100%;
    background: linear-gradient(90deg, #22c55e, #16a34a);
    border-radius: 4px;
    transition: width 0.5s ease-out;
  }
</style>
