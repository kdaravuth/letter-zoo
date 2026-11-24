# Tasks: 010-clock-charts-scratchpad-and-certificate

## 1. Primitives 10 & 11 (`clock-time`, `data-chart`)
- [x] 1.1 Create `src/lib/math/clockAndChart.ts` and extend `schema.ts`, `grader.ts`, `ActivityRenderer.tsx`, `validate-content.ts` with `clock-time` and `data-chart` + Vitest unit tests.
- [x] 1.2 Implement Safari-safe `<ClockTime />` and `<DataChart />` SVG components (`>= 56x56 px` targets, zero `<foreignObject>`).

## 2. 5th Learning Path (`time-measurement-data`) + 6th `/play` Game
- [x] 2.1 Register `time-measurement-data` in `src/lib/curriculum/loader.ts` and author `t01`–`t04` JSON lessons + generate 16 Khmer MP3 audio files.
- [x] 2.2 Add **នាឡិកាកង្កែបតូច** (Frog's Daily Clock) 6th game tab to `/play`.

## 3. Spoken Hints, Lesson Scratchpad & Printable Certificate
- [x] 3.1 Enhance `AudioReadButton.tsx` with customizable label/testId and wire spoken Khmer audio onto hints & explanations in `LessonPlayer.tsx`.
- [x] 3.2 Build `<LessonScratchpad />` and mount toggleable scratchpad in `LessonPlayer.tsx`.
- [x] 3.3 Build `<AchievementCertificate />` with `@media print` CSS and mount in `/parent` and `/garden`.

## 4. Verification Gates
- [x] 4.1 Expand Playwright E2E + Axe `wcag22aa` tests for `t01`, `t03`, `/play` Clock game, Lesson Scratchpad, Spoken Hints, and Printable Certificate at `360x800`.
- [x] 4.2 Pass `validate:content`, `test:unit`, `lint`, `build`, `serwist build`, and `test:e2e`.
