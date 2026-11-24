"use client";

import React, { useEffect, useRef, useState } from "react";
import type { ScenarioChoiceStep } from "@/lib/curriculum/schema";
import type { StepAnswer } from "@/lib/math/grader";
import {
  formatDisplayNumber,
  formatTextNumerals,
  type NumeralPreference,
} from "@/lib/khmer/numerals";

interface ScenarioChoiceProps {
  step: ScenarioChoiceStep;
  numeralPref: NumeralPreference;
  highlightTargetId?: string;
  disabled?: boolean;
  onAnswerChange: (
    answer: Extract<StepAnswer, { type: "scenario-choice" }>
  ) => void;
}

function VisualCueCard({
  visualCue,
  numeralPref,
  highlighted,
}: {
  visualCue: string;
  numeralPref: NumeralPreference;
  highlighted: boolean;
}) {
  if (visualCue === "ten-frame-mini-7-plus-5") {
    return (
      <div
        className={`w-full max-w-[340px] rounded-2xl border p-3 bg-surface ${
          highlighted ? "border-hint ring-2 ring-hint/40" : "border-border"
        }`}
      >
        <svg
          viewBox="0 0 300 96"
          className="w-full h-auto"
          role="img"
          aria-label="ប្រអប់ ១០ មាន ៧ គ្រាប់ និងខាងក្រៅ ៥ គ្រាប់"
        >
          <text x={8} y={16} fontSize={12} fontWeight={600} fill="#4b5563">
            {formatTextNumerals("៧ ក្នុងប្រអប់ + ៥ ខាងក្រៅ", numeralPref)}
          </text>
          {Array.from({ length: 10 }).map((_, idx) => {
            const col = idx % 5;
            const row = Math.floor(idx / 5);
            const x = 8 + col * 32;
            const y = 24 + row * 32;
            const filled = idx < 7;
            return (
              <g key={idx}>
                <rect
                  x={x}
                  y={y}
                  width={28}
                  height={28}
                  rx={6}
                  fill={filled ? "#eff6ff" : "#fef3c7"}
                  stroke={filled ? "#93c5fd" : "#f59e0b"}
                  strokeWidth={1.5}
                  strokeDasharray={filled ? undefined : "4 2"}
                />
                {filled && (
                  <circle cx={x + 14} cy={y + 14} r={9} fill="#2563eb" />
                )}
              </g>
            );
          })}
          {/* Plus 5 dots on right */}
          <text x={178} y={58} fontSize={18} fontWeight={700} fill="#4b5563">
            +
          </text>
          {Array.from({ length: 5 }).map((_, idx) => {
            const col = idx % 3;
            const row = Math.floor(idx / 3);
            const cx = 212 + col * 28;
            const cy = 40 + row * 28;
            return (
              <circle
                key={`out-${idx}`}
                cx={cx}
                cy={cy}
                r={9}
                fill="#f59e0b"
                stroke="#b45309"
                strokeWidth={1.5}
              />
            );
          })}
        </svg>
      </div>
    );
  }

  if (visualCue === "empty-bowl-zero") {
    return (
      <div
        className={`w-full max-w-[300px] rounded-2xl border p-3 bg-surface ${
          highlighted ? "border-hint ring-2 ring-hint/40" : "border-border"
        }`}
      >
        <svg
          viewBox="0 0 260 96"
          className="w-full h-auto"
          role="img"
          aria-label="ចានទទេគ្មានផ្លែឈើ"
        >
          <path
            d="M 55 44 Q 130 88 205 44 L 195 36 L 65 36 Z"
            fill="#fde68a"
            stroke="#b45309"
            strokeWidth={2}
          />
          <ellipse
            cx={130}
            cy={38}
            rx={68}
            ry={12}
            fill="#fffbeb"
            stroke="#b45309"
            strokeWidth={2}
          />
          <text
            x={130}
            y={86}
            textAnchor="middle"
            fontSize={13}
            fontWeight={600}
            fill="#4b5563"
          >
            ចានទទេ (គ្មានផ្លែស្វាយ)
          </text>
        </svg>
      </div>
    );
  }

  if (visualCue === "cakes-3-plus-4") {
    return (
      <div
        className={`w-full max-w-[320px] rounded-2xl border p-3 bg-surface ${
          highlighted ? "border-hint ring-2 ring-hint/40" : "border-border"
        }`}
      >
        <svg
          viewBox="0 0 300 90"
          className="w-full h-auto"
          role="img"
          aria-label="នំ ៣ ដុំ និង នំ ៤ ដុំ"
        >
          <rect x={8} y={14} width={118} height={62} rx={12} fill="#eff6ff" stroke="#93c5fd" strokeWidth={1.5} />
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={32 + i * 34} cy={45} r={11} fill="#3b82f6" />
          ))}
          <text x={150} y={52} textAnchor="middle" fontSize={20} fontWeight={700} fill="#374151">
            +
          </text>
          <rect x={174} y={14} width={118} height={62} rx={12} fill="#fef3c7" stroke="#fcd34d" strokeWidth={1.5} />
          {[0, 1, 2, 3].map((i) => (
            <circle key={i} cx={193 + i * 26} cy={45} r={10} fill="#f59e0b" />
          ))}
        </svg>
      </div>
    );
  }

  return null;
}

export function ScenarioChoice({
  step,
  numeralPref,
  highlightTargetId,
  disabled = false,
  onAnswerChange,
}: ScenarioChoiceProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string>("");
  const [trayNotes, setTrayNotes] = useState<number[]>([]);

  const onAnswerChangeRef = useRef(onAnswerChange);
  useEffect(() => {
    onAnswerChangeRef.current = onAnswerChange;
  }, [onAnswerChange]);

  useEffect(() => {
    if (step.config.variant === "banknote-builder") {
      const sum = trayNotes.reduce((acc, n) => acc + n, 0);
      onAnswerChangeRef.current({
        type: "scenario-choice",
        selectedNotesKhr: trayNotes,
        sumKhr: sum,
      });
    } else {
      onAnswerChangeRef.current({
        type: "scenario-choice",
        selectedOptionId,
      });
    }
  }, [step.config.variant, selectedOptionId, trayNotes]);

  const highlightCue = highlightTargetId === "visual-cue";

  if (step.config.variant === "banknote-builder") {
    const notes = step.config.availableNotesKhr ?? [100, 500, 1000, 2000];
    const currentSum = trayNotes.reduce((acc, n) => acc + n, 0);

    return (
      <div className="flex flex-col items-center gap-3 w-full">
        <div
          className="rounded-full border border-border bg-surface px-4 py-1 text-sm font-semibold text-ink shadow-xs"
          aria-live="polite"
        >
          ប្រាក់លើថាស៖{" "}
          <strong className="text-accent">
            {formatDisplayNumber(currentSum.toLocaleString("en-US"), numeralPref)}៛
          </strong>
        </div>

        {/* Tray of chosen notes */}
        <div className="w-full min-h-[76px] rounded-2xl border-2 border-dashed border-border bg-surface-subtle p-2.5 flex flex-wrap items-center justify-center gap-2">
          {trayNotes.length === 0 ? (
            <span className="text-xs text-ink-muted">
              ប៉ះក្រដាសប្រាក់ខាងក្រោមដើម្បីដាក់លើថាស
            </span>
          ) : (
            trayNotes.map((note, idx) => (
              <button
                key={`${note}-${idx}`}
                type="button"
                disabled={disabled}
                onClick={() =>
                  setTrayNotes((prev) => prev.filter((_, i) => i !== idx))
                }
                aria-label={`ដកក្រដាសប្រាក់ ${formatDisplayNumber(note, numeralPref)} រៀលចេញ`}
                className="manipulative-target rounded-xl border border-emerald-700 bg-emerald-50 px-3 text-sm font-bold text-emerald-900 shadow-xs"
              >
                {formatDisplayNumber(note.toLocaleString("en-US"), numeralPref)}៛ ✕
              </button>
            ))
          )}
        </div>

        {/* Available banknote buttons */}
        <div className="grid grid-cols-2 gap-2.5 w-full">
          {notes.map((note) => (
            <button
              key={note}
              type="button"
              data-testid={`banknote-${note}`}
              disabled={disabled}
              onClick={() => setTrayNotes((prev) => [...prev, note])}
              className="manipulative-target btn-3d [--btn-edge:#c9c2b2] flex items-center justify-center rounded-2xl border-2 border-[#c9c2b2] bg-surface px-4 text-base font-extrabold text-ink hover:border-[#13429E] hover:bg-[#E5F0FF]"
            >
              +{formatDisplayNumber(note.toLocaleString("en-US"), numeralPref)}៛
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {step.config.visualCue && (
        <VisualCueCard
          visualCue={step.config.visualCue}
          numeralPref={numeralPref}
          highlighted={highlightCue}
        />
      )}

      {step.config.variant === "worked-error-check" &&
        step.config.workedExampleKm && (
          <div className="w-full rounded-2xl border border-hint bg-hint-soft p-3.5 text-sm text-ink">
            <p className="text-xs font-bold text-hint-ink mb-1">
              ដំណោះស្រាយគំរូសម្រាប់ពិនិត្យ៖
            </p>
            <p className="font-semibold">
              {formatTextNumerals(step.config.workedExampleKm, numeralPref)}
            </p>
          </div>
        )}

      <div
        className="flex flex-col gap-2.5 w-full"
        role="radiogroup"
        aria-label="ជម្រើសចម្លើយ"
      >
        {(step.config.options ?? []).map((opt) => {
          const isSelected = selectedOptionId === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              data-testid={`choice-option-${opt.id}`}
              disabled={disabled}
              onClick={() => setSelectedOptionId(opt.id)}
              className={`manipulative-target btn-3d w-full rounded-2xl border-2 px-4 py-3 text-left text-base font-bold transition-colors flex items-center gap-3 ${
                isSelected
                  ? "border-[#13429E] [--btn-edge:#13429E] bg-[#E5F0FF] text-ink"
                  : "border-[#c9c2b2] [--btn-edge:#c9c2b2] bg-surface text-ink hover:bg-surface-subtle"
              }`}
            >
              <span
                aria-hidden="true"
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                  isSelected
                    ? "border-accent bg-accent"
                    : "border-border bg-surface"
                }`}
              >
                {isSelected && (
                  <span className="h-2.5 w-2.5 rounded-full bg-white" />
                )}
              </span>
              <span className="flex-1">
                {formatTextNumerals(opt.labelKm, numeralPref)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
