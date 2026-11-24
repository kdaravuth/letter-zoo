## ADDED Requirements

### Requirement: Direct-Touch Living Garden Habitat
The system SHALL allow learners visiting `/garden` to tap directly on mangoes, lotus flowers, the pond frog, and butterflies inside the habitat scene to trigger immediate motion, Khmer sound bubbles, floating hearts, and musical chimes.

#### Scenario: Child taps directly on creatures and plants inside the garden scene
- **GIVEN** a child viewing `/garden` on a mobile or desktop viewport
- **WHEN** the child taps directly on the pond frog, a ripe mango, a lotus flower, or a butterfly in the habitat scene
- **THEN** the tapped element animates immediately, displays a concise Khmer speech bubble and floating heart, updates the active garden message in Khmer numerals, and passes WCAG 2.2 Level AA checks

### Requirement: Garden Friends Collection Grid
The system SHALL display a tactile collection grid below the `/garden` habitat showing unlocked garden friends with their friendship hearts and locked spotted buds/eggs with clear Khmer guidance on how to unlock them.

#### Scenario: Child views unlocked and locked garden collection cards
- **GIVEN** a child browsing `/garden`
- **WHEN** the child scrolls to the garden collection grid below the living habitat
- **THEN** unlocked garden cards display their illustration, Khmer name, and earned friendship hearts on elevated surfaces
- **AND** locked garden cards display a wobbling bud or egg icon with a Khmer hint indicating how to grow more lessons

### Requirement: Tactile Crayon Swatches And Play Cards
The system SHALL provide tactile 3D mode selector cards and circular lifted color crayon swatches with double-ring active indicators across the `/play` studio and lesson scratchpad.

#### Scenario: Child switches crayon color and game mode in Play Studio
- **GIVEN** a child opening `/play` and selecting the Math Drawing studio
- **WHEN** the child taps a circular crayon color swatch
- **THEN** the selected crayon lifts visually with a high-contrast active ring (`aria-checked="true"` or `aria-pressed="true"`), updates the drawing ink color, and passes WCAG 2.2 Level AA contrast checks
