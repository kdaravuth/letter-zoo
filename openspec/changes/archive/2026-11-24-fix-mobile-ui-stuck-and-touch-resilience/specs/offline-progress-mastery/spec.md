# offline-progress-mastery Specification Delta

## ADDED Requirements

### Requirement: Resilient Mobile Cache And Storage Fallback
The system SHALL keep mobile browser sessions responsive by preventing stale Service Worker precache manifests or dynamic route templates from serving broken script chunks, automatically clearing outdated Service Worker registrations in development or on chunk errors, and bounding local storage operations with a non-blocking in-memory fallback when IndexedDB is unavailable or stalled.

#### Scenario: Mobile browser recovers cleanly without stale Service Worker freeze
- **GIVEN** a mobile phone browser opening the application after a build update or during local development
- **WHEN** the page initializes
- **THEN** the application loads current client bundles without 404 precache failures on dynamic route templates and hydrates all interactive controls

#### Scenario: Lesson step completion proceeds when mobile IndexedDB is restricted
- **GIVEN** a mobile browser or in-app WebView where IndexedDB open or write operations are blocked or delayed
- **WHEN** the learner checks a valid step answer and taps "បន្តទៅមុខ" (Continue)
- **THEN** step progression and lesson completion resolve within a bounded timeout using in-memory session state without freezing the UI
