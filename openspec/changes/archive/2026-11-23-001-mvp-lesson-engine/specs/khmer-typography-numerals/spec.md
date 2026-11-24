## Purpose
Guarantee legible, non-clipped Khmer Unicode typography, consistent Khmer/Arabic numeral presentation, and safe invisible-character handling across Android Chrome and iOS Safari.

## ADDED Requirements

### Requirement: Khmer Unicode Font And Line Height
The system SHALL render all Khmer interface and lesson text in Unicode Khmer using `lang="km"` with vertical line height between 1.65 and 1.8 and zero positive letter spacing.

#### Scenario: Subscript stacking renders without clipping
- **GIVEN** a viewport of 360px width displaying Khmer text containing double subscripts (e.g., កន្ត្រៃ) and overhead vowel signs
- **WHEN** the page renders inside a lesson prompt or interactive button
- **THEN** computed `line-height` is at least 1.65 times computed `font-size`
- **AND** computed `letter-spacing` equals `0px`
- **AND** glyph bounding boxes are not clipped by container padding or overflow rules

### Requirement: Dual Numeral Display And Normalization
The system SHALL display mathematical numerals in Khmer digits (០–៩) by default, provide a one-tap toggle to Hindu-Arabic digits (0–9), and accept either numeral script identically during grading.

#### Scenario: Learner toggles numeral script mid-lesson
- **GIVEN** an active lesson step displaying Khmer numerals (e.g., ៨ + ៥)
- **WHEN** the learner taps the numeral toggle control
- **THEN** all numeric labels update immediately to Hindu-Arabic numerals (8 + 5) without resetting step state
- **AND** the preference persists across reloads

#### Scenario: Grader normalizes Khmer and Arabic input
- **GIVEN** an activity expecting numeric value 13
- **WHEN** the learner submits either `១៣` or `13` (with or without stray U+200B zero-width spaces)
- **THEN** the system strips `U+200B` characters, normalizes digits to canonical numeric form, and grades both submissions as correct
