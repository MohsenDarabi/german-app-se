# Current Task: R2 CDN Integration

> **Branch:** `feature/r2-cdn-integration`
> **Status:** Just started
> **Last Updated:** 2026-01-14

---

## Resume Instructions

```bash
git checkout feature/r2-cdn-integration
# Then tell Claude: "continue with the R2 CDN integration plan"
```

---

## Progress

### Phase 1: Cloudflare R2 Setup
- [ ] Set up Cloudflare R2 bucket
- [ ] Install @aws-sdk/client-s3 for R2 uploads
- [ ] Create upload-to-r2.js script
- [ ] Test upload with --dry-run

### Phase 2: Asset Service Layer
- [ ] Create assetService.ts
- [ ] Modify audio.ts for CDN
- [ ] Modify asset-resolver.ts for CDN

### Phase 3: Service Worker Changes
- [ ] Update caching strategy for hash-based audio
- [ ] Add premium-aware logic

### Phase 4: Premium System
- [ ] Add premium fields to DB
- [ ] Create premium store
- [ ] Create nativeStorage service

### Phase 5: Multi-Language UI
- [ ] Create languages page
- [ ] Add language switcher

### Phase 6: Content Structure Changes
- [ ] Restructure for R2

### Phase 7: Capacitor Native Build
- [ ] Set up iOS project
- [ ] Remove bundled assets

---

## Plan Documents

1. **R2 CDN Plan:** `docs/plans/r2-cdn-integration.md`
2. **Character Voice/Video Plan:** `docs/plans/character-voice-video.md`

---

## Next Step

**Phase 1.2: Get R2 API credentials**

1. Go to https://dash.cloudflare.com → R2
2. Create bucket: `language-learning-assets`
3. Go to **Manage R2 API Tokens** → **Create API token**
4. Get credentials (store in `.env.local`)

See: `/Volumes/External_ssd_mohsen/WorkspaceExtern/planArchive/credentials.md` for account details.

---

## Cost Summary (With Cache-First Strategy)

Cache-first reduces R2 reads by 83% (500 vs 3,000 reads/user/month).

| Users | R2 | Supabase | HeyGen | Total |
|-------|----|---------:|-------:|------:|
| 10,000 | $0 | $0 | $24 | **~$24/mo** |
| 20,000 | $0 | $0 | $24 | **~$24/mo** |
| 50,000 | ~$5 | $25 | $24 | **~$54/mo** |
| 100,000 | ~$14 | $25 | $24 | **~$63/mo** |

**Free tier covers up to 20,000 users!**
