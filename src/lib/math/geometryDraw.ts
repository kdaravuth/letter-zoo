export interface GridPoint {
  row: number;
  col: number;
}

export interface DrawnEdge {
  from: string; // "r,c"
  to: string;   // "r,c"
}

export type DetectedPolygonKind =
  | "triangle"
  | "square"
  | "rectangle"
  | "polygon"
  | "open";

export interface PolygonAnalysis {
  isClosed: boolean;
  cornerCount: number;
  kind: DetectedPolygonKind;
  corners: GridPoint[];
}

export function pointKey(row: number, col: number): string {
  return `${row},${col}`;
}

export function parsePointKey(key: string): GridPoint | null {
  const parts = key.split(",").map((s) => Number(s.trim()));
  if (parts.length !== 2 || !Number.isInteger(parts[0]) || !Number.isInteger(parts[1])) {
    return null;
  }
  return { row: parts[0], col: parts[1] };
}

export function canonicalEdgeKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

function areCollinear(p1: GridPoint, p2: GridPoint, p3: GridPoint): boolean {
  const dx1 = p2.col - p1.col;
  const dy1 = p2.row - p1.row;
  const dx2 = p3.col - p2.col;
  const dy2 = p3.row - p2.row;
  return dx1 * dy2 - dy1 * dx2 === 0;
}

function distSq(a: GridPoint, b: GridPoint): number {
  const dx = a.col - b.col;
  const dy = a.row - b.row;
  return dx * dx + dy * dy;
}

function isRightAngle(prev: GridPoint, curr: GridPoint, next: GridPoint): boolean {
  const v1x = prev.col - curr.col;
  const v1y = prev.row - curr.row;
  const v2x = next.col - curr.col;
  const v2y = next.row - curr.row;
  return v1x * v2x + v1y * v2y === 0;
}

/**
 * Pure geometric classifier for pegboard drawings.
 * Accepts any closed simple polygon regardless of position, size, or rotation,
 * collapsing collinear intermediate pegs into clean geometric corners.
 */
export function analyzeDrawnPolygon(edges: DrawnEdge[]): PolygonAnalysis {
  if (edges.length < 3) {
    return { isClosed: false, cornerCount: 0, kind: "open", corners: [] };
  }

  // Deduplicate undirected edges and build adjacency list
  const adj = new Map<string, Set<string>>();
  for (const e of edges) {
    if (e.from === e.to) continue;
    if (!parsePointKey(e.from) || !parsePointKey(e.to)) continue;
    if (!adj.has(e.from)) adj.set(e.from, new Set());
    if (!adj.has(e.to)) adj.set(e.to, new Set());
    adj.get(e.from)!.add(e.to);
    adj.get(e.to)!.add(e.from);
  }

  const vertices = Array.from(adj.keys());
  if (vertices.length < 3) {
    return { isClosed: false, cornerCount: 0, kind: "open", corners: [] };
  }

  // Every vertex in a single simple closed polygon must have degree 2
  for (const v of vertices) {
    if ((adj.get(v)?.size ?? 0) !== 2) {
      return { isClosed: false, cornerCount: 0, kind: "open", corners: [] };
    }
  }

  // Walk the cycle starting at vertices[0]
  const orderedKeys: string[] = [];
  let prev = "";
  let curr = vertices[0];
  const visited = new Set<string>();

  while (!visited.has(curr)) {
    visited.add(curr);
    orderedKeys.push(curr);
    const neighbors = Array.from(adj.get(curr)!);
    const next = neighbors[0] === prev ? neighbors[1] : neighbors[0];
    prev = curr;
    curr = next;
  }

  // Must visit all active vertices in one connected loop
  if (visited.size !== vertices.length || curr !== vertices[0]) {
    return { isClosed: false, cornerCount: 0, kind: "open", corners: [] };
  }

  const orderedPoints = orderedKeys
    .map((k) => parsePointKey(k))
    .filter((p): p is GridPoint => p !== null);

  // Collapse collinear pass-through pegs into true corners
  const corners: GridPoint[] = [];
  const n = orderedPoints.length;
  for (let i = 0; i < n; i++) {
    const pPrev = orderedPoints[(i - 1 + n) % n];
    const pCurr = orderedPoints[i];
    const pNext = orderedPoints[(i + 1) % n];
    if (!areCollinear(pPrev, pCurr, pNext)) {
      corners.push(pCurr);
    }
  }

  if (corners.length < 3) {
    return { isClosed: false, cornerCount: corners.length, kind: "open", corners };
  }

  if (corners.length === 3) {
    return { isClosed: true, cornerCount: 3, kind: "triangle", corners };
  }

  if (corners.length === 4) {
    const allRight = corners.every((_, i) =>
      isRightAngle(
        corners[(i + 3) % 4],
        corners[i],
        corners[(i + 1) % 4]
      )
    );
    const sides = [0, 1, 2, 3].map((i) =>
      distSq(corners[i], corners[(i + 1) % 4])
    );
    const allEqual = sides.every((s) => s === sides[0]);

    if (allRight && allEqual) {
      return { isClosed: true, cornerCount: 4, kind: "square", corners };
    }
    if (allRight) {
      return { isClosed: true, cornerCount: 4, kind: "rectangle", corners };
    }
  }

  return {
    isClosed: true,
    cornerCount: corners.length,
    kind: "polygon",
    corners,
  };
}

/**
 * Computes the expected right-half mirrored cell keys ("r,c") for a given
 * left-half template across a vertical center symmetry line.
 */
export function computeMirrorCells(
  gridCols: number,
  leftCells: string[]
): string[] {
  const mirrored = new Set<string>();
  for (const key of leftCells) {
    const pt = parsePointKey(key);
    if (!pt) continue;
    const mirrorCol = gridCols - 1 - pt.col;
    if (mirrorCol >= 0 && mirrorCol < gridCols) {
      mirrored.add(pointKey(pt.row, mirrorCol));
    }
  }
  return Array.from(mirrored).sort();
}

export function checkSymmetryMirror(
  gridCols: number,
  leftCells: string[],
  drawnRightCells: string[]
): { isMatch: boolean; missingCount: number; extraCount: number } {
  const expectedSet = new Set(computeMirrorCells(gridCols, leftCells));
  const actualSet = new Set(drawnRightCells);

  let missingCount = 0;
  for (const k of expectedSet) {
    if (!actualSet.has(k)) missingCount++;
  }

  let extraCount = 0;
  for (const k of actualSet) {
    if (!expectedSet.has(k)) extraCount++;
  }

  return {
    isMatch: missingCount === 0 && extraCount === 0 && expectedSet.size > 0,
    missingCount,
    extraCount,
  };
}

export interface GridHitTestInput {
  clientX: number;
  clientY: number;
  rect: { left: number; top: number; width: number; height: number };
  svgWidth: number;
  svgHeight: number;
  gridRows: number;
  gridCols: number;
  pad?: number;
  lockLeftHalf?: boolean;
}

/**
 * Maps a pointer's client coordinates (touch/mouse/pen) to a grid cell { row, col, key }.
 * Enables continuous single-finger drag painting across SVG grid cells on mobile browsers
 * where implicit touch pointer capture prevents `onPointerEnter` on sibling `<g>` elements.
 */
export function clientPointToGridCell(
  input: GridHitTestInput
): { row: number; col: number; key: string } | null {
  const {
    clientX,
    clientY,
    rect,
    svgWidth,
    svgHeight,
    gridRows,
    gridCols,
    pad = 8,
    lockLeftHalf = false,
  } = input;

  if (
    rect.width <= 0 ||
    rect.height <= 0 ||
    gridRows <= 0 ||
    gridCols <= 0
  ) {
    return null;
  }

  const svgX = ((clientX - rect.left) / rect.width) * svgWidth;
  const svgY = ((clientY - rect.top) / rect.height) * svgHeight;
  if (
    svgX < pad ||
    svgX > svgWidth - pad ||
    svgY < pad ||
    svgY > svgHeight - pad
  ) {
    return null;
  }

  const innerW = svgWidth - pad * 2;
  const innerH = svgHeight - pad * 2;
  const cellW = innerW / gridCols;
  const cellH = innerH / gridRows;

  const col = Math.min(
    gridCols - 1,
    Math.max(0, Math.floor((svgX - pad) / cellW))
  );
  const row = Math.min(
    gridRows - 1,
    Math.max(0, Math.floor((svgY - pad) / cellH))
  );

  if (lockLeftHalf && col < Math.floor(gridCols / 2)) {
    return null;
  }

  return { row, col, key: pointKey(row, col) };
}
