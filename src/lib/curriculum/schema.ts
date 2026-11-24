import { z } from "zod";

export const ConcretenessStageSchema = z.enum([
  "concrete",
  "iconic",
  "symbolic",
]);

export const HintTierSchema = z.object({
  tier: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  kind: z.enum(["visual-cue", "strategy-nudge", "worked-step"]),
  textKm: z.string().min(4).max(180),
  highlightTargetId: z.string().optional(),
});

const HintsArraySchema = z
  .array(HintTierSchema)
  .length(3)
  .refine(
    (hints) =>
      hints[0].tier === 1 &&
      hints[0].kind === "visual-cue" &&
      hints[1].tier === 2 &&
      hints[1].kind === "strategy-nudge" &&
      hints[2].tier === 3 &&
      hints[2].kind === "worked-step",
    {
      message:
        "Hints must contain 3 ordered tiers: 1 (visual-cue), 2 (strategy-nudge), 3 (worked-step)",
    }
  );

export const CountingStageStepSchema = z.object({
  id: z.string().min(1),
  type: z.literal("counting-stage"),
  stage: ConcretenessStageSchema,
  promptKm: z.string().min(4).max(180),
  audioUrl: z.string().optional(),
  config: z.object({
    frameSize: z.union([z.literal(5), z.literal(10), z.literal(20)]),
    tokenTheme: z.enum(["mango", "orange", "lotus", "dot", "cube"]),
    initialInFrame: z.number().int().min(0),
    initialOutside: z.number().int().min(0),
    allowFreeExplore: z.boolean().default(false),
    showLiveCount: z.boolean().default(true),
    requireFullTenBundle: z.boolean().default(false),
  }),
  solution: z.object({
    expectedInFrame: z.number().int().min(0),
    expectedTotal: z.number().int().min(0).optional(),
  }),
  hints: HintsArraySchema,
  explanationKm: z.string().min(4).max(240),
});

export const NumberLineStepSchema = z.object({
  id: z.string().min(1),
  type: z.literal("number-line"),
  stage: ConcretenessStageSchema,
  promptKm: z.string().min(4).max(180),
  audioUrl: z.string().optional(),
  config: z.object({
    min: z.number(),
    max: z.number(),
    step: z.number().positive(),
    startValue: z.number(),
    showJumps: z.boolean().default(true),
    hiddenTickValues: z.array(z.number()).default([]),
    theme: z.enum(["default", "frog-lotus"]).default("default"),
  }),
  solution: z.object({
    expectedValue: z.number(),
    requiredIntermediateValue: z.number().optional(),
    tolerance: z.number().nonnegative().default(0),
  }),
  hints: HintsArraySchema,
  explanationKm: z.string().min(4).max(240),
});

export const PlaceValueBlocksStepSchema = z.object({
  id: z.string().min(1),
  type: z.literal("place-value-blocks"),
  stage: ConcretenessStageSchema,
  promptKm: z.string().min(4).max(180),
  audioUrl: z.string().optional(),
  config: z.object({
    initialHundreds: z.number().int().min(0).default(0),
    initialTens: z.number().int().min(0).default(0),
    initialOnes: z.number().int().min(0).default(0),
    allowHundreds: z.boolean().default(false),
    allowBundle: z.boolean().default(true),
    allowUnbundle: z.boolean().default(true),
    showLiveTotal: z.boolean().default(true),
  }),
  solution: z.object({
    expectedTotal: z.number().int().min(0),
    requireCanonical: z.boolean().default(false),
  }),
  hints: HintsArraySchema,
  explanationKm: z.string().min(4).max(240),
});

export const ScenarioChoiceOptionSchema = z.object({
  id: z.string().min(1),
  labelKm: z.string().min(1).max(120),
  diagnosticFeedbackKm: z.string().max(180).optional(),
});

export const ScenarioChoiceStepSchema = z.object({
  id: z.string().min(1),
  type: z.literal("scenario-choice"),
  stage: ConcretenessStageSchema,
  promptKm: z.string().min(4).max(180),
  audioUrl: z.string().optional(),
  config: z.object({
    variant: z.enum([
      "single-choice",
      "banknote-builder",
      "worked-error-check",
    ]),
    visualCue: z.string().optional(),
    workedExampleKm: z.string().max(260).optional(),
    options: z.array(ScenarioChoiceOptionSchema).min(2).max(4).optional(),
    availableNotesKhr: z.array(z.number().int().positive()).optional(),
  }),
  solution: z.object({
    correctOptionId: z.string().optional(),
    expectedSumKhr: z.number().int().positive().optional(),
  }),
  hints: HintsArraySchema,
  explanationKm: z.string().min(4).max(240),
});

export const ComparisonBalanceStepSchema = z.object({
  id: z.string().min(1),
  type: z.literal("comparison-balance"),
  stage: ConcretenessStageSchema,
  promptKm: z.string().min(4).max(180),
  audioUrl: z.string().optional(),
  config: z.object({
    mode: z.enum(["compare-operator", "balance-equation"]),
    visualStyle: z.enum(["scale-oranges", "bars", "symbolic"]).default("scale-oranges"),
    leftValue: z.number().int().min(0),
    rightValue: z.number().int().min(0),
    leftLabelKm: z.string().max(60).optional(),
    rightLabelKm: z.string().max(60).optional(),
    availableTiles: z.array(z.number().int().positive()).optional(),
  }),
  solution: z.object({
    expectedOperator: z.enum(["<", ">", "="]).optional(),
    expectedRightTotal: z.number().int().min(0).optional(),
  }),
  hints: HintsArraySchema,
  explanationKm: z.string().min(4).max(240),
});

export const ArrayGroupsStepSchema = z.object({
  id: z.string().min(1),
  type: z.literal("array-groups"),
  stage: ConcretenessStageSchema,
  promptKm: z.string().min(4).max(180),
  audioUrl: z.string().optional(),
  config: z.object({
    mode: z.enum(["equal-groups", "rectangular-grid"]),
    itemTheme: z.enum(["mango", "orange", "dot", "tile"]).default("orange"),
    maxRows: z.number().int().min(1).max(6).default(5),
    maxCols: z.number().int().min(1).max(6).default(6),
    initialRows: z.number().int().min(1).max(6).default(1),
    initialCols: z.number().int().min(1).max(6).default(1),
    showProduct: z.boolean().default(true),
  }),
  solution: z.object({
    expectedRows: z.number().int().positive().optional(),
    expectedCols: z.number().int().positive().optional(),
    expectedProduct: z.number().int().positive(),
    allowCommutative: z.boolean().default(true),
  }),
  hints: HintsArraySchema,
  explanationKm: z.string().min(4).max(240),
});

export const FractionShapeOptionSchema = z.object({
  id: z.string().min(1),
  shape: z.enum(["triangle", "square", "rectangle", "circle"]),
  labelKm: z.string().min(1).max(80),
  sides: z.number().int().min(0),
});

export const FractionBarShapeStepSchema = z.object({
  id: z.string().min(1),
  type: z.literal("fraction-bar-shape"),
  stage: ConcretenessStageSchema,
  promptKm: z.string().min(4).max(180),
  audioUrl: z.string().optional(),
  config: z.object({
    mode: z.enum(["shade-fraction", "shape-identify"]),
    visualShape: z.enum(["bar", "circle", "polygon-sides"]).default("bar"),
    denominator: z.number().int().min(1).max(12).default(2),
    initialShaded: z.number().int().min(0).default(0),
    allowPartitionChange: z.boolean().default(false),
    availableDenominators: z.array(z.number().int().min(2).max(8)).optional(),
    showNumberLine: z.boolean().default(false),
    shapeOptions: z.array(FractionShapeOptionSchema).min(2).max(4).optional(),
  }),
  solution: z.object({
    expectedNumerator: z.number().int().min(0).optional(),
    expectedDenominator: z.number().int().positive().optional(),
    acceptEquivalent: z.boolean().default(true),
    expectedShapeId: z.string().optional(),
  }),
  hints: HintsArraySchema,
  explanationKm: z.string().min(4).max(240),
});

export const PatternPaletteItemSchema = z.object({
  id: z.string().min(1),
  labelKm: z.string().min(1).max(40),
  color: z.string().optional(),
  glyph: z.enum([
    "stripe-red",
    "stripe-blue",
    "stripe-gold",
    "circle",
    "square",
    "triangle",
    "number",
  ]),
});

export const PatternSequenceStepSchema = z.object({
  id: z.string().min(1),
  type: z.literal("pattern-sequence"),
  stage: ConcretenessStageSchema,
  promptKm: z.string().min(4).max(180),
  audioUrl: z.string().optional(),
  config: z.object({
    variant: z.enum(["krama-tiles", "shape-pattern", "number-skip"]),
    sequence: z.array(z.string().nullable()).min(4).max(8),
    palette: z.array(PatternPaletteItemSchema).min(2).max(5),
  }),
  solution: z.object({
    expectedSlotValues: z.array(z.string().min(1)).min(1),
  }),
  hints: HintsArraySchema,
  explanationKm: z.string().min(4).max(240),
});

export const GeometryDrawStepSchema = z.object({
  id: z.string().min(1),
  type: z.literal("geometry-draw"),
  stage: ConcretenessStageSchema,
  promptKm: z.string().min(4).max(180),
  audioUrl: z.string().optional(),
  config: z.object({
    mode: z.enum(["dot-connect", "symmetry-mirror", "area-paint"]),
    gridRows: z.number().int().min(3).max(5).default(4),
    gridCols: z.number().int().min(3).max(5).default(4),
    templateLeftCells: z.array(z.string()).default([]),
    inkColor: z.string().default("#2563eb"),
  }),
  solution: z.object({
    expectedShape: z.enum(["triangle", "square", "rectangle"]).optional(),
    expectedArea: z.number().int().positive().optional(),
    requireSymmetryMirror: z.boolean().default(false),
  }),
  hints: HintsArraySchema,
  explanationKm: z.string().min(4).max(240),
});

export const ClockTimeStepSchema = z.object({
  id: z.string().min(1),
  type: z.literal("clock-time"),
  stage: ConcretenessStageSchema,
  promptKm: z.string().min(4).max(180),
  audioUrl: z.string().optional(),
  config: z.object({
    initialHour: z.number().int().min(1).max(12).default(12),
    initialMinute: z.number().int().min(0).max(59).default(0),
    minuteStep: z.union([z.literal(5), z.literal(15), z.literal(30)]).default(15),
    showDigitalReadout: z.boolean().default(true),
    periodLabelKm: z.string().max(40).optional(),
  }),
  solution: z.object({
    expectedHour: z.number().int().min(1).max(12),
    expectedMinute: z.number().int().min(0).max(59),
  }),
  hints: HintsArraySchema,
  explanationKm: z.string().min(4).max(240),
});

export const DataChartBarSchema = z.object({
  id: z.string().min(1),
  labelKm: z.string().min(1).max(40),
  color: z.string().default("#2563eb"),
  initialValue: z.number().int().min(0).max(12).default(0),
});

export const DataChartStepSchema = z.object({
  id: z.string().min(1),
  type: z.literal("data-chart"),
  stage: ConcretenessStageSchema,
  promptKm: z.string().min(4).max(180),
  audioUrl: z.string().optional(),
  config: z.object({
    mode: z.enum(["build-bars", "read-bar"]),
    maxValue: z.number().int().min(4).max(12).default(8),
    unitLabelKm: z.string().min(1).max(30).default("ផ្លែ"),
    bars: z.array(DataChartBarSchema).min(2).max(4),
  }),
  solution: z.object({
    expectedBarValues: z.record(z.string(), z.number().int().min(0)).optional(),
    expectedBarId: z.string().min(1).optional(),
  }),
  hints: HintsArraySchema,
  explanationKm: z.string().min(4).max(240),
});

export const ActivityStepSchema = z.discriminatedUnion("type", [
  CountingStageStepSchema,
  NumberLineStepSchema,
  PlaceValueBlocksStepSchema,
  ScenarioChoiceStepSchema,
  ComparisonBalanceStepSchema,
  ArrayGroupsStepSchema,
  FractionBarShapeStepSchema,
  PatternSequenceStepSchema,
  GeometryDrawStepSchema,
  ClockTimeStepSchema,
  DataChartStepSchema,
]);

export const LessonDocumentV1Schema = z.object({
  schemaVersion: z.literal("1.0"),
  id: z.string().regex(/^[a-z0-9-]+$/),
  pathId: z.string().min(1),
  order: z.number().int().positive(),
  moeysGradeRef: z.enum(["G1", "G2", "G3", "G4", "G5", "G6"]),
  topicSlug: z.string().min(1),
  titleKm: z.string().min(2).max(80),
  subtitleKm: z.string().min(2).max(120),
  estimatedMinutes: z.number().int().min(3).max(15),
  learningObjectiveKm: z.string().min(4).max(180),
  steps: z.array(ActivityStepSchema).min(3).max(8),
});

export type ConcretenessStage = z.infer<typeof ConcretenessStageSchema>;
export type HintTier = z.infer<typeof HintTierSchema>;
export type CountingStageStep = z.infer<typeof CountingStageStepSchema>;
export type NumberLineStep = z.infer<typeof NumberLineStepSchema>;
export type PlaceValueBlocksStep = z.infer<typeof PlaceValueBlocksStepSchema>;
export type ScenarioChoiceStep = z.infer<typeof ScenarioChoiceStepSchema>;
export type ComparisonBalanceStep = z.infer<typeof ComparisonBalanceStepSchema>;
export type ArrayGroupsStep = z.infer<typeof ArrayGroupsStepSchema>;
export type FractionBarShapeStep = z.infer<typeof FractionBarShapeStepSchema>;
export type PatternSequenceStep = z.infer<typeof PatternSequenceStepSchema>;
export type GeometryDrawStep = z.infer<typeof GeometryDrawStepSchema>;
export type ClockTimeStep = z.infer<typeof ClockTimeStepSchema>;
export type DataChartStep = z.infer<typeof DataChartStepSchema>;
export type ActivityStep = z.infer<typeof ActivityStepSchema>;
export type LessonDocumentV1 = z.infer<typeof LessonDocumentV1Schema>;
