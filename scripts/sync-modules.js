#!/usr/bin/env node

/**
 * Sync Modules Script
 *
 * Automatically generates/updates modules.ts from actual lesson files.
 * This ensures URL paths always match actual file names.
 *
 * Usage:
 *   node scripts/sync-modules.js              # Check for mismatches
 *   node scripts/sync-modules.js --write      # Update modules.ts
 *   node scripts/sync-modules.js --validate   # Validate only (for CI)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for terminal output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = {
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
};

// Paths
const CONTENT_DIR = path.resolve(__dirname, '../content/de-fa');
const MODULES_FILE = path.resolve(__dirname, '../apps/web/src/lib/data/modules.ts');

/**
 * Scan content directory and build lesson index
 */
function scanLessons(level) {
  const levelDir = path.join(CONTENT_DIR, level);
  if (!fs.existsSync(levelDir)) {
    return [];
  }

  const lessons = [];
  const modules = fs.readdirSync(levelDir, { withFileTypes: true })
    .filter(d => d.isDirectory() && d.name.startsWith('module-'))
    .sort((a, b) => a.name.localeCompare(b.name));

  for (const mod of modules) {
    const moduleDir = path.join(levelDir, mod.name);
    const files = fs.readdirSync(moduleDir)
      .filter(f => f.endsWith('.json'))
      .sort();

    for (const file of files) {
      const filePath = path.join(moduleDir, file);
      const lessonId = path.basename(file, '.json');

      try {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        // Verify lessonId matches filename
        if (content.id !== lessonId) {
          log.warn(`${file}: JSON id "${content.id}" doesn't match filename "${lessonId}"`);
        }

        lessons.push({
          id: lessonId,
          module: mod.name,
          moduleNumber: parseInt(mod.name.replace('module-', ''), 10),
          title: content.title,
          level: level,
          path: `/learn/de-fa/${level}/${lessonId}`,
          filePath: filePath
        });
      } catch (e) {
        log.error(`Failed to parse ${file}: ${e.message}`);
      }
    }
  }

  return lessons;
}

/**
 * Extract current paths from modules.ts
 */
function extractCurrentPaths() {
  if (!fs.existsSync(MODULES_FILE)) {
    return new Map();
  }

  const content = fs.readFileSync(MODULES_FILE, 'utf-8');
  const paths = new Map();

  // Match all path: "/learn/..." entries
  const pathRegex = /id:\s*"([^"]+)"[^}]*path:\s*"([^"]+)"/g;
  let match;
  while ((match = pathRegex.exec(content)) !== null) {
    paths.set(match[1], match[2]);
  }

  return paths;
}

/**
 * Compare and find mismatches
 */
function findMismatches() {
  const currentPaths = extractCurrentPaths();
  const mismatches = [];
  const missing = [];
  const extra = [];

  for (const level of ['A1', 'A2', 'B1', 'B2']) {
    const lessons = scanLessons(level);

    for (const lesson of lessons) {
      const currentPath = currentPaths.get(lesson.id);

      if (!currentPath) {
        missing.push(lesson);
      } else if (currentPath !== lesson.path) {
        mismatches.push({
          id: lesson.id,
          expected: lesson.path,
          actual: currentPath
        });
      }

      currentPaths.delete(lesson.id);
    }
  }

  // Remaining paths in currentPaths are extra (no matching file)
  for (const [id, path] of currentPaths) {
    extra.push({ id, path });
  }

  return { mismatches, missing, extra };
}

/**
 * Group lessons by module
 */
function groupByModule(lessons) {
  const modules = new Map();

  for (const lesson of lessons) {
    const key = lesson.module;
    if (!modules.has(key)) {
      modules.set(key, {
        id: lesson.module,
        moduleNumber: lesson.moduleNumber,
        lessons: []
      });
    }
    modules.get(key).lessons.push(lesson);
  }

  return Array.from(modules.values()).sort((a, b) => a.moduleNumber - b.moduleNumber);
}

/**
 * Generate modules.ts content
 */
function generateModulesTs() {
  const a1Lessons = scanLessons('A1');
  const a2Lessons = scanLessons('A2');
  const b1Lessons = scanLessons('B1');
  const b2Lessons = scanLessons('B2');

  const a1Modules = groupByModule(a1Lessons);
  const a2Modules = groupByModule(a2Lessons);
  const b1Modules = groupByModule(b1Lessons);
  const b2Modules = groupByModule(b2Lessons);

  const generateLessonEntry = (lesson) => `      {
        id: "${lesson.id}",
        title: "${lesson.title?.fa || lesson.title?.de || lesson.id}",
        description: "",
        path: "${lesson.path}"
      }`;

  const generateModuleEntry = (mod, level) => `  {
    id: "${mod.id}",
    title: "بخش ${mod.moduleNumber}",
    level: "${level}",
    lessons: [
${mod.lessons.map(l => generateLessonEntry(l)).join(',\n')}
    ]
  }`;

  const generateModulesArray = (modules, level, varName) => {
    if (modules.length === 0) return `export const ${varName}: ModuleStub[] = [];`;

    return `export const ${varName}: ModuleStub[] = [
${modules.map(m => generateModuleEntry(m, level)).join(',\n')}
];`;
  };

  return `/**
 * AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
 *
 * Generated by: node scripts/sync-modules.js --write
 * Source: content/de-fa/{level}/module-*/
 *
 * This file maps lesson IDs to URL paths. The paths MUST match
 * the actual JSON filenames in the content directory.
 */

export interface LessonStub {
  id: string;
  title: string;
  description: string;
  path: string; // URL path - must match filename
}

export interface ModuleStub {
  id: string;
  title: string;
  level: string;
  lessons: LessonStub[];
}

${generateModulesArray(a1Modules, 'A1', 'A1_MODULES')}

${generateModulesArray(a2Modules, 'A2', 'A2_MODULES')}

${generateModulesArray(b1Modules, 'B1', 'B1_MODULES')}

${generateModulesArray(b2Modules, 'B2', 'B2_MODULES')}
`;
}

/**
 * Main
 */
function main() {
  const args = process.argv.slice(2);
  const flags = {
    write: args.includes('--write'),
    validate: args.includes('--validate'),
    help: args.includes('--help') || args.includes('-h')
  };

  if (flags.help) {
    console.log(`
Sync Modules Script

Ensures modules.ts URL paths match actual lesson files.

Usage:
  node scripts/sync-modules.js              # Check for mismatches
  node scripts/sync-modules.js --write      # Update modules.ts
  node scripts/sync-modules.js --validate   # Validate only (exit 1 if mismatches)

The script scans content/de-fa/{level}/module-*/*.json and compares
with the paths defined in apps/web/src/lib/data/modules.ts.
`);
    process.exit(0);
  }

  console.log(`${colors.bold}Sync Modules${colors.reset}\n`);

  // Find mismatches
  const { mismatches, missing, extra } = findMismatches();

  let hasIssues = false;

  if (mismatches.length > 0) {
    hasIssues = true;
    log.error(`Found ${mismatches.length} path mismatch(es):`);
    for (const m of mismatches) {
      console.log(`  ${m.id}:`);
      console.log(`    Expected: ${m.expected}`);
      console.log(`    Actual:   ${m.actual}`);
    }
  }

  if (missing.length > 0) {
    hasIssues = true;
    log.warn(`Found ${missing.length} lesson(s) not in modules.ts:`);
    for (const m of missing) {
      console.log(`  ${m.id} → ${m.path}`);
    }
  }

  if (extra.length > 0) {
    hasIssues = true;
    log.warn(`Found ${extra.length} path(s) in modules.ts with no matching file:`);
    for (const e of extra) {
      console.log(`  ${e.id} → ${e.path}`);
    }
  }

  if (!hasIssues) {
    log.success('All paths are in sync!');
    process.exit(0);
  }

  // Validate mode - exit with error if issues found
  if (flags.validate) {
    log.error('Validation failed. Run "node scripts/sync-modules.js --write" to fix.');
    process.exit(1);
  }

  // Write mode - regenerate modules.ts
  if (flags.write) {
    console.log('');
    log.info('Regenerating modules.ts...');

    const newContent = generateModulesTs();
    fs.writeFileSync(MODULES_FILE, newContent);

    log.success(`Updated ${MODULES_FILE}`);
    log.info('Paths are now synced with content files.');
  } else {
    console.log('');
    log.info('Run with --write to update modules.ts');
  }
}

main();
