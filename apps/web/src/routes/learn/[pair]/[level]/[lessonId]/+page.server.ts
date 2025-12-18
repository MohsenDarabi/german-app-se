import type { PageServerLoad } from "./$types";
import { LessonSchema, type Lesson } from "$lib/content-model";
import { error } from "@sveltejs/kit";
import fs from "node:fs";
import path from "node:path";

export const load: PageServerLoad = async ({ params }) => {
  const { pair, level, lessonId } = params;

  // Search logic: The lesson could be in any module folder (module-01, module-02, etc.)
  // We need to find where `lessonId.json` resides under `content/{pair}/{level}/`.

  const baseContentPath = path.resolve(process.cwd(), `content/${pair}/${level}`);
  const baseContentPathFallback = path.resolve(process.cwd(), `../../content/${pair}/${level}`);

  let searchRoot = baseContentPath;
  if (!fs.existsSync(searchRoot)) {
    searchRoot = baseContentPathFallback;
  }

  if (!fs.existsSync(searchRoot)) {
     throw error(404, `Level content not found: ${level} (Path: ${searchRoot})`);
  }

  // Find the file recursively or by iterating known module folders
  let finalPath: string | null = null;

  // Optimization: Read all subdirectories (module-XX)
  const entries = fs.readdirSync(searchRoot, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory() && entry.name.startsWith("module-")) {
      const candidate = path.join(searchRoot, entry.name, `${lessonId}.json`);
      if (fs.existsSync(candidate)) {
        finalPath = candidate;
        break;
      }
    }
  }

  if (!finalPath) {
    throw error(404, `Lesson file not found: ${lessonId}`);
  }

  const fileContent = fs.readFileSync(finalPath, "utf-8");

  try {
    const json = JSON.parse(fileContent);
    const parsed = LessonSchema.parse(json);

    return {
      lesson: parsed,
      langPair: pair,
      level: level,
      lessonId: lessonId,
    };
  } catch (e: any) {
    console.error("Parse Error:", e);
    throw error(500, `Failed to parse lesson data: ${e.message}`);
  }
};