# activity-engine-primitives Specification Delta

## MODIFIED Requirements

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
