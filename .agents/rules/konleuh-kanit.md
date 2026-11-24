---
trigger: always_on
---

# Konleuh Kanit (គន្លឹះគណិត) — Non-Negotiable Architecture & Design Guardrails

1. **Khmer-First Typography**:
   - Set `<html lang="km">`.
   - Load `Kantumruy_Pro` (variable WOFF2, primary) + `Noto_Sans_Khmer` (fallback) via `next/font/google`.
   - Enforce `line-height: 1.7` (1.65–1.8) and `letter-spacing: 0 !important`.
   - Never use `text-justify: inter-character`.
   - Keep child-facing Khmer prompts concise and natural (aligned with MoEYS primary math terminology).

2. **Dual Numerals & ZWSP Safety**:
   - Display Khmer numerals (`០–៩`) by default across all screens.
   - Provide a persistent one-tap toggle (`១២៣` / `123`) to switch between Khmer (`០–៩`) and Hindu-Arabic (`0–9`) numerals without resetting active step state.
   - Strip all `U+200B` (Zero-Width Space / ZWSP) characters and normalize both numeral scripts to canonical numbers before grading, matching, or search.

3. **Touch & WCAG 2.2 AA Accessibility**:
   - Every drag-based SVG manipulative MUST support single-pointer **tap-to-select + tap-to-place** (WCAG 2.2 SC 2.5.7).
   - Size interactive manipulative tokens (`.manipulative-target`) to at least `56x56 CSS px` and secondary buttons/controls to at least `44x44 CSS px`.
   - Apply `scroll-margin-top: 5rem` to interactive controls so sticky headers never obscure keyboard focus (WCAG 2.2 SC 2.4.11).

4. **Safari SVG Safety**:
   - Build all mathematical manipulatives with inline React `<svg>` (explicit `viewBox`) and unified Pointer Events.
   - NEVER use `<foreignObject>` inside `<svg>` and never CSS-scale SVG text above `1.0`.

5. **Decoupled Content Engine**:
   - Never hardcode lesson screens in React components.
   - All lessons MUST live as Zod-validated JSON files (`LessonDocumentV1Schema`) rendered dynamically by a single `<ActivityRenderer />`.

6. **Calm Pedagogy**:
   - Zero countdown timers, zero global leaderboards, zero loot boxes, zero virtual coin storefronts, and zero harsh red failure banners.
   - Use warm low-fatigue OKLCH ivory surfaces, gentle visual discrepancy feedback, and gated 3-tier elaborative hints (`visual-cue` → `strategy-nudge` → `worked-step`).
   - Never lock learning paths rigidly by grade.

7. **Resilient Local-First Data**:
   - Persist student profiles, lesson cache, progress, mastery, and sync outbox to IndexedDB (`idb`) first.
   - Keep PostgreSQL + Drizzle ORM schema and Server Action sync clean and valid, gracefully falling back to local-only mode when `DATABASE_URL` is not configured.
