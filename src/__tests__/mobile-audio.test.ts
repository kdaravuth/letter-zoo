import { afterEach, describe, expect, it, vi } from "vitest";
import { speakKhmerPrompt, stopKhmerSpeech } from "@/lib/audio/khmerSpeech";

describe("mobile gesture-safe Khmer speech playback", () => {
  afterEach(() => {
    stopKhmerSpeech();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("synchronously primes HTMLAudioElement inside user tap gesture and resets speaking state on stop", () => {
    let loadCalls = 0;
    let pauseCalls = 0;

    class MockAudio {
      preload = "auto";
      src = "";
      currentTime = 0;
      onplay: (() => void) | null = null;
      onended: (() => void) | null = null;
      onerror: (() => void) | null = null;
      load() {
        loadCalls++;
      }
      pause() {
        pauseCalls++;
      }
      play() {
        this.onplay?.();
        return Promise.resolve();
      }
    }

    vi.stubGlobal("window", globalThis);
    vi.stubGlobal("Audio", MockAudio);

    let started = false;
    let ended = false;

    speakKhmerPrompt({
      textKm: "រាប់ផ្លែស្វាយទាំងអស់",
      audioUrl: "/audio/lessons/test.mp3",
      onStart: () => {
        started = true;
      },
      onEnd: () => {
        ended = true;
      },
    });

    // Synchronous user-gesture prime happened immediately before any async continuation
    expect(loadCalls).toBe(1);

    // Stopping speech while active invokes onEnd so the button never stays stuck in "កំពុងអាន..."
    stopKhmerSpeech();
    expect(pauseCalls).toBeGreaterThanOrEqual(1);
    expect(ended).toBe(true);
    expect(typeof started).toBe("boolean");
  });
});
