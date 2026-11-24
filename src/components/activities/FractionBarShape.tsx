"use client";

import React, { useEffect, useRef, useState } from "react";
import type { FractionBarShapeStep } from "@/lib/curriculum/schema";
import type { StepAnswer } from "@/lib/math/grader";
import {
  formatDisplayNumber,
  formatTextNumerals,
  type NumeralPreference,
} from "@/lib/khmer/numerals";

interface FractionBarShapeProps {
  step: FractionBarShapeStep;
  numeralPref: NumeralPreference;
  disabled?: boolean;
  onAnswerChange: (
    answer: Extract<StepAnswer, { type: "fraction-bar-shape" }>
  ) => void;
}

function ShapeSvgGlyph({
  shape,
  selected,
}: {
  shape: "triangle" | "square" | "rectangle" | "circle";
  selected: boolean;
}) {
  const fill = selected ? "#dbeafe" : "#fffbeb";
  const stroke = selected ? "#1d4ed8" : "#b45309";

  return (
    <svg viewBox="0 0 80 68" className="w-20 h-16" aria-hidden="true">
      {shape === "triangle" && (
        <>
          <polygon
            points="40,8 70,58 10,58"
            fill={fill}
            stroke={stroke}
            strokeWidth={3}
            strokeLinejoin="round"
          />
          <circle cx={40} cy={8} r={4} fill={stroke} />
          <circle cx={70} cy={58} r={4} fill={stroke} />
          <circle cx={10} cy={58} r={4} fill={stroke} />
        </>
      )}
      {shape === "square" && (
        <>
          <rect
            x={16}
            y={10}
            width={48}
            height={48}
            rx={3}
            fill={fill}
            stroke={stroke}
            strokeWidth={3}
          />
          <circle cx={16} cy={10} r={3.5} fill={stroke} />
          <circle cx={64} cy={10} r={3.5} fill={stroke} />
          <circle cx={16} cy={58} r={3.5} fill={stroke} />
          <circle cx={64} cy={58} r={3.5} fill={stroke} />
        </>
      )}
      {shape === "rectangle" && (
        <>
          <rect
            x={8}
            y={16}
            width={64}
            height={36}
            rx={3}
            fill={fill}
            stroke={stroke}
            strokeWidth={3}
          />
          <circle cx={8} cy={16} r={3.5} fill={stroke} />
          <circle cx={72} cy={16} r={3.5} fill={stroke} />
          <circle cx={8} cy={52} r={3.5} fill={stroke} />
          <circle cx={72} cy={52} r={3.5} fill={stroke} />
        </>
      )}
      {shape === "circle" && (
        <circle
          cx={40}
          cy={34}
          r={24}
          fill={fill}
          stroke={stroke}
          strokeWidth={3}
        />
      )}
    </svg>
  );
}

export function FractionBarShape({
  step,
  numeralPref,
  disabled = false,
  onAnswerChange,
}: FractionBarShapeProps) {
  const {
    mode,
    denominator: initialDenominator,
    initialShaded,
    allowPartitionChange,
    availableDenominators,
    showNumberLine,
    shapeOptions,
  } = step.config;

  const [denominator, setDenominator] = useState<number>(initialDenominator);
  const [shadedParts, setShadedParts] = useState<boolean[]>(() =>
    Array.from({ length: initialDenominator }, (_, i) => i < initialShaded)
  );
  const [selectedShapeId, setSelectedShapeId] = useState<string>("");

  const onAnswerChangeRef = useRef(onAnswerChange);
  useEffect(() => {
    onAnswerChangeRef.current = onAnswerChange;
  }, [onAnswerChange]);

  const shadedCount = shadedParts.filter(Boolean).length;

  useEffect(() => {
    if (mode === "shape-identify") {
      onAnswerChangeRef.current({
        type: "fraction-bar-shape",
        selectedShapeId,
      });
    } else {
      onAnswerChangeRef.current({
        type: "fraction-bar-shape",
        numerator: shadedCount,
        denominator,
      });
    }
  }, [mode, selectedShapeId, shadedCount, denominator]);

  const handlePartitionSwitch = (nextDen: number) => {
    if (disabled || nextDen === denominator) return;
    setDenominator(nextDen);
    setShadedParts(Array.from({ length: nextDen }, () => false));
  };

  const togglePart = (idx: number) => {
    if (disabled) return;
    setShadedParts((prev) => prev.map((val, i) => (i === idx ? !val : val)));
  };

  if (mode === "shape-identify") {
    return (
      <div
        className="grid grid-cols-2 gap-3 w-full"
        role="radiogroup"
        aria-label="ជ្រើសរើសរូបធរណីមាត្រ"
      >
        {(shapeOptions ?? []).map((opt) => {
          const isSelected = selectedShapeId === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              data-testid={`shape-option-${opt.id}`}
              disabled={disabled}
              onClick={() => setSelectedShapeId(opt.id)}
              className={`manipulative-target flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 p-3 transition-colors ${
                isSelected
                  ? "border-accent bg-accent-soft text-ink shadow-xs"
                  : "border-border bg-surface text-ink hover:bg-surface-subtle"
              }`}
            >
              <ShapeSvgGlyph shape={opt.shape} selected={isSelected} />
              <span className="text-sm font-bold">
                {formatTextNumerals(opt.labelKm, numeralPref)}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  // Shade-fraction mode (bar with >=56x56px clickable segments + optional synced 0-1 number line)
  const isWideDenominator = denominator >= 6;
  const barWidth = isWideDenominator ? denominator * 62 : 302;
  const svgWidth = barWidth + 8;
  const partWidth = barWidth / denominator;
  const ratio = shadedCount / denominator;
  const markerX = 24 + ratio * 262;

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {/* Live fraction readout */}
      <div
        data-testid="fraction-value-badge"
        className="rounded-full border border-border bg-surface px-4 py-1 text-sm font-semibold text-ink shadow-xs"
        aria-live="polite"
      >
        ចំណែកដែលលាបពណ៌៖{" "}
        <strong className="text-accent">
          {formatDisplayNumber(shadedCount, numeralPref)} /{" "}
          {formatDisplayNumber(denominator, numeralPref)}
        </strong>
      </div>

      {/* Partition switcher (e.g. 2 parts <-> 4 parts to discover 1/2 = 2/4) */}
      {allowPartitionChange && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {(availableDenominators ?? [2, 4]).map((den) => {
            const active = denominator === den;
            return (
              <button
                key={den}
                type="button"
                data-testid={`fraction-partition-${den}`}
                aria-pressed={active}
                disabled={disabled}
                onClick={() => handlePartitionSwitch(den)}
                className={`manipulative-target rounded-xl border-2 px-3.5 text-sm font-bold transition-colors ${
                  active
                    ? "border-accent bg-accent text-white"
                    : "border-border bg-surface text-ink hover:bg-surface-subtle"
                }`}
              >
                ចែកជា {formatDisplayNumber(den, numeralPref)} ផ្នែក
              </button>
            );
          })}
        </div>
      )}

      <p className="text-xs text-ink-muted text-center">
        ប៉ះផ្នែកនីមួយៗនៃនំ ដើម្បីលាបពណ៌ ឬលុបពណ៌
      </p>

      {/* Safari-safe inline SVG fraction bar (each part >= 56x68 CSS px without overlap) */}
      <div className="w-full max-w-[380px] overflow-x-auto flex justify-center">
        <svg
          viewBox={`0 0 ${svgWidth} 92`}
          style={
            isWideDenominator
              ? {
                  width: `${svgWidth}px`,
                  minWidth: `${svgWidth}px`,
                  height: "92px",
                }
              : undefined
          }
          className={`${
            isWideDenominator ? "block" : "w-full h-auto"
          } select-none`}
          role="group"
          aria-label="របារប្រភាគអន្តរកម្ម"
        >
          <rect
            x={4}
            y={10}
            width={barWidth}
            height={72}
            rx={14}
            fill="#ffffff"
            stroke="#78716c"
            strokeWidth={2}
          />
          {shadedParts.map((isShaded, idx) => {
            const x = 4 + idx * partWidth;
            return (
              <g
                key={`part-${idx}`}
                data-testid={`fraction-part-${idx}`}
                className="manipulative-target cursor-pointer"
                role="button"
                tabIndex={disabled ? -1 : 0}
                aria-pressed={isShaded}
                aria-label={`${formatDisplayNumber(1, numeralPref)}/${formatDisplayNumber(denominator, numeralPref)} ផ្នែកទី ${formatDisplayNumber(idx + 1, numeralPref)}`}
                onClick={() => togglePart(idx)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    togglePart(idx);
                  }
                }}
              >
                <rect
                  x={x + 2}
                  y={12}
                  width={Math.max(56, partWidth - 4)}
                  height={68}
                  rx={10}
                  fill={isShaded ? "#3b82f6" : "#fffbeb"}
                  stroke={isShaded ? "#1d4ed8" : "#d97706"}
                  strokeWidth={2}
                />
                <text
                  x={x + partWidth / 2}
                  y={52}
                  textAnchor="middle"
                  fontSize={16}
                  fontWeight={700}
                  fill={isShaded ? "#ffffff" : "#92400e"}
                >
                  {formatDisplayNumber(1, numeralPref)}/
                  {formatDisplayNumber(denominator, numeralPref)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Synced 0–1 number line */}
      {showNumberLine && (
        <div className="w-full max-w-[380px] rounded-2xl border border-border bg-canvas px-2 py-1.5">
          <svg
            viewBox="0 0 310 66"
            className="w-full h-auto select-none"
            role="img"
            aria-label={`បន្ទាត់ចំនួន ០ ដល់ ១ បង្ហាញ ${formatDisplayNumber(shadedCount, numeralPref)} លើ ${formatDisplayNumber(denominator, numeralPref)}`}
          >
            <line
              x1={24}
              y1={30}
              x2={286}
              y2={30}
              stroke="#9ca3af"
              strokeWidth={3.5}
              strokeLinecap="round"
            />
            <line
              x1={24}
              y1={30}
              x2={markerX}
              y2={30}
              stroke="#2563eb"
              strokeWidth={5}
              strokeLinecap="round"
            />
            {Array.from({ length: denominator + 1 }).map((_, i) => {
              const tx = 24 + (i / denominator) * 262;
              const isEndpoint = i === 0 || i === denominator;
              return (
                <g key={`nl-${i}`}>
                  <line
                    x1={tx}
                    y1={isEndpoint ? 20 : 23}
                    x2={tx}
                    y2={isEndpoint ? 40 : 37}
                    stroke="#374151"
                    strokeWidth={isEndpoint ? 2.5 : 1.8}
                  />
                  <text
                    x={tx}
                    y={56}
                    textAnchor="middle"
                    fontSize={12}
                    fontWeight={isEndpoint ? 700 : 600}
                    fill="#374151"
                  >
                    {i === 0
                      ? formatDisplayNumber(0, numeralPref)
                      : i === denominator
                        ? formatDisplayNumber(1, numeralPref)
                        : `${formatDisplayNumber(i, numeralPref)}/${formatDisplayNumber(denominator, numeralPref)}`}
                  </text>
                </g>
              );
            })}
            <circle
              cx={markerX}
              cy={30}
              r={8}
              fill="#2563eb"
              stroke="#ffffff"
              strokeWidth={2.5}
            />
          </svg>
        </div>
      )}
    </div>
  );
}
