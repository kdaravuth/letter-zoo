## ADDED Requirements

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
