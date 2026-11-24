# Design

## Context

See [proposal.md](./proposal.md) for motivation. Konleuh Kanit is a Khmer-first Next.js 16 (App Router) + React 19 + Tailwind CSS v4 math platform for Cambodian children aged 6–12. We are translating the tactile 3D button physics, cycling candy-color accents, conversational mascot prompt bubble, responsive two-column landscape lesson stage, "Treat Time" celebration overlay, and direct-touch living habitat from **Letter Zoo** (`D:\Antigravity\letter-zoo`) into Konleuh Kanit while strictly upholding all non-negotiable guardrails:

1. **Khmer-First Typography**: `<html lang="km">`, `Kantumruy_Pro` + `Noto_Sans_Khmer`, `line-height: 1.7` (`1.65–1.8`), `letter-spacing: 0 !important`, and zero clipped subscripts/vowels.
2. **Dual Numerals & ZWSP Safety**: Khmer numerals (`០–៩`) by default, persistent one-tap toggle (`១២៣` / `123`), and `U+200B` stripping before grading.
3. **Touch & WCAG 2.2 AA Accessibility**: Single-pointer tap-to-select + tap-to-place alternatives for all drag interactions, `>= 56x56 CSS px` for `.manipulative-target`, `>= 44x44 CSS px` for buttons, `scroll-margin-top: 6rem`, and zero `@axe-core/playwright` contrast violations.
4. **Safari SVG Safety**: Pure inline `<svg>` with explicit `viewBox` and zero `<foreignObject>`.
5. **Calm Pedagogy**: Zero countdown timers, zero global leaderboards, zero loot boxes, and warm low-fatigue OKLCH ivory surfaces.

## Goals / Non-Goals

**Goals:**
- Introduce reusable 3D tactile CSS utilities (`.btn-3d`, `.tile-3d`, `.pill-3d`, `.crayon-swatch`) and 6 WCAG 2.2 AA contrast-verified candy theme tokens (`sun`, `ocean`, `leaf`, `berry`, `tangerine`, `grape`) in `src/app/globals.css`.
- Upgrade `<LessonPlayer />` with a permanent conversational `<MascotFrog />` speech bubble + 3D audio read-aloud chip, numbered circular step dots (`១..N`), an inline SVG sprouting lotus/mango bud progress meter, a responsive 2-column landscape/desktop layout (`>= 900px`), and an interactive "Treat Time" frog-feeding celebration on lesson completion.
- Upgrade `/garden` (`<GardenClient />`) so children can tap directly on the SVG pond frog, mangoes, lotus flowers, and butterflies to trigger animations, floating Khmer speech bubbles, and floating hearts, plus a collection grid of unlocked and locked garden friends below.
- Upgrade `/learn` (`<LearningPathClient />`), `/play` (`<PlayStudioClient />`), and `<AppNavigation />` with candy-color cycling 3D cards, 1–3 mastery stars, circular lifted crayon swatches, and a responsive bottom-dock-to-left-side-rail navigation shell.

**Non-Goals:**
- No global leaderboards or public score rankings (unlike Letter Zoo's `Champions` tab, Konleuh Kanit remains strictly non-competitive per Calm Pedagogy guardrails).
- No changes to the Zod lesson schema (`LessonDocumentV1Schema`) or math grader (`gradeStep`).
- No replacement of `Kantumruy Pro` / `Noto Sans Khmer` with Latin-only rounded display fonts (`Baloo 2` / `Nunito`).

## Decisions

### 1. Tactile 3D CSS Utilities & WCAG 2.2 AA Candy Palette in `globals.css`
- **Decision**: Define 6 candy theme token triplets (`--candy-bg`, `--candy-edge`, `--candy-ink`, `--candy-tint`) and tactile 3D surface classes in `src/app/globals.css` on top of the warm OKLCH ivory canvas (`--color-canvas: oklch(0.985 0.006 85)`):
  - **Sun Gold**: bg `#FFD23F`, edge `#C89600`, ink `#1E2A4A` (contrast `> 10:1`), soft `#FFF3BF`
  - **Ocean Blue**: bg `#1D5FD6`, edge `#13429E`, ink `#FFFFFF` (contrast `> 5.7:1`), soft `#E5F0FF`
  - **Leaf Mint**: bg `#22C57B`, edge `#148F56`, ink `#0D2B1D` (contrast `> 8.5:1`), soft `#E3FBEF`
  - **Berry Pink**: bg `#D62860`, edge `#9E1943`, ink `#FFFFFF` (contrast `> 5.3:1`), soft `#FFE3EC`
  - **Tangerine**: bg `#FF8C42`, edge `#C85A14`, ink `#1E2A4A` (contrast `> 6.8:1`), soft `#FFEDE0`
  - **Grape Purple**: bg `#7C3AED`, edge `#5620B8`, ink `#FFFFFF` (contrast `> 5.7:1`), soft `#F0E7FF`
- **Rationale**: Letter Zoo's exact `--berry: #FF5C8A` and `--ocean: #3A86FF` with white text rely on giant `38px–46px` display glyphs, whereas Konleuh Kanit renders `12px–16px` Khmer labels on badges and buttons. Deepening Berry (`#D62860`) and Ocean (`#1D5FD6`) when paired with `#FFFFFF` ink—and using deep navy `#1E2A4A` / forest `#0D2B1D` on Sun, Tangerine, and Leaf—preserves the exact vibrant candy aesthetic while passing `@axe-core/playwright` WCAG 2.2 AA (`>= 4.5:1`) at all font sizes.
- **3D Press Physics**:
  - `.btn-3d` applies `box-shadow: 0 5px 0 var(--btn-edge, var(--color-border))` and `transition: transform 80ms ease, box-shadow 80ms ease`.
  - `.btn-3d:active:not(:disabled)` applies `transform: translateY(4px)` and `box-shadow: 0 1px 0 var(--btn-edge, var(--color-border))`.

### 2. Two-Column Landscape Lesson Stage & Conversational `<MascotFrog />` Bubble
- **Decision**:
  - At the top of the active step in `<LessonPlayer />`, render a permanent `.mascot-bubble` card containing a gently bobbing `<MascotFrog mood={...} />`, the Khmer step prompt (`data-testid="step-prompt"`), and a chunky 3D `<AudioReadButton />` chip. When `gradeResult` is present, the bubble updates `<MascotFrog />`'s mood (`happy` or `encouraging`) while keeping the dedicated `data-testid="feedback-panel"` for diagnostic explanation and audio read-aloud.
  - Inside the math board card header, render circular numbered step badges (`១..N`, `data-testid="step-dot-indicator"`) alongside an inline SVG `<SproutingBudMeter />` (`data-testid="sprouting-bud-meter"`) whose stem, leaves, and lotus/mango blossom grow proportionally with `completedStepIds.length / totalSteps`.
  - On viewports `>= 900px` (`lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-6`), place the white math board card (step dots + bud meter + `<ActivityRenderer />`) in the left column and the mascot prompt bubble, feedback/hint drawers, and chunky 3D action controls in the right column.
- **Alternatives Considered**: Locking `.app` to `height: 100dvh; overflow: hidden` on all screens as Letter Zoo does for its single-canvas tracing board. Rejected for 360x800 mobile portrait because Konleuh Kanit's multi-tier elaborative hints, scratchpad, and tall SVG manipulatives (such as 10-frames with outside trays) need vertical scroll flexibility on compact phones (`interactive-lesson-player` Scenario: *Lesson view adapts to dynamic mobile viewport height*).

### 3. Interactive "Treat Time" Celebration on Lesson Summary
- **Decision**: Inside `<LessonPlayer />`'s completion summary (`data-testid="lesson-summary"`), add a tactile **"Treat Time" (`បញ្ចុកផ្លែស្វាយកូនកង្កែប!`)** stage above the mastery stats:
  - Displays `<MascotFrog mood="happy" size={88} />` (with an inline SVG golden crown when 3 hearts are filled), 3 friendship heart indicators (`♥ ♥ ♥`, `data-testid="treat-hearts"`), and a 3D saucer holding a bouncing mango/lotus treat button (`data-testid="feed-mascot-btn"`, `>= 56x56px`).
  - Tapping the treat button animates the treat toward the frog, plays a joyful chime (`playScaleNote` / `playSuccessChime`), increments the fed counter (`0 -> 3`), fills a bright pink friendship heart, and crowns the frog at 3 treats.
- **Rationale**: Mirrors Letter Zoo's beloved post-letter `.reward` / `.feed` interaction using pure React state + inline SVG/CSS keyframes with zero timers, zero loot boxes, and zero external dependencies.

### 4. Direct-Touch Living Garden Habitat & Collection Grid (`/garden`)
- **Decision**:
  - In `<GardenClient />`, attach accessible interactive SVG hit targets (`role="button"`, `tabIndex={0}`, `className="manipulative-target"`, `>= 56x56px` hit area or grouped interactive regions) directly to the mango orchard canopy, pond frog, lotus cluster, and butterfly group inside the habitat SVG, while keeping the chunky 3D quick-action buttons below the canvas as redundant accessible controls.
  - When a child taps an element inside the SVG habitat (or its matching control), render an inline SVG/HTML speech pill (`data-testid="garden-speech-bubble"`, e.g. `"ប្ល៊ុប!"`, `"ផ្កាឈូករីកហើយ!"`, `"ស្វាយទុំផ្អែម!"`) and a floating pink heart animation (`@keyframes floatUp`).
  - Below the habitat, add a **"មិត្តក្នុងសួនទាំងអស់" (All Garden Friends)** collection grid (`data-testid="garden-collection-grid"`) modeled after Letter Zoo's `.zoo-grid`, displaying unlocked garden items/creatures on elevated 3D white cards with friendship hearts (`♥ ♥ ♥`) and locked cards on soft `--color-surface-subtle` with a wobbling spotted bud/egg SVG and Khmer guidance (`"រៀនមេរៀនបន្ថែមដើម្បីដាំ!"`).

### 5. Responsive Bottom Dock to Left Side Rail in `<AppNavigation />`
- **Decision**:
  - Restyle `<AppNavigation />` with a warm cream-yellow active pill (`bg-[#FFF1B8] text-[#1E2A4A]` with dark border/lip contrast), tactile icons, and a pink notification badge on the Garden tab when new garden growth is available.
  - On mobile/portrait (`< 900px`), keep the fixed bottom dock with safe-area padding (`pb-[calc(0.375rem+env(safe-area-inset-bottom))]`) so all existing 360x800 mobile layout tests pass.
  - On wide landscape/desktop (`min-[900px]:fixed min-[900px]:left-0 min-[900px]:top-0 min-[900px]:bottom-0 min-[900px]:w-[112px]`), dock the navigation bar as a rounded left vertical side rail (`rounded-r-[32px]`) and offset non-focus hub layouts accordingly.

## Risks / Trade-offs

- **[Risk] Color contrast regressions from candy-color backgrounds with Khmer text** → **Mitigation**: Use WCAG 2.2 AA verified foreground/background pairs (`>= 4.5:1` contrast ratio for all normal text) and run `npm run test:e2e` (`@axe-core/playwright`) across `/`, `/learn`, `/learn/[lessonId]`, `/play`, and `/garden`.
- **[Risk] 360px horizontal overflow when adding 3D borders, step dots, or side-rail breakpoints** → **Mitigation**: Keep the side-rail breakpoint strictly at `min-[900px]` so `360x800` mobile viewports continue using the proven compact two-row lesson header and bottom dock; allow step dots to wrap cleanly (`flex-wrap`) when a lesson has 4+ steps.
- **[Risk] Existing Playwright `data-testid` selectors breaking** → **Mitigation**: Preserve every existing `data-testid` (`step-prompt`, `check-answer-btn`, `hint-btn`, `continue-btn`, `feedback-panel`, `hint-drawer`, `lesson-summary`, `summary-mastery-tier`, `app-bottom-nav`, `nav-tab-*`, `nav-more-btn`, etc.) while adding new `data-testid` attributes for new interactive elements (`sprouting-bud-meter`, `feed-mascot-btn`, `treat-hearts`, `garden-collection-grid`).
