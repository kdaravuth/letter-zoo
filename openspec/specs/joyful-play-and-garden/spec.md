# joyful-play-and-garden Specification

## Purpose
Provide joyful, calm, non-manipulative tactile play experiences—including a Living Khmer Learning Garden, an interactive Cambodian Market Stall & Krama Pattern Weaver, and musical micro-celebrations—that deepen intrinsic mathematical delight for children aged 6–12.

## Requirements

### Requirement: Living Khmer Learning Garden
The system SHALL render an interactive inline SVG Cambodian garden at `/garden` whose ripe mangoes, blooming lotus flowers, and butterflies grow organically from locally persisted lesson mastery without loot boxes or virtual storefronts.

#### Scenario: Child interacts with growing garden elements
- **GIVEN** a child visiting `/garden` on a 360x800 mobile viewport
- **WHEN** the child taps interactive garden controls (mango orchard, frog hop, or lotus bloom)
- **THEN** the garden animates calmly, updates the Khmer counter, and passes WCAG 2.2 Level AA checks

### Requirement: Interactive Market Stall And Krama Weaver
The system SHALL provide a zero-timer math play studio at `/play` allowing children to fulfill Cambodian Market Stall fruit and Riel orders and weave custom Krama patterns with automatic mathematical pattern detection.

#### Scenario: Child completes a Market Stall order and weaves a Krama pattern
- **GIVEN** a child opening `/play`
- **WHEN** the child packs the requested fruit count and exact Riel banknote sum and submits
- **THEN** the stall celebrates calmly in Khmer and serves the next order
- **WHEN** the child switches to Krama Pattern Weaver and weaves an AB repeating sequence across 8 slots
- **THEN** the system detects and names the repeating pattern (`AB`) with zero WCAG 2.2 AA violations

### Requirement: Frog Pond Jump And Mystery Balance Games
The system SHALL include zero-timer Frog Pond Target Jump and Mystery Balance Scale interactive games in `/play` using Safari-safe inline SVG and `>= 56x56 px` touch targets.

#### Scenario: Child solves Frog Pond Jump and Mystery Balance Scale
- **GIVEN** a child visiting `/play` at 360x800 mobile viewport
- **WHEN** the child switches to Frog Pond Target Jump and hops the frog onto the target lotus pad
- **THEN** the game celebrates calmly in Khmer with zero WCAG 2.2 AA violations
- **WHEN** the child switches to Mystery Balance Scale and selects the stone that balances both pans
- **THEN** the SVG beam levels cleanly and unlocks the next puzzle

### Requirement: Interactive Math Drawing Game In Play Studio
The system SHALL offer a zero-timer Math Drawing Studio mode in `/play` where children draw geometric shapes on a pegboard with selectable colors and paint Cambodian mirror-symmetry art templates.

#### Scenario: Child draws a shape and symmetry art in /play
- **GIVEN** a child opening `/play` and selecting the Math Drawing tab
- **WHEN** the child completes a pegboard shape challenge or mirror-symmetry canvas via taps
- **THEN** the studio celebrates calmly in Khmer with zero WCAG 2.2 AA violations

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
