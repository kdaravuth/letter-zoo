## ADDED Requirements

### Requirement: Spoken Hints, Lesson Scratchpad, And Printable Khmer Certificate
The system SHALL provide spoken Khmer read-aloud buttons on revealed hints and explanations, a toggleable on-screen doodle scratchpad inside `<LessonPlayer />` that preserves active step state, and an offline print-ready Khmer Achievement Certificate accessible from `/parent` and `/garden`.

#### Scenario: Child opens scratchpad and hears spoken hint during a lesson
- **GIVEN** a learner solving a lesson step on a 360x800 viewport
- **WHEN** the learner toggles the scratchpad open, draws or taps tallies, and reveals a hint
- **THEN** the active step state remains intact, the hint displays a spoken Khmer read-aloud button, and zero WCAG 2.2 AA violations occur

#### Scenario: Parent previews printable Khmer Achievement Certificate
- **GIVEN** a parent or learner viewing `/garden` or unlocked `/parent`
- **WHEN** they open the Achievement Certificate preview
- **THEN** the Khmer certificate renders the child's name, mastered stats, and print action with zero WCAG 2.2 AA violations
