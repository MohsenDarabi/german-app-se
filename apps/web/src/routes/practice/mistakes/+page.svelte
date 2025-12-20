<script lang="ts">
  import { onMount } from 'svelte';
  import { db, type WrongAnswer } from '$lib/db';
  import { goto } from '$app/navigation';

  let wrongAnswers: WrongAnswer[] = [];
  let currentIndex = 0;
  let userAnswer = '';
  let showFeedback = false;
  let isCorrect = false;
  let loading = true;

  $: currentMistake = wrongAnswers[currentIndex];
  $: hasMore = currentIndex < wrongAnswers.length - 1;
  $: hasPrevious = currentIndex > 0;
  $: isComplete = currentIndex >= wrongAnswers.length && wrongAnswers.length > 0;

  onMount(async () => {
    // Load all unreviewed wrong answers
    wrongAnswers = await db.wrongAnswers
      .filter(w => !w.reviewedAt)
      .toArray();

    loading = false;

    if (wrongAnswers.length === 0) {
      // No mistakes to review, redirect back to practice hub
      setTimeout(() => goto('/practice'), 1500);
    }
  });

  function checkAnswer() {
    if (!currentMistake) return;

    const trimmedAnswer = userAnswer.trim().toLowerCase();
    const correctAnswer = currentMistake.correctAnswer.trim().toLowerCase();

    isCorrect = trimmedAnswer === correctAnswer;
    showFeedback = true;

    // If correct, mark as reviewed
    if (isCorrect && currentMistake.id) {
      db.wrongAnswers.update(currentMistake.id, {
        reviewedAt: new Date().toISOString()
      });
    }
  }

  function nextQuestion() {
    if (hasMore) {
      currentIndex++;
      resetState();
    } else {
      // Finished all questions
      currentIndex = wrongAnswers.length;
    }
  }

  function previousQuestion() {
    if (hasPrevious) {
      currentIndex--;
      resetState();
    }
  }

  function resetState() {
    userAnswer = '';
    showFeedback = false;
    isCorrect = false;
  }

  function skipQuestion() {
    nextQuestion();
  }

  function exitPractice() {
    goto('/practice');
  }
</script>

<div class="mistakes-practice" dir="rtl">
  {#if loading}
    <div class="loading-state">
      <div class="spinner"></div>
      <p>در حال بارگذاری...</p>
    </div>
  {:else if wrongAnswers.length === 0}
    <div class="empty-state">
      <div class="empty-icon">🎉</div>
      <h2>هیچ اشتباهی برای مرور وجود ندارد!</h2>
      <p>تمام اشتباهات شما مرور شده‌اند یا هنوز اشتباهی ثبت نشده است.</p>
      <p class="redirect-message">در حال بازگشت به صفحه تمرین...</p>
    </div>
  {:else if isComplete}
    <div class="completion-screen">
      <div class="completion-icon">✅</div>
      <h2>مرور اشتباهات تکمیل شد!</h2>
      <p>شما تمام {wrongAnswers.length} سوال را مرور کردید.</p>
      <div class="completion-actions">
        <button class="btn-primary" on:click={exitPractice}>
          بازگشت به تمرین‌ها
        </button>
        <a href="/" class="btn-secondary">
          بازگشت به داشبورد
        </a>
      </div>
    </div>
  {:else if currentMistake}
    <div class="practice-container">
      <!-- Header with Progress -->
      <div class="practice-header">
        <button class="exit-btn" on:click={exitPractice}>
          ✕ خروج
        </button>
        <div class="progress-info">
          <span class="progress-text">
            سوال {currentIndex + 1} از {wrongAnswers.length}
          </span>
          <div class="progress-bar">
            <div
              class="progress-fill"
              style="width: {((currentIndex + 1) / wrongAnswers.length) * 100}%"
            ></div>
          </div>
        </div>
      </div>

      <!-- Question Card -->
      <div class="question-card">
        <div class="question-header">
          <span class="question-type">{currentMistake.stepType}</span>
          <span class="lesson-info">درس: {currentMistake.lessonId}</span>
        </div>

        <h2 class="question-text">{currentMistake.question}</h2>

        <!-- Show previous wrong answer -->
        <div class="previous-answer-card">
          <div class="previous-answer-label">پاسخ قبلی شما (اشتباه):</div>
          <div class="previous-answer-value wrong">
            {currentMistake.userAnswer}
          </div>
        </div>

        <!-- Answer Input -->
        {#if !showFeedback}
          <div class="answer-section">
            <label for="answer" class="answer-label">
              پاسخ جدید خود را وارد کنید:
            </label>
            <input
              id="answer"
              type="text"
              bind:value={userAnswer}
              placeholder="پاسخ خود را بنویسید..."
              class="answer-input"
              on:keypress={(e) => e.key === 'Enter' && checkAnswer()}
              autofocus
            />
            <div class="answer-actions">
              <button
                class="btn-check"
                on:click={checkAnswer}
                disabled={!userAnswer.trim()}
              >
                بررسی پاسخ
              </button>
              <button class="btn-skip" on:click={skipQuestion}>
                رد شدن
              </button>
            </div>
          </div>
        {/if}

        <!-- Feedback -->
        {#if showFeedback}
          <div class="feedback-card" class:correct={isCorrect} class:incorrect={!isCorrect}>
            <div class="feedback-icon">
              {isCorrect ? '✅' : '❌'}
            </div>
            <div class="feedback-content">
              {#if isCorrect}
                <h3 class="feedback-title">عالی! پاسخ درست است</h3>
                <p class="feedback-message">شما این سوال را با موفقیت مرور کردید.</p>
              {:else}
                <h3 class="feedback-title">هنوز درست نیست</h3>
                <p class="feedback-message">پاسخ صحیح:</p>
                <div class="correct-answer-display">
                  {currentMistake.correctAnswer}
                </div>
              {/if}
            </div>
          </div>

          <div class="navigation-actions">
            <button class="btn-previous" on:click={previousQuestion} disabled={!hasPrevious}>
              ← قبلی
            </button>
            <button class="btn-next" on:click={nextQuestion}>
              {hasMore ? 'بعدی →' : 'پایان'}
            </button>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .mistakes-practice {
    min-height: 100vh;
    background: linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%);
    padding: 2rem 1rem;
    font-family: 'Vazirmatn', sans-serif;
  }

  /* Loading State */
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    gap: 1rem;
  }

  .spinner {
    width: 50px;
    height: 50px;
    border: 4px solid #e2e8f0;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Empty State */
  .empty-state {
    text-align: center;
    max-width: 500px;
    margin: 4rem auto;
    padding: 3rem;
    background: white;
    border-radius: 1.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .empty-icon {
    font-size: 5rem;
    margin-bottom: 1rem;
  }

  .empty-state h2 {
    font-size: 1.5rem;
    color: #1e293b;
    margin-bottom: 1rem;
  }

  .empty-state p {
    color: #64748b;
    margin-bottom: 0.5rem;
  }

  .redirect-message {
    color: #3b82f6;
    font-weight: 600;
    margin-top: 1.5rem;
  }

  /* Completion Screen */
  .completion-screen {
    text-align: center;
    max-width: 600px;
    margin: 4rem auto;
    padding: 3rem;
    background: white;
    border-radius: 1.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .completion-icon {
    font-size: 5rem;
    margin-bottom: 1rem;
  }

  .completion-screen h2 {
    font-size: 2rem;
    color: #1e293b;
    margin-bottom: 1rem;
  }

  .completion-screen p {
    font-size: 1.1rem;
    color: #64748b;
    margin-bottom: 2rem;
  }

  .completion-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  /* Practice Container */
  .practice-container {
    max-width: 800px;
    margin: 0 auto;
  }

  /* Practice Header */
  .practice-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .exit-btn {
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 0.5rem;
    padding: 0.5rem 1rem;
    font-size: 1rem;
    font-weight: 600;
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s;
  }

  .exit-btn:hover {
    border-color: #cbd5e1;
    background: #f8fafc;
  }

  .progress-info {
    flex: 1;
  }

  .progress-text {
    display: block;
    font-size: 0.875rem;
    color: #64748b;
    margin-bottom: 0.5rem;
    font-weight: 600;
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
    background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%);
    transition: width 0.3s ease;
    border-radius: 999px;
  }

  /* Question Card */
  .question-card {
    background: white;
    border-radius: 1.5rem;
    padding: 2.5rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }

  .question-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .question-type {
    background: #eff6ff;
    color: #1e40af;
    padding: 0.375rem 0.875rem;
    border-radius: 999px;
    font-size: 0.875rem;
    font-weight: 600;
  }

  .lesson-info {
    font-size: 0.875rem;
    color: #64748b;
  }

  .question-text {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 1.5rem;
    line-height: 1.4;
  }

  /* Previous Answer Card */
  .previous-answer-card {
    background: #fef3c7;
    border: 2px solid #fbbf24;
    border-radius: 0.75rem;
    padding: 1rem;
    margin-bottom: 2rem;
  }

  .previous-answer-label {
    font-size: 0.875rem;
    color: #92400e;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .previous-answer-value {
    font-size: 1.1rem;
    color: #1e293b;
    font-weight: 600;
  }

  .previous-answer-value.wrong {
    text-decoration: line-through;
    color: #dc2626;
  }

  /* Answer Section */
  .answer-section {
    margin-bottom: 2rem;
  }

  .answer-label {
    display: block;
    font-size: 1rem;
    font-weight: 600;
    color: #475569;
    margin-bottom: 0.75rem;
  }

  .answer-input {
    width: 100%;
    padding: 1rem;
    font-size: 1.1rem;
    border: 2px solid #e2e8f0;
    border-radius: 0.75rem;
    margin-bottom: 1rem;
    transition: all 0.2s;
    font-family: inherit;
  }

  .answer-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .answer-actions {
    display: flex;
    gap: 1rem;
  }

  /* Feedback Card */
  .feedback-card {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.5rem;
    border-radius: 0.75rem;
    margin-bottom: 2rem;
  }

  .feedback-card.correct {
    background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
    border: 2px solid #22c55e;
  }

  .feedback-card.incorrect {
    background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
    border: 2px solid #ef4444;
  }

  .feedback-icon {
    font-size: 2.5rem;
    flex-shrink: 0;
  }

  .feedback-content {
    flex: 1;
  }

  .feedback-title {
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  .feedback-card.correct .feedback-title {
    color: #166534;
  }

  .feedback-card.incorrect .feedback-title {
    color: #991b1b;
  }

  .feedback-message {
    font-size: 1rem;
    margin-bottom: 0.75rem;
  }

  .feedback-card.correct .feedback-message {
    color: #15803d;
  }

  .feedback-card.incorrect .feedback-message {
    color: #b91c1c;
  }

  .correct-answer-display {
    background: white;
    padding: 1rem;
    border-radius: 0.5rem;
    font-size: 1.1rem;
    font-weight: 700;
    color: #166534;
    border: 2px solid #22c55e;
  }

  /* Navigation Actions */
  .navigation-actions {
    display: flex;
    gap: 1rem;
    justify-content: space-between;
  }

  /* Buttons */
  button {
    font-family: inherit;
    cursor: pointer;
    border: none;
    border-radius: 0.5rem;
    font-weight: 600;
    transition: all 0.2s;
  }

  .btn-check {
    flex: 1;
    padding: 1rem 2rem;
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
    font-size: 1.1rem;
  }

  .btn-check:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }

  .btn-check:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-skip {
    padding: 1rem 1.5rem;
    background: white;
    color: #64748b;
    border: 2px solid #e2e8f0;
  }

  .btn-skip:hover {
    border-color: #cbd5e1;
    background: #f8fafc;
  }

  .btn-next,
  .btn-previous {
    padding: 1rem 2rem;
    font-size: 1rem;
  }

  .btn-next {
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    color: white;
    flex: 1;
  }

  .btn-next:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
  }

  .btn-previous {
    background: white;
    color: #64748b;
    border: 2px solid #e2e8f0;
  }

  .btn-previous:hover:not(:disabled) {
    border-color: #cbd5e1;
    background: #f8fafc;
  }

  .btn-previous:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .btn-primary {
    padding: 1rem 2rem;
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
    font-size: 1.1rem;
  }

  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }

  .btn-secondary {
    display: inline-block;
    padding: 1rem 2rem;
    background: white;
    color: #64748b;
    border: 2px solid #e2e8f0;
    text-decoration: none;
    border-radius: 0.5rem;
    font-weight: 600;
  }

  .btn-secondary:hover {
    border-color: #cbd5e1;
    background: #f8fafc;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .mistakes-practice {
      padding: 1rem 0.5rem;
    }

    .question-card {
      padding: 1.5rem;
    }

    .question-text {
      font-size: 1.25rem;
    }

    .answer-actions {
      flex-direction: column;
    }

    .navigation-actions {
      flex-direction: column-reverse;
    }

    .completion-actions {
      flex-direction: column;
      width: 100%;
    }

    .btn-primary,
    .btn-secondary {
      width: 100%;
    }
  }
</style>
