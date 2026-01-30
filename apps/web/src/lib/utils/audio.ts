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
 * Language code mapping for TTS
 */
const LANGUAGE_TTS_MAP: Record<string, string> = {
  'de': 'de-DE',
  'en': 'en-US',
  'fr': 'fr-FR',
  'es': 'es-ES',
};

/**
 * Get TTS language code from language pair
 * @param langPair - Language pair like 'de-fa', 'en-fa'
 * @returns TTS language code like 'de-DE', 'en-US'
 */
function getTTSLanguage(langPair: string): string {
  const sourceLang = langPair.split('-')[0]; // 'de' from 'de-fa'
  return LANGUAGE_TTS_MAP[sourceLang] || 'en-US';
}

/**
 * Play text using TTS (fallback when pre-generated audio not available)
 * This is the legacy function, kept for backward compatibility.
 *
 * @param text - Text to speak
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

  // Select appropriate voice based on language (prefer Neural/Enhanced voices)
  const voices = window.speechSynthesis.getVoices();
  const langPrefix = lang.split('-')[0]; // 'de' from 'de-DE'
  const preferredVoice = voices.find(v =>
    v.lang.startsWith(langPrefix) && (v.name.includes('Neural') || v.name.includes('Enhanced'))
  ) || voices.find(v => v.lang.startsWith(langPrefix));

  if (preferredVoice) {
    utterance.voice = preferredVoice;
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
  const germanOnly = text
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
 * Play text using TTS (async version with promise)
 * Supports multiple languages based on language pair.
 *
 * @param text - Text to speak
 * @param rate - Speaking rate (0.5 to 2.0, default 0.9 for learners)
 * @param langPair - Language pair like 'de-fa', 'en-fa' (default: 'de-fa')
 * @returns Promise that resolves when speech finishes
 */
export async function playTextAsync(text: string, rate = 0.9, langPair = 'de-fa'): Promise<void> {
  if (!browser || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not available');
    return;
  }

  // Stop any current speech
  speechSynthesis.cancel();

  // If text contains Persian, extract only Latin/source language portions
  let textToSpeak = text;
  if (containsPersian(text)) {
    textToSpeak = extractGermanText(text); // Works for any Latin text
    // If no source language text remains, don't play anything
    if (!textToSpeak || textToSpeak.length < 2) {
      console.warn('No source language text to speak in mixed content');
      return;
    }
  }

  const ttsLang = getTTSLanguage(langPair);
  const langPrefix = ttsLang.split('-')[0];

  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = ttsLang;
    utterance.rate = rate;
    utterance.pitch = 1.0;

    // Try to find the best voice for this language
    const voices = speechSynthesis.getVoices();
    const preferredVoice = voices.find(v =>
      v.lang.startsWith(langPrefix) && (v.name.includes('Neural') || v.name.includes('Enhanced'))
    ) || voices.find(v => v.lang.startsWith(langPrefix));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve(); // Resolve even on error

    speechSynthesis.speak(utterance);
  });
}

/**
 * Play source language text - tries pre-generated audio first, falls back to TTS
 * Works with any language pair (de-fa, en-fa, etc.)
 *
 * @param text - Source language text to speak
 * @param lessonId - Optional lesson ID for pre-generated audio lookup
 * @param audioId - Optional audio ID for pre-generated audio lookup
 * @param langPair - Language pair like 'de-fa', 'en-fa' (default: from asset service)
 */
export async function playGerman(
  text: string,
  lessonId?: string,
  audioId?: string,
  langPair?: string
): Promise<void> {
  // Get language pair from asset service if not provided
  const effectiveLangPair = langPair || getState().languagePair || 'de-fa';

  // Try pre-generated audio first
  if (lessonId && audioId) {
    try {
      await playStepAudio(lessonId, audioId);
      return;
    } catch {
      // Fall through to TTS
    }
  }

  // Fallback to TTS with appropriate language
  await playTextAsync(text, 0.9, effectiveLangPair);
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
