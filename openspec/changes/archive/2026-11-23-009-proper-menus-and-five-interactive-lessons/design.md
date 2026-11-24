# Design: 009-proper-menus-and-five-interactive-lessons

## 1. Global Khmer Navigation Menu (`AppNavigation`)
- **Placement**: Mounted inside `<LearnerProvider>` in `src/app/layout.tsx` so navigation persists seamlessly without duplicating menu markup across 8 routes.
- **Focus-Mode Auto-Hide**: Uses `usePathname()`. Returns `null` when `pathname.startsWith("/learn/")` (active lesson player) or `pathname.startsWith("/onboarding")` so child focus during interactive steps is never interrupted and bottom/top nav never overlaps manipulatives.
- **Responsive Layout**:
  - **Mobile (`< 640px`, tested at `360x800`)**: Fixed warm-ivory bottom navigation bar (`z-30`, height `64px`, `border-t border-border bg-surface/95 backdrop-blur`) with 5 equal-width `>= 44x44px` controls: `មេរៀន`, `ក្ដារលេង`, `សួនគណិត`, `ប្រចាំថ្ងៃ`, and `ម៉ឺនុយ` (`aria-expanded`, opens an accessible popover sheet above the bar with `/review`, `/parent`, `/admin`, `/`).
  - **Desktop (`>= 640px`)**: Compact, floating centered bottom/dock pill bar (`max-w-xl mx-auto bottom-4 rounded-3xl shadow-md`) so existing sticky page headers stay uncluttered and consistent across breakpoints!
- **Accessibility & Contrast**:
  - All SVG icons are `aria-hidden="true"`, labels are concise Khmer nouns (`1`–`2` words), active item sets `aria-current="page"` and high-contrast `bg-accent text-white` (`> 5:1`).
  - Escape key closes the More Menu popover; clicking any menu link closes the popover cleanly.
  - A `<div aria-hidden="true" className="h-24 shrink-0" />` spacer renders at the bottom of the layout whenever `AppNavigation` is active so scrolled page content and interactive buttons are never obscured by the fixed bottom bar (WCAG 2.2 SC 2.4.11).

## 2. Five New Interactive Lessons
All 5 lessons strictly obey `LessonDocumentV1Schema`, use 4 steps each (`concrete` → `iconic` → `symbolic`), include 3 ordered hints (`visual-cue` → `strategy-nudge` → `worked-step`), and receive pre-generated offline Khmer MP3 audio via `npm run generate:audio`:
1. `content/paths/geometry-foundations/g06-rectangles-and-area-design.json` (order 6, G4)
2. `content/paths/geometry-foundations/g07-angkor-symmetry-and-shapes.json` (order 7, G5)
3. `content/paths/early-foundations/l11-khmer-market-change-and-place-value.json` (order 11, G2)
4. `content/paths/fractions-and-decimals/f05-halves-quarters-and-draw-fractions.json` (order 5, G4)
5. `content/paths/multiplication-and-algebra/m05-skip-counting-and-mystery-puzzles.json` (order 5, G4)
