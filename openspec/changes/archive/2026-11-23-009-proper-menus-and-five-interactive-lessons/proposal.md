# Change Proposal: 009-proper-menus-and-five-interactive-lessons

## Why
As Konleuh Kanit has grown to 23 lessons, 5 interactive games, a Living Garden, Daily Puzzle, Leitner Review, Parent Dashboard, and Admin Studio, learners and parents need **proper, consistent Khmer navigation menus** across the app (instead of only isolated "back to /learn" links) plus **5 additional hands-on interactive lessons** spanning drawing, symmetry, Cambodian market money, visual fractions, and skip-counting algebra puzzles.

## What Changes
1. **Proper Global Navigation Menus (`AppNavigation`)**:
   - Add a persistent, accessible Khmer navigation component (`src/components/ui/AppNavigation.tsx`) rendered via `RootLayout` across hub pages (`/`, `/learn`, `/play`, `/garden`, `/daily`, `/review`, `/parent`, `/admin`) while automatically hiding in distraction-free focus mode during active lessons (`/learn/[lessonId]`) and `/onboarding`.
   - Desktop/tablet top pill bar + mobile fixed bottom tab bar (`>= 44x44 CSS px` touch targets, `aria-current="page"`, Safari-safe inline SVG icons) for **មេរៀន** (`/learn`), **ក្ដារលេង** (`/play`), **សួនគណិត** (`/garden`), **ប្រចាំថ្ងៃ** (`/daily`), and an expandable **ម៉ឺនុយ (បន្ថែម)** menu drawer/popover linking to **រំលឹកឡើងវិញ** (`/review`), **ផ្ទាំងឪពុកម្ដាយ** (`/parent`), **ស្ទូឌីយោមេរៀន** (`/admin`), and **ទំព័រដើម** (`/`).
   - Enhance `/learn` with a clean **Skill / Interactive Activity Filter Menu** (e.g., all lessons vs drawing/hands-on filter + per-path lesson count badges) so families can browse all 28 lessons effortlessly.
2. **5 New Interactive Lessons (20 New Steps + 20 Native Khmer MP3s)**:
   - `g06-rectangles-and-area-design` — Draw rectangles, paint area-8 garden plots, mirror-paint a lotus mosaic, and link area to `2 × 4` arrays.
   - `g07-angkor-symmetry-and-shapes` — Mirror-paint Angkor temple spires, design area-9 courtyards, draw squares, and complete Khmer temple border patterns.
   - `l11-khmer-market-change-and-place-value` — Assemble `3,500៛` Riel banknotes, build `45` with place-value blocks, hop change on a frog number line, and compare market baskets.
   - `f05-halves-quarters-and-draw-fractions` — Shade `3/4` fraction bars, paint `1/2` (8/16) and `1/4` (4/16) on a 4×4 drawing canvas, and build equivalent fractions to `2/3`.
   - `m05-skip-counting-and-mystery-puzzles` — Complete skip-counting by 5s, build `3 × 5` arrays, solve balance-scale equations (`4 + ? = 11`), and paint `3 × 4 = 12` area grids.
3. **Verification & Tests**:
   - Validate all 28 lessons + 7 daily puzzles (99 total steps, 9 primitives), pre-generate all 20 new Khmer MP3 audio files, verify WCAG 2.2 AA (`wcag22aa`) across navigation menus and new lessons at `360x800` mobile viewport.

## Impact
- Specs updated: `multi-path-curriculum`, `joyful-play-and-garden`.
- Zero regressions to offline-first IndexedDB, Khmer typography, numeral toggle, or calm pedagogy guardrails.
