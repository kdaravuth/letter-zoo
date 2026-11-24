## ADDED Requirements

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
