<script lang="ts">
  import { db } from "$lib/db";
  import { liveQuery } from "dexie";
  import { playText } from "$lib/utils/audio";

  // Real-time query of vocabulary list
  let vocabList = liveQuery(() => db.vocab.toArray());
</script>

<div class="vocab-page">
  <header class="header">
    <h1>Your Vocabulary</h1>
    <p>Words you have saved.</p>
  </header>

  {#if $vocabList}
    <div class="grid">
      {#each $vocabList as item (item.id)}
        <div class="card">
          <div class="word-col">
            <div class="word-row">
              <h3>{item.word}</h3>
              <button class="audio-btn-mini" on:click={() => playText(item.word)}>🔊</button>
            </div>
            <span class="translation">{item.translation}</span>
          </div>
          {#if item.example}
            <p class="example">{item.example}</p>
          {/if}
        </div>
      {:else}
        <div class="empty-state">
          <p>No words saved yet.</p>
          <a href="/" class="start-btn">Start Learning</a>
        </div>
      {/each}
    </div>
  {:else}
    <p>Loading...</p>
  {/if}
</div>

<style>
  .vocab-page {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  .header {
    margin-bottom: 2rem;
    text-align: center;
  }

  .header h1 {
    font-size: 2rem;
    color: #1e293b;
  }

  .grid {
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }

  .card {
    background: white;
    padding: 1.25rem;
    border: 1px solid #e2e8f0;
    border-radius: 1rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }

  .word-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .audio-btn-mini {
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 1rem;
    padding: 0.2rem;
    border-radius: 50%;
  }
  .audio-btn-mini:hover {
    background: #f1f5f9;
  }

  .word-col h3 {
    font-size: 1.25rem;
    color: #1e293b;
    margin-bottom: 0.25rem;
  }

  .translation {
    color: #64748b;
    font-size: 1rem;
  }

  .example {
    margin-top: 0.75rem;
    font-size: 0.9rem;
    color: #475569;
    font-style: italic;
    border-top: 1px solid #f1f5f9;
    padding-top: 0.5rem;
  }

  .empty-state {
    grid-column: 1 / -1;
    text-align: center;
    padding: 3rem;
    background: #f8fafc;
    border-radius: 1rem;
    color: #64748b;
  }

  .start-btn {
    display: inline-block;
    margin-top: 1rem;
    padding: 0.6rem 1.2rem;
    background: #3b82f6;
    color: white;
    text-decoration: none;
    border-radius: 999px;
  }
</style>
