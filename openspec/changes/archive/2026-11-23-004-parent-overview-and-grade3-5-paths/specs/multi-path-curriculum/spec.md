## Purpose
Organize Khmer math lessons across multiple unrestricted learning paths spanning Grades 1–5 (Early Foundations, Geometry, and Fractions & Decimals) without rigid grade locking.

## ADDED Requirements

### Requirement: Unrestricted Multi-Path Navigation
The system SHALL present Early Foundations, Geometry, and Fractions & Decimals paths on `/learn` and allow any learner to open any lesson regardless of advisory grade level.

#### Scenario: Learner switches to Geometry or Fractions path freely
- **GIVEN** a learner registered with advisory Grade 1 on `/learn`
- **WHEN** the learner selects the Geometry or Fractions & Decimals path tab
- **THEN** all lessons in the selected path appear unlocked and open directly in `<LessonPlayer />`
