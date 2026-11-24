# parent-progress-overview Specification

## Purpose
Provide Cambodian parents and caregivers with a calm, PIN or adult math-gated progress summary in plain Khmer across shared family devices.

## Requirements

### Requirement: Adult Gate For Caregiver Overview
The system SHALL protect `/parent` behind an adult math check or caregiver-defined 4-digit PIN accepting both Khmer and Arabic numerals identically.

#### Scenario: Parent unlocks caregiver dashboard with Khmer or Arabic answer
- **GIVEN** a caregiver visiting `/parent`
- **WHEN** the caregiver enters the valid math gate answer (e.g., `៥៦` or `56`) and submits
- **THEN** the caregiver progress dashboard unlocks displaying the active child's summary without requiring a cloud account

### Requirement: Plain Khmer Strengths And Practice Summary
The system SHALL compute and display per-child strengths, gentle practice recommendations, path completion counts, and weekly learning rhythm from local IndexedDB progress.

#### Scenario: Dashboard summarizes child strengths and practice needs
- **GIVEN** a child profile with completed lessons in IndexedDB
- **WHEN** the caregiver views `/parent`
- **THEN** lessons at proficient or mastered tiers appear under strengths and attempted or due lessons appear under practice recommendations
