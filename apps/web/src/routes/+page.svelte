<script lang="ts">
  import { A1_MODULES, A2_MODULES } from "$lib/data/modules";
  import { onMount } from "svelte";
  import { db } from "$lib/db";
  import { liveQuery } from "dexie";
  import DevModeToggle from "$lib/components/dev/DevModeToggle.svelte";
  import { devMode } from "$lib/stores/devMode";

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
</script>

<div class="dashboard" dir="rtl">
  <header class="header">
    <h1>مسیر یادگیری شما</h1>
    <p class="subtitle">آلمانی سطح A1 و A2</p>

    <!-- Stats Header -->
    {#if $user || $completedCount}
      <div class="stats-header">
        <div class="stat">
          <span class="stat-icon">🔥</span>
          <span class="stat-value">{$user?.streak || 0}</span>
          <span class="stat-label">روز متوالی</span>
        </div>
        <div class="stat">
          <span class="stat-icon">⭐</span>
          <span class="stat-value">{$user?.xp || 0}</span>
          <span class="stat-label">امتیاز</span>
        </div>
        <div class="stat">
          <span class="stat-icon">✅</span>
          <span class="stat-value">{$completedCount || 0}</span>
          <span class="stat-label">تکمیل شده</span>
        </div>
        <div class="stat">
          <span class="stat-icon">🎴</span>
          <span class="stat-value">{$dueCardsCount || 0}</span>
          <span class="stat-label">کارت برای مرور</span>
        </div>
      </div>
    {/if}

    <!-- Review Button -->
    {#if $dueCardsCount > 0}
      <a href="/review/flashcards" class="review-btn">
        🎴 مرور کارت‌ها ({$dueCardsCount} کارت)
      </a>
    {/if}
  </header>

  <!-- A1 Level -->
  <div class="level-section">
    <h2 class="level-title">🇩🇪 سطح A1 - مبتدی</h2>
    <div class="timeline">
      {#key [$progressMap, $devMode]}
        {#each A1_MODULES as module, moduleIndex}
          <div class="module-section">
            <h3 class="module-title">{module.title}</h3>

            <div class="lessons-list">
              {#each module.lessons as lesson, lessonIndex}
                {@const globalIndex = A1_MODULES.slice(0, moduleIndex).reduce((sum, m) => sum + m.lessons.length, 0) + lessonIndex}
                {@const status = getLessonStatus(lesson.id, globalIndex)}
                {@const progress = $progressMap?.get(lesson.id)}
                {@const isLocked = status === 'locked'}

              <div class="lesson-card" class:locked={isLocked}>
                <div class="icon" class:completed={status === 'completed'} class:in-progress={status === 'in-progress'}>
                  {getIcon(status)}
                </div>
                <div class="info">
                  <h3>{lesson.title}</h3>
                  <p>{lesson.description}</p>
                </div>
                <div class="action">
                  {#if isLocked}
                    <button class="start-btn locked-btn" disabled>
                      {getButtonText(status, progress)}
                    </button>
                  {:else}
                    <a href={lesson.path} class="start-btn" class:completed={status === 'completed'}>
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
    <h2 class="level-title">🇩🇪 سطح A2 - مقدماتی</h2>
    <div class="timeline">
      {#key [$progressMap, $devMode]}
        {#each A2_MODULES as module, moduleIndex}
          <div class="module-section">
            <h3 class="module-title">{module.title}</h3>

            <div class="lessons-list">
              {#each module.lessons as lesson, lessonIndex}
                {@const a1TotalLessons = A1_MODULES.reduce((sum, m) => sum + m.lessons.length, 0)}
                {@const globalIndex = a1TotalLessons + A2_MODULES.slice(0, moduleIndex).reduce((sum, m) => sum + m.lessons.length, 0) + lessonIndex}
                {@const status = getLessonStatus(lesson.id, globalIndex)}
                {@const progress = $progressMap?.get(lesson.id)}
                {@const isLocked = status === 'locked'}

              <div class="lesson-card" class:locked={isLocked}>
                <div class="icon" class:completed={status === 'completed'} class:in-progress={status === 'in-progress'}>
                  {getIcon(status)}
                </div>
                <div class="info">
                  <h3>{lesson.title}</h3>
                  <p>{lesson.description}</p>
                </div>
                <div class="action">
                  {#if isLocked}
                    <button class="start-btn locked-btn" disabled>
                      {getButtonText(status, progress)}
                    </button>
                  {:else}
                    <a href={lesson.path} class="start-btn" class:completed={status === 'completed'}>
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
  .dashboard {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  .header {
    margin-bottom: 2.5rem;
    text-align: center;
  }

  .header h1 {
    font-size: 2rem;
    font-weight: 800;
    color: #1e293b;
    margin-bottom: 0.5rem;
  }

  .subtitle {
    color: #64748b;
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
  }

  .stats-header {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    max-width: 600px;
    margin: 0 auto;
  }

  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem;
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 0.75rem;
  }

  .stat-icon {
    font-size: 1.5rem;
    margin-bottom: 0.25rem;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
  }

  .stat-label {
    font-size: 0.75rem;
    color: #64748b;
  }

  .review-btn {
    display: inline-block;
    margin-top: 1.5rem;
    padding: 1rem 2rem;
    background: linear-gradient(135deg, #3b82f6 0%, #22c55e 100%);
    color: white;
    text-decoration: none;
    border-radius: 999px;
    font-weight: 700;
    font-size: 1.1rem;
    transition: all 0.2s;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }

  .review-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
  }

  .level-section {
    margin-bottom: 3rem;
  }

  .level-title {
    font-size: 1.5rem;
    font-weight: 800;
    color: #1e293b;
    margin-bottom: 1.5rem;
    padding: 0.75rem 1rem;
    background: linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%);
    border-radius: 0.75rem;
    border-right: 4px solid #3b82f6;
  }

  .timeline {
    display: flex;
    flex-direction: column;
    gap: 3rem;
    position: relative;
  }

  /* Vertical Line */
  .timeline::before {
    content: '';
    position: absolute;
    left: 2rem; /* Align with icons */
    top: 0;
    bottom: 0;
    width: 2px;
    background: #e2e8f0;
    z-index: 0;
  }

  .module-section {
    position: relative;
    z-index: 1;
  }

  .module-title {
    background: #f1f5f9;
    display: inline-block;
    padding: 0.5rem 1rem;
    border-radius: 999px;
    font-size: 0.9rem;
    font-weight: 700;
    color: #475569;
    margin-bottom: 1.5rem;
    margin-left: 3.5rem;
  }

  .lessons-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .lesson-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: white;
    border: 1px solid #e2e8f0;
    padding: 1rem;
    border-radius: 1rem;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .lesson-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    border-color: #cbd5e1;
  }

  .lesson-card.locked {
    opacity: 0.6;
    pointer-events: none;
  }

  .lesson-card.locked:hover {
    transform: none;
    box-shadow: none;
  }

  .icon {
    width: 3rem;
    height: 3rem;
    background: #3b82f6;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.2rem;
    box-shadow: 0 0 0 4px #fff; /* Gap for timeline */
    flex-shrink: 0;
  }

  .icon.completed {
    background: #22c55e;
  }

  .icon.in-progress {
    background: #f59e0b;
  }

  .info {
    flex: 1;
  }

  .info h3 {
    font-size: 1.1rem;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 0.25rem;
  }

  .info p {
    font-size: 0.9rem;
    color: #64748b;
  }

  .start-btn {
    background: #22c55e;
    color: white;
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: 999px;
    font-weight: 600;
    font-size: 0.9rem;
    transition: background 0.2s;
    border: none;
    cursor: pointer;
  }

  .start-btn:hover {
    background: #16a34a;
  }

  .start-btn.completed {
    background: #3b82f6;
  }

  .start-btn.completed:hover {
    background: #2563eb;
  }

  .locked-btn {
    background: #cbd5e1;
    color: #94a3b8;
    cursor: not-allowed;
  }

  .locked-btn:hover {
    background: #cbd5e1;
  }

  @media (max-width: 600px) {
    .timeline::before {
        left: 1.5rem;
    }
    .icon {
        width: 2.5rem;
        height: 2.5rem;
        font-size: 1rem;
    }
    .module-title {
        margin-left: 0;
        margin-bottom: 1rem;
        display: block;
        text-align: center;
    }
  }
</style>
