# Design

## Context

See `proposal.md` for motivation and root-cause analysis. Soun Kanit (សួនគណិត) runs on Next.js 16.4.6 (`cacheComponents: true`, `partialPrefetching: true`), React 19.3, Tailwind CSS v4, Serwist v9.5 (`@serwist/cli` config mode), and `idb` v8. On real mobile phones (both local Wi-Fi testing against `next dev` and production builds via `next start`), five architectural issues interact to leave the UI appearing stuck or unresponsive:
1. Next.js 16 blocks cross-origin dev requests to `/_next/*` when accessed via LAN IP (`192.168.*.*`, `10.*.*.*`, `172.*.*.*`) unless `allowedDevOrigins` is configured in `next.config.ts`.
2. `src/app/learn/[lessonId]/page.tsx` awaits `params` outside `<Suspense>`, conflicting with Next.js 16 `partialPrefetching` shared App Shell rules.
3. `public/sw.js` was not regenerated during `npm run build` and contained an invalid dynamic route literal (`/learn/[lessonId]`) plus outdated chunk hashes (`2WHA2kYvwcQYlvhvEtGG_` vs current `.next/BUILD_ID`), causing mobile browsers with an active Service Worker to serve stale HTML referencing 404 JS chunks.
4. `CountingStage`, `NumberLine`, and `LessonScratchpad` rely solely on React `useState` for pointer drag tracking (`dragging`, `isDragging`, `activeStroke`), dropping single-frame mobile touch gestures where `pointerdown`, `pointermove`, and `pointerup` fire before React commits a re-render.
5. On `< 900px` mobile portrait screens, the primary lesson action bar ("ពិនិត្យចម្លើយ" / "សុំជំនួយ" / "បន្តទៅមុខ") sits below the fold at the end of the document flow (~720px down vs ~560–660px visible mobile viewport height), and `recordStepCompleted` / `recordLessonFinished` await IndexedDB transactions without a timeout guard.

## Goals / Non-Goals

**Goals:**
- Ensure opening Soun Kanit from any mobile phone browser (over LAN IP in development or production PWA) loads and hydrates all client bundles without cross-origin blocks or stale Service Worker chunk 404s.
- Guarantee instant, non-blocking `<Suspense>` App Shell navigation into `/learn/[lessonId]` under Next.js 16 `cacheComponents` and `partialPrefetching`.
- Make all touch pointer interactions in `CountingStage`, `NumberLine`, `GeometryDraw`, and `LessonScratchpad` deterministic on single-frame mobile touch events using synchronous refs while preserving smooth vertical page scrolling.
- Keep primary lesson and daily-puzzle action buttons ("ពិនិត្យចម្លើយ", "សុំជំនួយ", "បន្តទៅមុខ") docked in a sticky bottom safe-area bar on mobile portrait screens (`< 900px`) and guard IndexedDB writes with a bounded timeout so progression never hangs.

**Non-Goals:**
- Changing lesson JSON schemas (`LessonDocumentV1Schema`) or introducing any `<foreignObject>` inside SVGs.
- Altering desktop/landscape (`>= 900px`) two-column lesson workspace layout.

## Decisions

### 1. Mobile LAN `allowedDevOrigins` & `<Suspense>` App Shell for `/learn/[lessonId]`
- **Decision**:
  - In `next.config.ts`, configure `allowedDevOrigins` to include common local/LAN hostname patterns (`"localhost"`, `"127.0.0.1"`, `"*.local"`, `"192.168.*.*"`, `"10.*.*.*"`, `"172.16.*.*"`, `"172.17.*.*"`, `"172.18.*.*"`, `"172.19.*.*"`, `"172.20.*.*"`, `"172.21.*.*"`, `"172.22.*.*"`, `"172.23.*.*"`, `"172.24.*.*"`, `"172.25.*.*"`, `"172.26.*.*"`, `"172.27.*.*"`, `"172.28.*.*"`, `"172.29.*.*"`, `"172.30.*.*"`, `"172.31.*.*"`), plus any custom hostnames from `process.env.ALLOWED_DEV_ORIGINS`.
  - In `src/app/learn/[lessonId]/page.tsx`, keep the outer `LessonPage` component synchronous and pass `params` into an async `<LessonContent params={params} />` child wrapped in `<Suspense fallback={<LessonLoadingShell />}>` (and mark `loadLessonById` / lesson lookup clean and deterministic).
- **Rationale**: Follows the official Next.js 16 `adopting-partial-prefetching.md` and `allowedDevOrigins.md` guides in `node_modules/next/dist/docs/`, eliminating cross-origin script blocks on mobile Wi-Fi testing and allowing Next.js 16 to prefetch a valid shared App Shell for `/learn/[lessonId]`.
- **Alternatives considered**: Disabling `partialPrefetching` or `cacheComponents` (rejected because Next.js 16 docs note both flags become mandatory in the next major release).

### 2. Self-Healing Service Worker Lifecycle & Build Sync
- **Decision**:
  - Update `serwist.config.js` to exclude bracketed dynamic route placeholders (`globIgnores: ["audio/**", "**/[*]*"]` or manifest transform filtering out URLs containing `[` or `]`) so `/learn/[lessonId]` never causes `bad-precaching-response` (HTTP 404) during SW install.
  - Update `package.json` `"build"` script to `"next build && npx serwist build"` so `public/sw.js` always matches `.next/BUILD_ID` and current `.next/static/chunks/*` filenames.
  - In `LearnerProvider.tsx`:
    - When `process.env.NODE_ENV !== "production"` (or when a `ChunkLoadError` / script error occurs), actively unregister any existing Service Workers on the origin and delete stale `serwist-precache*` caches so a phone switching between `next start` and `next dev` is never trapped by a leftover SW.
    - When registering `/sw.js` in production, call `registration.update()` and listen for `controllerchange` safely without infinite reload loops.
- **Rationale**: A stale `public/sw.js` with `clientsClaim: true` is the #1 silent cause of "stuck UI" on mobile phones after rebuilds. Automating `serwist build` and adding dev/error cache eviction makes the PWA self-healing.

### 3. Synchronous `useRef` Pointer State & Scroll-Safe Touch Surfaces
- **Decision**:
  - In `CountingStage.tsx`, maintain a synchronous `dragRef = useRef<DragState | null>(null)` alongside visual `dragging` state. Update `dragRef.current` synchronously in `onPointerDown`, `onPointerMove`, `onPointerUp`, and `onPointerCancel`, and also add an `onClick` fallback guard (`lastPointerUpTimeRef`) so standard taps, screen-reader activations, and single-frame touch gestures always select/move tokens reliably.
  - In `NumberLine.tsx` and `LessonScratchpad.tsx`, mirror `isDragging` and `activeStroke` in synchronous refs (`isDraggingRef`, `activeStrokeRef`) so back-to-back `pointerdown` → `pointermove` → `pointerup` events within the same animation frame are never ignored.
  - In `GeometryDraw.tsx`, add an explicit `onClick` fallback on `draw-cell-${r}-${c}` (guarded against double-firing when `onPointerDown` already painted the cell during the same tap) and only capture the pointer on the parent `<svg>` once pointer movement crosses a small threshold or while actively painting unlocked cells, keeping page scrolling responsive.
- **Rationale**: React 19 batches state updates asynchronously; reading `useState` variables inside `onPointerMove` / `onPointerUp` fails whenever the mobile OS coalesces touch down/move/up events into a single tick.

### 4. Sticky Mobile Bottom Action Bar (`< 900px`) & Bounded IndexedDB Timeout
- **Decision**:
  - In `LessonPlayer.tsx` and `DailyPuzzleClient.tsx`, style the primary action container ("ពិនិត្យចម្លើយ" / "សុំជំនួយ" / "បន្តទៅមុខ") as a sticky bottom dock on mobile viewports (`sticky bottom-0 z-20 -mx-2.5 sm:-mx-3 border-t-2 border-[#c9c2b2] bg-surface/95 backdrop-blur px-2.5 sm:px-3 pt-2.5 pb-[calc(0.75rem+env(safe-area-inset-bottom))] min-[900px]:static min-[900px]:mx-0 min-[900px]:border-0 min-[900px]:bg-transparent min-[900px]:p-0`).
  - Wrap IndexedDB operations in `src/lib/storage/idb.ts` (and `LearnerProvider` persistence calls) with a bounded timeout helper (`withStorageTimeout(promise, 1200, fallbackValue)`) and reset `dbPromise = null` if `openDB` rejects or closes, ensuring `handleCheckAnswer` and `handleContinue` always complete promptly even in restricted mobile WebViews or private browsing modes.
- **Rationale**: On 360×640 and 360×800 phones, a sticky bottom action dock guarantees the primary CTA is always visible in the thumb zone right below the math board, and bounded storage timeouts prevent any UI lockup on step transitions.

## Risks / Trade-offs

- **[Risk] Sticky bottom bar in `LessonPlayer` could obscure the bottom of the math board if bottom padding is insufficient** → Mitigation: Use `sticky bottom-0` inside the flex/grid flow (rather than detached `fixed` overlay) with `pb-[calc(0.75rem+env(safe-area-inset-bottom))]` so document scroll height naturally accounts for the bar's height and never covers the last control.
- **[Risk] Both `onPointerDown` and `onClick` firing on a single tap in `GeometryDraw` cell painting could toggle a cell twice (paint then immediately erase)** → Mitigation: Record a timestamp/flag in `dragPaintRef.current.handledByPointer` during `onPointerDown` and clear it after `click` (or 300ms), so `onClick` only fires for keyboard/assistive or synthesized clicks that did not trigger pointer painting.
