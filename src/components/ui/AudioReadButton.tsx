"use client";

import React, { useEffect, useState } from "react";
import { speakKhmerPrompt, stopKhmerSpeech } from "@/lib/audio/khmerSpeech";
import { useLearner } from "@/components/providers/LearnerProvider";

interface AudioReadButtonProps {
  textKm: string;
  audioUrl?: string;
  labelKm?: string;
  testId?: string;
  className?: string;
}

export function AudioReadButton({
  textKm,
  audioUrl,
  labelKm = "ស្តាប់សំណួរ",
  testId = "audio-read-btn",
  className = "",
}: AudioReadButtonProps) {
  const { audioEnabled } = useLearner();
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  useEffect(() => {
    return () => {
      stopKhmerSpeech();
    };
  }, [textKm]);

  const handleClick = () => {
    if (isSpeaking) {
      stopKhmerSpeech();
      setIsSpeaking(false);
      return;
    }

    speakKhmerPrompt({
      textKm,
      audioUrl,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
    });
  };

  return (
    <button
      type="button"
      data-testid={testId}
      aria-pressed={isSpeaking}
      disabled={!audioEnabled}
      onClick={handleClick}
      className={`khmer-chip pill-3d shrink-0 whitespace-nowrap inline-flex items-center gap-1.5 rounded-full border-2 px-3 sm:px-3.5 text-xs font-extrabold transition-colors disabled:opacity-45 ${
        isSpeaking
          ? "candy-berry border-[#9E1943] bg-[#D62860] text-white"
          : "candy-ocean border-[#13429E] bg-[#1D5FD6] text-white hover:bg-[#1751BA]"
      } ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      </svg>
      <span>{isSpeaking ? "កំពុងអាន..." : labelKm}</span>
    </button>
  );
}

export function AudioToggle({ className = "" }: { className?: string }) {
  const { audioEnabled, toggleAudioEnabled } = useLearner();

  const handleToggle = () => {
    if (audioEnabled) {
      stopKhmerSpeech();
    }
    void toggleAudioEnabled();
  };

  return (
    <button
      type="button"
      data-testid="audio-toggle"
      aria-pressed={audioEnabled}
      onClick={handleToggle}
      className={`khmer-chip pill-3d shrink-0 whitespace-nowrap inline-flex items-center gap-1 sm:gap-1.5 rounded-full border-2 px-2 sm:px-3 text-xs font-bold transition-colors ${
        audioEnabled
          ? "border-[#c9c2b2] [--pill-edge:#c9c2b2] bg-surface text-ink hover:bg-surface-subtle"
          : "border-[#c9c2b2] [--pill-edge:#c9c2b2] bg-surface-subtle text-ink-muted"
      } ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        {audioEnabled ? (
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        ) : (
          <line x1="23" y1="9" x2="17" y2="15" />
        )}
      </svg>
      <span>{audioEnabled ? "សំឡេង" : "បិទសំឡេង"}</span>
    </button>
  );
}
