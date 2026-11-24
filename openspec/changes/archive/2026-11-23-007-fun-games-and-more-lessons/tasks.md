# Tasks: 007-fun-games-and-more-lessons

## 1. Six New Khmer Lessons & 4th Path
- [x] 1.1 Author `m01`–`m04` (`content/paths/multiplication-and-algebra/`), `g04` (`geometry-foundations`), and `f04` (`fractions-and-decimals`).
- [x] 1.2 Generate native Khmer MP3 audio for all 18 new steps (`npm run generate:audio`) and register the 4th path in `src/lib/curriculum/loader.ts`.

## 2. Two New Play Modes in /play
- [x] 2.1 Add **Frog Pond Target Jump** and **Mystery Balance Scale** modes to `PlayStudioClient.tsx` with pure Safari-safe SVG, `>= 56x56 px` targets, and calm Web Audio feedback.

## 3. Verification Gates
- [x] 3.1 Expand Playwright E2E + `@axe-core/playwright` (`wcag22aa`) tests covering the 4th learning path and both new `/play` games at `360x800`.
- [x] 3.2 Pass `npm run validate:content`, `npm run test:unit`, `npm run lint`, `npm run build`, `npx serwist build`, and `npm run test:e2e`.
