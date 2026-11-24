## ADDED Requirements

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
