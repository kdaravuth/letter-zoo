# Tasks: 008-geometry-drawing-game

## 1. Pure Geometry Math & Schema Extensions
- [x] 1.1 Implement `src/lib/math/geometryDraw.ts` (`analyzeDrawnPolygon`, `computeMirrorCells`, `checkSymmetryMirror`) with Vitest unit tests.
- [x] 1.2 Extend `ActivityStepSchema`, `gradeStep()`, and `scripts/validate-content.ts` with the 9th primitive `geometry-draw`.

## 2. GeometryDraw SVG Component, Lesson g05 & /play Drawing Game
- [x] 2.1 Implement Safari-safe `<GeometryDraw />` (`src/components/activities/GeometryDraw.tsx`) with dual tap + drag input and `>= 56x56 px` targets, wired into `<ActivityRenderer />`.
- [x] 2.2 Author `content/paths/geometry-foundations/g05-drawing-shapes-and-symmetry.json` and generate native Khmer MP3 audio (`npm run generate:audio`).
- [x] 2.3 Add the **គូររូបគណិត** Drawing Game mode to `/play` (`PlayStudioClient.tsx`).

## 3. Verification Gates
- [x] 3.1 Expand Playwright E2E + `@axe-core/playwright` (`wcag22aa`) tests covering Lesson `g05` and `/play` Drawing Game at `360x800`.
- [x] 3.2 Pass `npm run validate:content`, `npm run test:unit`, `npm run lint`, `npm run build`, `npx serwist build`, and `npm run test:e2e`.
