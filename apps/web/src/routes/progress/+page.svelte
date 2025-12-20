<script lang="ts">
  import { A1_MODULES } from "$lib/data/modules";
  import { onMount } from "svelte";
  import { db } from "$lib/db";
  import { liveQuery } from "dexie";

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
    <h1>پیشرفت من</h1>
    <p class="subtitle">مسیر یادگیری آلمانی شما</p>
  </header>

  <!-- Overview Stats -->
  <section class="stats-section">
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">🔥</div>
        <div class="stat-content">
          <div class="stat-value">{$user?.streak || 0}</div>
          <div class="stat-label">روز پیاپی</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">⭐</div>
        <div class="stat-content">
          <div class="stat-value">{$user?.xp || 0}</div>
          <div class="stat-label">امتیاز XP</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">⏱️</div>
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

      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <div class="stat-value">{$completedCount || 0}/{totalLessons}</div>
          <div class="stat-label">درس تکمیل شده</div>
        </div>
      </div>
    </div>
  </section>

  <!-- Module Progress -->
  <section class="modules-section">
    <h2 class="section-title">پیشرفت بخش‌ها</h2>

    <div class="modules-list">
      {#each A1_MODULES as module}
        {@const progress = getModuleProgress(module)}
        <div class="module-card">
          <div class="module-header">
            <h3 class="module-name">{module.title}</h3>
            <span class="module-percentage">{progress.percentage}%</span>
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
          </div>
        </div>
      {/each}
    </div>
  </section>

  <!-- Vocabulary Stats -->
  {#if $vocabStats && $vocabStats.total > 0}
    <section class="vocab-section">
      <h2 class="section-title">تسلط بر واژگان</h2>

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
          <div class="box-item" class:highlight={$vocabStats.byLevel[5] > 0}>
            <div class="box-level">جعبه ۵</div>
            <div class="box-count">{$vocabStats.byLevel[5] || 0}</div>
            <div class="box-label">تسلط کامل 🏆</div>
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
            <div class="box-label">در حال یادگیری 📖</div>
          </div>
        </div>
      </div>

      {#if $vocabStats.dueCount > 0}
        <a href="/review/flashcards" class="review-cta">
          🎴 مرور {$vocabStats.dueCount} کارت
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
      🔄 بازنشانی پیشرفت
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
    padding: 2rem 1rem;
    font-family: 'Vazirmatn', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }

  .header {
    text-align: center;
    margin-bottom: 3rem;
  }

  .header h1 {
    font-size: 2.5rem;
    font-weight: 800;
    color: #1e293b;
    margin-bottom: 0.5rem;
  }

  .subtitle {
    color: #64748b;
    font-size: 1.1rem;
  }

  /* Stats Section */
  .stats-section {
    margin-bottom: 3rem;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
  }

  .stat-card {
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 1rem;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: all 0.2s;
  }

  .stat-card:hover {
    border-color: #3b82f6;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
    transform: translateY(-2px);
  }

  .stat-icon {
    font-size: 2.5rem;
  }

  .stat-content {
    flex: 1;
  }

  .stat-value {
    font-size: 1.75rem;
    font-weight: 700;
    color: #1e293b;
    line-height: 1;
    margin-bottom: 0.25rem;
  }

  .stat-label {
    font-size: 0.875rem;
    color: #64748b;
  }

  /* Modules Section */
  .modules-section {
    margin-bottom: 3rem;
  }

  .section-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 1.5rem;
  }

  .modules-list {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .module-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 1rem;
    padding: 1.5rem;
    transition: all 0.2s;
  }

  .module-card:hover {
    border-color: #cbd5e1;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .module-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .module-name {
    font-size: 1.1rem;
    font-weight: 700;
    color: #0f172a;
  }

  .module-percentage {
    font-size: 1.25rem;
    font-weight: 700;
    color: #3b82f6;
  }

  .progress-bar {
    width: 100%;
    height: 8px;
    background: #e2e8f0;
    border-radius: 999px;
    overflow: hidden;
    margin-bottom: 0.75rem;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%);
    transition: width 0.3s ease;
    border-radius: 999px;
  }

  .progress-fill.complete {
    background: linear-gradient(90deg, #22c55e 0%, #10b981 100%);
  }

  .module-stats {
    font-size: 0.875rem;
    color: #64748b;
  }

  /* Vocabulary Section */
  .vocab-section {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border-radius: 1.5rem;
    padding: 2rem;
    margin-bottom: 3rem;
  }

  .vocab-overview {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .vocab-total,
  .vocab-due {
    background: white;
    border-radius: 1rem;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    border: 2px solid #e2e8f0;
  }

  .vocab-due {
    border-color: #fbbf24;
    background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  }

  .vocab-icon {
    font-size: 2.5rem;
  }

  .vocab-number {
    font-size: 2rem;
    font-weight: 700;
    color: #1e293b;
  }

  .vocab-label {
    font-size: 0.875rem;
    color: #64748b;
  }

  .vocab-boxes-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #475569;
    margin-bottom: 1rem;
  }

  .boxes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .box-item {
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 0.75rem;
    padding: 1rem;
    text-align: center;
    transition: all 0.2s;
  }

  .box-item.highlight {
    border-color: #3b82f6;
    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  }

  .box-item.learning.highlight {
    border-color: #f59e0b;
    background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  }

  .box-level {
    font-size: 0.75rem;
    font-weight: 600;
    color: #64748b;
    margin-bottom: 0.5rem;
  }

  .box-count {
    font-size: 1.75rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 0.25rem;
  }

  .box-label {
    font-size: 0.75rem;
    color: #64748b;
  }

  .review-cta {
    display: block;
    text-align: center;
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

  .review-cta:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
  }

  /* Encouragement Section */
  .encouragement {
    margin-bottom: 2rem;
  }

  .encouragement-card {
    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
    border: 2px solid #3b82f6;
    border-radius: 1.5rem;
    padding: 2.5rem;
    text-align: center;
  }

  .encouragement-card.success {
    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
    border-color: #22c55e;
  }

  .encouragement-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .encouragement-card h3 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 0.75rem;
  }

  .encouragement-card p {
    font-size: 1.1rem;
    color: #64748b;
    margin-bottom: 1.5rem;
  }

  .start-btn {
    display: inline-block;
    padding: 0.875rem 2rem;
    background: #3b82f6;
    color: white;
    text-decoration: none;
    border-radius: 999px;
    font-weight: 700;
    font-size: 1rem;
    transition: all 0.2s;
  }

  .start-btn:hover {
    background: #2563eb;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .progress-page {
      padding: 1.5rem 1rem;
    }

    .header h1 {
      font-size: 2rem;
    }

    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .stat-card {
      flex-direction: column;
      text-align: center;
      padding: 1rem;
    }

    .stat-icon {
      font-size: 2rem;
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
  }

  /* Reset Section */
  .reset-section {
    margin-top: 3rem;
    padding-top: 2rem;
    border-top: 1px solid #e2e8f0;
    text-align: center;
  }

  .reset-btn {
    padding: 0.75rem 1.5rem;
    background: transparent;
    color: #64748b;
    border: 2px solid #e2e8f0;
    border-radius: 999px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .reset-btn:hover {
    color: #ef4444;
    border-color: #ef4444;
    background: #fef2f2;
  }

  .reset-hint {
    margin-top: 0.5rem;
    font-size: 0.85rem;
    color: #94a3b8;
  }

  /* Modal Styles */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    padding: 1rem;
  }

  .modal-content {
    background: white;
    border-radius: 1.5rem;
    padding: 2rem;
    max-width: 400px;
    width: 100%;
    text-align: center;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  }

  .modal-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .modal-content h3 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 0.75rem;
  }

  .modal-content p {
    color: #64748b;
    margin-bottom: 1rem;
    line-height: 1.6;
  }

  .reset-list {
    text-align: right;
    background: #fef2f2;
    padding: 1rem 1.5rem;
    border-radius: 0.75rem;
    margin-bottom: 1.5rem;
    list-style: none;
  }

  .reset-list li {
    padding: 0.25rem 0;
    color: #b91c1c;
    font-size: 0.95rem;
  }

  .reset-list li::before {
    content: '✗ ';
  }

  .modal-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }

  .cancel-btn {
    padding: 0.75rem 1.5rem;
    background: #f1f5f9;
    color: #64748b;
    border: none;
    border-radius: 999px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .cancel-btn:hover:not(:disabled) {
    background: #e2e8f0;
  }

  .confirm-reset-btn {
    padding: 0.75rem 1.5rem;
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 999px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .confirm-reset-btn:hover:not(:disabled) {
    background: #dc2626;
  }

  .confirm-reset-btn:disabled,
  .cancel-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>
