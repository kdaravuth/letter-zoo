# Design: 002-remaining-primitives-and-path

## Architecture Extensions

1. **Four Additional Safari-Safe Dual-Input SVG Primitives**
   - `comparison-balance` (`src/components/activities/ComparisonBalance.tsx`): Inline SVG two-pan scale or side-by-side comparison bars with `<`, `>`, `=` tiles (and balance-weight tiles for equivalence mode). Zero `<foreignObject>`.
   - `array-groups` (`src/components/activities/ArrayGroups.tsx`): Inline SVG equal-groups baskets or interactive `rows × cols` rectangular grid with `>= 56x56 px` stepper controls and live total toggle.
   - `fraction-bar-shape` (`src/components/activities/FractionBarShape.tsx`): Inline SVG partitionable fraction bar/circle with clickable `>= 56x56 px` segments, optional partition switcher (`2` / `4` parts to explore `1/2 = 2/4`), optional synced `0–1` number line, and 2D polygon identification mode (triangle, square, rectangle, circle).
   - `pattern-sequence` (`src/components/activities/PatternSequence.tsx`): Inline SVG *ក្រមា* woven stripe tiles, 2D shape sequences, and skip-counting number slots supporting both pointer drag and tap-to-select + tap-to-place.

2. **Schema & Pure Deterministic Grader Extensions**
   - Extend `ActivityStepSchema` in `src/lib/curriculum/schema.ts` with `ComparisonBalanceStepSchema`, `ArrayGroupsStepSchema`, `FractionBarShapeStepSchema`, and `PatternSequenceStepSchema`.
   - Extend `gradeStep()` in `src/lib/math/grader.ts` with reduced rational equivalence (`n / d === expectedN / expectedD`), commutativity-aware array grading, operator/balance equality, and ordered pattern slot verification—all with Khmer/Arabic digit and `U+200B` ZWSP normalization.
   - Extend `scripts/validate-content.ts` to validate all 8 primitives across all 10 lessons.

3. **Calm Informational Mastery Badges**
   - Compute badges purely from local IndexedDB progress in `src/lib/math/badges.ts` (zero loot boxes, zero virtual storefronts, zero timers):
     - *ជំហានដំបូង* (First lesson completed)
     - *ម្ចាស់បង្គ្រប់ ១០* (Completed L7 Making 10)
     - *អ្នករុករកលំនាំ និងរូបភាព* (Completed L9 Patterns & Shapes)
     - *អ្នកជំនាញរូបិយវត្ថុ និងប្រភាគ* (Completed L10 Riel & Halves)
     - *គ្រឹះគណិតរឹងមាំ* (Completed at least 5 lessons in Early Foundations)
   - Display badges calmly in a compact strip on `/learn`.
