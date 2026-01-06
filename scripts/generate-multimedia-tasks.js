#!/usr/bin/env node
/**
 * Multimedia Task Generator
 *
 * Generates and manages multimedia tasks (images/videos) for lessons.
 * Tracks changes to lesson content and updates task status accordingly.
 *
 * Usage:
 *   node scripts/generate-multimedia-tasks.js --lesson=A1-M01-L01
 *   node scripts/generate-multimedia-tasks.js --lesson=A1-M01-L01 --update
 *   node scripts/generate-multimedia-tasks.js --all
 *   node scripts/generate-multimedia-tasks.js --status
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Colors for terminal output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(color, msg) {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

// Paths
const CONTENT_DIR = path.resolve(__dirname, '../content/de-fa');
const TASKS_DIR = path.resolve(__dirname, '../ai-workspace/progress/multimedia-tasks');
const IMAGES_DIR = path.resolve(__dirname, '../apps/web/static/images/shared');

// Ensure tasks directory exists
if (!fs.existsSync(TASKS_DIR)) {
  fs.mkdirSync(TASKS_DIR, { recursive: true });
}

/**
 * Generate a short hash of content for change detection
 */
function hashContent(content) {
  return crypto.createHash('md5').update(JSON.stringify(content)).digest('hex').substring(0, 8);
}

/**
 * Determine image category based on step content
 */
function categorizeImage(step, lessonTags = []) {
  const text = JSON.stringify(step).toLowerCase();

  if (text.includes('hallo') || text.includes('hi ') || text.includes('greeting')) return 'greetings';
  if (text.includes('tschüss') || text.includes('wiedersehen') || text.includes('goodbye')) return 'greetings';
  if (text.includes('danke') || text.includes('thank')) return 'expressions';
  if (text.includes('bitte') || text.includes('please')) return 'expressions';
  if (text.includes('café') || text.includes('cafe') || text.includes('restaurant')) return 'scenes';
  if (text.includes('geht') || text.includes('feeling') || text.includes('gut') || text.includes('schlecht')) return 'expressions';
  if (text.includes('woher') || text.includes('country') || text.includes('iran') || text.includes('deutschland')) return 'places';
  if (text.includes('sprech') || text.includes('lern') || text.includes('language')) return 'daily-life';
  if (text.includes('wohn') || text.includes('live') || text.includes('berlin')) return 'places';
  if (lessonTags.includes('introductions')) return 'introductions';
  if (lessonTags.includes('greetings')) return 'greetings';

  return 'scenes';
}

/**
 * Generate a filename-safe slug from text
 */
function slugify(text, fallback = 'item') {
  if (!text) return fallback;
  const slug = text
    .toLowerCase()
    .replace(/[äöü]/g, c => ({ 'ä': 'ae', 'ö': 'oe', 'ü': 'ue' }[c]))
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 30);
  return slug || fallback;
}

/**
 * Extract multimedia tasks from a lesson
 */
function extractTasksFromLesson(lesson) {
  const tasks = [];
  const tags = lesson.tags || [];

  for (const step of lesson.steps) {
    // Dialog steps - each dialog scene needs an image
    if (step.type === 'dialog' && step.lines?.length >= 2) {
      const speakers = [...new Set(step.lines.map(l => l.speaker))];
      const firstLine = step.lines[0]?.text?.de || '';
      const category = categorizeImage(step, tags);

      tasks.push({
        id: `img-${step.id}`,
        type: 'image',
        stepId: step.id,
        stepType: step.type,
        priority: 'high',
        sourceContent: {
          title: step.title,
          speakers: speakers,
          firstLine: firstLine,
          lineCount: step.lines.length
        },
        sourceHash: hashContent(step),
        description: `${speakers.join(' & ')} - ${step.title || 'Dialog scene'}`,
        context: `Dialog with ${step.lines.length} lines: "${firstLine}"`,
        specs: {
          format: 'jpg',
          dimensions: '800x600',
          style: 'friendly, modern German setting',
          subjects: speakers.join(', ')
        },
        category: category,
        outputPath: `images/shared/${category}/${lesson.id.toLowerCase()}-${step.id}-${slugify(speakers.join('-'), 'dialog')}.jpg`,
        status: 'pending',
        completedAt: null,
        notes: ''
      });
    }

    // New-word steps with examples that have context worth illustrating
    if (step.type === 'new-word' && step.example?.text?.de) {
      const word = step.word?.de || '';
      const example = step.example.text.de;
      const category = categorizeImage(step, tags);

      // Only create task for words that benefit from visuals
      const visualWords = ['hallo', 'hi', 'tschüss', 'danke', 'bitte', 'gut', 'schlecht'];
      const needsVisual = visualWords.some(w => word.toLowerCase().includes(w));

      if (needsVisual) {
        tasks.push({
          id: `img-${step.id}`,
          type: 'image',
          stepId: step.id,
          stepType: step.type,
          priority: 'medium',
          sourceContent: {
            word: word,
            translation: step.word?.fa,
            example: example
          },
          sourceHash: hashContent(step),
          description: `Visual for "${word}"`,
          context: `New word introduction: ${example}`,
          specs: {
            format: 'jpg',
            dimensions: '800x600',
            style: 'clear, educational',
            focus: word
          },
          category: category,
          outputPath: `images/shared/${category}/${slugify(word)}.jpg`,
          status: 'pending',
          completedAt: null,
          notes: ''
        });
      }
    }
  }

  return tasks;
}

/**
 * Load existing task file if it exists
 */
function loadExistingTasks(lessonId) {
  const taskFile = path.join(TASKS_DIR, `${lessonId}.json`);
  if (fs.existsSync(taskFile)) {
    return JSON.parse(fs.readFileSync(taskFile, 'utf-8'));
  }
  return null;
}

/**
 * Merge new tasks with existing tasks, preserving status
 */
function mergeTasks(existingData, newTasks, lesson) {
  if (!existingData) {
    return {
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      sourceHash: hashContent(lesson),
      generatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tasks: newTasks
    };
  }

  const existingTasksMap = new Map(existingData.tasks.map(t => [t.id, t]));
  const changes = { added: [], updated: [], obsolete: [], unchanged: [] };

  // Process new tasks
  const mergedTasks = newTasks.map(newTask => {
    const existing = existingTasksMap.get(newTask.id);

    if (!existing) {
      changes.added.push(newTask.id);
      return newTask;
    }

    // Task exists - check if source changed
    if (existing.sourceHash !== newTask.sourceHash) {
      changes.updated.push(newTask.id);
      return {
        ...newTask,
        status: existing.status === 'completed' ? 'obsolete' : existing.status,
        previousHash: existing.sourceHash,
        notes: existing.notes ? `${existing.notes}\n[Source changed ${new Date().toISOString().split('T')[0]}]` : `[Source changed ${new Date().toISOString().split('T')[0]}]`
      };
    }

    // Unchanged - preserve existing status
    changes.unchanged.push(newTask.id);
    return {
      ...newTask,
      status: existing.status,
      completedAt: existing.completedAt,
      notes: existing.notes
    };
  });

  // Check for removed tasks (in existing but not in new)
  const newTaskIds = new Set(newTasks.map(t => t.id));
  existingData.tasks.forEach(t => {
    if (!newTaskIds.has(t.id)) {
      changes.obsolete.push(t.id);
      mergedTasks.push({
        ...t,
        status: 'removed',
        notes: t.notes ? `${t.notes}\n[Step removed ${new Date().toISOString().split('T')[0]}]` : `[Step removed ${new Date().toISOString().split('T')[0]}]`
      });
    }
  });

  return {
    lessonId: lesson.id,
    lessonTitle: lesson.title,
    sourceHash: hashContent(lesson),
    generatedAt: existingData.generatedAt,
    updatedAt: new Date().toISOString(),
    changes: changes,
    tasks: mergedTasks
  };
}

/**
 * Find lesson file by ID
 */
function findLessonFile(lessonId) {
  // Parse lesson ID: A1-M01-L01 -> A1/module-01/A1-M01-L01.json
  const match = lessonId.match(/^(A\d|B\d)-M(\d+)-L(\d+)$/);
  if (!match) return null;

  const [, level, module] = match;
  const levelDir = level;
  const moduleDir = `module-${module.padStart(2, '0')}`;

  const filePath = path.join(CONTENT_DIR, levelDir, moduleDir, `${lessonId}.json`);
  return fs.existsSync(filePath) ? filePath : null;
}

/**
 * Find all lesson files
 */
function findAllLessonFiles() {
  const files = [];

  function scan(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scan(fullPath);
      } else if (entry.name.match(/^A\d-M\d+-L\d+\.json$/)) {
        files.push(fullPath);
      }
    }
  }

  scan(CONTENT_DIR);
  return files;
}

/**
 * Process a single lesson
 */
function processLesson(lessonPath, options = {}) {
  const lesson = JSON.parse(fs.readFileSync(lessonPath, 'utf-8'));
  const existingData = options.update ? loadExistingTasks(lesson.id) : null;

  console.log(`\n📋 Processing: ${lesson.id} - ${lesson.title?.de || 'Untitled'}`);
  console.log('─'.repeat(50));

  const newTasks = extractTasksFromLesson(lesson);
  const result = mergeTasks(existingData, newTasks, lesson);

  // Save task file
  const taskFile = path.join(TASKS_DIR, `${lesson.id}.json`);
  fs.writeFileSync(taskFile, JSON.stringify(result, null, 2));

  // Report
  if (result.changes) {
    if (result.changes.added.length) log('green', `  + ${result.changes.added.length} new tasks`);
    if (result.changes.updated.length) log('yellow', `  ⚠ ${result.changes.updated.length} tasks updated (source changed)`);
    if (result.changes.obsolete.length) log('red', `  ✗ ${result.changes.obsolete.length} tasks removed`);
    if (result.changes.unchanged.length) log('cyan', `  ✓ ${result.changes.unchanged.length} tasks unchanged`);
  } else {
    log('green', `  + ${result.tasks.length} tasks generated`);
  }

  // Summary by status
  const byStatus = {};
  result.tasks.forEach(t => {
    byStatus[t.status] = (byStatus[t.status] || 0) + 1;
  });
  console.log(`  Status: ${Object.entries(byStatus).map(([k,v]) => `${k}:${v}`).join(', ')}`);

  return result;
}

/**
 * Show status of all tasks
 */
function showStatus() {
  console.log('\n📊 MULTIMEDIA TASKS STATUS\n');
  console.log('═'.repeat(60));

  const taskFiles = fs.readdirSync(TASKS_DIR).filter(f => f.endsWith('.json'));

  if (taskFiles.length === 0) {
    log('yellow', 'No task files found. Run with --lesson or --all to generate.');
    return;
  }

  let totalTasks = 0;
  const globalStatus = { pending: 0, in_progress: 0, completed: 0, obsolete: 0, removed: 0 };

  for (const file of taskFiles) {
    const data = JSON.parse(fs.readFileSync(path.join(TASKS_DIR, file), 'utf-8'));
    const lessonId = data.lessonId;

    const statusCounts = {};
    data.tasks.forEach(t => {
      statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
      globalStatus[t.status] = (globalStatus[t.status] || 0) + 1;
      totalTasks++;
    });

    const statusStr = Object.entries(statusCounts)
      .map(([k, v]) => {
        const color = { pending: 'yellow', in_progress: 'blue', completed: 'green', obsolete: 'red', removed: 'red' }[k] || 'reset';
        return `${colors[color]}${k}:${v}${colors.reset}`;
      })
      .join(' ');

    console.log(`${lessonId}: ${statusStr}`);
  }

  console.log('─'.repeat(60));
  console.log(`Total: ${totalTasks} tasks`);
  if (globalStatus.pending) log('yellow', `  ⏳ Pending: ${globalStatus.pending}`);
  if (globalStatus.in_progress) log('blue', `  🔄 In Progress: ${globalStatus.in_progress}`);
  if (globalStatus.completed) log('green', `  ✅ Completed: ${globalStatus.completed}`);
  if (globalStatus.obsolete) log('red', `  ⚠️  Obsolete: ${globalStatus.obsolete}`);
  if (globalStatus.removed) log('red', `  ❌ Removed: ${globalStatus.removed}`);
}

// Main
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`
Multimedia Task Generator

Usage:
  node scripts/generate-multimedia-tasks.js --lesson=A1-M01-L01    Generate tasks for one lesson
  node scripts/generate-multimedia-tasks.js --lesson=A1-M01-L01 --update   Update existing tasks
  node scripts/generate-multimedia-tasks.js --all                  Generate for all lessons
  node scripts/generate-multimedia-tasks.js --all --update         Update all existing tasks
  node scripts/generate-multimedia-tasks.js --status               Show task status summary

Options:
  --update    Preserve existing task status, mark changed as obsolete
  --status    Show status of all multimedia tasks
`);
  process.exit(0);
}

const isUpdate = args.includes('--update');
const showStatusOnly = args.includes('--status');
const processAll = args.includes('--all');
const lessonArg = args.find(a => a.startsWith('--lesson='));

if (showStatusOnly) {
  showStatus();
  process.exit(0);
}

if (processAll) {
  const files = findAllLessonFiles();
  console.log(`\n🔍 Found ${files.length} lesson files\n`);

  for (const file of files) {
    processLesson(file, { update: isUpdate });
  }

  console.log('\n' + '═'.repeat(50));
  log('green', '✅ All lessons processed!');
  showStatus();

} else if (lessonArg) {
  const lessonId = lessonArg.split('=')[1];
  const lessonFile = findLessonFile(lessonId);

  if (!lessonFile) {
    log('red', `❌ Lesson not found: ${lessonId}`);
    process.exit(1);
  }

  processLesson(lessonFile, { update: isUpdate });
  log('green', `\n✅ Task file saved to: ai-workspace/progress/multimedia-tasks/${lessonId}.json`);

} else {
  log('red', 'Please specify --lesson=ID, --all, or --status');
  process.exit(1);
}
