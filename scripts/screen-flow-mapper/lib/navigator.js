/**
 * Navigator Module
 *
 * Handles Puppeteer browser/page management and Busuu navigation.
 */

import puppeteer from 'puppeteer';
import { existsSync } from 'fs';

// Busuu URLs
const BUSUU_BASE = 'https://www.busuu.com';
const BUSUU_DASHBOARD = `${BUSUU_BASE}/dashboard`;
const BUSUU_LEARN = `${BUSUU_BASE}/dashboard/learn`;

/**
 * Find Chrome executable path on different platforms
 */
function findChromePath() {
  const paths = [
    // macOS
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    // Linux
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    // Windows
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
  ];

  for (const p of paths) {
    try {
      if (existsSync(p)) return p;
    } catch {
      // Continue to next path
    }
  }

  return null; // Let Puppeteer use its bundled browser
}

/**
 * Launch browser with optimal settings
 * @param {object} options
 * @returns {Promise<{browser: Browser, page: Page}>}
 */
export async function launchBrowser(options = {}) {
  const chromePath = findChromePath();

  const launchOptions = {
    headless: options.headless ?? false, // Show browser by default for validation
    defaultViewport: { width: 1280, height: 800 },
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-extensions'
    ],
    ...options
  };

  // Use system Chrome if found
  if (chromePath) {
    launchOptions.executablePath = chromePath;
    console.log(`Using Chrome at: ${chromePath}`);
  }

  const browser = await puppeteer.launch(launchOptions);

  const page = await browser.newPage();

  // Set user agent
  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );

  return { browser, page };
}

/**
 * Load cookies from file for authentication
 * @param {Page} page
 * @param {string} cookiesPath
 */
export async function loadCookies(page, cookiesPath) {
  const fs = await import('fs/promises');

  try {
    const cookiesJson = await fs.readFile(cookiesPath, 'utf-8');
    const cookies = JSON.parse(cookiesJson);
    await page.setCookie(...cookies);
    console.log(`Loaded ${cookies.length} cookies`);
    return true;
  } catch (error) {
    console.warn('Could not load cookies:', error.message);
    return false;
  }
}

/**
 * Save current cookies to file
 * @param {Page} page
 * @param {string} cookiesPath
 */
export async function saveCookies(page, cookiesPath) {
  const fs = await import('fs/promises');
  const cookies = await page.cookies();
  await fs.writeFile(cookiesPath, JSON.stringify(cookies, null, 2));
  console.log(`Saved ${cookies.length} cookies`);
}

/**
 * Navigate to Busuu and ensure logged in
 * @param {Page} page
 * @returns {Promise<boolean>}
 */
export async function goToDashboard(page) {
  await page.goto(BUSUU_DASHBOARD, { waitUntil: 'networkidle2' });

  // Check if we're on the dashboard (logged in) or login page
  const url = page.url();
  if (url.includes('/login') || url.includes('/auth')) {
    console.log('Not logged in - please log in manually');
    return false;
  }

  return true;
}

/**
 * Navigate to a specific lesson
 * @param {Page} page
 * @param {string} lessonUrl - Full lesson URL or path
 */
export async function goToLesson(page, lessonUrl) {
  const url = lessonUrl.startsWith('http') ? lessonUrl : `${BUSUU_BASE}${lessonUrl}`;
  await page.goto(url, { waitUntil: 'networkidle2' });
}

/**
 * Click Continue/Check button to proceed
 * @param {Page} page
 * @returns {Promise<boolean>}
 */
export async function clickContinue(page) {
  const clicked = await page.evaluate(() => {
    const isVisible = (el) => el && el.offsetParent !== null;

    // 1. Try data-testid selectors first
    const checkBtn = document.querySelector('[data-testid="check_button"]');
    if (isVisible(checkBtn)) {
      checkBtn.click();
      return 'check_button';
    }

    const continueBtn = document.querySelector('[data-testid="continue_button"]');
    if (isVisible(continueBtn)) {
      continueBtn.click();
      return 'continue_button';
    }

    // 2. Try lesson finished / progress banner button (for skip pages)
    const lessonFinishedBtn = document.querySelector('[data-qa-lesson-finished]');
    if (isVisible(lessonFinishedBtn)) {
      lessonFinishedBtn.click();
      return 'lesson-finished';
    }

    const progressBannerBtn = document.querySelector('.progress-banner-bar__cta');
    if (isVisible(progressBannerBtn)) {
      progressBannerBtn.click();
      return 'progress-banner-cta';
    }

    // 3. Try feedback bar button
    const feedbackBtn = document.querySelector('.ex-feedback-bar__button');
    if (isVisible(feedbackBtn)) {
      feedbackBtn.click();
      return 'feedback-bar';
    }

    // 4. Try data-qa-feedback-cta
    const ctaBtn = document.querySelector('[data-qa-feedback-cta]');
    if (isVisible(ctaBtn)) {
      ctaBtn.click();
      return 'feedback-cta';
    }

    // 4. Search all buttons by text content
    const buttons = [...document.querySelectorAll('button')];
    const textMatches = ['continue', 'check', 'next', 'ok', 'got it', 'done', 'close'];

    for (const btn of buttons) {
      const text = btn.textContent?.trim().toLowerCase() || '';
      if (textMatches.some(t => text === t || text.includes(t)) && isVisible(btn)) {
        btn.click();
        return 'text: ' + text;
      }
    }

    // 5. Try any primary/action button
    const primaryBtn = document.querySelector('.btn-primary, .action-button, [class*="primary"], [class*="Primary"]');
    if (isVisible(primaryBtn)) {
      primaryBtn.click();
      return 'primary-btn';
    }

    // 6. Try clicking any visible button as last resort
    const anyBtn = buttons.find(b => isVisible(b) && b.textContent?.trim());
    if (anyBtn) {
      anyBtn.click();
      return 'any-btn: ' + anyBtn.textContent?.trim().substring(0, 20);
    }

    return false;
  });

  if (clicked) {
    await page.waitForTimeout(500);
    return true;
  }

  return false;
}

/**
 * Wait for navigation or screen change
 * @param {Page} page
 * @param {number} timeout
 */
export async function waitForScreenChange(page, timeout = 5000) {
  try {
    await page.waitForNavigation({ timeout, waitUntil: 'networkidle2' });
  } catch {
    // Navigation timeout is ok - screen might have changed without navigation
  }

  // Small delay to ensure DOM is updated
  await page.waitForTimeout(300);
}

/**
 * Check if lesson is complete
 * @param {Page} page
 * @returns {Promise<boolean>}
 */
export async function isLessonComplete(page) {
  const completeSelectors = [
    '[data-testid="lesson-complete"]',
    '.lesson-complete',
    '.lesson-summary'
  ];

  for (const selector of completeSelectors) {
    const el = await page.$(selector);
    if (el) return true;
  }

  return false;
}

/**
 * Get current lesson info from URL and page content
 * @param {Page} page
 * @returns {Promise<object>}
 */
export async function getLessonInfo(page) {
  const url = page.url();

  // Try to get lesson name from page title or DOM first
  const pageInfo = await page.evaluate(() => {
    // Try lesson title from DOM
    const titleEl = document.querySelector('[data-testid="lesson-title"], .lesson-title, h1');
    const title = titleEl?.textContent?.trim();

    // Try from page title
    const pageTitle = document.title;

    return { title, pageTitle };
  });

  // Try different URL patterns
  // Pattern 1: /learn/language/level/lesson
  let match = url.match(/\/learn\/([^/]+)\/([^/]+)\/([^/?]+)/);
  if (match) {
    return {
      language: match[1],
      level: match[2],
      lesson: pageInfo.title || match[3],
      url
    };
  }

  // Pattern 2: /learning/course/start/objective_xxx
  match = url.match(/\/learning\/course\/start\/objective_([^/]+)/);
  if (match) {
    return {
      objectiveId: match[1],
      lesson: pageInfo.title || `Objective ${match[1].substring(0, 8)}`,
      url
    };
  }

  // Pattern 3: /activity_xxx
  match = url.match(/activity_([^/]+)/);
  if (match) {
    return {
      activityId: match[1],
      lesson: pageInfo.title || `Activity ${match[1].substring(0, 8)}`,
      url
    };
  }

  // Fallback: use page title if available
  if (pageInfo.title) {
    return { lesson: pageInfo.title, url };
  }

  // Last resort: extract from page title (format: "Lesson Name | Busuu")
  if (pageInfo.pageTitle) {
    const cleanTitle = pageInfo.pageTitle.split('|')[0].trim();
    if (cleanTitle && cleanTitle !== 'Busuu') {
      return { lesson: cleanTitle, url };
    }
  }

  return { lesson: 'Lesson', url };
}

/**
 * Scroll through the page to ensure all content is visible/loaded
 * @param {Page} page
 */
export async function scrollPage(page) {
  await page.evaluate(async () => {
    // Scroll down incrementally to trigger lazy loading
    const scrollStep = 300;
    const maxScrolls = 5;

    for (let i = 0; i < maxScrolls; i++) {
      window.scrollBy(0, scrollStep);
      await new Promise(r => setTimeout(r, 100));
    }

    // Scroll back to top
    window.scrollTo(0, 0);
  });
}

export default {
  launchBrowser,
  loadCookies,
  saveCookies,
  goToDashboard,
  goToLesson,
  clickContinue,
  waitForScreenChange,
  isLessonComplete,
  getLessonInfo,
  scrollPage,
  BUSUU_BASE,
  BUSUU_DASHBOARD,
  BUSUU_LEARN
};
