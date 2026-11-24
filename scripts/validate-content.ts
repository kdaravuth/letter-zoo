import fs from "node:fs";
import path from "node:path";
import {
  LessonDocumentV1Schema,
  type ActivityStep,
} from "../src/lib/curriculum/schema";
import { DailyPuzzlePackV1Schema } from "../src/lib/curriculum/daily";
import { gradeStep, type StepAnswer } from "../src/lib/math/grader";
import { computeMirrorCells } from "../src/lib/math/geometryDraw";
import { toKhmerDigits } from "../src/lib/khmer/numerals";
import {
  audioProblem,
  collectStepPrompts,
  manifestPath,
  readManifest,
} from "../src/lib/audio/stepAudioManifest";

const PATHS_DIR = path.join(process.cwd(), "content", "paths");
const DAILY_FILE = path.join(process.cwd(), "content", "daily", "puzzles.json");

function collectJsonFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectJsonFiles(full));
    } else if (entry.isFile() && entry.name.endsWith(".json")) {
      files.push(full);
    }
  }
  return files.sort();
}

function buildValidAnswer(step: ActivityStep, useKhmer = false): StepAnswer {
  const fmt = (n: number) => (useKhmer ? `${toKhmerDigits(n)}\u200B` : n);

  switch (step.type) {
    case "counting-stage": {
      const total =
        step.solution.expectedTotal ??
        step.config.initialInFrame + step.config.initialOutside;
      const outside = Math.max(0, total - step.solution.expectedInFrame);
      return {
        type: "counting-stage",
        inFrame: fmt(step.solution.expectedInFrame),
        outside: fmt(outside),
        total: fmt(total),
      };
    }
    case "number-line": {
      const visited: Array<number | string> = [step.config.startValue];
      if (step.solution.requiredIntermediateValue !== undefined) {
        visited.push(fmt(step.solution.requiredIntermediateValue));
      }
      visited.push(fmt(step.solution.expectedValue));
      return {
        type: "number-line",
        value: fmt(step.solution.expectedValue),
        visitedValues: visited,
      };
    }
    case "place-value-blocks": {
      const total = step.solution.expectedTotal;
      const hundreds = Math.floor(total / 100);
      const tens = Math.floor((total % 100) / 10);
      const ones = total % 10;
      return {
        type: "place-value-blocks",
        hundreds: fmt(hundreds),
        tens: fmt(tens),
        ones: fmt(ones),
      };
    }
    case "scenario-choice": {
      if (step.config.variant === "banknote-builder") {
        return {
          type: "scenario-choice",
          sumKhr: fmt(step.solution.expectedSumKhr ?? 0),
        };
      }
      return {
        type: "scenario-choice",
        selectedOptionId: useKhmer
          ? `${step.solution.correctOptionId ?? ""}\u200B`
          : step.solution.correctOptionId,
      };
    }
    case "comparison-balance": {
      if (step.config.mode === "compare-operator") {
        return {
          type: "comparison-balance",
          operator: useKhmer
            ? `${step.solution.expectedOperator ?? ""}\u200B`
            : step.solution.expectedOperator,
        };
      }
      return {
        type: "comparison-balance",
        rightTotal: fmt(
          step.solution.expectedRightTotal ?? step.config.leftValue
        ),
      };
    }
    case "array-groups": {
      const rows = step.solution.expectedRows ?? 1;
      const cols =
        step.solution.expectedCols ??
        Math.max(1, Math.round(step.solution.expectedProduct / rows));
      return {
        type: "array-groups",
        rows: fmt(rows),
        cols: fmt(cols),
      };
    }
    case "fraction-bar-shape": {
      if (step.config.mode === "shape-identify") {
        return {
          type: "fraction-bar-shape",
          selectedShapeId: useKhmer
            ? `${step.solution.expectedShapeId ?? ""}\u200B`
            : step.solution.expectedShapeId,
        };
      }
      return {
        type: "fraction-bar-shape",
        numerator: fmt(step.solution.expectedNumerator ?? 1),
        denominator: fmt(
          step.solution.expectedDenominator ?? step.config.denominator
        ),
      };
    }
    case "pattern-sequence": {
      return {
        type: "pattern-sequence",
        slotValues: step.solution.expectedSlotValues.map((v) =>
          useKhmer ? `${toKhmerDigits(v)}\u200B` : v
        ),
      };
    }
    case "geometry-draw": {
      if (step.config.mode === "dot-connect") {
        const z = useKhmer ? "\u200B" : "";
        if (step.solution.expectedShape === "triangle") {
          return {
            type: "geometry-draw",
            edges: [
              { from: `0,0${z}`, to: "0,2" },
              { from: "0,2", to: "2,1" },
              { from: "2,1", to: "0,0" },
            ],
          };
        }
        // square or rectangle
        return {
          type: "geometry-draw",
          edges: [
            { from: `0,0${z}`, to: "0,2" },
            { from: "0,2", to: "2,2" },
            { from: "2,2", to: "2,0" },
            { from: "2,0", to: "0,0" },
          ],
        };
      }
      if (step.config.mode === "symmetry-mirror") {
        const mirrored = computeMirrorCells(
          step.config.gridCols,
          step.config.templateLeftCells
        );
        return {
          type: "geometry-draw",
          paintedCells: mirrored.map((c) => (useKhmer ? `${c}\u200B` : c)),
        };
      }
      const area = step.solution.expectedArea ?? 4;
      const cells: string[] = [];
      for (let r = 0; r < step.config.gridRows && cells.length < area; r++) {
        for (let c = 0; c < step.config.gridCols && cells.length < area; c++) {
          cells.push(useKhmer ? `${r},${c}\u200B` : `${r},${c}`);
        }
      }
      return { type: "geometry-draw", paintedCells: cells };
    }
    case "clock-time": {
      return {
        type: "clock-time",
        hour: fmt(step.solution.expectedHour),
        minute: fmt(step.solution.expectedMinute),
      };
    }
    case "data-chart": {
      if (step.config.mode === "read-bar") {
        const id = step.solution.expectedBarId ?? step.config.bars[0].id;
        return {
          type: "data-chart",
          selectedBarId: useKhmer ? `\u200B${id}\u200B` : id,
        };
      }
      const vals: Record<string, number | string> = {};
      for (const [k, v] of Object.entries(
        step.solution.expectedBarValues ?? {}
      )) {
        vals[k] = fmt(v);
      }
      return { type: "data-chart", barValues: vals };
    }
  }
}

function buildInvalidAnswers(step: ActivityStep): StepAnswer[] {
  switch (step.type) {
    case "counting-stage": {
      const wrongInFrame =
        step.solution.expectedInFrame > 0
          ? step.solution.expectedInFrame - 1
          : step.solution.expectedInFrame + 1;
      return [{ type: "counting-stage", inFrame: wrongInFrame }];
    }
    case "number-line": {
      const wrongVal =
        step.solution.expectedValue === step.config.min
          ? step.config.max
          : step.config.min;
      const cases: StepAnswer[] = [
        { type: "number-line", value: wrongVal, visitedValues: [wrongVal] },
      ];
      if (step.solution.requiredIntermediateValue !== undefined) {
        cases.push({
          type: "number-line",
          value: step.solution.expectedValue,
          visitedValues: [step.config.startValue, step.solution.expectedValue],
        });
      }
      return cases;
    }
    case "place-value-blocks": {
      return [
        {
          type: "place-value-blocks",
          tens: 0,
          ones: step.solution.expectedTotal + 1,
        },
      ];
    }
    case "scenario-choice": {
      if (step.config.variant === "banknote-builder") {
        return [
          {
            type: "scenario-choice",
            sumKhr: (step.solution.expectedSumKhr ?? 500) + 100,
          },
        ];
      }
      return (step.config.options ?? [])
        .filter((o) => o.id !== step.solution.correctOptionId)
        .map((o) => ({
          type: "scenario-choice" as const,
          selectedOptionId: o.id,
        }));
    }
    case "comparison-balance": {
      if (step.config.mode === "compare-operator") {
        return (["<", "=", ">"] as const)
          .filter((op) => op !== step.solution.expectedOperator)
          .map((op) => ({
            type: "comparison-balance" as const,
            operator: op,
          }));
      }
      const target = step.solution.expectedRightTotal ?? step.config.leftValue;
      return [{ type: "comparison-balance", rightTotal: target + 1 }];
    }
    case "array-groups": {
      return [
        {
          type: "array-groups",
          rows: 1,
          cols: step.solution.expectedProduct + 1,
        },
      ];
    }
    case "fraction-bar-shape": {
      if (step.config.mode === "shape-identify") {
        return (step.config.shapeOptions ?? [])
          .filter((o) => o.id !== step.solution.expectedShapeId)
          .map((o) => ({
            type: "fraction-bar-shape" as const,
            selectedShapeId: o.id,
          }));
      }
      const den = step.solution.expectedDenominator ?? step.config.denominator;
      const wrongNum =
        (step.solution.expectedNumerator ?? 1) === 0 ? 1 : 0;
      return [
        {
          type: "fraction-bar-shape",
          numerator: wrongNum,
          denominator: den,
        },
      ];
    }
    case "pattern-sequence": {
      return [
        {
          type: "pattern-sequence",
          slotValues: step.solution.expectedSlotValues.map(() => "__wrong__"),
        },
      ];
    }
    case "geometry-draw": {
      if (step.config.mode === "dot-connect") {
        return [{ type: "geometry-draw", edges: [{ from: "0,0", to: "0,1" }] }];
      }
      return [{ type: "geometry-draw", paintedCells: [] }];
    }
    case "clock-time": {
      const wrongHour =
        step.solution.expectedHour === 12 ? 1 : step.solution.expectedHour + 1;
      return [
        {
          type: "clock-time",
          hour: wrongHour,
          minute: step.solution.expectedMinute,
        },
      ];
    }
    case "data-chart": {
      if (step.config.mode === "read-bar") {
        const wrong = step.config.bars.find(
          (b) => b.id !== step.solution.expectedBarId
        );
        return [
          {
            type: "data-chart",
            selectedBarId: wrong ? wrong.id : "__wrong__",
          },
        ];
      }
      const wrongVals: Record<string, number> = {};
      for (const [k, v] of Object.entries(
        step.solution.expectedBarValues ?? {}
      )) {
        wrongVals[k] = v === 0 ? 1 : 0;
      }
      return [{ type: "data-chart", barValues: wrongVals }];
    }
  }
}

function main() {
  const files = collectJsonFiles(PATHS_DIR);
  if (files.length === 0) {
    console.error("ERROR: No lesson JSON files found under content/paths/.");
    process.exit(1);
  }

  let errorCount = 0;
  let totalStepsChecked = 0;
  let dailyChecked = 0;
  const seenIds = new Set<string>();
  const seenPrimitives = new Set<string>();

  const validateSingleStep = (label: string, step: ActivityStep) => {
    totalStepsChecked++;
    seenPrimitives.add(step.type);

    const validArabic = gradeStep(step, buildValidAnswer(step, false));
    if (!validArabic.isCorrect) {
      console.error(
        `FAIL [${label} -> ${step.id}]: Declared solution failed grader: ${validArabic.feedbackKm}`
      );
      errorCount++;
    }

    const validKhmer = gradeStep(step, buildValidAnswer(step, true));
    if (!validKhmer.isCorrect) {
      console.error(
        `FAIL [${label} -> ${step.id}]: Khmer/ZWSP normalized solution failed grader: ${validKhmer.feedbackKm}`
      );
      errorCount++;
    }

    for (const badAnswer of buildInvalidAnswers(step)) {
      const res = gradeStep(step, badAnswer);
      if (res.isCorrect || !res.feedbackKm.trim()) {
        console.error(
          `FAIL [${label} -> ${step.id}]: Distractor/invalid answer did not fail cleanly with feedback`
        );
        errorCount++;
      }
    }
  };

  for (const filePath of files) {
    const rel = path.relative(process.cwd(), filePath);
    let rawJson: unknown;
    try {
      rawJson = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch (err) {
      console.error(`FAIL [${rel}]: Invalid JSON syntax`, err);
      errorCount++;
      continue;
    }

    const parsed = LessonDocumentV1Schema.safeParse(rawJson);
    if (!parsed.success) {
      console.error(`FAIL [${rel}]: Schema validation errors:`);
      for (const issue of parsed.error.issues) {
        console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
      }
      errorCount++;
      continue;
    }

    const lesson = parsed.data;
    if (seenIds.has(lesson.id)) {
      console.error(`FAIL [${rel}]: Duplicate lesson id "${lesson.id}"`);
      errorCount++;
    }
    seenIds.add(lesson.id);

    for (const step of lesson.steps) {
      validateSingleStep(rel, step);
    }

    console.log(
      `PASS [${rel}] — ${lesson.titleKm} (${lesson.steps.length} steps verified)`
    );
  }

  // Validate daily visual puzzle pack if present
  if (fs.existsSync(DAILY_FILE)) {
    const relDaily = path.relative(process.cwd(), DAILY_FILE);
    try {
      const rawDaily: unknown = JSON.parse(fs.readFileSync(DAILY_FILE, "utf-8"));
      const parsedDaily = DailyPuzzlePackV1Schema.safeParse(rawDaily);
      if (!parsedDaily.success) {
        console.error(`FAIL [${relDaily}]: Schema validation errors:`);
        for (const issue of parsedDaily.error.issues) {
          console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
        }
        errorCount++;
      } else {
        for (const puzzle of parsedDaily.data.puzzles) {
          dailyChecked++;
          validateSingleStep(`${relDaily}:${puzzle.id}`, puzzle.step);
        }
        console.log(
          `PASS [${relDaily}] — ${dailyChecked} daily visual puzzles verified`
        );
      }
    } catch (err) {
      console.error(`FAIL [${relDaily}]: Invalid JSON syntax`, err);
      errorCount++;
    }
  }

  // Step prompt audio: every step needs a current KiriTTS "Sota" clip.
  {
    const manifest = readManifest(manifestPath(process.cwd()));
    const byId = new Map(manifest.entries.map((e) => [e.id, e]));
    let audioErrors = 0;
    for (const step of collectStepPrompts(process.cwd())) {
      const file = path.join(process.cwd(), "public", step.audioUrl.replace(/^\//, ""));
      const problem = audioProblem(step, byId.get(step.id), file);
      if (problem) {
        console.error(`FAIL [audio -> ${step.id}]: ${problem} (run npm run audio:manifest)`);
        audioErrors++;
      }
    }
    if (audioErrors === 0) {
      console.log(`PASS [audio] — ${manifest.entries.length} step clips voiced by Sota and current`);
    }
    errorCount += audioErrors;
  }

  console.log(
    `\nValidated ${files.length} lessons + ${dailyChecked} daily puzzles (${totalStepsChecked} total steps, ${seenPrimitives.size} distinct primitives). Errors: ${errorCount}`
  );

  if (errorCount > 0) {
    process.exit(1);
  }
}

main();
