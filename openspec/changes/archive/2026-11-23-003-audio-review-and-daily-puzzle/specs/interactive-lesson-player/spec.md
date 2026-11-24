## ADDED Requirements

### Requirement: Khmer Audio Prompt Read-Aloud
The system SHALL provide an accessible one-tap Khmer read-aloud control for lesson prompts and a persistent audio preference toggle so emergent readers can listen to prompts without reading fatigue.

#### Scenario: Learner activates prompt read-aloud and toggles audio preference
- **GIVEN** an active lesson step on a mobile viewport
- **WHEN** the learner taps the Khmer read-aloud button on the step prompt
- **THEN** the system plays recorded step audio if present or uses Khmer speech synthesis fallback without runtime error
- **WHEN** the learner toggles the persistent audio preference control
- **THEN** the updated `audioEnabled` preference persists locally across reloads
