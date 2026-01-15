<script lang="ts">
  import type { NewWordStep } from "@pkg/content-model";
  import { db } from "$lib/db";
  import { onMount } from "svelte";
  import BiDiText from "$lib/components/ui/BiDiText.svelte";
  import AudioButton from "$lib/components/ui/AudioButton.svelte";
  import { resolveMedia } from "$lib/utils/asset-resolver";

  export let step: NewWordStep;
  export let lessonId: string = '';

  let isSaved = false;
  let imageSrc: string | null = null;

  onMount(async () => {
    const exists = await db.vocab.where('word').equals(step.word.de).first();
    isSaved = !!exists;

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
        nextReview: new Date()
      });
      isSaved = true;
    }
  }
</script>

<div class="new-word-step">
  <!-- Header hint - RTL for proper punctuation placement -->
  <p class="hint" dir="rtl">یک کلمه جدید!</p>

  <!-- Image area - large, full width -->
  <div class="image-area">
    {#if imageSrc}
      <img src={imageSrc} alt={step.word.de} class="vocab-image" />
    {:else}
      <div class="image-placeholder">
        <span>🖼️</span>
      </div>
    {/if}
  </div>

  <!-- Word section -->
  <div class="word-section">
    <div class="word-row">
      <h2 class="german-word">{step.word.de}</h2>
      <AudioButton
        text={step.word.de}
        {lessonId}
        audioId="{step.id}-word"
        size="lg"
      />
    </div>
    <p class="translation" dir="rtl"><BiDiText text={step.word.fa} /></p>
  </div>

  <!-- Save button -->
  <button
    class="save-btn"
    class:saved={isSaved}
    on:click={toggleSave}
  >
    {isSaved ? '✅ ذخیره شد' : '➕ افزودن به واژگان'}
  </button>

  <!-- Example section -->
  {#if step.example}
    <div class="example-section">
      <div class="example-label">
        <span class="label-text">مثال</span>
        <AudioButton
          text={step.example.text.de}
          {lessonId}
          audioId="{step.id}-example"
          size="sm"
        />
      </div>
      <p class="example-de">{step.example.text.de}</p>
      <p class="example-fa" dir="rtl"><BiDiText text={step.example.text.fa} /></p>
    </div>
  {/if}
</div>

<style>
  /* Busuu-style clean layout - compact gaps for better space usage */
  .new-word-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: var(--space-3, 0.75rem);
    padding: 0;
  }

  /* Header hint - like Busuu's "Look, something new!" */
  .hint {
    font-size: var(--text-sm, 0.875rem);
    color: var(--color-primary-500, #0891b2);
    font-weight: var(--font-semibold, 600);
    margin: 0;
  }

  /* Image area - flexible sizing */
  .image-area {
    width: 100%;
    display: flex;
    justify-content: center;
    flex: 0 1 auto;
  }

  .vocab-image {
    width: auto;
    max-width: 100%;
    height: auto;
    max-height: 35vh;
    object-fit: contain;
    border-radius: var(--radius-xl, 1rem);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  }

  .image-placeholder {
    width: 200px;
    height: 150px;
    background: linear-gradient(135deg, var(--color-neutral-100, #f5f0e8), var(--color-neutral-200, #e8e0d5));
    border-radius: var(--radius-xl, 1rem);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  }

  /* Tablet+: larger images */
  @media (min-width: 768px) {
    .vocab-image {
      max-height: 40vh;
    }
  }

  /* Word section - prominent */
  .word-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-1, 0.25rem);
  }

  .word-row {
    display: flex;
    align-items: center;
    gap: var(--space-2, 0.5rem);
  }

  .german-word {
    font-size: var(--text-3xl, 1.875rem);
    font-weight: var(--font-extrabold, 800);
    color: var(--color-neutral-800, #292524);
    margin: 0;
    letter-spacing: -0.02em;
  }

  .translation {
    font-size: var(--text-base, 1rem);
    color: var(--color-neutral-500, #78716c);
    margin: 0;
  }

  /* Larger screens: bigger text */
  @media (min-width: 768px) {
    .german-word {
      font-size: var(--text-4xl, 2.25rem);
    }

    .translation {
      font-size: var(--text-lg, 1.125rem);
    }
  }

  /* Save button */
  .save-btn {
    padding: var(--space-2, 0.5rem) var(--space-6, 1.5rem);
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
    transform: scale(1.02);
  }

  .save-btn.saved {
    background: var(--color-primary-500, #0891b2);
    color: white;
    border-color: transparent;
  }

  /* Example section - clean separator */
  .example-section {
    width: 100%;
    padding-top: var(--space-3, 0.75rem);
    margin-top: var(--space-1, 0.25rem);
    border-top: 1px solid var(--color-neutral-200, #e8e0d5);
  }

  .example-label {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2, 0.5rem);
    margin-bottom: var(--space-1, 0.25rem);
  }

  .label-text {
    font-size: var(--text-sm, 0.875rem);
    color: var(--color-primary-500, #0891b2);
    font-weight: var(--font-semibold, 600);
  }

  .example-de {
    font-size: var(--text-lg, 1.125rem);
    color: var(--color-neutral-700, #44403c);
    margin: 0 0 var(--space-1, 0.25rem);
    font-weight: var(--font-medium, 500);
  }

  .example-fa {
    font-size: var(--text-base, 1rem);
    color: var(--color-neutral-400, #a69b8a);
    margin: 0;
  }

  /* Dark Mode */
  :global([data-theme="dark"]) .hint {
    color: #22d3ee;
  }

  :global([data-theme="dark"]) .image-placeholder {
    background: linear-gradient(135deg, #44403c, #292524);
  }

  :global([data-theme="dark"]) .german-word {
    color: #f5f0e8;
  }

  :global([data-theme="dark"]) .translation {
    color: #a69b8a;
  }

  :global([data-theme="dark"]) .save-btn {
    border-color: #0891b2;
    color: #22d3ee;
  }

  :global([data-theme="dark"]) .save-btn:hover {
    background: rgba(8, 145, 178, 0.2);
  }

  :global([data-theme="dark"]) .save-btn.saved {
    background: #0891b2;
    color: white;
  }

  :global([data-theme="dark"]) .example-section {
    border-color: #44403c;
  }

  :global([data-theme="dark"]) .label-text {
    color: #22d3ee;
  }

  :global([data-theme="dark"]) .example-de {
    color: #d4c9b9;
  }

  :global([data-theme="dark"]) .example-fa {
    color: #78716c;
  }
</style>
