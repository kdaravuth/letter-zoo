# Design

## Context

- 115 steps (lessons + daily puzzles) each reference `/audio/steps/<step.id>.mp3`. The clips are played first in the `speakKhmerPrompt` cascade (`src/lib/audio/khmerSpeech.ts`), before falling back to `/api/tts` and then `speechSynthesis`.
- KiriTTS is reachable only through the **KiriTTS MCP server** connected to the agent session. `text_to_speech` returns a download link that stays valid for about a day. The repo has no KiriTTS API key and no server-side client.
- Prompts are at most about 263 characters, well under KiriTTS's 4096-character limit, so each prompt is one call and needs no chunking.
- Some prompts contain inline math (`២/៤ = ១/២`, `៣ + ៤`, `៦ = ៦`). KiriTTS reads LaTeX (`$…$`) as spoken math.
- `serwist.config.js` already excludes `audio/**` from precache, so replacing files in place does not invalidate any precache manifest.

## Goals / Non-Goals

**Goals:**
- Reproducible, auditable regeneration: anyone can see which text produced which clip, in which voice.
- Regenerate only what changed (missing, stale hash, or wrong voice) so credits aren't wasted.
- Keep file names and `audioUrl` values stable, with zero UI or lesson JSON churn.

**Non-Goals:**
- Moving `/api/tts` runtime fallback to KiriTTS (needs a server API key; separate change).
- Changing feedback chimes, hint audio, or any non-step audio.
- Adding speed, `instructions`, or `stability` tuning. Sota's default delivery is used.

## Decisions

### D1. Agent-driven generation via MCP, script-driven bookkeeping
The split is: `npm run audio:manifest` (rewritten `scripts/generate-khmer-audio.ts`) computes the work list, the agent calls `mcp__kiritts__text_to_speech` for each item, `curl` downloads each link into a staging folder, and `npm run audio:commit` validates the staged files, moves them into `public/audio/steps/`, and writes the manifest.
- *Why*: MCP tools are callable only by the agent, and the links expire. Keeping the bookkeeping in scripts makes it deterministic and testable. Only the TTS call itself is manual or agent-driven.
- *Alternative*: calling the KiriTTS REST API directly from a Node script. That is cleaner long-term but needs an API key in `.env` and a review of the key-handling policy. It's deferred. The manifest format is designed so a future script can drop in without any other change.

### D2. Manifest at `content/audio/step-audio-manifest.json`
One entry per step: `{ id, audioUrl, sourceHash, spokenText, voice: "Sota", engine: "kiritts", model: "kiritts", generatedAt, bytes }`. `sourceHash` = SHA-256 of `stripZwsp(promptKm)` normalized for whitespace. The file has a Zod schema in `src/lib/audio/stepAudioManifest.ts`, shared by the scripts, the validator, and a Vitest test.
- *Why content/ and not public/*: the manifest is build-time provenance, not something the client needs to download.

### D3. Speech text = `promptKm` with math wrapped as LaTeX
A pure function `toSpokenText(promptKm)` strips ZWSP, collapses whitespace, and wraps inline math runs as LaTeX: digit/operator sequences such as `៣ + ៤`, `២/៤ = ១/២`, and `៦ = ៦` become `$3 + 4$`, `$\frac{2}{4} = \frac{1}{2}$`, and `$6 = 6$`, with Khmer digits converted to Arabic inside the formula. Everything else is passed through unchanged, and Khmer numerals in prose stay as written. The exact `spokenText` is stored in the manifest.
- *Alternative*: sending the raw text. That risks `/` being read as "slash" or skipped. A pilot (tasks §2) listens to both forms for 3 representative prompts and confirms LaTeX before the full batch. If the raw text sounds better, `toSpokenText` falls back to whitespace and ZWSP cleanup only, with no other design change.

### D4. Staging and atomic swap
Downloads go to `.audio-staging/` (gitignored). `audio:commit` checks each file before moving it: size > 500 bytes and an MP3 frame sync or ID3 header. Files that fail are reported and left out. Old clips are overwritten only for ids that passed, so a partial batch never leaves a step without audio.

**WAV transcoding (found during apply, 2026-11-24):** KiriTTS returns 16-bit mono 48 kHz PCM WAV for every requested `format` (`mp3`, `aac`, `opus`), even though the response says `audio/mpeg`. That made the 115 clips total 68 MB. `audio:commit` therefore detects RIFF/WAVE input and encodes it to a 64 kbps mono MP3 with `@breezystack/lamejs` (a pure-JS LAME port, added as a devDependency), loaded through a dynamic `import()` because its CommonJS entry is a browser IIFE. *Alternative considered*: ffmpeg. It was rejected because it is not installed here and would add a system prerequisite for anyone regenerating clips. The result is 5.7 MB for all clips, with durations matching the source WAVs.

### D5. Validator enforcement
`scripts/validate-content.ts` gains a check for every step: file exists and is > 500 bytes, a manifest entry exists, `voice === "Sota"`, `engine === "kiritts"`, and `sourceHash` matches. It fails with the list of offending step ids.

## Risks / Trade-offs

- [Credits run out mid-batch] → Run `get_usage` first. Generation is idempotent and resumable because `audio:manifest` lists only pending ids.
- [Download links expire (~1 day)] → Download each link immediately after its TTS call, not at the end of the batch.
- [Mispronounced math or terms] → Run a pilot on 3 prompts first, then a listening QA pass. Single ids can be regenerated with `audio:manifest --only <id>`.
- [Manual agent step is not CI-reproducible] → Provenance is captured in the manifest. CI only validates, it never generates.
- [Browser/CDN HTTP cache serves old clips under the same URL] → Clips aren't precached. If needed, `audioUrl` can carry a `?v=<sourceHash8>` query later. That is not added now, to keep the JSON stable.

## Migration Plan

1. Land the tooling (manifest schema, exporter, commit script, validator) behind no-op behavior: the validator's audio checks are on, but the manifest is generated before merge.
2. Pilot 3 clips, get listening approval, then run the full batch and the listening QA pass.
3. Commit the audio, manifest, and tooling together in one commit.
4. Rollback: `git revert` the commit to restore the previous MP3s and script.
