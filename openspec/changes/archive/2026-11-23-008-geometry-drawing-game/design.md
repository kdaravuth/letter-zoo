# Design: 008-geometry-drawing-game

1. **Pure Geometric Drawing Analyzer (`src/lib/math/geometryDraw.ts`)**
   - `analyzeDrawnPolygon(edges)`: Builds adjacency graph of pegboard vertices `(r, c)`, verifies a single closed simple cycle (every active vertex has degree 2 and all active vertices are connected), skips collinear pass-through pegs to determine true polygon corners, and classifies `triangle` (3 corners), `square` (4 corners, equal side lengths, perpendicular), and `rectangle` (4 corners, perpendicular).
   - `checkSymmetryMirror(gridCols, leftCells, drawnRightCells)`: Mirrors each `(r, c)` in `leftCells` to `(r, gridCols - 1 - c)` and checks exact set equality with `drawnRightCells`.

2. **Safari-Safe Dual-Input `<GeometryDraw />` Primitive (`src/components/activities/GeometryDraw.tsx`)**
   - Uses inline `<svg viewBox="0 0 320 320">` with zero `<foreignObject>`.
   - On a 4×4 board (`80px` cell spacing), every interactive peg or grid cell `<g className="manipulative-target">` measures `>= 64x64 CSS px` on `360x800` mobile viewports.
   - Supports both single-pointer **tap-to-select + tap-to-connect** (WCAG 2.2 SC 2.5.7) and pointer drag painting/connecting, paired with ascending pentatonic musical notes (`playScaleNote`).

3. **Decoupled Lesson (`g05`) & `/play` Drawing Mode**
   - Author `content/paths/geometry-foundations/g05-drawing-shapes-and-symmetry.json` (4 steps: draw triangle, draw square, paint butterfly symmetry, paint area 6) and generate native Khmer MP3 prompts.
   - Add a 5th `draw` tab (`គូររូបគណិត`) to `PlayStudioClient.tsx` with rotating geoboard shape challenges, color ink selector, and Cambodian mirror-symmetry art templates (butterfly, lotus, temple).
