<script lang="ts">
  import { onMount } from 'svelte';
  import { getDueCards, gradeCard } from '$lib/services/srsScheduler';
  import FlashcardCard from '$lib/components/flashcard/FlashcardCard.svelte';
  import type { VocabItem } from '$lib/db';
  import { XPBar, StreakCounter } from '@pkg/ui';

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
    <a href="/" class="back-link">
      <span class="back-arrow">←</span>
      <span>بازگشت</span>
    </a>
    <h1 class="title">مرور فلش‌کارت</h1>
    {#if !sessionComplete && dueCards.length > 0}
      <div class="progress-info">
        <div class="progress-stats">
          <span class="progress-count">{reviewedCount}</span>
          <span class="progress-divider">/</span>
          <span class="progress-total">{dueCards.length}</span>
        </div>
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
          <div class="stat-card score">
            <div class="stat-icon-wrapper">
              <span class="stat-icon">📊</span>
            </div>
            <div class="stat-value">{score}%</div>
            <div class="stat-label">امتیاز</div>
          </div>
          <div class="stat-card correct">
            <div class="stat-icon-wrapper">
              <span class="stat-icon">✅</span>
            </div>
            <div class="stat-value">{correctCount}/{reviewedCount}</div>
            <div class="stat-label">صحیح</div>
          </div>
          <div class="stat-card cards">
            <div class="stat-icon-wrapper">
              <span class="stat-icon">🎴</span>
            </div>
            <div class="stat-value">{reviewedCount}</div>
            <div class="stat-label">کارت مرور شده</div>
          </div>
        </div>

        <div class="completion-actions">
          <a href="/" class="primary-btn">
            <span>🏠</span>
            <span>بازگشت به داشبورد</span>
          </a>
          <a href="/vocabulary" class="secondary-btn">
            <span>📚</span>
            <span>مشاهده واژگان</span>
          </a>
        </div>
      </div>
    {:else if dueCards.length === 0}
      <div class="empty-state">
        <div class="empty-icon">🎊</div>
        <h2>کارتی برای مرور نیست!</h2>
        <p>آفرین! همه واژگان خود را مرور کرده‌اید.</p>
        <p class="empty-subtitle">بعداً بازگردید زمانی که کارت‌های بیشتری آماده مرور هستند.</p>
        <div class="empty-actions">
          <a href="/" class="primary-btn">
            <span>🏠</span>
            <span>بازگشت به داشبورد</span>
          </a>
          <a href="/vocabulary" class="secondary-btn">
            <span>📚</span>
            <span>مشاهده واژگان</span>
          </a>
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
    padding: var(--space-6, 1.5rem) var(--space-4, 1rem);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* Header */
  .review-header {
    text-align: center;
    margin-bottom: var(--space-8, 2rem);
  }

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2, 0.5rem);
    color: var(--color-neutral-500, #78716c);
    text-decoration: none;
    font-weight: var(--font-semibold, 600);
    padding: var(--space-2, 0.5rem) var(--space-4, 1rem);
    border-radius: var(--radius-full, 9999px);
    margin-bottom: var(--space-4, 1rem);
    transition: all var(--transition-normal, 200ms);
  }

  .back-link:hover {
    color: var(--color-primary-500, #0891b2);
    background: var(--color-primary-50, #ecfeff);
  }

  .back-arrow {
    font-size: var(--text-lg, 1.125rem);
  }

  .title {
    font-size: var(--text-2xl, 1.5rem);
    font-weight: var(--font-extrabold, 800);
    margin: 0 0 var(--space-4, 1rem);
    background: linear-gradient(135deg, var(--color-xp-500, #4f46e5), var(--color-primary-500, #0891b2));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* Progress Info */
  .progress-info {
    margin-top: var(--space-4, 1rem);
  }

  .progress-stats {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-1, 0.25rem);
    font-size: var(--text-sm, 0.875rem);
    color: var(--color-neutral-500, #78716c);
    margin-bottom: var(--space-2, 0.5rem);
  }

  .progress-count {
    font-weight: var(--font-bold, 700);
    color: var(--color-xp-500, #4f46e5);
    font-size: var(--text-lg, 1.125rem);
  }

  .progress-divider {
    color: var(--color-neutral-400, #a69b8a);
  }

  .progress-total {
    font-weight: var(--font-semibold, 600);
  }

  .progress-bar {
    width: 100%;
    height: 8px;
    background: var(--color-neutral-200, #e8e0d5);
    border-radius: var(--radius-full, 9999px);
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--color-xp-500, #4f46e5), var(--color-primary-500, #0891b2));
    transition: width 0.5s ease;
    border-radius: var(--radius-full, 9999px);
  }

  /* Review Content */
  .review-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Loading State */
  .loading-state {
    text-align: center;
    color: var(--color-neutral-500, #78716c);
  }

  .spinner {
    width: 56px;
    height: 56px;
    border: 4px solid var(--color-neutral-200, #e8e0d5);
    border-top-color: var(--color-primary-500, #0891b2);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto var(--space-4, 1rem);
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Completion & Empty States */
  .completion-screen,
  .empty-state {
    text-align: center;
    padding: var(--space-8, 2rem);
    background: var(--glass-bg, rgba(253, 251, 247, 0.85));
    border: 1px solid var(--glass-border, rgba(212, 201, 185, 0.3));
    border-radius: var(--radius-2xl, 1.5rem);
    backdrop-filter: blur(var(--glass-blur, 12px));
  }

  .completion-icon,
  .empty-icon {
    font-size: 4rem;
    margin-bottom: var(--space-4, 1rem);
    animation: bounce-subtle 0.6s ease-in-out;
  }

  @keyframes bounce-subtle {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  .completion-screen h2,
  .empty-state h2 {
    font-size: var(--text-2xl, 1.5rem);
    font-weight: var(--font-bold, 700);
    color: var(--color-neutral-800, #292524);
    margin: 0 0 var(--space-6, 1.5rem);
  }

  /* Stats Grid */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-3, 0.75rem);
    margin-bottom: var(--space-8, 2rem);
  }

  .stat-card {
    background: var(--glass-bg, rgba(253, 251, 247, 0.95));
    border: 2px solid var(--glass-border, rgba(212, 201, 185, 0.3));
    border-radius: var(--radius-xl, 1rem);
    padding: var(--space-4, 1rem);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2, 0.5rem);
    transition: all var(--transition-normal, 200ms);
  }

  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md, 0 4px 15px rgba(0, 0, 0, 0.08));
  }

  .stat-card.score {
    border-color: var(--color-xp-400, #818cf8);
  }

  .stat-card.correct {
    border-color: var(--color-success-400, #facc15);
  }

  .stat-card.cards {
    border-color: var(--color-primary-400, #22d3ee);
  }

  .stat-icon-wrapper {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-neutral-100, #f5f0e8);
    border-radius: var(--radius-lg, 0.75rem);
  }

  .stat-icon {
    font-size: var(--text-xl, 1.25rem);
  }

  .stat-value {
    font-size: var(--text-xl, 1.25rem);
    font-weight: var(--font-bold, 700);
    color: var(--color-neutral-800, #292524);
  }

  .stat-card.score .stat-value {
    color: var(--color-xp-600, #4338ca);
  }

  .stat-card.correct .stat-value {
    color: var(--color-success-600, #ca8a04);
  }

  .stat-card.cards .stat-value {
    color: var(--color-primary-600, #0e7490);
  }

  .stat-label {
    font-size: var(--text-sm, 0.875rem);
    color: var(--color-neutral-500, #78716c);
  }

  /* Empty State */
  .empty-state p {
    color: var(--color-neutral-600, #57534e);
    margin: 0 0 var(--space-2, 0.5rem);
  }

  .empty-subtitle {
    font-size: var(--text-sm, 0.875rem);
    color: var(--color-neutral-500, #78716c);
    margin-bottom: var(--space-6, 1.5rem);
  }

  /* Action Buttons */
  .completion-actions,
  .empty-actions {
    display: flex;
    flex-direction: column;
    gap: var(--space-3, 0.75rem);
  }

  .primary-btn,
  .secondary-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2, 0.5rem);
    padding: var(--space-3, 0.75rem) var(--space-6, 1.5rem);
    border-radius: var(--radius-full, 9999px);
    font-weight: var(--font-semibold, 600);
    text-decoration: none;
    transition: all var(--transition-normal, 200ms);
    text-align: center;
    min-height: 48px;
  }

  .primary-btn {
    background: linear-gradient(135deg, var(--color-primary-500, #0891b2), var(--color-primary-600, #0e7490));
    color: white;
    box-shadow: 0 4px 15px rgba(8, 145, 178, 0.3);
  }

  .primary-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(8, 145, 178, 0.4);
  }

  .secondary-btn {
    background: var(--color-neutral-100, #f5f0e8);
    color: var(--color-neutral-700, #44403c);
    border: 1px solid var(--color-neutral-200, #e8e0d5);
  }

  .secondary-btn:hover {
    background: var(--color-neutral-200, #e8e0d5);
  }

  /* Dark Mode */
  :global([data-theme="dark"]) .title {
    background: linear-gradient(135deg, var(--color-xp-400, #818cf8), var(--color-primary-400, #22d3ee));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  :global([data-theme="dark"]) .completion-screen,
  :global([data-theme="dark"]) .empty-state {
    background: rgba(28, 25, 23, 0.85);
    border-color: rgba(68, 64, 60, 0.3);
  }

  :global([data-theme="dark"]) .completion-screen h2,
  :global([data-theme="dark"]) .empty-state h2 {
    color: var(--color-neutral-100, #f5f0e8);
  }

  :global([data-theme="dark"]) .stat-card {
    background: rgba(28, 25, 23, 0.85);
    border-color: rgba(68, 64, 60, 0.3);
  }

  :global([data-theme="dark"]) .stat-value {
    color: var(--color-neutral-100, #f5f0e8);
  }

  :global([data-theme="dark"]) .secondary-btn {
    background: var(--color-neutral-200, #44403c);
    color: var(--color-neutral-100, #f5f0e8);
    border-color: var(--color-neutral-300, #57534e);
  }

  /* Responsive */
  @media (max-width: 600px) {
    .review-page {
      padding: var(--space-4, 1rem);
    }

    .stats-grid {
      grid-template-columns: 1fr;
      gap: var(--space-3, 0.75rem);
    }

    .stat-card {
      flex-direction: row;
      justify-content: flex-start;
      gap: var(--space-4, 1rem);
      text-align: right;
    }

    .stat-card .stat-icon-wrapper {
      flex-shrink: 0;
    }
  }
</style>
