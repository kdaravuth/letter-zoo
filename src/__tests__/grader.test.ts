import { describe, expect, it } from "vitest";
import type {
  ArrayGroupsStep,
  ComparisonBalanceStep,
  CountingStageStep,
  FractionBarShapeStep,
  NumberLineStep,
  PatternSequenceStep,
  PlaceValueBlocksStep,
  ScenarioChoiceStep,
} from "@/lib/curriculum/schema";
import { gradeStep } from "@/lib/math/grader";

const sampleHints = [
  { tier: 1 as const, kind: "visual-cue" as const, textKm: "មើលចំណុចសំខាន់!" },
  { tier: 2 as const, kind: "strategy-nudge" as const, textKm: "គិតបង្គ្រប់ ១០!" },
  { tier: 3 as const, kind: "worked-step" as const, textKm: "ធ្វើតាមជំហាននេះ!" },
];

describe("gradeStep() deterministic grader", () => {
  it("grades counting-stage with Arabic, Khmer, and ZWSP inputs", () => {
    const step: CountingStageStep = {
      id: "cs-1",
      type: "counting-stage",
      stage: "concrete",
      promptKm: "បង្គ្រប់ ១០",
      config: {
        frameSize: 10,
        tokenTheme: "mango",
        initialInFrame: 8,
        initialOutside: 5,
        allowFreeExplore: true,
        showLiveCount: true,
        requireFullTenBundle: true,
      },
      solution: { expectedInFrame: 10, expectedTotal: 13 },
      hints: sampleHints,
      explanationKm: "១០ + ៣ = ១៣",
    };

    expect(
      gradeStep(step, { type: "counting-stage", inFrame: 10, outside: 3 })
        .isCorrect
    ).toBe(true);
    expect(
      gradeStep(step, {
        type: "counting-stage",
        inFrame: "១\u200B០",
        outside: "៣",
      }).isCorrect
    ).toBe(true);

    const low = gradeStep(step, {
      type: "counting-stage",
      inFrame: 8,
      outside: 5,
    });
    expect(low.isCorrect).toBe(false);
    expect(low.discrepancy?.kind).toBe("count-mismatch");

    const wrongTotal = gradeStep(step, {
      type: "counting-stage",
      inFrame: 10,
      outside: 2,
    });
    expect(wrongTotal.isCorrect).toBe(false);
    expect(wrongTotal.discrepancy?.kind).toBe("total-mismatch");
  });

  it("grades number-line including required intermediate stops", () => {
    const step: NumberLineStep = {
      id: "nl-1",
      type: "number-line",
      stage: "iconic",
      promptKm: "គណនា ៩ + ៦ តាមលេខ ១០",
      config: {
        min: 0,
        max: 20,
        step: 1,
        startValue: 9,
        showJumps: true,
        hiddenTickValues: [],
        theme: "default",
      },
      solution: {
        expectedValue: 15,
        requiredIntermediateValue: 10,
        tolerance: 0,
      },
      hints: sampleHints,
      explanationKm: "៩ + ១ + ៥ = ១៥",
    };

    expect(
      gradeStep(step, {
        type: "number-line",
        value: "១\u200B៥",
        visitedValues: [9, "១០", "១៥"],
      }).isCorrect
    ).toBe(true);

    const skippedTen = gradeStep(step, {
      type: "number-line",
      value: 15,
      visitedValues: [9, 15],
    });
    expect(skippedTen.isCorrect).toBe(false);
    expect(skippedTen.discrepancy?.kind).toBe("missing-intermediate");

    const wrongVal = gradeStep(step, {
      type: "number-line",
      value: 14,
      visitedValues: [9, 10, 14],
    });
    expect(wrongVal.isCorrect).toBe(false);
    expect(wrongVal.discrepancy?.kind).toBe("value-mismatch");
  });

  it("grades place-value-blocks with optional canonical regrouping check", () => {
    const step: PlaceValueBlocksStep = {
      id: "pv-1",
      type: "place-value-blocks",
      stage: "symbolic",
      promptKm: "ផ្ដុំ ១០",
      config: {
        initialHundreds: 0,
        initialTens: 0,
        initialOnes: 13,
        allowHundreds: false,
        allowBundle: true,
        allowUnbundle: true,
        showLiveTotal: true,
      },
      solution: { expectedTotal: 13, requireCanonical: true },
      hints: sampleHints,
      explanationKm: "១ ដប់ និង ៣ រាយ ស្មើ ១៣",
    };

    const ungrouped = gradeStep(step, {
      type: "place-value-blocks",
      tens: 0,
      ones: 13,
    });
    expect(ungrouped.isCorrect).toBe(false);
    expect(ungrouped.discrepancy?.kind).toBe("needs-regrouping");

    const grouped = gradeStep(step, {
      type: "place-value-blocks",
      tens: "១",
      ones: "៣\u200B",
    });
    expect(grouped.isCorrect).toBe(true);
  });

  it("grades scenario-choice single-choice and banknote-builder variants", () => {
    const choiceStep: ScenarioChoiceStep = {
      id: "sc-1",
      type: "scenario-choice",
      stage: "symbolic",
      promptKm: "ជ្រើសរើសចម្លើយ",
      config: {
        variant: "single-choice",
        options: [
          {
            id: "opt-a",
            labelKm: "៧ + ៣ + ២ = ១២",
            diagnosticFeedbackKm: "ត្រឹមត្រូវ!",
          },
          {
            id: "opt-b",
            labelKm: "៧ + ២ + ២ = ១១",
            diagnosticFeedbackKm: "២ + ២ ស្មើតែ ៤ ទេ!",
          },
        ],
      },
      solution: { correctOptionId: "opt-a" },
      hints: sampleHints,
      explanationKm: "៧ + ៣ + ២ = ១២",
    };

    expect(
      gradeStep(choiceStep, {
        type: "scenario-choice",
        selectedOptionId: "opt-a\u200B",
      }).isCorrect
    ).toBe(true);

    const wrongChoice = gradeStep(choiceStep, {
      type: "scenario-choice",
      selectedOptionId: "opt-b",
    });
    expect(wrongChoice.isCorrect).toBe(false);
    expect(wrongChoice.feedbackKm).toContain("៤");

    const banknoteStep: ScenarioChoiceStep = {
      id: "sc-2",
      type: "scenario-choice",
      stage: "concrete",
      promptKm: "រៀបចំប្រាក់ ១,៥០០៛",
      config: {
        variant: "banknote-builder",
        availableNotesKhr: [100, 500, 1000],
      },
      solution: { expectedSumKhr: 1500 },
      hints: sampleHints,
      explanationKm: "១,០០០៛ + ៥០០៛ = ១,៥០០៛",
    };

    expect(
      gradeStep(banknoteStep, {
        type: "scenario-choice",
        selectedNotesKhr: ["១០០០", "៥០០\u200B"],
      }).isCorrect
    ).toBe(true);

    expect(
      gradeStep(banknoteStep, {
        type: "scenario-choice",
        selectedNotesKhr: [1000, 100],
      }).isCorrect
    ).toBe(false);
  });

  it("grades comparison-balance operator and balance-equation modes", () => {
    const opStep: ComparisonBalanceStep = {
      id: "cb-1",
      type: "comparison-balance",
      stage: "concrete",
      promptKm: "ប្រៀបធៀប ៧ និង ៤",
      config: {
        mode: "compare-operator",
        visualStyle: "scale-oranges",
        leftValue: 7,
        rightValue: 4,
      },
      solution: { expectedOperator: ">" },
      hints: sampleHints,
      explanationKm: "៧ > ៤",
    };

    expect(
      gradeStep(opStep, { type: "comparison-balance", operator: ">\u200B" })
        .isCorrect
    ).toBe(true);
    expect(
      gradeStep(opStep, { type: "comparison-balance", operator: "<" })
        .discrepancy?.kind
    ).toBe("operator-mismatch");

    const balStep: ComparisonBalanceStep = {
      id: "cb-2",
      type: "comparison-balance",
      stage: "symbolic",
      promptKm: "ធ្វើឱ្យជញ្ជីងស្មើ ៦",
      config: {
        mode: "balance-equation",
        visualStyle: "scale-oranges",
        leftValue: 6,
        rightValue: 4,
        availableTiles: [1, 2, 3],
      },
      solution: { expectedRightTotal: 6 },
      hints: sampleHints,
      explanationKm: "៦ = ៦",
    };

    expect(
      gradeStep(balStep, { type: "comparison-balance", rightTotal: "៦\u200B" })
        .isCorrect
    ).toBe(true);
    expect(
      gradeStep(balStep, { type: "comparison-balance", rightTotal: 5 })
        .isCorrect
    ).toBe(false);
  });

  it("grades array-groups with commutative dimension support", () => {
    const step: ArrayGroupsStep = {
      id: "ag-1",
      type: "array-groups",
      stage: "iconic",
      promptKm: "រៀបចំ ២ × ៣ = ៦",
      config: {
        mode: "equal-groups",
        itemTheme: "orange",
        maxRows: 4,
        maxCols: 5,
        initialRows: 1,
        initialCols: 1,
        showProduct: true,
      },
      solution: {
        expectedRows: 2,
        expectedCols: 3,
        expectedProduct: 6,
        allowCommutative: true,
      },
      hints: sampleHints,
      explanationKm: "២ × ៣ = ៦",
    };

    expect(
      gradeStep(step, { type: "array-groups", rows: "២", cols: "៣\u200B" })
        .isCorrect
    ).toBe(true);
    expect(
      gradeStep(step, { type: "array-groups", rows: 3, cols: 2 }).isCorrect
    ).toBe(true);
    expect(
      gradeStep(step, { type: "array-groups", rows: 1, cols: 6 }).isCorrect
    ).toBe(false);
  });

  it("grades fraction-bar-shape with reduced rational equivalence and 2D shape identification", () => {
    const fracStep: FractionBarShapeStep = {
      id: "fb-1",
      type: "fraction-bar-shape",
      stage: "symbolic",
      promptKm: "លាបពណ៌ ១/២ ឬ ២/៤",
      config: {
        mode: "shade-fraction",
        visualShape: "bar",
        denominator: 4,
        initialShaded: 0,
        allowPartitionChange: true,
        availableDenominators: [2, 4],
        showNumberLine: true,
      },
      solution: {
        expectedNumerator: 1,
        expectedDenominator: 2,
        acceptEquivalent: true,
      },
      hints: sampleHints,
      explanationKm: "២/៤ = ១/២",
    };

    expect(
      gradeStep(fracStep, {
        type: "fraction-bar-shape",
        numerator: "២",
        denominator: "៤\u200B",
      }).isCorrect
    ).toBe(true);
    expect(
      gradeStep(fracStep, {
        type: "fraction-bar-shape",
        numerator: 1,
        denominator: 4,
      }).isCorrect
    ).toBe(false);

    const shapeStep: FractionBarShapeStep = {
      id: "fb-2",
      type: "fraction-bar-shape",
      stage: "iconic",
      promptKm: "រកត្រីកោណ",
      config: {
        mode: "shape-identify",
        visualShape: "polygon-sides",
        denominator: 1,
        initialShaded: 0,
        allowPartitionChange: false,
        showNumberLine: false,
        shapeOptions: [
          { id: "shape-tri", shape: "triangle", labelKm: "ត្រីកោណ", sides: 3 },
          { id: "shape-sq", shape: "square", labelKm: "ការ៉េ", sides: 4 },
        ],
      },
      solution: { expectedShapeId: "shape-tri", acceptEquivalent: true },
      hints: sampleHints,
      explanationKm: "ត្រីកោណមាន ៣ ជ្រុង",
    };

    expect(
      gradeStep(shapeStep, {
        type: "fraction-bar-shape",
        selectedShapeId: "shape-tri\u200B",
      }).isCorrect
    ).toBe(true);
    expect(
      gradeStep(shapeStep, {
        type: "fraction-bar-shape",
        selectedShapeId: "shape-sq",
      }).isCorrect
    ).toBe(false);
  });

  it("grades pattern-sequence for krama patterns and Khmer/Arabic skip-counting", () => {
    const kramaStep: PatternSequenceStep = {
      id: "ps-1",
      type: "pattern-sequence",
      stage: "concrete",
      promptKm: "លំនាំក្រមា",
      config: {
        variant: "krama-tiles",
        sequence: ["red", "blue", "red", "blue", null, null],
        palette: [
          { id: "red", labelKm: "ក្រហម", glyph: "stripe-red" },
          { id: "blue", labelKm: "ខៀវ", glyph: "stripe-blue" },
        ],
      },
      solution: { expectedSlotValues: ["red", "blue"] },
      hints: sampleHints,
      explanationKm: "ក្រហម-ខៀវ",
    };

    expect(
      gradeStep(kramaStep, {
        type: "pattern-sequence",
        slotValues: ["red\u200B", "blue"],
      }).isCorrect
    ).toBe(true);
    expect(
      gradeStep(kramaStep, {
        type: "pattern-sequence",
        slotValues: ["blue", "red"],
      }).isCorrect
    ).toBe(false);

    const skipStep: PatternSequenceStep = {
      id: "ps-2",
      type: "pattern-sequence",
      stage: "symbolic",
      promptKm: "២, ៤, ៦, ?",
      config: {
        variant: "number-skip",
        sequence: ["2", "4", "6", null],
        palette: [
          { id: "7", labelKm: "៧", glyph: "number" },
          { id: "8", labelKm: "៨", glyph: "number" },
        ],
      },
      solution: { expectedSlotValues: ["8"] },
      hints: sampleHints,
      explanationKm: "៦ + ២ = ៨",
    };

    expect(
      gradeStep(skipStep, {
        type: "pattern-sequence",
        slotValues: ["៨\u200B"],
      }).isCorrect
    ).toBe(true);
  });
});
