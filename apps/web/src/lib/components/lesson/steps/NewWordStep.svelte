<script lang="ts">
  import type { NewWordStep } from "$lib/content-model";
  import { db } from "$lib/db";
  import { onMount } from "svelte";
  import { liveQuery } from "dexie";
  import { playGerman } from "$lib/utils/audio";
  import BiDiText from "$lib/components/ui/BiDiText.svelte";
  import AudioButton from "$lib/components/ui/AudioButton.svelte";
  import { resolveMedia } from "$lib/utils/asset-resolver";

  export let step: NewWordStep;
  export let lessonId: string = '';

  let isSaved = false;
  let imageSrc: string | null = null;

  // Check if word is already in DB
  onMount(async () => {
    const exists = await db.vocab.where('word').equals(step.word.de).first();
    isSaved = !!exists;

    // Pre-load voices fix for Chrome
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
       window.speechSynthesis.getVoices();
    }
  });

  $: imageSrc = resolveMedia(step.imageId ?? step.image);

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

</script>

<div class="card-container">
  <div class="image-area">
    <!-- Placeholder for image -->
    {#if imageSrc}
      <img src={imageSrc} alt={step.word.de} class="vocab-image" />
    {:else}
      <div class="image-placeholder">
        <span>🖼️</span>
      </div>
    {/if}
  </div>

  <div class="content-area">
    <div class="word-row">
      <h2 class="german-word">{step.word.de}</h2>
      <AudioButton
        text={step.word.de}
        {lessonId}
        audioId="{step.id}-word"
        size="md"
      />
    </div>

    <p class="translation" dir="rtl"><BiDiText text={step.word.fa} /></p>

    <button
      class="save-btn"
      class:saved={isSaved}
      on:click={toggleSave}
    >
      {isSaved ? '✅ ذخیره شد' : '➕ افزودن به واژگان'}
    </button>

    {#if step.example}
      <div class="sentence-box">
        <div class="sentence-row">
          <p class="sentence-text">{step.example.text.de}</p>
          <AudioButton
            text={step.example.text.de}
            {lessonId}
            audioId="{step.id}-example"
            size="sm"
          />
        </div>
        <p class="sentence-translation" dir="rtl"><BiDiText text={step.example.text.fa} /></p>
        <p class="sentence-label">مثال در جمله</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .card-container {
    display: flex;
    flex-direction: column;
    gap: var(--space-4, 1rem);
    text-align: center;
    /* Remove borders - use spacing for visual hierarchy */
  }

  .image-area {
    display: flex;
    justify-content: center;
    padding: var(--space-4, 1rem);
  }

  .vocab-image {
    max-width: 200px;
    border-radius: var(--radius-xl, 1rem);
    height: auto;
    max-height: 160px;
    object-fit: cover;
    /* Soft shadow instead of border */
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  .image-placeholder {
    width: 160px;
    height: 120px;
    background: linear-gradient(135deg, var(--color-neutral-100, #f5f0e8), var(--color-neutral-200, #e8e0d5));
    border-radius: var(--radius-xl, 1rem);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    color: var(--color-neutral-300, #d4c9b9);
    /* Soft shadow instead of border */
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  }

  .content-area {
    display: flex;
    flex-direction: column;
    gap: var(--space-3, 0.75rem);
    align-items: center;
    padding: var(--space-2, 0.5rem) 0;
  }

  .word-row {
    display: flex;
    align-items: center;
    gap: var(--space-3, 0.75rem);
  }

  .german-word {
    font-size: var(--text-3xl, 2rem);
    font-weight: var(--font-extrabold, 800);
    color: var(--color-neutral-800, #292524);
    background: linear-gradient(135deg, var(--color-primary-600, #0e7490), var(--color-xp-600, #4338ca));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
  }

  .translation {
    font-size: var(--text-xl, 1.25rem);
    color: var(--color-neutral-500, #78716c);
    font-weight: var(--font-medium, 500);
    margin: 0;
  }

  .save-btn {
    margin-top: var(--space-2, 0.5rem);
    padding: var(--space-2, 0.5rem) var(--space-5, 1.25rem);
    border: 2px solid var(--color-primary-400, #22d3ee);
    background: transparent;
    color: var(--color-primary-600, #0e7490);
    border-radius: var(--radius-full, 9999px);
    font-weight: var(--font-semibold, 600);
    font-size: var(--text-sm, 0.875rem);
    cursor: pointer;
    transition: all var(--transition-normal, 200ms);
    min-height: 44px;
  }

  .save-btn:hover {
    background: var(--color-primary-50, #ecfeff);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(8, 145, 178, 0.15);
  }

  .save-btn.saved {
    background: linear-gradient(135deg, var(--color-primary-500, #0891b2), var(--color-primary-600, #0e7490));
    color: white;
    border-color: transparent;
    box-shadow: 0 4px 12px rgba(8, 145, 178, 0.3);
  }

  /* Example sentence - no border, just subtle background */
  .sentence-box {
    margin-top: var(--space-4, 1rem);
    padding: var(--space-4, 1rem) var(--space-3, 0.75rem);
    width: 100%;
    /* No border - use very subtle background tint */
    background: transparent;
    border-radius: var(--radius-lg, 0.75rem);
  }

  .sentence-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2, 0.5rem);
    margin-bottom: var(--space-2, 0.5rem);
  }

  .sentence-text {
    font-size: var(--text-base, 1rem);
    color: var(--color-neutral-600, #57534e);
    font-style: italic;
    margin: 0;
  }

  .sentence-translation {
    font-size: var(--text-sm, 0.875rem);
    color: var(--color-neutral-400, #a69b8a);
    margin: 0 0 var(--space-1, 0.25rem) 0;
  }

  .sentence-label {
    font-size: var(--text-xs, 0.75rem);
    color: var(--color-neutral-300, #d4c9b9);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: var(--font-medium, 500);
  }

  /* Dark Mode */
  :global([data-theme="dark"]) .image-placeholder {
    background: linear-gradient(135deg, var(--color-neutral-200, #44403c), var(--color-neutral-100, #292524));
    color: var(--color-neutral-400, #78716c);
  }

  :global([data-theme="dark"]) .german-word {
    background: linear-gradient(135deg, var(--color-primary-400, #22d3ee), var(--color-xp-400, #818cf8));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  :global([data-theme="dark"]) .sentence-text {
    color: var(--color-neutral-300, #d4c9b9);
  }

  :global([data-theme="dark"]) .sentence-translation {
    color: var(--color-neutral-500, #78716c);
  }
</style>
