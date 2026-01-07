#!/usr/bin/env node
/**
 * Generate TASK-SUMMARY.md from asset registry
 */

const fs = require('fs');
const path = require('path');

const REGISTRY_PATH = path.join(__dirname, '../apps/web/src/lib/data/asset-registry.json');
const OUTPUT_PATH = path.join(__dirname, '../ai-workspace/progress/multimedia-tasks/TASK-SUMMARY.md');

const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
const assets = Object.values(registry.assets);

// Group by category
const byCategory = {};
assets.forEach(a => {
  const cat = a.category || 'uncategorized';
  if (!byCategory[cat]) byCategory[cat] = [];
  byCategory[cat].push(a);
});

// Stats
const total = assets.length;
const images = assets.filter(a => a.type === 'image').length;
const videos = assets.filter(a => a.type === 'video').length;
const completed = assets.filter(a => a.status === 'completed').length;
const pending = assets.filter(a => a.status === 'pending').length;

let md = `# Multimedia Task Summary

> Auto-generated from asset-registry.json. **${total} assets** (${images} images, ${videos} videos).

---

## Progress

| Status | Count |
|--------|-------|
| Completed | ${completed} |
| Pending | ${pending} |
| **Total** | **${total}** |

---

## Tasks by Category

`;

// Sort categories by count
const sortedCats = Object.entries(byCategory).sort((a, b) => b[1].length - a[1].length);

sortedCats.forEach(([cat, items]) => {
  const catCompleted = items.filter(a => a.status === 'completed').length;
  const icon = catCompleted === items.length ? '✅' : catCompleted > 0 ? '🔄' : '⏳';

  md += `### ${icon} ${cat} (${catCompleted}/${items.length})\n\n`;

  items.forEach(asset => {
    const check = asset.status === 'completed' ? '[x]' : '[ ]';
    const typeIcon = asset.type === 'image' ? '🖼️' : '🎬';
    const desc = (asset.description || '').substring(0, 80);

    md += `- ${check} ${typeIcon} **${asset.id}**\n`;
    md += `  - ${desc}${desc.length >= 80 ? '...' : ''}\n`;
    md += `  - Path: \`${asset.path}\`\n`;
    if (asset.usedIn && asset.usedIn.length > 0) {
      const lessons = [...new Set(asset.usedIn.map(u => u.lessonId))].join(', ');
      md += `  - Used in: ${lessons}\n`;
    }
    md += `\n`;
  });
});

md += `---

## How to Mark Complete

1. Create the asset and save to the path shown above
2. Run: \`node scripts/check-multimedia-tasks.js -s\` to auto-sync status

Or manually edit \`apps/web/src/lib/data/asset-registry.json\`

---

## Commands

\`\`\`bash
# Check progress
node scripts/check-multimedia-tasks.js

# List pending tasks
node scripts/check-multimedia-tasks.js -p 20

# Auto-sync status
node scripts/check-multimedia-tasks.js -s

# Validate
node scripts/validate-multimedia-tasks.js

# Regenerate this summary
node scripts/generate-task-summary.js
\`\`\`
`;

fs.writeFileSync(OUTPUT_PATH, md);
console.log('✅ Generated TASK-SUMMARY.md');
console.log(`   ${total} assets (${completed} completed, ${pending} pending)`);
