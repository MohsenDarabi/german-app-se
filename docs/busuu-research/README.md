# Busuu Screen Flow Research

> **Purpose:** Document every screen type in Busuu's learning flow to build accurate extraction patterns.

## Two Approaches in This Project

| Approach | Purpose | Location | Status |
|----------|---------|----------|--------|
| **A: Current Extractor** | Extract content for app | `scripts/busuu-extractor/` | Production |
| **B: Screen Flow Mapper** | Document flow for accuracy | `scripts/screen-flow-mapper/` | Research |

This folder supports **Approach B** - building ground truth documentation.

---

## Screen Types Index

| ID | Name | `data-qa-ex` | Status |
|----|------|--------------|--------|
| ST-00 | Timeline/Dashboard | (navigation) | documented |
| ST-01 | Lesson Start Modal | (modal) | documented |
| ST-02 | Video Vocabulary | `ex-flashcard` | documented |
| ST-03 | Fill Gap Drag-Drop | `ex-fillgap-dragdrop` | documented |
| ST-04 | Answer Feedback + Tip | `feedback-footer` | documented |
| ST-05 | Lesson Completion | (pass-through) | documented |
| ST-07 | Fill-in-Blank (Multiple) | `ex-fillgap-dragdrop` | documented |
| ST-08 | Word Order (Phrase Builder) | `ex-phrase-builder` | documented |
| ST-09 | Multiple Choice (MCQ) | `ex-mcq` | documented |
| ST-10 | Matching Pairs (Matchup) | `ex-matchup` | documented |
| ST-11 | Conversation (Community) | `ex-conversation` | pass-through |
| ST-14 | True/False | `ex-true-false` | documented |
| ST-16 | Typing Exercise | `ex-typing` | documented |
| ST-17 | Spelling (Letter Order) | `ex-spelling` | documented |
| ST-18 | Word Completion | `ex-spelling` | documented |
| ST-19 | Review Dashboard | (navigation) | pass-through |
| ST-20 | Video Comprehension | `ex-comprehension` | documented |
| ST-21 | Grammar Tip | `ex-tip` | documented |

**Total: 18 screen types documented** (15 extractable, 3 pass-through)

### Exercise Types by `data-qa-ex`

| `data-qa-ex` | Screen Type | Extract? |
|--------------|-------------|----------|
| `ex-flashcard` | Vocabulary card | Yes |
| `ex-fillgap-dragdrop` | Fill gap (single/multiple) | Yes |
| `ex-phrase-builder` | Word order | Yes |
| `ex-mcq` | Multiple choice | Yes |
| `ex-matchup` | Matching pairs | Yes |
| `ex-true-false` | True/False | Yes |
| `ex-typing` | Typing | Yes |
| `ex-spelling` | Spelling / Word completion | Yes |
| `ex-comprehension` | Video dialog | Yes |
| `ex-tip` | Grammar tip | Yes |
| `ex-conversation` | Community exercise | Skip |

---

## Folder Structure

```
docs/busuu-research/
├── README.md                 # This file - index
├── screen-types/
│   ├── ST-01-vocabulary-card.md
│   ├── ST-02-grammar-tip.md
│   └── ...
└── screenshots/
    ├── ST-01/
    │   ├── a.png
    │   └── b.png
    └── ...
```

---

## How to Add a New Screen Type

1. User provides screenshot
2. Save to `screenshots/ST-XX/a.png`
3. Create `screen-types/ST-XX-name.md` using template
4. Update this README index
5. Document DOM selectors from browser inspection

---

## Screen Type Document Template

```markdown
# ST-XX: Screen Type Name

## Screenshots
- `ST-XX/a.png` - Description

## User Action
What the user does on this screen

## Content to Extract
- Field 1
- Field 2

## DOM Selectors
Key HTML elements and data attributes

## Detection Strategy
How to identify this screen type

## Known Issues
Problems with current extractor (Approach A)
```

---

## Reference

- Current extractor: `/scripts/busuu-extractor/extractor.js`
- Plan file: `/Users/mohsendarabi/.claude/plans/kind-rolling-hellman.md`
