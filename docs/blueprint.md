# Konleuh Kanit (គន្លឹះគណិត): Product Discovery, Architecture, and OpenSpec Blueprint for a Khmer Interactive Math Platform

**Konleuh Kanit** (*គន្លឹះគណិត* — "Keys to Mathematics") is an original, Khmer-first, mobile-first Progressive Web Application (PWA) built to help Cambodian children aged 6–12 develop mathematical reasoning through interactive visual exploration rather than memorization. Documented public platforms in Cambodia—such as MoEYS E-Learning and KOOMPI's Sala Digital—center largely on digitized video lessons, PDF e-books, audio playback, and standard tests, whereas comprehensive independent evaluations of interactive depth across commercial local platforms such as Duraseksa and E-School Cambodia remain scarce in available public reviews. Inspired by Brilliant.org's hands-on, puzzle-driven rhythm, Konleuh Kanit adapts active learning specifically for primary-grade cognition: because peer-reviewed syntheses show that unguided discovery reverses its benefits in Grades 2–5, each lesson pairs brief visual modeling with **Concreteness Fading** (tactile objects → schematic ten-frames and number lines → abstract symbols) and calm, zero-timer motivation aligned with Self-Determination Theory.

To serve Cambodia's overwhelmingly mobile internet population—where mobile internet subscribers outnumber fixed broadband subscriptions roughly 26 to 1 (18.28 million vs. 708,234 as of February 2025, reported via TechFlow Agency citing Cambodia's Ministry of Post and Telecommunications) and provincial connectivity remains uneven—the recommended stack combines **Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, PostgreSQL with Drizzle ORM, inline SVG manipulatives with unified Pointer Events, Serwist (v9.4+ config mode), and `idb` (~1–3 KB)** for local-first offline persistence. Lesson content is strictly separated from frontend components through a Zod-validated JSON contract driving eight reusable interactive primitives, allowing educators to publish new Khmer lessons without shipping React code. Under our modeled engineering budget, the entire first-load app shell plus a 10-lesson Khmer learning pack totals **205 KB**, targeting sub-2-second loads even on slow provincial 3G.

Starting from a greenfield repository, this blueprint delivers the Phase 1–2 discovery findings and product specification, the Phase 3 technical architecture and copy-ready **OpenSpec 2.x** (`@fission-ai/openspec`) specification artifacts, the Phase 5 10-lesson Khmer MVP curriculum including a complete validated JSON lesson payload, and the Phase 6 test and deployment runbook—culminating in **Milestone 1 (`001-mvp-lesson-engine`)** so incremental engineering implementation can start immediately.

---

## Phase 1: Discovery Research Findings and Strategic Trade-Offs

Focused research across Cambodian primary learning assessments, developmental mathematics research, Khmer complex-script web typography, child UX standards, and motivation psychology identifies five constraints that govern every product and technical decision.

### Cambodia's Primary Math Outcomes, Curriculum Reality, and EdTech Gap

Cambodia's formal primary school cycle covers Grades 1–6 (officially ages 6–12) under the Ministry of Education, Youth and Sport (MoEYS). Under the fifth national curriculum revision (the 2018 revised Cambodian Mathematics Curriculum), primary math is structured into five domains—**Numbers, Measurement, Statistics, Algebra, and Geometry**—extending earlier MoEYS syllabi that allocated 7 weekly math periods in Grades 1–3 and 6 periods in Grades 4–6 with mathematical reasoning integrated across strands.

> **Key Data Snapshot:** Cambodia posted the largest Grade 5 learning gains in Southeast Asia between SEA-PLM 2019 and 2024 (math proficiency rose from 38% to 66%), yet **37%** of fifth graders have repeated a grade, **73%** of sixth graders fall below Proficiency Level 5, and geometry accuracy sits at just **35%** on the 2021 National Learning Assessment. Mobile connections dominate internet access (Android ~63.5%, iOS ~36.5%) while nearly one-third of residents remain offline.

Four strategic implications follow directly from these findings:

1. **Learning paths must never be rigidly grade-locked.** With 37% grade repetition in Grade 5, a 22-point socioeconomic gap (301 vs. 279), and 73% of Grade 6 learners below Proficiency Level 5, onboarding must support quick age/grade entry alongside an optional 3-question visual warm-up and unrestricted jumping up or down by topic.
2. **Early reading barriers cannot block mathematical reasoning.** Over half of late-primary learners still lack reading proficiency, and Grade 1 learners in Kampong Thom averaged just 1.6–2.3 words read correctly per minute in USAID's All Children Reading midterm evaluation. For ages 6–8, prompts must stay ultra-short, visually self-explanatory, and paired with optional Khmer audio cues in follow-up milestones.
3. **Geometry and conceptual modeling represent high-leverage curriculum gaps.** Cambodia's 2018 geometry sequence stresses isolated knowledge outcomes over conceptual modeling, reflected in 35% Grade 6 geometry accuracy. Interactive shape manipulation, area/perimeter grids, and visual justification steps directly target this deficit.
4. **MoEYS early-grade reforms validate a playful, interactive pedagogy.** MoEYS–UNESCO STEPCam *Early Grade Mathematics* materials (*កុមាររៀន កុមារចេះ*, *កូនស្វាឆ្លាត*) promote inquiry-based, play-based learning. Tactile browser manipulatives complement these classroom reforms while filling the interactive digital void left by video- and PDF-centric portals.

### Adapting Brilliant.org's Active Pedagogy for Ages 6 to 12

Brilliant.org replaces passive lectures with ~15-minute sessions of 5–15 interactive visual problems, immediate feedback, and structured hints. However, translating Brilliant's method directly to 6–10-year-olds creates a developmental trap: while Manu Kapur's *Productive Failure* averages $g = 0.36$ across all ages, research syntheses show **this effect reverses in elementary Grades 2–5** on high-element-interactivity material, where brief explicit visual modeling before independent problem solving yields stronger learning.

> **Evidence Anchors:** Linear number-line fraction models ($g = 1.72$ across 5 RCTs), concrete manipulatives for retention ($d = 0.59$), supported self-explanation ($g = 0.55$), worked examples ($g = 0.48$), and cognitive gamification ($g = 0.49$) all demonstrate robust gains when paired with sound instructional sequencing.

Five pedagogical rules govern Konleuh Kanit:

1. **Sequence Every Concept via Concreteness Fading:** Move deliberately from interactive concrete objects → schematic visuals (ten-frames, bar models, arrays, number lines) → abstract mathematical symbols. Advance on accuracy rather than timers, while keeping the schematic model one tap away on errors.
2. **Strip Decorative Realism Early ("Perceptually Clean" Cultural Contexts):** Introduce concepts with clean, stylized Cambodian cues (simplified mangoes, woven trays, flat Riel note cards) for immediate relevance, then rapidly fade decorative surfaces into geometric dots, bars, and tracks.
3. **Elevate the Linear Number Line as a Cross-Grade Backbone:** Use linear number lines across whole-number magnitude, rounding, jump arithmetic, fractions, and decimals.
4. **Lead with Brief Visual Models, Worked Examples, and Supported Self-Explanation:** Open primary lessons with at most 15–20 seconds of low-stakes exploration, immediately bridge into a concise worked example, use "spot the mistake" incorrect worked examples for Grades 4–6, and offer supported Khmer justification choices.
5. **Gate Elaborative Hints Against "Gaming the System":** Require an initial attempt (or explicit hint request) before revealing three-tier elaborative hints (`visual-cue` → `strategy-nudge` → `worked-step`) rather than immediate bottom-out answers.

### Khmer Web Typography, Line Breaking, and Mobile Constraints

- **Font Selection and Payload Control:** Use **Kantumruy Pro** (SIL OFL, variable WOFF2, weights 100–700) as primary font and **Noto Sans Khmer** as fallback. Exclude *Khmer OS*, *Moul*, *Koulen*, *Battambang*, and legacy Limon/ABC encodings. Shipping one character-subsetted variable WOFF2 file drops payload **under 40 KB** in a single request (versus ~960 KB across five static TTF files) and prevents iOS fallback to *Khmer Sangam MN*.
- **Vertical Headroom, Shaping Safety, and Line Breaking:** Enforce `<html lang="km">`, `line-height: 1.65–1.8` (default `1.7`), `letter-spacing: 0 !important`, and ban `text-justify: inter-character`. Keep prompts concise ($\le 14$ words), bind numerals to unit nouns with `U+2060` (Word Joiner), and strip all `U+200B` (Zero-Width Space) characters (`text.replace(/\u200B/g, '')`) before search, string comparison, or answer grading.
- **Khmer and Hindu-Arabic Numerals:** Render Khmer numerals (`០–៩`) by default across all screens, provide a persistent one-tap toggle (`១២៣` / `123`) to Arabic numerals (`0–9`), store canonical values as standard numbers internally, and accept either numeral set identically in grading.

### Age-Appropriate UX, WCAG 2.2 Accessibility, and Ethical Gamification

- **Developmental Range:** Ages 6–8 need explicit visual start/goal states, concrete metaphors, and hardware-agnostic instructions; ages 9–12 reject condescending cartoon aesthetics. Adopt a clean, warm geometric studio visual language suitable for ages 6–12.
- **Dual Drag + Tap-to-Place & Touch Sizing:** Every drag manipulative MUST support single-pointer **tap-to-select + tap-to-place** (satisfying both child usability and **WCAG 2.2 SC 2.5.7 Level AA**). Enforce **$\ge 56 \times 56$ CSS px** (up to 72 px for primary Early Explorer targets) on interactive math tokens, **$\ge 44 \times 44$ CSS px** on secondary controls, and `scroll-margin-top: 5rem` so sticky headers never obscure focus (**WCAG 2.2 SC 2.4.11**).
- **Calm, Competence-Anchored Gamification:** Zero countdown timers, zero global leaderboards, zero virtual currency storefronts, and zero random loot boxes. Track flexible **weekly learning rhythm goals** (e.g., 3 active days/week with guilt-free rest days), award **informational mastery badges and milestone XP**, and combine a 4-tier mastery model (*Attempted → Familiar → Proficient → Mastered*) with 5-box Leitner spaced review intervals (`[1, 2, 4, 8, 16]` days).

---

## Phase 2: Product Specification and Curriculum Architecture

### Product Vision, Target Personas, and Core Journeys

**Product Vision:** Enable every Cambodian child aged 6–12—whether in Phnom Penh or a rural province—to see, manipulate, and reason through mathematics in natural Khmer, replacing rote anxiety with durable visual intuition.

| Persona | Profile & Context | Primary Need | Key Design Accommodation |
| :--- | :--- | :--- | :--- |
| **Early Explorer (កុមារដំណាក់កាលដំបូង)** | Ages 6–8 (Grades 1–2); shared family Android smartphone over 4G; emergent Khmer reader. | Build number sense, addition/subtraction, patterns, and early shape/money concepts without reading fatigue. | Short $\le 10$-word Khmer prompts, 56–72 px touch targets, tap-or-drag manipulatives, zero timers, Phase 2 audio read-aloud. |
| **Rising Thinker (កុមារដំណាក់កាលអភិវឌ្ឍ)** | Ages 9–12 (Grades 3–6); phone or tablet; building fractions, decimals, geometry, and multi-step reasoning. | Master school math visually without patronizing cartoon UI; navigate both Khmer and Arabic numerals. | Clean geometric studio aesthetics, number-line & array models, incorrect-worked-example challenges, Khmer/Arabic numeral switcher. |
| **Parent / Caregiver (ឪពុកម្ដាយ ឬអាណាព្យាបាល)** | Cambodian caregiver checking child progress on mobile; limited time; wants clear actionable visibility. | Quickly view topics learned, strengths, topics needing practice, and healthy weekly minutes in plain Khmer. | Local profile switcher on shared devices (MVP) expanding to a PIN-gated Parent Progress Dashboard (Phase 2). |

**Core MVP Student Journeys:**
1. **Instant Guest Onboarding:** Open Khmer landing page → enter nickname (instant local UUID profile, zero email/password friction) → pick avatar badge → choose advisory age/grade (6–12 / Grades 1–6) or optional 3-item visual warm-up → enter Learning Path.
2. **Interactive Lesson Session:** Pick unlocked node → complete 5–7 tactile SVG steps (8–12 min) via drag or tap-to-place → get immediate visual + Khmer feedback and optional 3-tier hints → finish with updated mastery tier and calm milestone XP.
3. **Daily Challenge & Smart Review:** Returning learners access a 2-minute *លំហាត់ប្រចាំថ្ងៃ* (Daily Visual Puzzle) plus due Leitner review cards.

### The Eight-Step Guided Interactive Lesson Loop

Each session flows through eight linked beats inside a three-stage Concreteness Fading arc (`concrete` → `iconic` → `symbolic`):

1. **Hook & Cultural Framing (បើកបញ្ហា):** Concise everyday Cambodian scenario with one short Khmer prompt.
2. **Tactile Exploration (ស្វែងយល់ដោយផ្ទាល់):** 10–20 seconds of low-stakes direct manipulation with synchronized visual state.
3. **Guided Visual Micro-Model (គំរូខ្លីៗ):** One explicit worked step on the visual model before independent transfer.
4. **Active Problem Attempt (សាកល្បងដោះស្រាយ):** Build, place, partition, or select the solution via dragging or single-pointer tapping.
5. **Immediate Non-Punitive Feedback (មតិត្រឡប់ភ្លាមៗ):** Crisp visual snap and warm Khmer encouragement (*«ល្អណាស់!»*); errors show visual discrepancy without harsh red failure banners.
6. **Three-Tier Progressive Hints (ជំនួយជាដំណាក់កាល):** Gated after an initial attempt or explicit tap: Tier 1 visual cue → Tier 2 strategy nudge → Tier 3 worked sub-step.
7. **Visual + Plain Khmer Concept Synthesis (ពន្យល់គោលគំនិត):** Bridge the visual model to symbolic notation in simple Khmer with supported self-explanation.
8. **Faded Follow-Up Challenge & Progress Update (លំហាត់បន្ត និងតាមដានវឌ្ឍនភាព):** Transfer check followed by mastery tier and Leitner review scheduling.

### Twelve-Topic Progressive Curriculum Aligned to MoEYS Grades 1 to 6

| # | Curriculum Strand (Official Khmer Term) | MoEYS Grade Span | Core Visual Progression & Cambodian Contexts | Mapped Activity Primitives |
| :--- | :--- | :--- | :--- | :--- |
| 1 | **Number Sense** (*ចំនួន និងតម្លៃលេខតាមខ្ទង់*) | Grades 1–5 (MVP Start) | Subitizing 1–5; zero & 0–10 on 5/10-frames; teens 11–20; place value *ខ្ទង់រាយ/ខ្ទង់ដប់/ខ្ទង់រយ* up to 1,000,000+; Khmer & Arabic numerals; rounding. | `counting-stage`, `place-value-blocks`, `number-line` |
| 2 | **Addition & Subtraction** (*វិធីបូក និងវិធីដក*) | Grades 1–4 (MVP Start) | Combining/taking away within 10; making 10 (*បង្គ្រប់ ១០*); jump strategy on number lines; base-10 regrouping; market totals. | `counting-stage`, `number-line`, `place-value-blocks` |
| 3 | **Multiplication & Division** (*វិធីគុណ និងវិធីចែក*) | Grades 2–5 | Skip-counting (*រាប់បន្ថែមម្ដង ២, ៣, ៤, ៥, ១០*); equal fruit groups → rectangular arrays; sharing with remainders (*សំណល់*). | `array-groups`, `number-line`, `scenario-choice` |
| 4 | **Fractions** (*ប្រភាគ — ភាគយក/ភាគបែង*) | Grades 1, 3–6 (MVP Intro) | Halves & quarters of cakes/bars (Gr 1); 0–1 number-line magnitude; equivalent fractions (*ប្រភាគស្មើគ្នា*); mixed numbers (*ចំនួនចម្រុះ*). | `fraction-bar-shape`, `number-line`, `comparison-balance` |
| 5 | **Decimals** (*ចំនួនទសភាគ*) | Grades 4–6 | Zooming into the 0–1 number line by tenths/hundredths; 10×10 grids; incorrect-worked-example checks (why $0.5 > 0.35$); decimal operations. | `number-line`, `place-value-blocks`, `scenario-choice` |
| 6 | **Percentages & Ratios** (*ផលធៀប និងភាគរយ*) | Grades 5–6 | 100-square grids connecting fractions, decimals, and `%`; market discounts, proportions (*សមាមាត្រ*), and simple interest (*ការប្រាក់*). | `fraction-bar-shape`, `array-groups`, `scenario-choice` |
| 7 | **Patterns** (*លំនាំគំរូ*) | Grades 1–5 (MVP Start) | Repeating patterns by shape, color, and size (*តាមរូប/ទំហំ*); growing number sequences (*តាមចំនួន*); rule discovery. | `pattern-sequence`, `number-line` |
| 8 | **Measurement & Currency** (*រង្វាស់ និងរូបិយវត្ថុ*) | Grades 1–6 (MVP Intro) | Length/mass comparison; clocks & 24-hour time; KHR banknotes (`១០០៛`–`១០០,០០០៛`) & exchange rates; metric units, speed, map scales. | `comparison-balance`, `number-line`, `scenario-choice` |
| 9 | **Geometry** (*ធរណីមាត្រ*) | Grades 1–6 (MVP Intro) | 2D/3D shape manipulation & attributes; grid perimeter (*បរិមាត្រ*) & area (*ផ្ទៃក្រឡា*); angles (*មុំ*), triangles, circles, volume (*មាឌ*). | `fraction-bar-shape`, `pattern-sequence`, `array-groups` |
| 10 | **Algebra Foundations** (*ពិជគណិត / ការជំនួសលេខដោយអក្សរ*) | Grades 3–6 | Visual balance scales establishing `=` as equivalence; missing boxes ($3 + \square = 7$, $3 \times \square = 21$); parentheses; letter substitution (Gr 6). | `comparison-balance`, `scenario-choice`, `pattern-sequence` |
| 11 | **Logic & Problem-Solving** (*តក្កវិទ្យា និងការដោះស្រាយចំណោទ*) | Grades 1–6 | Sorting/classification puzzles; line-segment bar diagrams (*ដោះស្រាយចំណោទដោយប្រើអង្កត់*); deduction puzzles; multi-step market scenarios. | `comparison-balance`, `pattern-sequence`, `scenario-choice` |
| 12 | **Statistics & Probability** (*ស្ថិតិ និងឱកាស/ប្រូបាប៊ីលីតេ*) | Grades 1–6 | Picture graphs (*ក្រាបរូបភាព*); everyday chance (*ឱកាស*); bar/line/pie charts & mean (*មធ្យមនព្វន្ត*); spinner probability (*ប្រូបាប៊ីលីតេ*). | `counting-stage`, `fraction-bar-shape`, `scenario-choice` |

### MVP Scope, Deferrals, and Role Roadmap

| Feature Area | Phase 4–5 MVP (Build Now) | Phase 2 (Post-MVP Expansion) | Explicitly Deferred (Avoid Early) |
| :--- | :--- | :--- | :--- |
| **Student Experience** | Khmer landing page; instant guest onboarding; learning dashboard & path; decoupled Lesson Player + 8 reusable SVG primitives; 3-tier hints & visual explanations; 4-tier mastery & calm weekly rhythm/badges; offline-first PWA; Khmer/Arabic numeral switcher. | Daily Challenge (*លំហាត់ប្រចាំថ្ងៃ*); automated Leitner review queue UI; Grades 2–6 paths (Geometry & Fractions first); recorded native Khmer audio prompts. | Conversational AI tutors; social feeds or global leaderboards; multiplayer modes; virtual coin shops/loot boxes. |
| **Parent Experience** | Multi-child local profile switcher on shared devices + read-only progress summary behind a simple parent math-gate. | Dedicated PIN-gated Parent Dashboard (topics learned, strengths, practice needs, weekly time) with cross-device sync. | Complex telemetry analytics or subscription billing. |
| **Admin Experience** | Git-versioned, Zod-validated JSON lesson packs + CLI validator & PostgreSQL seed script. | Authenticated Khmer Admin Lesson Studio for paths, topics, lessons, activities, ZWSP checks, and draft/publish state. | Multi-tenant school LMS, live classroom proctoring, or microservice CMS backends. |

---

## Phase 3: Technical Architecture, Stack Justification, and Project Setup

### Technology Stack Trade-Offs and Rationale

| Layer | Selected Technology | Alternatives Evaluated | Decision Rationale |
| :--- | :--- | :--- | :--- |
| **Web Framework** | **Next.js 16 (App Router) + React 19 + TypeScript (strict)** | Vite SPA, Remix/React Router | Turbopack default bundler, React Server Components minimize client JS over 4G, Server Actions for sync, built-in `app/manifest.ts`. |
| **Styling** | **Tailwind CSS v4** (`@tailwindcss/postcss`) | CSS Modules, Chakra/MUI | CSS-first `@theme` OKLCH tokens, ~10 KB purged CSS, zero runtime CSS-in-JS overhead. |
| **Database & ORM** | **PostgreSQL + Drizzle ORM** | Prisma 7, Kysely | Zero codegen, smallest serverless footprint, explicit SQL, native `jsonb().$type<LessonDocumentV1>()` binding. |
| **Interactive Math Graphics** | **Inline SVG (React) + Unified Pointer Events** | HTML5 `<canvas>`, Konva, PixiJS | Crisp vector geometry, native browser-shaped Khmer `<text>`, ARIA semantics, Playwright testing. **iOS Safari guard:** never use `<foreignObject>` inside SVG and never CSS-scale SVG text above `1.0`. |
| **Motion** | **CSS Transitions + `motion/react` (`LazyMotion` + `m`)** | Full `framer-motion`, GSAP | ~4.6–5 KB initial render JS, defers `domAnimation` until after paint, honors `prefers-reduced-motion`. |
| **Offline PWA & Local DB** | **Serwist (`@serwist/next` v9.4+ config mode) + `idb`** | Legacy `next-pwa`, Dexie.js | Native compatibility with Next.js 16 Turbopack (`serwist build`); `idb` (~1–3 KB) handles lean offline cache and sync outbox. |
| **Validation & QA** | **Zod + Vitest + Playwright + `@axe-core/playwright`** | Yup, Jest, Cypress | Shared build-time & runtime JSON validation, fast unit testing, real browser + WCAG 2.2 AA auditing. |

### Mobile Performance Budget and Offline-First Architecture

- **Modeled First-Load Budget:** **205 KB** total (38 KB subsetted variable Kantumruy Pro WOFF2 + Next.js RSC shell + SVG primitives + LazyMotion + `idb` + 18 KB gzipped 10-lesson pack), targeting `< 2 s` loads on rural 3G and enforced by a hard `<= 220 KB` Lighthouse CI gate.
- **iOS Safari 7-Day Storage Eviction Defenses:** (1) Prompt iOS users to **Add to Home Screen** after Lesson 1; (2) sync completed sessions asynchronously to PostgreSQL (plus optional 6-character family restore code) because Home Screen apps use an isolated storage container separate from Safari tabs; (3) treat empty IndexedDB at startup as normal re-hydration.

### Decoupled Content Engine and Eight Reusable Activity Primitives

| Primitive `type` | Interactive Mechanics (Drag + Tap-to-Place) | Learning Activities Served | Deterministic Grader Rule |
| :--- | :--- | :--- | :--- |
| `counting-stage` | Drag or tap objects into trays, 5-frames, or 10-frames; live count badge fades off in later steps. | Counting, subitizing, visual addition/subtraction, picture graphs. | Exact placed count (`placedCount === target`) or split-tray total match. |
| `number-line` | Tap ticks or drag marker on linear track; supports animated jump arcs (`+a`, `-b`) and zoomable 0–1 tracks. | Number lines, ordering, jump arithmetic, rounding, fraction & decimal magnitude. | Numeric match within configurable step tolerance (`|val - expected| <= eps`). |
| `place-value-blocks` | Add/remove ones cubes, ten-rods, hundred-flats; tap *ផ្ដុំ ១០* (Bundle 10) or *បំបែក ១០* (Unbundle). | Place value (*ខ្ទង់រាយ/ដប់/រយ*), making 10, regrouping/borrowing. | Total numeric equality + optional canonical regrouping check (`ones < 10`). |
| `comparison-balance` | Two-pan scale or side-by-side bars; tap `<`, `>`, `=` tiles or drop number/object tiles to build balanced equations. | Comparison, mass, equation building, algebra equivalence, logic puzzles. | Exact operator match or balanced left/right weight equality (`L === R`). |
| `array-groups` | Drag/tap items into equal baskets or resize a rectangular grid (`rows × cols`) with split lines. | Multiplication groups, equal sharing/division, area & perimeter. | Exact `(rows, cols)` or product equality with configurable commutativity. |
| `fraction-bar-shape` | Partition bars or 2D polygons into $d$ equal pieces, shade $n$ parts, or manipulate 2D shapes with synced 0–1 line. | Fraction visualization, shape manipulation, symmetry, percentages. | Reduced rational equivalence (`n / d === expectedN / expectedD`), exact `(n, d)`, or shape vertex/count match. |
| `pattern-sequence` | Drag or tap shape, color, size, or number tiles into missing slots of repeating or growing sequences. | Pattern discovery, skip-counting, sequence logic puzzles. | Ordered array equality against `expectedSlotValues`. |
| `scenario-choice` | Visual story card with interactive Riel banknote trays, incorrect-worked-example critique, or self-explanation choices. | Market scenarios, money (`រៀល`), word problems (*ចំណោទ*), misconception checks. | Option ID match, Riel banknote sum equality, or multi-select set equality. |

#### Decoupled Lesson Schema Contract (`src/lib/curriculum/schema.ts`)

```typescript
import { z } from "zod";

export const ConcretenessStageSchema = z.enum(["concrete", "iconic", "symbolic"]);

export const HintTierSchema = z.object({
  tier: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  kind: z.enum(["visual-cue", "strategy-nudge", "worked-step"]),
  textKm: z.string().min(4).max(160),
  highlightTargetId: z.string().optional(),
});

export const ActivityStepSchema = z.discriminatedUnion("type", [
  z.object({
    id: z.string(),
    type: z.literal("counting-stage"),
    stage: ConcretenessStageSchema,
    promptKm: z.string().max(160),
    audioUrl: z.string().optional(),
    config: z.object({
      frameSize: z.union([z.literal(5), z.literal(10), z.literal(20)]),
      tokenTheme: z.enum(["mango", "orange", "lotus", "dot", "cube"]),
      initialInFrame: z.number().int().min(0),
      initialOutside: z.number().int().min(0),
      allowFreeExplore: z.boolean().default(false),
      showLiveCount: z.boolean().default(true),
      requireFullTenBundle: z.boolean().default(false),
    }),
    solution: z.object({
      expectedInFrame: z.number().int().min(0),
      expectedTotal: z.number().int().min(0).optional(),
    }),
    hints: z.array(HintTierSchema).length(3),
    explanationKm: z.string().max(220),
  }),
  z.object({
    id: z.string(),
    type: z.literal("number-line"),
    stage: ConcretenessStageSchema,
    promptKm: z.string().max(160),
    audioUrl: z.string().optional(),
    config: z.object({
      min: z.number(),
      max: z.number(),
      step: z.number().positive(),
      startValue: z.number(),
      showJumps: z.boolean().default(true),
      hiddenTickValues: z.array(z.number()).default([]),
    }),
    solution: z.object({
      expectedValue: z.number(),
      requiredIntermediateValue: z.number().optional(),
    }),
    hints: z.array(HintTierSchema).length(3),
    explanationKm: z.string().max(220),
  }),
  z.object({
    id: z.string(),
    type: z.literal("scenario-choice"),
    stage: ConcretenessStageSchema,
    promptKm: z.string().max(180),
    audioUrl: z.string().optional(),
    config: z.object({
      variant: z.enum(["single-choice", "banknote-builder", "worked-error-check"]),
      visualCue: z.string().optional(),
      options: z.array(
        z.object({
          id: z.string(),
          labelKm: z.string().max(120),
          diagnosticFeedbackKm: z.string().max(180).optional(),
        })
      ).min(2).max(4).optional(),
      availableNotesKhr: z.array(z.number().int().positive()).optional(),
    }),
    solution: z.object({
      correctOptionId: z.string().optional(),
      expectedSumKhr: z.number().int().positive().optional(),
    }),
    hints: z.array(HintTierSchema).length(3),
    explanationKm: z.string().max(220),
  }),
  // Remaining 5 primitives (place-value-blocks, comparison-balance, array-groups,
  // fraction-bar-shape, pattern-sequence) follow the identical stage/config/solution/hints envelope.
]);

export const LessonDocumentV1Schema = z.object({
  schemaVersion: z.literal("1.0"),
  id: z.string().regex(/^[a-z0-9-]+$/),
  pathId: z.string(),
  order: z.number().int().positive(),
  moeysGradeRef: z.enum(["G1", "G2", "G3", "G4", "G5", "G6"]),
  topicSlug: z.string(),
  titleKm: z.string().max(80),
  subtitleKm: z.string().max(120),
  estimatedMinutes: z.number().int().min(4).max(15),
  learningObjectiveKm: z.string().max(180),
  steps: z.array(ActivityStepSchema).min(3).max(8),
});

export type LessonDocumentV1 = z.infer<typeof LessonDocumentV1Schema>;
```

#### PostgreSQL + Drizzle ORM Persistence Schema (`src/db/schema.ts`)

```typescript
import {
  pgTable, text, integer, timestamp, jsonb, pgEnum, uniqueIndex, index
} from "drizzle-orm/pg-core";
import type { LessonDocumentV1 } from "@/lib/curriculum/schema";

export const masteryTierEnum = pgEnum("mastery_tier", [
  "not_started", "attempted", "familiar", "proficient", "mastered"
]);

export const studentProfiles = pgTable("student_profiles", {
  id: text("id").primaryKey(), // Local UUID for zero-friction offline onboarding
  displayName: text("display_name").notNull(),
  ageYears: integer("age_years").notNull(),
  gradeLevel: integer("grade_level").notNull(), // 1-6 advisory, never locks paths
  numeralPreference: text("numeral_preference").notNull().default("km"), // "km" | "latn"
  audioEnabled: integer("audio_enabled").notNull().default(1),
  weeklyGoalDays: integer("weekly_goal_days").notNull().default(3),
  totalXp: integer("total_xp").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const lessons = pgTable("lessons", {
  id: text("id").primaryKey(),
  pathId: text("path_id").notNull(),
  sortOrder: integer("sort_order").notNull(),
  moeysGradeRef: text("moeys_grade_ref").notNull(),
  topicSlug: text("topic_slug").notNull(),
  titleKm: text("title_km").notNull(),
  contentVersion: integer("content_version").notNull().default(1),
  status: text("status").notNull().default("published"), // "draft" | "published"
  payload: jsonb("payload").$type<LessonDocumentV1>().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [index("lessons_path_order_idx").on(t.pathId, t.sortOrder)]);

export const studentLessonProgress = pgTable("student_lesson_progress", {
  id: text("id").primaryKey(),
  studentId: text("student_id").notNull().references(() => studentProfiles.id, { onDelete: "cascade" }),
  lessonId: text("lesson_id").notNull().references(() => lessons.id, { onDelete: "cascade" }),
  masteryTier: masteryTierEnum("mastery_tier").notNull().default("not_started"),
  leitnerBox: integer("leitner_box").notNull().default(1), // 1..5 -> 1, 2, 4, 8, 16 days
  nextReviewAt: timestamp("next_review_at", { withTimezone: true }),
  accuracyPct: integer("accuracy_pct").notNull().default(0),
  hintsUsed: integer("hints_used").notNull().default(0),
  attemptsCount: integer("attempts_count").notNull().default(0),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex("student_lesson_unique_idx").on(t.studentId, t.lessonId),
  index("student_review_due_idx").on(t.studentId, t.nextReviewAt),
]);
```

#### Khmer-First Design System and CSS Guardrails (`src/app/globals.css`)

```css
@import "tailwindcss";

@theme inline {
  --font-sans: var(--font-kantumruy-pro), var(--font-noto-sans-khmer), sans-serif;
  --color-canvas: oklch(0.985 0.006 85);       /* Warm ivory paper surface */
  --color-surface: oklch(1 0 0);               /* Crisp card surface */
  --color-ink: oklch(0.18 0.01 260);           /* High-contrast charcoal */
  --color-ink-muted: oklch(0.46 0.015 260);    /* Secondary Khmer label */
  --color-accent: oklch(0.54 0.17 255);        /* Authoritative focus blue */
  --color-success: oklch(0.58 0.14 155);       /* Calm botanical green */
  --color-hint: oklch(0.68 0.15 70);           /* Warm amber guidance */
  --color-border: oklch(0.90 0.01 85);         /* Soft biscuit border */
}

html[lang="km"] {
  line-height: 1.7;                            /* Prevents clipping Khmer coeng & vowels */
  letter-spacing: 0 !important;                /* Protects HarfBuzz/WebKit vowel shaping */
  text-justify: auto;                          /* Bans inter-character Khmer stretching */
  font-feature-settings: "kern" 1, "liga" 1;
}

.khmer-chip, button, [role="button"] {
  min-width: 44px;
  min-height: 44px;
  padding-block: 0.45rem;                      /* Extra vertical headroom for tall stacks */
  overflow-wrap: break-word;
  scroll-margin-top: 5rem;                     /* WCAG 2.2 SC 2.4.11 focus visibility */
}

.manipulative-target {
  min-width: 56px;                             /* Child-sized touch target (ages 6-8) */
  min-height: 56px;
  touch-action: none;                          /* Smooth SVG pointer dragging without page jump */
}
```

---

## Spec-Driven Development Initialization with OpenSpec 2.x

### Greenfield Repository Setup

```bash
# 1. Scaffold Next.js 16 + TypeScript + Tailwind CSS v4 + App Router
npx create-next-app@latest konleuh-kanit --typescript --eslint --tailwind --app --src-dir --import-alias "@/*"
cd konleuh-kanit

# 2. Install runtime & PWA/testing dependencies
npm install drizzle-orm pg zod idb motion @serwist/next serwist
npm install -D drizzle-kit @types/pg @serwist/cli concurrently esbuild vitest @vitejs/plugin-react @playwright/test @axe-core/playwright

# 3. Install and initialize OpenSpec 2.x
npm install -g @fission-ai/openspec@latest
openspec config profile
openspec init
```

### Project Context Configuration (`openspec/config.yaml`)

```yaml
schema: spec-driven
context: |
  Project: Konleuh Kanit (គន្លឹះគណិត) — Khmer-first interactive math web platform for Cambodian children (ages 6-12).
  Stack: Next.js 16 (App Router), React 19, TypeScript (strict), Tailwind CSS v4, PostgreSQL, Drizzle ORM, inline SVG manipulatives, Serwist PWA (v9.4+ config mode), idb (IndexedDB), Zod, Vitest, Playwright + @axe-core/playwright.
  Non-negotiable rules:
  - Khmer-first natural pedagogical copy aligned with MoEYS primary terminology; zero machine-translated phrasing.
  - Primary font Kantumruy Pro (variable WOFF2) with Noto Sans Khmer fallback; html[lang="km"], line-height 1.65-1.8, letter-spacing 0.
  - Default Khmer numerals (០-៩) with Arabic (0-9) display toggle; accept both in input; strip U+200B (ZWSP) before matching/grading.
  - Every interactive drag task MUST offer a single-pointer tap-to-place alternative (WCAG 2.2 SC 2.5.7) and >=56px targets for math tokens.
  - No SVG <foreignObject> (Safari/iOS WebKit scaling bug). No countdown timers, global leaderboards, or loot boxes.
  - Decouple lesson content (Zod-validated JSON) from frontend components.
  Test commands:
  - Unit: npm run test:unit
  - Content validation: npm run validate:content
  - E2E + WCAG 2.2 AA: npm run test:e2e
rules:
  specs:
    - Focus strictly on externally observable behavior, interfaces, and error states; keep library/code mechanics in design.md.
    - Keep every Requirement header descriptive and strictly under 50 characters.
    - Every Scenario MUST be verifiable via Vitest, Playwright, or documented device QA.
```

### Milestone 1 OpenSpec Artifacts (`openspec/changes/001-mvp-lesson-engine/`)

#### `openspec/changes/001-mvp-lesson-engine/proposal.md`

```markdown
# Proposal: 001-mvp-lesson-engine

**Core Interactive Khmer Math Learning Engine**
- From: Empty greenfield repository with no interactive learning capabilities.
- To: Working mobile-first, offline-capable Khmer PWA delivering guest student onboarding, a visual learning path, a decoupled JSON lesson player with 4 initial SVG manipulatives, progressive 3-tier hints, and local-first mastery tracking.
- Reason: Proves the core educational and technical thesis early—delivering fast, natural Khmer visual math on Cambodian smartphones without hardcoding lesson UI components.
- Impact: Non-breaking initial baseline establishing four foundational capabilities: `khmer-typography-numerals`, `interactive-lesson-player`, `activity-engine-primitives`, and `offline-progress-mastery`.
```

#### `openspec/changes/001-mvp-lesson-engine/specs/khmer-typography-numerals/spec.md`

```markdown
## Purpose
Guarantee legible, non-clipped Khmer Unicode typography, consistent Khmer/Arabic numeral presentation, and safe invisible-character handling across Android Chrome and iOS Safari.

## ADDED Requirements

### Requirement: Khmer Unicode Font And Line Height
The system SHALL render all Khmer interface and lesson text in Unicode Khmer using `lang="km"` with vertical line height between 1.65 and 1.8 and zero positive letter spacing.

#### Scenario: Subscript stacking renders without clipping
- **GIVEN** a viewport of 360px width displaying Khmer text containing double subscripts (e.g., កន្ត្រៃ) and overhead vowel signs
- **WHEN** the page renders inside a lesson prompt or interactive button
- **THEN** computed `line-height` is at least 1.65 times computed `font-size`
- **AND** computed `letter-spacing` equals `0px`
- **AND** glyph bounding boxes are not clipped by container padding or overflow rules

### Requirement: Dual Numeral Display And Normalization
The system SHALL display mathematical numerals in Khmer digits (០–៩) by default, provide a one-tap toggle to Hindu-Arabic digits (0–9), and accept either numeral script identically during grading.

#### Scenario: Learner toggles numeral script mid-lesson
- **GIVEN** an active lesson step displaying Khmer numerals (e.g., ៨ + ៥)
- **WHEN** the learner taps the numeral toggle control
- **THEN** all numeric labels update immediately to Hindu-Arabic numerals (8 + 5) without resetting step state
- **AND** the preference persists across reloads

#### Scenario: Grader normalizes Khmer and Arabic input
- **GIVEN** an activity expecting numeric value 13
- **WHEN** the learner submits either `១៣` or `13` (with or without stray U+200B zero-width spaces)
- **THEN** the system strips `U+200B` characters, normalizes digits to canonical numeric form, and grades both submissions as correct
```

#### `openspec/changes/001-mvp-lesson-engine/specs/interactive-lesson-player/spec.md`

```markdown
## Purpose
Deliver a calm, distraction-free, eight-step guided interactive lesson loop with immediate diagnostic feedback and anti-gaming progressive hints.

## ADDED Requirements

### Requirement: Guided Lesson Step Progression
The system SHALL execute each lesson sequentially through its declared JSON steps without countdown timers, advancing only after the learner completes or resolves the active step.

#### Scenario: Completing an active step unlocks continuation
- **GIVEN** a learner on step 1 of a 5-step lesson
- **WHEN** the learner submits a valid answer
- **THEN** the system displays a concise Khmer affirmation and visual explanation
- **AND** enables the "បន្តទៅមុខ" (Continue) control to advance to step 2
- **AND** no countdown timer or punitive failure banner is displayed

### Requirement: Progressive Three-Tier Hint Reveal
The system SHALL reveal up to three escalating Khmer hints per problem step—visual cue, strategy nudge, and worked step—while gating full reveal behind an initial attempt or explicit request.

#### Scenario: Learner struggles and requests tiered hints
- **GIVEN** an active problem step with 3 defined hint tiers
- **WHEN** the learner submits an incorrect attempt
- **THEN** the system provides non-punitive visual discrepancy feedback and highlights the "សុំជំនួយ" (Ask for hint) button
- **WHEN** the learner activates "សុំជំនួយ" once
- **THEN** Tier 1 (visual cue) displays without revealing the final answer
- **WHEN** the learner activates "សុំជំនួយ" a second and third time
- **THEN** Tier 2 (strategy nudge) and Tier 3 (worked step) display sequentially
```

#### `openspec/changes/001-mvp-lesson-engine/specs/activity-engine-primitives/spec.md`

```markdown
## Purpose
Render interactive mathematical manipulatives from decoupled JSON definitions while meeting child motor accessibility and WCAG 2.2 Level AA standards.

## ADDED Requirements

### Requirement: Decoupled JSON Activity Rendering
The system SHALL render any schema-valid lesson JSON file using registered reusable activity components without requiring custom per-lesson frontend code.

#### Scenario: Invalid lesson JSON fails fast at validation
- **GIVEN** a lesson JSON payload missing a required hint tier or containing an unknown activity `type`
- **WHEN** content validation runs during build or load
- **THEN** schema validation rejects the payload with the exact field path error
- **AND** the lesson is blocked from publishing

### Requirement: Dual Drag And Tap-To-Place Input
The system SHALL allow every drag-based mathematical manipulative to be completed interchangeably via pointer dragging or single-pointer tap-to-select and tap-to-place.

#### Scenario: Child moves mango into ten-frame via taps only
- **GIVEN** a `counting-stage` ten-frame activity with 8 items inside and 5 items outside
- **WHEN** the learner taps an outside item (without dragging) and then taps an empty slot in the ten-frame
- **THEN** the item moves smoothly into the selected slot and updates the active count
- **AND** the action works identically on touchscreens, trackpads, and mice

### Requirement: Touch Target Size And Focus Visibility
The system SHALL size interactive manipulative tokens to at least 56x56 CSS pixels, secondary controls to at least 44x44 CSS pixels, and keep keyboard-focused controls unobscured by sticky headers.

#### Scenario: Mobile viewport meets child touch standards
- **GIVEN** a 360x800 mobile viewport running an interactive lesson
- **WHEN** automated accessibility and layout checks inspect all interactive tokens and navigation controls
- **THEN** every manipulative target measures at least 56x56 CSS pixels
- **AND** zero WCAG 2.2 Level AA violations are reported by axe-core (`wcag22aa`)
```

#### `openspec/changes/001-mvp-lesson-engine/specs/offline-progress-mastery/spec.md`

```markdown
## Purpose
Persist student profiles, lesson completion, 4-tier mastery states, and Leitner review dates locally first so learning continues seamlessly across spotty or offline connections.

## ADDED Requirements

### Requirement: Local-First Progress And Outbox Sync
The system SHALL persist every completed lesson step immediately to IndexedDB and queue server synchronization without blocking UI navigation when offline.

#### Scenario: Learner finishes lesson while offline
- **GIVEN** a learner whose device loses internet connectivity mid-lesson after loading the learning path
- **WHEN** the learner completes the remaining steps and finishes the lesson
- **THEN** all interactions, deterministic grading, and hints execute normally offline
- **AND** completion state and mastery tier save locally in IndexedDB
- **AND** queued progress syncs automatically to PostgreSQL when connectivity resumes

### Requirement: Four-Tier Mastery And Leitner Review
The system SHALL compute skill mastery across Attempted, Familiar, Proficient, and Mastered tiers from lesson accuracy and schedule the next review using 5-box Leitner intervals (1, 2, 4, 8, 16 days).

#### Scenario: First-time lesson completion updates mastery and review box
- **GIVEN** a lesson at `not_started` status
- **WHEN** the learner finishes with 85% accuracy on first attempt
- **THEN** mastery transitions to `familiar`, Leitner box sets to 2, and `nextReviewAt` schedules 2 days ahead
- **WHEN** the learner finishes with 100% accuracy without Tier 3 hints
- **THEN** mastery transitions to `proficient` and advances one Leitner box
```

#### `openspec/changes/001-mvp-lesson-engine/design.md` Notes & `tasks.md`

- **Design Notes:** Load `Kantumruy_Pro` and `Noto_Sans_Khmer` via `next/font/google` (`subsets: ['khmer', 'latin']`, `display: 'swap'`); build SVG manipulatives with explicit `viewBox`, unified Pointer Events (`setPointerCapture`), and a `selectedItemId` tap-to-place state machine without `<foreignObject>`; share pure grading logic in `src/lib/math/grader.ts` between offline client and Server Action verification; configure Serwist 9.4+ via `serwist.config.mjs` (`precachePrerendered: true`) alongside an `idb` store (`konleuh-kanit-db` v1: `profiles`, `lessonCache`, `progress`, `syncOutbox`).

```markdown
# Tasks: 001-mvp-lesson-engine

## 1. Project & Khmer Typography Foundation
- [ ] 1.1 Initialize Next.js 16 + Tailwind CSS v4 + Drizzle ORM + Zod + Serwist v9.4+ config mode; confirm clean `npm run build && npx serwist build`.
- [ ] 1.2 Configure Kantumruy Pro variable font, `<html lang="km">`, Khmer CSS guardrails, and Khmer/Arabic numeral normalizer + ZWSP stripper with Vitest unit tests.

## 2. Decoupled Content Engine & Local-First Data
- [ ] 2.1 Implement `LessonDocumentV1Schema`, pure deterministic grader (`gradeStep`), and 4-tier mastery + Leitner scheduler with 100% Vitest coverage.
- [ ] 2.2 Implement `idb` local-first storage (`profiles`, `lessonCache`, `progress`, `syncOutbox`), Drizzle PostgreSQL schema/migrations, and Server Action sync handler.

## 3. Core Student UI & Initial Four SVG Primitives
- [ ] 3.1 Build Khmer landing page, instant guest onboarding (nickname, age/grade, optional warm-up, numeral toggle), and Learning Path dashboard.
- [ ] 3.2 Build `<LessonPlayer />` (8-step loop, 3-tier hint drawer, visual explanation card, calm summary) and first 4 primitives (`counting-stage`, `number-line`, `place-value-blocks`, `scenario-choice`) with dual drag + tap-to-place.

## 4. Initial Content & Verification Gate
- [ ] 4.1 Author and schema-validate Lessons 1, 2, 4, 5, 6, and 7 JSON files (Lessons 3, 8, 9, and 10 complete in Milestone 2 alongside the remaining 4 primitives).
- [ ] 4.2 Run Vitest, Playwright (Chromium & WebKit), `@axe-core/playwright` (`wcag22aa`), and offline PWA verification; execute `/openspec-verify-change` and `/openspec-archive-change`.
```

---

## Phase 5: Initial Ten-Lesson Khmer MVP Learning Path

Path Title: **គ្រឹះគណិតវិទ្យាថ្នាក់ដំបូង (Early Number & Reasoning Foundations)**

| Lesson | Natural Khmer Title (English) | MoEYS Alignment | Concreteness Fading Arc | Primitives Used | Cultural Context & Verified Math Core |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **L1** | **រាប់ចំនួន ១ ដល់ ៥** (Counting & Subitizing 1–5) | G1 Unit 3 | Mangoes in basket → 5-frame dots → Khmer numerals `១–៥` | `counting-stage` | Picking mangoes (*ស្វាយ*) at home; instant dot recognition (`3=3`, `5=5`, `2+2=4`). |
| **L2** | **សូន្យ និងចំនួន ០ ដល់ ១០** (Zero & 0–10 on 10-Frame) | G1 Units 5–6 | Empty/filled trays → 5-anchor 10-frame → `០–១០` | `counting-stage`, `scenario-choice` | Seeing `០` as an empty bowl; structuring `៧` as `៥ + ២` (`5+2=7`, `10-3=7`). |
| **L3** | **ប្រៀបធៀបចំនួន៖ ធំជាង តូចជាង ស្មើ** (Comparing `<, >, =`) | G1 Units 6 & 11 | Fruit baskets on scale → bar lengths → `<, >, =` | `comparison-balance`, `counting-stage` | Weighing oranges (*ក្រូច*) at the market (`7>4`, `3<8`, `6=6`). |
| **L4** | **បន្ទាត់ចំនួន ០ ដល់ ១០** (Number Line 0–10) | G1 Unit 6 | Frog hopping lotus pads → numbered track → missing ticks | `number-line` | Frog (*កង្កែប*) hopping forward/backward on a pond line (`4+1=5`, `8-1=7`). |
| **L5** | **វិធីបូកចំនួនដល់ ១០** (Visual Addition to 10) | G1 Unit 7 | Combining cake plates → 10-frame & hops → $a + b = c$ | `counting-stage`, `number-line`, `scenario-choice` | Sharing Khmer cakes (*នំ*); discovering commutativity (`3+4 = 4+3 = 7`, `6+4=10`). |
| **L6** | **វិធីដកចំនួនត្រឹម ១០** (Visual Subtraction within 10) | G1 Unit 7 | Removing bananas from tray → backward hops → $a - b = c$ | `counting-stage`, `number-line` | Selling bananas (*ចេក*) at a stall (`8-3=5`, `10-6=4`, `7-7=0`). |
| **L7** | **បង្គ្រប់ ១០ និងចំនួន ១១ ដល់ ២០** (Making 10 & Teens) | G1 Unit 10 | Filling 10-slot mango tray → 10-rod + ones → `8+5=10+3=13` | `counting-stage`, `number-line`, `scenario-choice` | Market packing strategy: fill 10 first (`8+5=13`, `14=10+4`, `9+6=15`). |
| **L8** | **ខ្ទង់ដប់ និងខ្ទង់រាយ ដល់ ៩៩** (Tens & Ones up to 99) | G1 Units 8 & 11 | Bundling 10 pencils → base-10 rods/cubes → 2-digit compare | `place-value-blocks`, `comparison-balance` | Classroom pencil bundles (*ខ្ទង់ដប់ / ខ្ទង់រាយ*); `3×10+7=37`, `5×10+0=50`, `42>24`. |
| **L9** | **លំនាំគំរូ និងរូបធរណីមាត្រ** (Patterns & 2D Shapes) | G1 Unit 4 & Geometry | Krama/tile patterns → 2D shape manipulation → number steps | `pattern-sequence`, `fraction-bar-shape`, `scenario-choice` | Traditional *ក្រមា* patterns; triangle/square/rectangle/circle sides (`3, 4, 4, 0`); skip-counting (`2, 4, 6, 8`). |
| **L10** | **រូបិយវត្ថុរៀល និងចំណែកពាក់កណ្តាល** (Riel Money & Halves/Quarters) | G1 Unit 13 & Money | Circulating KHR notes (`១០០៛, ៥០០៛, ១,០០០៛, ២,០០០៛`) + cake halves → fraction bar + 0–1 line | `scenario-choice`, `fraction-bar-shape` | Buying snacks with modern Riel notes (`500+500=1,000៛`, `2,000-1,500=500៛`); equal parts (`1/2 = 2/4`, `1/4 + 1/4 = 1/2`). |

### Reference Lesson JSON (`content/paths/early-foundations/l07-making-ten.json`)

```json
{
  "schemaVersion": "1.0",
  "id": "l07-making-ten",
  "pathId": "early-foundations",
  "order": 7,
  "moeysGradeRef": "G1",
  "topicSlug": "addition-subtraction",
  "titleKm": "បង្គ្រប់ ១០ និងចំនួន ១១ ដល់ ២០",
  "subtitleKm": "រៀនវិធីបង្គ្រប់ ១០ ដើម្បីបូកចំនួនបានលឿន និងងាយស្រួល",
  "estimatedMinutes": 9,
  "learningObjectiveKm": "ប្រើលេខ ១០ ជាគោលដើម្បីគណនាផលបូកចំនួនពី ១១ ដល់ ២០",
  "steps": [
    {
      "id": "l07-s1-concrete",
      "type": "counting-stage",
      "stage": "concrete",
      "promptKm": "ដារ៉ាមានស្វាយ ៨ ផ្លែក្នុងថាស និង ៥ ផ្លែនៅខាងក្រៅ។ រំកិលស្វាយចូលថាសឱ្យពេញ ១០ សិន!",
      "config": {
        "frameSize": 10,
        "tokenTheme": "mango",
        "initialInFrame": 8,
        "initialOutside": 5,
        "allowFreeExplore": true,
        "showLiveCount": true,
        "requireFullTenBundle": true
      },
      "solution": {
        "expectedInFrame": 10,
        "expectedTotal": 13
      },
      "hints": [
        {
          "tier": 1,
          "kind": "visual-cue",
          "textKm": "មើលប្រឡោះទំនេរក្នុងថាស! តើនៅសល់ប្រឡោះទំនេរប៉ុន្មានទៀតទើបពេញ ១០?",
          "highlightTargetId": "empty-slots"
        },
        {
          "tier": 2,
          "kind": "strategy-nudge",
          "textKm": "ថាសមានស្វាយ ៨ ផ្លែហើយ ដូច្នេះត្រូវការតែ ២ ផ្លែទៀតដើម្បីបង្គ្រប់ ១០។"
        },
        {
          "tier": 3,
          "kind": "worked-step",
          "textKm": "ប៉ះស្វាយ ២ ផ្លែនៅខាងក្រៅ រួចដាក់ចូលប្រឡោះទំនេរទាំង ២ ក្នុងថាស។ ខាងក្រៅនឹងសល់ ៣ ផ្លែ!"
        }
      ],
      "explanationKm": "ល្អណាស់! យើងយក ២ ពី ៥ មកបង្គ្រប់ ៨ ឱ្យបាន ១០ ហើយសល់ ៣ ទៀត។ ១០ បូក ៣ ស្មើ ១៣!"
    },
    {
      "id": "l07-s2-iconic-line",
      "type": "number-line",
      "stage": "iconic",
      "promptKm": "គណនា ៩ + ៦ លើបន្ទាត់ចំនួន៖ លោតទៅ ១០ សិន រួចលោតបន្ត ៥ ជំហានទៀត!",
      "config": {
        "min": 0,
        "max": 20,
        "step": 1,
        "startValue": 9,
        "showJumps": true,
        "hiddenTickValues": []
      },
      "solution": {
        "expectedValue": 15,
        "requiredIntermediateValue": 10
      },
      "hints": [
        {
          "tier": 1,
          "kind": "visual-cue",
          "textKm": "ចាប់ផ្ដើមពី ៩ ហើយលោតទៅមុខ ១ ជំហានឱ្យដល់ ១០ សិនណា៎!",
          "highlightTargetId": "tick-10"
        },
        {
          "tier": 2,
          "kind": "strategy-nudge",
          "textKm": "យើងបានលោត ១ ជំហានក្នុងចំណោម ៦ ហើយ ដូច្នេះនៅសល់ ៥ ជំហានទៀតពី ១០។"
        },
        {
          "tier": 3,
          "kind": "worked-step",
          "textKm": "រាប់បន្តពី ១០ ទៅមុខ ៥ ជំហាន៖ ១១, ១២, ១៣, ១៤, ១៥។ ប៉ះលេខ ១៥!"
        }
      ],
      "explanationKm": "៩ + ៦ គិតងាយៗជា ៩ + ១ + ៥ = ១០ + ៥ = ១៥។ ការឈប់នៅលេខ ១០ ជួយឱ្យគិតលេខក្នុងចិត្តបានលឿន!"
    },
    {
      "id": "l07-s3-symbolic-explain",
      "type": "scenario-choice",
      "stage": "symbolic",
      "promptKm": "ដើម្បីគណនា ៧ + ៥ ដោយបង្គ្រប់ ១០ តើរបៀបបំបែកមួយណាត្រឹមត្រូវ?",
      "config": {
        "variant": "single-choice",
        "visualCue": "ten-frame-mini-7-plus-5",
        "options": [
          {
            "id": "opt-a",
            "labelKm": "៧ + ៣ + ២ = ១០ + ២ = ១២",
            "diagnosticFeedbackKm": "ត្រឹមត្រូវហើយ! ៧ បូក ៣ ពេញ ១០ ហើយ ៣ + ២ ស្មើ ៥។"
          },
          {
            "id": "opt-b",
            "labelKm": "៧ + ២ + ២ = ៩ + ២ = ១១",
            "diagnosticFeedbackKm": "ជិតត្រូវហើយ! ២ + ២ ស្មើតែ ៤ ប៉ុណ្ណោះ មិនមែន ៥ ទេ។"
          },
          {
            "id": "opt-c",
            "labelKm": "៧ + ៣ + ៣ = ១០ + ៣ = ១៣",
            "diagnosticFeedbackKm": "ពិនិត្យម្ដងទៀតណា៎! ៣ + ៣ ស្មើ ៦ លើសពី ៥ ទៅហើយ។"
          }
        ]
      },
      "solution": {
        "correctOptionId": "opt-a"
      },
      "hints": [
        {
          "tier": 1,
          "kind": "visual-cue",
          "textKm": "សួរខ្លួនឯងសិន៖ ៧ បូកប៉ុន្មានទើបស្មើ ១០?",
          "highlightTargetId": "visual-cue"
        },
        {
          "tier": 2,
          "kind": "strategy-nudge",
          "textKm": "៧ ត្រូវការ ៣ ដើម្បីបាន ១០។ ដូច្នេះត្រូវបំបែក ៥ ជា ៣ និងប៉ុន្មានទៀត?"
        },
        {
          "tier": 3,
          "kind": "worked-step",
          "textKm": "៥ ស្មើ ៣ + ២។ ដូច្នេះ ៧ + ៥ = ៧ + ៣ + ២ = ១២!"
        }
      ],
      "explanationKm": "អស្ចារ្យ! ពេលបំបែក ៥ ជា ៣ និង ២ យើងបង្គ្រប់ ៧ + ៣ = ១០ បានភ្លាម រួចបូក ២ ទៀតស្មើ ១២។"
    }
  ]
}
```

---

## Phase 6: Testing Strategy, Quality Verification, and Execution Roadmap

### Automated Verification and QA Matrix

| Verification Dimension | Tooling & Execution Scope | Release Gate Pass Criteria |
| :--- | :--- | :--- |
| **Mathematical Correctness & Content Schema** | `Vitest` + `validate:content` CLI script validating `content/**/*.json` against `LessonDocumentV1Schema` and executing tests on `gradeStep()` and `computeMastery()`. | 100% schema pass; every lesson solution passes its grader; every distractor fails with valid Khmer feedback. |
| **Khmer Normalization & Wrapping Safety** | `Vitest` unit suite testing Khmer↔Arabic digit conversion (`០–៩` ↔ `0–9`), `U+200B` ZWSP stripping, and `U+2060` Word Joiner handling. | Identical grading outcomes for Khmer, Arabic, and ZWSP-containing inputs. |
| **Dual Input & Interaction Resilience** | `Playwright` (Chromium + WebKit at `360×800` and `390×844`) running every primitive via pointer drag and via tap-to-place only. | Both modes complete every step; mid-lesson state survives offline reload. |
| **WCAG 2.2 Level AA Accessibility** | `@axe-core/playwright` with `.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])` + bounding-box check (`>= 56×56 px`). | Zero violations across initial, error, hint-open, and completed states; sticky header never obscures focus. |
| **Khmer Typography & Pedagogical Copy** | Real-device QA on mid-range Android Chrome and iOS Safari + native Cambodian primary math teacher review. | Zero clipped *coeng* subscripts or overhead vowels; zero iOS *Khmer Sangam MN* fallback regression. |
| **Offline PWA & Performance** | Lighthouse mobile + DevTools Offline toggle + iOS Add to Home Screen standalone verification. | First-load transfer `<= 220 KB`; full 10-lesson path playable offline; outbox syncs on reconnect. |

### Build, Test, and Deployment Runbook

```bash
# Local development (Next.js 16 Turbopack)
npm run dev

# Validate all decoupled Khmer lesson JSON files against Zod schemas & graders
npm run validate:content

# Run unit tests (graders, numeral normalization, Leitner mastery scheduler)
npm run test:unit

# Run Playwright E2E + WCAG 2.2 AA Axe checks across mobile viewports
npm run test:e2e

# Database migrations (Drizzle Kit)
npx drizzle-kit generate
npx drizzle-kit migrate

# Production build (Next.js 16 + Serwist v9.4+ config mode)
npm run build && npx serwist build
```

### Incremental Verifiable Delivery Roadmap

1. **Milestone 1 (`001-mvp-lesson-engine`):** Next.js 16 + OpenSpec 2.x, Khmer typography/numeral engine, Drizzle + `idb` offline sync, guest onboarding, Lesson Player, first 4 SVG primitives (`counting-stage`, `number-line`, `place-value-blocks`, `scenario-choice`), Lessons 1, 2, 4, 5, 6, and 7.
2. **Milestone 2 (`002-remaining-primitives-and-path`):** Remaining 4 SVG primitives (`comparison-balance`, `array-groups`, `fraction-bar-shape`, `pattern-sequence`), Lessons 3, 8, 9, and 10, weekly rhythm tracking, mastery badges, Android/iOS Safari Khmer QA.
3. **Milestone 3 (`003-audio-review-and-daily-puzzle`):** Recorded native Khmer audio prompts for Grades 1–2, automated Leitner due-review queue, 2-minute Daily Challenge (*លំហាត់ប្រចាំថ្ងៃ*).
4. **Milestone 4 (`004-parent-overview-and-grade3-5-paths`):** PIN-gated Parent Progress Dashboard + Grades 3–5 Geometry (*ធរណីមាត្រ*) and Fractions/Decimals (*ប្រភាគ និងចំនួនទសភាគ*) paths.
5. **Milestone 5 (`005-admin-content-studio`):** Authenticated Khmer Admin Lesson Studio for live preview, ZWSP checks, validation, and publishing directly to PostgreSQL.