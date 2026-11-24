# Proposal

## Why

Young Cambodian learners (ages 6–12) benefit from tactile, toy-like visual affordances—chunky 3D buttons that physically depress on tap, joyful cycling candy-color cards, an always-present conversational mascot prompt bubble, a responsive two-column landscape/tablet workspace, and interactive celebration rewards—modeled after the playful UI and interactive polish of Letter Zoo (`http://localhost:3333`). Right now, Konleuh Kanit's controls use flat 1px borders and single-column stacks where `<MascotFrog />` only appears after grading and `/garden` requires separate bottom buttons instead of direct canvas touch.

## What Changes

- **Tactile 3D Button, Tile & Switch System**: Upgrade buttons, manipulative option chips, `<NumeralToggle />` (`១២៣` / `123`), `<AudioToggle />`, and `<BrandLogo />` across the app with solid 3D bottom-lip shadows (`0 5px 0`), physical `:active` press translation (`translateY(4px)`), rounded toy geometry (`rounded-3xl` / pill), and 6 WCAG 2.2 AA contrast-verified candy accent themes (`sun`, `ocean`, `leaf`, `berry`, `tangerine`, `grape`) while strictly preserving `Kantumruy Pro` + `Noto Sans Khmer` with `line-height: 1.7` and `letter-spacing: 0`.
- **Conversational Mascot Prompt Stage & Sprouting Progress Meter in `<LessonPlayer />`**:
  - Display a persistent, gently bobbing `<MascotFrog />` speech bubble paired with a chunky 3D Khmer read-aloud button at the top of every step.
  - Render circular step-dot badges (`១..N`) and an inline SVG sprouting lotus/mango bud on the board header that grows with each solved step.
  - Switch `<LessonPlayer />` to a responsive two-column layout on landscape tablets and desktop (`>= 900px`) with the interactive SVG math board on the left and the mascot prompt + chunky 3D controls on the right.
- **Interactive "Treat Time" Lesson Celebration Overlay**: Enhance the lesson completion screen with an interactive Khmer "Treat Time" (`បញ្ចុកផ្លែស្វាយកូនកង្កែប!`) mini-interaction where children tap to feed `<MascotFrog />` up to 3 times, triggering a chomp animation, filling 3 friendship hearts (`♥ ♥ ♥`), and crowning the frog friend alongside the mastery summary and next-lesson action.
- **Candy-Color Cycling Lesson Tiles & Responsive Navigation Shell**:
  - Restyle lesson cards on `/learn` and game cards on `/play` with cycling candy-color 3D accents, mastery star rows, and high-contrast active outlines.
  - Upgrade `<AppNavigation />` with a warm cream-yellow active pill highlight (`--color-sun-soft`), tactile 3D icon badges, and a responsive left vertical side rail on large landscape screens (`>= 900px`) while preserving 360px mobile bottom safe-area clearance and focus-mode auto-hide.
- **Direct-Touch Living Khmer Garden Habitat (`/garden`)**:
  - Enable children to tap directly on the pond frog, ripe mangoes, lotus flowers, and butterflies inside the `/garden` SVG landscape to trigger hop/bloom/flutter animations, floating Khmer sound bubbles (`"ប្ល៊ុប!"`, `"ឆ្ងាញ់ណាស់!"`), and floating hearts, alongside a tactile collection grid of unlocked and locked garden friends below.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `interactive-lesson-player`: Add requirements for the conversational mascot prompt bubble, circular step-dot and sprouting bud progress indicator, responsive two-column desktop/landscape lesson workspace, tactile 3D button press physics, and interactive "Treat Time" frog-feeding lesson completion celebration.
- `joyful-play-and-garden`: Expand `/garden` and `/play` requirements to support direct on-canvas creature/plant tap interactions with floating Khmer speech bubbles, a garden collection grid with friendship hearts, and tactile 3D candy-themed game controls and crayon swatches.
- `multi-path-curriculum`: Expand `/learn` and `<AppNavigation />` requirements to cover candy-color cycling 3D lesson tiles with mastery star indicators and a responsive navigation shell (mobile bottom dock to desktop/landscape side rail).

## Impact

- **Styling & Theme Tokens**: `src/app/globals.css` (tactile 3D button utilities `.btn-3d`, `.tile-3d`, `.pill-3d`, 6 WCAG AA candy accent tokens, keyframe animations honoring `prefers-reduced-motion: reduce`).
- **Navigation & Shared UI**: `src/components/ui/AppNavigation.tsx`, `src/components/ui/BrandLogo.tsx`, `src/components/ui/NumeralToggle.tsx`, `src/components/ui/AudioReadButton.tsx`, `src/components/ui/MascotFrog.tsx`.
- **Lesson Player & Manipulatives**: `src/components/lesson/LessonPlayer.tsx`, `src/components/lesson/LessonScratchpad.tsx`, `src/components/activities/GeometryDraw.tsx`, `src/components/activities/ScenarioChoice.tsx`.
- **Hub Screens**: `src/app/page.tsx`, `src/components/learn/LearningPathClient.tsx`, `src/components/garden/GardenClient.tsx`, `src/components/play/PlayStudioClient.tsx`.
- **Tests**: Vitest unit tests and Playwright E2E + `@axe-core/playwright` WCAG 2.2 AA suites.
