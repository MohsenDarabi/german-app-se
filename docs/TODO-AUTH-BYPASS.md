# IMPORTANT: Dev Mode Auth Bypass - FIX REQUIRED

> **Created:** 2026-01-02
> **Priority:** HIGH
> **Status:** TEMPORARY WORKAROUND

---

## What Was Done

Added authentication bypass for **dev mode only** to allow testing without login.

### Files Modified

1. **`apps/web/src/routes/+page.server.ts`**
   ```typescript
   // Changed from:
   if (!locals.user) {
     throw redirect(303, '/login')
   }

   // To:
   if (!locals.user && !dev) {
     throw redirect(303, '/login')
   }
   ```

2. **`apps/web/src/routes/learn/[pair]/[level]/[lessonId]/+page.server.ts`**
   ```typescript
   // Changed from:
   if (!locals.user) {
     throw redirect(303, '/login');
   }

   // To:
   if (!locals.user && !dev) {
     throw redirect(303, '/login');
   }
   ```

---

## Why This Was Done

- Chrome DevTools testing required access without Supabase auth cookies
- Firefox had active login session, Chrome did not
- Needed quick way to test content changes in Chrome

---

## Security Impact

- **Dev mode only** - Production (`NODE_ENV=production`) still requires auth
- `dev` is `true` only when running `pnpm run dev` locally
- Vercel/production builds have `dev = false`

---

## Proper Fix Required

### Option 1: Test User Seeding (Recommended)
Create a test user in Supabase that can be used for local development:
```bash
# Add to .env.local
DEV_TEST_EMAIL=test@example.com
DEV_TEST_PASSWORD=testpassword123
```

### Option 2: Mock Auth Provider for Dev
Create a mock Supabase client for development that returns a fake session.

### Option 3: Cookie Sync Script
Script to export auth cookies from logged-in browser and import to test browser.

---

## To Revert This Change

```bash
# In +page.server.ts (home)
- if (!locals.user && !dev) {
+ if (!locals.user) {

# In learn/.../+page.server.ts
- if (!locals.user && !dev) {
+ if (!locals.user) {

# Also remove the import:
- import { dev } from '$app/environment'
```

---

## Checklist Before Production

- [ ] Implement proper dev authentication solution
- [ ] Remove `&& !dev` bypass from both files
- [ ] Remove `import { dev }` from both files
- [ ] Test that production still requires login
- [ ] Delete this file after fix is complete
