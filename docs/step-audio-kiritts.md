# Step prompt audio (KiriTTS · voice "Sota")

Every lesson step and daily puzzle step has a pre-generated prompt clip at
`public/audio/steps/<step.id>.mp3`, voiced by the KiriTTS built-in voice **Sota**.
Provenance for each clip lives in `content/audio/step-audio-manifest.json`
(spoken text, SHA-256 of the source `promptKm`, voice, engine, date, size).
`npm run validate:content` fails if a clip is missing, stale, or not Sota.

## When to regenerate

After adding a step or editing a `promptKm`, run:

```bash
npm run audio:manifest              # lists missing/stale steps → .audio-staging/pending.json
npm run audio:manifest -- --only f05-s2-paint-half-grid   # force one step
npm run audio:manifest -- --all     # force everything
```

## Generating clips (agent workflow)

KiriTTS is reached through the **KiriTTS MCP server** (no API key lives in this
repo), so an agent session does the generation:

1. Optional: check credits with the MCP `get_usage` tool.
2. For each entry in `.audio-staging/pending.json`, call `text_to_speech` with
   `text` = the entry's `spokenText`, `voice: "Sota"`, `format: "mp3"`, and
   leave speed, instructions, and stability unset.
3. Download the returned link **immediately** (it expires in about a day):
   `curl -sSfL -o .audio-staging/<id>.mp3 "<link>"`
4. Run `npm run audio:commit`. This validates each staged file and moves it into
   `public/audio/steps/`, then updates the manifest. KiriTTS currently returns
   PCM WAV for every `format`, so WAV input is transcoded to a 64 kbps mono MP3
   here. Rejected files are reported
   and the existing clip is left in place.
5. Run `npm run validate:content` and listen to the changed clips.

`spokenText` is the prompt with inline math converted to LaTeX
(`៣ + ៤` → `\(3 + 4\)`, `២/៤` → `\(\frac{2}{4}\)`), so KiriTTS reads it as
spoken math. Do not use `$…$` delimiters: in Khmer context KiriTTS reads `$`
aloud as "ដុល្លារ" (found in the pilot, 2026-11-24). See `toSpokenText` in `src/lib/audio/stepAudioManifest.ts`.
