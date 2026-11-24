# Design: 005-admin-content-studio

## Architecture Decisions

1. **Server-Side Authentication & Publishing (`src/app/actions/lessons.ts`)**
   - Validate admin passcode via `verifyAdminPasscode` against `process.env.ADMIN_STUDIO_PASSCODE` (defaulting to `"konleuh-admin"` for local development/testing).
   - Expose `publishLessonAction` which re-validates the submitted JSON string with `LessonDocumentV1Schema`, blocks stray `U+200B` characters in identifier fields, and upserts into the Drizzle PostgreSQL `lessons` table (`draft` or `published`) when `DATABASE_URL` is configured, or returns a validated local-only confirmation when `DATABASE_URL` is unset.

2. **ZWSP (`U+200B`) Audit & One-Tap Sanitizer (`src/lib/khmer/zwspAudit.ts`)**
   - Recursively inspect parsed lesson JSON for `U+200B` characters, distinguishing identifier/solution keys (blocking) from Khmer prose fields (advisory) and offering a one-tap sanitizer.

3. **Live Interactive Preview (`/admin` -> `AdminStudioClient.tsx`)**
   - Reuse `<ActivityRenderer />` directly inside the Admin Studio preview pane so authors can switch steps, toggle `១២៣` / `123`, and test touch interactions immediately on any schema-valid JSON draft without duplicating rendering code.
