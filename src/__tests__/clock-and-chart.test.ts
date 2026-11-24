import { describe, expect, it } from "vitest";
import {
  checkClockMatch,
  checkDataChartBars,
  formatClockTime,
  normalizeHour12,
  normalizeMinute,
} from "@/lib/math/clockAndChart";
import { gradeStep } from "@/lib/math/grader";
import type { ClockTimeStep, DataChartStep } from "@/lib/curriculum/schema";

describe("clockAndChart pure math helpers", () => {
  it("normalizes 12-hour analog hours and wraps minutes cleanly", () => {
    expect(normalizeHour12(0)).toBe(12);
    expect(normalizeHour12(12)).toBe(12);
    expect(normalizeHour12(13)).toBe(1);
    expect(normalizeMinute(-15)).toBe(45);
    expect(normalizeMinute(75)).toBe(15);
  });

  it("formats clock readout in both Khmer and Arabic numerals", () => {
    expect(formatClockTime(9, 30, "km")).toBe("០៩:៣០");
    expect(formatClockTime(9, 30, "latn")).toBe("09:30");
  });

  it("grades clock time with Khmer numerals and ZWSP stripped", () => {
    const ok = checkClockMatch(9, 30, "៩\u200B", "៣\u200B០");
    expect(ok.isMatch).toBe(true);
    expect(ok.hourMatch).toBe(true);
    expect(ok.minuteMatch).toBe(true);

    const wrongMin = checkClockMatch(9, 30, 9, 15);
    expect(wrongMin.isMatch).toBe(false);
    expect(wrongMin.hourMatch).toBe(true);
    expect(wrongMin.minuteMatch).toBe(false);
  });

  it("grades bar chart heights accurately", () => {
    const ok = checkDataChartBars(
      { mango: 6, orange: 4 },
      { mango: "៦\u200B", orange: "៤" }
    );
    expect(ok.isMatch).toBe(true);
    expect(ok.mismatchedIds).toEqual([]);

    const bad = checkDataChartBars(
      { mango: 6, orange: 4 },
      { mango: 5, orange: 4 }
    );
    expect(bad.isMatch).toBe(false);
    expect(bad.mismatchedIds).toEqual(["mango"]);
  });
});

describe("gradeStep for clock-time and data-chart", () => {
  const baseHints = [
    { tier: 1 as const, kind: "visual-cue" as const, textKm: "គន្លឹះ ១" },
    { tier: 2 as const, kind: "strategy-nudge" as const, textKm: "គន្លឹះ ២" },
    { tier: 3 as const, kind: "worked-step" as const, textKm: "គន្លឹះ ៣" },
  ];

  it("grades clock-time step", () => {
    const step: ClockTimeStep = {
      id: "c1",
      type: "clock-time",
      stage: "concrete",
      promptKm: "កំណត់ម៉ោង ៧:០០",
      config: {
        initialHour: 5,
        initialMinute: 0,
        minuteStep: 15,
        showDigitalReadout: true,
      },
      solution: { expectedHour: 7, expectedMinute: 0 },
      hints: baseHints,
      explanationKm: "ម៉ោង ៧:០០ គត់!",
    };

    expect(
      gradeStep(step, { type: "clock-time", hour: "៧", minute: "០" }).isCorrect
    ).toBe(true);

    const wrong = gradeStep(step, { type: "clock-time", hour: 6, minute: 0 });
    expect(wrong.isCorrect).toBe(false);
    expect(wrong.discrepancy?.kind).toBe("time-mismatch");
  });

  it("grades data-chart build-bars and read-bar modes", () => {
    const buildStep: DataChartStep = {
      id: "d1",
      type: "data-chart",
      stage: "concrete",
      promptKm: "សង់ដ្យាក្រាមស្វាយ ៦ ក្រូច ៤",
      config: {
        mode: "build-bars",
        maxValue: 8,
        unitLabelKm: "ផ្លែ",
        bars: [
          { id: "mango", labelKm: "ស្វាយ", color: "#d97706", initialValue: 0 },
          { id: "orange", labelKm: "ក្រូច", color: "#ea580c", initialValue: 0 },
        ],
      },
      solution: { expectedBarValues: { mango: 6, orange: 4 } },
      hints: baseHints,
      explanationKm: "ស្វាយ ៦ និងក្រូច ៤!",
    };

    expect(
      gradeStep(buildStep, {
        type: "data-chart",
        barValues: { mango: "៦", orange: "៤" },
      }).isCorrect
    ).toBe(true);

    const readStep: DataChartStep = {
      id: "d2",
      type: "data-chart",
      stage: "iconic",
      promptKm: "តើផ្កាណាច្រើនជាងគេ?",
      config: {
        mode: "read-bar",
        maxValue: 10,
        unitLabelKm: "ទង",
        bars: [
          { id: "lotus", labelKm: "ផ្កាឈូក", color: "#db2777", initialValue: 8 },
          { id: "jasmine", labelKm: "ផ្កាម្លិះ", color: "#2563eb", initialValue: 3 },
        ],
      },
      solution: { expectedBarId: "lotus" },
      hints: baseHints,
      explanationKm: "ផ្កាឈូកមាន ៨ ទង!",
    };

    expect(
      gradeStep(readStep, {
        type: "data-chart",
        selectedBarId: "lotus\u200B",
      }).isCorrect
    ).toBe(true);
    expect(
      gradeStep(readStep, {
        type: "data-chart",
        selectedBarId: "jasmine",
      }).isCorrect
    ).toBe(false);
  });
});
