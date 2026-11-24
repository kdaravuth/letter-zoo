## Purpose
Deliver a calm, distraction-free guided interactive lesson loop with immediate diagnostic feedback and anti-gaming progressive hints.

## ADDED Requirements

### Requirement: Guided Lesson Step Progression
The system SHALL execute each lesson sequentially through its declared JSON steps without countdown timers, advancing only after the learner completes or resolves the active step.

#### Scenario: Completing an active step unlocks continuation
- **GIVEN** a learner on step 1 of a multi-step lesson
- **WHEN** the learner submits a valid answer
- **THEN** the system displays a concise Khmer affirmation and visual explanation
- **AND** enables the "បន្តទៅមុខ" (Continue) control to advance to step 2
- **AND** no countdown timer or punitive failure banner is displayed

### Requirement: Progressive Three-Tier Hint Reveal
The system SHALL reveal up to three escalating Khmer hints per problem step—visual cue, strategy nudge, and worked step—while gating full reveal behind an initial attempt or explicit request.

#### Scenario: Learner struggles and requests tiered hints
- **GIVEN** an active problem step with 3 defined hint tiers
- **WHEN** the learner submits an incorrect attempt
- **THEN** the system provides non-punitive visual discrepancy feedback and highlights the "សុំជំនួយ" (Ask for hint) button
- **WHEN** the learner activates "សុំជំនួយ" once
- **THEN** Tier 1 (visual cue) displays without revealing the final answer
- **WHEN** the learner activates "សុំជំនួយ" a second and third time
- **THEN** Tier 2 (strategy nudge) and Tier 3 (worked step) display sequentially
