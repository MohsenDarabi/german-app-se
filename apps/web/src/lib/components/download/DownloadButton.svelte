<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import * as contentService from "$lib/services/contentService";
  import { isPremium } from "$lib/stores/premium";

  export let lessonId: string;
  export let disabled: boolean = false;

  const dispatch = createEventDispatcher<{ downloaded: { lessonId: string }; error: { lessonId: string; error: string }; premiumRequired: void }>();

  let isDownloading = false;
  let isDownloaded = false;
  let error: string | null = null;

  // Check if already cached on mount
  onMount(() => {
    contentService.isContentCached(lessonId).then(cached => {
      isDownloaded = cached;
    });
  });

  async function handleDownload() {
    if (!$isPremium) {
      error = "اشتراک پریمیوم لازم است";
      dispatch("premiumRequired");
      return;
    }

    if (isDownloading || isDownloaded) return;

    isDownloading = true;
    error = null;

    try {
      await contentService.downloadLesson(lessonId, true);
      isDownloaded = true;
      dispatch("downloaded", { lessonId });
    } catch (e) {
      error = e instanceof Error ? e.message : "خطا در دانلود";
      dispatch("error", { lessonId, error });
    } finally {
      isDownloading = false;
    }
  }
</script>

<button
  class="download-btn"
  class:downloading={isDownloading}
  class:downloaded={isDownloaded}
  class:disabled={disabled || !$isPremium}
  on:click={handleDownload}
  disabled={disabled || isDownloading}
  title={isDownloaded ? "دانلود شده" : $isPremium ? "دانلود برای آفلاین" : "فقط پریمیوم"}
>
  {#if isDownloading}
    <!-- Spinner -->
    <svg class="spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10" stroke-dasharray="62.83" stroke-dashoffset="15.7" />
    </svg>
  {:else if isDownloaded}
    <!-- Checkmark -->
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  {:else}
    <!-- Cloud Download Icon -->
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M12 12v9" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="m8 17 4 4 4-4" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  {/if}
</button>

{#if error}
  <span class="error-tooltip">{error}</span>
{/if}

<style>
  .download-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    padding: 6px;
    border: none;
    border-radius: 8px;
    background: var(--color-surface-elevated, #f5f5f5);
    color: var(--color-primary, #4CAF50);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .download-btn:hover:not(.disabled):not(.downloaded) {
    background: var(--color-primary, #4CAF50);
    color: white;
    transform: scale(1.05);
  }

  .download-btn.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    color: var(--color-text-muted, #999);
  }

  .download-btn.downloaded {
    background: var(--color-success-bg, #e8f5e9);
    color: var(--color-success, #4CAF50);
  }

  .download-btn.downloading {
    cursor: wait;
  }

  .download-btn svg {
    width: 20px;
    height: 20px;
  }

  .spinner {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .error-tooltip {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    padding: 4px 8px;
    background: var(--color-error, #f44336);
    color: white;
    font-size: 12px;
    border-radius: 4px;
    white-space: nowrap;
    z-index: 10;
  }
</style>
