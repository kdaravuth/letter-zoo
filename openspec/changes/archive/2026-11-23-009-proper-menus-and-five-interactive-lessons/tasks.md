# Tasks: 009-proper-menus-and-five-interactive-lessons

## 1. Global Khmer Navigation Menus
- [x] 1.1 Implement `src/components/ui/AppNavigation.tsx` (responsive primary bottom dock + expandable More Menu drawer, auto-hiding in lesson player & onboarding focus mode, WCAG 2.2 AA).
- [x] 1.2 Mount `<AppNavigation />` in `src/app/layout.tsx` and enhance `/learn` (`LearningPathClient.tsx`) with lesson counts and an interactive activity filter menu.

## 2. Author 5 New Interactive Lessons + Offline Khmer Audio
- [x] 2.1 Author `content/paths/geometry-foundations/g06-rectangles-and-area-design.json`.
- [x] 2.2 Author `content/paths/geometry-foundations/g07-angkor-symmetry-and-shapes.json`.
- [x] 2.3 Author `content/paths/early-foundations/l11-khmer-market-change-and-place-value.json`.
- [x] 2.4 Author `content/paths/fractions-and-decimals/f05-halves-quarters-and-draw-fractions.json`.
- [x] 2.5 Author `content/paths/multiplication-and-algebra/m05-skip-counting-and-mystery-puzzles.json`.
- [x] 2.6 Generate 20 native Khmer MP3 audio clips via `npm run generate:audio`.

## 3. Verification Gates
- [x] 3.1 Expand Playwright E2E tests (`e2e/mvp-lesson-engine.spec.ts`) covering global navigation menus, More Menu popover, `/learn` filter menu, and playing new interactive lessons (`g06`, `f05`, `m05`) at `360x800` with WCAG 2.2 AA Axe checks.
- [x] 3.2 Pass `npm run validate:content`, `npm run test:unit`, `npm run lint`, `npm run build`, `npx serwist build`, and `npm run test:e2e`.
