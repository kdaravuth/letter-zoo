# Proposal

## Why

The 115 pre-generated prompt clips in `public/audio/steps/` were produced by `scripts/generate-khmer-audio.ts` scraping the unofficial Google Translate TTS endpoint. That gives a robotic, inconsistent read, with audible seams where prompts over 170 characters were stitched from separate requests, and it depends on an undocumented endpoint with no license for redistribution. KiriTTS is a Khmer-first TTS service that is already connected as an MCP server, and its built-in **Sota** voice (female, Standard) gives children one warm, natural narrator across every lesson and daily puzzle.

## What Changes

- **Regenerate all step prompt audio with KiriTTS voice `Sota`**: Replace every `public/audio/steps/<step.id>.mp3` (lesson steps in `content/paths/**` and daily puzzles in `content/daily/puzzles.json`) with a single, unstitched KiriTTS MP3 read from the step's `promptKm`. File names and every `audioUrl` stay the same, so lesson JSON and UI need no changes.
- **Step audio manifest with provenance**: Add a checked-in manifest (`content/audio/step-audio-manifest.json`) that records, for each step, its id, the exact text spoken, a hash of the source `promptKm`, the voice (`Sota`), the engine (`kiritts`), and the generation date. This makes stale audio detectable when a prompt is later edited.
- **Math-aware speech text**: Inline equations and fractions in prompts (for example `២/៤ = ១/២` or `៣ + ៤`) are sent to KiriTTS as LaTeX, so they are read as spoken math rather than as symbols.
- **Retire Google TTS for step audio**: Replace `scripts/generate-khmer-audio.ts` (`npm run generate:audio`) with a manifest exporter that lists the steps needing (re)generation. The audio itself is produced through the KiriTTS MCP `text_to_speech` tool, because the MCP returns time-limited download links and the repo holds no KiriTTS API key.
- **Content validation guard**: `npm run validate:content` fails when a step has no audio file, when its manifest entry is missing, when the voice is not `Sota`, or when the `promptKm` hash no longer matches.

Out of scope: the runtime `/api/tts` fallback route, which still uses Google TTS for text that has no pre-generated clip. A follow-up change can move it to KiriTTS once a server-side API key is approved.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `interactive-lesson-player`: Add a requirement that every lesson and daily-puzzle step ships a pre-generated KiriTTS `Sota` prompt clip whose recorded source text matches the step's current `promptKm`, so all prompts are read in one consistent voice.

## Impact

- **Assets**: all 115 files in `public/audio/steps/*.mp3` are replaced in place (about 7 MB today; expected to be of similar size).
- **New content file**: `content/audio/step-audio-manifest.json`
- **Scripts & tooling**: `scripts/generate-khmer-audio.ts` is rewritten as a manifest exporter (`npm run audio:manifest`), `scripts/validate-content.ts` gains audio and manifest checks, `package.json` scripts change, and `@breezystack/lamejs` is added as a devDependency because KiriTTS returns WAV, which `audio:commit` transcodes to 64 kbps mono MP3.
- **Unchanged**: lesson JSON `audioUrl` values, `src/lib/audio/khmerSpeech.ts` playback cascade, Serwist config (`audio/**` is already excluded from precache).
- **External dependency / cost**: The KiriTTS account's credits are spent by about 115 `text_to_speech` calls, plus re-runs for corrections. Run `get_usage` before the batch.
- **Verification**: content validation, Vitest unit test for the manifest/hash checker, and a manual listening QA pass on a device.
