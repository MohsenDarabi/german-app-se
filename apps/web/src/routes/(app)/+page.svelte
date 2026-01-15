<script lang="ts">
  import { A1_MODULES, A2_MODULES } from "$lib/data/modules";
  import { onMount } from "svelte";
  import { db } from "$lib/db";
  import { liveQuery } from "dexie";
  import DevModeToggle from "$lib/components/dev/DevModeToggle.svelte";
  import { devMode } from "$lib/stores/devMode";
  import { resetLessonForReplay, clearLessonWrongAnswers } from "$lib/services/progressService";
  import { XPBar, StreakCounter, Button } from '@pkg/ui';

  // Fix BiDi for mixed Persian/German titles - wrap parenthesized text in LTR
  function fixBiDiTitle(title: string): string {
    // Match text in parentheses that contains Latin characters
    return title.replace(/\(([^)]*[a-zA-ZäöüßÄÖÜ][^)]*)\)/g, '<span dir="ltr">($1)</span>');
  }

  // Reactive queries for user stats and progress
  const user = liveQuery(() => db.users.get(1));
  const progressMap = liveQuery(async () => {
    const allProgress = await db.lessonProgress.toArray();
    return new Map(allProgress.map(p => [p.lessonId, p]));
  });
  const completedCount = liveQuery(() =>
    db.lessonProgress.where('status').equals('completed').count()
  );
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

  function getLessonStatus(lessonId: string, index: number): 'locked' | 'in-progress' | 'completed' | 'unlocked' {
    // Dev mode: all lessons unlocked
    if ($devMode) {
      const progress = $progressMap?.get(lessonId);
      if (progress?.status === 'completed') return 'completed';
      if (progress?.status === 'in-progress') return 'in-progress';
      return 'unlocked';
    }

    // First lesson is always unlocked
    if (index === 0 && !$progressMap?.has(lessonId)) {
      return 'unlocked';
    }

    const progress = $progressMap?.get(lessonId);

    if (!progress) {
      // No progress - check if previous lesson is completed
      if (index > 0) {
        const prevLesson = allLessons[index - 1];
        if (prevLesson) {
          const prevProgress = $progressMap?.get(prevLesson.id);

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
      await resetLessonForReplay(lessonId);
      await clearLessonWrongAnswers(lessonId);
    }
  }
</script>

<div class="dashboard" dir="rtl">
  <!-- Gamification Header -->
  <header class="header">
    <div class="header-top">
      <h1 class="title">مسیر یادگیری شما</h1>
      <p class="subtitle">آلمانی سطح A1 و A2</p>
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
      {#key [$progressMap, $devMode]}
        {#each A1_MODULES as module, moduleIndex}
          <div class="module-section">
            <h3 class="module-title">{@html fixBiDiTitle(module.title)}</h3>

            <div class="lessons-list">
              {#each module.lessons as lesson, lessonIndex}
                {@const globalIndex = A1_MODULES.slice(0, moduleIndex).reduce((sum, m) => sum + m.lessons.length, 0) + lessonIndex}
                {@const status = getLessonStatus(lesson.id, globalIndex)}
                {@const progress = $progressMap?.get(lesson.id)}
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
      {#key [$progressMap, $devMode]}
        {#each A2_MODULES as module, moduleIndex}
          <div class="module-section">
            <h3 class="module-title">{@html fixBiDiTitle(module.title)}</h3>

            <div class="lessons-list">
              {#each module.lessons as lesson, lessonIndex}
                {@const a1TotalLessons = A1_MODULES.reduce((sum, m) => sum + m.lessons.length, 0)}
                {@const globalIndex = a1TotalLessons + A2_MODULES.slice(0, moduleIndex).reduce((sum, m) => sum + m.lessons.length, 0) + lessonIndex}
                {@const a2LessonNum = A2_MODULES.slice(0, moduleIndex).reduce((sum, m) => sum + m.lessons.length, 0) + lessonIndex + 1}
                {@const status = getLessonStatus(lesson.id, globalIndex)}
                {@const progress = $progressMap?.get(lesson.id)}
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

  .module-title {
    background: var(--color-neutral-100, #f5f0e8);
    display: inline-block;
    padding: var(--space-2, 0.5rem) var(--space-4, 1rem);
    border-radius: var(--radius-full, 9999px);
    font-size: var(--text-sm, 0.875rem);
    font-weight: var(--font-semibold, 600);
    color: var(--color-neutral-600, #57534e);
    margin-bottom: var(--space-4, 1rem);
    margin-left: var(--space-10, 2.5rem);
    box-shadow: var(--shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.05));
  }

  .lessons-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-4, 1rem);
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

  :global([data-theme="dark"]) .module-title {
    background: var(--color-neutral-200, #44403c);
    color: var(--color-neutral-100, #f5f0e8);
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

  /* Module title - centered on mobile */
  .module-title {
    margin-left: 0;
    margin-bottom: var(--space-3, 0.75rem);
    display: block;
    text-align: center;
  }

  @media (min-width: 600px) {
    .module-title {
      display: inline-block;
      margin-left: var(--space-10, 2.5rem);
      margin-bottom: var(--space-4, 1rem);
      text-align: right;
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
