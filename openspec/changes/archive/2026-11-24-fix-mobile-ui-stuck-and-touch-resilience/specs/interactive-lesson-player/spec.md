# interactive-lesson-player Specification Delta

## ADDED Requirements

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
