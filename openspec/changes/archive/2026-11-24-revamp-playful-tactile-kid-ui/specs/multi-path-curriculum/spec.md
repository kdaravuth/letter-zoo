## ADDED Requirements

### Requirement: Candy-Color Tactile Lesson Tiles
The system SHALL present learning path tabs and lesson cards on `/learn` with cycling high-contrast candy-color 3D tactile accents, three-star mastery indicators, and clear active-selection outlines.

#### Scenario: Learner browses candy-colored lesson tiles on 360x800 mobile
- **GIVEN** a learner viewing `/learn` on a 360x800 mobile viewport
- **WHEN** the learning path tabs and lesson cards render
- **THEN** each lesson card displays a tactile 3D bottom lip, its cycling candy-color accent badge, a 1–3 star mastery indicator alongside its Khmer mastery label, and passes `@axe-core/playwright` WCAG 2.2 Level AA color contrast checks

### Requirement: Responsive Dock And Side Rail Navigation
The system SHALL render the global Khmer navigation menu as a rounded bottom dock on mobile viewports and adapt it into a vertical left side rail on wide landscape viewports (`>= 900px`) with a warm highlight on the active tab.

#### Scenario: Global navigation adapts between mobile bottom dock and desktop side rail
- **GIVEN** a learner navigating between `/learn`, `/play`, `/garden`, and `/daily`
- **WHEN** the viewport is `360x800` mobile portrait
- **THEN** the navigation menu docks at the bottom above the safe-area inset with zero horizontal overflow
- **WHEN** the viewport is `1024x768` landscape tablet or desktop
- **THEN** the navigation menu docks as a vertical side rail on the left while keeping the active route highlighted with `aria-current="page"`
