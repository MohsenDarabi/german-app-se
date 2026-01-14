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

**Phase 1.1: Set up Cloudflare R2 bucket**

1. Go to https://dash.cloudflare.com
2. Navigate to R2 > Create bucket
3. Name: `language-learning-assets`
4. Get credentials:
   - Account ID
   - Access Key ID
   - Secret Access Key

Then provide these to Claude to continue with the upload script.

---

## Cost Summary

| Users | R2 | Supabase | HeyGen | Total |
|-------|----|---------:|-------:|------:|
| 2,000 | $0 | $25 | $24 | ~$49/mo |
| 100,000 | ~$104 | $25 | $24 | ~$153/mo |
