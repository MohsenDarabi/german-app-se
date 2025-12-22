/**
 * Audio Playback Utility for German Learning App
 *
 * Handles playing pre-generated audio files with fallback to device TTS.
 */

import { browser } from '$app/environment';

// Audio cache to avoid re-creating audio elements
const audioCache = new Map<string, HTMLAudioElement>();

// Currently playing audio (for stopping)
let currentAudio: HTMLAudioElement | null = null;

/**
 * Play pre-generated audio for a lesson step
 *
 * @param lessonId - The lesson ID (e.g., "A1-M01-L01")
 * @param audioId - The audio file ID (e.g., "s2-word")
 * @returns Promise that resolves when audio finishes playing
 */
export async function playStepAudio(lessonId: string, audioId: string): Promise<void> {
  const audioPath = `/audio/${lessonId}/${audioId}.mp3`;
  return playAudioFile(audioPath);
}

/**
 * Play an audio file by path
 *
 * @param audioPath - Path to the audio file (e.g., "/audio/A1-M01-L01/s2-word.mp3")
 * @returns Promise that resolves when audio finishes playing
 */
export async function playAudioFile(audioPath: string): Promise<void> {
  if (!browser) return;

  // Stop any currently playing audio
  stopAudio();

  // Check cache first
  let audio = audioCache.get(audioPath);

  if (!audio) {
    audio = new Audio(audioPath);
    audioCache.set(audioPath, audio);
  }

  currentAudio = audio;

  return new Promise((resolve, reject) => {
    audio!.onended = () => {
      currentAudio = null;
      resolve();
    };
    audio!.onerror = () => {
      currentAudio = null;
      // Fallback to TTS if audio file not found
      console.warn(`Audio not found: ${audioPath}, falling back to TTS`);
      reject(new Error('Audio file not found'));
    };
    audio!.currentTime = 0;
    audio!.play().catch(reject);
  });
}

/**
 * Play German text using TTS (fallback when pre-generated audio not available)
 * This is the legacy function, kept for backward compatibility.
 *
 * @param text - German text to speak
 * @param lang - Language code (default: 'de-DE')
 */
export function playText(text: string, lang: string = 'de-DE') {
  if (!browser || !('speechSynthesis' in window)) {
    console.warn("Text-to-speech not supported in this browser.");
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9; // Slightly slower for learning

  // Select a German voice if available (prefer Neural/Enhanced voices)
  const voices = window.speechSynthesis.getVoices();
  const germanVoice = voices.find(v =>
    v.lang.startsWith('de') && (v.name.includes('Neural') || v.name.includes('Enhanced'))
  ) || voices.find(v => v.lang.startsWith('de'));

  if (germanVoice) {
    utterance.voice = germanVoice;
  }

  window.speechSynthesis.speak(utterance);
}

/**
 * Play German text using TTS (async version with promise)
 *
 * @param text - German text to speak
 * @param rate - Speaking rate (0.5 to 2.0, default 0.9 for learners)
 * @returns Promise that resolves when speech finishes
 */
export async function playTextAsync(text: string, rate = 0.9): Promise<void> {
  if (!browser || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not available');
    return;
  }

  // Stop any current speech
  speechSynthesis.cancel();

  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-DE';
    utterance.rate = rate;
    utterance.pitch = 1.0;

    // Try to find the best German voice
    const voices = speechSynthesis.getVoices();
    const germanVoice = voices.find(v =>
      v.lang.startsWith('de') && (v.name.includes('Neural') || v.name.includes('Enhanced'))
    ) || voices.find(v => v.lang.startsWith('de'));

    if (germanVoice) {
      utterance.voice = germanVoice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve(); // Resolve even on error

    speechSynthesis.speak(utterance);
  });
}

/**
 * Play German text - tries pre-generated audio first, falls back to TTS
 *
 * @param text - German text to speak
 * @param lessonId - Optional lesson ID for pre-generated audio lookup
 * @param audioId - Optional audio ID for pre-generated audio lookup
 */
export async function playGerman(
  text: string,
  lessonId?: string,
  audioId?: string
): Promise<void> {
  // Try pre-generated audio first
  if (lessonId && audioId) {
    try {
      await playStepAudio(lessonId, audioId);
      return;
    } catch {
      // Fall through to TTS
    }
  }

  // Fallback to TTS
  await playTextAsync(text);
}

/**
 * Stop any currently playing audio
 */
export function stopAudio(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }

  if (browser && 'speechSynthesis' in window) {
    speechSynthesis.cancel();
  }
}

/**
 * Preload audio files for a lesson (call when lesson starts)
 *
 * @param lessonId - The lesson ID to preload
 * @param audioIds - Array of audio IDs to preload
 */
export function preloadLessonAudio(lessonId: string, audioIds: string[]): void {
  if (!browser) return;

  for (const audioId of audioIds) {
    const audioPath = `/audio/${lessonId}/${audioId}.mp3`;
    if (!audioCache.has(audioPath)) {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = audioPath;
      audioCache.set(audioPath, audio);
    }
  }
}

/**
 * Check if pre-generated audio exists for a step
 *
 * @param lessonId - The lesson ID
 * @param audioId - The audio ID
 * @returns Promise<boolean>
 */
export async function hasPreGeneratedAudio(lessonId: string, audioId: string): Promise<boolean> {
  if (!browser) return false;

  const audioPath = `/audio/${lessonId}/${audioId}.mp3`;

  try {
    const response = await fetch(audioPath, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}
