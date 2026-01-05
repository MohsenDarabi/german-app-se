# Curriculum Scope System

This directory contains the **canonical scope definitions** for the German Learning App content.

## Purpose

Prevent AI agents from:
- Introducing vocabulary before it's taught
- Using grammar concepts prematurely (e.g., W-Fragen before accusative case)
- Using too many characters (cognitive overload)

## Files Created

```
curriculum/
├── canonical-scope.json                    # Master scope: 60 A1 lessons defined
├── official-sources/
│   ├── goethe-a1-wordlist.json            # 676 official Goethe A1 words
│   └── grammar-progression-reference.json  # 65-lesson grammar progression
├── resource-mapping/
│   ├── babbel-a1-scope.json               # 91 lessons, 726 unique words
│   └── busuu-a1-scope.json                # 168 lessons, 1397 unique words
└── characters/
    └── character-registry.json             # Lisa, Theo, Max, Sophie, etc.
```

## Hierarchy

```
Level (A1, A2, B1, B2)
└── بخش (Section) - 15 per level, 4 lessons each
    └── درس (Lesson) - Individual learning unit
```

## Key Rules

1. **W-Fragen timing** - Only after lesson L33 (accusative case must be taught first)
2. **Characters** - Lisa & Theo for 2-person scenes; add Max/Sophie for 3+ people
3. **Vocabulary** - Max 15 new words per lesson
4. **Grammar** - One new concept per lesson maximum
5. **Function words** - der/die/das, und, ist, ich, du always allowed

## Usage

### Before creating any lesson:
```bash
# 1. Check allowed scope for your lesson
cat ai-workspace/curriculum/canonical-scope.json | jq '.sections[0].lessons[0]'

# 2. Create the lesson

# 3. Validate against scope
node scripts/validate-scope.js content/de-fa/A1/module-XX/A1-MXX-LYY.json
```

### Quick validation example:
```bash
# Validate L01
node scripts/validate-scope.js content/de-fa/A1/module-01/A1-M01-L01.json

# Validate all A1 lessons
node scripts/validate-scope.js content/de-fa/A1/**/*.json
```

## Grammar Progression (Key Milestones)

| Lessons | Grammar Topics |
|---------|----------------|
| 1-8 | Vocabulary only (greetings, feelings) |
| 7-8 | du vs. Sie |
| 13-16 | Verb conjugation (sein, haben, regular, irregular) |
| 17-20 | Negation (nicht, kein) |
| 21-24 | Articles + Possessives |
| 29-32 | **Accusative case** |
| 33-36 | **W-Fragen** (Was, Wo, Wer...) ← ONLY HERE! |
| 41-44 | Dative case |
| 45-48 | Separable verbs |
| 49-52 | Modal verbs |
| 53-56 | Perfekt (past tense) |

## Character Usage

| Scene Type | Characters to Use |
|------------|-------------------|
| 2-person dialogue | Lisa, Theo |
| 3-person scene | Lisa, Theo + Max or Sophie |
| 4-person scene | Lisa, Theo, Max, Sophie |
| Persian perspective | Sara or Amir |

## Scripts

| Script | Purpose |
|--------|---------|
| `scripts/validate-scope.js` | Validate lesson against canonical scope |
| `scripts/extract-babbel-scope.js` | Extract vocabulary from Babbel lessons |
| `scripts/extract-busuu-scope.js` | Extract vocabulary from Busuu lessons |

## Sources

- [Goethe A1 Wortliste](https://www.goethe.de/pro/relaunch/prf/de/A1_SD1_Wortliste_02.pdf) - Official exam vocabulary
- [Learn German Original A1](https://learngermanoriginal.com/courses/a1-course/) - 65-lesson grammar progression
- [Menschen A1 Grammar](https://www.scribd.com/document/941272262/Menschen-A1-Grammar-Detailed-Units-1-6) - Detailed grammar reference
