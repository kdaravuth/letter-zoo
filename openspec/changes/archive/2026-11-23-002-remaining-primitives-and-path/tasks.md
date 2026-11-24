# Tasks: 002-remaining-primitives-and-path

## 1. Schema, Grader & Badge Domain Logic
- [x] 1.1 Extend `ActivityStepSchema` and `gradeStep()` for `comparison-balance`, `array-groups`, `fraction-bar-shape`, and `pattern-sequence` with full Vitest unit tests.
- [x] 1.2 Add calm informational mastery badges (`src/lib/math/badges.ts`) with Vitest unit tests.

## 2. Four New Safari-Safe SVG Primitives & Dashboard Badges
- [x] 2.1 Implement `ComparisonBalance`, `ArrayGroups`, `FractionBarShape`, and `PatternSequence` with dual drag + tap-to-place, `>= 56x56 px` targets, and zero `<foreignObject>`, wired into `<ActivityRenderer />`.
- [x] 2.2 Render earned informational mastery badges on `/learn` (`LearningPathClient`).

## 3. Complete 10-Lesson Early Foundations Content
- [x] 3.1 Author Lessons 3, 8, 9, and 10 JSON files under `content/paths/early-foundations/` and extend `scripts/validate-content.ts` for all 8 primitives.

## 4. Verification Gates
- [x] 4.1 Expand Playwright E2E + `@axe-core/playwright` (`wcag22aa`) tests covering Lessons 3, 9, and 10 on `360x800` mobile viewport.
- [x] 4.2 Pass `npm run validate:content`, `npm run test:unit`, `npm run lint`, `npm run build`, `npx serwist build`, and `npm run test:e2e`.
