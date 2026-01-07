#!/usr/bin/env node
/**
 * Generate TASK-SUMMARY.md from asset registry
 *
 * Enhanced (Option C):
 * - Shows only PENDING assets
 * - Includes character references for easy prompt building
 * - Groups by category with progress stats
 */

const fs = require('fs');
const path = require('path');

const REGISTRY_PATH = path.join(__dirname, '../apps/web/src/lib/data/asset-registry.json');
const OUTPUT_PATH = path.join(__dirname, '../ai-workspace/progress/multimedia-tasks/TASK-SUMMARY.md');

const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
const assets = Object.values(registry.assets);

// Stats
const total = assets.length;
const completed = assets.filter(a => a.status === 'completed').length;
const pending = assets.filter(a => a.status === 'pending').length;
const blocked = assets.filter(a => a.status === 'blocked').length;

// Group PENDING assets by category
const byCategory = {};
assets.filter(a => a.status === 'pending').forEach(a => {
  const cat = a.category || 'uncategorized';
  if (!byCategory[cat]) byCategory[cat] = [];
  byCategory[cat].push(a);
});

// Progress bar helper
function progressBar(done, total, width = 20) {
  const pct = total > 0 ? done / total : 0;
  const filled = Math.round(pct * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

let md = `# Multimedia Tasks - Pending

> Auto-generated from asset-registry.json
> Run: \`node scripts/generate-task-summary.js\` to refresh

---

## Summary

| Status | Count | Progress |
|--------|-------|----------|
| ✅ Completed | ${completed} | ${progressBar(completed, total)} |
| ⏳ Pending | ${pending} | |
| 🚫 Blocked | ${blocked} | |
| **Total** | **${total}** | **${((completed/total)*100).toFixed(1)}%** |

---

## Quick Start

1. Pick a pending task from below
2. If it has a **Character ref**, open that markdown file for the base prompt
3. Append the **Action** to the character prompt
4. Generate the image with your AI tool
5. Save to the **Path** shown
6. Run: \`node scripts/check-multimedia-tasks.js -s\` to mark complete

---

## Pending Tasks by Category

`;

// Sort categories by pending count
const sortedCats = Object.entries(byCategory)
  .sort((a, b) => b[1].length - a[1].length);

sortedCats.forEach(([cat, items]) => {
  const totalInCat = assets.filter(a => a.category === cat).length;
  const completedInCat = assets.filter(a => a.category === cat && a.status === 'completed').length;

  md += `### ${cat} (${items.length} pending, ${completedInCat}/${totalInCat} done)\n\n`;

  items.forEach(asset => {
    const typeIcon = asset.type === 'image' ? '🖼️' : '🎬';

    md += `#### ${typeIcon} ${asset.id}\n\n`;

    // Word info (for vocabulary)
    if (asset.word) {
      md += `- **Word:** ${asset.word.de} (${asset.word.fa || ''})\n`;
    }

    // Speakers (for dialogs)
    if (asset.speakers) {
      md += `- **Speakers:** ${asset.speakers.join(', ')}\n`;
    }

    // Character reference (Option C)
    if (asset.characterRef) {
      md += `- **Character ref:** \`${asset.characterRef}\`\n`;
    } else if (asset.characterRefs && asset.characterRefs.length > 0) {
      md += `- **Character refs:**\n`;
      asset.characterRefs.forEach(ref => {
        md += `  - \`${ref}\`\n`;
      });
    } else if (asset.character === null) {
      md += `- **Character:** None (simple illustration)\n`;
    }

    // Action/pose
    if (asset.action) {
      md += `- **Action:** ${asset.action}\n`;
    }

    // Save path
    md += `- **Save to:** \`apps/web/static${asset.path}\`\n`;

    // Usage context
    if (asset.usedIn && asset.usedIn.length > 0) {
      const lessons = [...new Set(asset.usedIn.map(u => u.lessonId))].join(', ');
      md += `- **Used in:** ${lessons}\n`;
    }

    md += `\n`;
  });
});

md += `---

## Commands Reference

\`\`\`bash
# Check progress overview
node scripts/check-multimedia-tasks.js

# List next N pending tasks
node scripts/check-multimedia-tasks.js -p 10

# Auto-sync status (marks existing files as completed)
node scripts/check-multimedia-tasks.js -s

# Validate registry structure
node scripts/validate-multimedia-tasks.js

# Regenerate asset registry from lessons
node scripts/regenerate-asset-registry-full.js

# Regenerate this summary
node scripts/generate-task-summary.js
\`\`\`

---

## Character Reference Files

| Character | Base Prompt | Variants |
|-----------|-------------|----------|
| Eli (43yo teacher) | \`content/characters/eli/eli-fullbody.md\` | head, fullbody |
| Tom (35yo instructor) | \`content/characters/tom/tom-base.md\` | head |
| Lisa (18yo student) | \`content/characters/lisa/lisa-base.md\` | head (open/ponytail), fullbody |
| Alex (21yo student) | \`content/characters/alex/alex-base.md\` | head |

---

*Generated: ${new Date().toISOString().split('T')[0]}*
`;

fs.writeFileSync(OUTPUT_PATH, md);
console.log('✅ Generated TASK-SUMMARY.md');
console.log(`   ${total} total assets`);
console.log(`   ${completed} completed (${((completed/total)*100).toFixed(1)}%)`);
console.log(`   ${pending} pending`);
console.log(`   ${sortedCats.length} categories with pending tasks`);
