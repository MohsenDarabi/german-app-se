<script lang="ts">
  import type { NewWordStep } from "@pkg/content-model";
  import { db } from "$lib/db";
  import { onMount } from "svelte";
  import { liveQuery } from "dexie";
  import { playText } from "$lib/utils/audio";

  export let step: NewWordStep;

  let isSaved = false;

  // Check if word is already in DB
  onMount(async () => {
    const exists = await db.vocab.where('word').equals(step.word.de).first();
    isSaved = !!exists;

    // Pre-load voices fix for Chrome
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
       window.speechSynthesis.getVoices();
    }
  });

  async function toggleSave() {
    if (isSaved) {
      await db.vocab.where('word').equals(step.word.de).delete();
      isSaved = false;
    } else {
      await db.vocab.add({
        word: step.word.de,
        translation: step.word.fa,
        example: step.example?.text.de,
        addedAt: new Date(),
        srsLevel: 0,
        nextReview: new Date() // Due immediately for first review
      });
      isSaved = true;
    }
  }

  function playAudio() {
    playText(step.word.de, 'de-DE');
  }
</script>

<div class="card-container">
  <div class="image-area">
    <!-- Placeholder for image -->
    {#if step.image}
      <img src={step.image} alt={step.word.de} class="vocab-image" />
    {:else}
      <div class="image-placeholder">
        <span>🖼️</span>
      </div>
    {/if}
  </div>

  <div class="content-area">
    <div class="word-row">
      <h2 class="german-word">{step.word.de}</h2>
      <button class="audio-btn" on:click={playAudio} aria-label="Play Audio">
        🔊
      </button>
    </div>

    <p class="translation">{step.word.fa}</p>

    <button
      class="save-btn"
      class:saved={isSaved}
      on:click={toggleSave}
    >
      {isSaved ? '✅ Saved' : '➕ Add to Vocab'}
    </button>

    {#if step.example}
      <div class="sentence-box">
        <p class="sentence-text">{step.example.text.de}</p>
        <p class="sentence-translation">{step.example.text.fa}</p>
        <p class="sentence-label">مثال در جمله</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .card-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    text-align: center;
  }

  .image-area {
    display: flex;
    justify-content: center;
  }

  .vocab-image {
    max-width: 100%;
    border-radius: 1rem;
    height: 200px;
    object-fit: cover;
  }

  .image-placeholder {
    width: 100%;
    height: 180px;
    background: #f1f5f9;
    border-radius: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
    color: #cbd5e1;
  }

  .content-area {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
  }

  .word-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .german-word {
    font-size: 2rem;
    font-weight: 800;
    color: #1e293b;
  }

  .audio-btn {
    background: #e0f2fe;
    border: none;
    border-radius: 50%;
    width: 2.5rem;
    height: 2.5rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    transition: background 0.2s;
  }

  .audio-btn:hover {
    background: #bae6fd;
  }

  .translation {
    font-size: 1.25rem;
    color: #64748b;
    font-weight: 500;
  }

  .save-btn {
    margin-top: 0.5rem;
    padding: 0.5rem 1.2rem;
    border: 2px solid #3b82f6;
    background: transparent;
    color: #3b82f6;
    border-radius: 999px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .save-btn.saved {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
  }

  .sentence-box {
    margin-top: 1.5rem;
    background: #f8fafc;
    padding: 1rem;
    border-radius: 0.75rem;
    border: 1px solid #e2e8f0;
    width: 100%;
  }

  .sentence-text {
    font-size: 1.1rem;
    color: #334155;
    font-style: italic;
    margin-bottom: 0.25rem;
  }

  .sentence-translation {
    font-size: 0.95rem;
    color: #64748b;
    margin-bottom: 0.5rem;
  }

  .sentence-label {
    font-size: 0.8rem;
    color: #94a3b8;
  }
</style>