"use client";

import { stripZwsp } from "@/lib/khmer/numerals";

let sharedAudioEl: HTMLAudioElement | null = null;
let activeObjectUrl: string | null = null;
let activeFallbackTimer: ReturnType<typeof setTimeout> | null = null;
let activeOnEndCallback: (() => void) | null = null;
let activeRequestId = 0;

const AUDIO_CACHE_NAME = "konleuh-kanit-audio-v1";

export interface SpeakKhmerOptions {
  textKm: string;
  audioUrl?: string;
  onStart?: () => void;
  onEnd?: () => void;
}

function getOrCreateSharedAudio(): HTMLAudioElement | null {
  if (typeof window === "undefined" || typeof Audio === "undefined") {
    return null;
  }
  if (!sharedAudioEl) {
    try {
      sharedAudioEl = new Audio();
      sharedAudioEl.preload = "auto";
    } catch {
      return null;
    }
  }
  return sharedAudioEl;
}

export function stopKhmerSpeech(): void {
  activeRequestId++;

  if (sharedAudioEl) {
    try {
      sharedAudioEl.onplay = null;
      sharedAudioEl.onended = null;
      sharedAudioEl.onerror = null;
      sharedAudioEl.pause();
      sharedAudioEl.currentTime = 0;
    } catch {
      // ignore
    }
  }

  if (activeObjectUrl) {
    try {
      URL.revokeObjectURL(activeObjectUrl);
    } catch {
      // ignore
    }
    activeObjectUrl = null;
  }

  if (activeFallbackTimer) {
    clearTimeout(activeFallbackTimer);
    activeFallbackTimer = null;
  }

  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }

  if (activeOnEndCallback) {
    const cb = activeOnEndCallback;
    activeOnEndCallback = null;
    cb();
  }
}

async function playAudioSource(
  audio: HTMLAudioElement | null,
  src: string,
  requestId: number,
  onStart?: () => void,
  onEnd?: () => void
): Promise<boolean> {
  if (!audio || requestId !== activeRequestId) {
    return false;
  }

  return new Promise<boolean>((resolve) => {
    try {
      let started = false;

      audio.onplay = () => {
        if (requestId !== activeRequestId) return;
        started = true;
        onStart?.();
      };
      audio.onended = () => {
        if (requestId !== activeRequestId) {
          resolve(false);
          return;
        }
        activeOnEndCallback = null;
        onEnd?.();
        resolve(true);
      };
      audio.onerror = () => {
        if (started && requestId === activeRequestId) {
          activeOnEndCallback = null;
          onEnd?.();
        }
        resolve(false);
      };

      audio.src = src;
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.then === "function") {
        playPromise.catch(() => {
          if (started && requestId === activeRequestId) {
            activeOnEndCallback = null;
            onEnd?.();
          }
          resolve(false);
        });
      }
    } catch {
      resolve(false);
    }
  });
}

async function fetchCachedTtsBlobUrl(textKm: string): Promise<string | null> {
  const clean = stripZwsp(textKm).trim();
  if (!clean) return null;

  const url = `/api/tts?text=${encodeURIComponent(clean)}`;

  try {
    if ("caches" in window) {
      const cache = await window.caches.open(AUDIO_CACHE_NAME);
      const cached = await cache.match(url);
      if (cached && cached.ok) {
        const blob = await cached.blob();
        if (blob.size > 0) {
          return URL.createObjectURL(blob);
        }
      }

      if (navigator.onLine) {
        const res = await fetch(url);
        if (res.ok && res.headers.get("content-type")?.includes("audio")) {
          await cache.put(url, res.clone());
          const blob = await res.blob();
          if (blob.size > 0) {
            return URL.createObjectURL(blob);
          }
        }
      }
      return null;
    }

    if (navigator.onLine) {
      const res = await fetch(url);
      if (res.ok && res.headers.get("content-type")?.includes("audio")) {
        const blob = await res.blob();
        if (blob.size > 0) {
          return URL.createObjectURL(blob);
        }
      }
    }
  } catch {
    // Fall through to speech synthesis
  }

  return null;
}

function speakWithSpeechSynthesis(
  textKm: string,
  requestId: number,
  onStart?: () => void,
  onEnd?: () => void
): void {
  if (requestId !== activeRequestId) return;

  if (
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    typeof SpeechSynthesisUtterance !== "undefined"
  ) {
    try {
      const voices = window.speechSynthesis.getVoices();
      const khmerVoice = voices.find((v) =>
        v.lang.toLowerCase().startsWith("km")
      );

      if (khmerVoice) {
        const utterance = new SpeechSynthesisUtterance(stripZwsp(textKm));
        utterance.lang = "km-KH";
        utterance.voice = khmerVoice;
        utterance.rate = 0.92;
        utterance.onstart = () => {
          if (requestId === activeRequestId) onStart?.();
        };
        utterance.onend = () => {
          if (requestId === activeRequestId) {
            activeOnEndCallback = null;
            onEnd?.();
          }
        };
        utterance.onerror = () => {
          if (requestId === activeRequestId) {
            activeOnEndCallback = null;
            onEnd?.();
          }
        };
        window.speechSynthesis.speak(utterance);
        return;
      }
    } catch {
      // Fall back to visual read-along pulse
    }
  }

  // Graceful visual read-along pulse when offline without cached MP3 or local Khmer voice
  onStart?.();
  activeFallbackTimer = setTimeout(() => {
    activeFallbackTimer = null;
    if (requestId === activeRequestId) {
      activeOnEndCallback = null;
      onEnd?.();
    }
  }, 900);
}

/**
 * Plays natural Khmer voice audio via a resilient 3-tier cascade:
 * 1. Pre-generated local offline MP3 (`step.audioUrl`)
 * 2. Cached server-side Khmer TTS (`/api/tts`) stored in browser CacheStorage
 * 3. Browser SpeechSynthesis (`km-KH`) or calm visual read-along fallback
 *
 * Synchronously primes a shared HTMLAudioElement inside the user tap gesture so
 * iOS Safari and Android Chrome allow playback after async fetches.
 */
export function speakKhmerPrompt({
  textKm,
  audioUrl,
  onStart,
  onEnd,
}: SpeakKhmerOptions): void {
  stopKhmerSpeech();

  if (typeof window === "undefined") {
    onEnd?.();
    return;
  }

  const requestId = ++activeRequestId;
  activeOnEndCallback = onEnd ?? null;

  // Synchronously prime shared HTMLAudioElement inside the user tap call stack
  const audioEl = getOrCreateSharedAudio();
  if (audioEl) {
    try {
      audioEl.load();
    } catch {
      // ignore
    }
  }

  void (async () => {
    // 1. Try local recorded/generated MP3 first (instant & 100% offline)
    if (audioUrl) {
      const playedStatic = await playAudioSource(
        audioEl,
        audioUrl,
        requestId,
        onStart,
        onEnd
      );
      if (playedStatic || requestId !== activeRequestId) return;
    }

    // 2. Try cached / dynamic Khmer TTS MP3 endpoint
    const blobUrl = await fetchCachedTtsBlobUrl(textKm);
    if (requestId !== activeRequestId) {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      return;
    }

    if (blobUrl) {
      activeObjectUrl = blobUrl;
      const playedDynamic = await playAudioSource(
        audioEl,
        blobUrl,
        requestId,
        onStart,
        () => {
          if (activeObjectUrl === blobUrl) {
            URL.revokeObjectURL(blobUrl);
            activeObjectUrl = null;
          }
          onEnd?.();
        }
      );
      if (playedDynamic || requestId !== activeRequestId) return;
    }

    // 3. Fallback to OS Khmer speechSynthesis or gentle visual indicator
    speakWithSpeechSynthesis(textKm, requestId, onStart, onEnd);
  })();
}
