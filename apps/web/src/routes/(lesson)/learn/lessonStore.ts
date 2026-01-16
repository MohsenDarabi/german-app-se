import { writable, derived } from 'svelte/store';
import type { Lesson } from '@pkg/content-model';
import { getLessonProgress, saveStepProgress, updateStudyTime, clearLessonWrongAnswers, resetLessonForReplay } from '$lib/services/progressService';
import { init as initAssetService } from '$lib/services/assetService';

function createLessonStore() {
  const { subscribe, set, update } = writable({
    currentIndex: 0,
    lesson: null as Lesson | null,
    languagePair: 'de-fa' as string, // Track language pair for progress
    isComplete: false,
    canContinue: false, // Controls if the 'Continue' button is enabled
    sessionStartTime: Date.now() // Track study time
  });

  return {
    subscribe,
    init: async (lesson: Lesson, languagePair: string) => {
      // Re-initialize asset service with this lesson's language pair
      // This ensures audio URLs use the correct language (de-fa for German, en-fa for English)
      await initAssetService(languagePair);

      // Load saved progress if exists - now using language pair
      const progress = await getLessonProgress(languagePair, lesson.id);

      // If lesson is completed or currentStepIndex is out of bounds, reset to start
      let startIndex = progress?.currentStepIndex || 0;
      if (progress?.status === 'completed' || startIndex >= lesson.steps.length) {
        startIndex = 0;
        // Clear old wrong answers and reset progress when replaying a completed lesson
        await clearLessonWrongAnswers(lesson.id);
        await resetLessonForReplay(languagePair, lesson.id);
      }

      set({
        currentIndex: startIndex,
        lesson,
        languagePair,
        isComplete: false,
        canContinue: true, // Default true for passive steps (Dialog/Grammar), Quiz will set false
        sessionStartTime: Date.now()
      });
    },
    nextStep: () => {
      update(state => {
        if (!state.lesson) return state;

        const nextIndex = state.currentIndex + 1;

        // Save progress for current step - now using language pair
        saveStepProgress(state.languagePair, state.lesson.id, nextIndex).catch(err =>
          console.error('Failed to save progress:', err)
        );

        if (nextIndex >= state.lesson.steps.length) {
          // Lesson completed - save study time
          const studyMinutes = Math.floor((Date.now() - state.sessionStartTime) / 60000);
          updateStudyTime(studyMinutes).catch(err =>
            console.error('Failed to save study time:', err)
          );

          return { ...state, isComplete: true };
        }

        // Determine if next step requires interaction
        const nextStepType = state.lesson.steps[nextIndex].type;
        const autoEnable = nextStepType !== 'word-quiz' && nextStepType !== 'multiple-choice';

        return {
          ...state,
          currentIndex: nextIndex,
          canContinue: autoEnable
        };
      });
    },
    enableContinue: () => {
      update(state => ({ ...state, canContinue: true }));
    },
    disableContinue: () => {
      update(state => ({ ...state, canContinue: false }));
    }
  };
}

export const lessonStore = createLessonStore();
export const currentStep = derived(lessonStore, $s =>
  $s.lesson ? $s.lesson.steps[$s.currentIndex] : null
);
