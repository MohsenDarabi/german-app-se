#!/usr/bin/env node
/**
 * Generate TASK-SUMMARY.md for multimedia tasks
 */

const fs = require('fs');
const path = require('path');

const TASKS_DIR = path.join(__dirname, '../ai-workspace/progress/multimedia-tasks');
const files = fs.readdirSync(TASKS_DIR).filter(f => f.endsWith('.json') && f.startsWith('A1-')).sort();

let output = `# Multimedia Tasks Summary

> Auto-generated checklist for the designer. Total: **51 tasks** across **31 lessons**.

---

## Quick Stats

| Module | Tasks | Priority High |
|--------|-------|---------------|
`;

// Group by module
const modules = {};

files.forEach(file => {
  const content = JSON.parse(fs.readFileSync(path.join(TASKS_DIR, file), 'utf8'));
  const match = file.match(/A1-M0(\d)/);
  if (!match) return;
  const mod = match[1];
  if (!modules[mod]) modules[mod] = { tasks: 0, high: 0, lessons: [] };

  content.tasks.forEach(task => {
    modules[mod].tasks++;
    if (task.priority === 'high') modules[mod].high++;
  });
  modules[mod].lessons.push(file);
});

Object.entries(modules).forEach(([mod, data]) => {
  output += `| Module ${mod} | ${data.tasks} | ${data.high} |\n`;
});

output += `
---

## Tasks by Module

`;

// Generate checklist by module
Object.entries(modules).forEach(([mod, data]) => {
  output += `### Module ${mod}\n\n`;

  data.lessons.forEach(file => {
    const content = JSON.parse(fs.readFileSync(path.join(TASKS_DIR, file), 'utf8'));
    const title = content.lessonTitle?.de || 'Untitled';
    output += `#### ${content.lessonId}: ${title}\n\n`;

    content.tasks.forEach(task => {
      const priority = task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢';
      output += `- [ ] ${priority} **${task.id}** - ${task.description}\n`;
      output += `  - Output: \`${task.outputPath}\`\n`;
      output += `  - Specs: ${task.specs.dimensions}, ${task.specs.format}\n`;
      if (task.specs.subjects) output += `  - Characters: ${task.specs.subjects}\n`;
      output += `\n`;
    });
  });
});

output += `---

## Priority Legend

- 🔴 **High** - Dialog scenes (most visible to users)
- 🟡 **Medium** - Important vocabulary illustrations
- 🟢 **Low** - Optional enhancements

## How to Mark Complete

1. Open the JSON file in \`ai-workspace/progress/multimedia-tasks/\`
2. Change \`"status": "pending"\` to \`"status": "completed"\`
3. Add \`"completedAt": "2026-01-07"\`

## Commands

\`\`\`bash
# Check progress
node scripts/check-multimedia-tasks.js

# Validate task files
node scripts/validate-multimedia-tasks.js

# List next pending tasks
node scripts/check-multimedia-tasks.js -p 10
\`\`\`
`;

fs.writeFileSync(path.join(TASKS_DIR, 'TASK-SUMMARY.md'), output);
console.log('✅ Created TASK-SUMMARY.md');
