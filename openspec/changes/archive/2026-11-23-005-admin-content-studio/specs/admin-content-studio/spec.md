## Purpose
Enable authenticated curriculum authors to edit, validate, ZWSP-audit, live-preview, and publish Zod-validated Khmer math lessons to PostgreSQL without writing frontend code.

## ADDED Requirements

### Requirement: Authenticated Admin Studio Access
The system SHALL gate `/admin` behind server-verified passcode authentication before exposing lesson authoring, preview, and publishing controls.

#### Scenario: Educator authenticates into Admin Studio
- **GIVEN** an educator opening `/admin`
- **WHEN** the educator submits a valid studio passcode
- **THEN** the studio unlocks with the lesson selector, JSON editor, validation summary, and live preview

### Requirement: Live Validation, ZWSP Audit And Preview
The system SHALL validate edited lesson JSON against `LessonDocumentV1Schema`, audit and sanitize `U+200B` characters, render a live interactive preview via `<ActivityRenderer />`, and publish valid lessons via Server Action.

#### Scenario: Author sanitizes ZWSP and publishes valid lesson
- **GIVEN** an authenticated author editing a lesson JSON containing stray `U+200B` characters
- **WHEN** the author activates the ZWSP sanitizer and triggers Publish
- **THEN** all `U+200B` characters are removed, schema validation passes, and the Server Action confirms persistence in PostgreSQL or local-only mode
