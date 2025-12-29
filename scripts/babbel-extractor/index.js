#!/usr/bin/env node
/**
 * Babbel Content Extractor
 *
 * Extracts German learning content from Babbel for integration
 * into the German-Persian learning app.
 *
 * Usage:
 *   node index.js --level=a1.1 --auto
 *   node index.js --lesson <url>
 *
 * Prerequisites:
 *   - Logged into Babbel in Chrome
 *   - Active Babbel subscription
 *   - Chrome running with --remote-debugging-port=9222
 *
 * On unknown screen/stuck:
 *   - Saves screenshot + DOM to issues/ folder
 *   - Exits with error message
 *   - You fix the code, then re-run to continue
 */

import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import { detectScreenType, getProgress, isLessonComplete } from './lib/detector.js';
import { solveExercise } from './lib/auto-solver.js';
import { extractContent } from './lib/extractors/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  outputDir: path.join(__dirname, 'output'),
  issuesDir: path.join(__dirname, 'issues'),
  progressFile: (level) => path.join(__dirname, `progress-${level.replace('.', '')}.json`),
  baseUrl: 'https://my.babbel.com',
  courseOverviewUrl: 'https://my.babbel.com/en/course-overview/DEU/learn_languages',
  defaultTimeout: 30000,
  exerciseDelay: 800,
  maxStuckCount: 3
};

// Course level mappings with their learning path IDs
const LEVELS = {
  'a1.1': { name: 'Newcomer I (A1.1)', pathId: '2c17d37bf4b8cb436d6cba815b3cb085' },
  'a1.2': { name: 'Newcomer II (A1.2)', pathId: null },
  'a2.1': { name: 'Beginner I (A2.1)', pathId: null },
  'a2.2': { name: 'Beginner II (A2.2)', pathId: null },
  'b1': { name: 'Intermediate (B1)', pathId: null },
  'b2': { name: 'Upper Intermediate (B2)', pathId: null }
};

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    level: 'a1.1',
    auto: false,
    lesson: null
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--level=')) {
      options.level = args[i].split('=')[1].toLowerCase();
    } else if (args[i] === '--auto') {
      options.auto = true;
    } else if (args[i] === '--lesson' && args[i + 1]) {
      options.lesson = args[i + 1];
      i++;
    }
  }

  return options;
}

/**
 * Connect to existing Chrome instance
 */
async function connectToChrome() {
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://localhost:9222',
      defaultViewport: null
    });
    console.log('✓ Connected to Chrome');
    return browser;
  } catch (error) {
    console.error('✗ Could not connect to Chrome on port 9222');
    console.error('  Start Chrome with: /Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --remote-debugging-port=9222');
    process.exit(1);
  }
}

/**
 * Load progress file
 */
async function loadProgress(level) {
  const file = CONFIG.progressFile(level);
  try {
    const data = await fs.readFile(file, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {
      level,
      completedLessons: [],
      currentLesson: null,
      currentScreen: 0,
      lastUpdated: null
    };
  }
}

/**
 * Save progress file
 */
async function saveProgress(level, progress) {
  const file = CONFIG.progressFile(level);
  progress.lastUpdated = new Date().toISOString();
  await fs.writeFile(file, JSON.stringify(progress, null, 2));
}

/**
 * Save issue for investigation
 */
async function saveIssue(page, type, details) {
  await fs.mkdir(CONFIG.issuesDir, { recursive: true });

  const timestamp = Date.now();
  const issueId = `issue-${timestamp}`;
  const issueDir = path.join(CONFIG.issuesDir, issueId);
  await fs.mkdir(issueDir, { recursive: true });

  // Save screenshot
  await page.screenshot({
    path: path.join(issueDir, 'screenshot.png'),
    fullPage: true
  });

  // Save DOM
  const html = await page.content();
  await fs.writeFile(path.join(issueDir, 'page.html'), html);

  // Save details
  const issueData = {
    id: issueId,
    type,
    timestamp: new Date().toISOString(),
    url: page.url(),
    ...details
  };
  await fs.writeFile(
    path.join(issueDir, 'issue.json'),
    JSON.stringify(issueData, null, 2)
  );

  return issueDir;
}

/**
 * Discover all lessons from course overview page
 */
async function discoverLessons(page, level) {
  const levelConfig = LEVELS[level];
  if (!levelConfig) {
    throw new Error(`Unknown level: ${level}`);
  }

  // Navigate to level overview
  const levelUrl = `${CONFIG.courseOverviewUrl}/learning_path/${levelConfig.pathId}`;
  console.log(`\nNavigating to ${levelConfig.name}...`);
  await page.goto(levelUrl, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // Extract lesson information
  const lessons = await page.evaluate(() => {
    const results = [];
    let currentUnit = null;
    let lessonInUnit = 0;

    // Find all elements in main content
    const elements = document.querySelectorAll('main *');

    for (const el of elements) {
      // Check for unit headers (images with unit title)
      if (el.tagName === 'IMG' && el.alt && !el.alt.includes('Babbel')) {
        currentUnit = {
          title: el.alt,
          number: results.filter(r => r.type === 'unit').length + 1
        };
        results.push({ type: 'unit', ...currentUnit });
        lessonInUnit = 0;
      }

      // Check for lesson buttons (Start now or Repeat)
      if (el.tagName === 'BUTTON') {
        const text = el.textContent.trim();
        if (text === 'Start now' || text === 'Repeat') {
          // Get lesson info from previous siblings
          let lessonTitle = null;
          let lessonDescription = null;

          // Look backwards for lesson info
          let sibling = el.previousElementSibling;
          while (sibling) {
            const sibText = sibling.textContent.trim();
            if (sibText.length > 20 && !sibText.includes('lesson')) {
              lessonDescription = sibText;
            } else if (sibText.length > 5 && !sibText.match(/^lesson \d+$/) && !sibText.match(/^\d+$/)) {
              lessonTitle = sibText;
              break;
            }
            sibling = sibling.previousElementSibling;
          }

          lessonInUnit++;

          results.push({
            type: 'lesson',
            unit: currentUnit?.number || 1,
            unitTitle: currentUnit?.title || 'Unknown',
            lessonInUnit,
            title: lessonTitle || `Lesson ${lessonInUnit}`,
            description: lessonDescription,
            status: text === 'Repeat' ? 'completed' : 'available',
            buttonText: text
          });
        }
      }
    }

    return results.filter(r => r.type === 'lesson');
  });

  console.log(`Found ${lessons.length} lessons in ${level.toUpperCase()}`);
  return lessons;
}

/**
 * Start a lesson by clicking its button
 */
async function startLesson(page, lessonIndex) {
  // Find all Start/Repeat buttons
  const buttons = await page.$$('button');
  let lessonButtonIndex = 0;

  for (const button of buttons) {
    const text = await button.evaluate(el => el.textContent.trim());
    if (text === 'Start now' || text === 'Repeat') {
      if (lessonButtonIndex === lessonIndex) {
        await button.click();
        await new Promise(r => setTimeout(r, 2000));
        return true;
      }
      lessonButtonIndex++;
    }
  }

  return false;
}

/**
 * Extract a single lesson
 */
async function extractLesson(page, lessonInfo, progress) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Extracting: ${lessonInfo.title}`);
  console.log(`Unit ${lessonInfo.unit}: ${lessonInfo.unitTitle}`);
  console.log(`${'='.repeat(60)}`);

  const screens = [];
  let screenIndex = progress.currentScreen || 0;
  let stuckCount = 0;
  let lastType = null;

  while (!await isLessonComplete(page) && stuckCount < CONFIG.maxStuckCount) {
    const pageProgress = await getProgress(page);
    const { type, instruction } = await detectScreenType(page);

    console.log(`  [${screenIndex + 1}] ${type} (${pageProgress?.current || '?'}/${pageProgress?.total || '?'})`);

    // Check for unknown type
    if (type === 'unknown' || type === 'exercise-unknown') {
      const issueDir = await saveIssue(page, 'unknown-screen', {
        screenIndex,
        detectedType: type,
        instruction,
        lessonInfo
      });

      console.error(`\n${'!'.repeat(60)}`);
      console.error(`UNKNOWN SCREEN TYPE at screen ${screenIndex + 1}`);
      console.error(`Issue saved to: ${issueDir}`);
      console.error(`${'!'.repeat(60)}`);
      process.exit(1);
    }

    // Check for stuck (same screen type twice in a row after solving)
    if (type === lastType && stuckCount > 0) {
      stuckCount++;
      if (stuckCount >= CONFIG.maxStuckCount) {
        const issueDir = await saveIssue(page, 'stuck', {
          screenIndex,
          detectedType: type,
          instruction,
          stuckCount,
          lessonInfo
        });

        console.error(`\n${'!'.repeat(60)}`);
        console.error(`STUCK on ${type} at screen ${screenIndex + 1}`);
        console.error(`Issue saved to: ${issueDir}`);
        console.error(`${'!'.repeat(60)}`);
        process.exit(1);
      }
    }

    // Extract content before solving
    const content = await extractContent(page, type);
    screens.push({
      index: screenIndex,
      type,
      instruction,
      content: content.content || content.raw,
      progress: pageProgress
    });

    // Save checkpoint
    progress.currentScreen = screenIndex;
    await saveProgress(progress.level, progress);

    // Solve and advance
    const solved = await solveExercise(page, type);
    if (!solved) {
      stuckCount++;
      console.log(`    ⚠ Could not solve (attempt ${stuckCount}/${CONFIG.maxStuckCount})`);
    } else {
      stuckCount = 0;
    }

    lastType = type;
    await new Promise(r => setTimeout(r, CONFIG.exerciseDelay));
    screenIndex++;

    // Safety limit
    if (screenIndex > 100) {
      console.log('  ⚠ Exceeded 100 screens, breaking');
      break;
    }
  }

  // Handle lesson end
  const finalType = (await detectScreenType(page)).type;
  if (finalType === 'lesson-end' || finalType === 'pronunciation-end') {
    console.log(`  [END] ${finalType}`);
    const endContent = await extractContent(page, finalType);
    screens.push({
      index: screenIndex,
      type: finalType,
      content: endContent.content
    });

    await solveExercise(page, finalType);
    await new Promise(r => setTimeout(r, 1000));
  }

  return {
    ...lessonInfo,
    url: page.url(),
    screens,
    screenCount: screens.length,
    extractedAt: new Date().toISOString()
  };
}

/**
 * Save extracted lesson to file
 */
async function saveLessonData(level, lessonInfo, data) {
  const levelDir = path.join(CONFIG.outputDir, level.toUpperCase().replace('.', ''));
  const unitDir = path.join(levelDir, `unit-${String(lessonInfo.unit).padStart(2, '0')}`);

  await fs.mkdir(unitDir, { recursive: true });

  const filename = `lesson-${String(lessonInfo.lessonInUnit).padStart(2, '0')}.json`;
  const filepath = path.join(unitDir, filename);

  await fs.writeFile(filepath, JSON.stringify(data, null, 2));
  console.log(`  ✓ Saved: ${filepath}`);

  return filepath;
}

/**
 * Main entry point
 */
async function main() {
  const options = parseArgs();

  console.log('\n╔════════════════════════════════════════╗');
  console.log('║     BABBEL CONTENT EXTRACTOR           ║');
  console.log('╚════════════════════════════════════════╝\n');

  // Create directories
  await fs.mkdir(CONFIG.outputDir, { recursive: true });
  await fs.mkdir(CONFIG.issuesDir, { recursive: true });

  // Connect to Chrome
  const browser = await connectToChrome();
  const pages = await browser.pages();
  const page = pages[0] || await browser.newPage();

  try {
    // Single lesson mode
    if (options.lesson) {
      console.log('Mode: Single lesson extraction');
      await page.goto(options.lesson, { waitUntil: 'networkidle2' });
      await new Promise(r => setTimeout(r, 2000));

      const progress = { level: 'single', currentScreen: 0 };
      const data = await extractLesson(page, { title: 'Single Lesson', unit: 0, lessonInUnit: 1 }, progress);

      await fs.writeFile(
        path.join(CONFIG.outputDir, 'single-lesson.json'),
        JSON.stringify(data, null, 2)
      );
      console.log('\n✓ Lesson extracted successfully!');
      return;
    }

    // Level extraction mode
    console.log(`Mode: Level extraction (${options.level.toUpperCase()})`);

    const progress = await loadProgress(options.level);
    console.log(`Previously completed: ${progress.completedLessons.length} lessons`);

    // Discover all lessons
    const lessons = await discoverLessons(page, options.level);

    // Find where to start
    const startIndex = progress.completedLessons.length;
    console.log(`\nStarting from lesson ${startIndex + 1} of ${lessons.length}`);

    // Extract each lesson
    for (let i = startIndex; i < lessons.length; i++) {
      const lessonInfo = lessons[i];

      console.log(`\n[${'─'.repeat(56)}]`);
      console.log(`LESSON ${i + 1}/${lessons.length}: ${lessonInfo.title}`);
      console.log(`[${'─'.repeat(56)}]`);

      // Navigate to level page and start lesson
      const levelConfig = LEVELS[options.level];
      const levelUrl = `${CONFIG.courseOverviewUrl}/learning_path/${levelConfig.pathId}`;
      await page.goto(levelUrl, { waitUntil: 'networkidle2' });
      await new Promise(r => setTimeout(r, 2000));

      const started = await startLesson(page, i);
      if (!started) {
        console.error(`Could not start lesson ${i + 1}`);
        continue;
      }

      // Wait for lesson to load
      await new Promise(r => setTimeout(r, 2000));

      // Reset screen counter for new lesson
      progress.currentLesson = lessonInfo.title;
      progress.currentScreen = 0;

      // Extract lesson
      const data = await extractLesson(page, lessonInfo, progress);

      // Save lesson data
      await saveLessonData(options.level, lessonInfo, data);

      // Mark as completed
      progress.completedLessons.push({
        index: i,
        title: lessonInfo.title,
        completedAt: new Date().toISOString()
      });
      progress.currentLesson = null;
      progress.currentScreen = 0;
      await saveProgress(options.level, progress);

      console.log(`✓ Completed lesson ${i + 1}/${lessons.length}`);
    }

    console.log('\n╔════════════════════════════════════════╗');
    console.log('║     EXTRACTION COMPLETE                ║');
    console.log(`║     ${progress.completedLessons.length}/${lessons.length} lessons extracted             ║`);
    console.log('╚════════════════════════════════════════╝\n');

  } catch (error) {
    // Save issue on any error
    const issueDir = await saveIssue(page, 'error', {
      message: error.message,
      stack: error.stack
    });

    console.error(`\n${'!'.repeat(60)}`);
    console.error(`ERROR: ${error.message}`);
    console.error(`Issue saved to: ${issueDir}`);
    console.error(`${'!'.repeat(60)}`);
    process.exit(1);
  }
}

main().catch(console.error);
