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
  const { validate = true, autoAdvance = false } = options;

  console.log(`\nExtracting lesson: ${lessonUrl}`);

  // Navigate to lesson
  await navigator.goToLesson(page, lessonUrl);
  await page.waitForTimeout(2000); // Wait for lesson to load

  const lessonInfo = navigator.getLessonInfo(page);
  const lessonName = lessonInfo.lesson || 'Unknown';

  const screens = [];
  let screenIndex = 0;

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

      // Check for feedback overlay after exercises
      if (await hasFeedback(page)) {
        console.log('  → Feedback detected');
        const feedbackContent = await extractFeedback(page);

        if (feedbackContent) {
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
        }
      }

      // Advance to next screen
      if (autoAdvance) {
        await navigator.clickContinue(page);
        await navigator.waitForScreenChange(page);
      } else {
        await validator.waitForEnter('Press Enter to advance...');
        await navigator.clickContinue(page);
        await navigator.waitForScreenChange(page);
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
  console.log(`\nResults saved to: ${filepath}`);
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

    // Extract the lesson
    const results = await extractLesson(page, targetUrl, {
      validate: !autoAdvance,
      autoAdvance
    });

    // Show summary
    if (results.screens.length > 0) {
      validator.displaySummary(results.screens);

      // Save results
      const filename = `lesson-${Date.now()}.json`;
      await saveResults(results, filename);
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
