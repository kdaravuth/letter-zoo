# interactive-lesson-player Specification

## Purpose
Deliver a calm, distraction-free guided interactive lesson loop with immediate diagnostic feedback and anti-gaming progressive hints.

## Requirements

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

### Requirement: Khmer Audio Prompt Read-Aloud
The system SHALL provide an accessible one-tap Khmer read-aloud control for lesson prompts and a persistent audio preference toggle so emergent readers can listen to prompts without reading fatigue.

#### Scenario: Learner activates prompt read-aloud and toggles audio preference
- **GIVEN** an active lesson step on a mobile viewport
- **WHEN** the learner taps the Khmer read-aloud button on the step prompt
- **THEN** the system plays recorded step audio if present or uses Khmer speech synthesis fallback without runtime error
- **WHEN** the learner toggles the persistent audio preference control
- **THEN** the updated `audioEnabled` preference persists locally across reloads

### Requirement: Spoken Hints, Lesson Scratchpad, And Printable Khmer Certificate
The system SHALL provide spoken Khmer read-aloud buttons on revealed hints and explanations, a toggleable on-screen doodle scratchpad inside `<LessonPlayer />` that preserves active step state, and an offline print-ready Khmer Achievement Certificate accessible from `/parent` and `/garden`.

#### Scenario: Child opens scratchpad and hears spoken hint during a lesson
- **GIVEN** a learner solving a lesson step on a 360x800 viewport
- **WHEN** the learner toggles the scratchpad open, draws or taps tallies, and reveals a hint
- **THEN** the active step state remains intact, the hint displays a spoken Khmer read-aloud button, and zero WCAG 2.2 AA violations occur

#### Scenario: Parent previews printable Khmer Achievement Certificate
- **GIVEN** a parent or learner viewing `/garden` or unlocked `/parent`
- **WHEN** they open the Achievement Certificate preview
- **THEN** the Khmer certificate renders the child's name, mastered stats, and print action with zero WCAG 2.2 AA violations

### Requirement: Responsive Mobile Lesson Header
The system SHALL render the sticky lesson header at 360px mobile width without cramping, overlapping, or clipping the exit control, step progress indicator, audio toggle, or numeral toggle, while providing immediate visual press feedback on all lesson action buttons.

#### Scenario: Lesson header stays legible and non-overflowing on 360px phones
- **GIVEN** a learner opening any lesson on a 360x800 mobile viewport
- **WHEN** the lesson header renders with Khmer numerals and both audio and numeral toggles active
- **THEN** the exit button, step counter, progress bar, audio toggle, and numeral toggle all remain fully visible with zero overlap and zero horizontal page overflow
- **AND** toggling audio off or switching numeral script does not push header controls outside the viewport

#### Scenario: Lesson view adapts to dynamic mobile viewport height
- **GIVEN** a mobile phone browser whose address bar shows and hides during vertical scrolling
- **WHEN** the learner scrolls through a lesson step and taps primary check, hint, or continue controls
- **THEN** primary actions remain reachable above the device bottom safe area with immediate pressed visual feedback and zero WCAG 2.2 AA violations

### Requirement: Mobile Gesture-Safe Audio Playback
The system SHALL unlock mobile browser audio playback synchronously inside the user tap gesture before fetching dynamic Khmer speech audio or playing feedback chimes so read-aloud prompts and chimes play reliably on iOS Safari and Android Chrome.

#### Scenario: First tap on read-aloud plays Khmer speech on mobile browser
- **GIVEN** a learner opening a lesson on a mobile phone browser with audio enabled and no prior audio playback in the session
- **WHEN** the learner taps the prompt, hint, or explanation read-aloud button
- **THEN** playback succeeds without being rejected by mobile autoplay restrictions
- **AND** tapping the button again while speaking stops playback immediately without leaving the button stuck in a speaking state

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

### Requirement: Sticky Mobile Action Dock And Instant Shell
The system SHALL keep the primary lesson action controls ("ពិនិត្យចម្លើយ", "សុំជំនួយ", and "បន្តទៅមុខ") pinned in a sticky bottom safe-area dock on mobile viewports (< 900px wide), stream lesson routes immediately without blocking navigation on dynamic URL parameters, and ensure step submission and continuation never hang when device storage is slow or unavailable.

#### Scenario: Primary check and continue actions remain pinned on short mobile screens
- **GIVEN** a learner solving a lesson step on a `360x640` mobile phone viewport
- **WHEN** the active step board and mascot prompt render
- **THEN** the primary action bar ("ពិនិត្យចម្លើយ" and "សុំជំនួយ", or "បន្តទៅមុខ" once solved) remains visible and tappable inside the sticky bottom dock above the device safe area without requiring full-page scrolling
- **AND** revealing a hint or feedback panel keeps the primary action button reachable with zero WCAG 2.2 AA violations

#### Scenario: Navigating to a lesson renders immediately on mobile
- **GIVEN** a learner tapping any lesson card on `/learn` from a mobile browser
- **WHEN** the route transitions to `/learn/[lessonId]`
- **THEN** the lesson shell and step 1 interactive board render and hydrate without blocking on uncached route parameter resolution or cross-origin asset errors

### Requirement: Consistent Sota Voice Step Audio
The system SHALL ship a pre-generated local MP3 prompt clip for every lesson step and daily-puzzle step, voiced by KiriTTS voice `Sota`. Each clip SHALL be one continuous recording of the step's current `promptKm`, with no stitched seams. Its provenance (voice, engine, spoken text, and a source-text hash) SHALL be recorded so stale or wrong-voice clips are detected before release.

#### Scenario: Every step has a current Sota clip
- **GIVEN** the lesson content in `content/paths/**` and `content/daily/puzzles.json`
- **WHEN** `npm run validate:content` runs
- **THEN** every step's `audioUrl` resolves to an existing MP3 file under `public/audio/steps/` larger than 500 bytes
- **AND** every step has a manifest entry whose voice is `Sota`, whose engine is `kiritts`, and whose source hash matches the step's current `promptKm`

#### Scenario: Edited prompt without regenerated audio fails validation
- **GIVEN** a step whose `promptKm` was edited after its clip was generated
- **WHEN** `npm run validate:content` runs
- **THEN** validation fails and names the step id as having stale prompt audio

#### Scenario: Learner hears the Sota narrator on read-aloud
- **GIVEN** an active lesson step or daily puzzle on a mobile device with audio enabled
- **WHEN** the learner taps the Khmer read-aloud control
- **THEN** the local Sota clip for that step plays from start to end without gaps or restarts, and it reads any equation in the prompt as spoken Khmer math (documented device QA)
