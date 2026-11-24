"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import type {
  PatternPaletteItemSchema,
  PatternSequenceStep,
} from "@/lib/curriculum/schema";
import type { StepAnswer } from "@/lib/math/grader";
import {
  formatTextNumerals,
  type NumeralPreference,
} from "@/lib/khmer/numerals";
import type { z } from "zod";

type PaletteItem = z.infer<typeof PatternPaletteItemSchema>;

interface PatternSequenceProps {
  step: PatternSequenceStep;
  numeralPref: NumeralPreference;
  disabled?: boolean;
  onAnswerChange: (
    answer: Extract<StepAnswer, { type: "pattern-sequence" }>
  ) => void;
}

function TileGraphic({
  item,
  numeralPref,
}: {
  item: PaletteItem;
  numeralPref: NumeralPreference;
}) {
  if (item.glyph === "number") {
    return (
      <span className="text-xl font-bold text-ink">
        {formatTextNumerals(item.labelKm, numeralPref)}
      </span>
    );
  }

  return (
    <svg viewBox="0 0 44 44" className="w-10 h-10" aria-hidden="true">
      {item.glyph === "stripe-red" && (
        <g>
          <rect x={2} y={2} width={40} height={40} rx={8} fill="#b91c1c" />
          <line x1={2} y1={14} x2={42} y2={14} stroke="#fef2f2" strokeWidth={3} />
          <line x1={2} y1={30} x2={42} y2={30} stroke="#fef2f2" strokeWidth={3} />
          <line x1={14} y1={2} x2={14} y2={42} stroke="#fca5a5" strokeWidth={2.5} />
          <line x1={30} y1={2} x2={30} y2={42} stroke="#fca5a5" strokeWidth={2.5} />
        </g>
      )}
      {item.glyph === "stripe-blue" && (
        <g>
          <rect x={2} y={2} width={40} height={40} rx={8} fill="#1d4ed8" />
          <line x1={2} y1={14} x2={42} y2={14} stroke="#eff6ff" strokeWidth={3} />
          <line x1={2} y1={30} x2={42} y2={30} stroke="#eff6ff" strokeWidth={3} />
          <line x1={14} y1={2} x2={14} y2={42} stroke="#93c5fd" strokeWidth={2.5} />
          <line x1={30} y1={2} x2={30} y2={42} stroke="#93c5fd" strokeWidth={2.5} />
        </g>
      )}
      {item.glyph === "stripe-gold" && (
        <g>
          <rect x={2} y={2} width={40} height={40} rx={8} fill="#d97706" />
          <line x1={2} y1={22} x2={42} y2={22} stroke="#fef3c7" strokeWidth={4} />
          <line x1={22} y1={2} x2={22} y2={42} stroke="#fef3c7" strokeWidth={4} />
        </g>
      )}
      {item.glyph === "circle" && (
        <circle
          cx={22}
          cy={22}
          r={15}
          fill={item.color ?? "#3b82f6"}
          stroke="#1e3a8a"
          strokeWidth={2}
        />
      )}
      {item.glyph === "square" && (
        <rect
          x={7}
          y={7}
          width={30}
          height={30}
          rx={4}
          fill={item.color ?? "#f59e0b"}
          stroke="#92400e"
          strokeWidth={2}
        />
      )}
      {item.glyph === "triangle" && (
        <polygon
          points="22,6 38,36 6,36"
          fill={item.color ?? "#16a34a"}
          stroke="#14532d"
          strokeWidth={2}
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

export function PatternSequence({
  step,
  numeralPref,
  disabled = false,
  onAnswerChange,
}: PatternSequenceProps) {
  const { sequence, palette } = step.config;

  const missingIndices = useMemo(() => {
    const indices: number[] = [];
    sequence.forEach((val, idx) => {
      if (val === null) indices.push(idx);
    });
    return indices;
  }, [sequence]);

  const paletteMap = useMemo(() => {
    const map = new Map<string, PaletteItem>();
    for (const item of palette) {
      map.set(item.id, item);
    }
    return map;
  }, [palette]);

  const [slotValues, setSlotValues] = useState<Array<string | null>>(() =>
    missingIndices.map(() => null)
  );
  const [selectedPaletteId, setSelectedPaletteId] = useState<string | null>(
    null
  );

  const onAnswerChangeRef = useRef(onAnswerChange);
  useEffect(() => {
    onAnswerChangeRef.current = onAnswerChange;
  }, [onAnswerChange]);

  useEffect(() => {
    onAnswerChangeRef.current({
      type: "pattern-sequence",
      slotValues,
    });
  }, [slotValues]);

  const placeInSlot = (missingPos: number, tileId: string) => {
    if (disabled) return;
    setSlotValues((prev) =>
      prev.map((val, i) => (i === missingPos ? tileId : val))
    );
    setSelectedPaletteId(null);
  };

  const handleSlotTap = (missingPos: number) => {
    if (disabled) return;
    if (selectedPaletteId) {
      placeInSlot(missingPos, selectedPaletteId);
    } else if (slotValues[missingPos] !== null) {
      // Clear filled slot on tap when nothing is selected
      setSlotValues((prev) =>
        prev.map((val, i) => (i === missingPos ? null : val))
      );
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <p className="text-xs text-ink-muted text-center">
        {selectedPaletteId
          ? "ឥឡូវប៉ះប្រឡោះ «?» ដើម្បីដាក់លំនាំចូល!"
          : "ប៉ះរូបខាងក្រោម រួចប៉ះប្រឡោះ «?» ដើម្បីបំពេញលំនាំ"}
      </p>

      {/* Sequence track (every missing slot is >= 64x64px) */}
      <div className="w-full rounded-2xl border border-border bg-canvas p-3 flex flex-wrap items-center justify-center gap-2">
        {sequence.map((fixedId, seqIdx) => {
          const missingPos = missingIndices.indexOf(seqIdx);

          if (missingPos === -1 && fixedId !== null) {
            const fixedItem = paletteMap.get(fixedId);
            return (
              <div
                key={`seq-${seqIdx}`}
                role="img"
                className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-surface shadow-xs"
                aria-label={
                  fixedItem
                    ? formatTextNumerals(fixedItem.labelKm, numeralPref)
                    : fixedId
                }
              >
                {fixedItem ? (
                  <TileGraphic item={fixedItem} numeralPref={numeralPref} />
                ) : (
                  <span className="text-lg font-bold text-ink">
                    {formatTextNumerals(fixedId, numeralPref)}
                  </span>
                )}
              </div>
            );
          }

          const placedId = slotValues[missingPos];
          const placedItem = placedId ? paletteMap.get(placedId) : undefined;

          return (
            <button
              key={`slot-${missingPos}`}
              type="button"
              data-testid={`pattern-slot-${missingPos}`}
              data-missing-pos={missingPos}
              disabled={disabled}
              onClick={() => handleSlotTap(missingPos)}
              className={`manipulative-target flex h-16 w-16 items-center justify-center rounded-2xl border-2 transition-colors ${
                placedItem
                  ? "border-accent bg-accent-soft shadow-xs"
                  : selectedPaletteId
                    ? "border-hint bg-hint-soft border-dashed ring-2 ring-hint/40"
                    : "border-hint bg-surface border-dashed"
              }`}
            >
              <span className="sr-only">
                {placedItem
                  ? `ប្រឡោះទី ${missingPos + 1} មាន ${formatTextNumerals(placedItem.labelKm, numeralPref)}`
                  : `ប្រឡោះទំនេរទី ${missingPos + 1}`}
              </span>
              {placedItem ? (
                <TileGraphic item={placedItem} numeralPref={numeralPref} />
              ) : (
                <span className="text-xl font-bold text-hint-ink" aria-hidden="true">
                  ?
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Palette tiles (>= 64x64px each) */}
      <div className="w-full space-y-1.5">
        <p className="text-xs font-bold text-ink-muted text-center">
          ជ្រើសរើសផ្ទាំងលំនាំ៖
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {palette.map((item) => {
            const isSelected = selectedPaletteId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                data-testid={`pattern-tile-${item.id}`}
                aria-pressed={isSelected}
                disabled={disabled}
                onClick={() =>
                  setSelectedPaletteId((prev) =>
                    prev === item.id ? null : item.id
                  )
                }
                className={`manipulative-target flex min-h-[64px] min-w-[64px] flex-col items-center justify-center gap-1 rounded-2xl border-2 px-3 py-2 transition-colors ${
                  isSelected
                    ? "border-accent bg-accent-soft ring-2 ring-accent/40 shadow-xs"
                    : "border-border bg-surface hover:bg-surface-subtle"
                }`}
              >
                <TileGraphic item={item} numeralPref={numeralPref} />
                {item.glyph !== "number" && (
                  <span className="text-xs font-semibold text-ink">
                    {formatTextNumerals(item.labelKm, numeralPref)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
