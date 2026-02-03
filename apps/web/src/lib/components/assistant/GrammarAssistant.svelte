<script lang="ts">
  import type { Lesson } from "@pkg/content-model";
  import { slide, fly } from "svelte/transition";
  import { isAssistantOpen, activeTab, toggleAssistant, closeAssistant } from "./assistantStore";
  import ContentOverview from "./ContentOverview.svelte";

  export let lesson: Lesson;
  export let currentStep: number = 0;

  // Get vocabulary from lesson
  $: vocabulary = lesson.vocabulary || [];
</script>

<!-- Floating Button -->
<button
  class="floating-btn"
  class:open={$isAssistantOpen}
  on:click={toggleAssistant}
  aria-label="Grammar Assistant"
>
  {#if $isAssistantOpen}
    ✕
  {:else}
    📚
  {/if}
</button>

<!-- Assistant Panel -->
{#if $isAssistantOpen}
  <div class="assistant-backdrop" on:click={closeAssistant} transition:fade={{ duration: 200 }}></div>
  <div class="assistant-panel" transition:fly={{ x: 300, duration: 300 }}>
    <div class="panel-header">
      <h2 class="panel-title">دستیار گرامر</h2>
      <button class="close-btn" on:click={closeAssistant}>✕</button>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button
        class="tab"
        class:active={$activeTab === 'overview'}
        on:click={() => activeTab.set('overview')}
      >
        📖 واژگان
      </button>
      <button
        class="tab"
        class:active={$activeTab === 'chat'}
        on:click={() => activeTab.set('chat')}
      >
        💬 پرسش
      </button>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      {#if $activeTab === 'overview'}
        <ContentOverview {vocabulary} />
      {:else}
        <div class="chat-tab" dir="rtl">
          <div class="chat-placeholder">
            <span class="chat-icon">🤖</span>
            <p class="chat-message">سوالات گرامری خود را بپرسید!</p>
            <p class="chat-hint">این قابلیت به زودی فعال می‌شود.</p>
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}

<script context="module">
  import { fade } from "svelte/transition";
</script>

<style>
  /* Floating Button */
  .floating-btn {
    position: fixed;
    bottom: 100px;
    left: 20px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: linear-gradient(135deg, #8b5cf6, #6366f1);
    color: white;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
    transition: all 0.3s;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .floating-btn:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(139, 92, 246, 0.5);
  }

  .floating-btn.open {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
  }

  /* Backdrop */
  .assistant-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: 1001;
  }

  /* Panel */
  .assistant-panel {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 100%;
    max-width: 400px;
    background: var(--color-neutral-50, #fdfbf7);
    z-index: 1002;
    display: flex;
    flex-direction: column;
    box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15);
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.25rem;
    background: linear-gradient(135deg, #8b5cf6, #6366f1);
    color: white;
  }

  .panel-title {
    font-size: 1.125rem;
    font-weight: 700;
    margin: 0;
  }

  .close-btn {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.2s;
  }

  .close-btn:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  /* Tabs */
  .tabs {
    display: flex;
    border-bottom: 1px solid var(--color-neutral-200, #e8e0d5);
  }

  .tab {
    flex: 1;
    padding: 0.875rem;
    background: transparent;
    border: none;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--color-neutral-500, #78716c);
    cursor: pointer;
    transition: all 0.2s;
    border-bottom: 2px solid transparent;
  }

  .tab:hover {
    background: var(--color-neutral-100, #f5f0e8);
  }

  .tab.active {
    color: #8b5cf6;
    border-bottom-color: #8b5cf6;
  }

  /* Tab Content */
  .tab-content {
    flex: 1;
    overflow: hidden;
  }

  /* Chat Placeholder */
  .chat-tab {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }

  .chat-placeholder {
    text-align: center;
  }

  .chat-icon {
    font-size: 3rem;
    display: block;
    margin-bottom: 1rem;
  }

  .chat-message {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--color-neutral-700, #44403c);
    margin: 0 0 0.5rem 0;
  }

  .chat-hint {
    font-size: 0.875rem;
    color: var(--color-neutral-500, #78716c);
    margin: 0;
  }

  /* Dark Mode */
  :global([data-theme="dark"]) .assistant-panel {
    background: #292524;
  }

  :global([data-theme="dark"]) .tabs {
    border-color: #44403c;
  }

  :global([data-theme="dark"]) .tab {
    color: #a69b8a;
  }

  :global([data-theme="dark"]) .tab:hover {
    background: #44403c;
  }

  :global([data-theme="dark"]) .tab.active {
    color: #c4b5fd;
    border-bottom-color: #8b5cf6;
  }

  :global([data-theme="dark"]) .chat-message {
    color: #f5f0e8;
  }

  :global([data-theme="dark"]) .chat-hint {
    color: #a69b8a;
  }

  /* Mobile adjustments */
  @media (max-width: 480px) {
    .assistant-panel {
      max-width: 100%;
    }

    .floating-btn {
      bottom: 80px;
      left: 15px;
      width: 50px;
      height: 50px;
      font-size: 1.3rem;
    }
  }
</style>
