# Proposal

## Why

When Soun Kanit (សួនគណិត) is opened on a mobile phone, the UI can appear frozen, fail to hydrate or navigate, or leave interactive lesson steps stuck. Root-cause inspection revealed five compounding mobile failure points:
1. **LAN Mobile Dev Asset Blocking (`allowedDevOrigins`) & Unwrapped Dynamic Params (`partialPrefetching`)**: In Next.js 16, opening `next dev` from a mobile phone over a Wi-Fi/LAN IP (`192.168.*.*`, `10.*.*.*`, `172.*.*.*`) blocks `/_next/static/*` client script chunks unless `allowedDevOrigins` is configured, leaving the server-rendered HTML completely unhydrated and unresponsive. Additionally, `/learn/[lessonId]` awaits `params` outside a `<Suspense>` boundary while `cacheComponents` and `partialPrefetching` are enabled, blocking the shared App Shell during mobile navigation.
2. **Stale Precache Service Worker Poisoning (`public/sw.js`)**: `public/sw.js` contains stale precache chunk hashes from an older build and an invalid `/learn/[lessonId]` literal route entry that returns HTTP 404. Because `npm run build` did not regenerate or clean `public/sw.js` and `LearnerProvider` never evicted stale service workers or outdated precache caches, mobile browsers serving cached shells load 404 script chunks and freeze.
3. **Asynchronous React State Drops in Mobile Touch Handlers**: `CountingStage`, `NumberLine`, and `LessonScratchpad` track pointer drag lifecycle exclusively in React `useState` rather than synchronous refs, causing rapid mobile touch `pointerdown` → `pointermove` → `pointerup` sequences within a single frame to read stale `null` state and drop taps or drags. In `GeometryDraw`, grid cells only bound `onPointerDown` without a click fallback while locking vertical page scrolling across the entire 320×320 SVG surface.
4. **Below-the-Fold Primary Lesson Action Controls on Mobile Phones**: On portrait mobile viewports (`< 900px`), the header, mascot prompt bubble, and SVG math board push the primary action bar ("ពិនិត្យចម្លើយ" / "សុំជំនួយ" / "បន្តទៅមុខ") below the visible mobile browser fold without a sticky dock or auto-scroll on feedback reveal, leaving children unable to see how to check or advance steps.
5. **Unbounded IndexedDB Transactions on Mobile Browsers**: If a mobile browser or in-app WebView stalls or blocks IndexedDB `openDB`, awaiting `recordStepCompleted` or `recordLessonFinished` without a timeout can leave the "ពិនិត្យចម្លើយ" / "បន្តទៅមុខ" button permanently stuck.

## What Changes

- **Allow Mobile LAN Origins & Streaming Lesson Shell (`next.config.ts`, `src/app/learn/[lessonId]/page.tsx`)**: Configure `allowedDevOrigins` for standard private LAN ranges and `.local` mDNS hostnames so mobile phones testing over Wi-Fi load all `/_next/*` client chunks cleanly, and wrap dynamic `params` resolution in `/learn/[lessonId]` inside a `<Suspense>` boundary with an instant Khmer loading shell compatible with Next.js 16 `partialPrefetching`.
- **Self-Healing Service Worker Lifecycle (`src/components/providers/LearnerProvider.tsx`, `src/app/sw.ts`, `serwist.config.js`, `package.json`)**: Exclude unresolvable bracketed route literals (`/learn/[lessonId]`) from precaching, regenerate `public/sw.js` automatically during `npm run build`, and add active self-healing in `LearnerProvider` that unregisters stale service workers in development and recovers automatically on chunk load errors.
- **Synchronous Touch Pointer Refs & Scroll-Safe Grid Painting (`CountingStage.tsx`, `NumberLine.tsx`, `GeometryDraw.tsx`, `LessonScratchpad.tsx`)**: Track active pointer drag state via synchronous `useRef` mirrors alongside React state so single-frame mobile taps and drags never drop, add click/tap fallbacks for grid cells in `GeometryDraw`, and allow vertical page scrolling when swiping outside active drag gestures.
- **Sticky Mobile Lesson & Daily Action Bar with Feedback Auto-Visibility (`LessonPlayer.tsx`, `DailyPuzzleClient.tsx`)**: Dock the primary lesson action bar ("ពិនិត្យចម្លើយ" / "សុំជំនួយ" / "បន្តទៅមុខ") into a sticky bottom safe-area bar on mobile portrait viewports (`< 900px`) and smoothly ensure feedback/continue controls remain visible so learners never get stuck after manipulating the board.
- **Bounded Non-Blocking IndexedDB Persistence (`src/lib/storage/idb.ts`, `LearnerProvider.tsx`)**: Guard IndexedDB open and write operations with a bounded timeout and in-memory fallback so lesson progression and step checking never hang if mobile browser storage is restricted or delayed.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `interactive-lesson-player`: Add requirements for sticky mobile bottom action dock (`< 900px`), instant `<Suspense>` lesson shell navigation, and non-blocking step submission/progression on mobile browsers.
- `activity-engine-primitives`: Strengthen mobile touch pointer requirements so synchronous ref-backed pointer tracking handles same-frame mobile taps/drags and `geometry-draw` cells respond reliably to both single taps and continuous touch painting without trapping vertical page scroll.
- `offline-progress-mastery`: Require self-healing Service Worker registration/cache cleanup and bounded non-blocking IndexedDB fallback so stale SW caches or restricted mobile storage never freeze hydration or lesson progression.

## Impact

- **Config & Build**: `next.config.ts`, `serwist.config.js`, `package.json`, `src/app/sw.ts`
- **Routing & Providers**: `src/app/learn/[lessonId]/page.tsx`, `src/components/providers/LearnerProvider.tsx`, `src/lib/storage/idb.ts`
- **Lesson & Activity UI**: `src/components/lesson/LessonPlayer.tsx`, `src/components/daily/DailyPuzzleClient.tsx`, `src/components/lesson/LessonScratchpad.tsx`, `src/components/activities/CountingStage.tsx`, `src/components/activities/NumberLine.tsx`, `src/components/activities/GeometryDraw.tsx`
- **Verification**: Vitest unit tests (`src/__tests__/`) and Playwright mobile E2E suite (`e2e/mvp-lesson-engine.spec.ts`)
