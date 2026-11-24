# activity-engine-primitives Specification

## Purpose
Render interactive mathematical manipulatives from decoupled JSON definitions while meeting child motor accessibility and WCAG 2.2 Level AA standards.

## Requirements

### Requirement: Decoupled JSON Activity Rendering
The system SHALL render any schema-valid lesson JSON file using registered reusable activity components without requiring custom per-lesson frontend code.

#### Scenario: Invalid lesson JSON fails fast at validation
- **GIVEN** a lesson JSON payload missing a required hint tier or containing an unknown activity `type`
- **WHEN** content validation runs during build or load
- **THEN** schema validation rejects the payload with the exact field path error
- **AND** the lesson is blocked from publishing

### Requirement: Dual Drag And Tap-To-Place Input
The system SHALL allow every drag-based mathematical manipulative to be completed interchangeably via pointer dragging or single-pointer tap-to-select and tap-to-place.

#### Scenario: Child moves mango into ten-frame via taps only
- **GIVEN** a `counting-stage` ten-frame activity with 8 items inside and 5 items outside
- **WHEN** the learner taps an outside item (without dragging) and then taps an empty slot in the ten-frame
- **THEN** the item moves smoothly into the selected slot and updates the active count
- **AND** the action works identically on touchscreens, trackpads, and mice

### Requirement: Touch Target Size And Focus Visibility
The system SHALL size interactive manipulative tokens to at least 56x56 CSS pixels, secondary controls to at least 44x44 CSS pixels, and keep keyboard-focused controls unobscured by sticky headers.

#### Scenario: Mobile viewport meets child touch standards
- **GIVEN** a 360x800 mobile viewport running an interactive lesson
- **WHEN** automated accessibility and layout checks inspect all interactive tokens and navigation controls
- **THEN** every manipulative target measures at least 56x56 CSS pixels
- **AND** zero WCAG 2.2 Level AA violations are reported by axe-core (`wcag22aa`)

### Requirement: Eight Reusable Interactive Primitives
The system SHALL support eight schema-validated interactive primitives (`counting-stage`, `number-line`, `place-value-blocks`, `scenario-choice`, `comparison-balance`, `array-groups`, `fraction-bar-shape`, and `pattern-sequence`) rendered dynamically from lesson JSON without `<foreignObject>`.

#### Scenario: Learner compares quantities with comparison-balance
- **GIVEN** a `comparison-balance` step comparing 7 oranges against 4 oranges
- **WHEN** the learner taps the `>` operator tile and submits
- **THEN** the grader accepts the answer and displays the Khmer visual explanation
- **AND** selecting `<` or `=` provides non-punitive Khmer discrepancy feedback

#### Scenario: Learner builds equivalent fraction on fraction-bar-shape
- **GIVEN** a `fraction-bar-shape` step expecting a fraction equivalent to `1/2`
- **WHEN** the learner partitions the bar into 4 equal parts and shades 2 parts (`2/4`)
- **THEN** the grader evaluates reduced rational equivalence (`2/4 === 1/2`) and grades the answer as correct

#### Scenario: Learner completes krama pattern via tap-to-place
- **GIVEN** a `pattern-sequence` step with missing slots in a repeating krama sequence
- **WHEN** the learner taps a palette tile and taps an empty sequence slot (without dragging)
- **THEN** the tile snaps into the slot and the grader verifies ordered slot equality

### Requirement: Geometry Drawing Primitive
The system SHALL support a `geometry-draw` interactive SVG primitive (without `<foreignObject>`) enabling children to draw polygons on a pegboard (`dot-connect`), paint mirror symmetry (`symmetry-mirror`), and paint target-area figures (`area-paint`) via tap or drag with `>= 56x56 px` targets.

#### Scenario: Child draws a triangle by tapping pegboard dots
- **GIVEN** a `geometry-draw` `dot-connect` step expecting a triangle
- **WHEN** the child taps 3 non-collinear pegs in sequence and closes the loop back to the first peg
- **THEN** the SVG renders the closed filled triangle and `gradeStep()` grades the drawing as correct

#### Scenario: Child completes a mirror-symmetry drawing
- **GIVEN** a `geometry-draw` `symmetry-mirror` step with pre-painted left-half cells
- **WHEN** the child taps the exact mirrored right-half cells across the vertical symmetry axis
- **THEN** `gradeStep()` confirms exact mirror reflection and displays the Khmer explanation

### Requirement: Clock Time And Data Chart Primitives
The system SHALL support `clock-time` (interactive Khmer analog clock with `>= 56x56 px` hour/minute controls) and `data-chart` (interactive SVG bar chart builder and reader) primitives rendered dynamically without `<foreignObject>`.

#### Scenario: Child sets half-past nine on the Khmer analog clock
- **GIVEN** a `clock-time` step expecting `9:30`
- **WHEN** the child adjusts the hour and minute controls to `៩:៣០` and submits
- **THEN** `gradeStep()` accepts the time and displays the Khmer explanation

#### Scenario: Child builds a market fruit bar chart
- **GIVEN** a `data-chart` `build-bars` step specifying target heights for mangoes and oranges
- **WHEN** the child taps the `+`/`−` bar controls to match each category count
- **THEN** the inline SVG bars update live and `gradeStep()` confirms exact bar heights

### Requirement: Mobile Scroll-Safe Tap Targets
The system SHALL allow vertical and horizontal scrolling to start on tap-only buttons, option cards, and number-line ticks on touch browsers without triggering double-tap zoom, restricting full touch-scroll locking strictly to active drag handles and drawing canvases.

#### Scenario: Learner scrolls vertically while touching option buttons
- **GIVEN** a learner viewing an interactive lesson or play activity on a 360x800 touch viewport
- **WHEN** the learner swipes vertically starting on a tap-only choice button, stepper button, or clock control
- **THEN** the page scrolls smoothly without blocking the gesture
- **AND** rapid consecutive taps on stepper controls register every tap without triggering browser zoom

#### Scenario: Learner scrolls horizontally across a wide number line
- **GIVEN** a `number-line` step whose track is wider than a 360px mobile viewport
- **WHEN** the learner swipes horizontally across the tick marks
- **THEN** the number-line track scrolls horizontally
- **AND** stepping with the forward or backward buttons keeps the active marker visible inside the viewport

### Requirement: Touch Drag And Cancel Recovery
The system SHALL distinguish intentional touch dragging from slight finger movement during taps on draggable manipulatives, process rapid same-frame touch pointer sequences without dropping taps or drags, paint multiple grid cells continuously during single-finger touch drags on drawing grids, and reset active drag or paint state cleanly whenever the browser cancels a pointer gesture.

#### Scenario: Slight finger wobble during tap still selects a token
- **GIVEN** a `counting-stage` step on a 360x800 touch screen
- **WHEN** a learner taps an outside token with up to 12px of inadvertent finger drift before lifting
- **THEN** the token is selected for tap-to-place rather than silently resetting as a cancelled drag
- **AND** if an OS gesture interrupts an in-progress drag via pointer cancel, the token returns cleanly to its slot and remains interactive

#### Scenario: Rapid same-frame touch drag and tap register reliably on mobile
- **GIVEN** a `counting-stage`, `number-line`, `geometry-draw`, or scratchpad step on a 360x800 mobile touch screen
- **WHEN** a learner performs a rapid single-frame touch drag or quick tap gesture where pointer down, move, and up fire back-to-back before a render cycle completes
- **THEN** the manipulative updates its token slot, marker position, painted cell, or stroke accurately without dropping the gesture or getting stuck

#### Scenario: Single-finger touch drag paints across multiple symmetry cells
- **GIVEN** a `geometry-draw` `symmetry-mirror` or `area-paint` step on a touch browser
- **WHEN** the learner presses on one unlocked grid cell and slides their finger continuously across adjacent unlocked cells
- **THEN** every traversed unlocked cell becomes painted without scrolling the page or requiring separate lifts per cell

### Requirement: Zero-Overflow Mobile Primitives
The system SHALL render every interactive mathematical primitive (`counting-stage`, `number-line`, `place-value-blocks`, `comparison-balance`, `array-groups`, `fraction-bar-shape`, `pattern-sequence`, `scenario-choice`, `geometry-draw`, `clock-time`, and `data-chart`) at 360px viewport width with zero horizontal page overflow and non-overlapping interactive targets of at least 56x56 CSS pixels.

#### Scenario: Narrow mobile phone renders place-value and fraction controls without overlap
- **GIVEN** a 360x800 mobile viewport displaying `place-value-blocks`, `array-groups`, `counting-stage`, or `fraction-bar-shape` (including denominators >= 6)
- **WHEN** the activity renders
- **THEN** document horizontal scroll width does not exceed the 360px viewport width
- **AND** adjacent interactive buttons and fraction segments do not overlap each other while maintaining at least 56x56 CSS pixel hit targets
