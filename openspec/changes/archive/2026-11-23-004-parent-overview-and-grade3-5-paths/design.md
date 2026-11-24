# Design: 004-parent-overview-and-grade3-5-paths

## Architecture Decisions

1. **Multi-Path Curriculum Without Grade Locking (`src/lib/curriculum/loader.ts`, `LearningPathClient.tsx`)**
   - Expose `getAllLearningPaths()` loading `early-foundations` (10 lessons), `geometry-foundations` (3 lessons), and `fractions-and-decimals` (3 lessons) from `content/paths/`.
   - Render accessible path switcher tabs on `/learn` so any child aged 6–12 can explore higher or lower topics freely regardless of advisory grade.

2. **Grades 3–5 Conceptual Modeling Lessons**
   - Geometry lessons use `fraction-bar-shape` (2D polygon sides), `array-groups` (rectangular area grids), `comparison-balance` (area/perimeter comparisons), and `scenario-choice` (`worked-error-check`).
   - Fractions & Decimals lessons use `fraction-bar-shape` (equivalent bars + synced `0–1` line), `number-line` (step `0.1` tenths from `0` to `1`), and `scenario-choice` (`worked-error-check` targeting the `0.5 > 0.35` decimal misconception).

3. **PIN / Adult Math-Gated Parent Progress Dashboard (`/parent`)**
   - Compute caregiver insights purely in `src/lib/math/parentReport.ts`: completed lessons per path, strengths (*ចំណុចខ្លាំង* — `proficient`/`mastered` or `>= 85%` accuracy), practice recommendations (*គួរអនុវត្តបន្ថែម* — `attempted` or `< 80%` accuracy or overdue Leitner review), and weekly active days.
   - Gate `/parent` behind an adult math check (`7 × 8 = 56`, accepting Khmer `៥៦` or Arabic `56` via `normalizeNumericInput`) or an optional caregiver-configured 4-digit PIN stored locally in `localStorage`.
