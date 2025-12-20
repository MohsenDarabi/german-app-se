<script lang="ts">
  import { onMount } from 'svelte';
  import { getDueCards, gradeCard } from '$lib/services/srsScheduler';
  import FlashcardCard from '$lib/components/flashcard/FlashcardCard.svelte';
  import type { VocabItem } from '$lib/db';

  let dueCards: VocabItem[] = [];
  let currentIndex = 0;
  let reviewedCount = 0;
  let correctCount = 0;
  let sessionComplete = false;
  let loading = true;

  onMount(async () => {
    dueCards = await getDueCards();
    loading = false;
  });

  async function handleGrade(wasCorrect: boolean) {
    const currentCard = dueCards[currentIndex];
    await gradeCard(currentCard.id!, wasCorrect);

    reviewedCount++;
    if (wasCorrect) correctCount++;

    // Move to next card
    if (currentIndex < dueCards.length - 1) {
      currentIndex++;
    } else {
      sessionComplete = true;
    }
  }

  $: currentCard = dueCards[currentIndex];
  $: score = reviewedCount > 0 ? Math.round((correctCount / reviewedCount) * 100) : 0;
  $: progress = dueCards.length > 0 ? Math.round((reviewedCount / dueCards.length) * 100) : 0;
</script>

<svelte:head>
  <title>مرور فلش‌کارت - Deutschlern</title>
</svelte:head>

<div class="review-page" dir="rtl">
  <header class="review-header">
    <a href="/" class="back-link">بازگشت ←</a>
    <h1>مرور فلش‌کارت</h1>
    {#if !sessionComplete && dueCards.length > 0}
      <div class="progress-info">
        <div class="progress-text">{reviewedCount} از {dueCards.length} مرور شده</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: {progress}%"></div>
        </div>
      </div>
    {/if}
  </header>

  <main class="review-content">
    {#if loading}
      <div class="loading-state">
        <div class="spinner"></div>
        <p>در حال بارگذاری...</p>
      </div>
    {:else if sessionComplete}
      <div class="completion-screen">
        <div class="completion-icon">🎉</div>
        <h2>مرور تکمیل شد!</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">📊</div>
            <div class="stat-value">{score}%</div>
            <div class="stat-label">امتیاز</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">✅</div>
            <div class="stat-value">{correctCount}/{reviewedCount}</div>
            <div class="stat-label">صحیح</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🎴</div>
            <div class="stat-value">{reviewedCount}</div>
            <div class="stat-label">کارت مرور شده</div>
          </div>
        </div>
        <div class="completion-actions">
          <a href="/" class="primary-btn">بازگشت به داشبورد</a>
          <a href="/vocabulary" class="secondary-btn">مشاهده واژگان</a>
        </div>
      </div>
    {:else if dueCards.length === 0}
      <div class="empty-state">
        <div class="empty-icon">🎊</div>
        <h2>کارتی برای مرور نیست!</h2>
        <p>آفرین! همه واژگان خود را مرور کرده‌اید.</p>
        <p class="empty-subtitle">بعداً بازگردید زمانی که کارت‌های بیشتری آماده مرور هستند.</p>
        <div class="empty-actions">
          <a href="/" class="primary-btn">بازگشت به داشبورد</a>
          <a href="/vocabulary" class="secondary-btn">مشاهده واژگان</a>
        </div>
      </div>
    {:else if currentCard}
      <FlashcardCard card={currentCard} onGrade={handleGrade} />
    {/if}
  </main>
</div>

<style>
  .review-page {
    max-width: 600px;
    margin: 0 auto;
    padding: 2rem 1rem;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .review-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .back-link {
    display: inline-block;
    color: #64748b;
    text-decoration: none;
    font-weight: 600;
    margin-bottom: 1rem;
    transition: color 0.2s;
  }

  .back-link:hover {
    color: #3b82f6;
  }

  .review-header h1 {
    font-size: 2rem;
    font-weight: 800;
    color: #1e293b;
    margin-bottom: 1rem;
  }

  .progress-info {
    margin-top: 1rem;
  }

  .progress-text {
    font-size: 0.875rem;
    color: #64748b;
    margin-bottom: 0.5rem;
  }

  .progress-bar {
    width: 100%;
    height: 8px;
    background: #e2e8f0;
    border-radius: 999px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #3b82f6 0%, #22c55e 100%);
    transition: width 0.3s ease;
  }

  .review-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .loading-state {
    text-align: center;
    color: #64748b;
  }

  .spinner {
    width: 50px;
    height: 50px;
    border: 4px solid #e2e8f0;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .completion-screen,
  .empty-state {
    text-align: center;
    padding: 2rem;
  }

  .completion-icon,
  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .completion-screen h2,
  .empty-state h2 {
    font-size: 2rem;
    font-weight: 800;
    color: #1e293b;
    margin-bottom: 2rem;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    max-width: 500px;
    margin: 0 auto 2rem;
  }

  .stat-card {
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 1rem;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .stat-icon {
    font-size: 2rem;
  }

  .stat-value {
    font-size: 1.75rem;
    font-weight: 700;
    color: #1e293b;
  }

  .stat-label {
    font-size: 0.875rem;
    color: #64748b;
  }

  .empty-state p {
    color: #64748b;
    margin-bottom: 0.5rem;
  }

  .empty-subtitle {
    font-size: 0.875rem;
    margin-bottom: 2rem;
  }

  .completion-actions,
  .empty-actions {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 300px;
    margin: 0 auto;
  }

  .primary-btn,
  .secondary-btn {
    display: inline-block;
    padding: 1rem 2rem;
    border-radius: 999px;
    font-weight: 700;
    text-decoration: none;
    transition: all 0.2s;
    text-align: center;
  }

  .primary-btn {
    background: #3b82f6;
    color: white;
  }

  .primary-btn:hover {
    background: #2563eb;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }

  .secondary-btn {
    background: #f1f5f9;
    color: #475569;
  }

  .secondary-btn:hover {
    background: #e2e8f0;
  }

  @media (max-width: 600px) {
    .review-page {
      padding: 1rem;
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
