"use client";

import React, { useEffect, useRef, useState } from "react";
import type { ArrayGroupsStep } from "@/lib/curriculum/schema";
import type { StepAnswer } from "@/lib/math/grader";
import {
  formatDisplayNumber,
  type NumeralPreference,
} from "@/lib/khmer/numerals";

interface ArrayGroupsProps {
  step: ArrayGroupsStep;
  numeralPref: NumeralPreference;
  disabled?: boolean;
  onAnswerChange: (answer: Extract<StepAnswer, { type: "array-groups" }>) => void;
}

export function ArrayGroups({
  step,
  numeralPref,
  disabled = false,
  onAnswerChange,
}: ArrayGroupsProps) {
  const { mode, itemTheme, maxRows, maxCols, initialRows, initialCols, showProduct } =
    step.config;

  const [rows, setRows] = useState<number>(initialRows);
  const [cols, setCols] = useState<number>(initialCols);

  const onAnswerChangeRef = useRef(onAnswerChange);
  useEffect(() => {
    onAnswerChangeRef.current = onAnswerChange;
  }, [onAnswerChange]);

  useEffect(() => {
    onAnswerChangeRef.current({
      type: "array-groups",
      rows,
      cols,
    });
  }, [rows, cols]);

  const total = rows * cols;
  const svgW = 320;
  const rowH = Math.min(44, Math.floor(172 / Math.max(rows, 1)));
  const svgH = Math.max(120, rows * rowH + 24);

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {showProduct && (
        <div
          data-testid="array-product-badge"
          className="rounded-full border border-border bg-surface px-4 py-1 text-sm font-semibold text-ink shadow-xs"
          aria-live="polite"
        >
          {formatDisplayNumber(rows, numeralPref)} ជួរ ×{" "}
          {formatDisplayNumber(cols, numeralPref)} ={" "}
          <strong className="text-accent">
            {formatDisplayNumber(total, numeralPref)}
          </strong>
        </div>
      )}

      {/* Safari-safe inline SVG equal groups / grid (zero foreignObject) */}
      <div className="w-full max-w-[380px] rounded-2xl border border-border bg-canvas p-3">
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          className="w-full h-auto select-none"
          role="img"
          aria-label={`${formatDisplayNumber(rows, numeralPref)} ជួរ គុណ ${formatDisplayNumber(cols, numeralPref)} ស្មើ ${formatDisplayNumber(total, numeralPref)}`}
        >
          {Array.from({ length: rows }).map((_, r) => {
            const y = 12 + r * rowH;
            const cellW = Math.min(44, Math.floor((svgW - 36) / Math.max(cols, 1)));
            const startX = (svgW - cols * cellW) / 2;

            return (
              <g key={`row-${r}`}>
                {mode === "equal-groups" && (
                  <rect
                    x={startX - 8}
                    y={y + 2}
                    width={cols * cellW + 16}
                    height={rowH - 6}
                    rx={12}
                    fill="#ffffff"
                    stroke="#d6cfc2"
                    strokeWidth={1.5}
                  />
                )}
                {Array.from({ length: cols }).map((__, c) => {
                  const cx = startX + c * cellW + cellW / 2;
                  const cy = y + rowH / 2 - 1;
                  const rad = Math.min(13, rowH * 0.34, cellW * 0.34);

                  if (itemTheme === "tile") {
                    return (
                      <rect
                        key={`cell-${r}-${c}`}
                        x={cx - rad}
                        y={cy - rad}
                        width={rad * 2}
                        height={rad * 2}
                        rx={5}
                        fill="#3b82f6"
                        stroke="#1d4ed8"
                        strokeWidth={1.5}
                      />
                    );
                  }

                  const fill =
                    itemTheme === "mango"
                      ? "#f59e0b"
                      : itemTheme === "orange"
                        ? "#fb923c"
                        : "#2563eb";
                  const stroke =
                    itemTheme === "mango"
                      ? "#b45309"
                      : itemTheme === "orange"
                        ? "#c2410c"
                        : "#1e40af";

                  return (
                    <circle
                      key={`cell-${r}-${c}`}
                      cx={cx}
                      cy={cy}
                      r={rad}
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={1.5}
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Stepper controls (>= 56x56 px, responsive so narrow phones never overflow) */}
      <div className="grid grid-cols-1 min-[390px]:grid-cols-2 gap-2.5 w-full max-w-[380px]">
        <div className="rounded-2xl border border-border bg-surface p-2.5 flex flex-col items-center gap-2">
          <span className="text-xs font-bold text-ink-muted">
            ចំនួនជួរ ({formatDisplayNumber(rows, numeralPref)})
          </span>
          <div className="flex items-center justify-center gap-2 w-full">
            <button
              type="button"
              data-testid="array-rows-dec"
              disabled={disabled || rows <= 1}
              onClick={() => setRows((r) => Math.max(1, r - 1))}
              className="manipulative-target flex-1 rounded-xl border border-border bg-surface-subtle px-3 text-lg font-bold text-ink disabled:opacity-40"
            >
              −
            </button>
            <button
              type="button"
              data-testid="array-rows-inc"
              disabled={disabled || rows >= maxRows}
              onClick={() => setRows((r) => Math.min(maxRows, r + 1))}
              className="manipulative-target flex-1 rounded-xl bg-accent px-3 text-lg font-bold text-white disabled:opacity-40"
            >
              +
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-2.5 flex flex-col items-center gap-2">
          <span className="text-xs font-bold text-ink-muted">
            ក្នុង ១ ជួរ ({formatDisplayNumber(cols, numeralPref)})
          </span>
          <div className="flex items-center justify-center gap-2 w-full">
            <button
              type="button"
              data-testid="array-cols-dec"
              disabled={disabled || cols <= 1}
              onClick={() => setCols((c) => Math.max(1, c - 1))}
              className="manipulative-target flex-1 rounded-xl border border-border bg-surface-subtle px-3 text-lg font-bold text-ink disabled:opacity-40"
            >
              −
            </button>
            <button
              type="button"
              data-testid="array-cols-inc"
              disabled={disabled || cols >= maxCols}
              onClick={() => setCols((c) => Math.min(maxCols, c + 1))}
              className="manipulative-target flex-1 rounded-xl bg-accent px-3 text-lg font-bold text-white disabled:opacity-40"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
