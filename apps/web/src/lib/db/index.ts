import Dexie, { type Table } from 'dexie';

export interface User {
  id?: number;
  email: string;
  name: string;
  xp: number;
  streak: number;
  lastStudyDate: string; // ISO Date string
  totalStudyMinutes: number;
}

export interface LessonProgress {
  id?: number;
  lessonId: string;
  status: 'locked' | 'in-progress' | 'completed';
  currentStepIndex: number;
  score: number;
  completedAt?: string; // ISO Date string
  updatedAt: string;
}

export interface WrongAnswer {
  id?: number;
  lessonId: string;
  stepId: string;
  stepType: string; // 'multiple-choice', etc.
  question: string;
  userAnswer: string;
  correctAnswer: string;
  reviewedAt?: string; // ISO Date string - set when reviewed at end of lesson
}

export interface VocabItem {
  id?: number;
  word: string;
  translation: string;
  example?: string; // Example sentence
  addedAt: Date;
  nextReview?: Date; // For SRS
  srsLevel?: number; // 0-5
}

export class DeutschLernDB extends Dexie {
  users!: Table<User>;
  lessonProgress!: Table<LessonProgress>;
  vocab!: Table<VocabItem>;
  wrongAnswers!: Table<WrongAnswer>;

  constructor() {
    super('DeutschLernDB');

    this.version(1).stores({
      users: '++id, email',
      lessonProgress: '++id, lessonId, status'
    });

    this.version(2).stores({
      // Keep previous tables
      users: '++id, email',
      lessonProgress: '++id, lessonId, status',
      // Add new table
      vocab: '++id, &word, addedAt' // &word means unique
    });

    this.version(3).stores({
      users: '++id, email',
      lessonProgress: '++id, &lessonId, status, updatedAt',
      vocab: '++id, &word, nextReview, addedAt',
      wrongAnswers: '++id, lessonId, reviewedAt'
    }).upgrade(tx => {
      // Migrate existing lessonProgress records to add new fields
      return tx.table('lessonProgress').toCollection().modify(progress => {
        progress.currentStepIndex = progress.currentStepIndex || 0;
        progress.status = progress.status === 'unlocked' ? 'in-progress' : progress.status;
      });
    }).upgrade(tx => {
      // Migrate existing users to add totalStudyMinutes
      return tx.table('users').toCollection().modify(user => {
        user.totalStudyMinutes = user.totalStudyMinutes || 0;
      });
    });
  }
}

export const db = new DeutschLernDB();