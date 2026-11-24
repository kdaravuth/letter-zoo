# Tasks: 004-parent-overview-and-grade3-5-paths

## 1. Grades 3–5 Curriculum Paths & Loader
- [x] 1.1 Author 3 Geometry lessons (`content/paths/geometry-foundations/`) and 3 Fractions & Decimals lessons (`content/paths/fractions-and-decimals/`) validated by `npm run validate:content`.
- [x] 1.2 Extend `src/lib/curriculum/loader.ts` (`getAllLearningPaths`) and add unrestricted multi-path selector tabs to `/learn`.

## 2. PIN/Math-Gated Parent Progress Dashboard
- [x] 2.1 Implement pure caregiver analytics engine (`src/lib/math/parentReport.ts`) with Vitest unit tests.
- [x] 2.2 Build `/parent` (`src/app/parent/page.tsx` + `ParentDashboardClient.tsx`) with adult math/PIN gate, Khmer/Arabic normalization, multi-child switcher, and plain-Khmer insights.

## 3. Verification Gates
- [x] 3.1 Add Playwright E2E + `@axe-core/playwright` (`wcag22aa`) coverage for multi-path switching, Grade 3–5 lessons, and `/parent` unlock flow.
- [x] 3.2 Pass `npm run validate:content`, `npm run test:unit`, `npm run lint`, `npm run build`, `npx serwist build`, and `npm run test:e2e`.
