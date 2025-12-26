#!/usr/bin/env node
/**
 * Busuu Content Cleanup Script
 *
 * Cleans extracted content by:
 * 1. Removing junk grammar tips ("Continue", "Check", short text)
 * 2. Stripping "Continue" suffix from tips
 * 3. Removing vocabulary with UI text ("Show hint", etc.)
 * 4. Separating sentences from exercise fragments
 * 5. Marking "Developing fluency" lessons as speaking practice
 *
 * Usage:
 *   node cleanup-content.js --level=a1
 *   node cleanup-content.js --all
 */

import fs from 'fs';
import path from 'path';

const CONFIG = {
  contentDir: path.join(process.cwd(), '..', '..', 'extracted-content', 'busuu'),
};

// Junk patterns to remove from grammar tips
const JUNK_TIP_PATTERNS = [
  /^Continue$/i,
  /^Check$/i,
  /^Next$/i,
  /^Skip$/i,
  /^\.+$/,
  /^.{0,10}$/, // Too short
];

// UI text to remove from vocabulary
const JUNK_VOCAB_PATTERNS = [
  /show hint/i,
  /tap to hear/i,
  /click to hear/i,
  /press to listen/i,
  /play audio/i,
  /^\d+$/,
  /^[×x]$/i,
];

// Patterns for exercise fragments (not real sentences)
const EXERCISE_FRAGMENT_PATTERNS = [
  /___/, // Fill in the blank
  /^\w+\d+$/, // Word with number suffix like "du?1"
  /^[a-zA-ZäöüßÄÖÜ]{1,3}$/, // Too short (single letters/articles)
];

function cleanGrammarTips(tips) {
  if (!tips || !Array.isArray(tips)) return [];

  return tips
    .map(tip => {
      // Remove trailing "Continue", "Check" etc.
      let cleaned = tip
        .replace(/Continue$/g, '')
        .replace(/Check$/g, '')
        .replace(/Next$/g, '')
        .trim();
      return cleaned;
    })
    .filter(tip => {
      // Remove junk tips
      if (!tip || tip.length < 15) return false;
      for (const pattern of JUNK_TIP_PATTERNS) {
        if (pattern.test(tip)) return false;
      }
      return true;
    })
    // Dedupe
    .filter((tip, index, arr) => arr.indexOf(tip) === index);
}

function cleanVocabulary(vocab) {
  if (!vocab || !Array.isArray(vocab)) return [];

  return vocab.filter(item => {
    if (!item.de || !item.en) return false;

    // Check for junk patterns
    for (const pattern of JUNK_VOCAB_PATTERNS) {
      if (pattern.test(item.de) || pattern.test(item.en)) return false;
    }

    // Filter out too short entries
    if (item.de.length < 2 || item.en.length < 2) return false;

    return true;
  });
}

function cleanSentences(sentences) {
  if (!sentences || !Array.isArray(sentences)) return { sentences: [], exercises: [] };

  const cleanSentences = [];
  const exercises = [];

  sentences.forEach(sentence => {
    if (!sentence || typeof sentence !== 'string') return;

    const trimmed = sentence.trim();
    if (trimmed.length < 2) return;

    // Check if it's an exercise fragment
    let isFragment = false;
    for (const pattern of EXERCISE_FRAGMENT_PATTERNS) {
      if (pattern.test(trimmed)) {
        isFragment = true;
        break;
      }
    }

    if (isFragment) {
      // Store as exercise if it's meaningful
      if (trimmed.length > 5 && trimmed.includes('___')) {
        exercises.push(trimmed);
      }
    } else {
      cleanSentences.push(trimmed);
    }
  });

  // Dedupe
  return {
    sentences: [...new Set(cleanSentences)],
    exercises: [...new Set(exercises)]
  };
}

function cleanContent(data) {
  console.log('\nCleaning content...\n');

  const stats = {
    tipsRemoved: 0,
    tipsCleaned: 0,
    vocabRemoved: 0,
    sentencesKept: 0,
    exercisesExtracted: 0,
  };

  // Clean each chapter/lesson
  data.chapters?.forEach(chapter => {
    chapter.lessons?.forEach(lesson => {
      // Clean grammar tips
      const originalTipsCount = lesson.grammarTips?.length || 0;
      lesson.grammarTips = cleanGrammarTips(lesson.grammarTips);
      stats.tipsRemoved += originalTipsCount - lesson.grammarTips.length;
      stats.tipsCleaned += lesson.grammarTips.length;

      // Clean vocabulary
      const originalVocabCount = lesson.vocabulary?.length || 0;
      lesson.vocabulary = cleanVocabulary(lesson.vocabulary);
      stats.vocabRemoved += originalVocabCount - lesson.vocabulary.length;

      // Clean sentences and extract exercises
      const { sentences, exercises } = cleanSentences(lesson.sentences);
      lesson.sentences = sentences;
      lesson.exercises = exercises;
      stats.sentencesKept += sentences.length;
      stats.exercisesExtracted += exercises.length;

      // Mark speaking practice lessons
      if (lesson.title?.toLowerCase().includes('developing fluency') ||
          lesson.title?.toLowerCase().includes('speaking')) {
        lesson.type = 'speaking-practice';
      }
    });
  });

  // Clean aggregated data
  data.allVocabulary = cleanVocabulary(data.allVocabulary);
  data.allGrammarTips = cleanGrammarTips(data.allGrammarTips);

  // Clean culture tips too
  if (data.allCultureTips) {
    data.allCultureTips = data.allCultureTips
      .map(tip => tip.replace(/Continue$/g, '').replace(/Check$/g, '').trim())
      .filter(tip => tip.length > 20)
      .filter((tip, i, arr) => arr.indexOf(tip) === i);
  }

  console.log('Stats:');
  console.log(`  Tips removed: ${stats.tipsRemoved}`);
  console.log(`  Tips cleaned: ${stats.tipsCleaned}`);
  console.log(`  Vocab removed: ${stats.vocabRemoved}`);
  console.log(`  Sentences kept: ${stats.sentencesKept}`);
  console.log(`  Exercises extracted: ${stats.exercisesExtracted}`);

  return data;
}

function processLevel(level) {
  const levelDir = path.join(CONFIG.contentDir, level.toUpperCase());
  const contentPath = path.join(levelDir, 'content.json');

  if (!fs.existsSync(contentPath)) {
    console.log(`No content found for ${level.toUpperCase()}`);
    return false;
  }

  console.log(`\n========================================`);
  console.log(`Processing ${level.toUpperCase()}`);
  console.log(`========================================`);

  // Read content
  const data = JSON.parse(fs.readFileSync(contentPath, 'utf8'));

  console.log(`Before cleanup:`);
  console.log(`  Chapters: ${data.chapters?.length || 0}`);
  console.log(`  Vocabulary: ${data.allVocabulary?.length || 0}`);
  console.log(`  Grammar tips: ${data.allGrammarTips?.length || 0}`);

  // Clean
  const cleaned = cleanContent(data);

  // Add cleanup timestamp
  cleaned.cleanedAt = new Date().toISOString();

  console.log(`\nAfter cleanup:`);
  console.log(`  Vocabulary: ${cleaned.allVocabulary?.length || 0}`);
  console.log(`  Grammar tips: ${cleaned.allGrammarTips?.length || 0}`);

  // Backup original
  const backupPath = path.join(levelDir, 'content.original.json');
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(contentPath, backupPath);
    console.log(`\nBackup saved to: content.original.json`);
  }

  // Save cleaned version
  fs.writeFileSync(contentPath, JSON.stringify(cleaned, null, 2));
  console.log(`Cleaned content saved to: content.json`);

  return true;
}

// Main
const args = process.argv.slice(2);
const levelArg = args.find(a => a.startsWith('--level='))?.split('=')[1];
const processAll = args.includes('--all');

if (processAll) {
  const levels = ['a1', 'a2', 'b1', 'b2'];
  levels.forEach(level => processLevel(level));
} else if (levelArg) {
  processLevel(levelArg);
} else {
  console.log('Usage:');
  console.log('  node cleanup-content.js --level=a1');
  console.log('  node cleanup-content.js --all');
}

console.log('\nDone!');
