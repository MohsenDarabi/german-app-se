#!/usr/bin/env node
/**
 * Extract vocabulary and scope from Busuu extracted lessons
 * Creates a scope mapping file for curriculum alignment
 */

const fs = require('fs');
const path = require('path');

const BUSUU_BASE = '/Volumes/External_ssd_mohsen/WorkspaceExtern/content-extractors/screen-flow-mapper/output';
const OUTPUT_PATH = path.join(__dirname, '../ai-workspace/curriculum/resource-mapping/busuu-a1-scope.json');

// German words pattern
const GERMAN_WORD_PATTERN = /^[A-ZÄÖÜa-zäöüß]+$/;

function extractGermanWords(text) {
  if (!text) return [];
  const words = text.split(/[\s.,!?;:'"()\[\]{}]+/)
    .filter(w => w.length > 1)
    .filter(w => GERMAN_WORD_PATTERN.test(w));
  return words;
}

function extractVocabFromLesson(lessonData) {
  const vocab = new Set();
  const grammarTips = [];

  if (!lessonData.screens) return { vocab: [], grammarTips: [] };

  for (const screen of lessonData.screens) {
    // Extract from flashcards
    if (screen.type === 'flashcard' && screen.content?.content?.german) {
      extractGermanWords(screen.content.content.german).forEach(w => vocab.add(w.toLowerCase()));
    }

    // Extract from fillgap exercises
    if (screen.type === 'fillgap') {
      if (screen.content?.correctAnswers) {
        screen.content.correctAnswers.forEach(answer => {
          extractGermanWords(answer).forEach(w => vocab.add(w.toLowerCase()));
        });
      }
      if (screen.content?.sentence?.complete) {
        extractGermanWords(screen.content.sentence.complete).forEach(w => vocab.add(w.toLowerCase()));
      }
    }

    // Extract grammar tips from feedback
    if (screen.type === 'feedback' && screen.content?.tip) {
      grammarTips.push(screen.content.tip);
      if (screen.content.highlights) {
        screen.content.highlights.forEach(h => {
          extractGermanWords(h).forEach(w => vocab.add(w.toLowerCase()));
        });
      }
    }

    // Extract from dialogue screens
    if (screen.type === 'dialogue' && screen.content?.lines) {
      screen.content.lines.forEach(line => {
        if (line.text) {
          extractGermanWords(line.text).forEach(w => vocab.add(w.toLowerCase()));
        }
      });
    }

    // Extract from multiple choice
    if (screen.type === 'multiple-choice' && screen.content?.options) {
      screen.content.options.forEach(opt => {
        if (opt.text && opt.isCorrect) {
          extractGermanWords(opt.text).forEach(w => vocab.add(w.toLowerCase()));
        }
      });
    }
  }

  return {
    vocab: Array.from(vocab).sort(),
    grammarTips
  };
}

function processChapter(chapterPath, chapterName) {
  const lessons = [];

  const lessonFiles = fs.readdirSync(chapterPath)
    .filter(f => f.endsWith('.json'))
    .sort();

  for (const lessonFile of lessonFiles) {
    const lessonPath = path.join(chapterPath, lessonFile);
    const lessonData = JSON.parse(fs.readFileSync(lessonPath, 'utf-8'));

    const extracted = extractVocabFromLesson(lessonData);

    lessons.push({
      id: `${chapterName}/${lessonFile.replace('.json', '')}`,
      chapterNumber: lessonData.chapter?.number || 0,
      chapterTitle: lessonData.chapter?.title || chapterName,
      lessonNumber: lessonData.lesson?.number || 0,
      lessonTitle: lessonData.lesson?.title || lessonFile,
      screenCount: lessonData.screenCount || 0,
      vocabulary: extracted.vocab,
      vocabularyCount: extracted.vocab.length,
      grammarTips: extracted.grammarTips,
      source: lessonPath
    });
  }

  return lessons;
}

function main() {
  console.log('Extracting Busuu A1 scope...\n');

  const a1Path = path.join(BUSUU_BASE, 'A1');
  if (!fs.existsSync(a1Path)) {
    console.error(`A1 path not found: ${a1Path}`);
    process.exit(1);
  }

  const chapters = fs.readdirSync(a1Path)
    .filter(f => f.startsWith('chapter-'))
    .sort();

  const result = {
    source: 'Busuu',
    extractedAt: new Date().toISOString(),
    level: 'A1',
    chapters: []
  };

  let totalLessons = 0;
  const totalVocab = new Set();

  for (const chapterDir of chapters) {
    const chapterPath = path.join(a1Path, chapterDir);
    const lessons = processChapter(chapterPath, chapterDir);

    // Build chapter vocabulary
    const chapterVocab = new Set();
    for (const lesson of lessons) {
      lesson.vocabulary.forEach(w => chapterVocab.add(w));
      lesson.vocabulary.forEach(w => totalVocab.add(w));
    }

    result.chapters.push({
      id: chapterDir,
      title: chapterDir.replace('chapter-', '').replace(/-/g, ' ').replace(/^\d+\s*/, ''),
      lessonCount: lessons.length,
      lessons,
      chapterVocab: Array.from(chapterVocab).sort()
    });

    totalLessons += lessons.length;
    console.log(`${chapterDir}: ${lessons.length} lessons, ${chapterVocab.size} words`);
  }

  result.summary = {
    totalChapters: chapters.length,
    totalLessons,
    totalUniqueVocab: totalVocab.size,
    allVocab: Array.from(totalVocab).sort()
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2));
  console.log(`\nWrote ${OUTPUT_PATH}`);
  console.log(`Total: ${chapters.length} chapters, ${totalLessons} lessons, ${totalVocab.size} unique words`);
}

main();
