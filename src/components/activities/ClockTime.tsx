"use client";

import React, { useEffect, useRef, useState } from "react";
import type { ClockTimeStep } from "@/lib/curriculum/schema";
import type { StepAnswer } from "@/lib/math/grader";
import {
  formatClockTime,
  normalizeHour12,
  normalizeMinute,
} from "@/lib/math/clockAndChart";
import {
  formatDisplayNumber,
  type NumeralPreference,
} from "@/lib/khmer/numerals";
import { playScaleNote } from "@/lib/audio/chimes";
import { useLearner } from "@/components/providers/LearnerProvider";

interface ClockTimeProps {
  step: ClockTimeStep;
  numeralPref: NumeralPreference;
  disabled?: boolean;
  onAnswerChange: (answer: Extract<StepAnswer, { type: "clock-time" }>) => void;
}

const DIAL_HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;
const QUICK_MINUTES = [0, 15, 30, 45] as const;

export function ClockTime({
  step,
  numeralPref,
  disabled = false,
  onAnswerChange,
}: ClockTimeProps) {
  const { audioEnabled } = useLearner();
  const { initialHour, initialMinute, minuteStep, showDigitalReadout, periodLabelKm } =
    step.config;

  const [hour, setHour] = useState<number>(() => normalizeHour12(initialHour));
  const [minute, setMinute] = useState<number>(() =>
    normalizeMinute(initialMinute)
  );

  const onAnswerChangeRef = useRef(onAnswerChange);
  useEffect(() => {
    onAnswerChangeRef.current = onAnswerChange;
  }, [onAnswerChange]);

  useEffect(() => {
    onAnswerChangeRef.current({
      type: "clock-time",
      hour,
      minute,
    });
  }, [hour, minute]);

  const adjustHour = (delta: number) => {
    if (disabled) return;
    const next = normalizeHour12(hour + delta);
    setHour(next);
    playScaleNote(next % 10, audioEnabled);
  };

  const adjustMinute = (delta: number) => {
    if (disabled) return;
    const rawTotal = minute + delta;
    let nextH = hour;
    if (rawTotal >= 60) {
      nextH = normalizeHour12(hour + 1);
    } else if (rawTotal < 0) {
      nextH = normalizeHour12(hour - 1);
    }
    const nextM = normalizeMinute(rawTotal);
    setHour(nextH);
    setMinute(nextM);
    playScaleNote(Math.floor(nextM / 5) % 10, audioEnabled);
  };

  const setQuickMinute = (m: number) => {
    if (disabled) return;
    setMinute(m);
    playScaleNote(Math.floor(m / 15) + 4, audioEnabled);
  };

  const cx = 140;
  const cy = 140;
  // Angle in degrees where 12 o'clock is 0 deg (clockwise)
  const minuteAngleDeg = minute * 6;
  const hourAngleDeg = (hour % 12) * 30 + minute * 0.5;

  const handEndpoint = (angleDeg: number, length: number) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return {
      x: cx + Math.cos(rad) * length,
      y: cy + Math.sin(rad) * length,
    };
  };

  const hourTip = handEndpoint(hourAngleDeg, 62);
  const minuteTip = handEndpoint(minuteAngleDeg, 94);
  const digitalText = formatClockTime(hour, minute, numeralPref);

  return (
    <div className="flex flex-col items-center gap-3.5 w-full">
      {/* Live Khmer digital readout */}
      {showDigitalReadout && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span
            data-testid="clock-digital-readout"
            aria-live="polite"
            className="rounded-2xl border-2 border-accent bg-accent-soft px-5 py-1.5 text-2xl font-bold text-accent tracking-normal shadow-xs"
          >
            {digitalText}
          </span>
          {periodLabelKm && (
            <span className="rounded-full border border-border bg-surface-subtle px-3 py-1 text-xs font-bold text-ink">
              {periodLabelKm}
            </span>
          )}
        </div>
      )}

      {/* Safari-safe inline SVG Khmer Analog Clock (zero foreignObject) */}
      <div className="w-full max-w-[260px] flex justify-center">
        <svg
          viewBox="0 0 280 280"
          className="w-full h-auto select-none"
          role="img"
          aria-label={`នាឡិកាបង្ហាញម៉ោង ${digitalText}`}
        >
          {/* Warm wooden/golden bezel */}
          <circle
            cx={cx}
            cy={cy}
            r={132}
            fill="#fffbeb"
            stroke="#d97706"
            strokeWidth={7}
          />
          <circle
            cx={cx}
            cy={cy}
            r={122}
            fill="#ffffff"
            stroke="#fde68a"
            strokeWidth={2}
          />

          {/* 60 minute ticks */}
          {Array.from({ length: 60 }).map((_, i) => {
            const isMajor = i % 5 === 0;
            const rad = ((i * 6 - 90) * Math.PI) / 180;
            const rOuter = 118;
            const rInner = isMajor ? 108 : 113;
            return (
              <line
                key={i}
                x1={cx + Math.cos(rad) * rInner}
                y1={cy + Math.sin(rad) * rInner}
                x2={cx + Math.cos(rad) * rOuter}
                y2={cy + Math.sin(rad) * rOuter}
                stroke={isMajor ? "#92400e" : "#cbd5e1"}
                strokeWidth={isMajor ? 3 : 1.5}
                strokeLinecap="round"
              />
            );
          })}

          {/* 1..12 Khmer / Arabic numerals */}
          {DIAL_HOURS.map((hVal, idx) => {
            const rad = ((idx * 30 - 90) * Math.PI) / 180;
            const x = cx + Math.cos(rad) * 90;
            const y = cy + Math.sin(rad) * 90 + 6;
            const isCurrentHour = hVal === hour;
            return (
              <g key={hVal}>
                {isCurrentHour && (
                  <circle cx={x} cy={y - 6} r={16} fill="#dbeafe" />
                )}
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  fontSize={18}
                  fontWeight={700}
                  fill={isCurrentHour ? "#1d4ed8" : "#1f2937"}
                >
                  {formatDisplayNumber(hVal, numeralPref)}
                </text>
              </g>
            );
          })}

          {/* Minute hand (long blue) */}
          <line
            x1={cx}
            y1={cy}
            x2={minuteTip.x}
            y2={minuteTip.y}
            stroke="#2563eb"
            strokeWidth={5.5}
            strokeLinecap="round"
          />

          {/* Hour hand (short warm amber-red) */}
          <line
            x1={cx}
            y1={cy}
            x2={hourTip.x}
            y2={hourTip.y}
            stroke="#b45309"
            strokeWidth={8.5}
            strokeLinecap="round"
          />

          {/* Center brass pin */}
          <circle
            cx={cx}
            cy={cy}
            r={9}
            fill="#d97706"
            stroke="#ffffff"
            strokeWidth={3}
          />
        </svg>
      </div>

      {/* Tactile >= 56x56px Hour & Minute Controls */}
      <div className="w-full max-w-sm space-y-2.5">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            data-testid="clock-hour-dec"
            disabled={disabled}
            onClick={() => adjustHour(-1)}
            className="manipulative-target rounded-2xl border-2 border-amber-700/40 bg-amber-50 px-3 text-sm font-bold text-amber-900 hover:bg-amber-100 disabled:opacity-45"
          >
            −{formatDisplayNumber(1, numeralPref)} ម៉ោង
          </button>
          <button
            type="button"
            data-testid="clock-hour-inc"
            disabled={disabled}
            onClick={() => adjustHour(1)}
            className="manipulative-target rounded-2xl bg-amber-700 px-3 text-sm font-bold text-white shadow-xs hover:bg-amber-800 disabled:opacity-45"
          >
            +{formatDisplayNumber(1, numeralPref)} ម៉ោង
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            data-testid="clock-min-dec"
            disabled={disabled}
            onClick={() => adjustMinute(-minuteStep)}
            className="manipulative-target rounded-2xl border-2 border-accent/40 bg-accent-soft px-3 text-sm font-bold text-accent hover:bg-accent hover:text-white disabled:opacity-45"
          >
            −{formatDisplayNumber(minuteStep, numeralPref)} នាទី
          </button>
          <button
            type="button"
            data-testid="clock-min-inc"
            disabled={disabled}
            onClick={() => adjustMinute(minuteStep)}
            className="manipulative-target rounded-2xl bg-accent px-3 text-sm font-bold text-white shadow-xs hover:bg-accent-hover disabled:opacity-45"
          >
            +{formatDisplayNumber(minuteStep, numeralPref)} នាទី
          </button>
        </div>

        {/* Quick quarter-hour chips */}
        <div className="grid grid-cols-4 gap-1.5">
          {QUICK_MINUTES.map((m) => {
            const active = minute === m;
            return (
              <button
                key={m}
                type="button"
                data-testid={`clock-min-${m}`}
                aria-pressed={active}
                disabled={disabled}
                onClick={() => setQuickMinute(m)}
                className={`manipulative-target rounded-xl border-2 text-sm font-bold transition-colors disabled:opacity-45 ${
                  active
                    ? "border-accent bg-accent text-white"
                    : "border-border bg-surface text-ink hover:bg-surface-subtle"
                }`}
              >
                :{formatDisplayNumber(String(m).padStart(2, "0"), numeralPref)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
