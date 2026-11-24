## Purpose
Render interactive mathematical manipulatives from decoupled JSON definitions while meeting child motor accessibility and WCAG 2.2 Level AA standards.

## ADDED Requirements

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
