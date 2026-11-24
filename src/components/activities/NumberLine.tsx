"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { NumberLineStep } from "@/lib/curriculum/schema";
import type { StepAnswer } from "@/lib/math/grader";
import {
  formatDisplayNumber,
  type NumeralPreference,
} from "@/lib/khmer/numerals";
import { playScaleNote, playWaterPlop } from "@/lib/audio/chimes";
import { useLearner } from "@/components/providers/LearnerProvider";

interface NumberLineProps {
  step: NumberLineStep;
  numeralPref: NumeralPreference;
  highlightTargetId?: string;
  disabled?: boolean;
  onAnswerChange: (answer: Extract<StepAnswer, { type: "number-line" }>) => void;
}

export function NumberLine({
  step,
  numeralPref,
  highlightTargetId,
  disabled = false,
  onAnswerChange,
}: NumberLineProps) {
  const { min, max, step: tickStep, startValue, showJumps, hiddenTickValues, theme } =
    step.config;

  const ticks = useMemo(() => {
    const list: number[] = [];
    const count = Math.round((max - min) / tickStep);
    for (let i = 0; i <= count; i++) {
      const v = Number((min + i * tickStep).toFixed(6));
      list.push(v);
    }
    return list;
  }, [min, max, tickStep]);

  const { audioEnabled } = useLearner();
  const [currentValue, setCurrentValue] = useState<number>(startValue);
  const [jumpStops, setJumpStops] = useState<number[]>([startValue]);
  const [, setIsDragging] = useState<boolean>(false);
  const isDraggingRef = useRef<boolean>(false);
  const activeValueRef = useRef<number>(startValue);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const onAnswerChangeRef = useRef(onAnswerChange);
  useEffect(() => {
    onAnswerChangeRef.current = onAnswerChange;
  }, [onAnswerChange]);

  useEffect(() => {
    onAnswerChangeRef.current({
      type: "number-line",
      value: currentValue,
      visitedValues: jumpStops,
    });
  }, [currentValue, jumpStops]);

  const tickSpacing = 62;
  const padX = 36;
  const svgWidth = Math.max(320, padX * 2 + (ticks.length - 1) * tickSpacing);
  const svgHeight = 166;
  const trackY = 98;

  const valueToX = useCallback(
    (val: number) => {
      const idx = (val - min) / tickStep;
      return padX + idx * tickSpacing;
    },
    [min, tickStep]
  );

  // Keep active value visible inside horizontal scroll container on mount and step changes
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const targetX = valueToX(currentValue);
    const viewLeft = container.scrollLeft;
    const viewRight = viewLeft + container.clientWidth;
    if (targetX - 48 < viewLeft || targetX + 48 > viewRight) {
      container.scrollLeft = Math.max(
        0,
        targetX - container.clientWidth / 2 + 20
      );
    }
  }, [currentValue, valueToX]);

  const moveToValue = useCallback(
    (nextVal: number) => {
      if (disabled) return;
      const clamped = Math.max(min, Math.min(max, nextVal));
      const snapped =
        min + Math.round((clamped - min) / tickStep) * tickStep;
      const cleanVal = Number(snapped.toFixed(6));

      if (theme === "frog-lotus") {
        playWaterPlop(audioEnabled);
      } else {
        const idx = Math.round((cleanVal - min) / tickStep);
        playScaleNote(idx % 11, audioEnabled);
      }

      activeValueRef.current = cleanVal;
      setCurrentValue(cleanVal);
      setJumpStops((prev) => {
        if (prev[prev.length - 1] === cleanVal) return prev;
        // Keep a concise jump history
        const next = [...prev, cleanVal];
        return next.length > 8 ? next.slice(-8) : next;
      });
    },
    [disabled, min, max, tickStep, theme, audioEnabled]
  );

  const handleReset = () => {
    if (disabled) return;
    activeValueRef.current = startValue;
    setCurrentValue(startValue);
    setJumpStops([startValue]);
  };

  const handleMarkerPointerDown = (e: React.PointerEvent<SVGGElement>) => {
    if (disabled) return;
    e.stopPropagation();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore synthetic events
    }
    isDraggingRef.current = true;
    setIsDragging(true);
  };

  const handleMarkerPointerMove = (e: React.PointerEvent<SVGGElement>) => {
    if (!isDraggingRef.current || disabled || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / Math.max(1, rect.width)) * svgWidth;
    const idx = Math.round((x - padX) / tickSpacing);
    const val = min + Math.max(0, Math.min(ticks.length - 1, idx)) * tickStep;
    const cleanVal = Number(val.toFixed(6));
    if (cleanVal !== activeValueRef.current) {
      activeValueRef.current = cleanVal;
      setCurrentValue(cleanVal);
    }
  };

  const handleMarkerPointerUp = (e: React.PointerEvent<SVGGElement>) => {
    if (!isDraggingRef.current) return;
    try {
      if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // ignore synthetic events
    }
    isDraggingRef.current = false;
    setIsDragging(false);
    const landedVal = activeValueRef.current;
    setJumpStops((prev) =>
      prev[prev.length - 1] === landedVal ? prev : [...prev, landedVal]
    );
  };

  const handleMarkerPointerCancel = (e: React.PointerEvent<SVGGElement>) => {
    try {
      if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // ignore synthetic events
    }
    isDraggingRef.current = false;
    setIsDragging(false);
  };

  const markerX = valueToX(currentValue);

  const jumpArcs = useMemo(() => {
    if (!showJumps || jumpStops.length < 2) return [];
    const arcs: Array<{ from: number; to: number; delta: number }> = [];
    for (let i = 1; i < jumpStops.length; i++) {
      const from = jumpStops[i - 1];
      const to = jumpStops[i];
      if (from !== to) {
        arcs.push({ from, to, delta: Number((to - from).toFixed(4)) });
      }
    }
    return arcs;
  }, [showJumps, jumpStops]);

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {/* Active value & jump status */}
      <div
        className="flex flex-wrap items-center justify-center gap-2 text-sm font-semibold"
        aria-live="polite"
      >
        <span
          data-testid="number-line-value-badge"
          className="rounded-full border border-border bg-surface px-3.5 py-1 text-ink shadow-xs"
        >
          ទីតាំងបច្ចុប្បន្ន៖{" "}
          <strong className="text-accent">
            {formatDisplayNumber(currentValue, numeralPref)}
          </strong>
        </span>
        {jumpArcs.length > 0 && (
          <span className="rounded-full border border-border bg-surface-subtle px-3 py-1 text-xs text-ink-muted">
            ចាប់ផ្ដើមពី {formatDisplayNumber(startValue, numeralPref)}
          </span>
        )}
      </div>

      <p className="text-xs text-ink-muted text-center">
        ប៉ះលេខលើបន្ទាត់ អូសសញ្ញា ឬប្រើប៊ូតុងលោតខាងក្រោម
      </p>

      {/* Scrollable SVG track guaranteeing >=56x56 CSS px tick targets */}
      <div
        ref={scrollContainerRef}
        className="w-full overflow-x-auto rounded-2xl border border-border bg-surface pb-2 pt-1"
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ width: `${svgWidth}px`, minWidth: `${svgWidth}px`, height: `${svgHeight}px` }}
          className="block select-none"
          role="group"
          aria-label="បន្ទាត់ចំនួនអន្តរកម្ម"
        >
          {/* Main horizontal line */}
          <line
            x1={padX - 16}
            y1={trackY}
            x2={svgWidth - padX + 16}
            y2={trackY}
            stroke="#9ca3af"
            strokeWidth={4}
            strokeLinecap="round"
          />

          {/* Jump arcs */}
          {jumpArcs.map((arc, i) => {
            const x1 = valueToX(arc.from);
            const x2 = valueToX(arc.to);
            const midX = (x1 + x2) / 2;
            const span = Math.abs(x2 - x1);
            const arcHeight = Math.min(62, Math.max(30, span * 0.25));
            const peakY = trackY - arcHeight;
            const sign = arc.delta > 0 ? "+" : "-";
            const label = `${sign}${formatDisplayNumber(Math.abs(arc.delta), numeralPref)}`;

            return (
              <g key={`arc-${i}`}>
                <path
                  d={`M ${x1} ${trackY - 12} Q ${midX} ${peakY - 18} ${x2} ${trackY - 12}`}
                  fill="none"
                  stroke={arc.delta > 0 ? "#2563eb" : "#d97706"}
                  strokeWidth={2.5}
                  strokeDasharray="5 3"
                />
                <rect
                  x={midX - 20}
                  y={peakY - 22}
                  width={40}
                  height={22}
                  rx={11}
                  fill={arc.delta > 0 ? "#dbeafe" : "#fef3c7"}
                />
                <text
                  x={midX}
                  y={peakY - 7}
                  textAnchor="middle"
                  fontSize={12}
                  fontWeight={700}
                  fill={arc.delta > 0 ? "#1d4ed8" : "#92400e"}
                >
                  {label}
                </text>
              </g>
            );
          })}

          {/* Ticks (>= 58x64 CSS px each) */}
          {ticks.map((val) => {
            const x = valueToX(val);
            const isHidden = hiddenTickValues.includes(val);
            const isActive = val === currentValue;
            const isStart = val === startValue;
            const isHighlighted = highlightTargetId === `tick-${val}`;
            const isMilestoneTen = val === 10 && max > 10;

            return (
              <g
                key={`tick-${val}`}
                data-testid={`tick-${val}`}
                className="manipulative-target touch-pan-x cursor-pointer"
                role="button"
                tabIndex={disabled ? -1 : 0}
                aria-pressed={isActive}
                aria-label={`លេខ ${formatDisplayNumber(val, numeralPref)}`}
                onClick={() => moveToValue(val)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    moveToValue(val);
                  }
                }}
              >
                {/* 58x68 hit area */}
                <rect
                  x={x - 29}
                  y={trackY - 20}
                  width={58}
                  height={68}
                  rx={12}
                  fill={
                    isHighlighted
                      ? "#fef3c7"
                      : isActive
                        ? "#eff6ff"
                        : "transparent"
                  }
                  stroke={
                    isHighlighted
                      ? "#d97706"
                      : isActive
                        ? "#2563eb"
                        : "transparent"
                  }
                  strokeWidth={2}
                />

                {/* Lotus pad decoration for frog-lotus theme */}
                {theme === "frog-lotus" && (
                  <ellipse
                    cx={x}
                    cy={trackY}
                    rx={16}
                    ry={9}
                    fill={isActive ? "#86efac" : "#bbf7d0"}
                    stroke="#15803d"
                    strokeWidth={1.5}
                  />
                )}

                {/* Vertical tick mark */}
                <line
                  x1={x}
                  y1={trackY - 10}
                  x2={x}
                  y2={trackY + 10}
                  stroke={isMilestoneTen ? "#b45309" : "#4b5563"}
                  strokeWidth={isMilestoneTen || isStart ? 3.5 : 2.2}
                  strokeLinecap="round"
                />

                {/* Tick label */}
                <text
                  x={x}
                  y={trackY + 34}
                  textAnchor="middle"
                  fontSize={isMilestoneTen || isActive ? 16 : 15}
                  fontWeight={isMilestoneTen || isActive ? 700 : 600}
                  fill={
                    isActive
                      ? "#1d4ed8"
                      : isMilestoneTen
                        ? "#b45309"
                        : "#1f2937"
                  }
                >
                  {isHidden && !isActive
                    ? "?"
                    : formatDisplayNumber(val, numeralPref)}
                </text>
              </g>
            );
          })}

          {/* Draggable active marker */}
          <g
            data-testid="number-line-marker"
            className="manipulative-target touch-drag-surface cursor-grab active:cursor-grabbing"
            onPointerDown={handleMarkerPointerDown}
            onPointerMove={handleMarkerPointerMove}
            onPointerUp={handleMarkerPointerUp}
            onPointerCancel={handleMarkerPointerCancel}
          >
            <rect
              x={markerX - 28}
              y={trackY - 58}
              width={56}
              height={56}
              rx={28}
              fill="transparent"
            />
            {theme === "frog-lotus" ? (
              <g pointerEvents="none">
                <circle
                  cx={markerX}
                  cy={trackY - 24}
                  r={17}
                  fill="#22c55e"
                  stroke="#15803d"
                  strokeWidth={2}
                />
                <circle cx={markerX - 7} cy={trackY - 37} r={5.5} fill="#22c55e" stroke="#15803d" strokeWidth={1.5} />
                <circle cx={markerX + 7} cy={trackY - 37} r={5.5} fill="#22c55e" stroke="#15803d" strokeWidth={1.5} />
                <circle cx={markerX - 7} cy={trackY - 37} r={2.2} fill="#111827" />
                <circle cx={markerX + 7} cy={trackY - 37} r={2.2} fill="#111827" />
                <path
                  d={`M ${markerX - 7} ${trackY - 20} Q ${markerX} ${trackY - 14} ${markerX + 7} ${trackY - 20}`}
                  fill="none"
                  stroke="#14532d"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </g>
            ) : (
              <g pointerEvents="none">
                <circle
                  cx={markerX}
                  cy={trackY - 28}
                  r={17}
                  fill="#2563eb"
                  stroke="#ffffff"
                  strokeWidth={2.5}
                />
                <text
                  x={markerX}
                  y={trackY - 22}
                  textAnchor="middle"
                  fontSize={13}
                  fontWeight={700}
                  fill="#ffffff"
                >
                  {formatDisplayNumber(currentValue, numeralPref)}
                </text>
              </g>
            )}
          </g>
        </svg>
      </div>

      {/* Single-pointer accessible step buttons (>= 56x56px) */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          data-testid="number-line-step-back"
          disabled={disabled || currentValue <= min}
          onClick={() => moveToValue(currentValue - tickStep)}
          className="manipulative-target rounded-xl border border-border bg-surface px-4 text-sm font-bold text-ink shadow-xs hover:bg-surface-subtle disabled:opacity-45"
        >
          −{formatDisplayNumber(tickStep, numeralPref)} ជំហាន
        </button>

        <button
          type="button"
          data-testid="number-line-step-forward"
          disabled={disabled || currentValue >= max}
          onClick={() => moveToValue(currentValue + tickStep)}
          className="manipulative-target rounded-xl border border-accent bg-accent-soft px-4 text-sm font-bold text-accent shadow-xs hover:bg-accent hover:text-white disabled:opacity-45"
        >
          +{formatDisplayNumber(tickStep, numeralPref)} ជំហាន
        </button>

        <button
          type="button"
          data-testid="number-line-reset"
          disabled={disabled}
          onClick={handleReset}
          className="khmer-chip rounded-xl border border-border bg-surface-subtle px-3 text-xs font-semibold text-ink-muted hover:text-ink"
        >
          ចាប់ផ្ដើមឡើងវិញ
        </button>
      </div>
    </div>
  );
}
