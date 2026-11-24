# Tasks

## 1. Tactile 3D Theme Tokens & Shared UI Controls

- [x] 1.1 Add WCAG 2.2 AA verified 6-candy color tokens (`sun`, `ocean`, `leaf`, `berry`, `tangerine`, `grape`), tactile 3D button/tile/pill utilities (`.btn-3d`, `.tile-3d`, `.pill-3d`, `.crayon-swatch`), and reduced-motion-safe animations (`bob`, `wobble`, `chomp`, `floatUp`) in `src/app/globals.css`, verifying `npm run build` succeeds.
- [x] 1.2 Upgrade `src/components/ui/BrandLogo.tsx`, `src/components/ui/NumeralToggle.tsx`, `src/components/ui/AudioReadButton.tsx`, and `src/components/ui/MascotFrog.tsx` (adding optional golden crown prop and bobbing animation) with Letter Zoo's tilted 3D badge and pill-switch styling, and verify unit tests pass via `npm run test:unit`.

## 2. Responsive Navigation Shell & Candy-Colored `/learn` Hub

- [x] 2.1 Upgrade `src/components/ui/AppNavigation.tsx` to support a warm cream-yellow active tab highlight, 3D tactile tab buttons, a mobile bottom safe-area dock (`< 900px`), and a vertical left side rail on wide landscape viewports (`>= 900px`), preserving focus-mode auto-hide.
- [x] 2.2 Revamp `src/app/page.tsx` and `src/components/learn/LearningPathClient.tsx` with cycling 6-candy 3D lesson tiles, 1–3 star mastery indicators, tactile path filter pills, and side-rail layout clearance, and verify with Playwright tests on `360x800` and `1024x768` viewports.

## 3. Conversational `<LessonPlayer />` Stage & "Treat Time" Celebration

- [x] 3.1 Upgrade `src/components/lesson/LessonPlayer.tsx` with the persistent conversational `<MascotFrog />` prompt bubble + chunky 3D `<AudioReadButton />` chip, circular numbered step dots (`data-testid="step-dot-indicator"`), and an inline SVG `<SproutingBudMeter />` (`data-testid="sprouting-bud-meter"`), arranging the math board and controls in a 2-column grid at `>= 900px`.
- [x] 3.2 Add the interactive "Treat Time" (`បញ្ចុកផ្លែស្វាយកូនកង្កែប!`) celebration stage to the lesson completion view in `src/components/lesson/LessonPlayer.tsx` with a 3D treat button (`data-testid="feed-mascot-btn"`), chomp animation, 3 friendship hearts (`data-testid="treat-hearts"`), and crown unlock at 3 treats, and verify via Playwright lesson player tests.

## 4. Direct-Touch Living Garden Habitat (`/garden`) & Play Studio (`/play`)

- [x] 4.1 Upgrade `src/components/garden/GardenClient.tsx` so learners can tap directly on the pond frog, mangoes, lotus flowers, and butterflies inside the SVG habitat (triggering immediate motion, a Khmer speech bubble `data-testid="garden-speech-bubble"`, and floating hearts) and render the tactile "All Garden Friends" collection grid (`data-testid="garden-collection-grid"`) below the habitat.
- [x] 4.2 Upgrade `src/components/play/PlayStudioClient.tsx`, `src/components/lesson/LessonScratchpad.tsx`, and `src/components/activities/GeometryDraw.tsx` with tactile 3D game mode cards and circular lifted crayon color swatches (`.crayon-swatch`), and verify `/garden` and `/play` scenarios with Playwright and `@axe-core/playwright`.

## 5. End-to-End & WCAG 2.2 AA Integration Verification

- [x] 5.1 Run full content validation (`npm run validate:content`), unit tests (`npm run test:unit`), and Playwright E2E + `@axe-core/playwright` WCAG 2.2 AA accessibility suite (`npm run test:e2e`) across `360x800` mobile and `1024x768` landscape viewports and verify zero failures.
