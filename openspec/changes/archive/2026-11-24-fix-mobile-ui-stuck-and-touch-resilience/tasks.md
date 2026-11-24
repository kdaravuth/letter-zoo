# Tasks

## 1. Mobile LAN Origins, `<Suspense>` Lesson Shell & Self-Healing Service Worker

- [x] 1.1 Configure `allowedDevOrigins` in `next.config.ts` for private LAN IP ranges (`192.168.*.*`, `10.*.*.*`, `172.16.*.*`–`172.31.*.*`), `localhost`, `127.0.0.1`, `*.local`, and `process.env.ALLOWED_DEV_ORIGINS`, and verify `npm run build` succeeds without config warnings.
- [x] 1.2 Refactor `src/app/learn/[lessonId]/page.tsx` so `params` resolution runs inside an async child wrapped in `<Suspense fallback={...}>` with a calm Khmer loading shell compatible with Next.js 16 `partialPrefetching`, and verify lesson routes prerender and stream cleanly during `npm run build`.
- [x] 1.3 Update `serwist.config.js` and `package.json` (`"build"`) to filter out bracketed dynamic route placeholders (such as `/learn/[lessonId]`) from precache manifests and regenerate `public/sw.js` on every build, and verify `public/sw.js` contains zero `[` or `]` precache URLs after building.
- [x] 1.4 Add bounded IndexedDB timeouts in `src/lib/storage/idb.ts` and self-healing Service Worker cleanup/update handling in `src/components/providers/LearnerProvider.tsx`, and add Vitest unit tests in `src/__tests__/mobile-resilience.test.ts` verifying bounded storage fallback and SW cleanup helpers pass via `npm run test:unit`.

## 2. Synchronous Mobile Touch Pointer Refs & Scroll-Safe Manipulatives

- [x] 2.1 Refactor `src/components/activities/CountingStage.tsx` to track pointer drag state via a synchronous `useRef` mirror (`dragRef`) alongside React render state with an `onClick` fallback guard, and verify rapid single-frame touch tap and drag sequences pass in `npm run test:unit` and Playwright mobile E2E.
- [x] 2.2 Refactor `src/components/activities/NumberLine.tsx` and `src/components/lesson/LessonScratchpad.tsx` to mirror `isDragging` and `activeStroke` in synchronous refs so same-frame mobile `pointerdown` → `pointermove` → `pointerup` gestures never drop, and verify tick/marker dragging and scratchpad strokes work without regressions.
- [x] 2.3 Update `src/components/activities/GeometryDraw.tsx` (`symmetry-mirror` and `area-paint` modes) with a deduplicated `onClick` cell toggle fallback and scroll-safe pointer capture so single taps and continuous finger drags paint cells reliably on mobile phones, and verify with unit and Playwright mobile tests.

## 3. Sticky Mobile Lesson & Daily Action Dock (`< 900px`)

- [x] 3.1 Update `src/components/lesson/LessonPlayer.tsx` and `src/components/daily/DailyPuzzleClient.tsx` so the primary action bar ("ពិនិត្យចម្លើយ" / "សុំជំនួយ" / "បន្តទៅមុខ") pins into a sticky bottom safe-area dock on mobile viewports (`< 900px`) while remaining in the right-hand column on `>= 900px` landscape viewports, and verify on `360x640` and `360x800` viewports that primary actions remain visible in the viewport without full-page scrolling.
- [x] 3.2 Extend `e2e/mvp-lesson-engine.spec.ts` with mobile regression assertions covering `360x640` short mobile viewports (sticky action bar visibility, same-frame pointer tap/drag on `CountingStage`, `NumberLine`, `GeometryDraw`, and `LessonScratchpad`, and zero stale SW precache 404s), and verify the test passes.

## 4. End-to-End Integration & Accessibility Verification

- [x] 4.1 Run `npm run validate:content`, `npm run test:unit`, `npm run build`, and `npm run test:e2e` across mobile (`360x800` and `360x640`) and tablet landscape (`1024x768`) viewports, and verify all suites and WCAG 2.2 Level AA axe-core checks pass with zero errors.
