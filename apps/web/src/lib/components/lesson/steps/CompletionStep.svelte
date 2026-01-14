<script lang="ts">
  import type { CompletionStep } from "$lib/content-model";
  import { createEventDispatcher } from "svelte";

  export let step: CompletionStep;
  export let lessonId: string = '';

  const dispatch = createEventDispatcher();

  // Dispatch that we're done (allow continue)
  dispatch('answer', {
    correct: true,
    allowContinue: true
  });
</script>

<div class="completion-container">
  <div class="celebration-icon">&#127881;</div>

  <h2 class="message">{step.message || 'آفرین! درس تمام شد!'}</h2>

  {#if step.vocabularyLearned && step.vocabularyLearned.length > 0}
    <div class="vocabulary-section">
      <h3 class="vocab-title">واژگان یاد گرفته شده:</h3>
      <div class="vocab-list">
        {#each step.vocabularyLearned as item}
          <div class="vocab-item">
            <span class="vocab-de">{item.word.de}</span>
            <span class="vocab-fa">{item.word.fa}</span>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  {#if step.stats}
    <div class="stats-section">
      {#if step.stats.starsEarned}
        <div class="stat">
          <span class="stat-icon">&#11088;</span>
          <span class="stat-value">{step.stats.starsEarned}</span>
        </div>
      {/if}
      {#if step.stats.scorePercentage}
        <div class="stat">
          <span class="stat-label">امتیاز:</span>
          <span class="stat-value">{step.stats.scorePercentage}%</span>
        </div>
      {/if}
      {#if step.stats.newVocabCount}
        <div class="stat">
          <span class="stat-label">واژه جدید:</span>
          <span class="stat-value">{step.stats.newVocabCount}</span>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .completion-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: var(--space-8, 2rem);
    gap: var(--space-6, 1.5rem);
  }

  .celebration-icon {
    font-size: 5rem;
    animation: bounce 0.6s ease-in-out infinite alternate, glow 2s ease-in-out infinite;
    filter: drop-shadow(0 0 15px var(--color-success-glow, rgba(234, 179, 8, 0.5)));
  }

  @keyframes bounce {
    from { transform: translateY(0); }
    to { transform: translateY(-12px); }
  }

  @keyframes glow {
    0%, 100% { filter: drop-shadow(0 0 15px rgba(234, 179, 8, 0.5)); }
    50% { filter: drop-shadow(0 0 25px rgba(234, 179, 8, 0.8)); }
  }

  .message {
    font-size: var(--text-2xl, 1.5rem);
    font-weight: var(--font-bold, 700);
    background: linear-gradient(135deg, var(--color-success-600, #ca8a04), var(--color-success-500, #eab308));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
    direction: rtl;
  }

  .vocabulary-section {
    width: 100%;
    max-width: 400px;
    background: var(--glass-bg, rgba(253, 251, 247, 0.85));
    border: 2px solid var(--color-success-400, #facc15);
    border-radius: var(--radius-xl, 1rem);
    padding: var(--space-6, 1.5rem);
    backdrop-filter: blur(var(--glass-blur, 12px));
  }

  .vocab-title {
    font-size: var(--text-lg, 1.125rem);
    font-weight: var(--font-semibold, 600);
    color: var(--color-success-700, #a16207);
    margin: 0 0 var(--space-4, 1rem) 0;
    direction: rtl;
  }

  .vocab-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-3, 0.75rem);
  }

  .vocab-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-3, 0.75rem) var(--space-4, 1rem);
    background: var(--color-neutral-50, #fdfbf7);
    border-radius: var(--radius-md, 0.5rem);
    border: 1px solid var(--glass-border, rgba(212, 201, 185, 0.3));
    transition: all var(--transition-fast, 150ms);
  }

  .vocab-item:hover {
    transform: translateX(-4px);
    border-color: var(--color-primary-300, #67e8f9);
    background: var(--color-primary-50, #ecfeff);
  }

  .vocab-de {
    font-weight: var(--font-semibold, 600);
    color: var(--color-neutral-800, #292524);
  }

  .vocab-fa {
    color: var(--color-neutral-500, #78716c);
    direction: rtl;
  }

  .stats-section {
    display: flex;
    gap: var(--space-6, 1.5rem);
    padding: var(--space-4, 1rem);
    flex-wrap: wrap;
    justify-content: center;
  }

  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-1, 0.25rem);
    padding: var(--space-4, 1rem);
    background: var(--glass-bg, rgba(253, 251, 247, 0.85));
    border-radius: var(--radius-lg, 0.75rem);
    border: 1px solid var(--glass-border, rgba(212, 201, 185, 0.3));
    min-width: 80px;
    transition: all var(--transition-fast, 150ms);
  }

  .stat:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-md, 0 4px 15px rgba(0, 0, 0, 0.08));
  }

  .stat-icon {
    font-size: 2.5rem;
  }

  .stat-label {
    font-size: var(--text-sm, 0.875rem);
    color: var(--color-neutral-500, #78716c);
  }

  .stat-value {
    font-size: var(--text-xl, 1.25rem);
    font-weight: var(--font-bold, 700);
    color: var(--color-primary-600, #0e7490);
  }

  /* Dark Mode */
  :global([data-theme="dark"]) .vocabulary-section {
    background: rgba(28, 25, 23, 0.85);
  }

  :global([data-theme="dark"]) .vocab-item {
    background: rgba(28, 25, 23, 0.95);
  }

  :global([data-theme="dark"]) .vocab-de {
    color: var(--color-neutral-100, #f5f0e8);
  }

  :global([data-theme="dark"]) .stat {
    background: rgba(28, 25, 23, 0.85);
  }

  :global([data-theme="dark"]) .stat-value {
    color: var(--color-primary-400, #22d3ee);
  }
</style>
