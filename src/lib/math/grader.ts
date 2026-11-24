import type { ActivityStep } from "@/lib/curriculum/schema";
import { normalizeNumericInput, stripZwsp } from "@/lib/khmer/numerals";
import {
  analyzeDrawnPolygon,
  checkSymmetryMirror,
  type DrawnEdge,
} from "@/lib/math/geometryDraw";
import { checkClockMatch, checkDataChartBars } from "@/lib/math/clockAndChart";

export type StepAnswer =
  | {
      type: "counting-stage";
      inFrame: number | string;
      outside?: number | string;
      total?: number | string;
    }
  | {
      type: "number-line";
      value: number | string;
      visitedValues?: Array<number | string>;
    }
  | {
      type: "place-value-blocks";
      hundreds?: number | string;
      tens?: number | string;
      ones?: number | string;
      total?: number | string;
    }
  | {
      type: "scenario-choice";
      selectedOptionId?: string;
      selectedNotesKhr?: Array<number | string>;
      sumKhr?: number | string;
    }
  | {
      type: "comparison-balance";
      operator?: string;
      rightTotal?: number | string;
    }
  | {
      type: "array-groups";
      rows: number | string;
      cols: number | string;
    }
  | {
      type: "fraction-bar-shape";
      numerator?: number | string;
      denominator?: number | string;
      selectedShapeId?: string;
    }
  | {
      type: "pattern-sequence";
      slotValues: Array<string | null>;
    }
  | {
      type: "geometry-draw";
      edges?: DrawnEdge[];
      paintedCells?: string[];
    }
  | {
      type: "clock-time";
      hour: number | string;
      minute: number | string;
    }
  | {
      type: "data-chart";
      barValues?: Record<string, number | string>;
      selectedBarId?: string;
    };

export interface GradeDiscrepancy {
  kind:
    | "count-mismatch"
    | "total-mismatch"
    | "missing-intermediate"
    | "value-mismatch"
    | "needs-regrouping"
    | "wrong-option"
    | "banknote-mismatch"
    | "operator-mismatch"
    | "balance-mismatch"
    | "array-mismatch"
    | "fraction-mismatch"
    | "shape-mismatch"
    | "pattern-mismatch"
    | "drawing-mismatch"
    | "time-mismatch"
    | "chart-mismatch"
    | "invalid-input";
  expected?: number;
  actual?: number;
  missingIntermediate?: number;
  needsRegrouping?: boolean;
}

export interface GradeResult {
  isCorrect: boolean;
  feedbackKm: string;
  discrepancy?: GradeDiscrepancy;
}

/**
 * Pure deterministic grader shared across offline client, build-time validator,
 * and server verification. Normalizes Khmer/Arabic numerals and strips U+200B ZWSP.
 */
export function gradeStep(step: ActivityStep, answer: StepAnswer): GradeResult {
  if (step.type !== answer.type) {
    return {
      isCorrect: false,
      feedbackKm: "សូមសាកល្បងម្ដងទៀត ដោយប្រើឧបករណ៍លើអេក្រង់ណា៎!",
      discrepancy: { kind: "invalid-input" },
    };
  }

  switch (step.type) {
    case "counting-stage": {
      const ans = answer as Extract<StepAnswer, { type: "counting-stage" }>;
      const inFrame = normalizeNumericInput(ans.inFrame);
      const outside =
        ans.outside !== undefined ? normalizeNumericInput(ans.outside) : null;
      const explicitTotal =
        ans.total !== undefined ? normalizeNumericInput(ans.total) : null;

      if (inFrame === null || inFrame < 0) {
        return {
          isCorrect: false,
          feedbackKm: "សូមរំកិល ឬប៉ះវត្ថុដាក់ចូលប្រអប់សិនណា៎!",
          discrepancy: { kind: "invalid-input" },
        };
      }

      const computedTotal =
        explicitTotal !== null
          ? explicitTotal
          : outside !== null
            ? inFrame + outside
            : inFrame;

      const inFrameMatches = inFrame === step.solution.expectedInFrame;
      const totalMatches =
        step.solution.expectedTotal === undefined ||
        computedTotal === step.solution.expectedTotal;

      if (inFrameMatches && totalMatches) {
        return {
          isCorrect: true,
          feedbackKm: "ល្អណាស់! ចម្លើយរបស់អ្នកត្រឹមត្រូវហើយ!",
        };
      }

      if (!inFrameMatches) {
        const directionKm =
          inFrame < step.solution.expectedInFrame
            ? "ជិតត្រូវហើយ! ប្រអប់នៅខ្វះបន្តិចទៀត សាករាប់មើលប្រឡោះទំនេរម្ដងទៀតណា៎។"
            : "ជិតត្រូវហើយ! ចំនួនក្នុងប្រអប់លើសបន្តិចហើយ សាកដកចេញវិញបន្តិចណា៎។";
        return {
          isCorrect: false,
          feedbackKm: directionKm,
          discrepancy: {
            kind: "count-mismatch",
            expected: step.solution.expectedInFrame,
            actual: inFrame,
          },
        };
      }

      return {
        isCorrect: false,
        feedbackKm: "ពិនិត្យចំនួនសរុបទាំងក្នុង និងក្រៅប្រអប់ម្ដងទៀតណា៎!",
        discrepancy: {
          kind: "total-mismatch",
          expected: step.solution.expectedTotal,
          actual: computedTotal,
        },
      };
    }

    case "number-line": {
      const ans = answer as Extract<StepAnswer, { type: "number-line" }>;
      const actualValue = normalizeNumericInput(ans.value);
      if (actualValue === null) {
        return {
          isCorrect: false,
          feedbackKm: "សូមប៉ះ ឬអូសសញ្ញាទៅលើចំណុចមួយនៅលើបន្ទាត់ចំនួនណា៎!",
          discrepancy: { kind: "invalid-input" },
        };
      }

      const tolerance = step.solution.tolerance ?? 0;
      const valueMatches =
        Math.abs(actualValue - step.solution.expectedValue) <= tolerance + 1e-9;

      const visited = (ans.visitedValues ?? [])
        .map((v) => normalizeNumericInput(v))
        .filter((v): v is number => v !== null);

      const requiredMid = step.solution.requiredIntermediateValue;
      const hasIntermediate =
        requiredMid === undefined ||
        visited.some((v) => Math.abs(v - requiredMid) <= tolerance + 1e-9);

      if (valueMatches && hasIntermediate) {
        return {
          isCorrect: true,
          feedbackKm: "ពូកែណាស់! ការលោតលើបន្ទាត់ចំនួនត្រឹមត្រូវហើយ!",
        };
      }

      if (valueMatches && !hasIntermediate && requiredMid !== undefined) {
        return {
          isCorrect: false,
          feedbackKm:
            "លេខចុងក្រោយត្រូវហើយ ប៉ុន្តែសាកឈប់សម្រាកនៅគោលកណ្ដាលសិនណា៎ ដើម្បីឃើញវិធីបង្គ្រប់ ១០!",
          discrepancy: {
            kind: "missing-intermediate",
            expected: step.solution.expectedValue,
            actual: actualValue,
            missingIntermediate: requiredMid,
          },
        };
      }

      const hintDirection =
        actualValue < step.solution.expectedValue
          ? "ជិតដល់ហើយ! សាកលោតទៅខាងស្ដាំបន្ថែមបន្តិចទៀតណា៎។"
          : "ហួសបន្តិចហើយ! សាកលោតត្រឡប់មកខាងឆ្វេងវិញបន្តិចណា៎។";

      return {
        isCorrect: false,
        feedbackKm: hintDirection,
        discrepancy: {
          kind: "value-mismatch",
          expected: step.solution.expectedValue,
          actual: actualValue,
        },
      };
    }

    case "place-value-blocks": {
      const ans = answer as Extract<StepAnswer, { type: "place-value-blocks" }>;
      const hundreds =
        ans.hundreds !== undefined
          ? (normalizeNumericInput(ans.hundreds) ?? 0)
          : 0;
      const tens =
        ans.tens !== undefined ? (normalizeNumericInput(ans.tens) ?? 0) : 0;
      const ones =
        ans.ones !== undefined ? (normalizeNumericInput(ans.ones) ?? 0) : 0;

      const explicitTotal =
        ans.total !== undefined ? normalizeNumericInput(ans.total) : null;
      const computedTotal =
        explicitTotal !== null
          ? explicitTotal
          : hundreds * 100 + tens * 10 + ones;

      if (
        !Number.isFinite(computedTotal) ||
        hundreds < 0 ||
        tens < 0 ||
        ones < 0
      ) {
        return {
          isCorrect: false,
          feedbackKm: "សូមរៀបចំដុំគូបខ្ទង់រាយ និងដំបងខ្ទង់ដប់ម្ដងទៀតណា៎!",
          discrepancy: { kind: "invalid-input" },
        };
      }

      const totalMatches = computedTotal === step.solution.expectedTotal;
      const isCanonical = ones < 10 && tens < 10;

      if (totalMatches && (!step.solution.requireCanonical || isCanonical)) {
        return {
          isCorrect: true,
          feedbackKm: "អស្ចារ្យ! អ្នករៀបចំតម្លៃលេខតាមខ្ទង់បានត្រឹមត្រូវហើយ!",
        };
      }

      if (totalMatches && step.solution.requireCanonical && !isCanonical) {
        return {
          isCorrect: false,
          feedbackKm:
            "ចំនួនសរុបត្រូវហើយ! ប៉ុន្តែសាកចុច «ផ្ដុំ ១០» ដើម្បីប្ដូរដុំរាយ ១០ ជាដំបងដប់ ១ ណា៎!",
          discrepancy: {
            kind: "needs-regrouping",
            expected: step.solution.expectedTotal,
            actual: computedTotal,
            needsRegrouping: true,
          },
        };
      }

      return {
        isCorrect: false,
        feedbackKm:
          computedTotal < step.solution.expectedTotal
            ? "ជិតត្រូវហើយ! តម្លៃសរុបនៅតិចជាងគោលដៅបន្តិច សាកបន្ថែមដុំខ្ទង់ដប់ ឬខ្ទង់រាយទៀតណា៎។"
            : "ជិតត្រូវហើយ! តម្លៃសរុបច្រើនជាងគោលដៅបន្តិច សាកដកចេញខ្លះវិញណា៎។",
        discrepancy: {
          kind: "value-mismatch",
          expected: step.solution.expectedTotal,
          actual: computedTotal,
        },
      };
    }

    case "scenario-choice": {
      const ans = answer as Extract<StepAnswer, { type: "scenario-choice" }>;

      if (step.config.variant === "banknote-builder") {
        const expectedSum = step.solution.expectedSumKhr;
        if (expectedSum === undefined) {
          return {
            isCorrect: false,
            feedbackKm: "មិនអាចផ្ទៀងផ្ទាត់ចំនួនប្រាក់បានទេ។",
            discrepancy: { kind: "invalid-input" },
          };
        }

        let actualSum: number | null = null;
        if (ans.sumKhr !== undefined) {
          actualSum = normalizeNumericInput(ans.sumKhr);
        } else if (ans.selectedNotesKhr) {
          let sum = 0;
          for (const note of ans.selectedNotesKhr) {
            const parsed = normalizeNumericInput(note);
            if (parsed === null || parsed < 0) {
              return {
                isCorrect: false,
                feedbackKm: "សូមជ្រើសរើសក្រដាសប្រាក់រៀលម្ដងទៀតណា៎!",
                discrepancy: { kind: "invalid-input" },
              };
            }
            sum += parsed;
          }
          actualSum = sum;
        }

        if (actualSum === null) {
          return {
            isCorrect: false,
            feedbackKm: "សូមប៉ះក្រដាសប្រាក់រៀលដាក់លើថាសសិនណា៎!",
            discrepancy: { kind: "invalid-input" },
          };
        }

        if (actualSum === expectedSum) {
          return {
            isCorrect: true,
            feedbackKm: "ល្អណាស់! ចំនួនប្រាក់រៀលគ្រប់ត្រឹមត្រូវហើយ!",
          };
        }

        return {
          isCorrect: false,
          feedbackKm:
            actualSum < expectedSum
              ? "ប្រាក់លើថាសនៅខ្វះបន្តិចទៀត សាកបន្ថែមក្រដាសប្រាក់ទៀតណា៎!"
              : "ប្រាក់លើថាសលើសបន្តិចហើយ សាកដកក្រដាសប្រាក់ចេញវិញខ្លះណា៎!",
          discrepancy: {
            kind: "banknote-mismatch",
            expected: expectedSum,
            actual: actualSum,
          },
        };
      }

      const cleanSelected = ans.selectedOptionId
        ? stripZwsp(ans.selectedOptionId).trim()
        : "";
      const cleanExpected = step.solution.correctOptionId
        ? stripZwsp(step.solution.correctOptionId).trim()
        : "";

      if (!cleanSelected) {
        return {
          isCorrect: false,
          feedbackKm: "សូមជ្រើសរើសចម្លើយមួយសិនណា៎!",
          discrepancy: { kind: "invalid-input" },
        };
      }

      const chosenOption = step.config.options?.find(
        (opt) => stripZwsp(opt.id).trim() === cleanSelected
      );

      if (cleanSelected === cleanExpected) {
        return {
          isCorrect: true,
          feedbackKm:
            chosenOption?.diagnosticFeedbackKm ??
            "ល្អណាស់! ការជ្រើសរើសរបស់អ្នកត្រឹមត្រូវហើយ!",
        };
      }

      return {
        isCorrect: false,
        feedbackKm:
          chosenOption?.diagnosticFeedbackKm ??
          "ជិតត្រូវហើយ! សាកពិនិត្យមើលជម្រើសផ្សេងទៀត ឬសុំជំនួយណា៎។",
        discrepancy: { kind: "wrong-option" },
      };
    }

    case "comparison-balance": {
      const ans = answer as Extract<StepAnswer, { type: "comparison-balance" }>;

      if (step.config.mode === "compare-operator") {
        const chosenOp = ans.operator ? stripZwsp(ans.operator).trim() : "";
        const expectedOp = step.solution.expectedOperator;

        if (!chosenOp || !["<", ">", "="].includes(chosenOp)) {
          return {
            isCorrect: false,
            feedbackKm: "សូមជ្រើសរើសសញ្ញា <, > ឬ = ជាមុនសិនណា៎!",
            discrepancy: { kind: "invalid-input" },
          };
        }

        if (chosenOp === expectedOp) {
          return {
            isCorrect: true,
            feedbackKm: "ពូកែណាស់! ការប្រៀបធៀបរបស់អ្នកត្រឹមត្រូវហើយ!",
          };
        }

        return {
          isCorrect: false,
          feedbackKm:
            "ជិតត្រូវហើយ! សាកប្រៀបធៀបខាងឆ្វេង និងខាងស្ដាំម្ដងទៀត — មាត់សញ្ញាតែងតែបើកទៅរកចំនួនធំជាង!",
          discrepancy: { kind: "operator-mismatch" },
        };
      }

      // balance-equation mode
      const rightTotal =
        ans.rightTotal !== undefined
          ? normalizeNumericInput(ans.rightTotal)
          : null;
      const expectedRight =
        step.solution.expectedRightTotal ?? step.config.leftValue;

      if (rightTotal === null) {
        return {
          isCorrect: false,
          feedbackKm: "សូមបន្ថែមទម្ងន់លើជញ្ជីងខាងស្ដាំឱ្យស្មើគ្នាសិនណា៎!",
          discrepancy: { kind: "invalid-input" },
        };
      }

      if (rightTotal === expectedRight) {
        return {
          isCorrect: true,
          feedbackKm: "ល្អណាស់! ជញ្ជីងទាំងពីរខាងមានតុល្យភាពស្មើគ្នាហើយ!",
        };
      }

      return {
        isCorrect: false,
        feedbackKm:
          rightTotal < expectedRight
            ? "ខាងស្ដាំនៅស្រាលជាងខាងឆ្វេង សាកបន្ថែមទម្ងន់ទៀតណា៎!"
            : "ខាងស្ដាំធ្ងន់ជាងខាងឆ្វេងបន្តិចហើយ សាកដកចេញខ្លះវិញណា៎!",
        discrepancy: {
          kind: "balance-mismatch",
          expected: expectedRight,
          actual: rightTotal,
        },
      };
    }

    case "array-groups": {
      const ans = answer as Extract<StepAnswer, { type: "array-groups" }>;
      const rows = normalizeNumericInput(ans.rows);
      const cols = normalizeNumericInput(ans.cols);

      if (rows === null || cols === null || rows <= 0 || cols <= 0) {
        return {
          isCorrect: false,
          feedbackKm: "សូមរៀបចំចំនួនជួរ និងចំនួនវត្ថុក្នុងជួរនីមួយៗសិនណា៎!",
          discrepancy: { kind: "invalid-input" },
        };
      }

      const product = rows * cols;
      const productMatches = product === step.solution.expectedProduct;

      let dimsMatch = true;
      if (
        step.solution.expectedRows !== undefined &&
        step.solution.expectedCols !== undefined
      ) {
        const exact =
          rows === step.solution.expectedRows &&
          cols === step.solution.expectedCols;
        const swapped =
          step.solution.allowCommutative &&
          rows === step.solution.expectedCols &&
          cols === step.solution.expectedRows;
        dimsMatch = exact || swapped;
      }

      if (productMatches && dimsMatch) {
        return {
          isCorrect: true,
          feedbackKm: "អស្ចារ្យ! ការរៀបចំក្រុមស្មើៗគ្នារបស់អ្នកត្រឹមត្រូវហើយ!",
        };
      }

      return {
        isCorrect: false,
        feedbackKm:
          product < step.solution.expectedProduct
            ? "ចំនួនសរុបនៅតិចជាងគោលដៅបន្តិច សាកបន្ថែមជួរ ឬវត្ថុក្នុងជួរទៀតណា៎!"
            : product > step.solution.expectedProduct
              ? "ចំនួនសរុបលើសគោលដៅបន្តិចហើយ សាកបន្ថយជួរ ឬជួរឈរខ្លះវិញណា៎!"
              : "ចំនួនសរុបត្រូវហើយ ប៉ុន្តែសាកពិនិត្យចំនួនជួរ និងវត្ថុក្នុងជួរនីមួយៗម្ដងទៀតណា៎!",
        discrepancy: {
          kind: "array-mismatch",
          expected: step.solution.expectedProduct,
          actual: product,
        },
      };
    }

    case "fraction-bar-shape": {
      const ans = answer as Extract<StepAnswer, { type: "fraction-bar-shape" }>;

      if (step.config.mode === "shape-identify") {
        const selected = ans.selectedShapeId
          ? stripZwsp(ans.selectedShapeId).trim()
          : "";
        const expected = step.solution.expectedShapeId
          ? stripZwsp(step.solution.expectedShapeId).trim()
          : "";

        if (!selected) {
          return {
            isCorrect: false,
            feedbackKm: "សូមប៉ះជ្រើសរើសរូបធរណីមាត្រមួយសិនណា៎!",
            discrepancy: { kind: "invalid-input" },
          };
        }

        if (selected === expected) {
          return {
            isCorrect: true,
            feedbackKm: "ពូកែណាស់! អ្នកស្គាល់រូបធរណីមាត្រនេះច្បាស់ណាស់!",
          };
        }

        return {
          isCorrect: false,
          feedbackKm:
            "ជិតត្រូវហើយ! សាករាប់ចំនួនជ្រុងនៃរូបនីមួយៗម្ដងទៀតណា៎។",
          discrepancy: { kind: "shape-mismatch" },
        };
      }

      // shade-fraction mode
      const num =
        ans.numerator !== undefined
          ? normalizeNumericInput(ans.numerator)
          : null;
      const den =
        ans.denominator !== undefined
          ? normalizeNumericInput(ans.denominator)
          : step.config.denominator;

      const expNum = step.solution.expectedNumerator;
      const expDen = step.solution.expectedDenominator ?? step.config.denominator;

      if (num === null || den === null || den <= 0 || expNum === undefined) {
        return {
          isCorrect: false,
          feedbackKm: "សូមប៉ះផ្នែកនៃរបារ ដើម្បីលាបពណ៌ចំណែកប្រភាគសិនណា៎!",
          discrepancy: { kind: "invalid-input" },
        };
      }

      const exactMatch = num === expNum && den === expDen;
      const equivalentMatch =
        step.solution.acceptEquivalent && num * expDen === expNum * den;

      if (exactMatch || equivalentMatch) {
        return {
          isCorrect: true,
          feedbackKm: "ល្អណាស់! ចំណែកប្រភាគដែលអ្នកលាបពណ៌ត្រឹមត្រូវហើយ!",
        };
      }

      const actualRatio = num / den;
      const expectedRatio = expNum / expDen;

      return {
        isCorrect: false,
        feedbackKm:
          actualRatio < expectedRatio
            ? "ចំណែកដែលលាបពណ៌នៅតិចបន្តិច សាកលាបពណ៌បន្ថែមទៀតណា៎!"
            : "ចំណែកដែលលាបពណ៌ច្រើនជាងគោលដៅបន្តិចហើយ សាកប៉ះលុបពណ៌ខ្លះវិញណា៎!",
        discrepancy: {
          kind: "fraction-mismatch",
          expected: expNum,
          actual: num,
        },
      };
    }

    case "pattern-sequence": {
      const ans = answer as Extract<StepAnswer, { type: "pattern-sequence" }>;
      const expected = step.solution.expectedSlotValues.map((v) =>
        stripZwsp(v).trim()
      );
      const actual = (ans.slotValues ?? []).map((v) =>
        v === null ? "" : stripZwsp(v).trim()
      );

      if (actual.length !== expected.length || actual.some((v) => !v)) {
        return {
          isCorrect: false,
          feedbackKm: "សូមបំពេញប្រឡោះទំនេរទាំងអស់ក្នុងលំនាំសិនណា៎!",
          discrepancy: { kind: "invalid-input" },
        };
      }

      const allMatch = expected.every((expVal, idx) => {
        if (actual[idx] === expVal) return true;
        // Also accept Khmer/Arabic numeric equivalence for number-skip patterns
        const expNum = normalizeNumericInput(expVal);
        const actNum = normalizeNumericInput(actual[idx]);
        return expNum !== null && actNum !== null && expNum === actNum;
      });

      if (allMatch) {
        return {
          isCorrect: true,
          feedbackKm: "អស្ចារ្យ! អ្នករកឃើញក្បួនលំនាំបានយ៉ាងត្រឹមត្រូវ!",
        };
      }

      return {
        isCorrect: false,
        feedbackKm:
          "ជិតត្រូវហើយ! សាកមើលលំនាំដែលកើតឡើងដដែលៗពីឆ្វេងទៅស្ដាំម្ដងទៀតណា៎។",
        discrepancy: { kind: "pattern-mismatch" },
      };
    }

    case "geometry-draw": {
      const ans = answer as Extract<StepAnswer, { type: "geometry-draw" }>;

      if (step.config.mode === "dot-connect") {
        const cleanEdges = (ans.edges ?? []).map((e) => ({
          from: stripZwsp(e.from).trim(),
          to: stripZwsp(e.to).trim(),
        }));
        const poly = analyzeDrawnPolygon(cleanEdges);
        const expected = step.solution.expectedShape;

        if (!poly.isClosed) {
          return {
            isCorrect: false,
            feedbackKm:
              "រូបនៅមិនទាន់បិទជិតទេ! សូមភ្ជាប់ចំណុចចុងក្រោយត្រឡប់ទៅចំណុចដំបូងវិញណា៎។",
            discrepancy: { kind: "drawing-mismatch" },
          };
        }

        const matched =
          expected === "triangle"
            ? poly.kind === "triangle"
            : expected === "square"
              ? poly.kind === "square"
              : expected === "rectangle"
                ? poly.kind === "rectangle" || poly.kind === "square"
                : poly.isClosed;

        if (matched) {
          return {
            isCorrect: true,
            feedbackKm: "អស្ចារ្យណាស់! អ្នកគូររូបធរណីមាត្របានស្អាត និងត្រឹមត្រូវ!",
          };
        }

        return {
          isCorrect: false,
          feedbackKm:
            expected === "triangle"
              ? "សាកគូររូបបិទជិតដែលមាន ៣ ជ្រុង (ត្រីកោណ) ណា៎!"
              : expected === "square"
                ? "សាកគូររូបការ៉េដែលមាន ៤ ជ្រុងស្មើគ្នា និង ៤ មុំកែងណា៎!"
                : "សាកគូររូបចតុកោណកែងដែលមាន ៤ ជ្រុង និង ៤ មុំកែងណា៎!",
          discrepancy: { kind: "drawing-mismatch" },
        };
      }

      if (step.config.mode === "symmetry-mirror") {
        const cleanPainted = (ans.paintedCells ?? []).map((c) =>
          stripZwsp(c).trim()
        );
        const check = checkSymmetryMirror(
          step.config.gridCols,
          step.config.templateLeftCells,
          cleanPainted
        );

        if (check.isMatch) {
          return {
            isCorrect: true,
            feedbackKm: "ពូកែណាស់! រូបឆ្លុះស៊ីមេទ្រីរបស់អ្នកស្មើឥតខ្ចោះ!",
          };
        }

        return {
          isCorrect: false,
          feedbackKm:
            check.extraCount > 0
              ? "ជិតត្រូវហើយ! មានប្រឡោះខ្លះមិនទាន់ឆ្លុះស្មើនឹងខាងឆ្វេង សាកប៉ះលុបពណ៌ចេញវិញបន្តិចណា៎។"
              : "ជិតត្រូវហើយ! នៅខ្វះប្រឡោះពណ៌ខ្លះនៅខាងស្ដាំ សាកមើលឆ្លុះពីអ័ក្សស៊ីមេទ្រីម្ដងទៀតណា៎!",
          discrepancy: { kind: "drawing-mismatch" },
        };
      }

      // area-paint mode
      const cleanPainted = Array.from(
        new Set((ans.paintedCells ?? []).map((c) => stripZwsp(c).trim()))
      ).filter(Boolean);
      const expectedArea = step.solution.expectedArea ?? 4;

      if (cleanPainted.length === expectedArea) {
        return {
          isCorrect: true,
          feedbackKm: "ល្អណាស់! ផ្ទៃក្រឡានៃរូបដែលអ្នកគូរគ្រប់ត្រឹមត្រូវហើយ!",
        };
      }

      return {
        isCorrect: false,
        feedbackKm:
          cleanPainted.length < expectedArea
            ? "ផ្ទៃក្រឡានៅតិចជាងគោលដៅបន្តិច សាកលាបពណ៌បន្ថែមប្រឡោះទៀតណា៎!"
            : "ផ្ទៃក្រឡាលើសគោលដៅបន្តិចហើយ សាកប៉ះលុបពណ៌ចេញខ្លះវិញណា៎!",
        discrepancy: {
          kind: "drawing-mismatch",
          expected: expectedArea,
          actual: cleanPainted.length,
        },
      };
    }

    case "clock-time": {
      const ans = answer as Extract<StepAnswer, { type: "clock-time" }>;
      const check = checkClockMatch(
        step.solution.expectedHour,
        step.solution.expectedMinute,
        ans.hour,
        ans.minute
      );
      if (check.isMatch) {
        return {
          isCorrect: true,
          feedbackKm: "ពូកែណាស់! អ្នកកំណត់ម៉ោងលើនាឡិកាបានត្រឹមត្រូវបេះបិទ!",
        };
      }
      return {
        isCorrect: false,
        feedbackKm: !check.hourMatch
          ? "សាកពិនិត្យទ្រនិចខ្លី (ម៉ោង) ម្ដងទៀតណា៎!"
          : "ទ្រនិចម៉ោងត្រូវហើយ! សាកបង្វិលទ្រនិចវែង (នាទី) ឱ្យចំម៉ោងគោលដៅណា៎!",
        discrepancy: {
          kind: "time-mismatch",
          expected: step.solution.expectedHour * 60 + step.solution.expectedMinute,
          actual:
            check.actualHour !== null && check.actualMinute !== null
              ? check.actualHour * 60 + check.actualMinute
              : undefined,
        },
      };
    }

    case "data-chart": {
      const ans = answer as Extract<StepAnswer, { type: "data-chart" }>;
      if (step.config.mode === "read-bar") {
        const chosen = stripZwsp(ans.selectedBarId ?? "").trim();
        const expected = stripZwsp(step.solution.expectedBarId ?? "").trim();
        if (chosen && chosen === expected) {
          return {
            isCorrect: true,
            feedbackKm: "ត្រឹមត្រូវណាស់! អ្នកអានដ្យាក្រាមសសរបានយ៉ាងច្បាស់!",
          };
        }
        return {
          isCorrect: false,
          feedbackKm:
            "សាកប្រៀបធៀបកម្ពស់សសរនីមួយៗលើដ្យាក្រាម ហើយជ្រើសរើសម្ដងទៀតណា៎!",
          discrepancy: { kind: "chart-mismatch" },
        };
      }

      const expectedMap = step.solution.expectedBarValues ?? {};
      const actualMap = ans.barValues ?? {};
      const check = checkDataChartBars(expectedMap, actualMap);
      if (check.isMatch) {
        return {
          isCorrect: true,
          feedbackKm: "អស្ចារ្យ! ដ្យាក្រាមសសរដែលអ្នកសង់ត្រូវតាមទិន្នន័យគ្រប់ជួរឈរ!",
        };
      }
      return {
        isCorrect: false,
        feedbackKm:
          "ជិតត្រូវហើយ! សាកពិនិត្យកម្ពស់សសរនីមួយៗឱ្យស្មើនឹងចំនួនក្នុងសំណួរម្ដងទៀតណា៎!",
        discrepancy: { kind: "chart-mismatch" },
      };
    }
  }
}
