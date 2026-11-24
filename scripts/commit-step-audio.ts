/**
 * Commits staged KiriTTS clips (`npm run audio:commit`).
 *
 * Reads `.audio-staging/pending.json`, validates each `.audio-staging/<id>.mp3`
 * (> 500 bytes, ID3/MPEG header), moves valid clips into public/audio/steps/
 * and records their provenance in content/audio/step-audio-manifest.json.
 */
import fs from "node:fs";
import path from "node:path";
import {
  commitStagedAudio,
  manifestPath,
  type PendingStepAudio,
} from "../src/lib/audio/stepAudioManifest";

const ROOT = process.cwd();
const STAGING_DIR = path.join(ROOT, ".audio-staging");
const PENDING_FILE = path.join(STAGING_DIR, "pending.json");

async function main() {
  if (!fs.existsSync(PENDING_FILE)) {
    console.error("No .audio-staging/pending.json — run `npm run audio:manifest` first.");
    process.exit(1);
  }
  const pending = JSON.parse(fs.readFileSync(PENDING_FILE, "utf-8")) as PendingStepAudio[];
  const res = await commitStagedAudio({
    pending,
    stagingDir: STAGING_DIR,
    outDir: path.join(ROOT, "public", "audio", "steps"),
    manifestFile: manifestPath(ROOT),
  });

  for (const r of res.rejected) console.error(`REJECTED ${r.id}: ${r.reason}`);
  console.log(`Committed ${res.committed.length} clip(s); rejected ${res.rejected.length}.`);
  if (res.rejected.length > 0) process.exit(1);
}

void main();
