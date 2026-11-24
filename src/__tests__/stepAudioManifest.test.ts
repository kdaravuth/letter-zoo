import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  commitStagedAudio,
  hashPrompt,
  looksLikeMp3,
  readManifest,
  toSpokenText,
} from "@/lib/audio/stepAudioManifest";

describe("hashPrompt", () => {
  it("is stable across ZWSP and whitespace variants", () => {
    const base = hashPrompt("បើ ៣ + ៤ = ៧ តើ ៤ + ៣ ស្មើប៉ុន្មាន?");
    expect(hashPrompt("បើ ៣​ + ៤ =  ៧ តើ ៤ + ៣ ស្មើប៉ុន្មាន? ")).toBe(base);
    expect(hashPrompt("បើ ៣ + ៤ = ៨ តើ ៤ + ៣ ស្មើប៉ុន្មាន?")).not.toBe(base);
    expect(base).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("toSpokenText", () => {
  it("wraps addition as LaTeX with Arabic digits", () => {
    expect(toSpokenText("ដើម្បីរក ៣ + ៤!")).toBe("ដើម្បីរក \\(3 + 4\\)!");
  });

  it("converts fraction equations to \\frac", () => {
    expect(toSpokenText("លាបពណ៌ (២/៤ = ១/២)!")).toBe(
      "លាបពណ៌ (\\(\\frac{2}{4} = \\frac{1}{2}\\))!"
    );
  });

  it("never uses $ delimiters (read aloud as ដុល្លារ)", () => {
    expect(toSpokenText("បើ ៣ + ៤ = ៧ តើ ៤ + ៣ ស្មើប៉ុន្មាន?")).not.toContain("$");
  });

  it("handles equality, lone fractions, ×, ÷ and boxes", () => {
    expect(toSpokenText("ស្មើគ្នា (៦ = ៦)!")).toBe("ស្មើគ្នា (\\(6 = 6\\))!");
    expect(toSpokenText("ស្មើនឹង ១/២?")).toBe("ស្មើនឹង \\(\\frac{1}{2}\\)?");
    expect(toSpokenText("ក្រឡា ៤×៤ មាន")).toBe("ក្រឡា \\(4 \\times 4\\) មាន");
    expect(toSpokenText("(១២ ÷ ៣)?")).toBe("(\\(12 \\div 3\\))?");
    expect(toSpokenText("ដោះស្រាយ ៣ + □ = ៧")).toBe("ដោះស្រាយ \\(3 + \\square = 7\\)");
  });

  it("leaves math-free prompts unchanged (apart from ZWSP/whitespace)", () => {
    const text = "រាប់ផ្លែក្រូច ៥ ផ្លែ ដាក់ក្នុងថាស!";
    expect(toSpokenText(`${text}​`)).toBe(text);
  });
});

describe("commitStagedAudio", () => {
  let dir: string;
  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "step-audio-"));
    fs.mkdirSync(path.join(dir, "staging"));
    fs.mkdirSync(path.join(dir, "out"));
  });
  afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));

  it("transcodes staged 16-bit PCM WAV into a smaller MP3", async () => {
    const sampleRate = 48000;
    const n = sampleRate; // 1 s tone
    const wav = Buffer.alloc(44 + n * 2);
    wav.write("RIFF", 0, "ascii");
    wav.writeUInt32LE(36 + n * 2, 4);
    wav.write("WAVEfmt ", 8, "ascii");
    wav.writeUInt32LE(16, 16);
    wav.writeUInt16LE(1, 20);
    wav.writeUInt16LE(1, 22);
    wav.writeUInt32LE(sampleRate, 24);
    wav.writeUInt32LE(sampleRate * 2, 28);
    wav.writeUInt16LE(2, 32);
    wav.writeUInt16LE(16, 34);
    wav.write("data", 36, "ascii");
    wav.writeUInt32LE(n * 2, 40);
    for (let i = 0; i < n; i++) {
      wav.writeInt16LE(Math.round(8000 * Math.sin((2 * Math.PI * 440 * i) / sampleRate)), 44 + i * 2);
    }
    const staging = path.join(dir, "staging");
    const out = path.join(dir, "out");
    fs.writeFileSync(path.join(staging, "w.mp3"), wav);

    const res = await commitStagedAudio({
      pending: [{ id: "w", spokenText: "t", sourceHash: "e".repeat(64) }],
      stagingDir: staging,
      outDir: out,
      manifestFile: path.join(dir, "manifest.json"),
    });

    expect(res.committed).toEqual(["w"]);
    const mp3 = fs.readFileSync(path.join(out, "w.mp3"));
    expect(looksLikeMp3(mp3)).toBe(true);
    expect(mp3.length).toBeGreaterThan(500);
    expect(mp3.length).toBeLessThan(wav.length / 8); // ~64 kbps vs 768 kbps
  });

  it("commits valid MP3s and reports invalid ones untouched", async () => {
    const staging = path.join(dir, "staging");
    const out = path.join(dir, "out");
    const manifestFile = path.join(dir, "manifest.json");
    const good = Buffer.concat([Buffer.from("ID3"), Buffer.alloc(1000, 1)]);
    fs.writeFileSync(path.join(staging, "a.mp3"), good);
    fs.writeFileSync(path.join(staging, "b.mp3"), Buffer.alloc(100, 0xff));
    fs.writeFileSync(path.join(staging, "c.mp3"), Buffer.alloc(1000, 0x20));
    fs.writeFileSync(path.join(out, "b.mp3"), "old-b");

    const pending = ["a", "b", "c", "d"].map((id) => ({
      id,
      spokenText: `text ${id}`,
      sourceHash: "f".repeat(64),
    }));
    const res = await commitStagedAudio({
      pending,
      stagingDir: staging,
      outDir: out,
      manifestFile,
      now: new Date("2026-11-24T00:00:00Z"),
    });

    expect(res.committed).toEqual(["a"]);
    expect(res.rejected.map((r) => r.id)).toEqual(["b", "c", "d"]);
    expect(fs.readFileSync(path.join(out, "a.mp3")).equals(good)).toBe(true);
    expect(fs.readFileSync(path.join(out, "b.mp3"), "utf-8")).toBe("old-b");
    expect(fs.existsSync(path.join(staging, "c.mp3"))).toBe(true);

    const manifest = readManifest(manifestFile);
    expect(manifest.entries).toHaveLength(1);
    expect(manifest.entries[0]).toMatchObject({
      id: "a",
      audioUrl: "/audio/steps/a.mp3",
      voice: "Sota",
      engine: "kiritts",
      bytes: good.length,
      generatedAt: "2026-11-24T00:00:00.000Z",
    });
  });
});
