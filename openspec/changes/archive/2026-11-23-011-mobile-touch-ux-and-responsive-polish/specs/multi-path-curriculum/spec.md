# Spec Delta

## ADDED Requirements

### Requirement: Mobile Safe-Area Navigation Dock
The system SHALL apply bottom safe-area clearance to the persistent mobile navigation dock, bound and scroll the expandable More Menu sheet within small or landscape phone viewports, and prevent horizontal page overflow across all primary hub routes at 360px width.

#### Scenario: Bottom navigation dock clears phone gesture bars and fits 360px width
- **GIVEN** a learner browsing `/`, `/learn`, `/play`, `/garden`, `/daily`, `/review`, `/parent`, or `/admin` on a 360x800 mobile viewport
- **WHEN** the page and persistent bottom navigation dock render
- **THEN** all five dock controls meet at least 44x44 CSS pixel tap targets, remain clear of the bottom safe-area inset, and produce zero horizontal page overflow

#### Scenario: Expandable More Menu stays accessible on compact mobile viewports
- **GIVEN** a learner opening the More Menu sheet on a compact or landscape mobile phone viewport
- **WHEN** the sheet opens above the bottom dock
- **THEN** all menu links and the close button remain reachable via vertical scrolling inside the sheet without clipping off-screen
- **AND** tapping the backdrop, close button, or any destination closes the sheet cleanly
