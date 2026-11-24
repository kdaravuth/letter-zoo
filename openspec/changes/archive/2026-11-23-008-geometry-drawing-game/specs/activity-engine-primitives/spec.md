## ADDED Requirements

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
