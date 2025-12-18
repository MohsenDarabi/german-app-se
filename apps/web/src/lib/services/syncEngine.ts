import { db } from '$lib/db';
import { supabase } from '$lib/supabase/client';
import type { User, LessonProgress, VocabItem, WrongAnswer } from '$lib/db';

/**
 * SyncEngine - Handles bidirectional sync between local IndexedDB and Supabase cloud
 *
 * Architecture:
 * - Local-first: All reads happen from IndexedDB for instant performance
 * - Background sync: Pushes local changes to cloud and pulls cloud changes
 * - Conflict resolution: Last-write-wins using timestamps
 * - Offline support: Works offline, syncs when connection is restored
 */
export class SyncEngine {
  private syncInProgress = false;
  private lastSyncTimestamp: Date | null = null;
  private syncIntervalId: number | null = null;

  constructor() {
    // Load last sync timestamp from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('lastSyncTimestamp');
      this.lastSyncTimestamp = stored ? new Date(stored) : null;
    }
  }

  /**
   * Full sync: Push local changes to cloud, then pull cloud changes
   * This is the main sync method called periodically
   */
  async sync(): Promise<void> {
    if (this.syncInProgress) {
      console.log('[SyncEngine] Sync already in progress, skipping...');
      return;
    }

    try {
      this.syncInProgress = true;
      console.log('[SyncEngine] Starting sync...');

      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('[SyncEngine] No authenticated user, skipping sync');
        return;
      }

      // Phase 1: Push local changes to cloud
      await this.pushLocalChanges(user.id);

      // Phase 2: Pull cloud changes to local
      await this.pullCloudChanges(user.id);

      // Update sync timestamp
      this.lastSyncTimestamp = new Date();
      if (typeof window !== 'undefined') {
        localStorage.setItem('lastSyncTimestamp', this.lastSyncTimestamp.toISOString());
      }

      console.log('[SyncEngine] Sync completed successfully');
    } catch (error) {
      console.error('[SyncEngine] Sync error:', error);
      // Don't throw - we want the app to continue working offline
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Push local IndexedDB data to Supabase
   * Uses upsert to handle both inserts and updates
   */
  private async pushLocalChanges(userId: string): Promise<void> {
    console.log('[SyncEngine] Pushing local changes to cloud...');

    try {
      // Sync User data
      const localUser = await db.users.get(1);
      if (localUser) {
        const { error } = await supabase.from('users').upsert({
          id: userId,
          email: localUser.email,
          name: localUser.name,
          xp: localUser.xp,
          streak: localUser.streak,
          last_study_date: localUser.lastStudyDate,
          total_study_minutes: localUser.totalStudyMinutes,
        });
        if (error) console.error('[SyncEngine] Error syncing user:', error);
      }

      // Sync Lesson Progress
      const lessonProgress = await db.lessonProgress.toArray();
      if (lessonProgress.length > 0) {
        const progressData = lessonProgress.map(p => ({
          user_id: userId,
          lesson_id: p.lessonId,
          status: p.status,
          current_step_index: p.currentStepIndex,
          score: p.score,
          completed_at: p.completedAt ? new Date(p.completedAt) : null,
          updated_at: new Date(p.updatedAt),
        }));

        const { error } = await supabase.from('lesson_progress').upsert(progressData, {
          onConflict: 'user_id,lesson_id'
        });
        if (error) console.error('[SyncEngine] Error syncing lesson progress:', error);
      }

      // Sync Vocabulary
      const vocab = await db.vocab.toArray();
      if (vocab.length > 0) {
        const vocabData = vocab.map(v => ({
          user_id: userId,
          word: v.word,
          translation: v.translation,
          example: v.example || null,
          added_at: v.addedAt,
          next_review: v.nextReview || null,
          srs_level: v.srsLevel || 0,
        }));

        const { error } = await supabase.from('vocab_items').upsert(vocabData);
        if (error) console.error('[SyncEngine] Error syncing vocab:', error);
      }

      // Sync Wrong Answers
      const wrongAnswers = await db.wrongAnswers.toArray();
      if (wrongAnswers.length > 0) {
        const wrongAnswersData = wrongAnswers.map(w => ({
          user_id: userId,
          lesson_id: w.lessonId,
          step_id: w.stepId,
          step_type: w.stepType,
          question: w.question,
          user_answer: w.userAnswer,
          correct_answer: w.correctAnswer,
          reviewed_at: w.reviewedAt ? new Date(w.reviewedAt) : null,
        }));

        const { error } = await supabase.from('wrong_answers').upsert(wrongAnswersData);
        if (error) console.error('[SyncEngine] Error syncing wrong answers:', error);
      }

      console.log('[SyncEngine] Push completed');
    } catch (error) {
      console.error('[SyncEngine] Error during push:', error);
      throw error;
    }
  }

  /**
   * Pull cloud data to local IndexedDB
   * Only updates local data if cloud version is newer (last-write-wins)
   */
  private async pullCloudChanges(userId: string): Promise<void> {
    console.log('[SyncEngine] Pulling cloud changes to local...');

    try {
      // Pull User data
      const { data: cloudUser, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (cloudUser && !userError) {
        await db.users.put({
          id: 1, // Always use ID 1 for single user in IndexedDB
          email: cloudUser.email,
          name: cloudUser.name,
          xp: cloudUser.xp,
          streak: cloudUser.streak,
          lastStudyDate: cloudUser.last_study_date,
          totalStudyMinutes: cloudUser.total_study_minutes,
        });
      }

      // Pull Lesson Progress
      const { data: cloudProgress, error: progressError } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', userId);

      if (cloudProgress && !progressError) {
        for (const progress of cloudProgress) {
          // Check if local version is newer
          const localProgress = await db.lessonProgress
            .where('lessonId')
            .equals(progress.lesson_id)
            .first();

          const shouldUpdate = !localProgress ||
            new Date(progress.updated_at) > new Date(localProgress.updatedAt);

          if (shouldUpdate) {
            await db.lessonProgress.put({
              id: localProgress?.id, // Include existing ID to update, or undefined to insert new
              lessonId: progress.lesson_id,
              status: progress.status,
              currentStepIndex: progress.current_step_index,
              score: progress.score,
              completedAt: progress.completed_at?.toString(),
              updatedAt: progress.updated_at.toString(),
            });
          }
        }
      }

      // Pull Vocabulary
      const { data: cloudVocab, error: vocabError } = await supabase
        .from('vocab_items')
        .select('*')
        .eq('user_id', userId);

      if (cloudVocab && !vocabError) {
        for (const vocab of cloudVocab) {
          // For vocab, use word as unique identifier
          const localVocab = await db.vocab
            .where('word')
            .equals(vocab.word)
            .first();

          // Use updated_at for conflict resolution
          const shouldUpdate = !localVocab ||
            new Date(vocab.updated_at) > new Date(localVocab.addedAt);

          if (shouldUpdate) {
            await db.vocab.put({
              id: localVocab?.id, // Include existing ID to update, or undefined to insert new
              word: vocab.word,
              translation: vocab.translation,
              example: vocab.example || undefined,
              addedAt: new Date(vocab.added_at),
              nextReview: vocab.next_review ? new Date(vocab.next_review) : undefined,
              srsLevel: vocab.srs_level,
            });
          }
        }
      }

      // Pull Wrong Answers
      const { data: cloudWrongAnswers, error: wrongAnswersError } = await supabase
        .from('wrong_answers')
        .select('*')
        .eq('user_id', userId);

      if (cloudWrongAnswers && !wrongAnswersError) {
        for (const answer of cloudWrongAnswers) {
          // Check if we already have this wrong answer locally
          const existing = await db.wrongAnswers
            .where(['lessonId', 'stepId'])
            .equals([answer.lesson_id, answer.step_id])
            .first();

          if (!existing) {
            await db.wrongAnswers.add({
              lessonId: answer.lesson_id,
              stepId: answer.step_id,
              stepType: answer.step_type,
              question: answer.question,
              userAnswer: answer.user_answer,
              correctAnswer: answer.correct_answer,
              reviewedAt: answer.reviewed_at?.toString(),
            });
          }
        }
      }

      console.log('[SyncEngine] Pull completed');
    } catch (error) {
      console.error('[SyncEngine] Error during pull:', error);
      throw error;
    }
  }

  /**
   * Start automatic background sync
   * Syncs every 30 seconds and on visibility changes
   */
  startBackgroundSync(): void {
    if (typeof window === 'undefined') return;

    console.log('[SyncEngine] Starting background sync...');

    // Sync every 30 seconds
    this.syncIntervalId = window.setInterval(() => {
      this.sync();
    }, 30000);

    // Sync when page becomes visible
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.sync();
      }
    });

    // Sync when online
    window.addEventListener('online', () => {
      console.log('[SyncEngine] Connection restored, syncing...');
      this.sync();
    });

    // Log offline status
    window.addEventListener('offline', () => {
      console.log('[SyncEngine] Connection lost, will sync when restored');
    });
  }

  /**
   * Stop background sync (cleanup)
   */
  stopBackgroundSync(): void {
    if (this.syncIntervalId !== null) {
      clearInterval(this.syncIntervalId);
      this.syncIntervalId = null;
      console.log('[SyncEngine] Background sync stopped');
    }
  }

  /**
   * Get last sync timestamp
   */
  getLastSyncTime(): Date | null {
    return this.lastSyncTimestamp;
  }

  /**
   * Check if sync is currently in progress
   */
  isSyncing(): boolean {
    return this.syncInProgress;
  }
}

// Singleton instance
export const syncEngine = new SyncEngine();
