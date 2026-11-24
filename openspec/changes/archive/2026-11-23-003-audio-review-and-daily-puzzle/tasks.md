# Tasks: 003-audio-review-and-daily-puzzle

## 1. Domain Logic & Schema Extensions
- [x] 1.1 Implement `src/lib/audio/khmerSpeech.ts`, `src/lib/math/reviewQueue.ts`, and `src/lib/curriculum/daily.ts` (`DailyPuzzlePackV1Schema` + date selector).
- [x] 1.2 Extend `LearnerProvider` with persistent `audioEnabled` toggle and `recordDailyPuzzleCompleted`.

## 2. Audio Controls, /review Queue & /daily Puzzle Player
- [x] 2.1 Add `<AudioReadButton />` and audio mute/unmute toggle to `<LessonPlayer />` (accessible `>= 44x44 px`, zero WCAG 2.2 AA violations).
- [x] 2.2 Build `/review` (`src/app/review/page.tsx` + `ReviewQueueClient.tsx`), `/daily` (`src/app/daily/page.tsx` + `DailyPuzzleClient.tsx`), and link both calmly from `/learn`.

## 3. Daily Visual Puzzle Content & Validation
- [x] 3.1 Author 7 culturally familiar Khmer daily visual puzzles in `content/daily/puzzles.json` and validate them in `scripts/validate-content.ts`.

## 4. Verification Gates
- [x] 4.1 Add Vitest unit tests (`src/__tests__/review-and-daily.test.ts`) and Playwright E2E + `@axe-core/playwright` (`wcag22aa`) tests for audio controls, `/daily`, and `/review`.
- [x] 4.2 Pass `npm run validate:content`, `npm run test:unit`, `npm run lint`, `npm run build`, `npx serwist build`, and `npm run test:e2e`.
