## Purpose
Persist student profiles, lesson completion, 4-tier mastery states, and Leitner review dates locally first so learning continues seamlessly across spotty or offline connections.

## ADDED Requirements

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
