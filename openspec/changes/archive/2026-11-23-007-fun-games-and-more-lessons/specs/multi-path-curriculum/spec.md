## ADDED Requirements

### Requirement: Four Unrestricted Learning Paths
The system SHALL organize 22 Khmer lessons across four unrestricted paths—Early Foundations, Geometry, Fractions & Decimals, and Multiplication, Division & Algebra—each with pre-generated local Khmer MP3 prompt audio.

#### Scenario: Learner opens Multiplication and Algebra path freely
- **GIVEN** a learner on `/learn`
- **WHEN** the learner selects the Multiplication, Division & Algebra path tab
- **THEN** all four lessons (`m01`–`m04`) appear unlocked and render cleanly in `<LessonPlayer />`
