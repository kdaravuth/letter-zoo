# Tasks: 005-admin-content-studio

## 1. ZWSP Audit Engine & Server Actions
- [x] 1.1 Implement `src/lib/khmer/zwspAudit.ts` (`auditLessonObjectZwsp`, `stripAllZwspFromJson`) with Vitest unit tests.
- [x] 1.2 Implement `src/app/actions/lessons.ts` (`verifyAdminPasscode`, `publishLessonAction`) validating against `LessonDocumentV1Schema` and persisting to PostgreSQL `lessons` via Drizzle ORM (with local-only fallback).

## 2. Khmer Admin Lesson Studio UI
- [x] 2.1 Build `/admin` (`src/app/admin/page.tsx` + `AdminStudioClient.tsx`) with passcode gate, lesson selector, live Zod validation, ZWSP audit + sanitizer, live `<ActivityRenderer />` preview, JSON download, and draft/publish controls.

## 3. Verification Gates
- [x] 3.1 Add Playwright E2E + `@axe-core/playwright` (`wcag22aa`) tests covering `/admin` authentication, validation errors, ZWSP sanitization, live preview, and publish flow.
- [x] 3.2 Pass `npm run validate:content`, `npm run test:unit`, `npm run lint`, `npm run build`, `npx serwist build`, and `npm run test:e2e`.
