"use client";

let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctx) return null;

  if (!sharedAudioCtx) {
    try {
      sharedAudioCtx = new Ctx();
    } catch {
      return null;
    }
  }

  if (sharedAudioCtx.state === "suspended") {
    void sharedAudioCtx.resume().catch(() => {
      // Ignore autoplay blocks
    });
  }
  return sharedAudioCtx;
}

function withActiveAudioContext(run: (ctx: AudioContext) => void): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    void ctx
      .resume()
      .then(() => {
        try {
          run(ctx);
        } catch {
          // Non-blocking
        }
      })
      .catch(() => {
        // Ignore autoplay blocks
      });
    return;
  }
  try {
    run(ctx);
  } catch {
    // Non-blocking
  }
}

function playTone(
  ctx: AudioContext,
  freq: number,
  startOffset: number,
  duration: number,
  gainPeak: number,
  type: OscillatorType = "sine"
) {
  const now = ctx.currentTime + startOffset;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(gainPeak, now + 0.018);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + duration + 0.02);
}

// Warm C-major pentatonic xylophone scale (pleasant at every step)
const PENTATONIC_FREQS = [
  261.63, // C4
  293.66, // D4
  329.63, // E4
  392.0,  // G4
  440.0,  // A4
  523.25, // C5
  587.33, // D5
  659.25, // E5
  783.99, // G5
  880.0,  // A5
  1046.5, // C6
] as const;

/**
 * Plays an ascending pentatonic wooden-xylophone note mapped to count/position.
 */
export function playScaleNote(stepIndex: number, enabled: boolean): void {
  if (!enabled) return;
  withActiveAudioContext((ctx) => {
    const idx = Math.max(
      0,
      Math.min(PENTATONIC_FREQS.length - 1, Math.round(stepIndex))
    );
    playTone(ctx, PENTATONIC_FREQS[idx], 0, 0.16, 0.11, "triangle");
  });
}

/**
 * Playful soft water-plop sound for frog hops on lotus pads.
 */
export function playWaterPlop(enabled: boolean): void {
  if (!enabled) return;
  withActiveAudioContext((ctx) => {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(340, now);
    osc.frequency.exponentialRampToValueAtTime(620, now + 0.09);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.16);
  });
}

/**
 * Plays a short musical sequence for Krama pattern playback.
 */
export function playPatternMelody(
  colorIndices: number[],
  enabled: boolean
): void {
  if (!enabled) return;
  const notes = [392.0, 440.0, 523.25, 659.25]; // G4, A4, C5, E5
  withActiveAudioContext((ctx) => {
    colorIndices.forEach((colorIdx, pos) => {
      const freq =
        notes[((colorIdx % notes.length) + notes.length) % notes.length];
      playTone(ctx, freq, pos * 0.16, 0.14, 0.11, "triangle");
    });
  });
}

/**
 * Calm rising pentatonic marimba chime on correct answers.
 */
export function playSuccessChime(enabled: boolean): void {
  if (!enabled) return;
  withActiveAudioContext((ctx) => {
    playTone(ctx, 523.25, 0, 0.18, 0.12, "triangle"); // C5
    playTone(ctx, 659.25, 0.09, 0.2, 0.12, "triangle"); // E5
    playTone(ctx, 783.99, 0.18, 0.32, 0.14, "sine"); // G5
  });
}

/**
 * Gentle warm chime when revealing a progressive hint.
 */
export function playHintChime(enabled: boolean): void {
  if (!enabled) return;
  withActiveAudioContext((ctx) => {
    playTone(ctx, 587.33, 0, 0.22, 0.09, "sine"); // D5
  });
}

/**
 * Soft non-punitive wooden tap when an answer needs another try (never a harsh buzzer).
 */
export function playGentleNudgeChime(enabled: boolean): void {
  if (!enabled) return;
  withActiveAudioContext((ctx) => {
    playTone(ctx, 329.63, 0, 0.14, 0.07, "sine"); // E4 soft
  });
}
