# Spec Delta

## ADDED Requirements

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
