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

| ID | Name | Status | Screenshots |
|----|------|--------|-------------|
| ST-00 | Timeline/Dashboard | documented | 2 |
| ST-01 | Lesson Start Modal | documented | 1 |
| ST-02 | Video Vocabulary | documented | 2 |
| ST-03 | Fill Gap Drag-Drop | documented | 1 |
| ST-04 | Answer Feedback + Tip | documented | 1 |
| ST-05 | Lesson Completion | documented (pass-through) | 1 |
| ST-06 | Fill-in-Blank (Single) | - | - |
| ST-07 | Fill-in-Blank (Multiple) | documented | 1 |
| ST-08 | Word Order (Phrase Builder) | documented | 1 |
| ST-09 | Multiple Choice (MCQ) | documented | 1 |
| ST-10 | Matching Pairs (Matchup) | documented | 1 |
| ST-11 | Conversation (Community) | documented (pass-through) | 1 |
| ST-12 | Listening Exercise | - | - |
| ST-13 | Speaking Exercise | - | - |
| ST-14 | True/False | documented | 1 |
| ST-15 | Translation | - | - |
| ST-16 | Typing Exercise | documented | 1 |
| ST-17 | Spelling (Letter Order) | documented | 1 |
| ST-18 | Word Completion | documented | 1 |
| ST-19 | Review Dashboard | documented (pass-through) | 1 |
| ST-20 | Video Comprehension | documented | 1 |

*Status: `documented` | `partial` | `-` (not started)*

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
