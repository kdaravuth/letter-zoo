# Design: 001-mvp-lesson-engine

## Architecture Overview

Konleuh Kanit (`គន្លឹះគណិត`) separates mathematical lesson content from frontend rendering using a strict Zod-validated JSON contract (`LessonDocumentV1Schema`) rendered by a single `<ActivityRenderer />` inside a calm, distraction-free `<LessonPlayer />`.

## Key Technical Decisions

1. **Khmer Typography & Numeral Engine**
   - Load `Kantumruy_Pro` (variable WOFF2) and `Noto_Sans_Khmer` via `next/font/google` (`subsets: ['khmer', 'latin']`, `display: 'swap'`), exposed as CSS variables on `<html lang="km">`.
   - Enforce `line-height: 1.7`, `letter-spacing: 0 !important`, `text-justify: auto`, and generous vertical padding (`padding-block: 0.45rem`) on interactive controls to prevent clipping of Khmer stacked *coeng* subscripts and overhead vowels.
   - Normalize numerals and strip all `U+200B` (ZWSP) characters in `src/lib/khmer/numerals.ts` prior to grading or search. Store numeral display preference (`"km" | "latn"`) locally and persist it across reloads without resetting active lesson step state.

2. **Safari-Safe Dual-Input SVG Manipulatives**
   - Build the four Milestone 1 primitives (`counting-stage`, `number-line`, `place-value-blocks`, `scenario-choice`) using inline React `<svg>` with explicit `viewBox` and unified Pointer Events (`onPointerDown`/`Move`/`Up` with `setPointerCapture`), never using `<foreignObject>`.
   - Pair every drag interaction with a first-class single-pointer **tap-to-select + tap-to-place** state machine (`selectedItemId`) satisfying WCAG 2.2 SC 2.5.7.
   - Ensure every interactive manipulative target carries `.manipulative-target` (`>= 56x56 CSS px`) and secondary buttons measure `>= 44x44 CSS px` with `scroll-margin-top: 5rem` (WCAG 2.2 SC 2.4.11).

3. **Pure Deterministic Grading & Mastery Scheduling**
   - Share `gradeStep()` (`src/lib/math/grader.ts`) between client offline evaluation, content validation (`scripts/validate-content.ts`), and server verification.
   - Implement 4-tier mastery (`not_started` -> `attempted` -> `familiar` -> `proficient` -> `mastered`) and 5-box Leitner intervals (`[1, 2, 4, 8, 16]` days) in `src/lib/math/mastery.ts`.

4. **Local-First Persistence & Optional PostgreSQL Sync**
   - Persist all learner state immediately to IndexedDB (`konleuh-kanit-db` v1 via `idb`) across four object stores: `profiles`, `lessonCache`, `progress`, and `syncOutbox`.
   - Define PostgreSQL tables (`student_profiles`, `lessons`, `student_lesson_progress`) using Drizzle ORM (`src/db/schema.ts`) and expose a Server Action (`src/app/actions/sync.ts`) that flushes the outbox when online, gracefully falling back to local-only mode when `DATABASE_URL` is unset.

5. **Offline PWA Packaging**
   - Provide `src/app/manifest.ts` and a Serwist service worker (`src/app/sw.ts`) built via `serwist.config.mjs` to precache the app shell and static lesson routes cleanly alongside Next.js 16.
