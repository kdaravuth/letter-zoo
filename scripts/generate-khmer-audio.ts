/**
 * Step audio manifest exporter (`npm run audio:manifest`).
 *
 * Lists lesson / daily-puzzle steps whose prompt audio is missing, stale
 * (promptKm edited), or not voiced by KiriTTS "Sota", and writes the work list
 * to `.audio-staging/pending.json`. The clips themselves are generated through
 * the KiriTTS MCP `text_to_speech` tool — see docs/step-audio-kiritts.md.
 *
 * Flags:
 *   --all          list every step (force full regeneration)
 *   --only <id>    list only the given step id (repeatable)
 */
import fs from "node:fs";
import path from "node:path";
import {
  audioProblem,
  collectStepPrompts,
  hashPrompt,
  manifestPath,
  readManifest,
  toSpokenText,
  type PendingStepAudio,
} from "../src/lib/audio/stepAudioManifest";

const ROOT = process.cwd();
const STAGING_DIR = path.join(ROOT, ".audio-staging");
const OUT_DIR = path.join(ROOT, "public", "audio", "steps");

function parseArgs(argv: string[]) {
  const only = new Set<string>();
  let all = false;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--all") all = true;
    else if (argv[i] === "--only" && argv[i + 1]) only.add(argv[++i]);
  }
  return { all, only };
}

function main() {
  const { all, only } = parseArgs(process.argv.slice(2));
  const steps = collectStepPrompts(ROOT);
  const manifest = readManifest(manifestPath(ROOT));
  const byId = new Map(manifest.entries.map((e) => [e.id, e]));

  const knownIds = new Set(steps.map((s) => s.id));
  for (const id of only) {
    if (!knownIds.has(id)) {
      console.error(`Unknown step id: ${id}`);
      process.exit(1);
    }
  }

  const pending: PendingStepAudio[] = [];
  for (const step of steps) {
    if (only.size > 0 && !only.has(step.id)) continue;
    const reason =
      all || only.size > 0
        ? "requested"
        : audioProblem(step, byId.get(step.id), path.join(OUT_DIR, `${step.id}.mp3`));
    if (!reason) continue;
    pending.push({
      id: step.id,
      spokenText: toSpokenText(step.promptKm),
      sourceHash: hashPrompt(step.promptKm),
    });
    console.log(`${step.id}: ${reason}`);
  }

  fs.mkdirSync(STAGING_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(STAGING_DIR, "pending.json"),
    `${JSON.stringify(pending, null, 2)}\n`,
    "utf-8"
  );
  console.log(`\n${pending.length} of ${steps.length} steps pending → .audio-staging/pending.json`);
}

main();
