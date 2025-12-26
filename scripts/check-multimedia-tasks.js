#!/usr/bin/env node

/**
 * Multimedia Task Progress Checker
 *
 * Shows progress on image/video tasks for the German learning app.
 * Run from project root: node scripts/check-multimedia-tasks.js
 */

const fs = require('fs');
const path = require('path');

const TASKS_DIR = path.join(__dirname, '../docs/multimedia-tasks');

function loadTaskFiles() {
  const files = fs.readdirSync(TASKS_DIR)
    .filter(f => f.endsWith('.json') && f.startsWith('A1-'));

  return files.map(file => {
    const content = JSON.parse(fs.readFileSync(path.join(TASKS_DIR, file), 'utf8'));
    return { file, ...content };
  });
}

function getStats(taskFiles) {
  let total = { images: 0, videos: 0, pending: 0, complete: 0, blocked: 0 };

  taskFiles.forEach(tf => {
    tf.tasks.forEach(task => {
      if (task.type === 'image') total.images++;
      if (task.type === 'video') total.videos++;
      if (task.status === 'pending') total.pending++;
      if (task.status === 'complete') total.complete++;
      if (task.status === 'blocked') total.blocked++;
    });
  });

  return total;
}

function showProgress() {
  const taskFiles = loadTaskFiles();
  const stats = getStats(taskFiles);
  const totalTasks = stats.images + stats.videos;
  const progress = ((stats.complete / totalTasks) * 100).toFixed(1);

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('       A1 MULTIMEDIA TASKS - PROGRESS REPORT');
  console.log('═══════════════════════════════════════════════════════\n');

  console.log(`  Total Tasks:    ${totalTasks}`);
  console.log(`  ├── Images:     ${stats.images}`);
  console.log(`  └── Videos:     ${stats.videos}\n`);

  console.log(`  Progress:       ${stats.complete}/${totalTasks} (${progress}%)`);
  console.log(`  ├── Complete:   ${stats.complete}`);
  console.log(`  ├── Pending:    ${stats.pending}`);
  console.log(`  └── Blocked:    ${stats.blocked}\n`);

  // Progress bar
  const barWidth = 40;
  const filled = Math.round((stats.complete / totalTasks) * barWidth);
  const bar = '█'.repeat(filled) + '░'.repeat(barWidth - filled);
  console.log(`  [${bar}] ${progress}%\n`);

  // Per-module breakdown
  console.log('───────────────────────────────────────────────────────');
  console.log('  MODULE BREAKDOWN\n');

  const modules = {};
  taskFiles.forEach(tf => {
    const match = tf.file.match(/A1-M0(\d)/);
    if (match) {
      const mod = `Module ${match[1]}`;
      if (!modules[mod]) modules[mod] = { total: 0, complete: 0, files: [] };
      modules[mod].files.push(tf.file);
      tf.tasks.forEach(t => {
        modules[mod].total++;
        if (t.status === 'complete') modules[mod].complete++;
      });
    }
  });

  Object.entries(modules).forEach(([mod, data]) => {
    const pct = ((data.complete / data.total) * 100).toFixed(0);
    const status = data.complete === data.total ? '✅' : data.complete > 0 ? '🔄' : '⏳';
    console.log(`  ${status} ${mod}: ${data.complete}/${data.total} (${pct}%)`);
  });

  console.log('\n═══════════════════════════════════════════════════════\n');

  // Show blocked tasks if any
  if (stats.blocked > 0) {
    console.log('⚠️  BLOCKED TASKS:\n');
    taskFiles.forEach(tf => {
      tf.tasks.filter(t => t.status === 'blocked').forEach(task => {
        console.log(`  • ${tf.file} → ${task.id}`);
        if (task.notes) console.log(`    Notes: ${task.notes}`);
      });
    });
    console.log('');
  }
}

function listPending(limit = 10) {
  const taskFiles = loadTaskFiles();
  let count = 0;

  console.log('\n📋 NEXT PENDING TASKS:\n');

  for (const tf of taskFiles) {
    for (const task of tf.tasks) {
      if (task.status === 'pending' && count < limit) {
        const icon = task.type === 'image' ? '🖼️' : '🎬';
        console.log(`${icon}  ${tf.file} → ${task.id}`);
        console.log(`   ${task.description.substring(0, 70)}...`);
        console.log(`   Output: ${task.outputPath}\n`);
        count++;
      }
    }
    if (count >= limit) break;
  }

  console.log(`Showing ${count} of many pending tasks. Check TASK-SUMMARY.md for full list.\n`);
}

// CLI
const args = process.argv.slice(2);

if (args.includes('--pending') || args.includes('-p')) {
  const limit = parseInt(args[args.indexOf('--pending') + 1] || args[args.indexOf('-p') + 1]) || 10;
  listPending(limit);
} else if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Multimedia Task Progress Checker

Usage:
  node scripts/check-multimedia-tasks.js          Show progress overview
  node scripts/check-multimedia-tasks.js -p [N]   List next N pending tasks
  node scripts/check-multimedia-tasks.js -h       Show this help

Files:
  docs/multimedia-tasks/TASK-SUMMARY.md   Full checklist (update checkboxes here)
  docs/multimedia-tasks/A1-M0X-LXX.json   Detailed task specifications
`);
} else {
  showProgress();
}
