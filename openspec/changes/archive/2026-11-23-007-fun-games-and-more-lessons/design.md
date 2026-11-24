# Design: 007-fun-games-and-more-lessons

1. **Four-Path Unrestricted Curriculum (`src/lib/curriculum/loader.ts`)**
   - Add `multiplication-and-algebra` (*វិធីគុណ ចែក និងពិជគណិត*, Grades 2–6) with 4 Zod-validated JSON lessons (`m01`–`m04`).
   - Add `g04-symmetry-and-patterns.json` to `geometry-foundations` and `f04-fraction-addition.json` to `fractions-and-decimals`.
   - Generate local offline Khmer MP3 audio clips for all 18 new steps in `public/audio/steps/`.

2. **Two New Zero-Timer Interactive Play Modes (`src/components/play/PlayStudioClient.tsx`)**
   - **Frog Pond Target Jump (`frog`)**: Interactive inline SVG pond track (`0–20`) with a glowing golden lotus target and `>= 56x56 px` jump cards (`+1`, `+2`, `+5`, `-1`), water-plop sounds, and celebration burst on exact landing.
   - **Mystery Balance Scale (`scale`)**: Visual algebra balance scale (`? + a = b`) where children test numbered stones (`1..9`) on a tilting inline SVG beam until the scale levels and celebrates in Khmer.
