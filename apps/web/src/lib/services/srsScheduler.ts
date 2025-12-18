import { db } from '$lib/db';
import type { VocabItem } from '$lib/db';

// Leitner box intervals in milliseconds
const BOX_INTERVALS = [
  24 * 60 * 60 * 1000,      // Box 0 (1): 1 day
  3 * 24 * 60 * 60 * 1000,  // Box 1 (2): 3 days
  7 * 24 * 60 * 60 * 1000,  // Box 2 (3): 1 week
  14 * 24 * 60 * 60 * 1000, // Box 3 (4): 2 weeks
  30 * 24 * 60 * 60 * 1000  // Box 4 (5): 1 month
];

/**
 * Calculate the next review date based on Leitner system
 * @param currentLevel Current SRS level (0-4)
 * @param wasCorrect Whether the user answered correctly
 * @returns Object with nextLevel and nextReviewDate
 */
export function calculateNextReview(currentLevel: number, wasCorrect: boolean): {
  nextLevel: number;
  nextReviewDate: Date;
} {
  // If wrong answer, reset to box 1 (level 0)
  if (!wasCorrect) {
    return {
      nextLevel: 0,
      nextReviewDate: new Date(Date.now() + BOX_INTERVALS[0])
    };
  }

  // If correct, move to next box (max level 4)
  const nextLevel = Math.min(currentLevel + 1, 4);
  return {
    nextLevel,
    nextReviewDate: new Date(Date.now() + BOX_INTERVALS[nextLevel])
  };
}

/**
 * Get all vocabulary cards that are due for review
 * @returns Array of VocabItems due for review
 */
export async function getDueCards(): Promise<VocabItem[]> {
  const now = new Date();
  return await db.vocab
    .where('nextReview')
    .belowOrEqual(now)
    .toArray();
}

/**
 * Grade a flashcard and update its SRS level and next review date
 * @param cardId ID of the vocab card
 * @param wasCorrect Whether the user answered correctly
 */
export async function gradeCard(cardId: number, wasCorrect: boolean): Promise<void> {
  const card = await db.vocab.get(cardId);
  if (!card) return;

  const currentLevel = card.srsLevel ?? 0;
  const { nextLevel, nextReviewDate } = calculateNextReview(currentLevel, wasCorrect);

  await db.vocab.update(cardId, {
    srsLevel: nextLevel,
    nextReview: nextReviewDate
  });
}

/**
 * Get count of cards due for review
 * @returns Number of cards due
 */
export async function getDueCardsCount(): Promise<number> {
  const now = new Date();
  return await db.vocab
    .where('nextReview')
    .belowOrEqual(now)
    .count();
}
