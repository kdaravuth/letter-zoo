# Tasks: 006-joyful-play-and-garden

## 1. Musical Audio, Mascot & Pure Play Logic
- [x] 1.1 Extend `src/lib/audio/chimes.ts` with pentatonic `playScaleNote`, `playWaterPlop`, and `playPatternMelody`.
- [x] 1.2 Implement pure garden growth logic (`src/lib/math/garden.ts`) and krama repeating-pattern detector (`src/lib/math/kramaPattern.ts`) with Vitest unit tests.

## 2. Tactile Lesson Micro-Delights
- [x] 2.1 Create Safari-safe inline SVG `<MascotFrog />` and `<CelebrationBurst />` and integrate them + ascending xylophone notes into `<LessonPlayer />`, `CountingStage`, and `NumberLine`.

## 3. Living Khmer Garden (/garden) & Math Play Studio (/play)
- [x] 3.1 Build `/garden` (`src/app/garden/page.tsx` + `GardenClient.tsx`) with interactive mango orchard, blooming lotus pond, butterflies, and counting frog.
- [x] 3.2 Build `/play` (`src/app/play/page.tsx` + `PlayStudioClient.tsx`) featuring the Cambodian Market Stall mini-game and Krama Pattern Weaver.
- [x] 3.3 Link `/garden` and `/play` prominently on `/learn` (`LearningPathClient.tsx`).

## 4. Verification Gates
- [x] 4.1 Expand Playwright E2E + `@axe-core/playwright` (`wcag22aa`) tests covering `/garden` interactions and `/play` Market Stall + Krama Pattern Weaver at `360x800` mobile viewport.
- [x] 4.2 Pass `npm run validate:content`, `npm run test:unit`, `npm run lint`, `npm run build`, `npx serwist build`, and `npm run test:e2e`.
