"use client";

import React, { useEffect, useRef, useState } from "react";
import type { DataChartStep } from "@/lib/curriculum/schema";
import type { StepAnswer } from "@/lib/math/grader";
import {
  formatDisplayNumber,
  type NumeralPreference,
} from "@/lib/khmer/numerals";
import { playScaleNote } from "@/lib/audio/chimes";
import { useLearner } from "@/components/providers/LearnerProvider";

interface DataChartProps {
  step: DataChartStep;
  numeralPref: NumeralPreference;
  disabled?: boolean;
  onAnswerChange: (answer: Extract<StepAnswer, { type: "data-chart" }>) => void;
}

export function DataChart({
  step,
  numeralPref,
  disabled = false,
  onAnswerChange,
}: DataChartProps) {
  const { audioEnabled } = useLearner();
  const { mode, maxValue, unitLabelKm, bars } = step.config;

  const [barValues, setBarValues] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    for (const b of bars) {
      init[b.id] = b.initialValue;
    }
    return init;
  });
  const [selectedBarId, setSelectedBarId] = useState<string>("");

  const onAnswerChangeRef = useRef(onAnswerChange);
  useEffect(() => {
    onAnswerChangeRef.current = onAnswerChange;
  }, [onAnswerChange]);

  useEffect(() => {
    if (mode === "read-bar") {
      onAnswerChangeRef.current({
        type: "data-chart",
        selectedBarId,
      });
    } else {
      onAnswerChangeRef.current({
        type: "data-chart",
        barValues,
      });
    }
  }, [mode, barValues, selectedBarId]);

  const adjustBar = (id: string, delta: number) => {
    if (disabled) return;
    setBarValues((prev) => {
      const curr = prev[id] ?? 0;
      const next = Math.max(0, Math.min(maxValue, curr + delta));
      if (next !== curr) {
        playScaleNote(next % 10, audioEnabled);
      }
      return { ...prev, [id]: next };
    });
  };

  const svgW = 320;
  const svgH = 210;
  const padLeft = 36;
  const padRight = 16;
  const padTop = 22;
  const padBottom = 38;
  const plotW = svgW - padLeft - padRight;
  const plotH = svgH - padTop - padBottom;

  const yTicks = Array.from(
    { length: Math.min(5, maxValue + 1) },
    (_, i) => Math.round((i * maxValue) / Math.min(4, maxValue))
  );
  const uniqueYTicks = Array.from(new Set(yTicks));
  const colSlotW = plotW / bars.length;
  const barW = Math.min(52, colSlotW * 0.56);

  const chartSummary = bars
    .map(
      (b) =>
        `${b.labelKm} ${formatDisplayNumber(barValues[b.id] ?? 0, numeralPref)} ${unitLabelKm}`
    )
    .join(", ");

  return (
    <div className="flex flex-col items-center gap-3.5 w-full">
      {/* Safari-safe inline SVG Bar Chart (zero foreignObject) */}
      <div className="w-full max-w-[360px]">
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          className="w-full h-auto select-none rounded-2xl border-2 border-border bg-canvas shadow-xs"
          role="img"
          aria-label={`ដ្យាក្រាមសសរ៖ ${chartSummary}`}
        >
          {/* Horizontal gridlines & y-axis ticks */}
          {uniqueYTicks.map((tick) => {
            const y = padTop + plotH - (tick / maxValue) * plotH;
            return (
              <g key={tick}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={svgW - padRight}
                  y2={y}
                  stroke={tick === 0 ? "#78716c" : "#e5dfd3"}
                  strokeWidth={tick === 0 ? 2 : 1.2}
                />
                <text
                  x={padLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize={12}
                  fontWeight={700}
                  fill="#4b5563"
                >
                  {formatDisplayNumber(tick, numeralPref)}
                </text>
              </g>
            );
          })}

          {/* Y axis line */}
          <line
            x1={padLeft}
            y1={padTop}
            x2={padLeft}
            y2={padTop + plotH}
            stroke="#78716c"
            strokeWidth={2}
          />

          {/* Bars */}
          {bars.map((b, idx) => {
            const val = barValues[b.id] ?? 0;
            const h = (val / maxValue) * plotH;
            const cx = padLeft + colSlotW * idx + colSlotW / 2;
            const x = cx - barW / 2;
            const y = padTop + plotH - h;
            const isSelected = mode === "read-bar" && selectedBarId === b.id;

            return (
              <g key={b.id}>
                <rect
                  x={x}
                  y={y}
                  width={barW}
                  height={Math.max(2, h)}
                  rx={8}
                  fill={b.color}
                  stroke={isSelected ? "#111827" : "none"}
                  strokeWidth={isSelected ? 3 : 0}
                />
                {/* Bar count readout */}
                <text
                  x={cx}
                  y={Math.max(padTop - 4, y - 6)}
                  textAnchor="middle"
                  fontSize={13}
                  fontWeight={700}
                  fill="#1f2937"
                >
                  {formatDisplayNumber(val, numeralPref)}
                </text>
                {/* Category label */}
                <text
                  x={cx}
                  y={svgH - 14}
                  textAnchor="middle"
                  fontSize={12}
                  fontWeight={700}
                  fill="#1f2937"
                >
                  {b.labelKm}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Interactive Controls (>= 56x56px .manipulative-target) */}
      {mode === "build-bars" ? (
        <div className="w-full space-y-2">
          {bars.map((b) => {
            const val = barValues[b.id] ?? 0;
            return (
              <div
                key={b.id}
                className="flex items-center justify-between gap-2 rounded-2xl border border-border bg-canvas px-3 py-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    aria-hidden="true"
                    className="h-4 w-4 rounded-full shrink-0"
                    style={{ backgroundColor: b.color }}
                  />
                  <span className="text-sm font-bold text-ink truncate">
                    {b.labelKm}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    data-testid={`chart-dec-${b.id}`}
                    disabled={disabled || val <= 0}
                    onClick={() => adjustBar(b.id, -1)}
                    className="manipulative-target rounded-xl border border-border bg-surface px-3 text-base font-bold text-ink disabled:opacity-40"
                  >
                    −{formatDisplayNumber(1, numeralPref)}
                    <span className="sr-only"> {b.labelKm}</span>
                  </button>
                  <span
                    data-testid={`chart-val-${b.id}`}
                    className="min-w-[2.5rem] text-center text-base font-bold text-accent"
                  >
                    {formatDisplayNumber(val, numeralPref)}
                  </span>
                  <button
                    type="button"
                    data-testid={`chart-inc-${b.id}`}
                    disabled={disabled || val >= maxValue}
                    onClick={() => adjustBar(b.id, 1)}
                    className="manipulative-target rounded-xl bg-accent px-3 text-base font-bold text-white disabled:opacity-40"
                  >
                    +{formatDisplayNumber(1, numeralPref)}
                    <span className="sr-only"> {b.labelKm}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 w-full">
          {bars.map((b) => {
            const isSelected = selectedBarId === b.id;
            return (
              <button
                key={b.id}
                type="button"
                data-testid={`chart-select-${b.id}`}
                aria-pressed={isSelected}
                disabled={disabled}
                onClick={() => {
                  setSelectedBarId(b.id);
                  playScaleNote(5, audioEnabled);
                }}
                className={`manipulative-target flex items-center justify-center gap-2 rounded-2xl border-2 px-3 py-2 text-sm font-bold transition-colors disabled:opacity-45 ${
                  isSelected
                    ? "border-accent bg-accent text-white shadow-xs"
                    : "border-border bg-surface text-ink hover:bg-surface-subtle"
                }`}
              >
                <span
                  aria-hidden="true"
                  className="h-3.5 w-3.5 rounded-full border border-white/60 shrink-0"
                  style={{ backgroundColor: b.color }}
                />
                <span>{b.labelKm}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
