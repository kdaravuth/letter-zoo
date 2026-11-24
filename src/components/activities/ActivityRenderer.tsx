"use client";

import React from "react";
import type { ActivityStep } from "@/lib/curriculum/schema";
import type { StepAnswer } from "@/lib/math/grader";
import type { NumeralPreference } from "@/lib/khmer/numerals";
import { CountingStage } from "./CountingStage";
import { NumberLine } from "./NumberLine";
import { PlaceValueBlocks } from "./PlaceValueBlocks";
import { ScenarioChoice } from "./ScenarioChoice";
import { ComparisonBalance } from "./ComparisonBalance";
import { ArrayGroups } from "./ArrayGroups";
import { FractionBarShape } from "./FractionBarShape";
import { PatternSequence } from "./PatternSequence";
import { GeometryDraw } from "./GeometryDraw";
import { ClockTime } from "./ClockTime";
import { DataChart } from "./DataChart";

interface ActivityRendererProps {
  step: ActivityStep;
  numeralPref: NumeralPreference;
  highlightTargetId?: string;
  disabled?: boolean;
  onAnswerChange: (answer: StepAnswer) => void;
}

/**
 * Single decoupled renderer mapping any Zod-validated ActivityStep JSON
 * across all 11 reusable Safari-safe SVG manipulative primitives.
 */
export function ActivityRenderer({
  step,
  numeralPref,
  highlightTargetId,
  disabled = false,
  onAnswerChange,
}: ActivityRendererProps) {
  switch (step.type) {
    case "counting-stage":
      return (
        <CountingStage
          key={step.id}
          step={step}
          numeralPref={numeralPref}
          highlightTargetId={highlightTargetId}
          disabled={disabled}
          onAnswerChange={onAnswerChange}
        />
      );
    case "number-line":
      return (
        <NumberLine
          key={step.id}
          step={step}
          numeralPref={numeralPref}
          highlightTargetId={highlightTargetId}
          disabled={disabled}
          onAnswerChange={onAnswerChange}
        />
      );
    case "place-value-blocks":
      return (
        <PlaceValueBlocks
          key={step.id}
          step={step}
          numeralPref={numeralPref}
          disabled={disabled}
          onAnswerChange={onAnswerChange}
        />
      );
    case "scenario-choice":
      return (
        <ScenarioChoice
          key={step.id}
          step={step}
          numeralPref={numeralPref}
          highlightTargetId={highlightTargetId}
          disabled={disabled}
          onAnswerChange={onAnswerChange}
        />
      );
    case "comparison-balance":
      return (
        <ComparisonBalance
          key={step.id}
          step={step}
          numeralPref={numeralPref}
          highlightTargetId={highlightTargetId}
          disabled={disabled}
          onAnswerChange={onAnswerChange}
        />
      );
    case "array-groups":
      return (
        <ArrayGroups
          key={step.id}
          step={step}
          numeralPref={numeralPref}
          disabled={disabled}
          onAnswerChange={onAnswerChange}
        />
      );
    case "fraction-bar-shape":
      return (
        <FractionBarShape
          key={step.id}
          step={step}
          numeralPref={numeralPref}
          disabled={disabled}
          onAnswerChange={onAnswerChange}
        />
      );
    case "pattern-sequence":
      return (
        <PatternSequence
          key={step.id}
          step={step}
          numeralPref={numeralPref}
          disabled={disabled}
          onAnswerChange={onAnswerChange}
        />
      );
    case "geometry-draw":
      return (
        <GeometryDraw
          key={step.id}
          step={step}
          numeralPref={numeralPref}
          disabled={disabled}
          onAnswerChange={onAnswerChange}
        />
      );
    case "clock-time":
      return (
        <ClockTime
          key={step.id}
          step={step}
          numeralPref={numeralPref}
          disabled={disabled}
          onAnswerChange={onAnswerChange}
        />
      );
    case "data-chart":
      return (
        <DataChart
          key={step.id}
          step={step}
          numeralPref={numeralPref}
          disabled={disabled}
          onAnswerChange={onAnswerChange}
        />
      );
  }
}
