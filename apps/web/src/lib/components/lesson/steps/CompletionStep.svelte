<script lang="ts">
  import type { CompletionStep } from "@pkg/content-model";
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
    padding: 2rem;
    gap: 1.5rem;
  }

  .celebration-icon {
    font-size: 4rem;
    animation: bounce 0.6s ease-in-out infinite alternate;
  }

  @keyframes bounce {
    from { transform: translateY(0); }
    to { transform: translateY(-10px); }
  }

  .message {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
    direction: rtl;
  }

  .vocabulary-section {
    width: 100%;
    max-width: 400px;
    background: #f8fafc;
    border-radius: 1rem;
    padding: 1.5rem;
  }

  .vocab-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #475569;
    margin: 0 0 1rem 0;
    direction: rtl;
  }

  .vocab-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .vocab-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background: white;
    border-radius: 0.5rem;
    border: 1px solid #e2e8f0;
  }

  .vocab-de {
    font-weight: 600;
    color: #1e293b;
  }

  .vocab-fa {
    color: #64748b;
    direction: rtl;
  }

  .stats-section {
    display: flex;
    gap: 2rem;
    padding: 1rem;
  }

  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }

  .stat-icon {
    font-size: 2rem;
  }

  .stat-label {
    font-size: 0.85rem;
    color: #64748b;
  }

  .stat-value {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1e293b;
  }
</style>
