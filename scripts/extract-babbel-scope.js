#!/usr/bin/env node
/**
 * Extract vocabulary and scope from Babbel extracted lessons
 * Creates a scope mapping file for curriculum alignment
 */

const fs = require('fs');
const path = require('path');

const BABBEL_BASE = '/Volumes/External_ssd_mohsen/WorkspaceExtern/babbel-extractor-yolo/output';
const OUTPUT_PATH = path.join(__dirname, '../ai-workspace/curriculum/resource-mapping/babbel-a1-scope.json');

// German words pattern (excludes English words)
const GERMAN_WORD_PATTERN = /^[A-ZÄÖÜa-zäöüß]+$/;

function extractGermanWords(text) {
  if (!text) return [];

  // Split on non-word characters and filter
  const words = text.split(/[\s.,!?;:'"()\[\]{}]+/)
    .filter(w => w.length > 1)
    .filter(w => GERMAN_WORD_PATTERN.test(w))
    // Filter common English words
    .filter(w => !['the', 'is', 'are', 'to', 'and', 'or', 'a', 'an', 'in', 'on', 'at', 'for', 'of', 'your', 'you', 'I', 'Listen', 'Match', 'Sort', 'Choose', 'items', 'correct', 'answer', 'Has', 'playable', 'sound', 'icon'].includes(w));

  return words;
}

function extractVocabFromLesson(lessonData) {
  const vocab = new Set();
  const grammar = new Set();

  if (!lessonData.screens) return { vocab: [], grammar: [] };

  for (const screen of lessonData.screens) {
    // Extract from vocab-intro screens
    if (screen.type === 'vocab-intro' && screen.content?.words) {
      screen.content.words.forEach(w => vocab.add(w.toLowerCase()));
    }

    // Extract from matching screens
    if (screen.type === 'matching' && screen.content?.pairs) {
      screen.content.pairs.forEach(pair => {
        if (pair.german) {
          extractGermanWords(pair.german).forEach(w => vocab.add(w.toLowerCase()));
        }
      });
    }

    // Extract from dataElements (solutions)
    if (screen.raw?.dataElements) {
      screen.raw.dataElements.forEach(el => {
        if (el.solution) {
          extractGermanWords(el.solution).forEach(w => vocab.add(w.toLowerCase()));
        }
      });
    }

    // Extract from vocab-card (grammar explanations)
    if (screen.type === 'vocab-card') {
      const instruction = screen.instruction || '';
      if (instruction.includes('verb') || instruction.includes('conjugat')) {
        grammar.add('verb-conjugation');
      }
      if (instruction.includes('yourself') || instruction.includes('introduce')) {
        grammar.add('introductions');
      }
      if (instruction.includes('formal') || instruction.includes('Sie')) {
        grammar.add('du-vs-sie');
      }
    }
  }

  return {
    vocab: Array.from(vocab).sort(),
    grammar: Array.from(grammar).sort()
  };
}

function processLevel(levelPath, levelId) {
  const lessons = [];
  const metaPath = path.join(levelPath, '_meta.json');

  if (!fs.existsSync(metaPath)) {
    console.log(`No meta file found for ${levelId}`);
    return lessons;
  }

  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));

  for (const [unitId, unitData] of Object.entries(meta.units || {})) {
    const unitPath = path.join(levelPath, unitId);
    if (!fs.existsSync(unitPath)) continue;

    const lessonFiles = fs.readdirSync(unitPath)
      .filter(f => f.startsWith('lesson-') && f.endsWith('.json'))
      .sort((a, b) => {
        const numA = parseInt(a.match(/lesson-(\d+)/)?.[1] || '0');
        const numB = parseInt(b.match(/lesson-(\d+)/)?.[1] || '0');
        return numA - numB;
      });

    for (const lessonFile of lessonFiles) {
      const lessonPath = path.join(unitPath, lessonFile);
      const lessonData = JSON.parse(fs.readFileSync(lessonPath, 'utf-8'));
      const lessonNum = parseInt(lessonFile.match(/lesson-(\d+)/)?.[1] || '0');

      const extracted = extractVocabFromLesson(lessonData);

      lessons.push({
        id: `${levelId}-${unitId}-L${String(lessonNum).padStart(2, '0')}`,
        level: levelId,
        unit: unitId,
        lessonNumber: lessonNum,
        title: lessonData.location?.lessonTitle || `Lesson ${lessonNum}`,
        screenCount: lessonData.meta?.screenCount || 0,
        vocabulary: extracted.vocab,
        vocabularyCount: extracted.vocab.length,
        grammarTopics: extracted.grammar,
        source: lessonPath
      });
    }
  }

  return lessons;
}

function main() {
  console.log('Extracting Babbel A1 scope...\n');

  const result = {
    source: 'Babbel',
    extractedAt: new Date().toISOString(),
    levels: {}
  };

  // Process A1.1 and A1.2
  const a1Levels = ['A11', 'A12'];
  let totalLessons = 0;
  let totalVocab = new Set();

  for (const level of a1Levels) {
    const levelPath = path.join(BABBEL_BASE, level);
    if (!fs.existsSync(levelPath)) {
      console.log(`Level ${level} not found at ${levelPath}`);
      continue;
    }

    const lessons = processLevel(levelPath, level);
    result.levels[level] = {
      lessons,
      lessonCount: lessons.length,
      cumulativeVocab: []
    };

    totalLessons += lessons.length;

    // Build cumulative vocabulary
    const cumulative = new Set();
    for (const lesson of lessons) {
      lesson.vocabulary.forEach(w => cumulative.add(w));
      lesson.vocabulary.forEach(w => totalVocab.add(w));
    }
    result.levels[level].cumulativeVocab = Array.from(cumulative).sort();

    console.log(`${level}: ${lessons.length} lessons, ${cumulative.size} unique words`);
  }

  result.summary = {
    totalLessons,
    totalUniqueVocab: totalVocab.size,
    allVocab: Array.from(totalVocab).sort()
  };

  // Write output
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2));
  console.log(`\nWrote ${OUTPUT_PATH}`);
  console.log(`Total: ${totalLessons} lessons, ${totalVocab.size} unique vocabulary items`);
}

main();
