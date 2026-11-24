# Tasks: 001-mvp-lesson-engine

## 1. Project & Khmer Typography Foundation
- [x] 1.1 Initialize Next.js 16 + Tailwind CSS v4 + Drizzle ORM + Zod + Serwist v9.4+ config mode; confirm clean `npm run build && npx serwist build`.
- [x] 1.2 Configure Kantumruy Pro variable font, `<html lang="km">`, Khmer CSS guardrails, and Khmer/Arabic numeral normalizer + ZWSP stripper with Vitest unit tests.

## 2. Decoupled Content Engine & Local-First Data
- [x] 2.1 Implement `LessonDocumentV1Schema`, pure deterministic grader (`gradeStep`), and 4-tier mastery + Leitner scheduler with Vitest coverage.
- [x] 2.2 Implement `idb` local-first storage (`profiles`, `lessonCache`, `progress`, `syncOutbox`), Drizzle PostgreSQL schema/migrations, and Server Action sync handler.

## 3. Core Student UI & Initial Four SVG Primitives
- [x] 3.1 Build Khmer landing page, instant guest onboarding (nickname, avatar, age/grade, optional warm-up, numeral toggle), and Learning Path dashboard.
- [x] 3.2 Build `<LessonPlayer />` (calm distraction-free header, 3-tier hint drawer, visual explanation card, calm summary) and first 4 primitives (`counting-stage`, `number-line`, `place-value-blocks`, `scenario-choice`) with dual drag + tap-to-place.

## 4. Initial Content & Verification Gate
- [x] 4.1 Author and schema-validate Lessons 1, 2, 4, 5, 6, and 7 JSON files in `content/paths/early-foundations/` and `scripts/validate-content.ts`.
- [x] 4.2 Run `npm run validate:content`, `npm run test:unit`, `npm run build`, and `npm run test:e2e` (Playwright + `@axe-core/playwright` `wcag22aa` + offline persistence).
