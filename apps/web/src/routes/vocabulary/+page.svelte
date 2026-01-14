<script lang="ts">
  import { db } from "$lib/db";
  import { liveQuery } from "dexie";
  import { playText } from "$lib/utils/audio";

  // Real-time query of vocabulary list
  let vocabList = liveQuery(() => db.vocab.toArray());

  // Count stats
  $: totalWords = $vocabList?.length ?? 0;
</script>

<svelte:head>
  <title>واژگان من - Deutschlern</title>
</svelte:head>

<div class="vocab-page" dir="rtl">
  <header class="header">
    <div class="header-icon">📚</div>
    <h1 class="title">واژگان شما</h1>
    <p class="subtitle">کلماتی که در مسیر یادگیری ذخیره کرده‌اید</p>

    {#if totalWords > 0}
      <div class="stats-badge">
        <span class="stats-icon">📖</span>
        <span class="stats-value">{totalWords}</span>
        <span class="stats-label">واژه</span>
      </div>
    {/if}
  </header>

  {#if $vocabList}
    <div class="grid">
      {#each $vocabList as item (item.id)}
        <div class="card">
          <div class="card-header">
            <div class="word-info">
              <h3 class="word">{item.word}</h3>
              <span class="translation">{item.translation}</span>
            </div>
            <button
              class="audio-btn"
              on:click={() => playText(item.word)}
              title="پخش تلفظ"
            >
              <span class="audio-icon">🔊</span>
            </button>
          </div>
          {#if item.example}
            <div class="example-section">
              <span class="example-label">مثال:</span>
              <p class="example">{item.example}</p>
            </div>
          {/if}
        </div>
      {:else}
        <div class="empty-state">
          <div class="empty-icon">📭</div>
          <h2 class="empty-title">هنوز واژه‌ای ندارید</h2>
          <p class="empty-desc">با شروع درس‌ها، واژه‌های جدید اینجا ذخیره می‌شوند.</p>
          <a href="/" class="start-btn">
            <span>🚀</span>
            <span>شروع یادگیری</span>
          </a>
        </div>
      {/each}
    </div>
  {:else}
    <div class="loading-state">
      <div class="spinner"></div>
      <p>در حال بارگذاری...</p>
    </div>
  {/if}
</div>

<style>
  .vocab-page {
    max-width: 900px;
    margin: 0 auto;
    padding: var(--space-6, 1.5rem) var(--space-4, 1rem);
  }

  /* Header */
  .header {
    margin-bottom: var(--space-8, 2rem);
    text-align: center;
  }

  .header-icon {
    font-size: 3rem;
    margin-bottom: var(--space-3, 0.75rem);
    animation: bounce-subtle 0.6s ease-in-out;
  }

  @keyframes bounce-subtle {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }

  .title {
    font-size: var(--text-2xl, 1.5rem);
    font-weight: var(--font-extrabold, 800);
    margin: 0 0 var(--space-2, 0.5rem);
    background: linear-gradient(135deg, var(--color-xp-500, #4f46e5), var(--color-primary-500, #0891b2));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .subtitle {
    color: var(--color-neutral-500, #78716c);
    font-size: var(--text-base, 1rem);
    margin: 0;
  }

  .stats-badge {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2, 0.5rem);
    margin-top: var(--space-4, 1rem);
    padding: var(--space-2, 0.5rem) var(--space-4, 1rem);
    background: linear-gradient(135deg, var(--color-xp-100, #e0e7ff), var(--color-xp-50, #eef2ff));
    border: 2px solid var(--color-xp-300, #a5b4fc);
    border-radius: var(--radius-full, 9999px);
  }

  .stats-icon {
    font-size: 1rem;
  }

  .stats-value {
    font-size: var(--text-lg, 1.125rem);
    font-weight: var(--font-bold, 700);
    color: var(--color-xp-600, #4338ca);
  }

  .stats-label {
    font-size: var(--text-sm, 0.875rem);
    color: var(--color-xp-500, #4f46e5);
  }

  /* Grid */
  .grid {
    display: grid;
    gap: var(--space-4, 1rem);
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }

  /* Card */
  .card {
    background: var(--glass-bg, rgba(253, 251, 247, 0.85));
    padding: var(--space-4, 1rem);
    border: 1px solid var(--glass-border, rgba(212, 201, 185, 0.3));
    border-radius: var(--radius-xl, 1rem);
    backdrop-filter: blur(var(--glass-blur, 12px));
    transition: all var(--transition-normal, 200ms);
  }

  .card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md, 0 4px 15px rgba(0, 0, 0, 0.08));
    border-color: var(--color-primary-300, #67e8f9);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--space-3, 0.75rem);
  }

  .word-info {
    flex: 1;
  }

  .word {
    font-size: var(--text-xl, 1.25rem);
    font-weight: var(--font-bold, 700);
    color: var(--color-neutral-800, #292524);
    margin: 0 0 var(--space-1, 0.25rem);
  }

  .translation {
    color: var(--color-neutral-500, #78716c);
    font-size: var(--text-base, 1rem);
  }

  .audio-btn {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-primary-100, #cffafe);
    border: none;
    border-radius: var(--radius-lg, 0.75rem);
    cursor: pointer;
    transition: all var(--transition-normal, 200ms);
    flex-shrink: 0;
  }

  .audio-btn:hover {
    background: var(--color-primary-200, #a5f3fc);
    transform: scale(1.05);
  }

  .audio-btn:active {
    transform: scale(0.95);
  }

  .audio-icon {
    font-size: 1.1rem;
  }

  .example-section {
    margin-top: var(--space-3, 0.75rem);
    padding-top: var(--space-3, 0.75rem);
    border-top: 1px solid var(--glass-border, rgba(212, 201, 185, 0.3));
  }

  .example-label {
    font-size: var(--text-xs, 0.75rem);
    font-weight: var(--font-semibold, 600);
    color: var(--color-neutral-400, #a69b8a);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .example {
    margin: var(--space-1, 0.25rem) 0 0;
    font-size: var(--text-sm, 0.875rem);
    color: var(--color-neutral-600, #57534e);
    font-style: italic;
    line-height: 1.6;
  }

  /* Empty State */
  .empty-state {
    grid-column: 1 / -1;
    text-align: center;
    padding: var(--space-8, 2rem);
    background: var(--glass-bg, rgba(253, 251, 247, 0.85));
    border: 1px solid var(--glass-border, rgba(212, 201, 185, 0.3));
    border-radius: var(--radius-2xl, 1.5rem);
    backdrop-filter: blur(var(--glass-blur, 12px));
  }

  .empty-icon {
    font-size: 4rem;
    margin-bottom: var(--space-4, 1rem);
  }

  .empty-title {
    font-size: var(--text-xl, 1.25rem);
    font-weight: var(--font-bold, 700);
    color: var(--color-neutral-700, #44403c);
    margin: 0 0 var(--space-2, 0.5rem);
  }

  .empty-desc {
    color: var(--color-neutral-500, #78716c);
    margin: 0 0 var(--space-6, 1.5rem);
  }

  .start-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2, 0.5rem);
    padding: var(--space-3, 0.75rem) var(--space-6, 1.5rem);
    background: linear-gradient(135deg, var(--color-primary-500, #0891b2), var(--color-primary-600, #0e7490));
    color: white;
    text-decoration: none;
    border-radius: var(--radius-full, 9999px);
    font-weight: var(--font-semibold, 600);
    transition: all var(--transition-normal, 200ms);
    box-shadow: 0 4px 15px rgba(8, 145, 178, 0.3);
    min-height: 48px;
  }

  .start-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(8, 145, 178, 0.4);
  }

  /* Loading State */
  .loading-state {
    text-align: center;
    padding: var(--space-8, 2rem);
    color: var(--color-neutral-500, #78716c);
  }

  .spinner {
    width: 48px;
    height: 48px;
    border: 4px solid var(--color-neutral-200, #e8e0d5);
    border-top-color: var(--color-primary-500, #0891b2);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto var(--space-4, 1rem);
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Dark Mode */
  :global([data-theme="dark"]) .title {
    background: linear-gradient(135deg, var(--color-xp-400, #818cf8), var(--color-primary-400, #22d3ee));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  :global([data-theme="dark"]) .stats-badge {
    background: linear-gradient(135deg, rgba(79, 70, 229, 0.2), rgba(79, 70, 229, 0.1));
    border-color: var(--color-xp-500, #4f46e5);
  }

  :global([data-theme="dark"]) .stats-value {
    color: var(--color-xp-400, #818cf8);
  }

  :global([data-theme="dark"]) .stats-label {
    color: var(--color-xp-300, #a5b4fc);
  }

  :global([data-theme="dark"]) .card {
    background: rgba(28, 25, 23, 0.85);
    border-color: rgba(68, 64, 60, 0.3);
  }

  :global([data-theme="dark"]) .card:hover {
    border-color: var(--color-primary-500, #0891b2);
  }

  :global([data-theme="dark"]) .word {
    color: var(--color-neutral-100, #f5f0e8);
  }

  :global([data-theme="dark"]) .audio-btn {
    background: rgba(8, 145, 178, 0.2);
  }

  :global([data-theme="dark"]) .audio-btn:hover {
    background: rgba(8, 145, 178, 0.3);
  }

  :global([data-theme="dark"]) .empty-state {
    background: rgba(28, 25, 23, 0.85);
    border-color: rgba(68, 64, 60, 0.3);
  }

  :global([data-theme="dark"]) .empty-title {
    color: var(--color-neutral-100, #f5f0e8);
  }

  /* Mobile Responsive */
  @media (max-width: 600px) {
    .vocab-page {
      padding: var(--space-4, 1rem);
    }

    .grid {
      grid-template-columns: 1fr;
    }

    .header-icon {
      font-size: 2.5rem;
    }

    .title {
      font-size: var(--text-xl, 1.25rem);
    }
  }
</style>
