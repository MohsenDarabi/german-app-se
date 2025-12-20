#!/usr/bin/env node
/**
 * Transform new lesson content to match existing schema
 */

const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.resolve(__dirname, '../content/de-fa/A1');

function transformStep(step) {
  switch (step.type) {
    case 'fill-in-blank':
      return transformFillInBlank(step);
    case 'translation':
      return transformTranslation(step);
    case 'true-false':
      return transformTrueFalse(step);
    default:
      return step;
  }
}

function transformFillInBlank(step) {
  // Convert blanks array to options and correctAnswers
  if (step.blanks && Array.isArray(step.blanks)) {
    const allOptions = [];
    const correctAnswers = [];

    step.blanks.forEach((blank, blankIndex) => {
      if (blank.options) {
        // Add all options from this blank
        blank.options.forEach((opt, optIndex) => {
          if (!allOptions.includes(opt)) {
            allOptions.push(opt);
          }
        });
        // Find correct answer index in allOptions array
        const correctOption = blank.options[blank.correctIndex];
        correctAnswers.push(allOptions.indexOf(correctOption));
      }
    });

    return {
      ...step,
      options: allOptions,
      correctAnswers: correctAnswers,
      blanks: undefined // Remove old format
    };
  }
  return step;
}

function transformTranslation(step) {
  // Convert free-form translation to template-based
  if (step.acceptedAnswers && Array.isArray(step.acceptedAnswers)) {
    const correctAnswer = step.acceptedAnswers[0];
    const words = correctAnswer.split(/\s+/);

    // Create template with blanks for each word
    const template = words.map((_, i) => `{${i}}`).join(' ');

    // Shuffle words for options (add some distractors)
    const shuffledWords = [...words].sort(() => Math.random() - 0.5);

    return {
      ...step,
      sentenceTemplate: template,
      options: words,
      correctAnswers: words.map((_, i) => i),
      correctTranslation: {
        de: correctAnswer,
        fa: step.sourceText
      },
      // Remove old format fields
      targetLanguage: undefined,
      acceptedAnswers: undefined,
      hint: undefined
    };
  }
  return step;
}

function transformTrueFalse(step) {
  // Convert statement from object to string
  if (step.statement && typeof step.statement === 'object') {
    return {
      ...step,
      statement: step.statement.de, // Use German text
      statementExplanation: step.statement.fa // Store Persian as explanation
    };
  }
  return step;
}

function transformFeedback(step) {
  // Normalize feedback structure
  if (step.feedback) {
    const fb = step.feedback;
    // If feedback has correct/incorrect, merge them into explanation
    if (fb.correct || fb.incorrect) {
      return {
        ...step,
        feedback: {
          explanation: fb.explanation || `${fb.correct || ''} ${fb.incorrect || ''}`.trim(),
          tip: fb.tip
        }
      };
    }
  }
  return step;
}

function transformLesson(lesson) {
  const transformed = {
    ...lesson,
    steps: lesson.steps.map(step => {
      let newStep = transformStep(step);
      newStep = transformFeedback(newStep);
      // Remove undefined keys
      Object.keys(newStep).forEach(key => {
        if (newStep[key] === undefined) {
          delete newStep[key];
        }
      });
      return newStep;
    })
  };

  // Remove lessonSummary if present (not in schema)
  if (transformed.lessonSummary) {
    delete transformed.lessonSummary;
  }

  return transformed;
}

function processAllLessons() {
  const modules = fs.readdirSync(CONTENT_DIR).filter(f => f.startsWith('module-'));

  let processedCount = 0;
  let errorCount = 0;

  modules.forEach(moduleName => {
    const moduleDir = path.join(CONTENT_DIR, moduleName);
    const lessons = fs.readdirSync(moduleDir).filter(f => f.endsWith('.json'));

    lessons.forEach(lessonFile => {
      const lessonPath = path.join(moduleDir, lessonFile);
      try {
        const content = fs.readFileSync(lessonPath, 'utf-8');
        const lesson = JSON.parse(content);
        const transformed = transformLesson(lesson);
        fs.writeFileSync(lessonPath, JSON.stringify(transformed, null, 2), 'utf-8');
        console.log(`✓ Transformed: ${moduleName}/${lessonFile}`);
        processedCount++;
      } catch (err) {
        console.error(`✗ Error in ${moduleName}/${lessonFile}: ${err.message}`);
        errorCount++;
      }
    });
  });

  console.log(`\nDone! Processed: ${processedCount}, Errors: ${errorCount}`);
}

processAllLessons();
