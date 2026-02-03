<script lang="ts">
  import type { StoryStep } from "@pkg/content-model";
  import { createEventDispatcher } from "svelte";
  import { fly, fade } from "svelte/transition";
  import BiDiText from "$lib/components/ui/BiDiText.svelte";
  import AudioButton from "$lib/components/ui/AudioButton.svelte";
  import { getCharacterAvatarPath, getCharacterDisplayName } from "$lib/utils/character-resolver";

  export let step: StoryStep;
  export let lessonId: string = '';

  const dispatch = createEventDispatcher<{ answer: { correct: boolean; allowContinue: boolean; userAnswer?: string; correctAnswer?: string } }>();

  let currentSegmentIndex = 0;
  let questionAnswered = false;
  let selectedOptionIndex: number | null = null;
  let showTranslation = false;

  $: currentSegment = step.segments[currentSegmentIndex];
  $: isLastSegment = currentSegmentIndex === step.segments.length - 1;
  $: isQuestion = currentSegment?.type === 'question';
  $: progress = ((currentSegmentIndex + 1) / step.segments.length) * 100;

  function nextSegment() {
    if (isQuestion && !questionAnswered) return;

    if (!isLastSegment) {
      currentSegmentIndex++;
      questionAnswered = false;
      selectedOptionIndex = null;
    } else {
      // Story complete
      dispatch('answer', { correct: true, allowContinue: true });
    }
  }

  function answerQuestion(optionIndex: number) {
    if (currentSegment.type !== 'question' || selectedOptionIndex !== null) return;

    selectedOptionIndex = optionIndex;
    const isCorrect = optionIndex === currentSegment.correctIndex;
    questionAnswered = isCorrect;

    dispatch('answer', {
      correct: isCorrect,
      userAnswer: currentSegment.options[optionIndex],
      correctAnswer: currentSegment.options[currentSegment.correctIndex],
      allowContinue: false,
    });
  }

  function retryQuestion() {
    selectedOptionIndex = null;
    questionAnswered = false;
  }

  // Get mood emoji
  function getMoodEmoji(mood: string | undefined): string {
    switch (mood) {
      case 'happy': return '😊';
      case 'sad': return '😢';
      case 'angry': return '😠';
      case 'surprised': return '😮';
      case 'confused': return '😕';
      case 'excited': return '🤩';
      default: return '';
    }
  }
</script>

<div class="story-container" dir="rtl">
  <!-- Story Header -->
  <div class="story-header">
    <h2 class="story-title">{step.title.fa}</h2>
    <p class="story-title-de" dir="ltr">{step.title.de}</p>
    {#if step.setting}
      <span class="story-location">📍 {step.setting.location}</span>
    {/if}
    {#if step.tone === 'funny'}
      <span class="tone-badge">😄 طنز</span>
    {:else if step.tone === 'dramatic'}
      <span class="tone-badge">🎭 دراماتیک</span>
    {:else if step.tone === 'romantic'}
      <span class="tone-badge">💕 عاشقانه</span>
    {/if}
  </div>

  <!-- Progress Bar -->
  <div class="progress-container">
    <div class="progress-bar" style="width: {progress}%"></div>
  </div>

  <!-- Current Segment -->
  <div class="segment-display" in:fly={{ y: 20, duration: 300 }}>
    {#if currentSegment.type === 'narration'}
      <div class="narration-card">
        {#if currentSegment.imageId}
          <img src="/images/{currentSegment.imageId}.jpg" alt="Scene" class="segment-image" />
        {/if}
        <p class="narration-text-de" dir="ltr">{currentSegment.text.de}</p>
        {#if showTranslation}
          <p class="narration-text-fa" transition:fade>{currentSegment.text.fa}</p>
        {/if}
        <AudioButton
          text={currentSegment.text.de}
          {lessonId}
          audioId="{step.id}-seg{currentSegmentIndex}"
          size="md"
        />
      </div>

    {:else if currentSegment.type === 'dialog'}
      {@const id = currentSegment.speakerId || currentSegment.speaker?.toLowerCase()}
      {@const avatarPath = getCharacterAvatarPath(id)}
      {@const speakerName = getCharacterDisplayName(id)}

      <div class="dialog-card {currentSegment.mood ? `mood-${currentSegment.mood}` : ''}">
        <div class="dialog-header">
          <div class="speaker-info">
            {#if avatarPath}
              <img class="speaker-avatar" src={avatarPath} alt={speakerName} />
            {/if}
            <span class="speaker-name">{speakerName}</span>
            {#if currentSegment.mood}
              <span class="mood-emoji">{getMoodEmoji(currentSegment.mood)}</span>
            {/if}
          </div>
          <AudioButton
            text={currentSegment.text.de}
            {lessonId}
            audioId="{step.id}-seg{currentSegmentIndex}"
            size="sm"
          />
        </div>
        <p class="dialog-text-de" dir="ltr">"{currentSegment.text.de}"</p>
        {#if showTranslation}
          <p class="dialog-text-fa" transition:fade>{currentSegment.text.fa}</p>
        {/if}
      </div>

    {:else if currentSegment.type === 'question'}
      <div class="question-card">
        <div class="question-badge">❓ سوال</div>
        <h4 class="question-text">{currentSegment.question}</h4>
        <div class="question-options">
          {#each currentSegment.options as option, i (i)}
            <button
              class="question-option"
              class:selected={selectedOptionIndex === i}
              class:correct={selectedOptionIndex !== null && i === currentSegment.correctIndex}
              class:wrong={selectedOptionIndex === i && i !== currentSegment.correctIndex}
              on:click={() => answerQuestion(i)}
              disabled={selectedOptionIndex !== null}
            >
              {option}
              {#if selectedOptionIndex !== null && i === currentSegment.correctIndex}
                <span class="option-icon">✅</span>
              {:else if selectedOptionIndex === i && i !== currentSegment.correctIndex}
                <span class="option-icon">❌</span>
              {/if}
            </button>
          {/each}
        </div>

        {#if selectedOptionIndex !== null}
          <div class="question-feedback" transition:fade>
            {#if currentSegment.explanation}
              <p class="explanation">{currentSegment.explanation}</p>
            {/if}
            {#if selectedOptionIndex !== currentSegment.correctIndex}
              <button class="retry-btn" on:click={retryQuestion}>
                🔄 تلاش مجدد
              </button>
            {/if}
          </div>
        {/if}
      </div>
    {/if}
  </div>

  <!-- Progress Dots -->
  <div class="progress-dots">
    {#each step.segments as _, i (i)}
      <span
        class="dot"
        class:active={i === currentSegmentIndex}
        class:completed={i < currentSegmentIndex}
        class:question={step.segments[i].type === 'question'}
      ></span>
    {/each}
  </div>

  <!-- Controls -->
  <div class="story-controls">
    <button
      class="translation-toggle"
      on:click={() => showTranslation = !showTranslation}
    >
      {showTranslation ? '🔒 مخفی کردن ترجمه' : '👁 نمایش ترجمه'}
    </button>

    <button
      class="next-btn"
      on:click={nextSegment}
      disabled={isQuestion && !questionAnswered}
    >
      {isLastSegment ? '✅ پایان داستان' : '➡️ ادامه'}
    </button>
  </div>
</div>

<style>
  .story-container {
    display: flex;
    flex-direction: column;
    gap: var(--space-4, 1rem);
    max-width: 100%;
  }

  /* Story Header */
  .story-header {
    text-align: center;
    padding: var(--space-4, 1rem);
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(99, 102, 241, 0.05));
    border-radius: var(--radius-xl, 1rem);
    border: 1px solid rgba(139, 92, 246, 0.3);
  }

  .story-title {
    font-size: var(--text-xl, 1.25rem);
    font-weight: var(--font-bold, 700);
    color: #4c1d95;
    margin: 0 0 var(--space-1, 0.25rem) 0;
  }

  .story-title-de {
    font-size: var(--text-base, 1rem);
    color: var(--color-neutral-600, #57534e);
    margin: 0 0 var(--space-2, 0.5rem) 0;
    font-style: italic;
  }

  .story-location {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    background: var(--color-primary-100, #cffafe);
    color: var(--color-primary-700, #155e75);
    border-radius: var(--radius-full, 9999px);
    font-size: var(--text-sm, 0.875rem);
    font-weight: 600;
    margin-right: var(--space-2, 0.5rem);
  }

  .tone-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    background: #fef08a;
    color: #78350f;
    border-radius: var(--radius-full, 9999px);
    font-size: var(--text-sm, 0.875rem);
    font-weight: 600;
  }

  /* Progress Bar */
  .progress-container {
    width: 100%;
    height: 6px;
    background: var(--color-neutral-200, #e8e0d5);
    border-radius: var(--radius-full, 9999px);
    overflow: hidden;
  }

  .progress-bar {
    height: 100%;
    background: linear-gradient(135deg, #8b5cf6, #6366f1);
    border-radius: var(--radius-full, 9999px);
    transition: width 0.3s ease;
  }

  /* Segment Display */
  .segment-display {
    min-height: 200px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  /* Narration Card */
  .narration-card {
    background: linear-gradient(135deg, rgba(250, 204, 21, 0.1), rgba(250, 204, 21, 0.05));
    border: 2px solid #facc15;
    border-radius: var(--radius-xl, 1rem);
    padding: var(--space-5, 1.25rem);
    text-align: center;
  }

  .segment-image {
    width: 100%;
    max-height: 150px;
    object-fit: cover;
    border-radius: var(--radius-lg, 0.75rem);
    margin-bottom: var(--space-3, 0.75rem);
  }

  .narration-text-de {
    font-size: var(--text-lg, 1.125rem);
    font-style: italic;
    color: #78350f;
    line-height: 1.7;
    margin: 0 0 var(--space-2, 0.5rem) 0;
  }

  .narration-text-fa {
    font-size: var(--text-base, 1rem);
    color: #92400e;
    margin: 0 0 var(--space-3, 0.75rem) 0;
  }

  /* Dialog Card */
  .dialog-card {
    background: var(--glass-bg, rgba(253, 251, 247, 0.85));
    border: 2px solid var(--glass-border, rgba(212, 201, 185, 0.3));
    border-radius: var(--radius-xl, 1rem);
    padding: var(--space-4, 1rem);
    text-align: left;
  }

  .dialog-card.mood-happy {
    border-color: var(--color-gem-400, #34d399);
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.05), transparent);
  }

  .dialog-card.mood-sad {
    border-color: #94a3b8;
    background: linear-gradient(135deg, rgba(148, 163, 184, 0.1), transparent);
  }

  .dialog-card.mood-angry {
    border-color: #f87171;
    background: linear-gradient(135deg, rgba(248, 113, 113, 0.1), transparent);
  }

  .dialog-card.mood-surprised {
    border-color: #fbbf24;
    background: linear-gradient(135deg, rgba(251, 191, 36, 0.1), transparent);
  }

  .dialog-card.mood-confused {
    border-color: #a78bfa;
    background: linear-gradient(135deg, rgba(167, 139, 250, 0.1), transparent);
  }

  .dialog-card.mood-excited {
    border-color: #f472b6;
    background: linear-gradient(135deg, rgba(244, 114, 182, 0.1), transparent);
  }

  .dialog-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-3, 0.75rem);
  }

  .speaker-info {
    display: flex;
    align-items: center;
    gap: var(--space-2, 0.5rem);
  }

  .speaker-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--color-primary-300, #67e8f9);
  }

  .speaker-name {
    font-weight: var(--font-bold, 700);
    color: var(--color-primary-700, #155e75);
    font-size: var(--text-base, 1rem);
    padding: var(--space-1, 0.25rem) var(--space-3, 0.75rem);
    background: var(--color-primary-100, #cffafe);
    border-radius: var(--radius-full, 9999px);
  }

  .mood-emoji {
    font-size: 1.25rem;
  }

  .dialog-text-de {
    font-size: var(--text-lg, 1.125rem);
    color: var(--color-neutral-800, #292524);
    font-weight: var(--font-medium, 500);
    margin: 0 0 var(--space-2, 0.5rem) 0;
  }

  .dialog-text-fa {
    font-size: var(--text-base, 1rem);
    color: var(--color-neutral-500, #78716c);
    margin: 0;
    text-align: right;
  }

  /* Question Card */
  .question-card {
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(99, 102, 241, 0.05));
    border: 2px solid #8b5cf6;
    border-radius: var(--radius-xl, 1rem);
    padding: var(--space-4, 1rem);
    text-align: center;
  }

  .question-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    background: #8b5cf6;
    color: white;
    border-radius: var(--radius-full, 9999px);
    font-size: var(--text-sm, 0.875rem);
    font-weight: 600;
    margin-bottom: var(--space-3, 0.75rem);
  }

  .question-text {
    font-size: var(--text-lg, 1.125rem);
    font-weight: var(--font-bold, 700);
    color: #4c1d95;
    margin: 0 0 var(--space-4, 1rem) 0;
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
    text-align: right;
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

  .question-feedback {
    margin-top: var(--space-4, 1rem);
    padding-top: var(--space-3, 0.75rem);
    border-top: 1px solid rgba(139, 92, 246, 0.3);
  }

  .explanation {
    font-size: var(--text-base, 1rem);
    color: #4c1d95;
    margin: 0 0 var(--space-3, 0.75rem) 0;
    line-height: 1.6;
  }

  .retry-btn {
    padding: var(--space-2, 0.5rem) var(--space-5, 1.25rem);
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
    border: none;
    border-radius: var(--radius-full, 9999px);
    font-size: var(--text-sm, 0.875rem);
    font-weight: var(--font-semibold, 600);
    cursor: pointer;
    transition: all var(--transition-normal, 200ms);
  }

  .retry-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  }

  /* Progress Dots */
  .progress-dots {
    display: flex;
    justify-content: center;
    gap: var(--space-2, 0.5rem);
    flex-wrap: wrap;
  }

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--color-neutral-300, #d4c9b9);
    transition: all var(--transition-normal, 200ms);
  }

  .dot.active {
    background: #8b5cf6;
    transform: scale(1.3);
    box-shadow: 0 0 8px rgba(139, 92, 246, 0.5);
  }

  .dot.completed {
    background: #22c55e;
  }

  .dot.question {
    border: 2px solid #8b5cf6;
    background: transparent;
  }

  .dot.question.completed {
    background: #8b5cf6;
    border-color: #8b5cf6;
  }

  /* Controls */
  .story-controls {
    display: flex;
    flex-direction: column;
    gap: var(--space-2, 0.5rem);
  }

  .translation-toggle {
    padding: var(--space-2, 0.5rem) var(--space-4, 1rem);
    background: var(--color-neutral-100, #f5f0e8);
    border: 1px solid var(--color-neutral-300, #d4c9b9);
    border-radius: var(--radius-lg, 0.75rem);
    font-size: var(--text-sm, 0.875rem);
    color: var(--color-neutral-600, #57534e);
    cursor: pointer;
    transition: all var(--transition-normal, 200ms);
  }

  .translation-toggle:hover {
    background: var(--color-neutral-200, #e8e0d5);
  }

  .next-btn {
    padding: var(--space-4, 1rem) var(--space-6, 1.5rem);
    background: linear-gradient(135deg, #8b5cf6, #6366f1);
    color: white;
    border: none;
    border-radius: var(--radius-lg, 0.75rem);
    font-size: var(--text-base, 1rem);
    font-weight: var(--font-semibold, 600);
    cursor: pointer;
    transition: all var(--transition-normal, 200ms);
    box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
  }

  .next-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
  }

  .next-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Dark Mode */
  :global([data-theme="dark"]) .story-header {
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(99, 102, 241, 0.1));
    border-color: #6366f1;
  }

  :global([data-theme="dark"]) .story-title {
    color: #c4b5fd;
  }

  :global([data-theme="dark"]) .story-title-de {
    color: #a69b8a;
  }

  :global([data-theme="dark"]) .progress-container {
    background: #44403c;
  }

  :global([data-theme="dark"]) .narration-card {
    background: linear-gradient(135deg, rgba(250, 204, 21, 0.1), rgba(250, 204, 21, 0.05));
    border-color: #854d0e;
  }

  :global([data-theme="dark"]) .narration-text-de {
    color: #fef08a;
  }

  :global([data-theme="dark"]) .narration-text-fa {
    color: #fde047;
  }

  :global([data-theme="dark"]) .dialog-card {
    background: #44403c;
    border-color: #57534e;
  }

  :global([data-theme="dark"]) .speaker-name {
    background: rgba(8, 145, 178, 0.3);
    color: #22d3ee;
  }

  :global([data-theme="dark"]) .dialog-text-de {
    color: #f5f0e8;
  }

  :global([data-theme="dark"]) .dialog-text-fa {
    color: #a69b8a;
  }

  :global([data-theme="dark"]) .question-card {
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

  :global([data-theme="dark"]) .explanation {
    color: #c4b5fd;
  }

  :global([data-theme="dark"]) .dot {
    background: #57534e;
  }

  :global([data-theme="dark"]) .translation-toggle {
    background: #44403c;
    border-color: #57534e;
    color: #a69b8a;
  }

  :global([data-theme="dark"]) .translation-toggle:hover {
    background: #57534e;
  }
</style>
