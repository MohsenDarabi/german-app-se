<script lang="ts">
  import type { SpellingStep } from "@pkg/content-model";
  import { createEventDispatcher, onMount } from "svelte";
  import BiDiText from "$lib/components/ui/BiDiText.svelte";
  import AudioButton from "$lib/components/ui/AudioButton.svelte";

  export let step: SpellingStep;
  export let lessonId: string = '';

  const dispatch = createEventDispatcher();

  // Generate letters from word + optional distractors
  let availableLetters: { letter: string; id: string; used: boolean }[] = [];
  let selectedLetters: { letter: string; id: string }[] = [];
  let isCorrect = false;
  let isWrong = false;
  let canRetry = false;
  let showHint = false;

  const DISTRACTOR_LETTERS = 'ÄÖÜABCDEFGHIJKLMNOPQRSTUVWXYZ';

  onMount(() => {
    initializeLetters();
  });

  function initializeLetters() {
    // Get letters from the word
    const wordLetters = step.word.split('');

    // Add distractor letters if enabled
    let allLetters = [...wordLetters];
    if (step.includeDistractors) {
      const count = step.distractorCount || 2;
      for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(Math.random() * DISTRACTOR_LETTERS.length);
        allLetters.push(DISTRACTOR_LETTERS[randomIndex]);
      }
    }

    // Override with provided letters if available
    if (step.letters && step.letters.length > 0) {
      allLetters = [...step.letters];
    }

    // Shuffle and create letter objects
    availableLetters = shuffleArray(allLetters).map((letter, index) => ({
      letter,
      id: `${letter}-${index}`,
      used: false
    }));
  }

  function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  function selectLetter(letterObj: { letter: string; id: string; used: boolean }) {
    if (letterObj.used || isCorrect) return;

    // Mark as used
    availableLetters = availableLetters.map(l =>
      l.id === letterObj.id ? { ...l, used: true } : l
    );

    // Add to selected
    selectedLetters = [...selectedLetters, { letter: letterObj.letter, id: letterObj.id }];

    // Check if word is complete
    if (selectedLetters.length === step.word.length) {
      checkAnswer();
    }
  }

  function removeLetter(index: number) {
    if (isCorrect) return;

    const removed = selectedLetters[index];

    // Return to available
    availableLetters = availableLetters.map(l =>
      l.id === removed.id ? { ...l, used: false } : l
    );

    // Remove from selected
    selectedLetters = selectedLetters.filter((_, i) => i !== index);

    // Reset wrong state
    isWrong = false;
    canRetry = false;
  }

  function checkAnswer() {
    const enteredWord = selectedLetters.map(l => l.letter).join('');
    isCorrect = enteredWord === step.word;

    if (isCorrect) {
      dispatch('answer', {
        correct: true,
        allowContinue: true
      });
    } else {
      isWrong = true;
      canRetry = true;
      dispatch('answer', {
        correct: false,
        allowContinue: false
      });
    }
  }

  function retry() {
    // Reset all letters
    availableLetters = availableLetters.map(l => ({ ...l, used: false }));
    selectedLetters = [];
    isWrong = false;
    canRetry = false;
  }

  function clearAll() {
    availableLetters = availableLetters.map(l => ({ ...l, used: false }));
    selectedLetters = [];
    isWrong = false;
  }
</script>

<div class="spelling-container">
  <p class="instruction" dir="rtl">
    <BiDiText text={step.instruction || 'این کلمه را هجی کنید'} />
  </p>

  <!-- Translation hint -->
  <div class="hint-section">
    <p class="translation" dir="rtl">{step.translation}</p>
    {#if step.phonetic}
      <button class="hint-toggle" on:click={() => showHint = !showHint}>
        {showHint ? 'پنهان کردن تلفظ' : 'نمایش تلفظ'}
      </button>
      {#if showHint}
        <p class="phonetic">[{step.phonetic}]</p>
      {/if}
    {/if}
  </div>

  <!-- Image if provided -->
  {#if step.showImage && step.image}
    <div class="image-container">
      <img src={step.image} alt={step.word} />
    </div>
  {/if}

  <!-- Selected letters / answer area -->
  <div class="answer-area" class:correct={isCorrect} class:wrong={isWrong}>
    <div class="letter-slots">
      {#each Array(step.word.length) as _, i}
        <div
          class="letter-slot"
          class:filled={selectedLetters[i]}
          on:click={() => selectedLetters[i] && removeLetter(i)}
          on:keypress={(e) => e.key === 'Enter' && selectedLetters[i] && removeLetter(i)}
          role="button"
          tabindex={selectedLetters[i] ? 0 : -1}
        >
          {selectedLetters[i]?.letter || ''}
        </div>
      {/each}
    </div>

    {#if selectedLetters.length > 0 && !isCorrect}
      <button class="clear-btn" on:click={clearAll}>پاک کردن</button>
    {/if}
  </div>

  <!-- Available letters -->
  <div class="letters-grid">
    {#each availableLetters as letterObj (letterObj.id)}
      <button
        class="letter-btn"
        class:used={letterObj.used}
        disabled={letterObj.used || isCorrect}
        on:click={() => selectLetter(letterObj)}
      >
        {letterObj.letter}
      </button>
    {/each}
  </div>

  <!-- Feedback -->
  {#if isCorrect}
    <div class="success-section">
      <p class="feedback-text success">آفرین! درست نوشتید</p>
      <div class="word-row">
        <span class="correct-word">{step.word}</span>
        <AudioButton
          text={step.word}
          {lessonId}
          audioId="{step.id}-word"
          size="md"
        />
      </div>
      {#if step.feedback?.explanation}
        <p class="explanation" dir="rtl"><BiDiText text={step.feedback.explanation} /></p>
      {/if}
    </div>
  {/if}

  {#if canRetry}
    <div class="retry-section">
      <p class="feedback-text error">درست نیست! دوباره تلاش کنید</p>
      <button class="retry-btn" on:click={retry}>تلاش مجدد</button>
    </div>
  {/if}
</div>

<style>
  .spelling-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    align-items: center;
  }

  .instruction {
    font-size: 1.1rem;
    color: #64748b;
    text-align: center;
    margin: 0;
  }

  .hint-section {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .translation {
    font-size: 1.3rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
  }

  .hint-toggle {
    font-size: 0.85rem;
    color: #3b82f6;
    background: none;
    border: none;
    cursor: pointer;
    text-decoration: underline;
  }

  .phonetic {
    font-size: 1rem;
    color: #64748b;
    font-style: italic;
    margin: 0;
  }

  .image-container {
    width: 100%;
    max-width: 200px;
  }

  .image-container img {
    width: 100%;
    border-radius: 0.75rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  .answer-area {
    width: 100%;
    padding: 1.5rem;
    background: #f8fafc;
    border: 3px solid #e2e8f0;
    border-radius: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    transition: all 0.3s;
  }

  .answer-area.correct {
    border-color: #22c55e;
    background: #f0fdf4;
  }

  .answer-area.wrong {
    border-color: #ef4444;
    background: #fef2f2;
    animation: shake 0.3s;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }

  .letter-slots {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .letter-slot {
    width: 48px;
    height: 56px;
    border: 2px dashed #cbd5e1;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    background: white;
    transition: all 0.2s;
  }

  .letter-slot.filled {
    border-style: solid;
    border-color: #3b82f6;
    background: #eff6ff;
    cursor: pointer;
  }

  .letter-slot.filled:hover {
    background: #dbeafe;
    transform: scale(1.05);
  }

  .clear-btn {
    font-size: 0.85rem;
    color: #ef4444;
    background: none;
    border: 1px solid #ef4444;
    border-radius: 0.5rem;
    padding: 0.5rem 1rem;
    cursor: pointer;
  }

  .clear-btn:hover {
    background: #fef2f2;
  }

  .letters-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: center;
    max-width: 320px;
  }

  .letter-btn {
    width: 52px;
    height: 52px;
    border: 2px solid #e2e8f0;
    border-radius: 0.75rem;
    background: white;
    font-size: 1.4rem;
    font-weight: 700;
    color: #1e293b;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }

  .letter-btn:hover:not(:disabled) {
    border-color: #3b82f6;
    background: #eff6ff;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }

  .letter-btn:active:not(:disabled) {
    transform: translateY(0);
  }

  .letter-btn.used {
    opacity: 0.3;
    cursor: default;
    transform: none;
  }

  .success-section {
    width: 100%;
    padding: 1.5rem;
    background: #f0fdf4;
    border: 2px solid #86efac;
    border-radius: 0.75rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }

  .word-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .correct-word {
    font-size: 1.5rem;
    font-weight: 700;
    color: #15803d;
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
    width: 100%;
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

  .feedback-text.error {
    color: #b91c1c;
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
  }

  .retry-btn:hover {
    background: #dc2626;
  }
</style>
