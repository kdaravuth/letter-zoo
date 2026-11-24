# Tasks

## 1. Manifest schema and speech-text helpers

- [x] 1.1 Add `src/lib/audio/stepAudioManifest.ts` with the Zod manifest schema (D2), `hashPrompt(promptKm)` (SHA-256 over ZWSP-stripped, whitespace-collapsed text) and `toSpokenText(promptKm)` (D3 LaTeX math wrapping). Verify: Vitest `src/__tests__/stepAudioManifest.test.ts` covers hash stability across ZWSP/whitespace variants and LaTeX output for `៣ + ៤`, `២/៤ = ១/២`, `៦ = ៦`, and a math-free prompt, and passes under `npm run test:unit`.
- [x] 1.2 Add `.audio-staging/` to `.gitignore`. Verify: `git check-ignore .audio-staging/x.mp3` matches.

## 2. Generation tooling

- [x] 2.1 Rewrite `scripts/generate-khmer-audio.ts` as the manifest exporter (`npm run audio:manifest`). It collects lesson and daily steps, compares them with `content/audio/step-audio-manifest.json`, and writes `.audio-staging/pending.json` (`[{ id, spokenText, sourceHash }]`) for steps that are missing, stale, or not `Sota`. It supports `--only <id>` and `--all`, and contains no Google TTS code. Verify: with no manifest present, the exporter lists all 115 step ids.
- [x] 2.2 Add `scripts/commit-step-audio.ts` (`npm run audio:commit`). It reads `pending.json` and the staged `<id>.mp3` files, rejects files ≤ 500 bytes or without an MP3/ID3 header, moves valid files into `public/audio/steps/`, and upserts manifest entries (`voice: "Sota"`, `engine: "kiritts"`, `model: "kiritts"`, `generatedAt`, `bytes`). Verify: Vitest test with a fixture temp dir shows valid files committed and invalid files reported and left untouched.
- [x] 2.3 Update `package.json` scripts (`audio:manifest`, `audio:commit`; remove `generate:audio`) and document the agent workflow in `docs/` (KiriTTS MCP `text_to_speech` with `voice: "Sota"` → curl link → `audio:commit`). Verify: `npm run audio:manifest` runs, and the doc file exists.

## 3. Pilot (approval gate)

- [x] 3.1 Run KiriTTS `get_usage` and record the remaining credits in the PR notes. Verify: the number is noted as enough for about 130 calls.
- [x] 3.2 Generate 3 pilot clips with `voice: "Sota"` (a plain prompt, a fraction prompt such as `f05-s2`, and an equation prompt), each in both LaTeX and raw-text form, saved to `.audio-staging/pilot/`. Verify: the user listens and approves the Sota voice and the math-reading form. If raw text is chosen, simplify `toSpokenText` and update the test from 1.1.

## 4. Full regeneration

- [x] 4.1 For each entry in `pending.json`, call `mcp__kiritts__text_to_speech` (`text: spokenText`, `voice: "Sota"`, `format: "mp3"`) and immediately curl the returned link to `.audio-staging/<id>.mp3`. Verify: 115 staged files exist.
- [x] 4.2 Run `npm run audio:commit`, then re-run `npm run audio:manifest`. Verify: the pending list is empty and the manifest has 115 `Sota` entries.

## 5. Validation enforcement

- [x] 5.1 Extend `scripts/validate-content.ts` with the D5 checks (file exists and is > 500 bytes, manifest entry exists, voice is `Sota`, engine is `kiritts`, hash matches), reporting the offending ids. Verify: `npm run validate:content` passes, and temporarily editing one `promptKm` makes it fail and name that id.

## 6. Integration QA

- [x] 6.1 Run `npm run test:unit`, `npm run validate:content` and `npm run test:e2e`. Verify: all green.
- [ ] 6.2 Listening QA on a phone: play the read-aloud on at least one step per path plus one daily puzzle, and spot-check every math-bearing prompt. Verify: no seams, cut-offs, or misread equations, and the QA notes are recorded in the PR.

## Workflow follow-up

- Archive with `openspec archive replace-step-audio-kiritts-sota` after merge.
- Follow-up change candidate: move the `/api/tts` runtime fallback to KiriTTS with a server-side API key.
