# Design: 006-joyful-play-and-garden

## Key Design Choices

1. **Musical Pentatonic Feedback & Companion Mascot (`src/lib/audio/chimes.ts`, `src/components/ui/CelebrationBurst.tsx`, `src/components/ui/MascotFrog.tsx`)**
   - Add `playScaleNote(stepIndex, enabled)` mapping counts `0..15` onto a warm C-major pentatonic scale (`C4, D4, E4, G4, A4, C5, D5, E5, G5, A5, C6`) plus `playWaterPlop(enabled)` for frog hops.
   - Render `<MascotFrog mood="curious" | "happy" | "encouraging" />` and `<CelebrationBurst active />` in pure inline SVG (zero `<foreignObject>`), respecting `prefers-reduced-motion`.

2. **Living Khmer Learning Garden (`src/lib/math/garden.ts`, `src/components/garden/GardenClient.tsx`, `src/app/garden/page.tsx`)**
   - Derive garden growth purely from IndexedDB `progressByLesson`: mangoes on the tree = completed Early Foundations lessons (minimum 2 starter mangoes so even brand-new kids can play immediately!), blooming pink lotuses = completed Geometry/Fractions/Daily puzzles (minimum 1 starter lotus), butterflies = earned badges + 1 starter butterfly.
   - Every element is tappable (`>= 56x56 px` hit targets or controls) with gentle musical chimes and Khmer counting labels.

3. **Interactive Math Play Studio (`src/lib/math/kramaPattern.ts`, `src/components/play/PlayStudioClient.tsx`, `src/app/play/page.tsx`)**
   - **Cambodian Market Stall**: Generates friendly village orders (e.g. mangoes/oranges/lotus bundles + exact KHR price `500៛–3,000៛`). Child packs exact fruit count into a woven tray and places exact Riel banknotes (`100៛, 500៛, 1,000៛, 2,000៛`), earning cheerful Khmer gratitude + calm milestone XP (`+5 XP` per completed order, no countdown timer).
   - **Krama Pattern Weaver**: 8-slot traditional Cambodian *ក្រមា* loom where kids tap colors (`ក្រហម`, `ខៀវ`, `លឿង`, `បៃតង`) to weave patterns, play them back as a pentatonic melody, and detect real repeating mathematical patterns (`AB`, `ABB`, `ABC`, `AABB`, `ABCD`) via pure `detectKramaPattern()` logic.
