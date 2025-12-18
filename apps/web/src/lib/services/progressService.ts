import { db } from '$lib/db';
import type { LessonProgress, WrongAnswer } from '$lib/db';

/**
 * Save progress after completing a step
 */
export async function saveStepProgress(lessonId: string, stepIndex: number): Promise<void> {
  const existing = await db.lessonProgress.where('lessonId').equals(lessonId).first();

  if (existing) {
    await db.lessonProgress.update(existing.id!, {
      currentStepIndex: stepIndex,
      status: 'in-progress',
      updatedAt: new Date().toISOString()
    });
  } else {
    await db.lessonProgress.add({
      lessonId,
      status: 'in-progress',
      currentStepIndex: stepIndex,
      score: 0,
      updatedAt: new Date().toISOString()
    });
  }
}

/**
 * Save a wrong answer for end-of-lesson review
 */
export async function saveWrongAnswer(data: {
  lessonId: string;
  stepId: string;
  stepType: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
}): Promise<void> {
  await db.wrongAnswers.add({
    ...data,
    reviewedAt: undefined // Will be set when reviewed
  });
}

/**
 * Get lesson progress for resume capability
 */
export async function getLessonProgress(lessonId: string): Promise<LessonProgress | undefined> {
  return await db.lessonProgress.where('lessonId').equals(lessonId).first();
}

/**
 * Get all unreviewedwrong answers for a lesson
 */
export async function getUnreviewedWrongAnswers(lessonId: string): Promise<WrongAnswer[]> {
  return await db.wrongAnswers
    .where('lessonId')
    .equals(lessonId)
    .and(w => !w.reviewedAt)
    .toArray();
}

/**
 * Clear all wrong answers for a lesson (used when replaying)
 */
export async function clearLessonWrongAnswers(lessonId: string): Promise<void> {
  const wrongAnswers = await db.wrongAnswers
    .where('lessonId')
    .equals(lessonId)
    .toArray();

  for (const wa of wrongAnswers) {
    await db.wrongAnswers.delete(wa.id!);
  }
}

/**
 * Reset lesson progress to allow replaying
 */
export async function resetLessonForReplay(lessonId: string): Promise<void> {
  const existing = await db.lessonProgress.where('lessonId').equals(lessonId).first();

  if (existing) {
    await db.lessonProgress.update(existing.id!, {
      currentStepIndex: 0,
      status: 'in-progress',
      updatedAt: new Date().toISOString()
    });
  }
}

/**
 * Mark wrong answers as reviewed
 */
export async function markWrongAnswersReviewed(wrongAnswerIds: number[]): Promise<void> {
  const reviewedAt = new Date().toISOString();

  for (const id of wrongAnswerIds) {
    await db.wrongAnswers.update(id, { reviewedAt });
  }
}

/**
 * Calculate lesson score based on wrong answers
 */
export async function calculateLessonScore(lessonId: string, totalSteps: number): Promise<number> {
  const wrongAnswers = await db.wrongAnswers
    .where('lessonId')
    .equals(lessonId)
    .toArray();

  // Count unique steps that had wrong answers
  const uniqueWrongSteps = new Set(wrongAnswers.map(w => w.stepId)).size;
  const correctSteps = totalSteps - uniqueWrongSteps;

  return Math.round((correctSteps / totalSteps) * 100);
}

/**
 * Mark lesson as completed and award XP
 */
export async function completeLessonWithStats(
  lessonId: string,
  totalSteps: number
): Promise<{ score: number; xpEarned: number }> {
  const score = await calculateLessonScore(lessonId, totalSteps);
  const xpEarned = Math.round(score * 1.5); // 100% = 150 XP, 70% = 105 XP, etc.

  // Update lesson progress
  const existing = await db.lessonProgress.where('lessonId').equals(lessonId).first();

  if (existing) {
    await db.lessonProgress.update(existing.id!, {
      status: 'completed',
      score,
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  } else {
    await db.lessonProgress.add({
      lessonId,
      status: 'completed',
      currentStepIndex: 0,
      score,
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  // Award XP
  await updateUserXP(xpEarned);

  // Update streak
  await updateStreak();

  return { score, xpEarned };
}

/**
 * Update user XP
 */
export async function updateUserXP(earnedXP: number): Promise<void> {
  // Get or create user
  let user = await db.users.get(1);

  if (!user) {
    // Create default user if doesn't exist
    await db.users.add({
      id: 1,
      email: 'learner@example.com',
      name: 'Learner',
      xp: earnedXP,
      streak: 1,
      lastStudyDate: new Date().toISOString(),
      totalStudyMinutes: 0
    });
  } else {
    await db.users.update(1, {
      xp: user.xp + earnedXP
    });
  }
}

/**
 * Update user streak
 */
export async function updateStreak(): Promise<void> {
  let user = await db.users.get(1);

  if (!user) {
    // Create default user with streak = 1
    await db.users.add({
      id: 1,
      email: 'learner@example.com',
      name: 'Learner',
      xp: 0,
      streak: 1,
      lastStudyDate: new Date().toISOString(),
      totalStudyMinutes: 0
    });
    return;
  }

  const lastStudy = new Date(user.lastStudyDate);
  const today = new Date();

  // Reset time to midnight for accurate day comparison
  lastStudy.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const daysDiff = Math.floor((today.getTime() - lastStudy.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDiff === 1) {
    // Consecutive day - increment streak
    await db.users.update(1, {
      streak: user.streak + 1,
      lastStudyDate: new Date().toISOString()
    });
  } else if (daysDiff === 0) {
    // Same day - just update lastStudyDate
    await db.users.update(1, {
      lastStudyDate: new Date().toISOString()
    });
  } else {
    // Streak broken - reset to 1
    await db.users.update(1, {
      streak: 1,
      lastStudyDate: new Date().toISOString()
    });
  }
}

/**
 * Update total study time
 */
export async function updateStudyTime(minutesStudied: number): Promise<void> {
  let user = await db.users.get(1);

  if (!user) {
    await db.users.add({
      id: 1,
      email: 'learner@example.com',
      name: 'Learner',
      xp: 0,
      streak: 1,
      lastStudyDate: new Date().toISOString(),
      totalStudyMinutes: minutesStudied
    });
  } else {
    await db.users.update(1, {
      totalStudyMinutes: user.totalStudyMinutes + minutesStudied
    });
  }
}
