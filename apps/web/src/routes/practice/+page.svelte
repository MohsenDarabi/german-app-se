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
    <h1>تمرین‌ها</h1>
    <p class="subtitle">تقویت مهارت‌های آلمانی با تمرینات مختلف</p>
  </header>

  <div class="practice-modes">
    <!-- Vocabulary Review Mode -->
    <a
      href="/review/flashcards"
      class="practice-card"
      class:disabled={!$dueCardsCount || $dueCardsCount === 0}
    >
      <div class="card-icon">🎴</div>
      <div class="card-content">
        <h2 class="card-title">مرور واژگان</h2>
        <p class="card-description">
          تمرین فلش‌کارت با سیستم Leitner برای یادگیری بلندمدت
        </p>
        <div class="card-stats">
          {#if $dueCardsCount > 0}
            <span class="stat-badge due">{$dueCardsCount} کارت آماده مرور</span>
          {:else if $totalVocabCount > 0}
            <span class="stat-badge success">همه کارت‌ها مرور شده‌اند! ✓</span>
          {:else}
            <span class="stat-badge neutral">هنوز واژه‌ای ذخیره نکرده‌اید</span>
          {/if}
        </div>
      </div>
      <div class="card-arrow">
        {#if $dueCardsCount > 0}
          ←
        {:else}
          🔒
        {/if}
      </div>
    </a>

    <!-- Practice Your Mistakes Mode -->
    <a
      href="/practice/mistakes"
      class="practice-card"
      class:disabled={!$wrongAnswersCount || $wrongAnswersCount === 0}
    >
      <div class="card-icon">❌</div>
      <div class="card-content">
        <h2 class="card-title">تمرین اشتباهات</h2>
        <p class="card-description">
          سوالاتی که اشتباه جواب داده‌اید را دوباره تمرین کنید
        </p>
        <div class="card-stats">
          {#if $wrongAnswersCount > 0}
            <span class="stat-badge due">{$wrongAnswersCount} سوال برای مرور</span>
          {:else if $completedLessonsCount > 0}
            <span class="stat-badge success">اشتباهی برای مرور وجود ندارد! ✓</span>
          {:else}
            <span class="stat-badge neutral">ابتدا یک درس را تکمیل کنید</span>
          {/if}
        </div>
      </div>
      <div class="card-arrow">
        {#if $wrongAnswersCount > 0}
          ←
        {:else}
          🔒
        {/if}
      </div>
    </a>

    <!-- Random Drill Mode (Coming Soon) -->
    <div class="practice-card disabled">
      <div class="card-icon">🎲</div>
      <div class="card-content">
        <h2 class="card-title">تمرین تصادفی</h2>
        <p class="card-description">
          تمرینات ترکیبی از تمام درس‌های تکمیل شده
        </p>
        <div class="card-stats">
          <span class="stat-badge neutral">قریباً...</span>
        </div>
      </div>
      <div class="card-arrow">🔒</div>
    </div>

    <!-- Listening Practice Mode (Coming Soon) -->
    <div class="practice-card disabled">
      <div class="card-icon">🎧</div>
      <div class="card-content">
        <h2 class="card-title">تمرین شنیداری</h2>
        <p class="card-description">
          تقویت مهارت شنیداری با تلفظ آلمانی
        </p>
        <div class="card-stats">
          <span class="stat-badge neutral">قریباً...</span>
        </div>
      </div>
      <div class="card-arrow">🔒</div>
    </div>
  </div>

  <!-- Quick Stats Summary -->
  {#if $completedLessonsCount > 0 || $totalVocabCount > 0}
    <div class="stats-summary">
      <h3>آمار کلی تمرین</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-number">{$completedLessonsCount || 0}</span>
          <span class="stat-label">درس تکمیل شده</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{$totalVocabCount || 0}</span>
          <span class="stat-label">واژه ذخیره شده</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{$dueCardsCount || 0}</span>
          <span class="stat-label">کارت آماده مرور</span>
        </div>
        <div class="stat-item">
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
    padding: 2rem 1rem;
    font-family: 'Vazirmatn', sans-serif;
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

  /* Practice Modes Grid */
  .practice-modes {
    display: grid;
    gap: 1.5rem;
    margin-bottom: 3rem;
  }

  .practice-card {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 1rem;
    padding: 1.5rem;
    text-decoration: none;
    color: inherit;
    transition: all 0.3s ease;
    cursor: pointer;
  }

  .practice-card:not(.disabled):hover {
    border-color: #3b82f6;
    box-shadow: 0 8px 20px rgba(59, 130, 246, 0.15);
    transform: translateY(-3px);
  }

  .practice-card.disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: #f8fafc;
  }

  .practice-card.disabled:hover {
    transform: none;
    box-shadow: none;
    border-color: #e2e8f0;
  }

  .card-icon {
    font-size: 3rem;
    flex-shrink: 0;
  }

  .card-content {
    flex: 1;
  }

  .card-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 0.5rem;
  }

  .card-description {
    font-size: 1rem;
    color: #64748b;
    line-height: 1.5;
    margin-bottom: 0.75rem;
  }

  .card-stats {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .stat-badge {
    display: inline-block;
    padding: 0.375rem 0.875rem;
    border-radius: 999px;
    font-size: 0.875rem;
    font-weight: 600;
  }

  .stat-badge.due {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    color: #92400e;
    border: 1px solid #fbbf24;
  }

  .stat-badge.success {
    background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
    color: #166534;
    border: 1px solid #22c55e;
  }

  .stat-badge.neutral {
    background: #f1f5f9;
    color: #64748b;
    border: 1px solid #cbd5e1;
  }

  .card-arrow {
    font-size: 2rem;
    color: #3b82f6;
    flex-shrink: 0;
  }

  .practice-card.disabled .card-arrow {
    color: #cbd5e1;
  }

  /* Stats Summary */
  .stats-summary {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border-radius: 1.5rem;
    padding: 2rem;
    border: 1px solid #e2e8f0;
  }

  .stats-summary h3 {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 1.5rem;
    text-align: center;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 1.5rem;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem;
    background: white;
    border-radius: 0.75rem;
    border: 1px solid #e2e8f0;
  }

  .stat-number {
    font-size: 2rem;
    font-weight: 700;
    color: #3b82f6;
    line-height: 1;
    margin-bottom: 0.5rem;
  }

  .stat-label {
    font-size: 0.875rem;
    color: #64748b;
    text-align: center;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .practice-hub {
      padding: 1.5rem 1rem;
    }

    .header h1 {
      font-size: 2rem;
    }

    .practice-card {
      flex-direction: column;
      text-align: center;
      padding: 1.25rem;
    }

    .card-icon {
      font-size: 2.5rem;
    }

    .card-title {
      font-size: 1.25rem;
    }

    .card-arrow {
      display: none;
    }

    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
