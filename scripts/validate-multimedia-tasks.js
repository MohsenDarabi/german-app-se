#!/usr/bin/env node
/**
 * Multimedia Task Validator
 *
 * Validates that all multimedia task files have correct structure.
 */

const fs = require('fs');
const path = require('path');

const TASKS_DIR = path.join(__dirname, '../ai-workspace/progress/multimedia-tasks');

const files = fs.readdirSync(TASKS_DIR).filter(f => f.endsWith('.json') && f.startsWith('A1-'));

let errors = [];
let valid = 0;
let totalTasks = 0;

console.log('\n📋 Validating multimedia task files...\n');

files.forEach(file => {
  try {
    const content = JSON.parse(fs.readFileSync(path.join(TASKS_DIR, file), 'utf8'));
    let fileErrors = [];

    // Validate structure
    if (!content.lessonId) fileErrors.push('missing lessonId');
    if (!content.lessonTitle) fileErrors.push('missing lessonTitle');
    if (!content.tasks || !Array.isArray(content.tasks)) fileErrors.push('missing tasks array');

    if (content.tasks) {
      content.tasks.forEach((task, i) => {
        if (!task.id) fileErrors.push(`task[${i}] missing id`);
        if (!task.type) fileErrors.push(`task[${i}] missing type`);
        if (!task.stepId) fileErrors.push(`task[${i}] missing stepId`);
        if (!task.outputPath) fileErrors.push(`task[${i}] missing outputPath`);
        if (!task.status) fileErrors.push(`task[${i}] missing status`);
        if (!task.specs) fileErrors.push(`task[${i}] missing specs`);
        if (!task.description) fileErrors.push(`task[${i}] missing description`);
        totalTasks++;
      });
    }

    if (fileErrors.length > 0) {
      errors.push({ file, errors: fileErrors });
      console.log(`  ❌ ${file}: ${fileErrors.length} error(s)`);
    } else {
      valid++;
      console.log(`  ✅ ${file}: ${content.tasks.length} task(s)`);
    }
  } catch (e) {
    errors.push({ file, errors: [e.message] });
    console.log(`  ❌ ${file}: ${e.message}`);
  }
});

console.log('\n' + '═'.repeat(50));
console.log(`\n  Files: ${valid}/${files.length} valid`);
console.log(`  Tasks: ${totalTasks} total\n`);

if (errors.length > 0) {
  console.log('❌ Errors found:\n');
  errors.forEach(({ file, errors: errs }) => {
    console.log(`  ${file}:`);
    errs.forEach(e => console.log(`    • ${e}`));
  });
  process.exit(1);
} else {
  console.log('✅ All multimedia task files are valid!\n');
}
