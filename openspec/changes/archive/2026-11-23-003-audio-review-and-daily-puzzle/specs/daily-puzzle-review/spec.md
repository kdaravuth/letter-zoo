## Purpose
Deliver an automated Leitner spaced-review queue and a calm, zero-timer 2-minute Daily Visual Puzzle driven by Zod-validated JSON content and persisted offline in IndexedDB.

## ADDED Requirements

### Requirement: Automated Leitner Due-Review Queue
The system SHALL identify lessons whose scheduled `nextReviewAt` timestamp is due and present them in a dedicated review queue sorted by urgency without punitive streak penalties.

#### Scenario: Overdue lesson appears in review queue
- **GIVEN** a learner with a completed lesson whose `nextReviewAt` timestamp is in the past
- **WHEN** the learner opens the Learning Path dashboard or `/review`
- **THEN** the lesson appears as due for review with its current Leitner box
- **AND** launching the review lets the learner complete it and advance its Leitner interval

### Requirement: Daily Visual Puzzle From JSON Pack
The system SHALL serve a deterministic daily visual puzzle from a Zod-validated JSON pack using the shared activity primitives, with zero countdown timers and local-first completion persistence.

#### Scenario: Learner completes today's daily visual puzzle
- **GIVEN** a learner opening `/daily` (*លំហាត់ប្រចាំថ្ងៃ*)
- **WHEN** the learner solves the daily visual puzzle via tap or drag and submits
- **THEN** the system displays a Khmer explanation and records completion in IndexedDB
- **AND** the Learning Path dashboard reflects that today's puzzle is completed
