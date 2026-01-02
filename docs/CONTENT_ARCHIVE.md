# Content Archive Reference

> **Archived:** 2026-01-02
> **Reason:** Transitioning to new Content Fusion pipeline (Babbel + Busuu merge)

---

## Archived Content Location

```
/Volumes/External_ssd_mohsen/WorkspaceExtern/content-archive/
├── legacy-v1/               # Original 35 lessons (before fusion)
│   ├── A1/                  # 23 lessons
│   └── A2/                  # 12 lessons
├── babbel-raw/              # Babbel extractor output
└── busuu-raw/               # Busuu screen-flow-mapper output
```

---

## Legacy Content Summary (v1)

| Level | Lessons | Status |
|-------|---------|--------|
| A1 | 23 | Archived |
| A2 | 12 | Archived |
| **Total** | 35 | |

These lessons were created from:
- Textbook content (Menschen, Schritte)
- Manual Persian translations
- Some Busuu integration

---

## New Content Pipeline (v2)

The new content is generated using:

1. **Babbel Source** (232 lessons)
   - Location: `scripts/babbel-extractor/output/`
   - Levels: A1.1, A1.2, A2.1, A2.2, B1, B2

2. **Busuu Source** (482 lessons)
   - Location: `scripts/screen-flow-mapper/output/`
   - Levels: A1, A2, B1, B2

3. **Content Fusion Agent**
   - Merges both sources
   - Adds Persian translations
   - Inserts games every 5-7 steps
   - See: `scripts/content-fusion-agent.md`

---

## How to Access Archived Content

```bash
# View archived lessons
ls /Volumes/External_ssd_mohsen/WorkspaceExtern/content-archive/legacy-v1/

# Copy a specific lesson back if needed
cp /Volumes/External_ssd_mohsen/WorkspaceExtern/content-archive/legacy-v1/A1/module-01/A1-1-M01-L01.json \
   content/de-fa/A1/module-01/
```

---

## Why We Archived

1. **Richer Source Data**: Babbel + Busuu combined provide more vocabulary and exercises
2. **Game Integration**: New pipeline adds games every 5-7 steps
3. **Consistency**: All levels (A1-B2) will follow the same structure
4. **Quality**: Automated validation (27 rules) ensures consistency

---

## Restoration (If Needed)

To restore all archived content:

```bash
# WARNING: This will overwrite any new content!
cp -r /Volumes/External_ssd_mohsen/WorkspaceExtern/content-archive/legacy-v1/A1 content/de-fa/
cp -r /Volumes/External_ssd_mohsen/WorkspaceExtern/content-archive/legacy-v1/A2 content/de-fa/
```
