#!/usr/bin/env node
/**
 * Busuu Content Extractor (Simplified)
 *
 * Extracts text content and exercise patterns from Busuu lessons.
 * Focuses on: vocabulary, sentences, exercise types, lesson order.
 *
 * Usage:
 *   node extractor.js --level=a1
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

// ============================================
// CONFIG
// ============================================

const CONFIG = {
  baseUrl: 'https://www.busuu.com',
  outputDir: path.join(process.cwd(), '..', '..', 'extracted-content', 'busuu'),
  // Progress files are now per-level: extraction-progress-a1.json, etc.
  getProgressFile: (level) => path.join(process.cwd(), `extraction-progress-${level.toLowerCase()}.json`),
  delays: {
    afterClick: 1500,
    afterPageLoad: 2500,
    betweenSteps: 1000,
  }
};

// ============================================
// PROGRESS SAVE/RESTORE
// ============================================

function loadProgress(level) {
  const progressFile = CONFIG.getProgressFile(level);
  try {
    if (fs.existsSync(progressFile)) {
      const data = JSON.parse(fs.readFileSync(progressFile, 'utf8'));
      console.log(`Loaded ${level.toUpperCase()} progress: ${data.completedLessons?.length || 0} lessons already extracted`);
      return data;
    }
  } catch (e) {
    console.log(`No previous ${level.toUpperCase()} progress found, starting fresh`);
  }
  return { completedLessons: [], extractedData: { lessons: [], metadata: {} } };
}

function saveProgress(level, progress) {
  const progressFile = CONFIG.getProgressFile(level);
  try {
    fs.writeFileSync(progressFile, JSON.stringify(progress, null, 2));
  } catch (e) {
    console.log('Warning: Could not save progress:', e.message);
  }
}

// ============================================
// UTILITIES
// ============================================

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function saveJson(filepath, data) {
  ensureDir(path.dirname(filepath));

  // Create backup if file exists
  if (fs.existsSync(filepath)) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backupDir = path.join(path.dirname(filepath), 'backups');
    ensureDir(backupDir);
    const backupPath = path.join(backupDir, `${path.basename(filepath, '.json')}-${timestamp}.json`);
    fs.copyFileSync(filepath, backupPath);
    console.log(`  Backup: ${path.basename(backupPath)}`);
  }

  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  console.log(`  Saved: ${path.basename(filepath)}`);
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function waitForEnter(prompt) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(r => rl.question(prompt, () => { rl.close(); r(); }));
}

// ============================================
// TEXT EXTRACTION
// ============================================

async function extractFeedback(page) {
  return await page.evaluate(() => {
    const feedback = {
      success: false,
      correctSentence: null,
      translation: null,
      grammarTip: null
    };

    // Helper to clean tip text (remove button text artifacts)
    const cleanTip = (text) => {
      if (!text) return null;
      return text
        .replace(/Continue$/g, '')
        .replace(/Check$/g, '')
        .replace(/Next$/g, '')
        .replace(/Skip$/g, '')
        .trim();
    };

    // Check for success indicator
    const successEl = document.querySelector('[class*="success"], [class*="Success"], [data-qa-feedback-positive]');
    feedback.success = !!successEl;

    // Get feedback text - contains grammar tips
    const feedbackText = document.querySelector('[data-testid="feedback-text"], [class*="feedback"]');
    if (feedbackText) {
      const rawTip = feedbackText.textContent?.trim();
      feedback.grammarTip = cleanTip(rawTip);
      // Skip if it's just a button label
      if (feedback.grammarTip && feedback.grammarTip.length < 15) {
        feedback.grammarTip = null;
      }
    }

    // Get the correct sentence (often in bold or highlighted)
    const correctEl = document.querySelector('[class*="feedback"] b, [class*="feedback"] strong, [class*="correct"]');
    if (correctEl) {
      feedback.correctSentence = correctEl.closest('p, div')?.textContent?.trim();
    }

    // Look for translation
    const allText = document.body.innerText;
    const translationMatch = allText.match(/Hello[^.!?]*[.!?]|My name[^.!?]*[.!?]|Nice to meet[^.!?]*[.!?]/i);
    if (translationMatch) {
      feedback.translation = translationMatch[0];
    }

    return feedback;
  });
}

async function extractTextContent(page) {
  return await page.evaluate(() => {
    const content = {
      vocabulary: [],
      sentences: [],
      exerciseType: null,
      instruction: null,
      options: [],
      grammarTips: [],
      cultureTips: []
    };

    // Helper to clean text
    const cleanText = (text) => text?.trim().replace(/\s+/g, ' ');

    // Check for "Here's a tip!" screens - grammar/culture tips
    const pageText = document.body.innerText;
    if (pageText.includes("Here's a tip") || pageText.includes("Tip!") || pageText.includes("Did you know")) {
      // Extract the tip content from the main content area
      const mainContent = document.querySelector('.learning-layout__content, [class*="learning"], main');
      if (mainContent) {
        const tipText = cleanText(mainContent.innerText);
        if (tipText && tipText.length > 20 && tipText.length < 1000) {
          content.cultureTips.push(tipText);
          content.exerciseType = 'tip-screen';
        }
      }
    }

    // Helper to filter out UI garbage
    const isGarbage = (text) => {
      if (!text || text.length < 1) return true;
      return /speed|normal|menu|0\.75|1\.25|1\.5|previous|go back|×|slider/i.test(text) ||
             text.length > 100 ||
             /^\d+$/.test(text);
    };

    // 1. VOCABULARY CARDS - using data-testid selectors from Busuu DOM
    // Look for text-card-wrapper which contains vocabulary flashcards
    const textCards = document.querySelectorAll('[data-testid="text-card-wrapper"], [data-testid="asset-text"]');
    textCards.forEach(card => {
      const paragraphs = card.querySelectorAll('p');
      if (paragraphs.length >= 2) {
        const german = cleanText(paragraphs[0]?.textContent);
        const english = cleanText(paragraphs[1]?.textContent);
        if (german && english && !isGarbage(german) && !isGarbage(english)) {
          content.vocabulary.push({ de: german, en: english });
        }
      } else if (paragraphs.length === 1) {
        // Single text item - might be a sentence
        const text = cleanText(paragraphs[0]?.textContent);
        if (text && !isGarbage(text) && text.length > 3) {
          content.sentences.push(text);
        }
      }
    });

    // 2. FLASHCARD EXERCISES - data-qa="ex-flashcard"
    const flashcards = document.querySelectorAll('[data-qa="ex-flashcard"]');
    flashcards.forEach(card => {
      const paragraphs = card.querySelectorAll('p');
      const texts = [...paragraphs].map(p => cleanText(p.textContent)).filter(t => t && !isGarbage(t));
      if (texts.length >= 2) {
        content.vocabulary.push({ de: texts[0], en: texts[1] });
      }
    });

    // 3. INSTRUCTION TEXT - data-testid="ex-instruction"
    const instructionEl = document.querySelector('[data-testid="ex-instruction"]');
    content.instruction = cleanText(instructionEl?.textContent)?.substring(0, 150);

    // 4. FILL-GAP / DRAG-DROP EXERCISES - data-qa-ex="ex-fillgap-dragdrop"
    const fillGapEx = document.querySelector('[data-qa-ex="ex-fillgap-dragdrop"]');
    if (fillGapEx) {
      // Get the sentence parts
      const sentenceParts = fillGapEx.querySelectorAll('.fillgap-dragdrop__text .font-face-lt');
      const sentence = [...sentenceParts].map(p => cleanText(p.textContent)).join('___');
      if (sentence && !isGarbage(sentence)) {
        content.sentences.push(sentence);
      }
      // Get the options - these have aria-label="Drag item: ..."
      fillGapEx.querySelectorAll('[role="button"][aria-label^="Drag item:"]').forEach(btn => {
        const text = cleanText(btn.textContent);
        const isCorrect = btn.getAttribute('data-qa-pass') === '1';
        if (text && !isGarbage(text)) {
          content.options.push(text + (isCorrect ? ' ✓' : ''));
          content.sentences.push(text);
        }
      });
    }

    // 5. MULTIPLE CHOICE OPTIONS - look for option buttons
    document.querySelectorAll('[data-testid*="option"], [data-qa*="option"], button[class*="option"], button[class*="Option"], .ex-btn[role="button"]').forEach(btn => {
      const text = cleanText(btn.textContent);
      if (text && text.length > 1 && text.length < 80 && !isGarbage(text) && !/^\d$/.test(text)) {
        if (!content.options.includes(text) && !content.options.includes(text + ' ✓')) {
          content.options.push(text);
          if (text.length > 3) {
            content.sentences.push(text);
          }
        }
      }
    });

    // 5. FALLBACK - any visible German-looking text in learning layout
    if (content.vocabulary.length === 0) {
      const learningLayout = document.querySelector('.learning-layout, .learning-layout__content, [class*="learning"]');
      if (learningLayout) {
        const paragraphs = learningLayout.querySelectorAll('p');
        const texts = [...paragraphs]
          .map(p => cleanText(p.textContent))
          .filter(t => t && !isGarbage(t) && t.length > 1 && t.length < 80);

        // Look for German-English pairs
        for (let i = 0; i < texts.length - 1; i++) {
          const t1 = texts[i];
          const t2 = texts[i + 1];
          // Simple heuristic: if first has German chars/words, second might be translation
          if (/[äöüßÄÖÜ]|^(ich|du|er|sie|wir|ihr|ein|eine|der|die|das|ist|hallo|tschüss|danke|bitte|guten)\b/i.test(t1)) {
            if (!content.vocabulary.some(v => v.de === t1)) {
              content.vocabulary.push({ de: t1, en: t2 });
              i++; // Skip the English text
            }
          }
        }
      }
    }

    // 6. DETECT EXERCISE TYPE from instruction or page content
    const exerciseDetectText = (content.instruction || '') + ' ' + document.body.innerText.substring(0, 2000).toLowerCase();
    const exercisePatterns = [
      { pattern: /look.*something new|new word|vocabulary/i, type: 'vocabulary-intro' },
      { pattern: /choose|select|pick|we can say|which.*correct/i, type: 'multiple-choice' },
      { pattern: /fill|blank|complete the|missing/i, type: 'fill-blank' },
      { pattern: /order|arrange|put.*order|drag/i, type: 'word-order' },
      { pattern: /match|pair|connect/i, type: 'matching' },
      { pattern: /translate|into english|into german/i, type: 'translation' },
      { pattern: /listen|hear|what did.*say|audio/i, type: 'listening' },
      { pattern: /speak|say|record|microphone/i, type: 'speaking' },
      { pattern: /type|write the/i, type: 'typing' },
    ];

    for (const { pattern, type } of exercisePatterns) {
      if (pattern.test(exerciseDetectText)) {
        content.exerciseType = type;
        break;
      }
    }

    // Dedupe
    content.vocabulary = [...new Map(content.vocabulary.map(v => [v.de, v])).values()];
    content.sentences = [...new Set(content.sentences)];
    content.options = [...new Set(content.options)];

    return content;
  });
}

// ============================================
// NAVIGATION HELPERS
// ============================================

async function clickNext(page) {
  // Use the exact Busuu selectors we found
  const clicked = await page.evaluate(() => {
    // 1. Try data-testid="check_button" - this is the main Continue/Check button
    const checkBtn = document.querySelector('[data-testid="check_button"]');
    if (checkBtn && checkBtn.offsetParent !== null) { // Check if visible
      checkBtn.click();
      return 'check_button: ' + checkBtn.textContent?.trim();
    }

    // 2. Try the feedback bar button class
    const feedbackBtn = document.querySelector('.ex-feedback-bar__button');
    if (feedbackBtn && feedbackBtn.offsetParent !== null) {
      feedbackBtn.click();
      return 'feedback-bar: ' + feedbackBtn.textContent?.trim();
    }

    // 3. Try data-qa-feedback-cta
    const ctaBtn = document.querySelector('[data-qa-feedback-cta]');
    if (ctaBtn && ctaBtn.offsetParent !== null) {
      ctaBtn.click();
      return 'feedback-cta: ' + ctaBtn.textContent?.trim();
    }

    // 4. Fallback to text content search
    const buttons = [...document.querySelectorAll('button')];
    const continueBtn = buttons.find(b => {
      const text = b.textContent?.trim().toLowerCase();
      return (text === 'continue' || text === 'check' || text === 'next') && b.offsetParent !== null;
    });
    if (continueBtn) {
      continueBtn.click();
      return 'text: ' + continueBtn.textContent?.trim();
    }

    return false;
  });

  return clicked;
}

async function clickAnyOption(page) {
  // 0. CHECK FOR TIP/INFO SCREENS - no options needed, just Continue
  const isTipScreen = await page.evaluate(() => {
    const pageText = document.body.innerText;
    return pageText.includes("Here's a tip") ||
           pageText.includes("Did you know") ||
           pageText.includes("Good to know") ||
           pageText.includes("Remember:") ||
           (pageText.includes("Tip!") && !document.querySelector('[data-qa-ex]'));
  });
  if (isTipScreen) {
    return 'tip-screen: no action needed';
  }

  // 0.5. CHECK FOR SPEAKING EXERCISES - skip them (can't automate microphone)
  // Speaking exercises have buttons: "replay", "click and repeat", "translate"
  const isSpeakingEx = await page.evaluate(() => {
    const pageText = document.body.innerText.toLowerCase();
    const buttons = [...document.querySelectorAll('button')];
    const buttonTexts = buttons.map(b => b.textContent?.toLowerCase().trim() || '');

    // Check for speaking exercise buttons
    const hasSpeakingButtons = buttonTexts.some(t =>
      t === 'replay' || t === 'click and repeat' || t === 'translate' ||
      t.includes('record') || t.includes('speak')
    );

    // Check for Lottie animation with aria-label="animation" (speaking indicator)
    const hasAnimation = !!document.querySelector('[aria-label="animation"]');

    const hasMicButton = !!document.querySelector('[class*="microphone"], [class*="Microphone"], [data-testid*="mic"], button[aria-label*="record"]');
    const hasSpeakingText = pageText.includes('speak') || pageText.includes('say it') || pageText.includes('record') || pageText.includes('your turn to speak');
    const isSpeakingUrl = window.location.href.includes('/speaking/');

    return hasSpeakingButtons || hasAnimation || hasMicButton || isSpeakingUrl || (hasSpeakingText && !document.querySelector('.ex-typing__input'));
  });
  if (isSpeakingEx) {
    // Try to skip by clicking Skip, Continue, Next, or X button
    await page.evaluate(() => {
      const buttons = [...document.querySelectorAll('button')];
      const skipBtn = buttons.find(b => {
        const text = b.textContent?.toLowerCase().trim() || '';
        return text === 'skip' || text === 'continue' || text === 'next' ||
               text.includes('skip') || text.includes('continue');
      });
      if (skipBtn) {
        skipBtn.click();
        return;
      }
      // Try close button
      const closeBtn = document.querySelector('button[aria-label*="close"], button[aria-label*="Close"]');
      if (closeBtn) closeBtn.click();
    });
    return 'speaking: skipped';
  }

  // 1. TYPING EXERCISES - handle with Puppeteer methods
  try {
    const typingSelector = '.ex-typing__input:not([disabled])';
    const typingInput = await page.$(typingSelector);
    if (typingInput) {
      const correctAnswer = await page.evaluate(
        sel => document.querySelector(sel)?.getAttribute('data-qa-pass'),
        typingSelector
      );
      if (correctAnswer) {
        // Clear existing text and type the answer (Puppeteer way)
        await typingInput.click({ clickCount: 3 }); // Select all
        await typingInput.type(correctAnswer);
        return 'typing: ' + correctAnswer;
      }
    }
  } catch (e) {
    console.log('    Typing handler error:', e.message);
  }

  // 0. TRUE/FALSE EXERCISES - quick check by button text
  const trueFalseResult = await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('button')];
    const trueBtn = buttons.find(b => b.textContent?.trim().toLowerCase() === 'true');
    const falseBtn = buttons.find(b => b.textContent?.trim().toLowerCase() === 'false');

    if (trueBtn && falseBtn) {
      // Check which one has data-qa-pass="true" (correct answer)
      const trueIsCorrect = trueBtn.getAttribute('data-qa-pass') === 'true';
      const falseIsCorrect = falseBtn.getAttribute('data-qa-pass') === 'true';

      if (trueIsCorrect) {
        trueBtn.click();
        return 'true-false: True (correct)';
      } else if (falseIsCorrect) {
        falseBtn.click();
        return 'true-false: False (correct)';
      } else {
        // No data-qa-pass, just click True as default
        trueBtn.click();
        return 'true-false: True (guessed)';
      }
    }
    return null;
  });

  if (trueFalseResult) {
    return trueFalseResult;
  }

  // 1. WORD/LETTER ORDER EXERCISES - handle outside page.evaluate for proper delays
  const wordOrderResult = await page.evaluate(() => {
    const isClickable = (el) => {
      if (!el || el.offsetParent === null) return false;
      const style = window.getComputedStyle(el);
      if (style.pointerEvents === 'none' || style.opacity === '0') return false;
      if (el.disabled || el.classList.contains('disabled') || el.classList.contains('ex-btn--disabled')) return false;
      return true;
    };

    const wordButtons = document.querySelectorAll('.fillgap-dragdrop__options .ex-btn[role="button"], .ex-btn[role="button"][data-qa-pass][draggable="true"]');
    const clickable = [...wordButtons].filter(b => isClickable(b) && b.textContent?.trim());

    if (clickable.length >= 2) {
      // Sort by data-qa-pass (0, 1, 2, ...)
      const sorted = clickable.sort((a, b) => {
        const passA = parseInt(a.getAttribute('data-qa-pass') || '99');
        const passB = parseInt(b.getAttribute('data-qa-pass') || '99');
        return passA - passB;
      });
      return sorted.map(b => ({
        text: b.textContent?.trim(),
        pass: b.getAttribute('data-qa-pass')
      }));
    }
    return null;
  });

  if (wordOrderResult && wordOrderResult.length > 0) {
    // Click each word with delay to let Busuu process
    const clicked = [];
    for (const word of wordOrderResult) {
      await page.evaluate((passValue) => {
        const btn = document.querySelector(`.ex-btn[role="button"][data-qa-pass="${passValue}"]:not(.ex-btn--disabled)`);
        if (btn) btn.click();
      }, word.pass);
      clicked.push(word.text);
      await sleep(150); // Small delay between clicks
    }
    return 'word-order: ' + clicked.join(' ');
  }

  // Find and click option button(s) for various exercise types
  const clicked = await page.evaluate(() => {
    // Helper to check if element is visible and enabled
    const isClickable = (el) => {
      if (!el || el.offsetParent === null) return false;
      const style = window.getComputedStyle(el);
      if (style.pointerEvents === 'none' || style.opacity === '0') return false;
      if (el.disabled || el.classList.contains('disabled') || el.classList.contains('ex-btn--disabled')) return false;
      return true;
    };

    // 0. SKIP COMMUNITY EXERCISES (Speak/Write for human feedback)
    const communityEx = document.querySelector('[class*="community"], [data-qa*="community"]');
    const speakWriteButtons = document.querySelectorAll('button');
    const hasSpeakWrite = [...speakWriteButtons].some(b =>
      /^speak$/i.test(b.textContent?.trim()) || /^write$/i.test(b.textContent?.trim())
    );
    if (communityEx || hasSpeakWrite) {
      // Try to close/skip this exercise
      const closeBtn = document.querySelector('button[aria-label*="close"], button[aria-label*="Close"], .close-button, [class*="close"]');
      if (closeBtn) {
        closeBtn.click();
        return 'skip-community: closed';
      }
      // Or click the X button
      const xBtn = [...document.querySelectorAll('button, [role="button"]')].find(b =>
        b.textContent?.trim() === '×' || b.textContent?.trim() === 'X' || b.getAttribute('aria-label')?.includes('close')
      );
      if (xBtn) {
        xBtn.click();
        return 'skip-community: X';
      }
      return 'skip-community: no-close-btn';
    }

    // 1. WORD/LETTER ORDER - now handled outside page.evaluate with delays (see above)

    // 2. FILL-GAP with drag options (data-qa-pass indicates correct answer)
    const dragOptions = document.querySelectorAll('[role="button"][aria-label^="Drag item:"]');
    const clickableDragOptions = [...dragOptions].filter(isClickable);
    if (clickableDragOptions.length > 0) {
      // Try to find the correct answer (data-qa-pass="1")
      const correctOption = clickableDragOptions.find(o => o.getAttribute('data-qa-pass') === '1');
      const optionToClick = correctOption || clickableDragOptions[0];
      optionToClick.click();
      return 'drag: ' + optionToClick.textContent?.trim().substring(0, 30);
    }

    // 3. MATCH THE PAIRS EXERCISES
    const matchupItems = document.querySelectorAll('[data-qa-ex="ex-matchup"] [role="button"][data-qa-pass]');
    const clickableMatchItems = [...matchupItems].filter(isClickable);
    if (clickableMatchItems.length > 0) {
      // Group by data-qa-pass value
      const answers = clickableMatchItems.filter(el => el.getAttribute('data-qa-type') === 'answer');
      const assets = clickableMatchItems.filter(el => el.getAttribute('data-qa-type') === 'asset');

      // Match pairs: click answer, then click matching asset
      const matched = [];
      for (const answer of answers) {
        const passValue = answer.getAttribute('data-qa-pass');
        const matchingAsset = assets.find(a => a.getAttribute('data-qa-pass') === passValue && isClickable(a));
        if (matchingAsset && isClickable(answer)) {
          answer.click();
          matchingAsset.click();
          matched.push(answer.textContent?.trim().replace(/^\d\s*/, '').substring(0, 20));
        }
      }
      if (matched.length > 0) {
        return 'matchup: ' + matched.join(' + ');
      }
    }

    // 4. TRUE/FALSE EXERCISES
    const trueFalseOptions = document.querySelectorAll('[data-qa-ex="ex-true-false"] button[data-qa-choice="true"], .ex-true-false__actions button.ex-btn');
    const clickableTF = [...trueFalseOptions].filter(isClickable);
    if (clickableTF.length > 0) {
      // Find the correct answer (data-qa-pass="true")
      const correctOption = clickableTF.find(b => b.getAttribute('data-qa-pass') === 'true');
      const optionToClick = correctOption || clickableTF[0];
      optionToClick.click();
      const answer = optionToClick.textContent?.trim().replace(/^\d\s*/, '');
      return 'true-false: ' + answer;
    }

    // 4. MULTIPLE CHOICE (ex-mcq) - buttons with data-qa-choice
    const mcqOptions = document.querySelectorAll('[data-qa-ex="ex-mcq"] button[data-qa-choice="true"], .ex-mcq__options button.ex-btn');
    const clickableMcq = [...mcqOptions].filter(isClickable);
    if (clickableMcq.length > 0) {
      // Find the correct answer (data-qa-pass="true")
      const correctOption = clickableMcq.find(b => b.getAttribute('data-qa-pass') === 'true');
      const optionToClick = correctOption || clickableMcq[0];
      optionToClick.click();
      return 'mcq: ' + optionToClick.textContent?.trim().replace(/^\d\s*/, '').substring(0, 40);
    }

    // 4. Generic ex-btn options (fallback)
    const exBtnOptions = document.querySelectorAll('button.ex-btn:not(.ex-btn--dashed)');
    const validExBtns = [...exBtnOptions].filter(b => {
      const text = b.textContent?.trim();
      return isClickable(b) && text && text.length > 1 && !/^\d$/.test(text);
    });
    if (validExBtns.length >= 2) {
      // Try to find correct answer
      const correctBtn = validExBtns.find(b => b.getAttribute('data-qa-pass') === 'true');
      const btnToClick = correctBtn || validExBtns[0];
      btnToClick.click();
      return 'ex-btn: ' + btnToClick.textContent?.trim().replace(/^\d\s*/, '').substring(0, 30);
    }

    // 4. Generic buttons fallback
    const buttons = [...document.querySelectorAll('button, [role="button"]')];
    const optionButtons = buttons.filter(b => {
      const text = b.textContent?.trim();
      if (!text || text.length < 2 || text.length > 100) return false;
      if (/^(continue|check|next|skip|back|close|play|pause|x|×|\d)$/i.test(text)) return false;
      const ariaLabel = b.getAttribute('aria-label')?.toLowerCase() || '';
      if (ariaLabel.includes('close') || ariaLabel.includes('menu') || ariaLabel.includes('back')) return false;
      if (b.querySelector('svg') && text.length < 3) return false;
      if (b.classList.contains('ex-btn--dashed')) return false;
      return isClickable(b);
    });

    if (optionButtons.length >= 2) {
      optionButtons[0].click();
      return 'btn: ' + optionButtons[0].textContent?.trim().substring(0, 30);
    }
    return false;
  });

  return clicked;
}

// ============================================
// LESSON EXTRACTION
// ============================================

async function extractLesson(page, lessonIndex, lessonInfo) {
  console.log(`\n  Extracting: ${lessonInfo.title}`);

  const lesson = {
    title: lessonInfo.title,
    description: lessonInfo.description,
    chapter: lessonInfo.chapter,
    vocabulary: [],
    sentences: [],
    grammarTips: [],
    cultureTips: [],
    exerciseSequence: []
  };

  // Click on the lesson card
  const clicked = await page.evaluate((idx) => {
    const cards = document.querySelectorAll('[data-testid="lesson_card"]');
    if (cards[idx]) {
      cards[idx].click();
      return true;
    }
    return false;
  }, lessonInfo.index);

  if (!clicked) {
    console.log(`    Could not click lesson card at index ${lessonInfo.index}`);
    return lesson;
  }

  // Wait for modal to appear
  await sleep(1500);

  // Look for lesson start button (various possible texts)
  const startedLesson = await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('button')];

    // Priority order for starting lessons
    const priorities = [
      'Restart lesson',
      'Start lesson',
      'Start learning',
      'Begin lesson',
      'Continue lesson',
      'Continue learning',
      "Let's go",
      'Continue',
      'Start',
      'Begin'
    ];

    for (const text of priorities) {
      const btn = buttons.find(b => {
        const btnText = b.textContent?.trim().toLowerCase();
        return btnText === text.toLowerCase() || btnText?.includes(text.toLowerCase());
      });
      if (btn) {
        btn.click();
        return btn.textContent?.trim();
      }
    }

    // Fallback to Review skills if nothing else
    const reviewBtn = buttons.find(b => b.textContent?.includes('Review skills'));
    if (reviewBtn) {
      reviewBtn.click();
      return reviewBtn.textContent?.trim();
    }

    // Last resort: any prominent button that might start the lesson
    const anyStartBtn = buttons.find(b => {
      const text = b.textContent?.trim().toLowerCase();
      return text && text.length < 30 && !text.includes('close') && !text.includes('cancel');
    });
    if (anyStartBtn) {
      anyStartBtn.click();
      return 'fallback: ' + anyStartBtn.textContent?.trim();
    }

    return null;
  });

  if (startedLesson) {
    console.log(`    Clicked: "${startedLesson}"`);
  } else {
    console.log(`    No start button found`);
    return lesson;
  }

  // Wait for lesson content to load (check for Continue button or lesson indicators)
  await sleep(2000);

  // Check if we're in a lesson by looking for lesson UI elements
  const inLesson = await page.evaluate(() => {
    // Look for signs we're in a lesson
    const hasContinue = !!document.querySelector('button')?.textContent?.includes('Continue');
    const hasLessonContent = !!document.querySelector('[class*="lesson"], [class*="Lesson"], [class*="exercise"], [class*="Exercise"]');
    const hasProgress = !!document.querySelector('[role="progressbar"], [class*="progress"]');
    const hasCloseButton = !!document.querySelector('button[aria-label*="close"], svg[class*="close"], button svg');

    return hasContinue || hasLessonContent || hasProgress || hasCloseButton;
  });

  lesson.url = page.url();

  if (!inLesson) {
    console.log(`    Could not detect lesson content`);
    const debugPath = `/tmp/busuu-debug-${lessonIndex}.png`;
    await page.screenshot({ path: debugPath });
    return lesson;
  }

  console.log(`    In lesson: ${lesson.url.substring(0, 80)}...`);

  // Go through lesson steps
  let step = 0;
  const maxSteps = 40;
  let stuckCount = 0;
  let lastContent = '';

  while (step < maxSteps) {
    step++;

    // FAST SKIP: Check for speaking/writing community exercises FIRST (before any delays)
    // BUT NOT word-order exercises which have clickable word buttons!
    const skipType = await page.evaluate(() => {
      // Get ALL clickable elements (both <button> and <span role="button">)
      const buttons = [...document.querySelectorAll('button')];
      const roleButtons = [...document.querySelectorAll('[role="button"]')];
      const allClickables = [...buttons, ...roleButtons];
      const buttonTexts = buttons.map(b => b.textContent?.toLowerCase().trim() || '');

      // FIRST: Check if this is a word-order/translation exercise (should NOT skip)
      // These have draggable word buttons in fillgap-dragdrop__options
      const wordButtons = document.querySelectorAll('.fillgap-dragdrop__options .ex-btn[role="button"], .ex-btn[role="button"][data-qa-pass][draggable="true"]');
      if (wordButtons.length >= 2) {
        return null; // Don't skip - this is a word-order exercise
      }

      // Also check for ex-btn with data-qa-pass (word order indicators)
      const exBtnWithPass = document.querySelectorAll('.ex-btn[data-qa-pass]');
      if (exBtnWithPass.length >= 2) {
        return null; // Don't skip - this is an exercise with answer options
      }

      // Speaking exercises: buttons specifically for speaking practice
      // "click and repeat", "replay" (as main action), but NOT "translate" instruction
      const isSpeaking = buttonTexts.some(t =>
        t === 'click and repeat' || t === 'replay' ||
        t.includes('record your') || t.includes('say it')
      ) || !!document.querySelector('[aria-label="animation"]');

      // Writing/community exercises: "write" and "speak" buttons as main actions
      const hasWriteBtn = buttonTexts.some(t => t === 'write');
      const hasSpeakBtn = buttonTexts.some(t => t === 'speak');
      const isWritePractice = (hasWriteBtn && hasSpeakBtn); // Both present = community exercise

      // Community exercise indicators
      const isCommunity = !!document.querySelector('[class*="community"], [data-qa*="community"]') ||
                          buttonTexts.some(t => t.includes('get feedback') || t.includes('native speaker'));

      if (isSpeaking) return 'speaking';
      if (isWritePractice || isCommunity) return 'write-practice';
      return null;
    });

    if (skipType) {
      console.log(`    Step ${step}: ${skipType.toUpperCase()} - skipping fast`);
      // Click skip/continue/close immediately
      const skipped = await page.evaluate(() => {
        const btns = [...document.querySelectorAll('button')];
        // Priority: skip > continue > next > close
        const skipBtn = btns.find(b => {
          const t = b.textContent?.toLowerCase().trim() || '';
          return t === 'skip' || t === 'continue' || t === 'next' || t === 'close' || t === 'x';
        });
        if (skipBtn) {
          skipBtn.click();
          return skipBtn.textContent?.trim();
        }
        // Try close button by aria-label
        const closeBtn = document.querySelector('button[aria-label*="close"], button[aria-label*="Close"], [aria-label*="close"]');
        if (closeBtn) {
          closeBtn.click();
          return 'close-btn';
        }
        return null;
      });
      console.log(`      Clicked: ${skipped || 'nothing found'}`);
      await sleep(300); // Minimal delay
      continue;
    }

    // Extract content from this step
    const content = await extractTextContent(page);

    // Debug log for first few steps
    if (step <= 3) {
      console.log(`    Step ${step}: type=${content.exerciseType || 'unknown'}, vocab=${content.vocabulary.length}, sentences=${content.sentences.length}, options=${content.options?.length || 0}`);
      if (content.vocabulary.length > 0) {
        console.log(`      Vocab: ${content.vocabulary.map(v => `${v.de}→${v.en}`).join(', ')}`);
      }
      if (content.sentences.length > 0) {
        console.log(`      Sentences: ${content.sentences.slice(0, 3).join(', ')}${content.sentences.length > 3 ? '...' : ''}`);
      }
    }

    // Add vocabulary, sentences, and tips
    lesson.vocabulary.push(...content.vocabulary);
    lesson.sentences.push(...content.sentences);
    if (content.cultureTips?.length > 0) {
      lesson.cultureTips.push(...content.cultureTips);
    }

    // Track exercise type sequence
    if (content.exerciseType && !lesson.exerciseSequence.includes(content.exerciseType)) {
      lesson.exerciseSequence.push(content.exerciseType);
    }

    // Try to progress
    const optionClicked = await clickAnyOption(page);
    await sleep(CONFIG.delays.betweenSteps);
    const nextClicked = await clickNext(page);
    await sleep(CONFIG.delays.afterClick);

    // Extract feedback/grammar tips after clicking
    const feedback = await extractFeedback(page);
    if (feedback.grammarTip && !lesson.grammarTips.includes(feedback.grammarTip)) {
      lesson.grammarTips.push(feedback.grammarTip);
    }

    // More debug info
    if (step <= 5) {
      console.log(`      Navigation: option=${optionClicked}, next=${nextClicked}`);
      if (feedback.grammarTip) {
        console.log(`      Tip: ${feedback.grammarTip.substring(0, 60)}...`);
      }
    }

    // Wait for navigation to settle
    await sleep(500);

    // Check if lesson ended - look for lesson completion indicators
    const lessonEnded = await page.evaluate(() => {
      const url = window.location.href;
      // Check URL - but be more specific
      if (url.includes('/timeline/') && !url.includes('/course/') && !url.includes('/learning/')) {
        return 'url-timeline';
      }
      // Check for completion screen elements
      const completionIndicators = [
        'Lesson complete',
        'Well done',
        'Great job',
        'You earned',
        'XP earned',
        'Keep going',
        'lesson finished'
      ];
      const bodyText = document.body.innerText;
      for (const indicator of completionIndicators) {
        if (bodyText.toLowerCase().includes(indicator.toLowerCase())) {
          return 'completion-screen';
        }
      }
      // Check if we're on a summary/results page
      if (document.querySelector('[class*="summary"], [class*="Summary"], [class*="result"], [class*="Result"], [class*="complete"], [class*="Complete"]')) {
        return 'summary-element';
      }
      return null;
    });

    if (lessonEnded) {
      console.log(`    Completed (${step} steps) - ${lessonEnded}`);
      break;
    }

    // Detect if stuck
    const currentContent = await page.evaluate(() => document.body.innerText.substring(0, 500));
    if (currentContent === lastContent) {
      stuckCount++;
      if (stuckCount > 3) {
        await page.keyboard.press('Escape');
        await sleep(500);
        await page.keyboard.press('Enter');
        await sleep(500);
        if (stuckCount > 5) {
          console.log(`    Stuck, moving on...`);
          break;
        }
      }
    } else {
      stuckCount = 0;
    }
    lastContent = currentContent;
  }

  // Dedupe final results
  lesson.vocabulary = [...new Map(lesson.vocabulary.map(v => [v.de, v])).values()];
  lesson.sentences = [...new Set(lesson.sentences)];

  console.log(`    ${lesson.vocabulary.length} vocab, ${lesson.sentences.length} sentences, exercises: [${lesson.exerciseSequence.join(', ')}]`);

  return lesson;
}

// ============================================
// TIMELINE PARSING
// ============================================

async function getLessons(page, level) {
  console.log(`\nGetting ${level.toUpperCase()} lessons...`);

  await page.goto(`${CONFIG.baseUrl}/dashboard/timeline/${level}`, { waitUntil: 'networkidle2' });
  await sleep(CONFIG.delays.afterPageLoad);

  // Scroll to load all
  await page.evaluate(async () => {
    for (let i = 0; i < 30; i++) {
      window.scrollBy(0, 500);
      await new Promise(r => setTimeout(r, 150));
    }
    window.scrollTo(0, 0);
  });
  await sleep(1500);

  // Extract lesson cards using data-testid
  const lessons = await page.evaluate(() => {
    const results = [];
    const cards = document.querySelectorAll('[data-testid="lesson_card"]');

    cards.forEach((card, i) => {
      const titleEl = card.querySelector('[data-testid="dialog_level_title"]');
      const title = titleEl?.textContent?.trim() || `Lesson ${i + 1}`;

      // Get description (the p element after the title)
      const descEl = titleEl?.nextElementSibling;
      const description = descEl?.textContent?.trim() || '';

      // Check if locked
      const isLocked = !!card.querySelector('[data-testid="lesson_padlock"]');

      // Check if speaking lesson (has Lottie animation or title contains "speaking")
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
  const locked = lessons.filter(l => l.isLocked);
  const speaking = lessons.filter(l => l.isSpeaking);
  console.log(`Found ${lessons.length} lessons (${unlocked.length} unlocked, ${locked.length} locked, ${speaking.length} speaking)`);
  if (speaking.length > 0) {
    console.log(`Speaking lessons will be skipped: ${speaking.map(l => l.title).slice(0, 5).join(', ')}${speaking.length > 5 ? '...' : ''}`);
  }

  // Debug: show first few lessons found
  if (lessons.length > 0) {
    console.log('\nSample lessons:');
    lessons.slice(0, 5).forEach((l, i) => {
      const lock = l.isLocked ? ' [LOCKED]' : '';
      console.log(`  ${i + 1}. ${l.title}${lock} - ${l.description || '(no desc)'}`);
    });
  }

  // Save timeline HTML for debugging
  const htmlPath = path.join(process.cwd(), 'timeline-debug.html');
  const html = await page.content();
  fs.writeFileSync(htmlPath, html);
  console.log(`\nSaved timeline HTML to: timeline-debug.html`);

  return lessons;
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log('Busuu Extractor (Text Only)\n');

  const args = process.argv.slice(2);
  const level = args.find(a => a.startsWith('--level='))?.split('=')[1]?.toLowerCase() || 'a1';
  const skipLocked = !args.includes('--include-locked');

  console.log(`Level: ${level.toUpperCase()}`);
  console.log(`Skip locked: ${skipLocked}`);

  ensureDir(CONFIG.outputDir);

  // Launch browser
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 800 },
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');

  // Auto-accept "Leave site?" dialogs
  page.on('dialog', async dialog => {
    console.log(`    [Dialog: ${dialog.type()}] ${dialog.message()}`);
    await dialog.accept();
  });

  await page.goto(`${CONFIG.baseUrl}/dashboard/timeline/${level}`, { waitUntil: 'networkidle2' });

  console.log('\nLogin to Busuu in the browser, then press ENTER here.\n');
  await waitForEnter('Press ENTER when ready...');

  // Get all lessons
  const allLessons = await getLessons(page, level);

  if (allLessons.length === 0) {
    console.log('No lessons found!');
    await browser.close();
    return;
  }

  // Filter lessons
  const lessons = skipLocked ? allLessons.filter(l => !l.isLocked) : allLessons;
  console.log(`\nWill extract ${lessons.length} lessons\n`);

  // Load previous progress (per-level)
  const progress = loadProgress(level);
  const completedLessons = new Set(progress.completedLessons || []);
  console.log(`\nResuming ${level.toUpperCase()}: ${completedLessons.size} lessons already done`);

  // Output structure
  let output;
  if (progress.extractedData?.chapters) {
    output = progress.extractedData;
    // Convert exerciseTypes back to Set (it was serialized as Array)
    output.exerciseTypes = new Set(output.exerciseTypes || []);
  } else {
    output = {
      source: 'busuu',
      level: level.toUpperCase(),
      extractedAt: new Date().toISOString(),
      chapters: [],
      allVocabulary: [],
      allGrammarTips: [],
      exerciseTypes: new Set()
    };
  }

  // Group by chapter
  const chapterMap = new Map();
  // Restore previous chapters
  if (output.chapters) {
    output.chapters.forEach(ch => chapterMap.set(ch.name, ch));
  }

  for (let i = 0; i < lessons.length; i++) {
    const lessonInfo = lessons[i];
    if (lessonInfo.isLocked && skipLocked) continue;

    // Skip speaking lessons entirely (can't automate microphone)
    if (lessonInfo.isSpeaking) {
      console.log(`\n[${i + 1}/${lessons.length}] ${lessonInfo.title} - SKIPPED (speaking practice)`);
      continue;
    }

    // Skip already completed lessons - use chapter:title as unique key
    const lessonKey = `${lessonInfo.chapter}:${lessonInfo.title}`;
    if (completedLessons.has(lessonKey)) {
      console.log(`\n[${i + 1}/${lessons.length}] ${lessonInfo.title} - SKIPPED (already extracted)`);
      continue;
    }

    console.log(`\n[${i + 1}/${lessons.length}] ${lessonInfo.title}`);

    // Navigate to timeline
    await page.goto(`${CONFIG.baseUrl}/dashboard/timeline/${level}`, { waitUntil: 'networkidle2' });

    // Handle any "leave page" popups
    await page.evaluate(() => {
      const buttons = [...document.querySelectorAll('button')];
      const leaveBtn = buttons.find(b =>
        b.textContent?.includes('Leave') ||
        b.textContent?.includes('Discard') ||
        b.textContent?.includes('Yes')
      );
      if (leaveBtn) leaveBtn.click();
    });

    await sleep(2000);

    // Scroll to load all lesson cards up to our target
    await page.evaluate(async (targetIdx) => {
      let lastCount = 0;
      for (let i = 0; i < 50; i++) {
        const cards = document.querySelectorAll('[data-testid="lesson_card"]');
        if (cards.length > targetIdx) break;
        if (cards.length === lastCount && i > 10) break; // No more loading
        lastCount = cards.length;
        window.scrollBy(0, 400);
        await new Promise(r => setTimeout(r, 200));
      }
    }, lessonInfo.index);
    await sleep(1000);

    // Extract lesson
    const lessonData = await extractLesson(page, i, lessonInfo);

    // Add to chapter
    if (!chapterMap.has(lessonInfo.chapter)) {
      chapterMap.set(lessonInfo.chapter, { title: lessonInfo.chapter, lessons: [] });
    }
    chapterMap.get(lessonInfo.chapter).lessons.push({
      title: lessonData.title,
      description: lessonData.description,
      vocabulary: lessonData.vocabulary,
      sentences: lessonData.sentences,
      grammarTips: lessonData.grammarTips || [],
      cultureTips: lessonData.cultureTips || [],
      exerciseSequence: lessonData.exerciseSequence
    });

    // Aggregate
    output.allVocabulary.push(...lessonData.vocabulary);
    if (lessonData.grammarTips?.length > 0) {
      output.allGrammarTips = output.allGrammarTips || [];
      output.allGrammarTips.push(...lessonData.grammarTips);
    }
    if (lessonData.cultureTips?.length > 0) {
      output.allCultureTips = output.allCultureTips || [];
      output.allCultureTips.push(...lessonData.cultureTips);
    }
    lessonData.exerciseSequence.forEach(e => output.exerciseTypes.add(e));

    // Mark as completed and save progress - use chapter:title as unique key
    completedLessons.add(lessonKey);
    output.chapters = Array.from(chapterMap.values());
    saveProgress(level, {
      completedLessons: Array.from(completedLessons),
      extractedData: {
        ...output,
        exerciseTypes: Array.from(output.exerciseTypes || [])
      }
    });
    console.log(`    Progress saved (${completedLessons.size} ${level.toUpperCase()} lessons done)`);
  }

  // Finalize output
  output.chapters = Array.from(chapterMap.values());
  output.allVocabulary = [...new Map(output.allVocabulary.map(v => [v.de, v])).values()];
  output.exerciseTypes = Array.from(output.exerciseTypes);

  // Save
  const levelDir = path.join(CONFIG.outputDir, level.toUpperCase());
  saveJson(path.join(levelDir, 'content.json'), output);

  // Summary
  console.log('\n========================================');
  console.log('EXTRACTION COMPLETE');
  console.log('========================================');
  console.log(`Level:       ${level.toUpperCase()}`);
  console.log(`Chapters:    ${output.chapters.length}`);
  console.log(`Vocabulary:  ${output.allVocabulary.length} unique words`);
  console.log(`Grammar Tips: ${output.allGrammarTips?.length || 0}`);
  console.log(`Culture Tips: ${output.allCultureTips?.length || 0}`);
  console.log(`Exercises:   ${output.exerciseTypes.join(', ')}`);
  console.log(`Output:      ${levelDir}/content.json`);
  console.log(`Progress:    ${CONFIG.getProgressFile(level)}`);
  console.log('========================================\n');

  // Clean up progress file on successful completion
  console.log(`Extraction complete! You can delete extraction-progress-${level}.json to start fresh next time.`);

  await waitForEnter('Press ENTER to close...');
  await browser.close();
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
