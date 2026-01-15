<script lang="ts">
  import { getAllModulesForLanguage } from "$lib/data/modules";
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import { db } from "$lib/db";
  import { liveQuery } from "dexie";
  import DevModeToggle from "$lib/components/dev/DevModeToggle.svelte";
  import { devMode } from "$lib/stores/devMode";
  import { resetLessonForReplay, clearLessonWrongAnswers, getAllProgressForLanguage } from "$lib/services/progressService";
  import { XPBar, StreakCounter, Button } from '@pkg/ui';
  import { selectedPair, currentLanguagePack } from "$lib/stores/languagePreference";

  // Dynamic module loading based on selected language
  $: modules = getAllModulesForLanguage($selectedPair);
  $: A1_MODULES = modules.A1;
  $: A2_MODULES = modules.A2;
  $: languageName = $currentLanguagePack?.name.target || 'آلمانی';

  // Fix BiDi for mixed Persian/German titles - wrap parenthesized text in LTR
  function fixBiDiTitle(title: string): string {
    // Match text in parentheses that contains Latin characters
    return title.replace(/\(([^)]*[a-zA-ZäöüßÄÖÜ][^)]*)\)/g, '<span dir="ltr">($1)</span>');
  }

  // Reactive queries for user stats and progress
  const user = liveQuery(() => db.users.get(1));

  // Progress map filtered by current language pair
  // We need to make this reactive to language changes
  let progressMapStore: Map<string, any> = new Map();

  // Re-fetch progress when language changes
  $: {
    // This block runs whenever $selectedPair changes
    const langPair = $selectedPair;
    getAllProgressForLanguage(langPair).then(progress => {
      progressMapStore = new Map(progress.map(p => [p.lessonId, p]));
    });
  }

  // Use the reactive store for display
  $: progressMap = progressMapStore;

  // Completed count for current language only
  const completedCount = liveQuery(async () => {
    const langProgress = await getAllProgressForLanguage($selectedPair);
    return langProgress.filter(p => p.status === 'completed').length;
  });
  const dueCardsCount = liveQuery(async () => {
    const now = new Date();
    return await db.vocab.where('nextReview').belowOrEqual(now).count();
  });

  // XP calculation for level display
  $: currentXP = ($user?.xp || 0) % 100;
  $: level = Math.floor(($user?.xp || 0) / 100) + 1;
  const levelXP = 100;

  // Combine all lessons for sequential unlocking
  $: allLessons = [...A1_MODULES, ...A2_MODULES].flatMap(m => m.lessons);

  // --- Collapsible Modules ---
  let expandedModules: Set<string> = new Set();
  let initialized = false;

  // Get module stats (completed/total lessons)
  function getModuleStats(module: typeof A1_MODULES[0], levelPrefix: string, moduleIndex: number): { completed: number; total: number; hasCurrentLesson: boolean } {
    let completed = 0;
    let hasCurrentLesson = false;
    const total = module.lessons.length;

    for (const lesson of module.lessons) {
      const progress = progressMap?.get(lesson.id);
      if (progress?.status === 'completed') {
        completed++;
      } else if (progress?.status === 'in-progress' || (!progress && completed === module.lessons.indexOf(lesson))) {
        hasCurrentLesson = true;
      }
    }

    // Check if this module has the next unlocked lesson
    if (!hasCurrentLesson && completed < total) {
      const firstIncomplete = module.lessons.find(l => {
        const p = progressMap?.get(l.id);
        return !p || p.status !== 'completed';
      });
      if (firstIncomplete) {
        const globalIdx = allLessons.findIndex(l => l.id === firstIncomplete.id);
        if (globalIdx === 0 || (globalIdx > 0 && progressMap?.get(allLessons[globalIdx - 1].id)?.status === 'completed')) {
          hasCurrentLesson = true;
        }
      }
    }

    return { completed, total, hasCurrentLesson };
  }

  // Toggle module expansion
  function toggleModule(moduleId: string) {
    if (expandedModules.has(moduleId)) {
      expandedModules.delete(moduleId);
    } else {
      expandedModules.add(moduleId);
    }
    expandedModules = expandedModules; // Trigger reactivity
    saveExpandedState();
  }

  // Save expanded state to localStorage
  function saveExpandedState() {
    if (browser) {
      localStorage.setItem('expandedModules', JSON.stringify([...expandedModules]));
    }
  }

  // Load expanded state from localStorage or set smart defaults
  function initExpandedState() {
    if (!browser || initialized) return;

    const saved = localStorage.getItem('expandedModules');
    if (saved) {
      try {
        expandedModules = new Set(JSON.parse(saved));
        initialized = true;
        return;
      } catch (e) {
        // Invalid saved state, use defaults
      }
    }

    // Smart defaults: expand module with current/next lesson
    const allModules = [
      ...A1_MODULES.map((m, i) => ({ ...m, id: `a1-${i}` })),
      ...A2_MODULES.map((m, i) => ({ ...m, id: `a2-${i}` }))
    ];

    for (const module of allModules) {
      const stats = getModuleStats(module, module.id.split('-')[0], parseInt(module.id.split('-')[1]));
      if (stats.hasCurrentLesson || (stats.completed > 0 && stats.completed < stats.total)) {
        expandedModules.add(module.id);
      }
    }

    // If nothing expanded, expand first module
    if (expandedModules.size === 0) {
      expandedModules.add('a1-0');
    }

    expandedModules = expandedModules;
    initialized = true;
  }

  // Initialize on mount and when progressMap updates
  $: if (progressMap && browser) {
    initExpandedState();
  }

  function getLessonStatus(lessonId: string, index: number): 'locked' | 'in-progress' | 'completed' | 'unlocked' {
    // Dev mode: all lessons unlocked
    if ($devMode) {
      const progress = progressMap?.get(lessonId);
      if (progress?.status === 'completed') return 'completed';
      if (progress?.status === 'in-progress') return 'in-progress';
      return 'unlocked';
    }

    // First lesson is always unlocked
    if (index === 0 && !progressMap?.has(lessonId)) {
      return 'unlocked';
    }

    const progress = progressMap?.get(lessonId);

    if (!progress) {
      // No progress - check if previous lesson is completed
      if (index > 0) {
        const prevLesson = allLessons[index - 1];
        if (prevLesson) {
          const prevProgress = progressMap?.get(prevLesson.id);

          if (!prevProgress || prevProgress.status !== 'completed') {
            return 'locked';
          }
        }
      }
      return 'unlocked';
    }

    return progress.status;
  }

  function getButtonText(status: string, progress: any): string {
    if (status === 'locked') return 'قفل';
    if (status === 'completed') return `مرور (${progress?.score || 0}%)`;
    if (status === 'in-progress' && progress?.currentStepIndex > 0) {
      return `ادامه (مرحله ${progress.currentStepIndex})`;
    }
    return 'شروع';
  }

  function getIcon(status: string): string {
    if (status === 'locked') return '🔒';
    if (status === 'completed') return '✅';
    if (status === 'in-progress') return '▶️';
    return '⭐';
  }

  async function handleResetLesson(lessonId: string) {
    if (confirm('آیا مطمئن هستید که می‌خواهید این درس را بازنشانی کنید؟ تمام پیشرفت شما پاک خواهد شد.')) {
      await resetLessonForReplay($selectedPair, lessonId);
      await clearLessonWrongAnswers(lessonId);
      // Refresh progress map after reset
      const progress = await getAllProgressForLanguage($selectedPair);
      progressMapStore = new Map(progress.map(p => [p.lessonId, p]));
    }
  }
</script>

<div class="dashboard" dir="rtl">
  <!-- Gamification Header -->
  <header class="header">
    <div class="header-top">
      <h1 class="title">مسیر یادگیری شما</h1>
      <p class="subtitle">{languageName} سطح A1 و A2</p>
    </div>

    <!-- XP Bar + Streak Row -->
    {#if $user}
      <div class="gamification-row">
        <div class="xp-section">
          <XPBar {currentXP} {levelXP} {level} />
        </div>
        <div class="streak-section">
          <StreakCounter streak={$user?.streak || 0} size="md" />
        </div>
      </div>
    {/if}

    <!-- Stats Cards -->
    {#if $user || $completedCount}
      <div class="stats-grid">
        <div class="stat-card xp-card">
          <span class="stat-icon">⭐</span>
          <span class="stat-value">{$user?.xp || 0}</span>
          <span class="stat-label">امتیاز کل</span>
        </div>
        <div class="stat-card completed-card">
          <span class="stat-icon">✅</span>
          <span class="stat-value">{$completedCount || 0}</span>
          <span class="stat-label">تکمیل شده</span>
        </div>
        <div class="stat-card cards-card">
          <span class="stat-icon">🎴</span>
          <span class="stat-value">{$dueCardsCount || 0}</span>
          <span class="stat-label">کارت مرور</span>
        </div>
      </div>
    {/if}

    <!-- Review Button -->
    {#if $dueCardsCount > 0}
      <a href="/review/flashcards" class="review-btn">
        <span class="review-icon">🎴</span>
        <span class="review-text">مرور کارت‌ها ({$dueCardsCount} کارت)</span>
      </a>
    {/if}
  </header>

  <!-- A1 Level -->
  <div class="level-section">
    <h2 class="level-title">
      <span class="level-badge">A1</span>
      سطح مبتدی
    </h2>
    <div class="timeline">
      {#key [progressMap, $devMode]}
        {#each A1_MODULES as module, moduleIndex}
          {@const moduleId = `a1-${moduleIndex}`}
          {@const stats = getModuleStats(module, 'a1', moduleIndex)}
          {@const isExpanded = expandedModules.has(moduleId)}
          <div class="module-section">
            <button
              class="module-header"
              class:expanded={isExpanded}
              on:click={() => toggleModule(moduleId)}
            >
              <h3 class="module-title">{@html fixBiDiTitle(module.title)}</h3>
              <div class="module-stats">
                <span class="stats-text">{stats.completed}/{stats.total}</span>
                {#if stats.completed === stats.total}
                  <span class="stats-icon">✅</span>
                {:else if stats.hasCurrentLesson}
                  <span class="stats-icon current">▶️</span>
                {/if}
              </div>
              <span class="chevron" class:expanded={isExpanded}>‹</span>
            </button>

            <div class="lessons-list" class:collapsed={!isExpanded}>
              {#each module.lessons as lesson, lessonIndex}
                {@const globalIndex = A1_MODULES.slice(0, moduleIndex).reduce((sum, m) => sum + m.lessons.length, 0) + lessonIndex}
                {@const status = getLessonStatus(lesson.id, globalIndex)}
                {@const progress = progressMap?.get(lesson.id)}
                {@const isLocked = status === 'locked'}

              <div
                class="lesson-card"
                class:locked={isLocked}
                class:completed={status === 'completed'}
                class:in-progress={status === 'in-progress'}
              >
                <div class="lesson-icon" class:completed={status === 'completed'} class:in-progress={status === 'in-progress'}>
                  <span class="lesson-num">{globalIndex + 1}</span>
                  <span class="status-icon">{getIcon(status)}</span>
                </div>
                <div class="lesson-info">
                  <h3>{@html fixBiDiTitle(lesson.title)}</h3>
                  <p>{lesson.description}</p>
                </div>
                <div class="lesson-action">
                  {#if isLocked}
                    <button class="action-btn locked-btn" disabled>
                      {getButtonText(status, progress)}
                    </button>
                  {:else if status === 'completed' || status === 'in-progress'}
                    <div class="action-group">
                      <a href={lesson.path} class="action-btn" class:completed={status === 'completed'}>
                        {getButtonText(status, progress)}
                      </a>
                      <button class="reset-btn" on:click={() => handleResetLesson(lesson.id)}>
                        بازنشانی
                      </button>
                    </div>
                  {:else}
                    <a href={lesson.path} class="action-btn primary">
                      {getButtonText(status, progress)}
                    </a>
                  {/if}
                </div>
              </div>
              {/each}
            </div>
          </div>
        {/each}
      {/key}
    </div>
  </div>

  <!-- A2 Level -->
  <div class="level-section">
    <h2 class="level-title">
      <span class="level-badge a2">A2</span>
      سطح مقدماتی
    </h2>
    <div class="timeline">
      {#key [progressMap, $devMode]}
        {#each A2_MODULES as module, moduleIndex}
          {@const moduleId = `a2-${moduleIndex}`}
          {@const stats = getModuleStats(module, 'a2', moduleIndex)}
          {@const isExpanded = expandedModules.has(moduleId)}
          <div class="module-section">
            <button
              class="module-header"
              class:expanded={isExpanded}
              on:click={() => toggleModule(moduleId)}
            >
              <h3 class="module-title">{@html fixBiDiTitle(module.title)}</h3>
              <div class="module-stats">
                <span class="stats-text">{stats.completed}/{stats.total}</span>
                {#if stats.completed === stats.total}
                  <span class="stats-icon">✅</span>
                {:else if stats.hasCurrentLesson}
                  <span class="stats-icon current">▶️</span>
                {/if}
              </div>
              <span class="chevron" class:expanded={isExpanded}>‹</span>
            </button>

            <div class="lessons-list" class:collapsed={!isExpanded}>
              {#each module.lessons as lesson, lessonIndex}
                {@const a1TotalLessons = A1_MODULES.reduce((sum, m) => sum + m.lessons.length, 0)}
                {@const globalIndex = a1TotalLessons + A2_MODULES.slice(0, moduleIndex).reduce((sum, m) => sum + m.lessons.length, 0) + lessonIndex}
                {@const a2LessonNum = A2_MODULES.slice(0, moduleIndex).reduce((sum, m) => sum + m.lessons.length, 0) + lessonIndex + 1}
                {@const status = getLessonStatus(lesson.id, globalIndex)}
                {@const progress = progressMap?.get(lesson.id)}
                {@const isLocked = status === 'locked'}

              <div
                class="lesson-card"
                class:locked={isLocked}
                class:completed={status === 'completed'}
                class:in-progress={status === 'in-progress'}
              >
                <div class="lesson-icon" class:completed={status === 'completed'} class:in-progress={status === 'in-progress'}>
                  <span class="lesson-num">{a2LessonNum}</span>
                  <span class="status-icon">{getIcon(status)}</span>
                </div>
                <div class="lesson-info">
                  <h3>{@html fixBiDiTitle(lesson.title)}</h3>
                  <p>{lesson.description}</p>
                </div>
                <div class="lesson-action">
                  {#if isLocked}
                    <button class="action-btn locked-btn" disabled>
                      {getButtonText(status, progress)}
                    </button>
                  {:else if status === 'completed' || status === 'in-progress'}
                    <div class="action-group">
                      <a href={lesson.path} class="action-btn" class:completed={status === 'completed'}>
                        {getButtonText(status, progress)}
                      </a>
                      <button class="reset-btn" on:click={() => handleResetLesson(lesson.id)}>
                        بازنشانی
                      </button>
                    </div>
                  {:else}
                    <a href={lesson.path} class="action-btn primary">
                      {getButtonText(status, progress)}
                    </a>
                  {/if}
                </div>
              </div>
              {/each}
            </div>
          </div>
        {/each}
      {/key}
    </div>
  </div>
</div>

<!-- Dev Mode Toggle (only visible in development) -->
<DevModeToggle />

<style>
  /* Mobile-first: full width, minimal padding */
  .dashboard {
    width: 100%;
    max-width: 100%;
    margin: 0;
    padding: var(--space-3, 0.75rem);
    box-sizing: border-box;
  }

  /* Tablet and up: constrained width */
  @media (min-width: 600px) {
    .dashboard {
      max-width: 800px;
      margin: 0 auto;
      padding: var(--space-6, 1.5rem) var(--space-4, 1rem);
    }
  }

  /* Header Section */
  .header {
    margin-bottom: var(--space-8, 2rem);
    text-align: center;
  }

  .header-top {
    margin-bottom: var(--space-6, 1.5rem);
  }

  .title {
    font-size: var(--text-2xl, 1.75rem);
    font-weight: var(--font-extrabold, 800);
    color: var(--color-neutral-800, #292524);
    margin: 0 0 var(--space-2, 0.5rem);
    background: linear-gradient(135deg, var(--color-primary-600, #0e7490), var(--color-primary-500, #0891b2));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .subtitle {
    color: var(--color-neutral-500, #78716c);
    font-size: var(--text-base, 1rem);
    margin: 0;
  }

  /* Gamification Row */
  .gamification-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-6, 1.5rem);
    margin-bottom: var(--space-6, 1.5rem);
    flex-wrap: wrap;
  }

  .xp-section {
    flex: 1;
    max-width: 300px;
    min-width: 200px;
  }

  .streak-section {
    flex-shrink: 0;
  }

  /* Stats Grid - Glass morphism cards */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-3, 0.75rem);
    max-width: 500px;
    margin: 0 auto var(--space-6, 1.5rem);
  }

  .stat-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--space-4, 1rem) var(--space-3, 0.75rem);
    background: var(--glass-bg, rgba(253, 251, 247, 0.85));
    border: 1px solid var(--glass-border, rgba(212, 201, 185, 0.3));
    border-radius: var(--radius-xl, 1rem);
    backdrop-filter: blur(var(--glass-blur, 12px));
    transition: transform var(--transition-bounce, 400ms cubic-bezier(0.68, -0.55, 0.265, 1.55)),
                box-shadow var(--transition-normal, 200ms);
  }

  .stat-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg, 0 10px 25px -5px rgba(0, 0, 0, 0.1));
  }

  .stat-card.xp-card {
    border-color: var(--color-xp-400, #818cf8);
    background: linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(129, 140, 248, 0.05));
  }

  .stat-card.completed-card {
    border-color: var(--color-success-400, #facc15);
    background: linear-gradient(135deg, rgba(234, 179, 8, 0.1), rgba(250, 204, 21, 0.05));
  }

  .stat-card.cards-card {
    border-color: var(--color-gem-400, #10b981);
    background: linear-gradient(135deg, rgba(5, 150, 105, 0.1), rgba(16, 185, 129, 0.05));
  }

  .stat-icon {
    font-size: var(--text-xl, 1.25rem);
    margin-bottom: var(--space-1, 0.25rem);
  }

  .stat-value {
    font-size: var(--text-xl, 1.25rem);
    font-weight: var(--font-bold, 700);
    color: var(--color-neutral-800, #292524);
  }

  .stat-label {
    font-size: var(--text-xs, 0.75rem);
    color: var(--color-neutral-500, #78716c);
    margin-top: var(--space-1, 0.25rem);
  }

  /* Review Button */
  .review-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2, 0.5rem);
    padding: var(--space-3, 0.75rem) var(--space-6, 1.5rem);
    background: linear-gradient(135deg, var(--color-primary-500, #0891b2), var(--color-gem-500, #059669));
    color: white;
    text-decoration: none;
    border-radius: var(--radius-full, 9999px);
    font-weight: var(--font-bold, 700);
    font-size: var(--text-base, 1rem);
    transition: all var(--transition-normal, 200ms);
    box-shadow: 0 4px 15px rgba(8, 145, 178, 0.3);
  }

  .review-btn:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 6px 20px rgba(8, 145, 178, 0.4);
  }

  .review-btn:active {
    transform: translateY(0) scale(0.98);
  }

  .review-icon {
    font-size: var(--text-lg, 1.125rem);
  }

  /* Level Sections */
  .level-section {
    margin-bottom: var(--space-10, 2.5rem);
  }

  .level-title {
    display: flex;
    align-items: center;
    gap: var(--space-3, 0.75rem);
    font-size: var(--text-xl, 1.25rem);
    font-weight: var(--font-bold, 700);
    color: var(--color-neutral-800, #292524);
    margin-bottom: var(--space-6, 1.5rem);
    padding: var(--space-4, 1rem);
    background: linear-gradient(135deg, var(--color-primary-50, #ecfeff), var(--color-neutral-50, #fdfbf7));
    border-radius: var(--radius-xl, 1rem);
    border-right: 4px solid var(--color-primary-500, #0891b2);
  }

  .level-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, var(--color-primary-500, #0891b2), var(--color-primary-600, #0e7490));
    color: white;
    font-weight: var(--font-extrabold, 800);
    font-size: var(--text-sm, 0.875rem);
    border-radius: var(--radius-lg, 0.75rem);
    box-shadow: 0 2px 8px rgba(8, 145, 178, 0.3);
  }

  .level-badge.a2 {
    background: linear-gradient(135deg, var(--color-xp-500, #4f46e5), var(--color-xp-600, #4338ca));
    box-shadow: 0 2px 8px rgba(79, 70, 229, 0.3);
  }

  /* Timeline */
  .timeline {
    display: flex;
    flex-direction: column;
    gap: var(--space-8, 2rem);
    position: relative;
  }

  .timeline::before {
    content: '';
    position: absolute;
    left: 1.75rem;
    top: 0;
    bottom: 0;
    width: 3px;
    background: linear-gradient(180deg, var(--color-primary-300, #67e8f9), var(--color-primary-200, #a5f3fc));
    border-radius: var(--radius-full, 9999px);
    z-index: 0;
  }

  .module-section {
    position: relative;
    z-index: 1;
  }

  /* Collapsible Module Header */
  .module-header {
    display: flex;
    align-items: center;
    gap: var(--space-3, 0.75rem);
    width: 100%;
    padding: var(--space-2, 0.5rem) var(--space-4, 1rem);
    background: var(--color-neutral-100, #f5f0e8);
    border: 1px solid var(--color-neutral-200, #e8e0d5);
    border-radius: var(--radius-xl, 1rem);
    cursor: pointer;
    transition: all var(--transition-normal, 200ms);
    margin-bottom: var(--space-3, 0.75rem);
  }

  .module-header:hover {
    background: var(--color-neutral-50, #fdfbf7);
    border-color: var(--color-primary-300, #67e8f9);
  }

  .module-header.expanded {
    border-color: var(--color-primary-400, #22d3ee);
    background: linear-gradient(135deg, var(--color-primary-50, #ecfeff), var(--color-neutral-50, #fdfbf7));
  }

  .module-title {
    flex: 1;
    font-size: var(--text-sm, 0.875rem);
    font-weight: var(--font-semibold, 600);
    color: var(--color-neutral-700, #44403c);
    margin: 0;
    text-align: right;
  }

  .module-stats {
    display: flex;
    align-items: center;
    gap: var(--space-2, 0.5rem);
  }

  .stats-text {
    font-size: var(--text-xs, 0.75rem);
    color: var(--color-neutral-500, #78716c);
    font-weight: var(--font-medium, 500);
  }

  .stats-icon {
    font-size: var(--text-sm, 0.875rem);
  }

  .stats-icon.current {
    animation: pulse-current 2s ease-in-out infinite;
  }

  @keyframes pulse-current {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .chevron {
    font-size: var(--text-lg, 1.125rem);
    color: var(--color-neutral-400, #a69b8a);
    transition: transform var(--transition-normal, 200ms);
    transform: rotate(-90deg);
  }

  .chevron.expanded {
    transform: rotate(-270deg);
  }

  /* Lessons list collapse/expand */
  .lessons-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-4, 1rem);
    overflow: hidden;
    max-height: 2000px; /* Large enough for any module */
    transition: max-height var(--transition-normal, 200ms) ease-out,
                opacity var(--transition-normal, 200ms) ease-out;
    opacity: 1;
  }

  .lessons-list.collapsed {
    max-height: 0;
    opacity: 0;
    margin-bottom: 0;
  }

  /* Lesson Cards */
  .lesson-card {
    display: flex;
    align-items: center;
    gap: var(--space-4, 1rem);
    background: var(--glass-bg, rgba(253, 251, 247, 0.85));
    border: 1px solid var(--glass-border, rgba(212, 201, 185, 0.3));
    padding: var(--space-4, 1rem);
    border-radius: var(--radius-xl, 1rem);
    backdrop-filter: blur(var(--glass-blur, 12px));
    transition: all var(--transition-normal, 200ms);
  }

  .lesson-card:hover {
    transform: translateX(-4px);
    box-shadow: var(--shadow-md, 0 4px 15px rgba(0, 0, 0, 0.08));
    border-color: var(--color-primary-300, #67e8f9);
  }

  .lesson-card.locked {
    opacity: 0.6;
    pointer-events: none;
  }

  .lesson-card.locked:hover {
    transform: none;
    box-shadow: none;
  }

  .lesson-card.completed {
    border-color: var(--color-success-400, #facc15);
    background: linear-gradient(135deg, rgba(234, 179, 8, 0.05), var(--glass-bg, rgba(253, 251, 247, 0.85)));
  }

  .lesson-card.in-progress {
    border-color: var(--color-streak-400, #fbbf24);
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.05), var(--glass-bg, rgba(253, 251, 247, 0.85)));
  }

  /* Lesson Icon */
  .lesson-icon {
    width: 3.5rem;
    height: 3.5rem;
    background: linear-gradient(135deg, var(--color-primary-500, #0891b2), var(--color-primary-600, #0e7490));
    border-radius: var(--radius-full, 9999px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: 0 0 0 4px var(--color-neutral-50, #fdfbf7), 0 4px 12px rgba(8, 145, 178, 0.3);
    flex-shrink: 0;
    position: relative;
    transition: all var(--transition-bounce, 400ms cubic-bezier(0.68, -0.55, 0.265, 1.55));
  }

  .lesson-card:hover .lesson-icon {
    transform: scale(1.1);
  }

  .lesson-icon .lesson-num {
    font-size: var(--text-base, 1rem);
    font-weight: var(--font-bold, 700);
    line-height: 1;
  }

  .lesson-icon .status-icon {
    font-size: 0.6rem;
    line-height: 1;
    margin-top: 2px;
  }

  .lesson-icon.completed {
    background: linear-gradient(135deg, var(--color-success-500, #eab308), var(--color-success-600, #ca8a04));
    box-shadow: 0 0 0 4px var(--color-neutral-50, #fdfbf7), 0 4px 12px rgba(234, 179, 8, 0.3);
  }

  .lesson-icon.in-progress {
    background: linear-gradient(135deg, var(--color-streak-500, #f59e0b), var(--color-streak-600, #d97706));
    box-shadow: 0 0 0 4px var(--color-neutral-50, #fdfbf7), 0 4px 12px rgba(245, 158, 11, 0.3);
    animation: pulse-glow 2s ease-in-out infinite;
  }

  /* Lesson Info */
  .lesson-info {
    flex: 1;
    min-width: 0;
  }

  .lesson-info h3 {
    font-size: var(--text-base, 1rem);
    font-weight: var(--font-bold, 700);
    color: var(--color-neutral-800, #292524);
    margin: 0 0 var(--space-1, 0.25rem);
    unicode-bidi: plaintext;
  }

  .lesson-info p {
    font-size: var(--text-sm, 0.875rem);
    color: var(--color-neutral-500, #78716c);
    margin: 0;
    line-height: 1.4;
  }

  /* Action Buttons */
  .lesson-action {
    flex-shrink: 0;
  }

  .action-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-2, 0.5rem) var(--space-4, 1rem);
    background: linear-gradient(135deg, var(--color-success-500, #eab308), var(--color-success-600, #ca8a04));
    color: white;
    text-decoration: none;
    border-radius: var(--radius-full, 9999px);
    font-weight: var(--font-semibold, 600);
    font-size: var(--text-sm, 0.875rem);
    transition: all var(--transition-normal, 200ms);
    border: none;
    cursor: pointer;
    min-height: 44px;
    box-shadow: 0 2px 8px rgba(234, 179, 8, 0.3);
  }

  .action-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(234, 179, 8, 0.4);
  }

  .action-btn:active {
    transform: translateY(0) scale(0.98);
  }

  .action-btn.primary {
    background: linear-gradient(135deg, var(--color-primary-500, #0891b2), var(--color-primary-600, #0e7490));
    box-shadow: 0 2px 8px rgba(8, 145, 178, 0.3);
  }

  .action-btn.primary:hover {
    box-shadow: 0 4px 12px rgba(8, 145, 178, 0.4);
  }

  .action-btn.completed {
    background: linear-gradient(135deg, var(--color-xp-500, #4f46e5), var(--color-xp-600, #4338ca));
    box-shadow: 0 2px 8px rgba(79, 70, 229, 0.3);
  }

  .action-btn.completed:hover {
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
  }

  .locked-btn {
    background: var(--color-neutral-300, #d4c9b9);
    color: var(--color-neutral-500, #78716c);
    cursor: not-allowed;
    box-shadow: none;
  }

  .locked-btn:hover {
    transform: none;
    box-shadow: none;
  }

  .action-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-2, 0.5rem);
    align-items: stretch;
  }

  .reset-btn {
    background: transparent;
    color: var(--color-neutral-500, #78716c);
    border: 1px solid var(--color-neutral-200, #e8e0d5);
    padding: var(--space-1, 0.25rem) var(--space-3, 0.75rem);
    border-radius: var(--radius-full, 9999px);
    font-weight: var(--font-medium, 500);
    font-size: var(--text-xs, 0.75rem);
    cursor: pointer;
    transition: all var(--transition-fast, 150ms);
  }

  .reset-btn:hover {
    background: var(--color-error-50, #fef2f2);
    border-color: var(--color-error-300, #fca5a5);
    color: var(--color-error-500, #a91e1e);
  }

  /* Animations */
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 0 4px var(--color-neutral-50, #fdfbf7), 0 4px 12px rgba(245, 158, 11, 0.3); }
    50% { box-shadow: 0 0 0 4px var(--color-neutral-50, #fdfbf7), 0 4px 20px rgba(245, 158, 11, 0.5); }
  }

  /* Dark Mode */
  :global([data-theme="dark"]) .title {
    background: linear-gradient(135deg, var(--color-primary-400, #22d3ee), var(--color-primary-300, #67e8f9));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  :global([data-theme="dark"]) .level-title {
    background: linear-gradient(135deg, rgba(8, 145, 178, 0.15), var(--color-neutral-100, #292524));
    color: var(--color-neutral-100, #f5f0e8);
  }

  :global([data-theme="dark"]) .lesson-card {
    background: rgba(28, 25, 23, 0.85);
    border-color: rgba(68, 64, 60, 0.3);
  }

  :global([data-theme="dark"]) .stat-card {
    background: rgba(28, 25, 23, 0.85);
  }

  :global([data-theme="dark"]) .module-header {
    background: var(--color-neutral-200, #44403c);
    border-color: var(--color-neutral-300, #57534e);
  }

  :global([data-theme="dark"]) .module-header:hover {
    background: var(--color-neutral-300, #57534e);
    border-color: var(--color-primary-500, #0891b2);
  }

  :global([data-theme="dark"]) .module-header.expanded {
    background: linear-gradient(135deg, rgba(8, 145, 178, 0.15), var(--color-neutral-200, #44403c));
    border-color: var(--color-primary-400, #22d3ee);
  }

  :global([data-theme="dark"]) .module-title {
    color: var(--color-neutral-100, #f5f0e8);
  }

  :global([data-theme="dark"]) .stats-text {
    color: var(--color-neutral-400, #a69b8a);
  }

  :global([data-theme="dark"]) .chevron {
    color: var(--color-neutral-500, #78716c);
  }

  :global([data-theme="dark"]) .lesson-info h3 {
    color: var(--color-neutral-100, #f5f0e8);
  }

  :global([data-theme="dark"]) .stat-value {
    color: var(--color-neutral-100, #f5f0e8);
  }

  /* ===== MOBILE-FIRST OVERRIDES ===== */
  /* These are the default mobile styles - defined above as desktop then overridden here */

  /* Title - smaller on mobile */
  .title {
    font-size: var(--text-xl, 1.25rem);
  }

  @media (min-width: 600px) {
    .title {
      font-size: var(--text-2xl, 1.75rem);
    }
  }

  /* Gamification row - stack on mobile */
  .gamification-row {
    flex-direction: column;
    gap: var(--space-4, 1rem);
  }

  @media (min-width: 600px) {
    .gamification-row {
      flex-direction: row;
      gap: var(--space-6, 1.5rem);
    }
  }

  /* XP section */
  .xp-section {
    max-width: 100%;
    width: 100%;
    min-width: auto;
  }

  @media (min-width: 600px) {
    .xp-section {
      flex: 1;
      max-width: 300px;
      min-width: 200px;
    }
  }

  /* Stats grid - tighter on mobile */
  .stats-grid {
    gap: var(--space-2, 0.5rem);
  }

  @media (min-width: 600px) {
    .stats-grid {
      gap: var(--space-3, 0.75rem);
    }
  }

  /* Stat cards - smaller padding on mobile */
  .stat-card {
    padding: var(--space-3, 0.75rem) var(--space-2, 0.5rem);
  }

  @media (min-width: 600px) {
    .stat-card {
      padding: var(--space-4, 1rem) var(--space-3, 0.75rem);
    }
  }

  /* Stat value - smaller on mobile */
  .stat-value {
    font-size: var(--text-base, 1rem);
  }

  @media (min-width: 600px) {
    .stat-value {
      font-size: var(--text-xl, 1.25rem);
    }
  }

  /* Timeline - hide line on mobile */
  .timeline::before {
    display: none;
  }

  @media (min-width: 600px) {
    .timeline::before {
      display: block;
    }
  }

  /* Lesson cards - wrap on mobile */
  .lesson-card {
    flex-wrap: wrap;
    padding: var(--space-3, 0.75rem);
    gap: var(--space-3, 0.75rem);
  }

  @media (min-width: 600px) {
    .lesson-card {
      flex-wrap: nowrap;
      padding: var(--space-4, 1rem);
      gap: var(--space-4, 1rem);
    }
  }

  /* Lesson icon - smaller on mobile */
  .lesson-icon {
    width: 3rem;
    height: 3rem;
    box-shadow: 0 2px 8px rgba(8, 145, 178, 0.2);
  }

  @media (min-width: 600px) {
    .lesson-icon {
      width: 3.5rem;
      height: 3.5rem;
      box-shadow: 0 0 0 4px var(--color-neutral-50, #fdfbf7), 0 4px 12px rgba(8, 145, 178, 0.3);
    }
  }

  .lesson-icon .lesson-num {
    font-size: var(--text-sm, 0.875rem);
  }

  @media (min-width: 600px) {
    .lesson-icon .lesson-num {
      font-size: var(--text-base, 1rem);
    }
  }

  /* Lesson info - smaller text on mobile */
  .lesson-info h3 {
    font-size: var(--text-sm, 0.875rem);
  }

  @media (min-width: 600px) {
    .lesson-info h3 {
      font-size: var(--text-base, 1rem);
    }
  }

  .lesson-info p {
    font-size: var(--text-xs, 0.75rem);
  }

  @media (min-width: 600px) {
    .lesson-info p {
      font-size: var(--text-sm, 0.875rem);
    }
  }

  /* Lesson action - full width on mobile */
  .lesson-action {
    width: 100%;
    margin-top: var(--space-1, 0.25rem);
  }

  @media (min-width: 600px) {
    .lesson-action {
      width: auto;
      margin-top: 0;
    }
  }

  /* Action button - full width on mobile */
  .action-btn {
    width: 100%;
    padding: var(--space-3, 0.75rem);
  }

  @media (min-width: 600px) {
    .action-btn {
      width: auto;
      padding: var(--space-2, 0.5rem) var(--space-4, 1rem);
    }
  }

  /* Action group - row on mobile */
  .action-group {
    flex-direction: row;
    justify-content: space-between;
  }

  @media (min-width: 600px) {
    .action-group {
      flex-direction: column;
      justify-content: flex-start;
    }
  }

  .action-group .action-btn {
    flex: 1;
  }

  @media (min-width: 600px) {
    .action-group .action-btn {
      flex: none;
    }
  }

  .reset-btn {
    white-space: nowrap;
  }

  /* Module header - mobile adjustments */
  .module-header {
    padding: var(--space-2, 0.5rem) var(--space-3, 0.75rem);
    gap: var(--space-2, 0.5rem);
  }

  @media (min-width: 600px) {
    .module-header {
      padding: var(--space-2, 0.5rem) var(--space-4, 1rem);
      gap: var(--space-3, 0.75rem);
      margin-left: var(--space-10, 2.5rem);
    }
  }

  /* Level title - smaller on mobile */
  .level-title {
    font-size: var(--text-base, 1rem);
    padding: var(--space-3, 0.75rem);
  }

  @media (min-width: 600px) {
    .level-title {
      font-size: var(--text-xl, 1.25rem);
      padding: var(--space-4, 1rem);
    }
  }

  /* Level badge - smaller on mobile */
  .level-badge {
    width: 32px;
    height: 32px;
    font-size: var(--text-xs, 0.75rem);
  }

  @media (min-width: 600px) {
    .level-badge {
      width: 40px;
      height: 40px;
      font-size: var(--text-sm, 0.875rem);
    }
  }

  /* Lessons list - tighter on mobile */
  .lessons-list {
    gap: var(--space-3, 0.75rem);
  }

  @media (min-width: 600px) {
    .lessons-list {
      gap: var(--space-4, 1rem);
    }
  }

  /* Disable hover effects on mobile */
  @media (max-width: 599px) {
    .lesson-card:hover {
      transform: none;
    }

    .stat-card:hover {
      transform: none;
    }
  }
</style>
