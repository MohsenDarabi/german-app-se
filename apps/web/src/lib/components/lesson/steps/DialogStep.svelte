<script lang="ts">
  import type { DialogStep } from "@pkg/content-model";
  import { createEventDispatcher, onDestroy } from "svelte";
  import { slide, fade } from "svelte/transition";
  import BiDiText from "$lib/components/ui/BiDiText.svelte";
  import AudioButton from "$lib/components/ui/AudioButton.svelte";
  import { getCharacterAvatarPath, getCharacterDisplayName } from "$lib/utils/character-resolver";
  import { playGerman, stopAudio } from "$lib/utils/audio";
  import { getErrorLabel } from '$lib/db';

  export let step: DialogStep;
  export let lessonId: string = '';

  const dispatch = createEventDispatcher<{ answer: { correct: boolean; allowContinue: boolean; userAnswer?: string; correctAnswer?: string } }>();

  // Conversation playback state
  let isPlaying = false;
  let currentPlayingIndex = -1;
  let stopRequested = false;

  // Question state
  let dialogPhase: 'reading' | 'question' | 'completed' = 'reading';
  let currentQuestionIndex = 0;
  let answeredCorrectly: Set<number> = new Set();
  let highlightedLineIndex: number | null = null;
  let selectedOptionIndex: number | null = null;
  let showExplanation = false;

  // For mid-dialog mode
  let currentLineIndex = 0;
  let pausedForQuestion = false;

  // Check if dialog has questions
  $: hasQuestions = step.questions && step.questions.length > 0;
  $: questionMode = step.questionMode || 'post-dialog';
  $: currentQuestion = hasQuestions ? step.questions![currentQuestionIndex] : null;
  $: isLastQuestion = hasQuestions && currentQuestionIndex === step.questions!.length - 1;
  $: allQuestionsAnswered = hasQuestions && answeredCorrectly.size === step.questions!.length;

  // Check for narratives at a position
  function getNarrativeAt(position: number) {
    return step.narratives?.find(n => n.position === position);
  }

  // Get mood class for a line
  function getMoodClass(mood: string | undefined): string {
    if (!mood || mood === 'neutral') return '';
    return `mood-${mood}`;
  }

  async function playConversation() {
    if (isPlaying) {
      stopRequested = true;
      stopAudio();
      isPlaying = false;
      currentPlayingIndex = -1;
      return;
    }

    isPlaying = true;
    stopRequested = false;

    for (let i = 0; i < step.lines.length; i++) {
      if (stopRequested) break;

      currentPlayingIndex = i;
      const line = step.lines[i];
      const audioId = `${step.id}-line${i}`;

      try {
        await playGerman(line.text.de, lessonId, audioId);
      } catch {
        // Continue to next line even if this one fails
      }

      // Check for mid-dialog question pause
      if (questionMode === 'mid-dialog' || questionMode === 'both') {
        if (step.pauseAfterLines?.includes(i) && !answeredCorrectly.has(step.pauseAfterLines.indexOf(i))) {
          pausedForQuestion = true;
          currentQuestionIndex = step.pauseAfterLines.indexOf(i);
          dialogPhase = 'question';
          isPlaying = false;
          currentPlayingIndex = -1;
          return;
        }
      }

      // Small pause between lines (300ms)
      if (!stopRequested && i < step.lines.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    isPlaying = false;
    currentPlayingIndex = -1;

    // After reading all lines, show post-dialog questions if any
    if ((questionMode === 'post-dialog' || questionMode === 'both') && hasQuestions && !allQuestionsAnswered) {
      dialogPhase = 'question';
    }
  }

  function answerQuestion(optionIndex: number) {
    if (!currentQuestion || selectedOptionIndex !== null) return;

    selectedOptionIndex = optionIndex;
    const isCorrect = optionIndex === currentQuestion.correctIndex;

    if (isCorrect) {
      answeredCorrectly.add(currentQuestionIndex);
      answeredCorrectly = answeredCorrectly;

      // Highlight related line if specified
      if (currentQuestion.relatedLineIndex !== undefined) {
        highlightedLineIndex = currentQuestion.relatedLineIndex;
      }
    }

    showExplanation = true;

    // Dispatch answer event
    dispatch('answer', {
      correct: isCorrect,
      userAnswer: currentQuestion.options[optionIndex],
      correctAnswer: currentQuestion.options[currentQuestion.correctIndex],
      allowContinue: false, // Don't auto-continue, user will click next
    });
  }

  function nextQuestion() {
    selectedOptionIndex = null;
    showExplanation = false;
    highlightedLineIndex = null;

    if (allQuestionsAnswered) {
      dialogPhase = 'completed';
      dispatch('answer', { correct: true, allowContinue: true });
      return;
    }

    // Find next unanswered question
    for (let i = currentQuestionIndex + 1; i < step.questions!.length; i++) {
      if (!answeredCorrectly.has(i)) {
        currentQuestionIndex = i;
        return;
      }
    }

    // If mid-dialog, continue playing
    if (pausedForQuestion) {
      pausedForQuestion = false;
      dialogPhase = 'reading';
      playConversation();
    }
  }

  function retryQuestion() {
    selectedOptionIndex = null;
    showExplanation = false;
  }

  // Clean up on component destroy
  onDestroy(() => {
    if (isPlaying) {
      stopRequested = true;
      stopAudio();
    }
  });
</script>

<div class="step-container">
  <!-- Scene Header (if present) -->
  {#if step.scene}
    <div class="scene-header" transition:fade>
      {#if step.scene.imageId}
        <img src="/images/{step.scene.imageId}.jpg" alt="Scene" class="scene-image" />
      {/if}
      {#if step.scene.location}
        <span class="scene-location">📍 {step.scene.location}</span>
      {/if}
      {#if step.scene.description}
        <div class="scene-description">
          <p class="scene-de">{step.scene.description.de}</p>
          <p class="scene-fa" dir="rtl">{step.scene.description.fa}</p>
        </div>
      {/if}
    </div>
  {/if}

  <h2 class="step-title">مکالمه</h2>

  <div class="chat-box">
    <!-- Narrative before first line -->
    {#if getNarrativeAt(0)}
      {@const narrative = getNarrativeAt(0)}
      <div class="narrative-text" transition:fade>
        <em class="narrative-de">{narrative?.text.de}</em>
        <em class="narrative-fa" dir="rtl">{narrative?.text.fa}</em>
      </div>
    {/if}

    {#each step.lines as line, i (i)}
      {@const id = line.speakerId || line.speaker?.toLowerCase()}
      {@const avatarPath = getCharacterAvatarPath(id)}
      {@const speakerName = getCharacterDisplayName(id)}
      {@const moodClass = getMoodClass(line.mood)}

      <div
        class="chat-bubble {moodClass}"
        class:playing={currentPlayingIndex === i}
        class:highlighted={highlightedLineIndex === i}
      >
        <div class="bubble-header">
          <div class="speaker-info">
            {#if avatarPath}
              <img class="speaker-avatar" src={avatarPath} alt={speakerName} />
            {/if}
            <span class="speaker-name">{speakerName}</span>
            {#if line.mood && line.mood !== 'neutral'}
              <span class="mood-indicator">
                {#if line.mood === 'happy'}😊
                {:else if line.mood === 'sad'}😢
                {:else if line.mood === 'angry'}😠
                {:else if line.mood === 'surprised'}😮
                {:else if line.mood === 'confused'}😕
                {:else if line.mood === 'excited'}🤩
                {/if}
              </span>
            {/if}
          </div>
          <AudioButton
            text={line.text.de}
            {lessonId}
            audioId="{step.id}-line{i}"
            size="sm"
          />
        </div>
        <p class="dialog-text">{line.text.de}</p>
        <p class="dialog-translation" dir="rtl"><BiDiText text={line.text.fa} /></p>
      </div>

      <!-- Narrative after this line -->
      {#if getNarrativeAt(i + 1)}
        {@const narrative = getNarrativeAt(i + 1)}
        <div class="narrative-text" transition:fade>
          <em class="narrative-de">{narrative?.text.de}</em>
          <em class="narrative-fa" dir="rtl">{narrative?.text.fa}</em>
        </div>
      {/if}
    {/each}
  </div>

  <!-- Play conversation button -->
  {#if dialogPhase !== 'question'}
    <button class="play-conversation-btn" class:playing={isPlaying} on:click={playConversation}>
      {#if isPlaying}
        <span class="btn-icon">⏹️</span>
        <span>توقف</span>
      {:else}
        <span class="btn-icon">▶️</span>
        <span>پخش مکالمه</span>
      {/if}
    </button>
  {/if}

  <!-- Question Section -->
  {#if dialogPhase === 'question' && currentQuestion}
    <div class="question-section" transition:slide>
      <div class="question-header">
        <span class="question-badge">سوال {currentQuestionIndex + 1} از {step.questions?.length}</span>
      </div>

      <h3 class="question-text" dir="rtl">{currentQuestion.question}</h3>

      <div class="question-options">
        {#each currentQuestion.options as option, i}
          <button
            class="question-option"
            class:selected={selectedOptionIndex === i}
            class:correct={showExplanation && i === currentQuestion.correctIndex}
            class:wrong={showExplanation && selectedOptionIndex === i && i !== currentQuestion.correctIndex}
            on:click={() => answerQuestion(i)}
            disabled={selectedOptionIndex !== null}
          >
            {option}
            {#if showExplanation && i === currentQuestion.correctIndex}
              <span class="option-icon">✅</span>
            {:else if showExplanation && selectedOptionIndex === i && i !== currentQuestion.correctIndex}
              <span class="option-icon">❌</span>
            {/if}
          </button>
        {/each}
      </div>

      {#if showExplanation}
        <div class="explanation-section" transition:slide>
          {#if currentQuestion.explanation}
            <p class="explanation-text" dir="rtl">{currentQuestion.explanation}</p>
          {/if}
          {#if selectedOptionIndex !== currentQuestion.correctIndex && currentQuestion.errorCategory}
            <span class="error-badge">{getErrorLabel(currentQuestion.errorCategory)}</span>
          {/if}

          {#if selectedOptionIndex === currentQuestion.correctIndex}
            <button class="next-btn" on:click={nextQuestion}>
              {isLastQuestion ? '✅ ادامه' : '➡️ سوال بعدی'}
            </button>
          {:else}
            <button class="retry-btn" on:click={retryQuestion}>
              🔄 تلاش مجدد
            </button>
          {/if}
        </div>
      {/if}
    </div>
  {/if}

  <!-- Start Questions Button (for post-dialog mode) -->
  {#if dialogPhase === 'reading' && hasQuestions && (questionMode === 'post-dialog' || questionMode === 'both') && !isPlaying}
    <button class="start-questions-btn" on:click={() => dialogPhase = 'question'}>
      📝 سوالات ({step.questions?.length})
    </button>
  {/if}
</div>

<style>
  /* Mobile-first styles */
  .step-container {
    display: flex;
    flex-direction: column;
    gap: var(--space-3, 0.75rem);
  }

  /* Scene Header */
  .scene-header {
    background: linear-gradient(135deg, rgba(8, 145, 178, 0.1), rgba(79, 70, 229, 0.05));
    border-radius: var(--radius-xl, 1rem);
    padding: var(--space-4, 1rem);
    margin-bottom: var(--space-3, 0.75rem);
    border: 1px solid var(--glass-border, rgba(212, 201, 185, 0.3));
  }

  .scene-image {
    width: 100%;
    height: 120px;
    object-fit: cover;
    border-radius: var(--radius-lg, 0.75rem);
    margin-bottom: var(--space-3, 0.75rem);
  }

  .scene-location {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    background: var(--color-primary-100, #cffafe);
    color: var(--color-primary-700, #155e75);
    border-radius: var(--radius-full, 9999px);
    font-size: var(--text-sm, 0.875rem);
    font-weight: 600;
    margin-bottom: var(--space-2, 0.5rem);
  }

  .scene-description {
    margin-top: var(--space-2, 0.5rem);
  }

  .scene-de {
    font-size: var(--text-base, 1rem);
    color: var(--color-neutral-700, #44403c);
    font-style: italic;
  }

  .scene-fa {
    font-size: var(--text-sm, 0.875rem);
    color: var(--color-neutral-500, #78716c);
    margin-top: 0.25rem;
  }

  /* Narrative text */
  .narrative-text {
    padding: var(--space-3, 0.75rem);
    background: rgba(250, 204, 21, 0.1);
    border-left: 3px solid #facc15;
    border-radius: var(--radius-md, 0.5rem);
    margin: var(--space-2, 0.5rem) 0;
  }

  .narrative-de {
    display: block;
    font-size: var(--text-base, 1rem);
    color: #78350f;
    margin-bottom: 0.25rem;
  }

  .narrative-fa {
    display: block;
    font-size: var(--text-sm, 0.875rem);
    color: #92400e;
  }

  .step-title {
    font-size: var(--text-lg, 1.125rem);
    font-weight: var(--font-bold, 700);
    color: var(--color-neutral-800, #292524);
    margin-bottom: var(--space-1, 0.25rem);
    text-align: center;
    background: linear-gradient(135deg, var(--color-primary-600, #0e7490), var(--color-xp-600, #4338ca));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .chat-box {
    display: flex;
    flex-direction: column;
    gap: var(--space-2, 0.5rem);
  }

  .chat-bubble {
    background: var(--glass-bg, rgba(253, 251, 247, 0.85));
    border: 1px solid var(--glass-border, rgba(212, 201, 185, 0.3));
    padding: var(--space-3, 0.75rem);
    border-radius: var(--radius-lg, 0.75rem);
    border-bottom-left-radius: var(--radius-sm, 0.375rem);
    backdrop-filter: blur(var(--glass-blur, 12px));
    max-width: 100%;
    color: var(--color-neutral-700, #44403c);
    font-size: var(--text-sm, 0.875rem);
    line-height: 1.5;
    transition: all var(--transition-normal, 200ms);
  }

  .chat-bubble:hover {
    transform: translateX(4px);
    border-color: var(--color-primary-300, #67e8f9);
  }

  .chat-bubble:nth-child(even) {
    border-bottom-left-radius: var(--radius-lg, 0.75rem);
    border-bottom-right-radius: var(--radius-sm, 0.375rem);
    background: linear-gradient(135deg, var(--color-primary-50, #ecfeff), rgba(8, 145, 178, 0.05));
  }

  .chat-bubble:nth-child(even):hover {
    transform: translateX(-4px);
  }

  /* Highlighted line */
  .chat-bubble.highlighted {
    border-color: #facc15;
    background: linear-gradient(135deg, rgba(250, 204, 21, 0.2), rgba(250, 204, 21, 0.1));
    box-shadow: 0 0 12px rgba(250, 204, 21, 0.3);
  }

  /* Mood styles */
  .chat-bubble.mood-happy {
    border-color: var(--color-gem-300, #6ee7b7);
  }

  .chat-bubble.mood-sad {
    border-color: #94a3b8;
  }

  .chat-bubble.mood-angry {
    border-color: #f87171;
  }

  .chat-bubble.mood-surprised {
    border-color: #fbbf24;
  }

  .chat-bubble.mood-confused {
    border-color: #a78bfa;
  }

  .chat-bubble.mood-excited {
    border-color: #f472b6;
  }

  .mood-indicator {
    font-size: 1rem;
  }

  .bubble-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-2, 0.5rem);
    gap: var(--space-2, 0.5rem);
  }

  .speaker-info {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .speaker-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    object-fit: cover;
    border: 1px solid #e2e8f0;
    flex-shrink: 0;
  }

  .speaker-name {
    font-weight: var(--font-bold, 700);
    color: var(--color-primary-700, #155e75);
    font-size: var(--text-sm, 0.875rem);
    padding: var(--space-1, 0.25rem) var(--space-2, 0.5rem);
    background: var(--color-primary-100, #cffafe);
    border-radius: var(--radius-full, 9999px);
  }

  .chat-bubble:nth-child(even) .speaker-name {
    color: var(--color-xp-700, #3730a3);
    background: var(--color-xp-100, #e0e7ff);
  }

  .dialog-text {
    font-size: var(--text-base, 1rem);
    color: var(--color-neutral-800, #292524);
    margin-bottom: var(--space-1, 0.25rem);
    word-wrap: break-word;
    font-weight: var(--font-medium, 500);
  }

  .dialog-translation {
    font-size: var(--text-sm, 0.875rem);
    color: var(--color-neutral-500, #78716c);
    font-style: italic;
    word-wrap: break-word;
  }

  /* Playing state highlight */
  .chat-bubble.playing {
    border-color: var(--color-primary-400, #22d3ee);
    background: linear-gradient(135deg, var(--color-primary-50, #ecfeff), var(--color-primary-100, #cffafe));
    box-shadow: 0 0 12px rgba(34, 211, 238, 0.3);
    transform: scale(1.02);
  }

  .chat-bubble.playing .dialog-text {
    color: var(--color-primary-700, #0e7490);
  }

  /* Play conversation button */
  .play-conversation-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2, 0.5rem);
    width: 100%;
    padding: var(--space-3, 0.75rem) var(--space-4, 1rem);
    margin-top: var(--space-4, 1rem);
    background: linear-gradient(135deg, var(--color-primary-500, #06b6d4), var(--color-primary-600, #0891b2));
    color: white;
    border: none;
    border-radius: var(--radius-lg, 0.75rem);
    font-size: var(--text-base, 1rem);
    font-weight: var(--font-semibold, 600);
    cursor: pointer;
    transition: all var(--transition-normal, 200ms);
    box-shadow: 0 2px 8px rgba(6, 182, 212, 0.3);
  }

  .play-conversation-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(6, 182, 212, 0.4);
  }

  .play-conversation-btn:active {
    transform: translateY(0);
  }

  .play-conversation-btn.playing {
    background: linear-gradient(135deg, var(--color-error-500, #ef4444), var(--color-error-600, #dc2626));
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
  }

  .play-conversation-btn.playing:hover {
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
  }

  .btn-icon {
    font-size: 1.1rem;
  }

  /* Start Questions Button */
  .start-questions-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2, 0.5rem);
    width: 100%;
    padding: var(--space-3, 0.75rem) var(--space-4, 1rem);
    margin-top: var(--space-2, 0.5rem);
    background: linear-gradient(135deg, #8b5cf6, #6366f1);
    color: white;
    border: none;
    border-radius: var(--radius-lg, 0.75rem);
    font-size: var(--text-base, 1rem);
    font-weight: var(--font-semibold, 600);
    cursor: pointer;
    transition: all var(--transition-normal, 200ms);
    box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
  }

  .start-questions-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
  }

  /* Question Section */
  .question-section {
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(99, 102, 241, 0.05));
    border: 2px solid #8b5cf6;
    border-radius: var(--radius-xl, 1rem);
    padding: var(--space-4, 1rem);
    margin-top: var(--space-4, 1rem);
  }

  .question-header {
    display: flex;
    justify-content: center;
    margin-bottom: var(--space-3, 0.75rem);
  }

  .question-badge {
    padding: 0.25rem 0.75rem;
    background: #8b5cf6;
    color: white;
    border-radius: var(--radius-full, 9999px);
    font-size: var(--text-sm, 0.875rem);
    font-weight: 600;
  }

  .question-text {
    font-size: var(--text-lg, 1.125rem);
    font-weight: var(--font-bold, 700);
    color: #4c1d95;
    text-align: center;
    margin-bottom: var(--space-4, 1rem);
  }

  .question-options {
    display: flex;
    flex-direction: column;
    gap: var(--space-2, 0.5rem);
  }

  .question-option {
    padding: var(--space-3, 0.75rem);
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: var(--radius-lg, 0.75rem);
    font-size: var(--text-base, 1rem);
    color: #1e293b;
    cursor: pointer;
    transition: all var(--transition-normal, 200ms);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .question-option:hover:not(:disabled) {
    border-color: #8b5cf6;
    background: rgba(139, 92, 246, 0.05);
  }

  .question-option.correct {
    border-color: #22c55e;
    background: #f0fdf4;
    color: #15803d;
  }

  .question-option.wrong {
    border-color: #ef4444;
    background: #fef2f2;
    color: #b91c1c;
  }

  .question-option:disabled {
    cursor: default;
  }

  .option-icon {
    font-size: 1.2rem;
  }

  .explanation-section {
    margin-top: var(--space-4, 1rem);
    padding-top: var(--space-4, 1rem);
    border-top: 1px solid rgba(139, 92, 246, 0.3);
    text-align: center;
  }

  .explanation-text {
    font-size: var(--text-base, 1rem);
    color: #4c1d95;
    margin-bottom: var(--space-3, 0.75rem);
    line-height: 1.6;
  }

  .error-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    background: #fef2f2;
    border: 1px solid #fca5a5;
    border-radius: var(--radius-full, 9999px);
    font-size: 0.75rem;
    font-weight: 600;
    color: #b91c1c;
    margin-bottom: var(--space-3, 0.75rem);
  }

  .next-btn {
    padding: var(--space-3, 0.75rem) var(--space-6, 1.5rem);
    background: linear-gradient(135deg, #22c55e, #16a34a);
    color: white;
    border: none;
    border-radius: var(--radius-full, 9999px);
    font-size: var(--text-base, 1rem);
    font-weight: var(--font-semibold, 600);
    cursor: pointer;
    transition: all var(--transition-normal, 200ms);
  }

  .next-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
  }

  .retry-btn {
    padding: var(--space-3, 0.75rem) var(--space-6, 1.5rem);
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
    border: none;
    border-radius: var(--radius-full, 9999px);
    font-size: var(--text-base, 1rem);
    font-weight: var(--font-semibold, 600);
    cursor: pointer;
    transition: all var(--transition-normal, 200ms);
  }

  .retry-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
  }

  /* Larger screens */
  @media (min-width: 480px) {
    .step-container {
      gap: var(--space-4, 1rem);
    }

    .step-title {
      font-size: var(--text-xl, 1.25rem);
      margin-bottom: var(--space-2, 0.5rem);
    }

    .chat-box {
      gap: var(--space-3, 0.75rem);
    }

    .chat-bubble {
      padding: var(--space-4, 1rem);
      border-radius: var(--radius-xl, 1rem);
      max-width: 85%;
    }

    .chat-bubble:nth-child(even) {
      margin-left: auto;
    }

    .scene-image {
      height: 160px;
    }
  }

  /* Dark Mode */
  :global([data-theme="dark"]) .step-title {
    background: linear-gradient(135deg, #22d3ee, #818cf8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  :global([data-theme="dark"]) .scene-header {
    background: linear-gradient(135deg, rgba(8, 145, 178, 0.2), rgba(79, 70, 229, 0.1));
    border-color: #57534e;
  }

  :global([data-theme="dark"]) .scene-location {
    background: rgba(8, 145, 178, 0.3);
    color: #22d3ee;
  }

  :global([data-theme="dark"]) .scene-de {
    color: #f5f0e8;
  }

  :global([data-theme="dark"]) .scene-fa {
    color: #a69b8a;
  }

  :global([data-theme="dark"]) .narrative-text {
    background: rgba(250, 204, 21, 0.15);
    border-color: #854d0e;
  }

  :global([data-theme="dark"]) .narrative-de {
    color: #fef08a;
  }

  :global([data-theme="dark"]) .narrative-fa {
    color: #fde047;
  }

  :global([data-theme="dark"]) .chat-bubble {
    background: #44403c;
    border-color: #57534e;
  }

  :global([data-theme="dark"]) .chat-bubble:nth-child(even) {
    background: linear-gradient(135deg, rgba(8, 145, 178, 0.25), rgba(8, 145, 178, 0.15));
  }

  :global([data-theme="dark"]) .chat-bubble.highlighted {
    background: linear-gradient(135deg, rgba(250, 204, 21, 0.2), rgba(250, 204, 21, 0.1));
    border-color: #facc15;
  }

  :global([data-theme="dark"]) .dialog-text {
    color: #f5f0e8;
    font-weight: 500;
  }

  :global([data-theme="dark"]) .dialog-translation {
    color: #a69b8a;
  }

  :global([data-theme="dark"]) .speaker-name {
    background: rgba(8, 145, 178, 0.3);
    color: #22d3ee;
  }

  :global([data-theme="dark"]) .chat-bubble:nth-child(even) .speaker-name {
    background: rgba(79, 70, 229, 0.3);
    color: #a5b4fc;
  }

  :global([data-theme="dark"]) .chat-bubble.playing {
    border-color: #22d3ee;
    background: linear-gradient(135deg, rgba(8, 145, 178, 0.4), rgba(8, 145, 178, 0.25));
    box-shadow: 0 0 12px rgba(34, 211, 238, 0.4);
  }

  :global([data-theme="dark"]) .chat-bubble.playing .dialog-text {
    color: #22d3ee;
  }

  :global([data-theme="dark"]) .play-conversation-btn {
    background: linear-gradient(135deg, #0891b2, #0e7490);
  }

  :global([data-theme="dark"]) .play-conversation-btn.playing {
    background: linear-gradient(135deg, #dc2626, #b91c1c);
  }

  :global([data-theme="dark"]) .question-section {
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(99, 102, 241, 0.1));
    border-color: #6366f1;
  }

  :global([data-theme="dark"]) .question-text {
    color: #c4b5fd;
  }

  :global([data-theme="dark"]) .question-option {
    background: #44403c;
    border-color: #57534e;
    color: #f5f0e8;
  }

  :global([data-theme="dark"]) .question-option:hover:not(:disabled) {
    background: rgba(139, 92, 246, 0.2);
    border-color: #8b5cf6;
  }

  :global([data-theme="dark"]) .question-option.correct {
    background: rgba(34, 197, 94, 0.2);
    border-color: #22c55e;
    color: #86efac;
  }

  :global([data-theme="dark"]) .question-option.wrong {
    background: rgba(239, 68, 68, 0.2);
    border-color: #ef4444;
    color: #fca5a5;
  }

  :global([data-theme="dark"]) .explanation-text {
    color: #c4b5fd;
  }
</style>
