"use client";

import React from "react";

interface MascotFrogProps {
  mood: "curious" | "happy" | "encouraging";
  size?: number;
  crowned?: boolean;
  bobbing?: boolean;
  chomping?: boolean;
  className?: string;
}

/**
 * Friendly Cambodian pond frog companion (*កូនកង្កែបឆ្លាត*) rendered in
 * pure Safari-safe inline SVG (zero foreignObject).
 */
export function MascotFrog({
  mood,
  size = 48,
  crowned = false,
  bobbing = true,
  chomping = false,
  className = "",
}: MascotFrogProps) {
  const animClass = chomping
    ? "animate-chomp"
    : bobbing
      ? "animate-bob"
      : "";

  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      data-testid="mascot-frog"
      data-crowned={crowned ? "true" : "false"}
      className={`shrink-0 select-none ${animClass} ${className}`}
      aria-hidden="true"
    >
      {/* Soft lotus halo */}
      <circle cx={32} cy={35} r={27} fill="#dcfce7" stroke="#86efac" strokeWidth={1.5} />
      {/* Frog eyes */}
      <circle cx={20} cy={21} r={9} fill="#22c55e" stroke="#15803d" strokeWidth={2} />
      <circle cx={44} cy={21} r={9} fill="#22c55e" stroke="#15803d" strokeWidth={2} />
      <circle cx={20} cy={21} r={5} fill="#ffffff" />
      <circle cx={44} cy={21} r={5} fill="#ffffff" />
      {mood === "happy" ? (
        <>
          <path d="M 17 21 Q 20 17 23 21" fill="none" stroke="#111827" strokeWidth={2.2} strokeLinecap="round" />
          <path d="M 41 21 Q 44 17 47 21" fill="none" stroke="#111827" strokeWidth={2.2} strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx={mood === "curious" ? 21 : 20} cy={21} r={2.5} fill="#111827" />
          <circle cx={mood === "curious" ? 45 : 44} cy={21} r={2.5} fill="#111827" />
        </>
      )}

      {/* Frog face */}
      <ellipse cx={32} cy={39} rx={22} ry={17} fill="#22c55e" stroke="#15803d" strokeWidth={2} />
      {/* Soft cream belly highlight */}
      <ellipse cx={32} cy={45} rx={13} ry={8} fill="#bbf7d0" opacity={0.65} />
      {/* Rosy cheeks */}
      <ellipse cx={17} cy={40} rx={4} ry={2.4} fill="#f9a8d4" opacity={0.9} />
      <ellipse cx={47} cy={40} rx={4} ry={2.4} fill="#f9a8d4" opacity={0.9} />

      {/* Mouth expression */}
      {mood === "happy" && (
        <path
          d="M 22 41 Q 32 51 42 41 Z"
          fill="#f472b6"
          stroke="#14532d"
          strokeWidth={2}
          strokeLinejoin="round"
        />
      )}
      {mood === "curious" && (
        <path
          d="M 24 43 Q 32 47 40 43"
          fill="none"
          stroke="#14532d"
          strokeWidth={2.2}
          strokeLinecap="round"
        />
      )}
      {mood === "encouraging" && (
        <path
          d="M 25 44 Q 32 46 39 42"
          fill="none"
          stroke="#14532d"
          strokeWidth={2.2}
          strokeLinecap="round"
        />
      )}

      {/* Optional golden crown unlocked at 3 treats */}
      {crowned && (
        <g data-testid="mascot-crown">
          <path
            d="M 21 14 L 23 5 L 28 10 L 32 3 L 36 10 L 41 5 L 43 14 Z"
            fill="#FFD23F"
            stroke="#B45309"
            strokeWidth={1.6}
            strokeLinejoin="round"
          />
          <circle cx={32} cy={10} r={1.8} fill="#D62860" />
        </g>
      )}

      {/* Sparkle star when happy */}
      {mood === "happy" && (
        <path
          d="M 55 11 L 57 15 L 61 17 L 57 19 L 55 23 L 53 19 L 49 17 L 53 15 Z"
          fill="#f59e0b"
        />
      )}
    </svg>
  );
}
