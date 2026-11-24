## ADDED Requirements

### Requirement: Calm Informational Mastery Badges
The system SHALL derive informational mastery badges from completed lessons and mastery states without countdown timers, virtual currencies, or loot boxes.

#### Scenario: Completing key milestones unlocks informational badges
- **GIVEN** a learner with locally persisted completed lessons in IndexedDB
- **WHEN** the learner views the Learning Path dashboard
- **THEN** earned mastery badges display calmly alongside the weekly learning rhythm summary
- **AND** unearned badges remain visible as gentle goals without punitive streaks
