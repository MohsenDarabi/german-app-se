<script lang="ts">
  import type { VocabItem } from '$lib/db';
  import { playText } from '$lib/utils/audio';

  export let card: VocabItem;
  export let onGrade: (wasCorrect: boolean) => void;

  let isFlipped = false;

  function toggleFlip() {
    isFlipped = !isFlipped;
  }

  function handleAudio(event: Event) {
    event.stopPropagation();
    playText(card.word, 'de-DE');
  }

  function handleGrade(correct: boolean, event: Event) {
    event.stopPropagation();
    onGrade(correct);
    isFlipped = false; // Reset for next card
  }
</script>

<div class="flashcard-wrapper">
  <div class="flashcard" class:flipped={isFlipped} on:click={toggleFlip} on:keydown={(e) => e.key === 'Enter' && toggleFlip()} role="button" tabindex="0">
    <div class="flashcard-inner">
      <div class="flashcard-front">
        <h2 class="word">{card.word}</h2>
        <button class="audio-btn" on:click={handleAudio} aria-label="Play pronunciation">
          🔊
        </button>
        <p class="hint">برای نمایش ترجمه کلیک کنید</p>
      </div>
      <div class="flashcard-back">
        <p class="translation">{card.translation}</p>
        {#if card.example}
          <div class="example-box">
            <p class="example-text">{card.example}</p>
            <p class="example-label">مثال</p>
          </div>
        {/if}
      </div>
    </div>
  </div>

  {#if isFlipped}
    <div class="grade-buttons">
      <button class="wrong-btn" on:click={(e) => handleGrade(false, e)}>
        ❌ اشتباه
        <span class="btn-subtitle">بازگشت به جعبه ۱</span>
      </button>
      <button class="correct-btn" on:click={(e) => handleGrade(true, e)}>
        ✅ صحیح
        <span class="btn-subtitle">جعبه بعدی</span>
      </button>
    </div>
  {/if}
</div>

<style>
  .flashcard-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
  }

  .flashcard {
    perspective: 1000px;
    width: 100%;
    height: 300px;
    cursor: pointer;
  }

  .flashcard-inner {
    position: relative;
    width: 100%;
    height: 100%;
    transition: transform 0.6s;
    transform-style: preserve-3d;
  }

  .flashcard.flipped .flashcard-inner {
    transform: rotateY(180deg);
  }

  .flashcard-front,
  .flashcard-back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    border-radius: 1rem;
    border: 2px solid #e2e8f0;
    background: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .flashcard-front {
    background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  }

  .flashcard-front .word {
    font-size: 2.5rem;
    font-weight: 800;
    color: #1e293b;
    margin-bottom: 1rem;
  }

  .flashcard-front .audio-btn {
    background: #e0f2fe;
    border: none;
    border-radius: 50%;
    width: 3rem;
    height: 3rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    transition: background 0.2s;
    margin-bottom: 1rem;
  }

  .flashcard-front .audio-btn:hover {
    background: #bae6fd;
  }

  .flashcard-front .hint {
    font-size: 0.875rem;
    color: #94a3b8;
    font-style: italic;
  }

  .flashcard-back {
    background: linear-gradient(135deg, #eff6ff 0%, #ffffff 100%);
    transform: rotateY(180deg);
  }

  .flashcard-back .translation {
    font-size: 2rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 1rem;
    text-align: center;
  }

  .example-box {
    margin-top: 1rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.7);
    border-radius: 0.5rem;
    border: 1px solid #e0e7ff;
    text-align: center;
  }

  .example-text {
    font-size: 1rem;
    color: #475569;
    font-style: italic;
    margin-bottom: 0.5rem;
  }

  .example-label {
    font-size: 0.75rem;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .grade-buttons {
    display: flex;
    gap: 1rem;
    width: 100%;
  }

  .wrong-btn,
  .correct-btn {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 1rem 1.5rem;
    border: none;
    border-radius: 999px;
    font-weight: 700;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-subtitle {
    font-size: 0.75rem;
    font-weight: 500;
    opacity: 0.8;
  }

  .wrong-btn {
    background: #fee2e2;
    color: #991b1b;
  }

  .wrong-btn:hover {
    background: #fecaca;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(153, 27, 27, 0.2);
  }

  .correct-btn {
    background: #22c55e;
    color: white;
  }

  .correct-btn:hover {
    background: #16a34a;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(34, 197, 94, 0.3);
  }

  @media (max-width: 600px) {
    .flashcard {
      height: 250px;
    }

    .flashcard-front .word,
    .flashcard-back .translation {
      font-size: 1.75rem;
    }

    .grade-buttons {
      flex-direction: column;
    }
  }
</style>
