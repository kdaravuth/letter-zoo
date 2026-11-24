# សួនគណិត — Soun Kanit

**សួនគណិត (Soun Kanit — "Math Garden")** is an offline-first, Khmer-first visual mathematics web application (PWA) for Cambodian children aged 6–12 (MoEYS Grades 1–6).

## Highlights
- **32 Interactive Visual Lessons (115 Steps, 115 Offline Khmer MP3 Audio Clips)** across 5 unrestricted learning paths:
  1. គ្រឹះគណិតវិទ្យាថ្នាក់ដំបូង (Early Foundations)
  2. ធរណីមាត្រ និងផ្ទៃក្រឡា (Geometry, Drawing & Angkor Symmetry)
  3. ប្រភាគ និងចំនួនទសភាគ (Fractions & Decimals)
  4. វិធីគុណ ចែក និងពិជគណិតដំបូង (Multiplication, Division & Algebra)
  5. ពេលវេលា រង្វាស់ និងដ្យាក្រាមទិន្នន័យ (Time, Measurement & Data Charts)
- **11 Reusable Safari-Safe Inline SVG Primitives**: Counting Ten-Frame, Frog Number Line, Place-Value Blocks, Scenario/Riel Banknotes, Balance Scale, Array Groups, Fraction Bar/Shape, Krama Pattern Sequence, Geometry/Symmetry Drawing Canvas, Khmer Analog Clock, and Interactive Bar Charts.
- **6 Zero-Timer Play Studio Games (`/play`)**: Cambodian Market Stall, Krama Pattern Weaver, Frog Pond Target Jump, Mystery Balance Scale, Math Drawing Studio, and Frog's Daily Clock.
- **Living Khmer Garden (`/garden`)**, **Daily Visual Puzzle (`/daily`)**, **Leitner Review Queue (`/review`)**, **Spoken Hints & Lesson Scratchpad**, **Printable Offline Khmer Achievement Certificate**, **Parent Progress Dashboard (`/parent`)**, and **Khmer Admin Lesson Studio (`/admin`, default local passcode `soun-admin`)**.

## Development

```bash
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

## Verification Scripts
- `npm run validate:content` — Zod schema + Arabic/Khmer+ZWSP grading validation across all lessons & daily puzzles
- `npm run test:unit` — Vitest unit test suite
- `npm run lint` — ESLint
- `npm run build && npx serwist build` — Next.js 16 production build + offline PWA service worker
- `npm run test:e2e` — Playwright mobile (`360x800`) WCAG 2.2 AA (`@axe-core/playwright`) end-to-end suite
