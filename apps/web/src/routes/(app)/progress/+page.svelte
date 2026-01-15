<script lang="ts">
  import { A1_MODULES } from "$lib/data/modules";
  import { onMount } from "svelte";
  import { db } from "$lib/db";
  import { liveQuery } from "dexie";
  import { XPBar, StreakCounter } from '@pkg/ui';

  let showResetConfirm = false;
  let isResetting = false;

  async function resetAllProgress() {
    isResetting = true;
    try {
      // Clear all progress data
      await db.lessonProgress.clear();
      await db.wrongAnswers.clear();
      await db.vocab.clear();

      // Reset user stats
      await db.users.update(1, {
        xp: 0,
        streak: 0,
        totalStudyMinutes: 0,
        lastStudyDate: ''
      });

      showResetConfirm = false;
      alert('Progress has been reset successfully!');
    } catch (error) {
      console.error('Error resetting progress:', error);
      alert('Failed to reset progress. Please try again.');
    } finally {
      isResetting = false;
    }
  }

  // Reactive queries for user stats
  const user = liveQuery(() => db.users.get(1));

  const progressMap = liveQuery(async () => {
    const allProgress = await db.lessonProgress.toArray();
    return new Map(allProgress.map(p => [p.lessonId, p]));
  });

  const completedCount = liveQuery(() =>
    db.lessonProgress.where('status').equals('completed').count()
  );

  const vocabStats = liveQuery(async () => {
    const allVocab = await db.vocab.toArray();
    const now = new Date();

    // Count by SRS level (Leitner boxes)
    const byLevel = {
      0: 0, // New/Learning
      1: 0, // Box 1 (1 day)
      2: 0, // Box 2 (3 days)
      3: 0, // Box 3 (1 week)
      4: 0, // Box 4 (2 weeks)
      5: 0, // Box 5 (1 month - Mastered)
    };

    allVocab.forEach(v => {
      const level = v.srsLevel || 0;
      byLevel[level] = (byLevel[level] || 0) + 1;
    });

    const dueCount = allVocab.filter(v =>
      v.nextReview && new Date(v.nextReview) <= now
    ).length;

    return {
      total: allVocab.length,
      byLevel,
      dueCount
    };
  });

  // Calculate total lessons
  const totalLessons = A1_MODULES.reduce((sum, m) => sum + m.lessons.length, 0);

  // XP for level display
  $: currentXP = ($user?.xp || 0) % 100;
  $: level = Math.floor(($user?.xp || 0) / 100) + 1;
  const levelXP = 100;

  // Calculate study time in hours
  $: studyHours = $user?.totalStudyMinutes
    ? Math.floor($user.totalStudyMinutes / 60)
    : 0;
  $: studyMinutes = $user?.totalStudyMinutes
    ? $user.totalStudyMinutes % 60
    : 0;

  // Calculate module progress
  function getModuleProgress(module: typeof A1_MODULES[0]) {
    if (!$progressMap) return { completed: 0, total: module.lessons.length, percentage: 0 };

    const completed = module.lessons.filter(lesson => {
      const progress = $progressMap.get(lesson.id);
      return progress && progress.status === 'completed';
    }).length;

    const percentage = Math.round((completed / module.lessons.length) * 100);

    return { completed, total: module.lessons.length, percentage };
  }
</script>

<div class="progress-page" dir="rtl">
  <header class="header">
    <h1 class="title">پیشرفت من</h1>
    <p class="subtitle">مسیر یادگیری آلمانی شما</p>
  </header>

  <!-- XP and Streak Section -->
  {#if $user}
    <section class="gamification-section">
      <div class="xp-wrapper">
        <XPBar {currentXP} {levelXP} {level} />
      </div>
      <div class="streak-wrapper">
        <StreakCounter streak={$user?.streak || 0} size="lg" />
      </div>
    </section>
  {/if}

  <!-- Overview Stats -->
  <section class="stats-section">
    <div class="stats-grid">
      <div class="stat-card streak-card">
        <div class="stat-icon-wrapper">
          <span class="stat-icon">🔥</span>
        </div>
        <div class="stat-content">
          <div class="stat-value">{$user?.streak || 0}</div>
          <div class="stat-label">روز پیاپی</div>
        </div>
      </div>

      <div class="stat-card xp-card">
        <div class="stat-icon-wrapper">
          <span class="stat-icon">⭐</span>
        </div>
        <div class="stat-content">
          <div class="stat-value">{$user?.xp || 0}</div>
          <div class="stat-label">امتیاز XP</div>
        </div>
      </div>

      <div class="stat-card time-card">
        <div class="stat-icon-wrapper">
          <span class="stat-icon">⏱️</span>
        </div>
        <div class="stat-content">
          <div class="stat-value">
            {#if studyHours > 0}
              {studyHours}:{studyMinutes.toString().padStart(2, '0')}
            {:else}
              {studyMinutes}
            {/if}
          </div>
          <div class="stat-label">
            {studyHours > 0 ? 'ساعت مطالعه' : 'دقیقه مطالعه'}
          </div>
        </div>
      </div>

      <div class="stat-card lessons-card">
        <div class="stat-icon-wrapper">
          <span class="stat-icon">✅</span>
        </div>
        <div class="stat-content">
          <div class="stat-value">{$completedCount || 0}/{totalLessons}</div>
          <div class="stat-label">درس تکمیل شده</div>
        </div>
      </div>
    </div>
  </section>

  <!-- Module Progress -->
  <section class="modules-section">
    <h2 class="section-title">
      <span class="section-icon">📊</span>
      پیشرفت بخش‌ها
    </h2>

    <div class="modules-list">
      {#each A1_MODULES as module}
        {@const progress = getModuleProgress(module)}
        <div class="module-card" class:complete={progress.percentage === 100}>
          <div class="module-header">
            <h3 class="module-name">{module.title}</h3>
            <span class="module-percentage" class:complete={progress.percentage === 100}>
              {progress.percentage}%
            </span>
          </div>

          <div class="progress-bar">
            <div
              class="progress-fill"
              style="width: {progress.percentage}%"
              class:complete={progress.percentage === 100}
            ></div>
          </div>

          <div class="module-stats">
            <span>{progress.completed} از {progress.total} درس</span>
            {#if progress.percentage === 100}
              <span class="complete-badge">تکمیل شده</span>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </section>

  <!-- Vocabulary Stats -->
  {#if $vocabStats && $vocabStats.total > 0}
    <section class="vocab-section">
      <h2 class="section-title">
        <span class="section-icon">📚</span>
        تسلط بر واژگان
      </h2>

      <div class="vocab-overview">
        <div class="vocab-total">
          <span class="vocab-icon">📚</span>
          <div>
            <div class="vocab-number">{$vocabStats.total}</div>
            <div class="vocab-label">کلمه ذخیره شده</div>
          </div>
        </div>

        {#if $vocabStats.dueCount > 0}
          <div class="vocab-due">
            <span class="vocab-icon">🎴</span>
            <div>
              <div class="vocab-number">{$vocabStats.dueCount}</div>
              <div class="vocab-label">کارت آماده مرور</div>
            </div>
          </div>
        {/if}
      </div>

      <div class="vocab-boxes">
        <h3 class="vocab-boxes-title">سطح یادگیری (سیستم Leitner)</h3>

        <div class="boxes-grid">
          <div class="box-item mastered" class:highlight={$vocabStats.byLevel[5] > 0}>
            <div class="box-level">جعبه ۵</div>
            <div class="box-count">{$vocabStats.byLevel[5] || 0}</div>
            <div class="box-label">تسلط کامل</div>
          </div>

          <div class="box-item" class:highlight={$vocabStats.byLevel[4] > 0}>
            <div class="box-level">جعبه ۴</div>
            <div class="box-count">{$vocabStats.byLevel[4] || 0}</div>
            <div class="box-label">۲ هفته</div>
          </div>

          <div class="box-item" class:highlight={$vocabStats.byLevel[3] > 0}>
            <div class="box-level">جعبه ۳</div>
            <div class="box-count">{$vocabStats.byLevel[3] || 0}</div>
            <div class="box-label">۱ هفته</div>
          </div>

          <div class="box-item" class:highlight={$vocabStats.byLevel[2] > 0}>
            <div class="box-level">جعبه ۲</div>
            <div class="box-count">{$vocabStats.byLevel[2] || 0}</div>
            <div class="box-label">۳ روز</div>
          </div>

          <div class="box-item" class:highlight={$vocabStats.byLevel[1] > 0}>
            <div class="box-level">جعبه ۱</div>
            <div class="box-count">{$vocabStats.byLevel[1] || 0}</div>
            <div class="box-label">۱ روز</div>
          </div>

          <div class="box-item learning" class:highlight={$vocabStats.byLevel[0] > 0}>
            <div class="box-level">جدید</div>
            <div class="box-count">{$vocabStats.byLevel[0] || 0}</div>
            <div class="box-label">در حال یادگیری</div>
          </div>
        </div>
      </div>

      {#if $vocabStats.dueCount > 0}
        <a href="/review/flashcards" class="review-cta">
          <span>🎴</span>
          <span>مرور {$vocabStats.dueCount} کارت</span>
        </a>
      {/if}
    </section>
  {/if}

  <!-- Encouragement Message -->
  {#if $completedCount === 0}
    <section class="encouragement">
      <div class="encouragement-card">
        <div class="encouragement-icon">🚀</div>
        <h3>شروع سفر یادگیری!</h3>
        <p>اولین درس خود را شروع کنید و مسیر یادگیری آلمانی را آغاز نمایید.</p>
        <a href="/" class="start-btn">شروع یادگیری</a>
      </div>
    </section>
  {:else if $completedCount === totalLessons}
    <section class="encouragement">
      <div class="encouragement-card success">
        <div class="encouragement-icon">🎉</div>
        <h3>تبریک! سطح A1 را تکمیل کردید</h3>
        <p>شما تمام درس‌های سطح مبتدی را به پایان رساندید. آماده برای سطح A2 هستید!</p>
      </div>
    </section>
  {/if}

  <!-- Reset Progress Section -->
  <section class="reset-section">
    <button class="reset-btn" on:click={() => showResetConfirm = true}>
      <span>🔄</span>
      <span>بازنشانی پیشرفت</span>
    </button>
    <p class="reset-hint">تمام پیشرفت، واژگان و امتیازها پاک می‌شود</p>
  </section>

  <!-- Reset Confirmation Modal -->
  {#if showResetConfirm}
    <div class="modal-overlay" on:click={() => showResetConfirm = false}>
      <div class="modal-content" on:click|stopPropagation>
        <div class="modal-icon">⚠️</div>
        <h3>بازنشانی پیشرفت</h3>
        <p>آیا مطمئن هستید؟ این عمل غیرقابل بازگشت است و تمام موارد زیر پاک خواهند شد:</p>
        <ul class="reset-list">
          <li>پیشرفت تمام درس‌ها</li>
          <li>واژگان ذخیره شده</li>
          <li>امتیازها و XP</li>
          <li>روزهای پیاپی (streak)</li>
        </ul>
        <div class="modal-actions">
          <button class="cancel-btn" on:click={() => showResetConfirm = false} disabled={isResetting}>
            انصراف
          </button>
          <button class="confirm-reset-btn" on:click={resetAllProgress} disabled={isResetting}>
            {#if isResetting}
              در حال بازنشانی...
            {:else}
              بله، پاک کن
            {/if}
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .progress-page {
    max-width: 900px;
    margin: 0 auto;
    padding: var(--space-6, 1.5rem) var(--space-4, 1rem);
  }

  /* Header */
  .header {
    text-align: center;
    margin-bottom: var(--space-8, 2rem);
  }

  .title {
    font-size: var(--text-3xl, 1.875rem);
    font-weight: var(--font-extrabold, 800);
    margin: 0 0 var(--space-2, 0.5rem);
    background: linear-gradient(135deg, var(--color-primary-500, #0891b2), var(--color-xp-500, #4f46e5));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .subtitle {
    color: var(--color-neutral-500, #78716c);
    font-size: var(--text-base, 1rem);
    margin: 0;
  }

  /* Gamification Section */
  .gamification-section {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-8, 2rem);
    margin-bottom: var(--space-8, 2rem);
    flex-wrap: wrap;
  }

  .xp-wrapper {
    flex: 1;
    max-width: 400px;
    min-width: 250px;
  }

  .streak-wrapper {
    flex-shrink: 0;
  }

  /* Stats Section */
  .stats-section {
    margin-bottom: var(--space-10, 2.5rem);
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: var(--space-4, 1rem);
  }

  .stat-card {
    background: var(--glass-bg, rgba(253, 251, 247, 0.85));
    border: 1px solid var(--glass-border, rgba(212, 201, 185, 0.3));
    border-radius: var(--radius-xl, 1rem);
    padding: var(--space-5, 1.25rem);
    display: flex;
    align-items: center;
    gap: var(--space-4, 1rem);
    backdrop-filter: blur(var(--glass-blur, 12px));
    transition: all var(--transition-bounce, 400ms cubic-bezier(0.68, -0.55, 0.265, 1.55));
  }

  .stat-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg, 0 10px 25px -5px rgba(0, 0, 0, 0.1));
  }

  .stat-card.streak-card {
    border-color: var(--color-streak-400, #fbbf24);
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), var(--glass-bg));
  }

  .stat-card.xp-card {
    border-color: var(--color-xp-400, #818cf8);
    background: linear-gradient(135deg, rgba(79, 70, 229, 0.1), var(--glass-bg));
  }

  .stat-card.time-card {
    border-color: var(--color-primary-400, #22d3ee);
    background: linear-gradient(135deg, rgba(8, 145, 178, 0.1), var(--glass-bg));
  }

  .stat-card.lessons-card {
    border-color: var(--color-success-400, #facc15);
    background: linear-gradient(135deg, rgba(234, 179, 8, 0.1), var(--glass-bg));
  }

  .stat-icon-wrapper {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--glass-bg, rgba(253, 251, 247, 0.85));
    border-radius: var(--radius-lg, 0.75rem);
    box-shadow: var(--shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.05));
  }

  .stat-icon {
    font-size: var(--text-2xl, 1.5rem);
  }

  .stat-content {
    flex: 1;
  }

  .stat-value {
    font-size: var(--text-2xl, 1.5rem);
    font-weight: var(--font-bold, 700);
    color: var(--color-neutral-800, #292524);
    line-height: 1;
    margin-bottom: var(--space-1, 0.25rem);
  }

  .stat-label {
    font-size: var(--text-sm, 0.875rem);
    color: var(--color-neutral-500, #78716c);
  }

  /* Section Title */
  .section-title {
    display: flex;
    align-items: center;
    gap: var(--space-3, 0.75rem);
    font-size: var(--text-xl, 1.25rem);
    font-weight: var(--font-bold, 700);
    color: var(--color-neutral-800, #292524);
    margin-bottom: var(--space-6, 1.5rem);
  }

  .section-icon {
    font-size: var(--text-xl, 1.25rem);
  }

  /* Modules Section */
  .modules-section {
    margin-bottom: var(--space-10, 2.5rem);
  }

  .modules-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-4, 1rem);
  }

  .module-card {
    background: var(--glass-bg, rgba(253, 251, 247, 0.85));
    border: 1px solid var(--glass-border, rgba(212, 201, 185, 0.3));
    border-radius: var(--radius-xl, 1rem);
    padding: var(--space-5, 1.25rem);
    backdrop-filter: blur(var(--glass-blur, 12px));
    transition: all var(--transition-normal, 200ms);
  }

  .module-card:hover {
    border-color: var(--color-primary-300, #67e8f9);
    box-shadow: var(--shadow-md, 0 4px 15px rgba(0, 0, 0, 0.08));
  }

  .module-card.complete {
    border-color: var(--color-success-400, #facc15);
    background: linear-gradient(135deg, rgba(234, 179, 8, 0.05), var(--glass-bg));
  }

  .module-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-3, 0.75rem);
  }

  .module-name {
    font-size: var(--text-base, 1rem);
    font-weight: var(--font-bold, 700);
    color: var(--color-neutral-800, #292524);
    margin: 0;
  }

  .module-percentage {
    font-size: var(--text-lg, 1.125rem);
    font-weight: var(--font-bold, 700);
    color: var(--color-primary-500, #0891b2);
  }

  .module-percentage.complete {
    color: var(--color-success-600, #ca8a04);
  }

  .progress-bar {
    width: 100%;
    height: 8px;
    background: var(--color-neutral-200, #e8e0d5);
    border-radius: var(--radius-full, 9999px);
    overflow: hidden;
    margin-bottom: var(--space-3, 0.75rem);
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--color-primary-500, #0891b2), var(--color-xp-500, #4f46e5));
    transition: width 0.5s ease;
    border-radius: var(--radius-full, 9999px);
  }

  .progress-fill.complete {
    background: linear-gradient(90deg, var(--color-success-500, #eab308), var(--color-success-600, #ca8a04));
  }

  .module-stats {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: var(--text-sm, 0.875rem);
    color: var(--color-neutral-500, #78716c);
  }

  .complete-badge {
    background: linear-gradient(135deg, var(--color-success-100, #fef9c3), var(--color-success-50, #fefce8));
    color: var(--color-success-700, #a16207);
    padding: var(--space-1, 0.25rem) var(--space-3, 0.75rem);
    border-radius: var(--radius-full, 9999px);
    font-weight: var(--font-medium, 500);
    font-size: var(--text-xs, 0.75rem);
  }

  /* Vocabulary Section */
  .vocab-section {
    background: linear-gradient(135deg, var(--color-neutral-50, #fdfbf7), var(--color-neutral-100, #f5f0e8));
    border: 1px solid var(--glass-border, rgba(212, 201, 185, 0.3));
    border-radius: var(--radius-2xl, 1.5rem);
    padding: var(--space-8, 2rem);
    margin-bottom: var(--space-10, 2.5rem);
  }

  .vocab-overview {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-4, 1rem);
    margin-bottom: var(--space-8, 2rem);
  }

  .vocab-total,
  .vocab-due {
    background: var(--glass-bg, rgba(253, 251, 247, 0.95));
    border: 1px solid var(--glass-border, rgba(212, 201, 185, 0.3));
    border-radius: var(--radius-xl, 1rem);
    padding: var(--space-5, 1.25rem);
    display: flex;
    align-items: center;
    gap: var(--space-4, 1rem);
  }

  .vocab-due {
    border-color: var(--color-streak-400, #fbbf24);
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), var(--glass-bg));
  }

  .vocab-icon {
    font-size: var(--text-3xl, 1.875rem);
  }

  .vocab-number {
    font-size: var(--text-2xl, 1.5rem);
    font-weight: var(--font-bold, 700);
    color: var(--color-neutral-800, #292524);
  }

  .vocab-label {
    font-size: var(--text-sm, 0.875rem);
    color: var(--color-neutral-500, #78716c);
  }

  .vocab-boxes {
    margin-bottom: var(--space-6, 1.5rem);
  }

  .vocab-boxes-title {
    font-size: var(--text-base, 1rem);
    font-weight: var(--font-semibold, 600);
    color: var(--color-neutral-600, #57534e);
    margin: 0 0 var(--space-4, 1rem);
  }

  .boxes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: var(--space-3, 0.75rem);
  }

  .box-item {
    background: var(--glass-bg, rgba(253, 251, 247, 0.95));
    border: 2px solid var(--color-neutral-200, #e8e0d5);
    border-radius: var(--radius-lg, 0.75rem);
    padding: var(--space-4, 1rem);
    text-align: center;
    transition: all var(--transition-normal, 200ms);
  }

  .box-item.highlight {
    border-color: var(--color-xp-400, #818cf8);
    background: linear-gradient(135deg, rgba(79, 70, 229, 0.1), var(--glass-bg));
  }

  .box-item.mastered.highlight {
    border-color: var(--color-success-500, #eab308);
    background: linear-gradient(135deg, rgba(234, 179, 8, 0.15), var(--glass-bg));
  }

  .box-item.learning.highlight {
    border-color: var(--color-streak-400, #fbbf24);
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), var(--glass-bg));
  }

  .box-level {
    font-size: var(--text-xs, 0.75rem);
    font-weight: var(--font-semibold, 600);
    color: var(--color-neutral-500, #78716c);
    margin-bottom: var(--space-2, 0.5rem);
  }

  .box-count {
    font-size: var(--text-2xl, 1.5rem);
    font-weight: var(--font-bold, 700);
    color: var(--color-neutral-800, #292524);
    margin-bottom: var(--space-1, 0.25rem);
  }

  .box-label {
    font-size: var(--text-xs, 0.75rem);
    color: var(--color-neutral-500, #78716c);
  }

  .review-cta {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2, 0.5rem);
    padding: var(--space-4, 1rem) var(--space-6, 1.5rem);
    background: linear-gradient(135deg, var(--color-primary-500, #0891b2), var(--color-gem-500, #059669));
    color: white;
    text-decoration: none;
    border-radius: var(--radius-full, 9999px);
    font-weight: var(--font-bold, 700);
    font-size: var(--text-lg, 1.125rem);
    transition: all var(--transition-normal, 200ms);
    box-shadow: 0 4px 15px rgba(8, 145, 178, 0.3);
  }

  .review-cta:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 6px 20px rgba(8, 145, 178, 0.4);
  }

  /* Encouragement Section */
  .encouragement {
    margin-bottom: var(--space-8, 2rem);
  }

  .encouragement-card {
    background: linear-gradient(135deg, var(--color-primary-50, #ecfeff), var(--color-primary-100, #cffafe));
    border: 2px solid var(--color-primary-300, #67e8f9);
    border-radius: var(--radius-2xl, 1.5rem);
    padding: var(--space-10, 2.5rem);
    text-align: center;
  }

  .encouragement-card.success {
    background: linear-gradient(135deg, var(--color-success-50, #fefce8), var(--color-success-100, #fef9c3));
    border-color: var(--color-success-400, #facc15);
  }

  .encouragement-icon {
    font-size: 4rem;
    margin-bottom: var(--space-4, 1rem);
  }

  .encouragement-card h3 {
    font-size: var(--text-xl, 1.25rem);
    font-weight: var(--font-bold, 700);
    color: var(--color-neutral-800, #292524);
    margin: 0 0 var(--space-3, 0.75rem);
  }

  .encouragement-card p {
    font-size: var(--text-base, 1rem);
    color: var(--color-neutral-600, #57534e);
    margin: 0 0 var(--space-6, 1.5rem);
  }

  .start-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-3, 0.75rem) var(--space-8, 2rem);
    background: linear-gradient(135deg, var(--color-primary-500, #0891b2), var(--color-primary-600, #0e7490));
    color: white;
    text-decoration: none;
    border-radius: var(--radius-full, 9999px);
    font-weight: var(--font-bold, 700);
    font-size: var(--text-base, 1rem);
    transition: all var(--transition-normal, 200ms);
    box-shadow: 0 4px 15px rgba(8, 145, 178, 0.3);
    min-height: 48px;
  }

  .start-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(8, 145, 178, 0.4);
  }

  /* Reset Section */
  .reset-section {
    margin-top: var(--space-10, 2.5rem);
    padding-top: var(--space-6, 1.5rem);
    border-top: 1px solid var(--color-neutral-200, #e8e0d5);
    text-align: center;
  }

  .reset-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2, 0.5rem);
    padding: var(--space-3, 0.75rem) var(--space-6, 1.5rem);
    background: transparent;
    color: var(--color-neutral-500, #78716c);
    border: 2px solid var(--color-neutral-200, #e8e0d5);
    border-radius: var(--radius-full, 9999px);
    font-size: var(--text-sm, 0.875rem);
    font-weight: var(--font-semibold, 600);
    cursor: pointer;
    transition: all var(--transition-normal, 200ms);
  }

  .reset-btn:hover {
    color: var(--color-error-500, #a91e1e);
    border-color: var(--color-error-400, #c84b4b);
    background: var(--color-error-50, #fef2f2);
  }

  .reset-hint {
    margin-top: var(--space-2, 0.5rem);
    font-size: var(--text-sm, 0.875rem);
    color: var(--color-neutral-400, #a69b8a);
  }

  /* Modal Styles */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    padding: var(--space-4, 1rem);
  }

  .modal-content {
    background: var(--color-neutral-50, #fdfbf7);
    border-radius: var(--radius-2xl, 1.5rem);
    padding: var(--space-8, 2rem);
    max-width: 400px;
    width: 100%;
    text-align: center;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  }

  .modal-icon {
    font-size: 4rem;
    margin-bottom: var(--space-4, 1rem);
  }

  .modal-content h3 {
    font-size: var(--text-xl, 1.25rem);
    font-weight: var(--font-bold, 700);
    color: var(--color-neutral-800, #292524);
    margin: 0 0 var(--space-3, 0.75rem);
  }

  .modal-content p {
    color: var(--color-neutral-600, #57534e);
    margin: 0 0 var(--space-4, 1rem);
    line-height: 1.6;
  }

  .reset-list {
    text-align: right;
    background: var(--color-error-50, #fef2f2);
    border: 1px solid var(--color-error-200, #fecaca);
    padding: var(--space-4, 1rem) var(--space-5, 1.25rem);
    border-radius: var(--radius-lg, 0.75rem);
    margin: 0 0 var(--space-6, 1.5rem);
    list-style: none;
  }

  .reset-list li {
    padding: var(--space-1, 0.25rem) 0;
    color: var(--color-error-600, #8b1a1a);
    font-size: var(--text-sm, 0.875rem);
  }

  .reset-list li::before {
    content: '✗ ';
  }

  .modal-actions {
    display: flex;
    gap: var(--space-3, 0.75rem);
    justify-content: center;
  }

  .cancel-btn {
    padding: var(--space-3, 0.75rem) var(--space-6, 1.5rem);
    background: var(--color-neutral-100, #f5f0e8);
    color: var(--color-neutral-600, #57534e);
    border: none;
    border-radius: var(--radius-full, 9999px);
    font-size: var(--text-base, 1rem);
    font-weight: var(--font-semibold, 600);
    cursor: pointer;
    transition: all var(--transition-normal, 200ms);
    min-height: 48px;
  }

  .cancel-btn:hover:not(:disabled) {
    background: var(--color-neutral-200, #e8e0d5);
  }

  .confirm-reset-btn {
    padding: var(--space-3, 0.75rem) var(--space-6, 1.5rem);
    background: linear-gradient(135deg, var(--color-error-500, #a91e1e), var(--color-error-600, #8b1a1a));
    color: white;
    border: none;
    border-radius: var(--radius-full, 9999px);
    font-size: var(--text-base, 1rem);
    font-weight: var(--font-semibold, 600);
    cursor: pointer;
    transition: all var(--transition-normal, 200ms);
    min-height: 48px;
    box-shadow: 0 4px 15px rgba(169, 30, 30, 0.3);
  }

  .confirm-reset-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(169, 30, 30, 0.4);
  }

  .confirm-reset-btn:disabled,
  .cancel-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Dark Mode */
  :global([data-theme="dark"]) .title {
    background: linear-gradient(135deg, var(--color-primary-400, #22d3ee), var(--color-xp-400, #818cf8));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  :global([data-theme="dark"]) .section-title {
    color: var(--color-neutral-100, #f5f0e8);
  }

  :global([data-theme="dark"]) .stat-card,
  :global([data-theme="dark"]) .module-card,
  :global([data-theme="dark"]) .box-item {
    background: rgba(28, 25, 23, 0.85);
    border-color: rgba(68, 64, 60, 0.3);
  }

  :global([data-theme="dark"]) .stat-value,
  :global([data-theme="dark"]) .module-name,
  :global([data-theme="dark"]) .vocab-number,
  :global([data-theme="dark"]) .box-count {
    color: var(--color-neutral-100, #f5f0e8);
  }

  :global([data-theme="dark"]) .vocab-section {
    background: linear-gradient(135deg, rgba(28, 25, 23, 0.95), rgba(41, 37, 36, 0.95));
  }

  :global([data-theme="dark"]) .modal-content {
    background: var(--color-neutral-100, #292524);
  }

  :global([data-theme="dark"]) .modal-content h3 {
    color: var(--color-neutral-100, #f5f0e8);
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .progress-page {
      padding: var(--space-4, 1rem);
    }

    .title {
      font-size: var(--text-2xl, 1.5rem);
    }

    .gamification-section {
      flex-direction: column;
      gap: var(--space-4, 1rem);
    }

    .xp-wrapper {
      max-width: 100%;
      width: 100%;
    }

    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .stat-card {
      flex-direction: column;
      text-align: center;
      padding: var(--space-4, 1rem);
    }

    .boxes-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 480px) {
    .stats-grid {
      grid-template-columns: 1fr;
    }

    .vocab-overview {
      grid-template-columns: 1fr;
    }

    .boxes-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
