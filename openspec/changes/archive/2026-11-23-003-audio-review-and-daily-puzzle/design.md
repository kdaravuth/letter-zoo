# Design: 003-audio-review-and-daily-puzzle

## Architecture Decisions

1. **Resilient Khmer Audio Read-Aloud (`src/lib/audio/khmerSpeech.ts`, `src/components/ui/AudioReadButton.tsx`)**
   - Supports optional pre-recorded lesson step audio (`step.audioUrl`) via `HTMLAudioElement`, falling back cleanly to browser `window.speechSynthesis` targeting `km-KH` / Khmer voices when no recording file is attached.
   - Provides a persistent `audioEnabled` preference stored in `LocalStudentProfile` (IndexedDB + localStorage) and toggleable in the lesson header (`សំឡេង`).
   - Degrades gracefully without runtime exceptions in browsers or headless environments lacking Khmer TTS voices, always displaying clear visual playback feedback.

2. **Automated Leitner Due-Review Queue (`src/lib/math/reviewQueue.ts`, `src/app/review/page.tsx`)**
   - Computes due lessons purely from `LessonDocumentV1[]`, `progressByLesson`, and current timestamp (`nextReviewAt <= now`), sorted by oldest overdue first and lowest Leitner box first.
   - Surfaces a calm due-review summary card on `/learn` and a dedicated `/review` queue listing due lessons (with Leitner box `១..៥` and interval badges) plus an optional early-practice list when all reviews are caught up.

3. **Decoupled 2-Minute Daily Visual Puzzle (`content/daily/puzzles.json`, `src/lib/curriculum/daily.ts`, `src/app/daily/page.tsx`)**
   - Stores a Zod-validated JSON pack (`DailyPuzzlePackV1Schema`) of 7 daily puzzles reusing the existing 8 `ActivityStepSchema` primitives—zero hardcoded math UI.
   - Deterministically selects today's puzzle by calendar date (`YYYY-MM-DD`) so every learner gets the same daily puzzle offline, while letting them explore other puzzles calmly with zero countdown timers.
   - Persists daily completions in IndexedDB (`progress` store under `daily:${dateIso}` + milestone XP + weekly rhythm active date).
