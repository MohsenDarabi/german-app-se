<script lang="ts">
  import { onMount } from "svelte";
  import { getAllModulesForLanguage, type ModuleStub } from "$lib/data/modules";
  import * as contentService from "$lib/services/contentService";
  import { isPremium } from "$lib/stores/premium";
  import { selectedPair } from "$lib/stores/languagePreference";

  // Module selection state
  let selectedModules: Set<string> = new Set();
  let moduleDownloadStatus: Map<string, "pending" | "downloading" | "downloaded" | "error"> = new Map();
  let isDownloading = false;
  let downloadProgress = { current: 0, total: 0 };

  // Cache stats
  let cacheStats = { lessonCount: 0, totalSize: 0 };

  // Get modules for current language
  $: modules = getAllModulesForLanguage($selectedPair);
  $: allModules = [...modules.A1, ...modules.A2];

  onMount(async () => {
    // Load cache stats
    cacheStats = await contentService.getCacheStats();

    // Check which modules are already downloaded
    for (const module of allModules) {
      let allCached = true;
      for (const lesson of module.lessons) {
        const cached = await contentService.isContentCached(lesson.id);
        if (!cached) {
          allCached = false;
          break;
        }
      }
      if (allCached) {
        moduleDownloadStatus.set(module.id, "downloaded");
      }
    }
    moduleDownloadStatus = moduleDownloadStatus; // Trigger reactivity
  });

  function toggleModule(moduleId: string) {
    if (selectedModules.has(moduleId)) {
      selectedModules.delete(moduleId);
    } else {
      selectedModules.add(moduleId);
    }
    selectedModules = selectedModules; // Trigger reactivity
  }

  function selectAll() {
    allModules.forEach(m => {
      if (moduleDownloadStatus.get(m.id) !== "downloaded") {
        selectedModules.add(m.id);
      }
    });
    selectedModules = selectedModules;
  }

  function deselectAll() {
    selectedModules.clear();
    selectedModules = selectedModules;
  }

  // Calculate selected size
  $: selectedLessons = allModules
    .filter(m => selectedModules.has(m.id))
    .flatMap(m => m.lessons);
  $: estimatedSize = selectedLessons.length * 5; // ~5KB per lesson average

  async function downloadSelected() {
    if (!$isPremium || isDownloading || selectedLessons.length === 0) return;

    isDownloading = true;
    downloadProgress = { current: 0, total: selectedLessons.length };

    const modulesToDownload = allModules.filter(m => selectedModules.has(m.id));

    for (const module of modulesToDownload) {
      moduleDownloadStatus.set(module.id, "downloading");
      moduleDownloadStatus = moduleDownloadStatus;

      try {
        const lessonIds = module.lessons.map(l => l.id);
        await contentService.downloadModule(
          module.id,
          lessonIds,
          true,
          (current, total) => {
            downloadProgress.current++;
            downloadProgress = downloadProgress;
          }
        );
        moduleDownloadStatus.set(module.id, "downloaded");
        selectedModules.delete(module.id);
      } catch (e) {
        moduleDownloadStatus.set(module.id, "error");
        console.error(`Failed to download module ${module.id}:`, e);
      }
      moduleDownloadStatus = moduleDownloadStatus;
      selectedModules = selectedModules;
    }

    isDownloading = false;
    cacheStats = await contentService.getCacheStats();
  }

  async function clearCache() {
    if (confirm("آیا مطمئن هستید؟ تمام دروس دانلود شده پاک خواهند شد.")) {
      await contentService.clearCache();
      cacheStats = { lessonCount: 0, totalSize: 0 };
      moduleDownloadStatus.clear();
      moduleDownloadStatus = moduleDownloadStatus;
    }
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
</script>

<div class="download-manager">
  <header class="manager-header">
    <h2>دانلود دروس</h2>
    {#if !$isPremium}
      <span class="premium-badge">فقط پریمیوم</span>
    {/if}
  </header>

  {#if cacheStats.lessonCount > 0}
    <div class="cache-info">
      <span>{cacheStats.lessonCount} درس ذخیره شده ({formatSize(cacheStats.totalSize)})</span>
      <button class="clear-btn" on:click={clearCache}>پاک کردن</button>
    </div>
  {/if}

  <div class="module-list" class:disabled={!$isPremium}>
    {#each allModules as module}
      {@const status = moduleDownloadStatus.get(module.id)}
      {@const isSelected = selectedModules.has(module.id)}
      {@const isCompleted = status === "downloaded"}

      <div
        class="module-item"
        class:selected={isSelected}
        class:completed={isCompleted}
        class:downloading={status === "downloading"}
      >
        <label class="module-checkbox">
          <input
            type="checkbox"
            checked={isSelected || isCompleted}
            disabled={isCompleted || status === "downloading" || !$isPremium}
            on:change={() => toggleModule(module.id)}
          />
          <span class="checkbox-custom">
            {#if isCompleted}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            {:else if status === "downloading"}
              <span class="spinner"></span>
            {/if}
          </span>
        </label>

        <div class="module-info">
          <span class="module-title">{module.title}</span>
          <span class="module-meta">
            {module.lessons.length} درس
            {#if !isCompleted}
              (~{module.lessons.length * 5} KB)
            {/if}
          </span>
        </div>
      </div>
    {/each}
  </div>

  <div class="action-bar">
    <div class="selection-info">
      {#if selectedLessons.length > 0}
        <span>انتخاب شده: {selectedLessons.length} درس (~{estimatedSize} KB)</span>
      {:else}
        <span>یک یا چند بخش را انتخاب کنید</span>
      {/if}
    </div>

    <div class="action-buttons">
      {#if selectedModules.size === 0}
        <button class="select-btn" on:click={selectAll} disabled={!$isPremium}>
          انتخاب همه
        </button>
      {:else}
        <button class="select-btn" on:click={deselectAll}>
          لغو انتخاب
        </button>
      {/if}

      <button
        class="download-btn"
        on:click={downloadSelected}
        disabled={!$isPremium || isDownloading || selectedLessons.length === 0}
      >
        {#if isDownloading}
          در حال دانلود ({downloadProgress.current}/{downloadProgress.total})
        {:else}
          دانلود انتخاب شده‌ها
        {/if}
      </button>
    </div>
  </div>
</div>

<style>
  .download-manager {
    background: var(--color-surface, #fff);
    border-radius: 16px;
    padding: 20px;
    max-width: 500px;
    margin: 0 auto;
  }

  .manager-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .manager-header h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }

  .premium-badge {
    background: var(--color-warning, #ff9800);
    color: white;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
  }

  .cache-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background: var(--color-surface-elevated, #f5f5f5);
    border-radius: 8px;
    margin-bottom: 16px;
    font-size: 14px;
  }

  .clear-btn {
    background: none;
    border: 1px solid var(--color-error, #f44336);
    color: var(--color-error, #f44336);
    padding: 4px 12px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
  }

  .module-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 400px;
    overflow-y: auto;
    margin-bottom: 16px;
  }

  .module-list.disabled {
    opacity: 0.6;
    pointer-events: none;
  }

  .module-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: var(--color-surface-elevated, #f5f5f5);
    border-radius: 10px;
    transition: all 0.2s ease;
  }

  .module-item.selected {
    background: var(--color-primary-bg, #e3f2fd);
  }

  .module-item.completed {
    background: var(--color-success-bg, #e8f5e9);
  }

  .module-item.downloading {
    background: var(--color-warning-bg, #fff3e0);
  }

  .module-checkbox {
    display: flex;
    align-items: center;
  }

  .module-checkbox input {
    display: none;
  }

  .checkbox-custom {
    width: 24px;
    height: 24px;
    border: 2px solid var(--color-border, #ccc);
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .module-item.selected .checkbox-custom {
    background: var(--color-primary, #2196f3);
    border-color: var(--color-primary, #2196f3);
  }

  .module-item.completed .checkbox-custom {
    background: var(--color-success, #4CAF50);
    border-color: var(--color-success, #4CAF50);
  }

  .checkbox-custom svg {
    width: 16px;
    height: 16px;
    color: white;
  }

  .checkbox-custom .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid var(--color-warning, #ff9800);
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .module-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .module-title {
    font-size: 14px;
    font-weight: 500;
  }

  .module-meta {
    font-size: 12px;
    color: var(--color-text-muted, #666);
  }

  .action-bar {
    border-top: 1px solid var(--color-border, #eee);
    padding-top: 16px;
  }

  .selection-info {
    font-size: 14px;
    color: var(--color-text-muted, #666);
    margin-bottom: 12px;
    text-align: center;
  }

  .action-buttons {
    display: flex;
    gap: 12px;
  }

  .select-btn {
    flex: 1;
    padding: 12px;
    border: 1px solid var(--color-primary, #2196f3);
    background: transparent;
    color: var(--color-primary, #2196f3);
    border-radius: 10px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .select-btn:hover:not(:disabled) {
    background: var(--color-primary-bg, #e3f2fd);
  }

  .download-btn {
    flex: 2;
    padding: 12px;
    border: none;
    background: var(--color-primary, #2196f3);
    color: white;
    border-radius: 10px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .download-btn:hover:not(:disabled) {
    background: var(--color-primary-dark, #1976d2);
  }

  .download-btn:disabled,
  .select-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
