# Design

## Context

See `proposal.md` for user-reported mobile failures and the three delta specs under `specs/` for behavioral requirements.

Current frontend constraints shaping this design:
- All mathematical manipulatives use inline React `<svg>` with explicit `viewBox` (zero `<foreignObject>` for iOS Safari WebKit safety) and must support WCAG 2.2 SC 2.5.7 (single-pointer tap-to-place alternative) with `>= 56x56 CSS px` `.manipulative-target` hit boxes and `>= 44x44 CSS px` secondary controls.
- E2E tests currently run in Playwright Chromium with `360x800`, `hasTouch: true`, `isMobile: true`, asserting `.manipulative-target` bounding boxes (`>= 56x56`) and axe-core `wcag22aa`.
- Many real-device mobile regressions escaped earlier E2E checks because Playwright `.click()` does not exercise touch-drag scroll blocking (`touch-action: none`), implicit touch pointer capture (`onPointerEnter` failure), slight finger drift during taps, horizontal page overflow (`scrollWidth > innerWidth`), or iOS/Android autoplay gesture rules.

## Goals / Non-Goals

**Goals:**
- Separate touch-target sizing (`.manipulative-target`) from full scroll-locking (`touch-action: none`) so buttons, cards, and scrollable ticks feel native on phones.
- Make every SVG manipulative touch-reliable under real mobile pointer capture, pointer cancellation, and narrow 320px–390px viewports without breaking existing `data-testid` hooks or WCAG 2.2 AA compliance.
- Ensure zero horizontal overflow across all routes and primitives at 360px width, with safe-area bottom insets (`viewport-fit=cover` + `env(safe-area-inset-bottom)`) and dynamic viewport height (`100dvh`).
- Make Khmer TTS and Web Audio chimes unlock reliably inside the first user tap on iOS Safari and Android Chrome.

**Non-Goals:**
- Changing lesson JSON schemas (`LessonDocumentV1Schema`), grading math rules, or database tables.
- Introducing third-party drag-and-drop libraries or HTML `<canvas>` replacements (we stay strictly on lightweight inline React `<svg>` + Pointer Events).
- Rewriting visual identity or color tokens (warm calm OKLCH ivory aesthetic stays intact).

## Decisions

### 1. Decouple Target Sizing From `touch-action: none` in `globals.css`
- **Decision**:
  - Change `.manipulative-target` from `touch-action: none` to `touch-action: manipulation` (retaining `min-width: 56px; min-height: 56px; scroll-margin-top: 5rem; user-select: none; -webkit-user-select: none;`).
  - Apply `touch-action: manipulation; -webkit-tap-highlight-color: transparent;` to `button`, `a`, `[role="button"]`, and `.khmer-chip`, plus subtle tactile press feedback (`:active` scale/opacity transition that respects `prefers-reduced-motion`).
  - Introduce a dedicated `.touch-drag-surface` utility (`touch-action: none; -webkit-user-select: none; user-select: none;`) applied **only** to active drag handles (`CountingStage` draggable token `<g>`, `NumberLine` draggable marker `<g>`) and drawing canvases (`GeometryDraw` paint `<svg>`, `LessonScratchpad` `<svg>`).
  - Apply `overflow-x: clip;` on `html, body` (never `overflow-x: hidden`, which breaks `position: sticky` headers).
- **Rationale**: Eliminates 300ms/double-tap-zoom latency on rapid taps while restoring natural vertical scrolling when a finger touches buttons/cards and horizontal scrolling on `NumberLine` ticks.
- **Alternative Considered**: Keeping `touch-action: none` on `.manipulative-target` and overriding with `touch-pan-y` per button. Rejected because `.manipulative-target` is used on ~25 tap-only buttons vs. only 2 drag handles, making opt-in `.touch-drag-surface` far safer and less error-prone.

### 2. SVG-Level Coordinate Hit-Testing for `GeometryDraw` Touch Painting
- **Decision**:
  - In `GeometryDraw.tsx` (`symmetry-mirror` and `area-paint`), remove `onPointerEnter`-based drag painting. Instead, attach `onPointerDown`, `onPointerMove`, `onPointerUp`, and `onPointerCancel` on the `<svg>` container (with `.touch-drag-surface` / `touch-none` and `setPointerCapture` guarded in `try/catch`).
  - Map `(clientX, clientY)` to `(row, col)` using a pure helper (`clientPointToGridCell`) testable in Vitest. Track the last painted cell key per gesture so sliding across cells paints each unlocked cell once without flickering, while tapping a single painted cell toggles it off cleanly.
  - For grids where `(320 - 16) / gridCols < 62`, scale the SVG `viewBox` dynamically (`Math.max(320, gridCols * 62 + 16)`) inside an `overflow-x-auto` wrapper rather than clamping `<rect width={Math.max(56, cellW - 6)}>` on top of neighbors.
- **Rationale**: Mobile browsers implicitly capture touch pointers on the initial `pointerdown` target, so `onPointerEnter` never fires on sibling `<g>` elements. SVG-level coordinate hit-testing works identically across iOS Safari, Android Chrome, and desktop mouse/pen.
- **Alternative Considered**: Calling `releasePointerCapture` on `pointerdown` to emulate desktop `pointerenter`. Rejected because iOS Safari WebKit still does not reliably dispatch `pointerenter` across SVG `<g>` children during touch moves.

### 3. Forgiving Tap-vs-Drag Threshold & Pointer Cancel Recovery in `CountingStage`, `NumberLine`, and `PatternSequence`
- **Decision**:
  - **`CountingStage.tsx`**:
    - Remove `min-w-[320px]` from `<svg>` (use `w-full max-w-[360px]`; at 306px inner width on 360px phones, compute responsive `viewBox` width or use a clean `px-2.5` card padding so 5 columns of 60-unit cells render at `>= 56px` CSS px without horizontal overflow). Specifically: on a 360px viewport, `main` `px-2.5` (20px) + card `p-3` (24px) + 2px border = `314px`; keeping `svgWidth = 310` with `cellSize = 58`, `cellGap = 4` (`5 * 58 + 4 * 4 = 306` + `2px` margin each side = `310`) yields `58.7px >= 56px` per cell AND zero horizontal overflow!
    - Raise drag movement threshold from `8` to `14` SVG units so natural child finger wobble during a tap stays a tap-to-select gesture.
    - Add `onPointerCancel` handler (clearing `dragging` and safely releasing capture) and eliminate the dead zone between the ten-frame and outside tray by snapping any drop above the midpoint to the nearest frame slot and below the midpoint to the outside tray.
  - **`NumberLine.tsx`**:
    - Apply `touch-pan-x` to tick `<g>` targets so horizontal swiping across ticks scrolls the track naturally, while keeping `.touch-drag-surface` (`touch-action: none`) strictly on `number-line-marker`.
    - Add `onPointerCancel` on `number-line-marker`.
    - When `currentValue` changes via step buttons (`−1`/`+1`), smoothly scroll `scrollContainerRef` (`scrollTo`) if the active marker moves near or outside the visible horizontal scroll edges.
  - **`FractionBarShape.tsx`**:
    - Remove `min-w-[320px]` overflow on narrow cards; when `denominator <= 5`, fit cleanly inside `310px` (`partWidth >= 60px`); when `denominator >= 6`, size the SVG width to `denominator * 60 + 8` inside a horizontally scrollable `overflow-x-auto` container so every part stays `>= 56px` without overlapping its neighbor.
  - **`PatternSequence.tsx`**:
    - Keep palette tiles and sequence slots on clean `onClick` tap-to-select + tap-to-place with `touch-action: manipulation` (removing the competing `onPointerUp` `elementFromPoint` handler that misfired alongside `onClick` on touch taps), while adding one-tap convenience: if a child taps a palette tile when there is only one empty slot or taps an empty slot while a tile is selected, placement happens immediately with clear ring highlight.

### 4. Non-Crushing Mobile Headers, Button Grids & Safe-Area Navigation
- **Decision**:
  - **`LessonPlayer.tsx` sticky header**: Use a clean two-row compact mobile header (`flex-col gap-2 sm:flex-row sm:items-center`) on `< sm` viewports — Row 1 holds `ចាកចេញ` on the left and `AudioToggle` + `NumeralToggle` on the right; Row 2 holds the full-width `ជំហាន X / Y` counter + offline badge + progress bar. On `>= sm`, keep the single-row layout. This guarantees zero crushing on 320px–390px screens even when Khmer labels expand (e.g., `បិទសំឡេង`).
  - **`AudioToggle` & `NumeralToggle`**: Slightly tighten mobile horizontal padding (`px-2.5 sm:px-3`) with `shrink-0` and `whitespace-nowrap` while keeping `min-h-[44px] min-w-[44px]`.
  - **`PlaceValueBlocks.tsx` & `ArrayGroups.tsx`**: Use `grid-cols-1 min-[390px]:grid-cols-2` for paired dual-button stepper cards so each `−` / `+` pair always has comfortable horizontal room and never overflows on 320px–360px phones.
  - **`AdminStudioClient.tsx`**: Add `w-full sm:w-auto max-w-full` to `<select>` inputs so long Khmer lesson titles never force horizontal overflow.
  - **`layout.tsx` & `AppNavigation.tsx`**:
    - Add `viewportFit: "cover"` to exported `viewport` in `src/app/layout.tsx`.
    - Replace `min-h-screen` with `min-h-dvh` in root page wrappers so mobile browser chrome resize does not hide bottom controls.
    - Add `pb-[calc(0.375rem+env(safe-area-inset-bottom))]` to the fixed bottom nav bar (`AppNavigation.tsx`), update the spacer height to `h-[calc(5.5rem+env(safe-area-inset-bottom))]`, and constrain the More Menu sheet with `bottom-[calc(4.75rem+env(safe-area-inset-bottom))] max-h-[70dvh] overflow-y-auto`.

### 5. Synchronous User-Gesture Audio Priming for Mobile Safari & Chrome
- **Decision**:
  - In `src/lib/audio/khmerSpeech.ts`, reuse a single module-level `HTMLAudioElement` (`sharedAudioEl`) and call `sharedAudioEl.load()` / prime synchronously inside `speakKhmerPrompt()` (the click handler call stack) before awaiting `fetchCachedTtsBlobUrl()`, then assign `sharedAudioEl.src` and `.play()` once the blob resolves. Always invoke `onEnd?.()` on abort/error so `AudioReadButton` never stays stuck in `"កំពុងអាន..."`.
  - In `src/lib/audio/chimes.ts`, when `sharedAudioCtx.state === "suspended"`, schedule the tone inside `sharedAudioCtx.resume().then(...)` rather than scheduling immediately against a frozen clock, ensuring the very first tap chime is audible on iOS/Android.

## Risks / Trade-offs

- **Risk**: Tightening `CountingStage` SVG width (`310` units) or `FractionBarShape` layout could reduce bounding-box pixels below `56px` on `360px` viewports if parent padding is too large.
  → **Mitigation**: Keep `LessonPlayer` main horizontal padding at `px-2.5 sm:px-3` and card padding at `p-3 sm:p-5` (`360 - 20 - 24 - 2 = 314px`), yielding `>= 58px` per cell, and verify every primitive in Playwright at `360x800` with `expectAllManipulativeTargetsAtLeast56px` + `scrollWidth <= clientWidth`.
- **Risk**: Two-row mobile header in `LessonPlayer` uses ~16px more vertical height than a crushed single row.
  → **Mitigation**: Keep Row 2 sleek (`text-xs` + `h-2` progress bar, ~24px total), and maintain `scroll-margin-top: 6rem` so focused elements stay unobscured by the sticky header (WCAG 2.2 SC 2.4.11).
- **Risk**: Touch-event emulation differences between Playwright mobile Chromium and real iOS Safari WebKit.
  → **Mitigation**: Test SVG coordinate hit-testing and tap-vs-drag logic in Vitest unit tests, run Playwright touch-pointer sequences (`pointerdown` → `pointermove` → `pointerup` / `pointercancel`) and overflow checks in CI, and include a concise real-phone QA checklist in `tasks.md`.
