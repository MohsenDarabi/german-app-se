/**
 * Navigator Module
 *
 * Handles Puppeteer browser/page management and Busuu navigation.
 */

import puppeteer from 'puppeteer';

// Busuu URLs
const BUSUU_BASE = 'https://www.busuu.com';
const BUSUU_DASHBOARD = `${BUSUU_BASE}/dashboard`;
const BUSUU_LEARN = `${BUSUU_BASE}/dashboard/learn`;

/**
 * Launch browser with optimal settings
 * @param {object} options
 * @returns {Promise<{browser: Browser, page: Page}>}
 */
export async function launchBrowser(options = {}) {
  const browser = await puppeteer.launch({
    headless: options.headless ?? false, // Show browser by default for validation
    defaultViewport: { width: 1280, height: 800 },
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ],
    ...options
  });

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
  // Try different button selectors
  const buttonSelectors = [
    '[data-testid="continue_button"]',
    '[data-testid="check_button"]',
    'button:has-text("Continue")',
    'button:has-text("Check")',
    '.ex-continue-button'
  ];

  for (const selector of buttonSelectors) {
    try {
      const button = await page.$(selector);
      if (button) {
        await button.click();
        await page.waitForTimeout(500); // Small delay for animation
        return true;
      }
    } catch {
      // Try next selector
    }
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
 * Get current lesson info from URL
 * @param {Page} page
 * @returns {object}
 */
export function getLessonInfo(page) {
  const url = page.url();
  const match = url.match(/\/learn\/([^/]+)\/([^/]+)\/([^/?]+)/);

  if (match) {
    return {
      language: match[1],
      level: match[2],
      lesson: match[3],
      url
    };
  }

  return { url };
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
  BUSUU_BASE,
  BUSUU_DASHBOARD,
  BUSUU_LEARN
};
