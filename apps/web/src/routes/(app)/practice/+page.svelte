<script lang="ts">
  import { db } from "$lib/db";
  import { liveQuery } from "dexie";

  // Real-time stats from database
  const dueCardsCount = liveQuery(async () => {
    const now = new Date();
    return await db.vocab.where('nextReview').belowOrEqual(now).count();
  });

  const wrongAnswersCount = liveQuery(async () => {
    // Count unreviewed wrong answers
    return await db.wrongAnswers.filter(w => !w.reviewedAt).count();
  });

  const completedLessonsCount = liveQuery(() =>
    db.lessonProgress.where('status').equals('completed').count()
  );

  const totalVocabCount = liveQuery(() => db.vocab.count());
</script>

<div class="practice-hub" dir="rtl">
  <header class="header">
    <h1 class="title">تمرین‌ها</h1>
    <p class="subtitle">تقویت مهارت‌های آلمانی با تمرینات مختلف</p>
  </header>

  <div class="practice-modes">
    <!-- Vocabulary Review Mode -->
    <a
      href="/review/flashcards"
      class="practice-card vocab-card"
      class:disabled={!$dueCardsCount || $dueCardsCount === 0}
    >
      <div class="card-icon-wrapper vocab">
        <span class="card-icon">🎴</span>
      </div>
      <div class="card-content">
        <h2 class="card-title">مرور واژگان</h2>
        <p class="card-description">
          تمرین فلش‌کارت با سیستم Leitner برای یادگیری بلندمدت
        </p>
        <div class="card-stats">
          {#if $dueCardsCount > 0}
            <span class="stat-badge due">{$dueCardsCount} کارت آماده مرور</span>
          {:else if $totalVocabCount > 0}
            <span class="stat-badge success">همه کارت‌ها مرور شده‌اند!</span>
          {:else}
            <span class="stat-badge neutral">هنوز واژه‌ای ذخیره نکرده‌اید</span>
          {/if}
        </div>
      </div>
      <div class="card-arrow">
        {#if $dueCardsCount > 0}
          <span class="arrow-icon">←</span>
        {:else}
          <span class="lock-icon">🔒</span>
        {/if}
      </div>
    </a>

    <!-- Practice Your Mistakes Mode -->
    <a
      href="/practice/mistakes"
      class="practice-card mistakes-card"
      class:disabled={!$wrongAnswersCount || $wrongAnswersCount === 0}
    >
      <div class="card-icon-wrapper mistakes">
        <span class="card-icon">❌</span>
      </div>
      <div class="card-content">
        <h2 class="card-title">تمرین اشتباهات</h2>
        <p class="card-description">
          سوالاتی که اشتباه جواب داده‌اید را دوباره تمرین کنید
        </p>
        <div class="card-stats">
          {#if $wrongAnswersCount > 0}
            <span class="stat-badge due">{$wrongAnswersCount} سوال برای مرور</span>
          {:else if $completedLessonsCount > 0}
            <span class="stat-badge success">اشتباهی برای مرور وجود ندارد!</span>
          {:else}
            <span class="stat-badge neutral">ابتدا یک درس را تکمیل کنید</span>
          {/if}
        </div>
      </div>
      <div class="card-arrow">
        {#if $wrongAnswersCount > 0}
          <span class="arrow-icon">←</span>
        {:else}
          <span class="lock-icon">🔒</span>
        {/if}
      </div>
    </a>

    <!-- Random Drill Mode (Coming Soon) -->
    <div class="practice-card random-card disabled">
      <div class="card-icon-wrapper random">
        <span class="card-icon">🎲</span>
      </div>
      <div class="card-content">
        <h2 class="card-title">تمرین تصادفی</h2>
        <p class="card-description">
          تمرینات ترکیبی از تمام درس‌های تکمیل شده
        </p>
        <div class="card-stats">
          <span class="stat-badge coming-soon">قریباً...</span>
        </div>
      </div>
      <div class="card-arrow">
        <span class="lock-icon">🔒</span>
      </div>
    </div>

    <!-- Listening Practice Mode (Coming Soon) -->
    <div class="practice-card listening-card disabled">
      <div class="card-icon-wrapper listening">
        <span class="card-icon">🎧</span>
      </div>
      <div class="card-content">
        <h2 class="card-title">تمرین شنیداری</h2>
        <p class="card-description">
          تقویت مهارت شنیداری با تلفظ آلمانی
        </p>
        <div class="card-stats">
          <span class="stat-badge coming-soon">قریباً...</span>
        </div>
      </div>
      <div class="card-arrow">
        <span class="lock-icon">🔒</span>
      </div>
    </div>
  </div>

  <!-- Quick Stats Summary -->
  {#if $completedLessonsCount > 0 || $totalVocabCount > 0}
    <div class="stats-summary">
      <h3 class="stats-title">
        <span class="stats-icon">📊</span>
        آمار کلی تمرین
      </h3>
      <div class="stats-grid">
        <div class="stat-item lessons">
          <span class="stat-number">{$completedLessonsCount || 0}</span>
          <span class="stat-label">درس تکمیل شده</span>
        </div>
        <div class="stat-item vocab">
          <span class="stat-number">{$totalVocabCount || 0}</span>
          <span class="stat-label">واژه ذخیره شده</span>
        </div>
        <div class="stat-item cards">
          <span class="stat-number">{$dueCardsCount || 0}</span>
          <span class="stat-label">کارت آماده مرور</span>
        </div>
        <div class="stat-item mistakes">
          <span class="stat-number">{$wrongAnswersCount || 0}</span>
          <span class="stat-label">اشتباه برای مرور</span>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .practice-hub {
    max-width: 900px;
    margin: 0 auto;
    padding: var(--space-6, 1.5rem) var(--space-4, 1rem);
  }

  /* Header */
  .header {
    text-align: center;
    margin-bottom: var(--space-10, 2.5rem);
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

  /* Practice Modes Grid */
  .practice-modes {
    display: grid;
    gap: var(--space-4, 1rem);
    margin-bottom: var(--space-10, 2.5rem);
  }

  /* Practice Card */
  .practice-card {
    display: flex;
    align-items: center;
    gap: var(--space-5, 1.25rem);
    background: var(--glass-bg, rgba(253, 251, 247, 0.85));
    border: 2px solid var(--glass-border, rgba(212, 201, 185, 0.3));
    border-radius: var(--radius-xl, 1rem);
    padding: var(--space-5, 1.25rem);
    text-decoration: none;
    color: inherit;
    backdrop-filter: blur(var(--glass-blur, 12px));
    transition: all var(--transition-bounce, 400ms cubic-bezier(0.68, -0.55, 0.265, 1.55));
    cursor: pointer;
  }

  .practice-card:not(.disabled):hover {
    border-color: var(--color-primary-400, #22d3ee);
    box-shadow: 0 8px 25px rgba(8, 145, 178, 0.15);
    transform: translateY(-4px) translateX(-4px);
  }

  .practice-card:not(.disabled):hover .card-icon-wrapper {
    transform: scale(1.1) rotate(-5deg);
  }

  .practice-card.disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: var(--color-neutral-100, #f5f0e8);
  }

  .practice-card.disabled:hover {
    transform: none;
    box-shadow: none;
    border-color: var(--glass-border, rgba(212, 201, 185, 0.3));
  }

  /* Card Icon */
  .card-icon-wrapper {
    width: 64px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-xl, 1rem);
    flex-shrink: 0;
    transition: all var(--transition-bounce, 400ms cubic-bezier(0.68, -0.55, 0.265, 1.55));
  }

  .card-icon-wrapper.vocab {
    background: linear-gradient(135deg, var(--color-xp-100, #e0e7ff), var(--color-xp-200, #c7d2fe));
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
  }

  .card-icon-wrapper.mistakes {
    background: linear-gradient(135deg, var(--color-error-50, #fef2f2), var(--color-error-100, #fee2e2));
    box-shadow: 0 4px 12px rgba(169, 30, 30, 0.15);
  }

  .card-icon-wrapper.random {
    background: linear-gradient(135deg, var(--color-streak-100, #fef3c7), var(--color-streak-200, #fde68a));
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
  }

  .card-icon-wrapper.listening {
    background: linear-gradient(135deg, var(--color-primary-100, #cffafe), var(--color-primary-200, #a5f3fc));
    box-shadow: 0 4px 12px rgba(8, 145, 178, 0.2);
  }

  .card-icon {
    font-size: var(--text-3xl, 1.875rem);
  }

  /* Card Content */
  .card-content {
    flex: 1;
    min-width: 0;
  }

  .card-title {
    font-size: var(--text-xl, 1.25rem);
    font-weight: var(--font-bold, 700);
    color: var(--color-neutral-800, #292524);
    margin: 0 0 var(--space-2, 0.5rem);
  }

  .card-description {
    font-size: var(--text-sm, 0.875rem);
    color: var(--color-neutral-500, #78716c);
    line-height: 1.6;
    margin: 0 0 var(--space-3, 0.75rem);
  }

  .card-stats {
    display: flex;
    gap: var(--space-2, 0.5rem);
    flex-wrap: wrap;
  }

  /* Stat Badges */
  .stat-badge {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1, 0.25rem);
    padding: var(--space-1, 0.25rem) var(--space-3, 0.75rem);
    border-radius: var(--radius-full, 9999px);
    font-size: var(--text-sm, 0.875rem);
    font-weight: var(--font-semibold, 600);
  }

  .stat-badge.due {
    background: linear-gradient(135deg, var(--color-streak-100, #fef3c7), var(--color-streak-200, #fde68a));
    color: var(--color-streak-800, #92400e);
    border: 1px solid var(--color-streak-400, #fbbf24);
  }

  .stat-badge.success {
    background: linear-gradient(135deg, var(--color-success-50, #fefce8), var(--color-success-100, #fef9c3));
    color: var(--color-success-700, #a16207);
    border: 1px solid var(--color-success-400, #facc15);
  }

  .stat-badge.neutral {
    background: var(--color-neutral-100, #f5f0e8);
    color: var(--color-neutral-500, #78716c);
    border: 1px solid var(--color-neutral-200, #e8e0d5);
  }

  .stat-badge.coming-soon {
    background: linear-gradient(135deg, var(--color-xp-50, #eef2ff), var(--color-xp-100, #e0e7ff));
    color: var(--color-xp-600, #4338ca);
    border: 1px solid var(--color-xp-300, #a5b4fc);
  }

  /* Card Arrow */
  .card-arrow {
    flex-shrink: 0;
  }

  .arrow-icon {
    font-size: var(--text-2xl, 1.5rem);
    color: var(--color-primary-500, #0891b2);
    font-weight: var(--font-bold, 700);
  }

  .lock-icon {
    font-size: var(--text-xl, 1.25rem);
    opacity: 0.5;
  }

  .practice-card.disabled .arrow-icon {
    color: var(--color-neutral-300, #d4c9b9);
  }

  /* Stats Summary */
  .stats-summary {
    background: linear-gradient(135deg, var(--color-neutral-50, #fdfbf7), var(--color-neutral-100, #f5f0e8));
    border: 1px solid var(--glass-border, rgba(212, 201, 185, 0.3));
    border-radius: var(--radius-2xl, 1.5rem);
    padding: var(--space-8, 2rem);
  }

  .stats-title {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2, 0.5rem);
    font-size: var(--text-lg, 1.125rem);
    font-weight: var(--font-bold, 700);
    color: var(--color-neutral-800, #292524);
    margin: 0 0 var(--space-6, 1.5rem);
  }

  .stats-icon {
    font-size: var(--text-xl, 1.25rem);
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: var(--space-4, 1rem);
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--space-4, 1rem);
    background: var(--glass-bg, rgba(253, 251, 247, 0.95));
    border: 1px solid var(--glass-border, rgba(212, 201, 185, 0.3));
    border-radius: var(--radius-lg, 0.75rem);
    transition: all var(--transition-normal, 200ms);
  }

  .stat-item:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md, 0 4px 15px rgba(0, 0, 0, 0.08));
  }

  .stat-item.lessons {
    border-color: var(--color-success-400, #facc15);
  }

  .stat-item.vocab {
    border-color: var(--color-gem-400, #10b981);
  }

  .stat-item.cards {
    border-color: var(--color-xp-400, #818cf8);
  }

  .stat-item.mistakes {
    border-color: var(--color-error-400, #c84b4b);
  }

  .stat-number {
    font-size: var(--text-2xl, 1.5rem);
    font-weight: var(--font-bold, 700);
    color: var(--color-primary-500, #0891b2);
    line-height: 1;
    margin-bottom: var(--space-2, 0.5rem);
  }

  .stat-item.lessons .stat-number {
    color: var(--color-success-600, #ca8a04);
  }

  .stat-item.vocab .stat-number {
    color: var(--color-gem-600, #047857);
  }

  .stat-item.cards .stat-number {
    color: var(--color-xp-600, #4338ca);
  }

  .stat-item.mistakes .stat-number {
    color: var(--color-error-500, #a91e1e);
  }

  .stat-label {
    font-size: var(--text-sm, 0.875rem);
    color: var(--color-neutral-500, #78716c);
    text-align: center;
  }

  /* Dark Mode */
  :global([data-theme="dark"]) .title {
    background: linear-gradient(135deg, var(--color-primary-400, #22d3ee), var(--color-xp-400, #818cf8));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  :global([data-theme="dark"]) .practice-card {
    background: rgba(28, 25, 23, 0.85);
    border-color: rgba(68, 64, 60, 0.3);
  }

  :global([data-theme="dark"]) .card-title {
    color: var(--color-neutral-100, #f5f0e8);
  }

  :global([data-theme="dark"]) .stats-summary {
    background: linear-gradient(135deg, rgba(28, 25, 23, 0.95), rgba(41, 37, 36, 0.95));
  }

  :global([data-theme="dark"]) .stats-title {
    color: var(--color-neutral-100, #f5f0e8);
  }

  :global([data-theme="dark"]) .stat-item {
    background: rgba(28, 25, 23, 0.85);
    border-color: rgba(68, 64, 60, 0.3);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .practice-hub {
      padding: var(--space-4, 1rem);
    }

    .title {
      font-size: var(--text-2xl, 1.5rem);
    }

    .practice-card {
      flex-direction: column;
      text-align: center;
      padding: var(--space-5, 1.25rem);
    }

    .card-icon-wrapper {
      width: 56px;
      height: 56px;
    }

    .card-icon {
      font-size: var(--text-2xl, 1.5rem);
    }

    .card-title {
      font-size: var(--text-lg, 1.125rem);
    }

    .card-stats {
      justify-content: center;
    }

    .card-arrow {
      display: none;
    }

    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
