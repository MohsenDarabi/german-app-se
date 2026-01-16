// Client-side lesson loader with CDN support
// Uses contentService for CDN + offline caching, falls back to local
import type { PageLoad } from "./$types";
import { error } from "@sveltejs/kit";
import { browser } from "$app/environment";
import * as contentService from "$lib/services/contentService";
import * as assetService from "$lib/services/assetService";

// Disable SSR - lesson loading requires browser features (IndexedDB, CDN fetch)
export const ssr = false;

export const load: PageLoad = async ({ params }) => {
  const { pair, level, lessonId } = params;

  // Initialize both services with the lesson's language pair
  // This ensures audio URLs use the correct language (de-fa for German lessons, en-fa for English)
  // With ssr=false, this always runs in the browser
  await Promise.all([
    contentService.init(pair),
    assetService.init(pair),
  ]);

  try {
    // Load lesson through content service (handles CDN + caching + fallback)
    const lesson = await contentService.loadLesson(lessonId);

    return {
      lesson,
      langPair: pair,
      level: level,
      lessonId: lessonId,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    console.error(`Failed to load lesson ${lessonId}:`, message);
    throw error(404, `Lesson not found: ${lessonId}`);
  }
};
