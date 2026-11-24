## ADDED Requirements

### Requirement: Mascot Prompt Bubble And Sprouting Meter
The system SHALL display a persistent conversational mascot prompt bubble with a one-tap Khmer audio read-aloud chip alongside numbered step-dot badges and a sprouting garden bud indicator that grows with each completed step.

#### Scenario: Learner sees mascot prompt bubble and growing bud across steps
- **GIVEN** a learner opening any multi-step lesson in the lesson player
- **WHEN** step 1 loads
- **THEN** the mascot companion bubble displays the active Khmer prompt, a tactile read-aloud chip, circular step badges for each step, and a stage-1 garden bud indicator
- **WHEN** the learner submits a valid answer for step 1
- **THEN** step badge 1 marks complete, the garden bud indicator advances its visual growth stage, and the mascot bubble celebrates in Khmer

### Requirement: Tactile Controls And Treat Time Reward
The system SHALL render lesson action controls with tactile 3D bottom-lip press feedback and present an interactive frog-feeding celebration on lesson completion where learners can feed up to three treats to fill three friendship hearts.

#### Scenario: Learner feeds mascot treats on the lesson completion screen
- **GIVEN** a learner who completes the final step of a lesson and advances to the summary view
- **WHEN** the lesson celebration view renders
- **THEN** the learner sees the mascot companion, a treat plate with a Khmer prompt to feed the mascot, three friendship hearts, mastery summary stats, and next-action controls
- **WHEN** the learner taps the treat up to three times
- **THEN** each tap animates the treat to the mascot, fills a friendship heart, and crowns the mascot at three hearts with zero WCAG 2.2 AA violations

### Requirement: Two-Column Landscape Lesson Workspace
The system SHALL arrange the active lesson step into a two-column workspace on landscape tablets and desktop viewports (`>= 900px` wide) with the interactive math board on the left and the mascot prompt and primary action controls on the right.

#### Scenario: Lesson player renders side-by-side workspace on tablet and desktop
- **GIVEN** a learner opening a lesson on a `1024x768` landscape viewport
- **WHEN** the active lesson step renders
- **THEN** the interactive math board appears in the left column and the mascot prompt bubble and primary check/hint controls appear in the right column without requiring vertical page scrolling to submit an answer
