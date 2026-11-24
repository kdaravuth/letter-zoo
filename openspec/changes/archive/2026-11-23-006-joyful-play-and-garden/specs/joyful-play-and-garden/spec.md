## Purpose
Provide joyful, calm, non-manipulative tactile play experiences—including a Living Khmer Learning Garden, an interactive Cambodian Market Stall & Krama Pattern Weaver, and musical micro-celebrations—that deepen intrinsic mathematical delight for children aged 6–12.

## ADDED Requirements

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
