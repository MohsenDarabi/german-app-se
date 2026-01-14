/**
 * Audio Playback Utility for German Learning App
 *
 * Handles playing pre-generated audio files with fallback to device TTS.
 * Supports both local assets and CDN-based delivery via assetService.
 */

import { browser } from '$app/environment';
import { getAudioUrl, getLessonAudioHashes, isCdnEnabled, getCdnBase, getState } from '$lib/services/assetService';

// Audio cache to avoid re-creating audio elements
const audioCache = new Map<string, HTMLAudioElement>();

// Currently playing audio (for stopping)
let currentAudio: HTMLAudioElement | null = null;

/**
 * Play pre-generated audio for a lesson step
 * Uses CDN URL if available, otherwise falls back to local path.
 *
 * @param lessonId - The lesson ID (e.g., "A1-M01-L01")
 * @param audioId - The audio file ID (e.g., "s2-word")
 * @returns Promise that resolves when audio finishes playing
 */
export async function playStepAudio(lessonId: string, audioId: string): Promise<void> {
  // Get URL from asset service (handles CDN vs local)
  const audioPath = getAudioUrl(lessonId, audioId);
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
 * Check if text contains Persian/Arabic characters
 */
function containsPersian(text: string): boolean {
  return /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
}

/**
 * Extract German text from mixed Persian/German content
 * Removes Persian portions and returns only Latin/German text
 */
function extractGermanText(text: string): string {
  // Remove Persian/Arabic text blocks
  let germanOnly = text
    // Remove Persian text blocks (sequences of Persian chars with spaces)
    .replace(/[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]+[\s\u200C]*[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF\s\u200C]*/g, ' ')
    // Remove Persian quotation marks « »
    .replace(/[«»]/g, '')
    // Clean up multiple spaces
    .replace(/\s+/g, ' ')
    .trim();

  return germanOnly;
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

  // If text contains Persian, extract only German portions
  let textToSpeak = text;
  if (containsPersian(text)) {
    textToSpeak = extractGermanText(text);
    // If no German text remains, don't play anything
    if (!textToSpeak || textToSpeak.length < 2) {
      console.warn('No German text to speak in mixed content');
      return;
    }
  }

  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
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
 * Uses CDN hash-based URLs for deduplication benefits.
 *
 * @param lessonId - The lesson ID to preload
 * @param audioIds - Array of audio IDs to preload
 */
export function preloadLessonAudio(lessonId: string, audioIds: string[]): void {
  if (!browser) return;

  // If CDN is enabled, preload unique hashes only
  if (isCdnEnabled()) {
    const state = getState();
    const cdnBase = getCdnBase();

    if (state.manifest) {
      // Get unique hashes for this lesson (deduplication!)
      const hashes = getLessonAudioHashes(lessonId);

      for (const hash of hashes) {
        const audioPath = `${cdnBase}/${state.languagePair}/audio/by-hash/${hash}.mp3`;
        if (!audioCache.has(audioPath)) {
          const audio = new Audio();
          audio.preload = 'auto';
          audio.src = audioPath;
          audioCache.set(audioPath, audio);
        }
      }
      return;
    }
  }

  // Fallback: preload by individual audio IDs (local paths)
  for (const audioId of audioIds) {
    const audioPath = getAudioUrl(lessonId, audioId);
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
 * With CDN, checks the manifest; otherwise does a HEAD request.
 *
 * @param lessonId - The lesson ID
 * @param audioId - The audio ID
 * @returns Promise<boolean>
 */
export async function hasPreGeneratedAudio(lessonId: string, audioId: string): Promise<boolean> {
  if (!browser) return false;

  // If CDN is enabled, check manifest
  if (isCdnEnabled()) {
    const state = getState();
    if (state.manifest) {
      const key = `${lessonId}/${audioId}`;
      return !!state.manifest.audioMap[key];
    }
  }

  // Fallback: HEAD request to local path
  const audioPath = getAudioUrl(lessonId, audioId);

  try {
    const response = await fetch(audioPath, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}
