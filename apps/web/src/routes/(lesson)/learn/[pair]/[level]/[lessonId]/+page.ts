// Client-side lesson loader for Capacitor compatibility
import type { PageLoad } from "./$types";
import { LessonSchema } from "$lib/content-model";
import { error } from "@sveltejs/kit";

// Module folders to search for lessons
const MODULE_FOLDERS = ['module-01', 'module-02', 'module-03', 'module-04', 'module-05', 'module-06', 'module-07', 'module-08'];

export const load: PageLoad = async ({ params, fetch }) => {
  const { pair, level, lessonId } = params;

  // Try to fetch lesson from static content folder
  for (const moduleFolder of MODULE_FOLDERS) {
    const url = `/content/${pair}/${level}/${moduleFolder}/${lessonId}.json`;

    try {
      const response = await fetch(url);
      if (response.ok) {
        const json = await response.json();
        const parsed = LessonSchema.parse(json);

        return {
          lesson: parsed,
          langPair: pair,
          level: level,
          lessonId: lessonId,
        };
      }
    } catch (e) {
      // Continue to next module folder
      continue;
    }
  }

  throw error(404, `Lesson not found: ${lessonId}`);
};
