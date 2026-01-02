/**
 * Knowledge Base Builder
 *
 * Processes extracted lessons and builds a categorized knowledge base:
 * - vocabulary: German words/phrases with translations
 * - grammar: Grammar rules and explanations
 * - cultural: Cultural notes (formal/informal, customs)
 * - pronunciation: Pronunciation rules
 *
 * This ensures valuable learning content isn't lost when re-crawling
 * lessons with "Repeat" (which may skip some content).
 */

import fs from 'fs';
import path from 'path';

/**
 * Content category patterns
 */
const PATTERNS = {
  grammar: [
    /verb conjugat/i,
    /to introduce/i,
    /personal pronoun/i,
    /you use:/i,
    /consist of/i,
    /stem and/i,
    /ending/i,
    /\bich\b.*\bdu\b.*\ber\b/i,  // Conjugation tables
    /singular.*plural/i,
  ],
  cultural: [
    /formal situation/i,
    /informal/i,
    /in germany/i,
    /german custom/i,
    /polite/i,
    /surname/i,
    /first name/i,
  ],
  pronunciation: [
    /pronounc/i,
    /long or short/i,
    /vowel/i,
    /consonant/i,
    /sound/i,
    /the german [a-z]/i,
  ],
  story: [
    /freddy/i,
    /berlin/i,
    /apartment/i,
    /on his way/i,
    /let's have a look/i,
  ]
};

/**
 * Extract vocabulary pairs from content
 * Looks for patterns like "German word/phrase" followed by English translation
 */
function extractVocabulary(content, instruction) {
  const vocab = [];

  if (typeof content === 'string') {
    // Pattern: "German phraseEnglish translation" (no space between)
    // e.g., "Guten Tag.Hello (lit. Good day)."
    const patterns = [
      // German followed by English in parentheses
      /([A-ZÄÖÜ][a-zäöüß\s]+[.!?]?)([A-Z][a-z\s(),.]+[.!?])/g,
      // Explicit translation patterns
      /([A-ZÄÖÜ][a-zäöüß\s]+)\s*[-–]\s*([A-Za-z\s(),.]+)/g,
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const german = match[1].trim();
        const english = match[2].trim();
        if (german.length > 1 && english.length > 1 && german !== english) {
          vocab.push({ german, english, source: instruction || 'unknown' });
        }
      }
    }
  }

  // Extract from structured content
  if (content?.words) {
    for (const word of content.words) {
      vocab.push({ german: word, english: null, source: instruction || 'vocab-intro' });
    }
  }

  if (content?.pairs) {
    for (const pair of content.pairs) {
      if (pair.german && pair.english) {
        // Clean numbered prefixes like "1hello" -> "hello"
        const english = pair.english.replace(/^\d+/, '').trim();
        vocab.push({ german: pair.german, english, source: instruction || 'matching' });
      }
    }
  }

  return vocab;
}

/**
 * Categorize a screen's content
 */
function categorizeScreen(screen) {
  const { type, instruction, content } = screen;
  const categories = [];

  // Get text to analyze
  let textToAnalyze = '';
  if (typeof content === 'string') {
    textToAnalyze = content;
  } else if (content?.fullText) {
    textToAnalyze = content.fullText;
  }
  if (instruction) {
    textToAnalyze = instruction + ' ' + textToAnalyze;
  }

  // Check each category
  for (const [category, patterns] of Object.entries(PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(textToAnalyze)) {
        categories.push(category);
        break;
      }
    }
  }

  // Default categorization by screen type
  if (categories.length === 0) {
    switch (type) {
      case 'vocab-intro':
      case 'vocab-card':
        categories.push('vocabulary');
        break;
      case 'matching':
        categories.push('vocabulary');
        break;
      case 'grammar-tip':
        categories.push('grammar');
        break;
      case 'dialogue':
      case 'response-choice':
        categories.push('conversation');
        break;
      default:
        categories.push('exercise');
    }
  }

  return {
    categories,
    vocabulary: extractVocabulary(content, instruction),
    isGrammarTip: categories.includes('grammar'),
    isCulturalNote: categories.includes('cultural'),
    isPronunciation: categories.includes('pronunciation'),
  };
}

/**
 * Build knowledge base from extracted lessons
 */
export async function buildKnowledgeBase(outputDir, level) {
  const kb = {
    level,
    vocabulary: [],
    grammar: [],
    cultural: [],
    pronunciation: [],
    conversations: [],
    updatedAt: new Date().toISOString(),
  };

  // Track unique items to avoid duplicates
  const seen = {
    vocab: new Set(),
    grammar: new Set(),
    cultural: new Set(),
    pronunciation: new Set(),
  };

  // Read all lesson files
  const levelDir = path.join(outputDir, level.toUpperCase().replace('.', ''));
  if (!fs.existsSync(levelDir)) {
    console.log(`No lessons found for level ${level}`);
    return kb;
  }

  const units = fs.readdirSync(levelDir).filter(f => f.startsWith('unit-'));

  for (const unit of units) {
    const unitDir = path.join(levelDir, unit);
    const lessons = fs.readdirSync(unitDir).filter(f => f.endsWith('.json'));

    for (const lessonFile of lessons) {
      const lessonPath = path.join(unitDir, lessonFile);
      const lesson = JSON.parse(fs.readFileSync(lessonPath, 'utf8'));

      for (const screen of lesson.screens || []) {
        const analysis = categorizeScreen(screen);

        // Add vocabulary
        for (const vocab of analysis.vocabulary) {
          const key = `${vocab.german}|${vocab.english}`;
          if (!seen.vocab.has(key)) {
            seen.vocab.add(key);
            kb.vocabulary.push({
              ...vocab,
              lesson: lesson.title,
              unit: lesson.unitTitle,
              screenIndex: screen.index,
            });
          }
        }

        // Add grammar tips
        if (analysis.isGrammarTip && screen.content) {
          const text = typeof screen.content === 'string'
            ? screen.content
            : screen.content.fullText || JSON.stringify(screen.content);
          const key = text.substring(0, 100);
          if (!seen.grammar.has(key)) {
            seen.grammar.add(key);
            kb.grammar.push({
              instruction: screen.instruction,
              content: text,
              lesson: lesson.title,
              unit: lesson.unitTitle,
              screenIndex: screen.index,
            });
          }
        }

        // Add cultural notes
        if (analysis.isCulturalNote && screen.content) {
          const text = typeof screen.content === 'string'
            ? screen.content
            : screen.content.fullText || JSON.stringify(screen.content);
          const key = text.substring(0, 100);
          if (!seen.cultural.has(key)) {
            seen.cultural.add(key);
            kb.cultural.push({
              instruction: screen.instruction,
              content: text,
              lesson: lesson.title,
              unit: lesson.unitTitle,
              screenIndex: screen.index,
            });
          }
        }

        // Add pronunciation rules
        if (analysis.isPronunciation && screen.content) {
          const text = typeof screen.content === 'string'
            ? screen.content
            : screen.content.fullText || JSON.stringify(screen.content);
          const key = text.substring(0, 100);
          if (!seen.pronunciation.has(key)) {
            seen.pronunciation.add(key);
            kb.pronunciation.push({
              instruction: screen.instruction,
              content: text,
              lesson: lesson.title,
              unit: lesson.unitTitle,
              screenIndex: screen.index,
            });
          }
        }
      }
    }
  }

  // Save knowledge base
  const kbDir = path.join(outputDir, level.toUpperCase().replace('.', ''), 'knowledge-base');
  fs.mkdirSync(kbDir, { recursive: true });

  fs.writeFileSync(
    path.join(kbDir, 'vocabulary.json'),
    JSON.stringify(kb.vocabulary, null, 2)
  );
  fs.writeFileSync(
    path.join(kbDir, 'grammar.json'),
    JSON.stringify(kb.grammar, null, 2)
  );
  fs.writeFileSync(
    path.join(kbDir, 'cultural.json'),
    JSON.stringify(kb.cultural, null, 2)
  );
  fs.writeFileSync(
    path.join(kbDir, 'pronunciation.json'),
    JSON.stringify(kb.pronunciation, null, 2)
  );
  fs.writeFileSync(
    path.join(kbDir, 'index.json'),
    JSON.stringify({
      level,
      counts: {
        vocabulary: kb.vocabulary.length,
        grammar: kb.grammar.length,
        cultural: kb.cultural.length,
        pronunciation: kb.pronunciation.length,
      },
      updatedAt: kb.updatedAt,
    }, null, 2)
  );

  console.log(`\nKnowledge base built for ${level}:`);
  console.log(`  Vocabulary: ${kb.vocabulary.length} items`);
  console.log(`  Grammar: ${kb.grammar.length} tips`);
  console.log(`  Cultural: ${kb.cultural.length} notes`);
  console.log(`  Pronunciation: ${kb.pronunciation.length} rules`);
  console.log(`  Saved to: ${kbDir}`);

  return kb;
}

/**
 * Merge new knowledge into existing base (for incremental updates)
 */
export async function mergeKnowledgeBase(outputDir, level) {
  const kbDir = path.join(outputDir, level.toUpperCase().replace('.', ''), 'knowledge-base');

  // Load existing if present
  let existing = { vocabulary: [], grammar: [], cultural: [], pronunciation: [] };
  const indexPath = path.join(kbDir, 'index.json');
  if (fs.existsSync(indexPath)) {
    try {
      existing.vocabulary = JSON.parse(fs.readFileSync(path.join(kbDir, 'vocabulary.json'), 'utf8'));
      existing.grammar = JSON.parse(fs.readFileSync(path.join(kbDir, 'grammar.json'), 'utf8'));
      existing.cultural = JSON.parse(fs.readFileSync(path.join(kbDir, 'cultural.json'), 'utf8'));
      existing.pronunciation = JSON.parse(fs.readFileSync(path.join(kbDir, 'pronunciation.json'), 'utf8'));
    } catch (e) {
      console.log('Could not load existing knowledge base, starting fresh');
    }
  }

  // Build fresh and merge
  const fresh = await buildKnowledgeBase(outputDir, level);

  // Merge logic would go here for incremental updates
  // For now, buildKnowledgeBase already handles deduplication

  return fresh;
}

export default {
  buildKnowledgeBase,
  mergeKnowledgeBase,
  categorizeScreen,
};
