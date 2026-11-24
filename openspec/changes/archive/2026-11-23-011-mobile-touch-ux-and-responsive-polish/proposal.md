# Proposal

## Why

When opening Soun Kanit (សួនគណិត) in a real mobile phone browser (Android Chrome / iOS Safari on 320px–390px screens), interactive components and buttons feel broken or unresponsive: `.manipulative-target` sets `touch-action: none` globally on regular buttons and scrollable number-line ticks (blocking page and horizontal scrolling), `GeometryDraw` relies on `onPointerEnter` (which never fires across cells during touch drag due to implicit mobile touch capture), `CountingStage` has an 8-unit drag threshold with no `pointercancel` recovery (causing taps with slight finger movement to misfire), several SVG/button grids (`LessonPlayer` header, `PlaceValueBlocks`, `CountingStage`, `FractionBarShape`, `GeometryDraw`, `ArrayGroups`) overflow or overlap on narrow phones, `AppNavigation` lacks `safe-area-inset-bottom` clearance, and async TTS audio playback can be blocked by mobile autoplay policies.

Fixing these mobile browser interaction, layout, and touch-gesture defects now is essential because Cambodian children and families primarily access the platform on smartphones.

## What Changes

- **Touch-Action & Tactile Button Responsiveness**:
  - Separate tap-target sizing from drag/draw touch locking: apply `touch-action: manipulation`, `-webkit-tap-highlight-color: transparent`, `user-select: none`, and clear `:active` pressed feedback across interactive buttons, links, and chips so rapid phone taps respond immediately without double-tap zoom or blocking vertical scrolling.
  - Restrict `touch-action: none` strictly to active drag handles and freehand/grid-paint SVG surfaces (dedicated `.touch-drag-surface` utility), while keeping tap buttons and scrollable `NumberLine` ticks scroll-friendly (`manipulation` / `pan-x`).
- **Mobile-Reliable Touch Manipulation Across Activity Primitives**:
  - Fix `GeometryDraw` (`symmetry-mirror` and `area-paint`) to paint cells continuously via `<svg>`-level `onPointerMove` coordinate hit-testing with `pointercancel` cleanup instead of `onPointerEnter`, and ensure non-overlapping `>= 56x56 px` targets for all grid sizes.
  - Fix `CountingStage` with a forgiving mobile tap-vs-drag threshold (`>= 14` SVG units), `onPointerCancel` recovery, forgiving drop zones without dead gaps, and responsive SVG sizing that never overflows 320px–360px cards.
  - Fix `NumberLine` so ticks allow horizontal touch scrolling (`pan-x`), only the marker locks touch drag with `onPointerCancel` recovery, and step buttons keep the active marker scrolled into view on narrow phones.
  - Fix `FractionBarShape` to use responsive/scrollable geometry without segment overlap when `denominator >= 6` while preserving `>= 56x56 px` targets.
  - Clean up `PatternSequence` pointer handling so taps and slot placements never double-trigger or block scrolling on mobile browsers.
- **Mobile-First Responsive Layouts, Safe Areas & Non-Crushing Headers**:
  - Redesign `<LessonPlayer />` sticky header for narrow phones (320px–390px) so the exit button, step progress bar, audio toggle, and numeral toggle never crush or overflow, and make `AudioToggle` and `NumeralToggle` compact and thumb-friendly on `< sm` viewports.
  - Fix mobile button grid overflow in `PlaceValueBlocks`, `ArrayGroups`, and `AdminStudioClient` (`select` widths), and replace `min-h-screen` with `min-h-dvh` across full-height views.
  - Add `viewportFit: "cover"` in root viewport metadata and `env(safe-area-inset-bottom)` + `max-h-[70dvh] overflow-y-auto` support to `AppNavigation` bottom dock and More Menu sheet so iPhone home-indicator and Android gesture bars never intercept taps.
- **Mobile Gesture-Safe Audio & Speech Unlocking**:
  - Synchronously prime/unlock a shared `HTMLAudioElement` and `AudioContext` inside the user tap gesture before async `/api/tts` fetches so Khmer voice read-aloud and pentatonic chimes play reliably on iOS Safari and Android Chrome.

## Capabilities

### New Capabilities

<!-- None: all behavioral requirements extend existing capabilities cleanly. -->

### Modified Capabilities

- `activity-engine-primitives`: Require mobile touch-friendly scroll/tap separation (`touch-action: manipulation` on tap targets, `none` only on drag/draw surfaces), touch-drag painting via coordinate hit-testing in `geometry-draw`, forgiving tap-vs-drag & `pointercancel` handling in `counting-stage` and `number-line`, and zero-overflow/non-overlapping mobile layouts across all primitives at 360px width.
- `interactive-lesson-player`: Require a non-crushing mobile sticky header at 360px width, dynamic viewport (`100dvh`) safe-area spacing, immediate tactile button press states, and mobile user-gesture audio unlocking for Khmer read-aloud and chimes.
- `multi-path-curriculum`: Require mobile safe-area clearance (`env(safe-area-inset-bottom)`) on the persistent bottom navigation dock, bounded scrollable More Menu sheet, and zero horizontal overflow across all primary hub routes on 360px mobile viewports.

## Impact

- **CSS & Layout**: `src/app/globals.css`, `src/app/layout.tsx`, `src/components/ui/AppNavigation.tsx`, `src/components/ui/AudioReadButton.tsx`, `src/components/ui/NumeralToggle.tsx`.
- **Lesson Player & Primitives**: `src/components/lesson/LessonPlayer.tsx`, `src/components/activities/CountingStage.tsx`, `src/components/activities/NumberLine.tsx`, `src/components/activities/GeometryDraw.tsx`, `src/components/activities/PlaceValueBlocks.tsx`, `src/components/activities/FractionBarShape.tsx`, `src/components/activities/ArrayGroups.tsx`, `src/components/activities/PatternSequence.tsx`, `src/components/lesson/LessonScratchpad.tsx`.
- **Hub Pages & Audio**: `src/components/admin/AdminStudioClient.tsx`, `src/components/play/PlayStudioClient.tsx`, `src/components/daily/DailyPuzzleClient.tsx`, `src/lib/audio/khmerSpeech.ts`, `src/lib/audio/chimes.ts`.
- **Tests**: Unit tests for mobile geometry/touch helpers and expanded Playwright mobile (360x800 touch) E2E tests asserting zero horizontal overflow, touch-drag painting, tap-vs-drag stability, and WCAG 2.2 AA compliance.
