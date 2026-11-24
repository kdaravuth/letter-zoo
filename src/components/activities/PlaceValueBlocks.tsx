"use client";

import React, { useEffect, useRef, useState } from "react";
import type { PlaceValueBlocksStep } from "@/lib/curriculum/schema";
import type { StepAnswer } from "@/lib/math/grader";
import {
  formatDisplayNumber,
  type NumeralPreference,
} from "@/lib/khmer/numerals";

interface PlaceValueBlocksProps {
  step: PlaceValueBlocksStep;
  numeralPref: NumeralPreference;
  disabled?: boolean;
  onAnswerChange: (
    answer: Extract<StepAnswer, { type: "place-value-blocks" }>
  ) => void;
}

export function PlaceValueBlocks({
  step,
  numeralPref,
  disabled = false,
  onAnswerChange,
}: PlaceValueBlocksProps) {
  const [hundreds, setHundreds] = useState<number>(
    step.config.initialHundreds ?? 0
  );
  const [tens, setTens] = useState<number>(step.config.initialTens ?? 0);
  const [ones, setOnes] = useState<number>(step.config.initialOnes ?? 0);

  const onAnswerChangeRef = useRef(onAnswerChange);
  useEffect(() => {
    onAnswerChangeRef.current = onAnswerChange;
  }, [onAnswerChange]);

  const total = hundreds * 100 + tens * 10 + ones;

  useEffect(() => {
    onAnswerChangeRef.current({
      type: "place-value-blocks",
      hundreds,
      tens,
      ones,
      total,
    });
  }, [hundreds, tens, ones, total]);

  const handleBundleTen = () => {
    if (disabled || ones < 10) return;
    setOnes((o) => o - 10);
    setTens((t) => t + 1);
  };

  const handleUnbundleTen = () => {
    if (disabled || tens < 1) return;
    setTens((t) => t - 1);
    setOnes((o) => o + 10);
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {step.config.showLiveTotal && (
        <div
          className="flex flex-wrap items-center justify-center gap-2 text-sm font-semibold"
          aria-live="polite"
        >
          <span
            data-testid="place-value-total"
            className="rounded-full border border-border bg-surface px-4 py-1 text-ink shadow-xs"
          >
            ចំនួនសរុប៖{" "}
            <strong className="text-accent">
              {formatDisplayNumber(total, numeralPref)}
            </strong>
          </span>
        </div>
      )}

      {/* Visual base-10 SVG mat (Safari-safe, zero foreignObject) */}
      <div className="w-full max-w-[400px] rounded-2xl border border-border bg-surface p-2">
        <svg
          viewBox="0 0 320 185"
          className="w-full h-auto select-none"
          role="img"
          aria-label={`ដុំតម្លៃលេខតាមខ្ទង់៖ ខ្ទង់ដប់ ${formatDisplayNumber(tens, numeralPref)} និងខ្ទង់រាយ ${formatDisplayNumber(ones, numeralPref)}`}
        >
          {/* Tens column */}
          <rect
            x={4}
            y={4}
            width={150}
            height={176}
            rx={12}
            fill="#f8fafc"
            stroke="#cbd5e1"
            strokeWidth={1.5}
          />
          <text
            x={79}
            y={24}
            textAnchor="middle"
            fontSize={13}
            fontWeight={700}
            fill="#1e3a8a"
          >
            ខ្ទង់ដប់ ({formatDisplayNumber(tens, numeralPref)})
          </text>

          {/* Render ten-rods */}
          {Array.from({ length: Math.min(tens, 12) }).map((_, i) => {
            const rx = 14 + (i % 6) * 22;
            const ry = i < 6 ? 34 : 108;
            return (
              <g key={`ten-${i}`}>
                <rect
                  x={rx}
                  y={ry}
                  width={16}
                  height={66}
                  rx={3}
                  fill="#3b82f6"
                  stroke="#1d4ed8"
                  strokeWidth={1.5}
                />
                {Array.from({ length: 4 }).map((__, seg) => (
                  <line
                    key={seg}
                    x1={rx}
                    y1={ry + (seg + 1) * 13}
                    x2={rx + 16}
                    y2={ry + (seg + 1) * 13}
                    stroke="#93c5fd"
                    strokeWidth={1}
                  />
                ))}
              </g>
            );
          })}

          {/* Ones column */}
          <rect
            x={166}
            y={4}
            width={150}
            height={176}
            rx={12}
            fill="#fffbeb"
            stroke="#fcd34d"
            strokeWidth={1.5}
          />
          <text
            x={241}
            y={24}
            textAnchor="middle"
            fontSize={13}
            fontWeight={700}
            fill="#92400e"
          >
            ខ្ទង់រាយ ({formatDisplayNumber(ones, numeralPref)})
          </text>

          {/* Render ones cubes */}
          {Array.from({ length: Math.min(ones, 20) }).map((_, i) => {
            const col = i % 5;
            const row = Math.floor(i / 5);
            const cx = 178 + col * 26;
            const cy = 36 + row * 28;
            return (
              <rect
                key={`one-${i}`}
                x={cx}
                y={cy}
                width={20}
                height={20}
                rx={4}
                fill="#f59e0b"
                stroke="#b45309"
                strokeWidth={1.5}
              />
            );
          })}
        </svg>
      </div>

      {/* Add / Remove controls (>= 56x56px targets, responsive so 360px phones never overflow) */}
      <div className="grid grid-cols-1 min-[390px]:grid-cols-2 gap-2.5 w-full max-w-[380px]">
        <div className="flex items-center justify-between gap-2 rounded-xl border border-border bg-surface p-2">
          <button
            type="button"
            data-testid="pv-remove-ten"
            disabled={disabled || tens <= 0}
            onClick={() => setTens((t) => Math.max(0, t - 1))}
            className="manipulative-target flex-1 rounded-lg border border-border bg-surface-subtle px-3 text-base font-bold text-ink disabled:opacity-40"
          >
            −{formatDisplayNumber(10, numeralPref)}
            <span className="sr-only"> ខ្ទង់ដប់</span>
          </button>
          <button
            type="button"
            data-testid="pv-add-ten"
            disabled={disabled || tens >= 12}
            onClick={() => setTens((t) => Math.min(12, t + 1))}
            className="manipulative-target flex-1 rounded-lg bg-accent px-3 text-base font-bold text-white disabled:opacity-40"
          >
            +{formatDisplayNumber(10, numeralPref)}
            <span className="sr-only"> ខ្ទង់ដប់</span>
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 rounded-xl border border-border bg-surface p-2">
          <button
            type="button"
            data-testid="pv-remove-one"
            disabled={disabled || ones <= 0}
            onClick={() => setOnes((o) => Math.max(0, o - 1))}
            className="manipulative-target flex-1 rounded-lg border border-border bg-surface-subtle px-3 text-base font-bold text-ink disabled:opacity-40"
          >
            −{formatDisplayNumber(1, numeralPref)}
            <span className="sr-only"> ខ្ទង់រាយ</span>
          </button>
          <button
            type="button"
            data-testid="pv-add-one"
            disabled={disabled || ones >= 20}
            onClick={() => setOnes((o) => Math.min(20, o + 1))}
            className="manipulative-target flex-1 rounded-lg bg-amber-700 px-3 text-base font-bold text-white disabled:opacity-40"
          >
            +{formatDisplayNumber(1, numeralPref)}
            <span className="sr-only"> ខ្ទង់រាយ</span>
          </button>
        </div>
      </div>

      {/* Optional hundreds controls */}
      {step.config.allowHundreds && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={disabled || hundreds <= 0}
            onClick={() => setHundreds((h) => Math.max(0, h - 1))}
            className="manipulative-target rounded-xl border border-border bg-surface px-4 text-sm font-bold text-ink disabled:opacity-40"
          >
            −{formatDisplayNumber(100, numeralPref)}
          </button>
          <span className="text-sm font-semibold text-ink">
            ខ្ទង់រយ៖ {formatDisplayNumber(hundreds, numeralPref)}
          </span>
          <button
            type="button"
            disabled={disabled || hundreds >= 9}
            onClick={() => setHundreds((h) => Math.min(9, h + 1))}
            className="manipulative-target rounded-xl bg-accent px-4 text-sm font-bold text-white disabled:opacity-40"
          >
            +{formatDisplayNumber(100, numeralPref)}
          </button>
        </div>
      )}

      {/* Bundle 10 / Unbundle 10 actions */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {step.config.allowBundle && (
          <button
            type="button"
            data-testid="pv-bundle-ten"
            disabled={disabled || ones < 10}
            onClick={handleBundleTen}
            className="manipulative-target rounded-xl border-2 border-success bg-success-soft px-4 text-sm font-bold text-success disabled:opacity-40"
          >
            ផ្ដុំ {formatDisplayNumber(10, numeralPref)}
          </button>
        )}
        {step.config.allowUnbundle && (
          <button
            type="button"
            data-testid="pv-unbundle-ten"
            disabled={disabled || tens < 1}
            onClick={handleUnbundleTen}
            className="manipulative-target rounded-xl border-2 border-hint bg-hint-soft px-4 text-sm font-bold text-hint-ink disabled:opacity-40"
          >
            បំបែក {formatDisplayNumber(10, numeralPref)}
          </button>
        )}
      </div>
    </div>
  );
}
