#!/usr/bin/env node

/**
 * Busuu Screen Flow Mapper
 *
 * Extract Busuu content screen-by-screen with human-in-the-loop validation.
 *
 * Usage:
 *   node index.js                     # Interactive mode
 *   node index.js --level=a1          # Extract all lessons for level
 *   node index.js --lesson <url>      # Extract specific lesson
 *   node index.js --validate          # Validate existing extraction
 *   node index.js --auto              # Auto-advance without validation
 *
 * See: docs/busuu-research/README.md
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { promises as fs } from 'fs';
import fsSync from 'fs';

import { detectScreenType, waitForScreen, hasFeedback, isInterstitialPage, isLessonEnded, SCREEN_TYPES } from './lib/detector.js';
import { extract, hasExtractor } from './lib/extractors/index.js';
import { extractFeedback } from './lib/extractors/feedback.js';
import { solveExercise } from './lib/auto-solver.js';
import navigator from './lib/navigator.js';
import validator from './lib/validator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const CONFIG = {
  cookiesPath: join(__dirname, 'cookies.json'),
  outputDir: join(__dirname, 'output'),
  finalOutputDir: join(__dirname, '..', '..', 'extracted-content', 'busuu-screen-flow'),
  maxScreens: 100, // Safety limit per lesson
  screenTimeout: 15000,
  // Progress files are per-level
  getProgressFile: (level) => join(__dirname, `progress-${level.toLowerCase()}.json`)
};

// ============================================
// PROGRESS TRACKING (Like the other extractor)
// ============================================

function loadProgress(level) {
  const progressFile = CONFIG.getProgressFile(level);
  try {
    if (fsSync.existsSync(progressFile)) {
      const data = JSON.parse(fsSync.readFileSync(progressFile, 'utf8'));
      console.log(`Loaded ${level.toUpperCase()} progress: ${data.completedLessons?.length || 0} lessons already extracted`);
      return data;
    }
  } catch (e) {
    console.log(`No previous ${level.toUpperCase()} progress found, starting fresh`);
  }
  return { completedLessons: [], lessons: [] };
}

function saveProgress(level, progress) {
  const progressFile = CONFIG.getProgressFile(level);
  try {
    fsSync.writeFileSync(progressFile, JSON.stringify(progress, null, 2));
  } catch (e) {
    console.log('Warning: Could not save progress:', e.message);
  }
}

// ============================================
// TIMELINE NAVIGATION (Get all lessons)
// ============================================

async function getAllLessons(page, level) {
  console.log(`\nGetting ${level.toUpperCase()} lessons from timeline...`);

  await page.goto(`https://www.busuu.com/dashboard/timeline/${level}`, { waitUntil: 'networkidle2' });
  await page.waitForTimeout(2500);

  // Scroll to load all lesson cards
  await page.evaluate(async () => {
    for (let i = 0; i < 30; i++) {
      window.scrollBy(0, 500);
      await new Promise(r => setTimeout(r, 150));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1500);

  // Extract lesson cards
  const lessons = await page.evaluate(() => {
    const results = [];
    const cards = document.querySelectorAll('[data-testid="lesson_card"]');

    cards.forEach((card, i) => {
      const titleEl = card.querySelector('[data-testid="dialog_level_title"]');
      const title = titleEl?.textContent?.trim() || `Lesson ${i + 1}`;

      const descEl = titleEl?.nextElementSibling;
      const description = descEl?.textContent?.trim() || '';

      const isLocked = !!card.querySelector('[data-testid="lesson_padlock"]');

      // Check if speaking lesson
      const hasAnimation = !!card.querySelector('[aria-label="animation"]');
      const isSpeakingTitle = title.toLowerCase().includes('speaking') ||
                              description.toLowerCase().includes('speaking practice');
      const isSpeaking = hasAnimation || isSpeakingTitle;

      // Get chapter from parent section
      const section = card.closest('section');
      const chapter = section?.querySelector('h3')?.textContent?.trim() || '';

      results.push({ index: i, title, description, isLocked, chapter, isSpeaking });
    });

    return results;
  });

  const unlocked = lessons.filter(l => !l.isLocked);
  const speaking = lessons.filter(l => l.isSpeaking);
  console.log(`Found ${lessons.length} lessons (${unlocked.length} unlocked, ${speaking.length} speaking)`);

  return lessons;
}

/**
 * Main extraction flow for a single lesson
 * @param {Page} page - Puppeteer page
 * @param {string} lessonUrl - Lesson URL to extract
 * @param {object} options
 */
async function extractLesson(page, lessonUrl, options = {}) {
  const { validate = true, autoAdvance = false, autoSaver = null } = options;

  console.log(`\nExtracting lesson: ${lessonUrl}`);

  // Navigate to lesson
  await navigator.goToLesson(page, lessonUrl);
  await page.waitForTimeout(2000); // Wait for lesson to load

  const lessonInfo = await navigator.getLessonInfo(page);
  const lessonName = lessonInfo.lesson || 'Unknown';
  console.log(`Lesson name: ${lessonName}`);

  if (autoSaver) {
    console.log(`Auto-saving to: ${autoSaver.getPartialPath()}`);
  }

  const screens = [];
  let screenIndex = 0;
  let lastFeedbackTip = null; // Track last feedback to prevent duplicates
  let lastContent = ''; // Track content for stuck detection
  let stuckCount = 0;

  // Helper to auto-save current progress
  const saveProgress = async () => {
    if (autoSaver) {
      await autoSaver.save({
        lesson: lessonInfo,
        screens,
        extractedAt: new Date().toISOString(),
        status: 'partial'
      });
    }
  };

  // Main extraction loop
  while (screenIndex < CONFIG.maxScreens) {
    try {
      // First check if lesson has actually ended (back to timeline or explicit completion)
      if (await isLessonEnded(page)) {
        console.log('\n  → Lesson end detected');
        console.log('\nLesson complete!');
        break;
      }

      // Check for interstitial pages (Checkpoint completed, Today's challenges, etc.)
      // These should be clicked through, not treated as lesson end
      if (await isInterstitialPage(page)) {
        console.log('\n  → Interstitial page detected (Checkpoint, Challenges, etc.)');
        console.log('  → Clicking Continue to proceed...');

        // Click Continue/Next button
        const clicked = await page.evaluate(() => {
          const buttons = [...document.querySelectorAll('button')];
          const btnTexts = ['continue', 'next', 'ok', 'got it', 'close'];

          for (const btn of buttons) {
            const text = btn.textContent?.trim().toLowerCase() || '';
            if (btnTexts.some(t => text === t || text.includes(t)) && btn.offsetParent !== null) {
              btn.click();
              return text;
            }
          }
          return null;
        });

        if (clicked) {
          console.log(`  → Clicked: "${clicked}"`);
        }

        await page.waitForTimeout(1000);
        continue; // Continue the loop, don't break!
      }

      // Wait for a screen to appear
      const { type, key } = await waitForScreen(page, CONFIG.screenTimeout);

      if (!type) {
        console.log('No screen type detected, trying to continue...');
        await navigator.clickContinue(page);
        await page.waitForTimeout(1000);
        continue;
      }

      console.log(`\nScreen ${screenIndex + 1}: ${type.name} (${key})`);

      // Check if lesson is complete
      if (type.isEnd || await navigator.isLessonComplete(page)) {
        console.log('\nLesson complete!');
        break;
      }

      // Skip pass-through screens (auto-advance)
      if (type.passThrough) {
        console.log('  → Pass-through screen, auto-continuing...');

        // For conversation/community exercises - these can't be automated
        // They require Speak/Write. Consider lesson complete and move on.
        if (type.id === 'conversation') {
          console.log('  → Community exercise detected (requires Speak/Write)');
          console.log('  → Treating as lesson complete (these exercises are usually at the end)');

          // Click close to exit the lesson gracefully
          const closeClicked = await page.evaluate(() => {
            const closeBtn = document.querySelector('button[aria-label="close"]');
            if (closeBtn) {
              closeBtn.click();
              return true;
            }
            return false;
          });

          if (closeClicked) {
            // Wait for "Are you sure?" dialog to be auto-accepted and page to navigate
            // The dialog handler will accept it automatically
            console.log('  → Waiting for lesson exit...');
            try {
              await page.waitForNavigation({ timeout: 5000, waitUntil: 'networkidle2' });
            } catch {
              // Navigation might have already happened or timeout is fine
            }
            await page.waitForTimeout(1000);
          }

          console.log('\nLesson complete (skipped community exercise)');
          break;
        }

        await navigator.clickContinue(page);
        await navigator.waitForScreenChange(page);
        continue;
      }

      // Auto-scroll to trigger lazy loading of media
      await navigator.scrollPage(page);

      // Extract content if we have an extractor
      let content = null;
      if (type.extract && hasExtractor(type.id)) {
        content = await extract(page, type.id);
      }

      // Build screen record
      const screen = {
        index: screenIndex,
        type: type.id,
        typeName: type.name,
        content,
        timestamp: new Date().toISOString()
      };

      // Human validation
      if (validate && content) {
        screen.validation = await validator.validateScreen(
          { type: type.name, content },
          screenIndex,
          lessonName
        );
      }

      screens.push(screen);
      screenIndex++;

      // Auto-save after each screen
      await saveProgress();

      // Auto-solve the exercise
      console.log('  → Auto-solving exercise...');
      const solveResult = await solveExercise(page);
      if (solveResult.solved) {
        console.log(`  → Solved: ${solveResult.method}`);
      } else {
        console.log('  → Could not auto-solve, manual intervention may be needed');
        if (!autoAdvance) {
          await validator.waitForEnter('Press Enter after completing exercise...');
        }
      }

      // Small delay for UI to update after solving
      await page.waitForTimeout(300);

      // Now check for feedback overlay (after user completed exercise)
      await page.waitForTimeout(500); // Small delay for feedback to appear

      if (await hasFeedback(page)) {
        const feedbackContent = await extractFeedback(page);

        // Check if this is a duplicate (same tip as last feedback)
        const isDuplicate = feedbackContent?.tip && feedbackContent.tip === lastFeedbackTip;

        if (feedbackContent && feedbackContent.tip && !isDuplicate) {
          console.log('  → Feedback detected');
          lastFeedbackTip = feedbackContent.tip; // Track to prevent duplicates

          const feedbackScreen = {
            index: screenIndex,
            type: 'feedback',
            typeName: 'Answer Feedback',
            content: feedbackContent,
            parentScreen: screenIndex - 1,
            timestamp: new Date().toISOString()
          };

          if (validate) {
            feedbackScreen.validation = await validator.validateScreen(
              { type: 'Feedback', content: feedbackContent },
              screenIndex,
              lessonName
            );
          }

          screens.push(feedbackScreen);
          screenIndex++;

          // Auto-save after feedback
          await saveProgress();
        } else if (isDuplicate) {
          console.log('  → Skipping duplicate feedback');
        }

        // Click continue to dismiss feedback
        await navigator.clickContinue(page);
        await navigator.waitForScreenChange(page);
      } else {
        // No feedback, just advance automatically
        await navigator.clickContinue(page);
        await navigator.waitForScreenChange(page);
      }

      // Stuck detection - if content hasn't changed, we might be stuck
      const currentContent = await page.evaluate(() => document.body.innerText.substring(0, 500));
      if (currentContent === lastContent) {
        stuckCount++;
        console.log(`  → Same content detected (stuck count: ${stuckCount})`);

        if (stuckCount > 2) {
          // Try pressing Escape then Enter to dismiss any dialog/overlay
          console.log('  → Trying Escape + Enter to unstick...');
          await page.keyboard.press('Escape');
          await page.waitForTimeout(300);
          await page.keyboard.press('Enter');
          await page.waitForTimeout(500);
        }

        if (stuckCount > 4) {
          console.log('  → Stuck too long, moving on...');
          // Try clicking any visible Continue/Check button more aggressively
          await page.evaluate(() => {
            const btns = [...document.querySelectorAll('button')];
            const checkBtn = btns.find(b => {
              const t = b.textContent?.toLowerCase().trim() || '';
              return (t === 'check' || t === 'continue' || t === 'next') && b.offsetParent !== null;
            });
            if (checkBtn) checkBtn.click();
          });
          await page.waitForTimeout(1000);
        }

        if (stuckCount > 6) {
          console.log('  → Breaking out of stuck loop');
          break;
        }
      } else {
        stuckCount = 0;
      }
      lastContent = currentContent;

    } catch (error) {
      console.error(`Error on screen ${screenIndex}:`, error.message);

      // Try to continue
      const shouldContinue = await validator.askYesNo('Continue to next screen?');
      if (!shouldContinue) break;

      await navigator.clickContinue(page);
      await navigator.waitForScreenChange(page);
    }
  }

  return {
    lesson: lessonInfo,
    screens,
    extractedAt: new Date().toISOString()
  };
}

/**
 * Save extraction results to file
 * @param {object} data
 * @param {string} filename
 */
async function saveResults(data, filename) {
  await fs.mkdir(CONFIG.outputDir, { recursive: true });
  const filepath = join(CONFIG.outputDir, filename);
  await fs.writeFile(filepath, JSON.stringify(data, null, 2));
  return filepath;
}

/**
 * Auto-save manager for partial progress
 */
class AutoSaver {
  constructor(outputDir) {
    this.outputDir = outputDir;
    this.sessionId = Date.now();
    this.partialFile = null;
  }

  async init() {
    await fs.mkdir(this.outputDir, { recursive: true });
    this.partialFile = join(this.outputDir, `lesson-${this.sessionId}-partial.json`);
  }

  async save(data) {
    await fs.writeFile(this.partialFile, JSON.stringify(data, null, 2));
  }

  async finalize(data) {
    const finalFile = join(this.outputDir, `lesson-${this.sessionId}.json`);
    await fs.writeFile(finalFile, JSON.stringify(data, null, 2));

    // Remove partial file
    try {
      await fs.unlink(this.partialFile);
    } catch {
      // Ignore if already removed
    }

    return finalFile;
  }

  getPartialPath() {
    return this.partialFile;
  }
}

/**
 * Click on a lesson card in the timeline and start it
 */
async function startLessonFromTimeline(page, lessonInfo) {
  // Scroll to make sure the lesson is visible
  await page.evaluate(async (idx) => {
    const cards = document.querySelectorAll('[data-testid="lesson_card"]');
    if (cards[idx]) {
      cards[idx].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, lessonInfo.index);
  await page.waitForTimeout(500);

  // Click the lesson card
  const clicked = await page.evaluate((idx) => {
    const cards = document.querySelectorAll('[data-testid="lesson_card"]');
    if (cards[idx]) {
      cards[idx].click();
      return true;
    }
    return false;
  }, lessonInfo.index);

  if (!clicked) {
    console.log(`  Could not click lesson card at index ${lessonInfo.index}`);
    return false;
  }

  await page.waitForTimeout(1500);

  // Click "Start lesson" or similar button
  const started = await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('button')];
    const priorities = [
      'Restart lesson', 'Start lesson', 'Start learning',
      'Begin lesson', 'Continue lesson', 'Continue learning',
      "Let's go", 'Continue', 'Start', 'Begin'
    ];

    for (const text of priorities) {
      const btn = buttons.find(b => {
        const btnText = b.textContent?.trim().toLowerCase();
        return btnText === text.toLowerCase() || btnText?.includes(text.toLowerCase());
      });
      if (btn && btn.offsetParent !== null) {
        btn.click();
        return btn.textContent?.trim();
      }
    }
    return null;
  });

  if (started) {
    console.log(`  Started: "${started}"`);
    await page.waitForTimeout(2000);
    return true;
  }

  console.log(`  Could not find start button`);
  return false;
}

/**
 * Extract all lessons for a level with progress tracking
 */
async function extractLevel(page, level, options = {}) {
  const { autoAdvance = false } = options;

  // Load previous progress
  const progress = loadProgress(level);
  const completedLessons = new Set(progress.completedLessons || []);
  const extractedLessons = progress.lessons || [];

  // Get all lessons from timeline
  const allLessons = await getAllLessons(page, level);

  if (allLessons.length === 0) {
    console.log('No lessons found!');
    return;
  }

  // Filter to unlocked, non-speaking lessons
  const lessons = allLessons.filter(l => !l.isLocked && !l.isSpeaking);
  console.log(`\nWill extract ${lessons.length} lessons (skipping locked/speaking)`);

  // Process each lesson
  for (let i = 0; i < lessons.length; i++) {
    const lessonInfo = lessons[i];
    const lessonKey = `${lessonInfo.chapter}:${lessonInfo.title}`;

    // Skip already completed lessons
    if (completedLessons.has(lessonKey)) {
      console.log(`\n[${i + 1}/${lessons.length}] ${lessonInfo.title} - SKIPPED (already extracted)`);
      continue;
    }

    console.log(`\n[${i + 1}/${lessons.length}] ${lessonInfo.title}`);
    console.log(`  Chapter: ${lessonInfo.chapter}`);

    // Navigate back to timeline
    await page.goto(`https://www.busuu.com/dashboard/timeline/${level}`, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000);

    // Scroll to load the target lesson card
    await page.evaluate(async (targetIdx) => {
      let lastCount = 0;
      for (let i = 0; i < 50; i++) {
        const cards = document.querySelectorAll('[data-testid="lesson_card"]');
        if (cards.length > targetIdx) break;
        if (cards.length === lastCount && i > 10) break;
        lastCount = cards.length;
        window.scrollBy(0, 400);
        await new Promise(r => setTimeout(r, 200));
      }
    }, lessonInfo.index);
    await page.waitForTimeout(1000);

    // Start the lesson
    const started = await startLessonFromTimeline(page, lessonInfo);
    if (!started) {
      console.log('  Failed to start lesson, skipping...');
      continue;
    }

    // Wait for lesson to fully load
    await page.waitForTimeout(2000);

    // Verify we're on a lesson page (not dashboard/timeline)
    const currentUrl = page.url();
    const isOnTimeline = currentUrl.includes('/timeline/');
    const isOnDashboardNotLesson = currentUrl.includes('/dashboard') && !currentUrl.includes('/learning/');
    if (isOnTimeline || isOnDashboardNotLesson) {
      console.log(`  Not on lesson page (${currentUrl}), retrying...`);
      continue;
    }

    // Get the lesson URL for extraction
    const lessonUrl = currentUrl;

    // Initialize auto-saver for this lesson
    const autoSaver = new AutoSaver(CONFIG.outputDir);
    await autoSaver.init();

    // Extract the lesson screens
    const results = await extractLesson(page, lessonUrl, {
      validate: !autoAdvance,
      autoAdvance,
      autoSaver
    });

    // Save the results
    if (results.screens.length > 0) {
      const finalPath = await autoSaver.finalize(results);
      console.log(`  Saved: ${finalPath}`);

      // Add to extracted lessons
      extractedLessons.push({
        key: lessonKey,
        title: lessonInfo.title,
        chapter: lessonInfo.chapter,
        screenCount: results.screens.length,
        extractedAt: results.extractedAt,
        file: finalPath
      });

      // Mark as completed
      completedLessons.add(lessonKey);

      // Save progress
      saveProgress(level, {
        completedLessons: Array.from(completedLessons),
        lessons: extractedLessons
      });
      console.log(`  Progress saved (${completedLessons.size}/${lessons.length} done)`);
    } else {
      console.log('  No screens extracted');
    }
  }

  // Final summary
  console.log('\n========================================');
  console.log('EXTRACTION COMPLETE');
  console.log('========================================');
  console.log(`Level:       ${level.toUpperCase()}`);
  console.log(`Completed:   ${completedLessons.size}/${lessons.length} lessons`);
  console.log(`Progress:    ${CONFIG.getProgressFile(level)}`);
  console.log(`Output:      ${CONFIG.outputDir}`);
  console.log('========================================\n');
}

/**
 * Main entry point
 */
async function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  const levelArg = args.find(a => a.startsWith('--level='));
  const level = levelArg ? levelArg.split('=')[1].toLowerCase() : null;
  const lessonUrl = args.find((a, i) => args[i - 1] === '--lesson');
  const autoAdvance = args.includes('--auto');
  const headless = args.includes('--headless');

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         BUSUU SCREEN FLOW MAPPER (Approach B)              ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log();

  if (level) {
    console.log(`Mode: Extract all ${level.toUpperCase()} lessons`);
  } else if (lessonUrl) {
    console.log(`Mode: Extract single lesson`);
  } else {
    console.log('Mode: Interactive');
  }
  console.log(`Auto-advance: ${autoAdvance ? 'Yes' : 'No (with validation)'}`);
  console.log();

  // Launch browser
  console.log('Launching browser...');
  const { browser, page } = await navigator.launchBrowser({ headless });

  // Auto-accept "Leave site?" dialogs (like the other extractor)
  page.on('dialog', async dialog => {
    console.log(`  [Dialog: ${dialog.type()}] ${dialog.message()}`);
    await dialog.accept();
  });

  try {
    // Try to load saved cookies
    await navigator.loadCookies(page, CONFIG.cookiesPath);

    // Navigate to Busuu
    let isLoggedIn = await navigator.goToDashboard(page);

    if (!isLoggedIn) {
      console.log('\nPlease log in to Busuu in the browser window.');
      console.log('After logging in, press Enter to continue...');
      await validator.waitForEnter();

      // Check again after login
      isLoggedIn = await navigator.goToDashboard(page);

      // Save cookies for next time
      await navigator.saveCookies(page, CONFIG.cookiesPath);
    } else {
      console.log('Already logged in (cookies valid)');
    }

    // MODE 1: Extract all lessons for a level
    if (level) {
      await extractLevel(page, level, { autoAdvance });
    }
    // MODE 2: Extract single lesson from URL
    else if (lessonUrl) {
      const autoSaver = new AutoSaver(CONFIG.outputDir);
      await autoSaver.init();
      console.log(`\nAuto-save enabled: ${autoSaver.getPartialPath()}`);

      const results = await extractLesson(page, lessonUrl, {
        validate: !autoAdvance,
        autoAdvance,
        autoSaver
      });

      if (results.screens.length > 0) {
        validator.displaySummary(results.screens);
        const finalPath = await autoSaver.finalize(results);
        console.log(`\nResults saved to: ${finalPath}`);
      } else {
        console.log('\nNo screens extracted.');
      }
    }
    // MODE 3: Interactive mode
    else {
      console.log('\nNavigate to the lesson you want to extract in the browser.');
      const targetUrl = await validator.askText('Enter lesson URL (or press Enter if already there)');

      const url = targetUrl || page.url();

      const autoSaver = new AutoSaver(CONFIG.outputDir);
      await autoSaver.init();
      console.log(`\nAuto-save enabled: ${autoSaver.getPartialPath()}`);

      const results = await extractLesson(page, url, {
        validate: !autoAdvance,
        autoAdvance,
        autoSaver
      });

      if (results.screens.length > 0) {
        validator.displaySummary(results.screens);
        const finalPath = await autoSaver.finalize(results);
        console.log(`\nResults saved to: ${finalPath}`);
      } else {
        console.log('\nNo screens extracted.');
      }
    }

  } catch (error) {
    console.error('\nFatal error:', error);
  } finally {
    // Close browser
    if (level && autoAdvance) {
      // In full auto mode, just close the browser
      console.log('\nClosing browser...');
      await browser.close();
    } else {
      const keepOpen = await validator.askYesNo('Keep browser open?');
      if (!keepOpen) {
        await browser.close();
      }
    }
  }
}

// Run
main().catch(console.error);
