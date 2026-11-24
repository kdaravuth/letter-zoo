# Spec Delta

## ADDED Requirements

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
The system SHALL distinguish intentional touch dragging from slight finger movement during taps on draggable manipulatives, paint multiple grid cells continuously during single-finger touch drags on drawing grids, and reset active drag or paint state cleanly whenever the browser cancels a pointer gesture.

#### Scenario: Slight finger wobble during tap still selects a token
- **GIVEN** a `counting-stage` step on a 360x800 touch screen
- **WHEN** a learner taps an outside token with up to 12px of inadvertent finger drift before lifting
- **THEN** the token is selected for tap-to-place rather than silently resetting as a cancelled drag
- **AND** if an OS gesture interrupts an in-progress drag via pointer cancel, the token returns cleanly to its slot and remains interactive

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
