"use client";

import React from "react";
import { useLearner } from "@/components/providers/LearnerProvider";

interface NumeralToggleProps {
  className?: string;
}

export function NumeralToggle({ className = "" }: NumeralToggleProps) {
  const { numeralPref, toggleNumeralPref } = useLearner();
  const isKhmer = numeralPref === "km";

  return (
    <button
      type="button"
      data-testid="numeral-toggle"
      onClick={() => void toggleNumeralPref()}
      aria-pressed={!isKhmer}
      className={`khmer-chip pill-3d [--pill-edge:#c9c2b2] shrink-0 whitespace-nowrap inline-flex items-center gap-1 sm:gap-1.5 rounded-full border-2 border-[#c9c2b2] bg-surface px-2 sm:px-3 text-xs sm:text-sm font-bold text-ink transition-colors hover:bg-surface-subtle ${className}`}
    >
      <span className="sr-only">
        {isKhmer ? "ប្ដូរទៅលេខអារ៉ាប់ " : "ប្ដូរទៅលេខខ្មែរ "}
      </span>
      <span
        className={`rounded-full px-1.5 sm:px-2.5 py-0.5 transition-all ${
          isKhmer
            ? "bg-[#FFD23F] text-[#1E2A4A] shadow-[0_2px_0_#C89600] font-extrabold"
            : "text-ink-muted"
        }`}
      >
        ១២៣
      </span>
      {" "}
      <span
        className={`rounded-full px-1.5 sm:px-2.5 py-0.5 transition-all ${
          !isKhmer
            ? "bg-[#FFD23F] text-[#1E2A4A] shadow-[0_2px_0_#C89600] font-extrabold"
            : "text-ink-muted"
        }`}
      >
        123
      </span>
    </button>
  );
}
