#!/usr/bin/env node

/**
 * Busuu Screen Flow Mapper
 *
 * Extract Busuu content screen-by-screen with human-in-the-loop validation.
 *
 * Usage:
 *   node index.js                    # Interactive mode
 *   node index.js --lesson <url>     # Extract specific lesson
 *   node index.js --validate         # Validate existing extraction
 *
 * See: docs/busuu-research/README.md
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { promises as fs } from 'fs';

import { detectScreenType, waitForScreen, hasFeedback, SCREEN_TYPES } from './lib/detector.js';
import { extract, hasExtractor } from './lib/extractors/index.js';
import { extractFeedback } from './lib/extractors/feedback.js';
import navigator from './lib/navigator.js';
import validator from './lib/validator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const CONFIG = {
  cookiesPath: join(__dirname, 'cookies.json'),
  outputDir: join(__dirname, 'output'),
  maxScreens: 100, // Safety limit per lesson
  screenTimeout: 15000
};

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
      // Wait for a screen to appear
      const { type, key } = await waitForScreen(page, CONFIG.screenTimeout);

      if (!type) {
        console.log('No screen type detected, waiting...');
        await page.waitForTimeout(1000);
        continue;
      }

      console.log(`\nScreen ${screenIndex + 1}: ${type.name} (${key})`);

      // Check if lesson is complete
      if (type.isEnd || await navigator.isLessonComplete(page)) {
        console.log('\nLesson complete!');
        break;
      }

      // Skip pass-through screens
      if (type.passThrough) {
        console.log('  → Pass-through screen, skipping extraction');

        if (autoAdvance) {
          await navigator.clickContinue(page);
          await navigator.waitForScreenChange(page);
        } else {
          await validator.waitForEnter('Press Enter to continue...');
          await navigator.clickContinue(page);
          await navigator.waitForScreenChange(page);
        }

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

      // User interaction point
      if (!autoAdvance) {
        console.log('\n  [Complete the exercise in the browser, then press Enter]');
        await validator.waitForEnter('Press Enter after completing exercise...');
      }

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
        // No feedback, just advance
        if (autoAdvance) {
          await navigator.clickContinue(page);
          await navigator.waitForScreenChange(page);
        } else {
          await validator.waitForEnter('Press Enter to go to next screen...');
          await navigator.clickContinue(page);
          await navigator.waitForScreenChange(page);
        }
      }

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
 * Main entry point
 */
async function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  const lessonUrl = args.find((a, i) => args[i - 1] === '--lesson');
  const validateMode = args.includes('--validate');
  const autoAdvance = args.includes('--auto');
  const headless = args.includes('--headless');

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         BUSUU SCREEN FLOW MAPPER (Approach B)              ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log();

  // Launch browser
  console.log('Launching browser...');
  const { browser, page } = await navigator.launchBrowser({ headless });

  try {
    // Try to load saved cookies
    await navigator.loadCookies(page, CONFIG.cookiesPath);

    // Navigate to Busuu
    const isLoggedIn = await navigator.goToDashboard(page);

    if (!isLoggedIn) {
      console.log('\nPlease log in to Busuu in the browser window.');
      console.log('After logging in, press Enter to continue...');
      await validator.waitForEnter();

      // Save cookies for next time
      await navigator.saveCookies(page, CONFIG.cookiesPath);
    }

    // If no lesson URL provided, ask for one
    let targetUrl = lessonUrl;
    if (!targetUrl) {
      console.log('\nNavigate to the lesson you want to extract in the browser.');
      targetUrl = await validator.askText('Enter lesson URL (or press Enter if already there)');

      if (!targetUrl) {
        targetUrl = page.url();
      }
    }

    // Initialize auto-saver for partial progress
    const autoSaver = new AutoSaver(CONFIG.outputDir);
    await autoSaver.init();
    console.log(`\nAuto-save enabled: Progress will be saved after each screen.`);
    console.log(`Partial file: ${autoSaver.getPartialPath()}`);

    // Extract the lesson
    const results = await extractLesson(page, targetUrl, {
      validate: !autoAdvance,
      autoAdvance,
      autoSaver
    });

    // Show summary
    if (results.screens.length > 0) {
      validator.displaySummary(results.screens);

      // Finalize results (removes partial file, creates final file)
      const finalPath = await autoSaver.finalize(results);
      console.log(`\nResults saved to: ${finalPath}`);
    } else {
      console.log('\nNo screens extracted.');
    }

  } catch (error) {
    console.error('\nFatal error:', error);
  } finally {
    // Close browser
    const keepOpen = await validator.askYesNo('Keep browser open?');
    if (!keepOpen) {
      await browser.close();
    }
  }
}

// Run
main().catch(console.error);
