"use client";

import React, { useEffect, useRef, useState } from "react";
import type { ComparisonBalanceStep } from "@/lib/curriculum/schema";
import type { StepAnswer } from "@/lib/math/grader";
import {
  formatDisplayNumber,
  formatTextNumerals,
  type NumeralPreference,
} from "@/lib/khmer/numerals";

interface ComparisonBalanceProps {
  step: ComparisonBalanceStep;
  numeralPref: NumeralPreference;
  highlightTargetId?: string;
  disabled?: boolean;
  onAnswerChange: (
    answer: Extract<StepAnswer, { type: "comparison-balance" }>
  ) => void;
}

const OPERATORS: Array<{ op: "<" | "=" | ">"; labelKm: string }> = [
  { op: "<", labelKm: "តូចជាង" },
  { op: "=", labelKm: "ស្មើ" },
  { op: ">", labelKm: "ធំជាង" },
];

export function ComparisonBalance({
  step,
  numeralPref,
  highlightTargetId,
  disabled = false,
  onAnswerChange,
}: ComparisonBalanceProps) {
  const { mode, visualStyle, leftValue, rightValue, availableTiles } =
    step.config;

  const [selectedOp, setSelectedOp] = useState<string>("");
  const [addedWeights, setAddedWeights] = useState<number[]>([]);

  const effectiveRight =
    mode === "balance-equation"
      ? rightValue + addedWeights.reduce((acc, w) => acc + w, 0)
      : rightValue;

  const onAnswerChangeRef = useRef(onAnswerChange);
  useEffect(() => {
    onAnswerChangeRef.current = onAnswerChange;
  }, [onAnswerChange]);

  useEffect(() => {
    if (mode === "compare-operator") {
      onAnswerChangeRef.current({
        type: "comparison-balance",
        operator: selectedOp,
      });
    } else {
      onAnswerChangeRef.current({
        type: "comparison-balance",
        rightTotal: effectiveRight,
      });
    }
  }, [mode, selectedOp, effectiveRight]);

  const diff = leftValue - effectiveRight;
  const tiltDeg = diff === 0 ? 0 : diff > 0 ? -7 : 7;
  const maxBar = Math.max(leftValue, effectiveRight, 1);

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Safari-safe inline SVG visual (zero foreignObject) */}
      <div className="w-full max-w-[380px] rounded-2xl border border-border bg-canvas p-3">
        {visualStyle === "bars" ? (
          <svg
            viewBox="0 0 320 132"
            className="w-full h-auto select-none"
            role="img"
            aria-label={`ប្រៀបធៀបរបារ ${formatDisplayNumber(leftValue, numeralPref)} និង ${formatDisplayNumber(effectiveRight, numeralPref)}`}
          >
            {/* Left bar */}
            <text x={8} y={24} fontSize={13} fontWeight={700} fill="#1f2937">
              {formatTextNumerals(
                step.config.leftLabelKm ?? `ខាងឆ្វេង៖ ${leftValue}`,
                numeralPref
              )}
            </text>
            <rect
              x={8}
              y={32}
              width={Math.max(24, (leftValue / maxBar) * 260)}
              height={28}
              rx={8}
              fill="#3b82f6"
              stroke="#1d4ed8"
              strokeWidth={1.5}
            />
            <text
              x={Math.max(36, (leftValue / maxBar) * 260) + 14}
              y={51}
              fontSize={15}
              fontWeight={700}
              fill="#1d4ed8"
            >
              {formatDisplayNumber(leftValue, numeralPref)}
            </text>

            {/* Right bar */}
            <text x={8} y={84} fontSize={13} fontWeight={700} fill="#1f2937">
              {formatTextNumerals(
                step.config.rightLabelKm ?? `ខាងស្ដាំ៖ ${effectiveRight}`,
                numeralPref
              )}
            </text>
            <rect
              x={8}
              y={92}
              width={Math.max(24, (effectiveRight / maxBar) * 260)}
              height={28}
              rx={8}
              fill="#f59e0b"
              stroke="#b45309"
              strokeWidth={1.5}
            />
            <text
              x={Math.max(36, (effectiveRight / maxBar) * 260) + 14}
              y={111}
              fontSize={15}
              fontWeight={700}
              fill="#92400e"
            >
              {formatDisplayNumber(effectiveRight, numeralPref)}
            </text>
          </svg>
        ) : visualStyle === "symbolic" ? (
          <svg
            viewBox="0 0 320 112"
            className="w-full h-auto select-none"
            role="img"
            aria-label={`ប្រៀបធៀបលេខ ${formatDisplayNumber(leftValue, numeralPref)} និង ${formatDisplayNumber(effectiveRight, numeralPref)}`}
          >
            <rect
              x={14}
              y={16}
              width={106}
              height={80}
              rx={16}
              fill="#eff6ff"
              stroke="#93c5fd"
              strokeWidth={2}
            />
            <text
              x={67}
              y={66}
              textAnchor="middle"
              fontSize={32}
              fontWeight={700}
              fill="#1d4ed8"
            >
              {formatDisplayNumber(leftValue, numeralPref)}
            </text>

            <rect
              x={134}
              y={30}
              width={52}
              height={52}
              rx={14}
              fill={selectedOp ? "#dcfce7" : "#fef3c7"}
              stroke={selectedOp ? "#15803d" : "#d97706"}
              strokeWidth={2}
            />
            <text
              x={160}
              y={65}
              textAnchor="middle"
              fontSize={26}
              fontWeight={700}
              fill="#1f2937"
            >
              {selectedOp || "?"}
            </text>

            <rect
              x={200}
              y={16}
              width={106}
              height={80}
              rx={16}
              fill="#fffbeb"
              stroke="#fcd34d"
              strokeWidth={2}
            />
            <text
              x={253}
              y={66}
              textAnchor="middle"
              fontSize={32}
              fontWeight={700}
              fill="#92400e"
            >
              {formatDisplayNumber(effectiveRight, numeralPref)}
            </text>
          </svg>
        ) : (
          /* Two-pan fruit balance scale */
          <svg
            viewBox="0 0 320 176"
            className="w-full h-auto select-none"
            role="img"
            aria-label={`ជញ្ជីង៖ ខាងឆ្វេង ${formatDisplayNumber(leftValue, numeralPref)} និងខាងស្ដាំ ${formatDisplayNumber(effectiveRight, numeralPref)}`}
          >
            {/* Fulcrum base */}
            <polygon
              points="160,92 134,158 186,158"
              fill="#d6cfc2"
              stroke="#78716c"
              strokeWidth={2}
            />
            <rect x={110} y={156} width={100} height={12} rx={6} fill="#78716c" />

            {/* Tilting beam */}
            <g transform={`rotate(${tiltDeg} 160 94)`}>
              <line
                x1={46}
                y1={94}
                x2={274}
                y2={94}
                stroke={diff === 0 ? "#15803d" : "#374151"}
                strokeWidth={6}
                strokeLinecap="round"
              />

              {/* Left basket */}
              <rect
                x={20}
                y={40}
                width={94}
                height={52}
                rx={12}
                fill="#fffbeb"
                stroke="#d97706"
                strokeWidth={2}
              />
              {Array.from({ length: Math.min(leftValue, 10) }).map((_, i) => {
                const col = i % 5;
                const row = Math.floor(i / 5);
                return (
                  <circle
                    key={`l-${i}`}
                    cx={33 + col * 17}
                    cy={56 + row * 19}
                    r={6.5}
                    fill="#fb923c"
                    stroke="#c2410c"
                    strokeWidth={1.2}
                  />
                );
              })}

              {/* Right basket */}
              <rect
                x={206}
                y={40}
                width={94}
                height={52}
                rx={12}
                fill="#eff6ff"
                stroke="#2563eb"
                strokeWidth={2}
              />
              {Array.from({ length: Math.min(effectiveRight, 10) }).map(
                (_, i) => {
                  const col = i % 5;
                  const row = Math.floor(i / 5);
                  return (
                    <circle
                      key={`r-${i}`}
                      cx={219 + col * 17}
                      cy={56 + row * 19}
                      r={6.5}
                      fill="#fb923c"
                      stroke="#c2410c"
                      strokeWidth={1.2}
                    />
                  );
                }
              )}
            </g>

            {/* Count badges */}
            <rect x={40} y={4} width={54} height={26} rx={13} fill="#fef3c7" stroke="#d97706" strokeWidth={1.5} />
            <text x={67} y={22} textAnchor="middle" fontSize={14} fontWeight={700} fill="#92400e">
              {formatDisplayNumber(leftValue, numeralPref)}
            </text>

            <rect x={226} y={4} width={54} height={26} rx={13} fill="#dbeafe" stroke="#2563eb" strokeWidth={1.5} />
            <text x={253} y={22} textAnchor="middle" fontSize={14} fontWeight={700} fill="#1d4ed8">
              {formatDisplayNumber(effectiveRight, numeralPref)}
            </text>

            <circle cx={160} cy={94} r={7} fill="#ffffff" stroke="#374151" strokeWidth={2.5} />
          </svg>
        )}
      </div>

      {/* Controls */}
      {mode === "compare-operator" ? (
        <div
          className="grid grid-cols-3 gap-2.5 w-full max-w-[360px]"
          role="radiogroup"
          aria-label="ជ្រើសរើសសញ្ញាប្រៀបធៀប"
        >
          {OPERATORS.map(({ op, labelKm }) => {
            const isSelected = selectedOp === op;
            const isHighlighted = highlightTargetId === `op-${op}`;
            return (
              <button
                key={op}
                type="button"
                role="radio"
                aria-checked={isSelected}
                data-testid={`compare-op-${op === "<" ? "lt" : op === ">" ? "gt" : "eq"}`}
                disabled={disabled}
                onClick={() => setSelectedOp(op)}
                className={`manipulative-target flex flex-col items-center justify-center rounded-2xl border-2 px-3 py-2.5 transition-colors ${
                  isSelected
                    ? "border-accent bg-accent text-white shadow-xs"
                    : isHighlighted
                      ? "border-hint bg-hint-soft text-ink ring-2 ring-hint/40"
                      : "border-border bg-surface text-ink hover:bg-surface-subtle"
                }`}
              >
                <span className="text-2xl font-bold leading-none">{op}</span>
                <span className="mt-1 text-xs font-semibold">{labelKm}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 w-full max-w-[360px]">
          <p className="text-sm font-semibold text-ink" aria-live="polite">
            ខាងឆ្វេង៖{" "}
            <strong className="text-accent">
              {formatDisplayNumber(leftValue, numeralPref)}
            </strong>{" "}
            • ខាងស្ដាំ៖{" "}
            <strong
              data-testid="balance-right-total"
              className={diff === 0 ? "text-success" : "text-ink"}
            >
              {formatDisplayNumber(effectiveRight, numeralPref)}
            </strong>
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {(availableTiles ?? [1, 2, 3]).map((tile) => (
              <button
                key={tile}
                type="button"
                data-testid={`balance-add-${tile}`}
                disabled={disabled}
                onClick={() => setAddedWeights((prev) => [...prev, tile])}
                className="manipulative-target rounded-2xl border-2 border-accent bg-accent-soft px-4 text-base font-bold text-accent hover:bg-accent hover:text-white disabled:opacity-45"
              >
                +{formatDisplayNumber(tile, numeralPref)}
              </button>
            ))}

            <button
              type="button"
              data-testid="balance-reset"
              disabled={disabled || addedWeights.length === 0}
              onClick={() => setAddedWeights([])}
              className="manipulative-target rounded-2xl border border-border bg-surface px-4 text-sm font-semibold text-ink-muted hover:text-ink disabled:opacity-40"
            >
              ដកវិញ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
