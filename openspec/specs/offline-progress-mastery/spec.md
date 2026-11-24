# offline-progress-mastery Specification

## Purpose
Persist student profiles, lesson completion, 4-tier mastery states, and Leitner review dates locally first so learning continues seamlessly across spotty or offline connections.

## Requirements

### Requirement: Local-First Progress And Outbox Sync
The system SHALL persist every completed lesson step immediately to IndexedDB and queue server synchronization without blocking UI navigation when offline.

#### Scenario: Learner finishes lesson while offline
- **GIVEN** a learner whose device loses internet connectivity mid-lesson after loading the learning path
- **WHEN** the learner completes the remaining steps and finishes the lesson
- **THEN** all interactions, deterministic grading, and hints execute normally offline
- **AND** completion state and mastery tier save locally in IndexedDB
- **AND** queued progress syncs automatically to PostgreSQL when connectivity resumes

### Requirement: Four-Tier Mastery And Leitner Review
The system SHALL compute skill mastery across Attempted, Familiar, Proficient, and Mastered tiers from lesson accuracy and schedule the next review using 5-box Leitner intervals (1, 2, 4, 8, 16 days).

#### Scenario: First-time lesson completion updates mastery and review box
- **GIVEN** a lesson at `not_started` status
- **WHEN** the learner finishes with 85% accuracy on first attempt
- **THEN** mastery transitions to `familiar`, Leitner box sets to 2, and `nextReviewAt` schedules 2 days ahead
- **WHEN** the learner finishes with 100% accuracy without Tier 3 hints
- **THEN** mastery transitions to `proficient` and advances one Leitner box

### Requirement: Calm Informational Mastery Badges
The system SHALL derive informational mastery badges from completed lessons and mastery states without countdown timers, virtual currencies, or loot boxes.

#### Scenario: Completing key milestones unlocks informational badges
- **GIVEN** a learner with locally persisted completed lessons in IndexedDB
- **WHEN** the learner views the Learning Path dashboard
- **THEN** earned mastery badges display calmly alongside the weekly learning rhythm summary
- **AND** unearned badges remain visible as gentle goals without punitive streaks

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
