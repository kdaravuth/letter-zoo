# Design: 010-clock-charts-scratchpad-and-certificate

- **Pure Math Engine (`src/lib/math/clockAndChart.ts`)**: `normalizeHour12`, `normalizeMinute`, `formatClockTime`, `gradeClockValues`, `gradeDataChartBars` (with ZWSP & Khmer numeral normalization via `normalizeNumericInput`).
- **Schema & Grader**: Extend `ActivityStepSchema` in `src/lib/curriculum/schema.ts`, `gradeStep()` in `src/lib/math/grader.ts`, `<ActivityRenderer />`, and `scripts/validate-content.ts` with `clock-time` and `data-chart`.
- **Safari-Safe Inline SVGs (zero `<foreignObject>`, `>= 56x56 px` `.manipulative-target`)**:
  - `ClockTime.tsx`: 12-hour analog Khmer clock (`viewBox="0 0 280 280"`) with clickable hour markers + `>= 56x56px` hour/minute controls and quick `:00/:15/:30/:45` chips.
  - `DataChart.tsx`: Animated SVG bar chart (`viewBox="0 0 320 210"`) with `>= 56x56px` `-`/`+` bar controls (for `build-bars`) or category selection tiles (for `read-bar`).
  - `LessonScratchpad.tsx`: Toggleable freehand SVG polyline + tap-tally scratchpad (`viewBox="0 0 320 180"`) that preserves step state.
  - `AchievementCertificate.tsx`: Print-friendly Khmer certificate (`@media print` hides navigation chrome and centers `.certificate-printable`).
