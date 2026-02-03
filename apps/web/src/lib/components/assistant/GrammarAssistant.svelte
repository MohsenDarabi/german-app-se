<script lang="ts">
  import type { Lesson } from "@pkg/content-model";
  import { slide, fly } from "svelte/transition";
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import { isAssistantOpen, activeTab, toggleAssistant, closeAssistant } from "./assistantStore";
  import ContentOverview from "./ContentOverview.svelte";
  import ChatTab from "./ChatTab.svelte";

  export let lesson: Lesson;
  export let currentStep: number = 0;

  // Get vocabulary from lesson
  $: vocabulary = lesson.vocabulary || [];

  // Get lesson title for chat context
  $: lessonTitle = lesson.title?.fa || lesson.title?.de || '';

  // Draggable button state
  let buttonRef: HTMLButtonElement;
  let isDragging = false;
  let dragStartTime = 0;
  let startX = 0;
  let startY = 0;
  let buttonX = 20; // Default left position
  let buttonY = 100; // Default bottom offset (from bottom)

  const STORAGE_KEY = 'grammar-assistant-position';
  const DRAG_THRESHOLD = 150; // ms - if held longer than this, it's a drag

  onMount(() => {
    // Load saved position
    if (browser) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const pos = JSON.parse(saved);
          buttonX = pos.x ?? 20;
          buttonY = pos.y ?? 100;
        } catch {
          // Invalid JSON, use defaults
        }
      }
    }
  });

  function savePosition() {
    if (browser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ x: buttonX, y: buttonY }));
    }
  }

  function handlePointerDown(e: PointerEvent) {
    if ($isAssistantOpen) return; // Don't drag when panel is open

    isDragging = false;
    dragStartTime = Date.now();
    startX = e.clientX;
    startY = e.clientY;

    buttonRef.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: PointerEvent) {
    if (!buttonRef.hasPointerCapture(e.pointerId)) return;

    const elapsed = Date.now() - dragStartTime;
    const movedX = Math.abs(e.clientX - startX);
    const movedY = Math.abs(e.clientY - startY);

    // Start dragging if held long enough OR moved enough
    if (elapsed > DRAG_THRESHOLD || movedX > 10 || movedY > 10) {
      isDragging = true;

      // Calculate new position
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const btnSize = 56;

      // New X position (left edge)
      let newX = e.clientX - btnSize / 2;
      newX = Math.max(10, Math.min(windowWidth - btnSize - 10, newX));

      // New Y position (from bottom)
      let newY = windowHeight - e.clientY - btnSize / 2;
      newY = Math.max(70, Math.min(windowHeight - btnSize - 60, newY)); // Keep away from edges

      buttonX = newX;
      buttonY = newY;
    }
  }

  function handlePointerUp(e: PointerEvent) {
    if (buttonRef.hasPointerCapture(e.pointerId)) {
      buttonRef.releasePointerCapture(e.pointerId);
    }

    if (isDragging) {
      // Save the new position
      savePosition();
      isDragging = false;
    } else {
      // It was a click, not a drag
      toggleAssistant();
    }
  }
</script>

<!-- Floating Button (Draggable) -->
<button
  bind:this={buttonRef}
  class="floating-btn"
  class:open={$isAssistantOpen}
  class:dragging={isDragging}
  style="left: {buttonX}px; bottom: {buttonY}px;"
  on:pointerdown={handlePointerDown}
  on:pointermove={handlePointerMove}
  on:pointerup={handlePointerUp}
  on:pointercancel={handlePointerUp}
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
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
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
        <ChatTab
          lessonId={lesson.id}
          vocabulary={vocabulary}
          {lessonTitle}
        />
      {/if}
    </div>
  </div>
{/if}

<script context="module">
  import { fade } from "svelte/transition";
</script>

<style>
  /* Floating Button (Draggable) */
  .floating-btn {
    position: fixed;
    /* left and bottom are set via style attribute */
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: linear-gradient(135deg, #8b5cf6, #6366f1);
    color: white;
    border: none;
    font-size: 1.5rem;
    cursor: grab;
    box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
    transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    touch-action: none; /* Prevent scroll while dragging */
    user-select: none;
  }

  .floating-btn:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(139, 92, 246, 0.5);
  }

  .floating-btn.dragging {
    cursor: grabbing;
    transform: scale(1.15);
    box-shadow: 0 8px 25px rgba(139, 92, 246, 0.6);
    transition: none; /* No transition while dragging */
  }

  .floating-btn.open {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
    cursor: pointer;
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

  /* Mobile adjustments */
  @media (max-width: 480px) {
    .assistant-panel {
      max-width: 100%;
    }

    .floating-btn {
      width: 50px;
      height: 50px;
      font-size: 1.3rem;
    }
  }
</style>
