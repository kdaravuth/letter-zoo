# Proposal: 003-audio-review-and-daily-puzzle

**Khmer Audio Read-Aloud, Automated Leitner Review Queue & 2-Minute Daily Visual Puzzle**

- **From**: 10-lesson Early Foundations MVP path with visual prompts and local Leitner scheduling metadata stored in IndexedDB, but no audio read-aloud controls, no dedicated review queue UI, and no daily visual puzzle.
- **To**: Emergent-reader Khmer audio read-aloud controls (recorded `audioUrl` with graceful offline Web Speech `km-KH` fallback and persistent audio toggle), an automated Leitner due-review queue (`/review` + `/learn` summary card), and a decoupled JSON 2-minute Daily Visual Puzzle (*លំហាត់ប្រចាំថ្ងៃ* at `/daily`).
- **Reason**: Removes early reading barriers for Cambodian ages 6–8 learners, turns Leitner spaced-review timestamps into a calm actionable review flow, and gives returning learners a low-pressure 2-minute visual math habit.
- **Impact**: Extends `interactive-lesson-player` and introduces `daily-puzzle-review` while staying 100% local-first, offline-capable, zero-timer, and WCAG 2.2 AA compliant.
