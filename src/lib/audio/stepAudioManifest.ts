import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { stripZwsp, toArabicDigits } from "../khmer/numerals";

/**
 * Build-time provenance for pre-generated step prompt audio
 * (`public/audio/steps/<step.id>.mp3`). Node-only: used by scripts and tests,
 * never imported by client components.
 */

export const STEP_AUDIO_VOICE = "Sota";
export const STEP_AUDIO_ENGINE = "kiritts";
export const STEP_AUDIO_MODEL = "kiritts";
export const MIN_AUDIO_BYTES = 500;

export const StepAudioEntrySchema = z.object({
  id: z.string().min(1),
  audioUrl: z.string().startsWith("/audio/steps/"),
  sourceHash: z.string().regex(/^[0-9a-f]{64}$/),
  spokenText: z.string().min(1),
  voice: z.string().min(1),
  engine: z.string().min(1),
  model: z.string().min(1),
  generatedAt: z.string().min(1),
  bytes: z.number().int().positive(),
});

export const StepAudioManifestSchema = z.object({
  version: z.literal(1),
  entries: z.array(StepAudioEntrySchema),
});

export type StepAudioEntry = z.infer<typeof StepAudioEntrySchema>;
export type StepAudioManifest = z.infer<typeof StepAudioManifestSchema>;

export interface PendingStepAudio {
  id: string;
  spokenText: string;
  sourceHash: string;
}

export interface StepPromptSource {
  id: string;
  promptKm: string;
  audioUrl: string;
}

/** Normalizes a prompt for hashing: strip ZWSP, collapse whitespace, trim. */
export function normalizePrompt(promptKm: string): string {
  return stripZwsp(promptKm).replace(/\s+/g, " ").trim();
}

/** SHA-256 (hex) of the normalized prompt text. */
export function hashPrompt(promptKm: string): string {
  return createHash("sha256").update(normalizePrompt(promptKm), "utf8").digest("hex");
}

const DIGIT = "[0-9០-៩]";
const NUMBER = `${DIGIT}+(?:\\.${DIGIT}+)?`;
const OPERAND = `(?:${NUMBER}\\s*/\\s*${NUMBER}|${NUMBER}%?|□)`;
const OPERATOR = "[+\\-−×÷=<>]";
const MATH_RUN = new RegExp(
  `${OPERAND}(?:\\s*${OPERATOR}\\s*${OPERAND})+|${NUMBER}\\s*/\\s*${NUMBER}`,
  "g"
);

const OPERATOR_LATEX: Record<string, string> = {
  "+": "+",
  "-": "-",
  "−": "-",
  "×": "\\times",
  "÷": "\\div",
  "=": "=",
  "<": "<",
  ">": ">",
};

function mathRunToLatex(run: string): string {
  const tokens = run.match(
    new RegExp(`${NUMBER}\\s*/\\s*${NUMBER}|${NUMBER}%?|□|${OPERATOR}`, "g")
  );
  if (!tokens) return run;
  const parts = tokens.map((tok) => {
    if (tok === "□") return "\\square";
    if (tok in OPERATOR_LATEX) return OPERATOR_LATEX[tok];
    const arabic = toArabicDigits(tok).replace(/\s+/g, "");
    const frac = arabic.match(/^([0-9.]+)\/([0-9.]+)$/);
    if (frac) return `\\frac{${frac[1]}}{${frac[2]}}`;
    return arabic.replace(/%$/, "\\%");
  });
  // `\( … \)` delimiters: KiriTTS reads `$` as "ដុល្លារ" in Khmer context.
  return `\\(${parts.join(" ")}\\)`;
}

/**
 * Text sent to KiriTTS: the normalized prompt with inline math runs
 * (e.g. `៣ + ៤`, `២/៤ = ១/២`, `៣ × □ = ១២`) wrapped as LaTeX so they are
 * read as spoken math. Prose (including lone Khmer numerals) is unchanged.
 */
export function toSpokenText(promptKm: string): string {
  return normalizePrompt(promptKm).replace(MATH_RUN, (run) => mathRunToLatex(run));
}

/** Plain variant (no LaTeX) — used for the pilot A/B comparison. */
export function toPlainSpokenText(promptKm: string): string {
  return normalizePrompt(promptKm);
}

export function stepAudioUrl(stepId: string): string {
  return `/audio/steps/${stepId}.mp3`;
}

function collectJsonFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectJsonFiles(full));
    else if (entry.isFile() && entry.name.endsWith(".json")) out.push(full);
  }
  return out.sort();
}

type StepLike = { id: string; promptKm: string; audioUrl?: string };

/** Collects every lesson step and daily-puzzle step with its prompt. */
export function collectStepPrompts(rootDir: string): StepPromptSource[] {
  const steps: StepPromptSource[] = [];
  const push = (s: StepLike) =>
    steps.push({ id: s.id, promptKm: s.promptKm, audioUrl: s.audioUrl ?? stepAudioUrl(s.id) });

  for (const file of collectJsonFiles(path.join(rootDir, "content", "paths"))) {
    const lesson = JSON.parse(fs.readFileSync(file, "utf-8")) as { steps?: StepLike[] };
    for (const step of lesson.steps ?? []) push(step);
  }
  const dailyFile = path.join(rootDir, "content", "daily", "puzzles.json");
  if (fs.existsSync(dailyFile)) {
    const pack = JSON.parse(fs.readFileSync(dailyFile, "utf-8")) as {
      puzzles?: Array<{ step: StepLike }>;
    };
    for (const puzzle of pack.puzzles ?? []) push(puzzle.step);
  }
  return steps;
}

export function manifestPath(rootDir: string): string {
  return path.join(rootDir, "content", "audio", "step-audio-manifest.json");
}

export function readManifest(file: string): StepAudioManifest {
  if (!fs.existsSync(file)) return { version: 1, entries: [] };
  return StepAudioManifestSchema.parse(JSON.parse(fs.readFileSync(file, "utf-8")));
}

export function writeManifest(file: string, manifest: StepAudioManifest): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const sorted = { ...manifest, entries: [...manifest.entries].sort((a, b) => a.id.localeCompare(b.id)) };
  fs.writeFileSync(file, `${JSON.stringify(sorted, null, 2)}\n`, "utf-8");
}

/** Why a step's audio needs (re)generation, or null when it is current. */
export function audioProblem(
  step: StepPromptSource,
  entry: StepAudioEntry | undefined,
  audioFile: string
): string | null {
  if (!fs.existsSync(audioFile) || fs.statSync(audioFile).size <= MIN_AUDIO_BYTES) {
    return "missing or too-small audio file";
  }
  if (!entry) return "no manifest entry";
  if (entry.voice !== STEP_AUDIO_VOICE) return `voice is "${entry.voice}", expected "${STEP_AUDIO_VOICE}"`;
  if (entry.engine !== STEP_AUDIO_ENGINE) return `engine is "${entry.engine}", expected "${STEP_AUDIO_ENGINE}"`;
  if (entry.sourceHash !== hashPrompt(step.promptKm)) return "stale: promptKm changed since generation";
  return null;
}

/** True when the buffer starts with an ID3 tag or an MPEG audio frame sync. */
export function looksLikeMp3(buf: Buffer): boolean {
  if (buf.length < 3) return false;
  if (buf[0] === 0x49 && buf[1] === 0x44 && buf[2] === 0x33) return true; // "ID3"
  return buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0;
}

/** Target bitrate for committed clips (mono speech). */
export const MP3_KBPS = 64;

interface PcmWav {
  channels: number;
  sampleRate: number;
  samples: Int16Array; // interleaved
}

/** Parses a 16-bit PCM RIFF/WAVE buffer, or returns null if it is not one. */
export function parsePcmWav(buf: Buffer): PcmWav | null {
  if (buf.length < 12 || buf.toString("ascii", 0, 4) !== "RIFF" || buf.toString("ascii", 8, 12) !== "WAVE") {
    return null;
  }
  let offset = 12;
  let channels = 0;
  let sampleRate = 0;
  let bitsPerSample = 0;
  let format = 0;
  while (offset + 8 <= buf.length) {
    const id = buf.toString("ascii", offset, offset + 4);
    const declared = buf.readUInt32LE(offset + 4);
    const body = offset + 8;
    // Streaming encoders may write 0 / 0xFFFFFFFF sizes: clamp to what exists.
    const size = Math.min(declared, buf.length - body);
    if (id === "fmt ") {
      format = buf.readUInt16LE(body);
      channels = buf.readUInt16LE(body + 2);
      sampleRate = buf.readUInt32LE(body + 4);
      bitsPerSample = buf.readUInt16LE(body + 14);
    } else if (id === "data") {
      if (format !== 1 || bitsPerSample !== 16 || channels < 1 || channels > 2) return null;
      const len = (declared === 0 || declared === 0xffffffff ? buf.length - body : size) & ~1;
      const samples = new Int16Array(len / 2);
      for (let i = 0; i < samples.length; i++) samples[i] = buf.readInt16LE(body + i * 2);
      return { channels, sampleRate, samples };
    }
    offset = body + size + (size & 1);
  }
  return null;
}

/** Encodes 16-bit PCM WAV to a mono MP3 at {@link MP3_KBPS} kbps. */
export async function wavToMp3(wav: PcmWav): Promise<Buffer> {
  // Dynamic import: the package's "require" entry is a browser IIFE build.
  const { Mp3Encoder } = await import("@breezystack/lamejs");
  const mono =
    wav.channels === 1
      ? wav.samples
      : Int16Array.from({ length: wav.samples.length / 2 }, (_, i) =>
          Math.round((wav.samples[2 * i] + wav.samples[2 * i + 1]) / 2)
        );
  const encoder = new Mp3Encoder(1, wav.sampleRate, MP3_KBPS);
  const parts: Uint8Array[] = [];
  const BLOCK = 1152;
  for (let i = 0; i < mono.length; i += BLOCK) {
    const out = encoder.encodeBuffer(mono.subarray(i, i + BLOCK));
    if (out.length > 0) parts.push(out);
  }
  const tail = encoder.flush();
  if (tail.length > 0) parts.push(tail);
  return Buffer.concat(parts.map((p) => Buffer.from(p)));
}

export interface CommitResult {
  committed: string[];
  rejected: Array<{ id: string; reason: string }>;
}

/**
 * Moves validated staged clips (`<stagingDir>/<id>.mp3`, MP3 or 16-bit PCM
 * WAV, which is transcoded to 64 kbps mono MP3) into `outDir` and
 * upserts their manifest entries. Invalid or missing clips are reported and
 * leave the existing audio untouched.
 */
export async function commitStagedAudio(opts: {
  pending: PendingStepAudio[];
  stagingDir: string;
  outDir: string;
  manifestFile: string;
  now?: Date;
}): Promise<CommitResult> {
  const { pending, stagingDir, outDir, manifestFile } = opts;
  const generatedAt = (opts.now ?? new Date()).toISOString();
  const manifest = readManifest(manifestFile);
  const byId = new Map(manifest.entries.map((e) => [e.id, e]));
  const result: CommitResult = { committed: [], rejected: [] };

  fs.mkdirSync(outDir, { recursive: true });
  for (const item of pending) {
    const staged = path.join(stagingDir, `${item.id}.mp3`);
    if (!fs.existsSync(staged)) {
      result.rejected.push({ id: item.id, reason: "not staged" });
      continue;
    }
    let buf: Buffer = fs.readFileSync(staged);
    // KiriTTS currently returns PCM WAV whatever `format` is requested.
    const wav = parsePcmWav(buf);
    if (wav) buf = await wavToMp3(wav);
    if (buf.length <= MIN_AUDIO_BYTES) {
      result.rejected.push({ id: item.id, reason: `too small (${buf.length} bytes)` });
      continue;
    }
    if (!looksLikeMp3(buf)) {
      result.rejected.push({ id: item.id, reason: "not an MP3 (no ID3/frame header)" });
      continue;
    }
    fs.writeFileSync(path.join(outDir, `${item.id}.mp3`), buf);
    fs.rmSync(staged);
    byId.set(item.id, {
      id: item.id,
      audioUrl: stepAudioUrl(item.id),
      sourceHash: item.sourceHash,
      spokenText: item.spokenText,
      voice: STEP_AUDIO_VOICE,
      engine: STEP_AUDIO_ENGINE,
      model: STEP_AUDIO_MODEL,
      generatedAt,
      bytes: buf.length,
    });
    result.committed.push(item.id);
  }

  writeManifest(manifestFile, { version: 1, entries: [...byId.values()] });
  return result;
}
