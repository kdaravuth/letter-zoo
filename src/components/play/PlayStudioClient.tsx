"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useLearner } from "@/components/providers/LearnerProvider";
import { NumeralToggle } from "@/components/ui/NumeralToggle";
import { AudioToggle } from "@/components/ui/AudioReadButton";
import { MascotFrog } from "@/components/ui/MascotFrog";
import { CelebrationBurst } from "@/components/ui/CelebrationBurst";
import { detectKramaPattern } from "@/lib/math/kramaPattern";
import { GeometryDraw } from "@/components/activities/GeometryDraw";
import { ClockTime } from "@/components/activities/ClockTime";
import { gradeStep, type StepAnswer } from "@/lib/math/grader";
import type { ClockTimeStep, GeometryDrawStep } from "@/lib/curriculum/schema";
import {
  playGentleNudgeChime,
  playPatternMelody,
  playScaleNote,
  playSuccessChime,
  playWaterPlop,
} from "@/lib/audio/chimes";
import {
  formatDisplayNumber,
  formatTextNumerals,
} from "@/lib/khmer/numerals";

interface MarketOrder {
  id: string;
  customerKm: string;
  itemType: "mango" | "orange" | "lotus";
  itemNameKm: string;
  unitPriceKhr: number;
  quantity: number;
  totalKhr: number;
}

const MARKET_ORDERS: MarketOrder[] = [
  {
    id: "ord-1",
    customerKm: "លោកយាយសំ",
    itemType: "mango",
    itemNameKm: "ស្វាយទុំ",
    unitPriceKhr: 500,
    quantity: 2,
    totalKhr: 1000,
  },
  {
    id: "ord-2",
    customerKm: "បងស្រីម៉ាលី",
    itemType: "orange",
    itemNameKm: "ក្រូចពោធិ៍សាត់",
    unitPriceKhr: 500,
    quantity: 3,
    totalKhr: 1500,
  },
  {
    id: "ord-3",
    customerKm: "មិត្តដារ៉ា",
    itemType: "lotus",
    itemNameKm: "ផ្កាឈូក",
    unitPriceKhr: 1000,
    quantity: 2,
    totalKhr: 2000,
  },
  {
    id: "ord-4",
    customerKm: "ពូសុខា",
    itemType: "mango",
    itemNameKm: "ស្វាយទុំ",
    unitPriceKhr: 500,
    quantity: 4,
    totalKhr: 2000,
  },
  {
    id: "ord-5",
    customerKm: "អ្នកមីងរតនា",
    itemType: "orange",
    itemNameKm: "ក្រូចពោធិ៍សាត់",
    unitPriceKhr: 500,
    quantity: 5,
    totalKhr: 2500,
  },
];

const KRAMA_COLORS = [
  { id: "red", labelKm: "ក្រហម", fill: "#b91c1c", stripe: "#fca5a5", idx: 0 },
  { id: "blue", labelKm: "ខៀវ", fill: "#1d4ed8", stripe: "#93c5fd", idx: 1 },
  { id: "gold", labelKm: "លឿង", fill: "#d97706", stripe: "#fde68a", idx: 2 },
  { id: "green", labelKm: "បៃតង", fill: "#15803d", stripe: "#86efac", idx: 3 },
] as const;

const BANKNOTES = [100, 500, 1000, 2000] as const;

interface FrogPuzzle {
  start: number;
  target: number;
  hintKm: string;
}

const FROG_PUZZLES: FrogPuzzle[] = [
  { start: 3, target: 10, hintKm: "ពី ៣ ទៅ ១០ ត្រូវលោតបូក ៧ (ឧ. +៥ រួច +២)!" },
  { start: 6, target: 15, hintKm: "ពី ៦ លោតទៅ ១០ (+៤) រួច +៥ ដល់ ១៥!" },
  { start: 8, target: 13, hintKm: "ពី ៨ លោត +៥ ម្ដង ដល់ ១៣ ភ្លាម!" },
  { start: 14, target: 10, hintKm: "ពី ១៤ លោតថយក្រោយ −១ ចំនួន ៤ ដង!" },
  { start: 2, target: 12, hintKm: "ពី ២ លោត +៥ ពីរដង ដល់ ១២!" },
];

interface MysteryScalePuzzle {
  knownLeft: number;
  rightTotal: number;
  expectedMystery: number;
}

const MYSTERY_SCALE_PUZZLES: MysteryScalePuzzle[] = [
  { knownLeft: 3, rightTotal: 8, expectedMystery: 5 },
  { knownLeft: 4, rightTotal: 10, expectedMystery: 6 },
  { knownLeft: 2, rightTotal: 9, expectedMystery: 7 },
  { knownLeft: 5, rightTotal: 12, expectedMystery: 7 },
  { knownLeft: 6, rightTotal: 9, expectedMystery: 3 },
];

interface DrawStudioChallenge {
  id: string;
  subMode: "shapes" | "symmetry";
  titleKm: string;
  step: GeometryDrawStep;
}

const DRAW_STUDIO_CHALLENGES: DrawStudioChallenge[] = [
  {
    id: "play-draw-triangle",
    subMode: "shapes",
    titleKm: "គូរត្រីកោណ (៣ ជ្រុង)",
    step: {
      id: "play-draw-triangle",
      type: "geometry-draw",
      stage: "concrete",
      promptKm: "ប៉ះចំណុចលើក្ដារ ដើម្បីគូររូបត្រីកោណបិទជិតមួយ!",
      config: {
        mode: "dot-connect",
        gridRows: 4,
        gridCols: 4,
        templateLeftCells: [],
        inkColor: "#2563eb",
      },
      solution: {
        expectedShape: "triangle",
        requireSymmetryMirror: false,
      },
      hints: [
        { tier: 1, kind: "visual-cue", textKm: "ត្រីកោណមាន ៣ ជ្រុង។" },
        { tier: 2, kind: "strategy-nudge", textKm: "ភ្ជាប់ចំណុច ៣ ត្រឡប់មកចំណុចដើមវិញ។" },
        { tier: 3, kind: "worked-step", textKm: "ប៉ះ (១,១) → (១,៣) → (៣,២) → (១,១)!" },
      ],
      explanationKm: "ត្រីកោណមាន ៣ ជ្រុង និង ៣ កំពូលបិទជិត។",
    },
  },
  {
    id: "play-draw-square",
    subMode: "shapes",
    titleKm: "គូរការ៉េ (៤ ជ្រុងស្មើ)",
    step: {
      id: "play-draw-square",
      type: "geometry-draw",
      stage: "iconic",
      promptKm: "គូររូបការ៉េបិទជិតដែលមានជ្រុងទាំង ៤ ស្មើគ្នា!",
      config: {
        mode: "dot-connect",
        gridRows: 4,
        gridCols: 4,
        templateLeftCells: [],
        inkColor: "#15803d",
      },
      solution: {
        expectedShape: "square",
        requireSymmetryMirror: false,
      },
      hints: [
        { tier: 1, kind: "visual-cue", textKm: "ការ៉េមាន ៤ ជ្រុងស្មើគ្នា។" },
        { tier: 2, kind: "strategy-nudge", textKm: "រាប់ចន្លោះស្មើគ្នាទាំងដេក និងឈរ។" },
        { tier: 3, kind: "worked-step", textKm: "ប៉ះ (១,១) → (១,៣) → (៣,៣) → (៣,១) → (១,១)!" },
      ],
      explanationKm: "ការ៉េមាន ៤ ជ្រុងស្មើគ្នា និងមុំកែងទាំង ៤។",
    },
  },
  {
    id: "play-draw-rectangle",
    subMode: "shapes",
    titleKm: "គូរចតុកោណកែង",
    step: {
      id: "play-draw-rectangle",
      type: "geometry-draw",
      stage: "iconic",
      promptKm: "គូររូបចតុកោណកែងដែលមានបណ្ដោយវែងជាងទទឹង!",
      config: {
        mode: "dot-connect",
        gridRows: 4,
        gridCols: 4,
        templateLeftCells: [],
        inkColor: "#d97706",
      },
      solution: {
        expectedShape: "rectangle",
        requireSymmetryMirror: false,
      },
      hints: [
        { tier: 1, kind: "visual-cue", textKm: "ចតុកោណកែងមាន ៤ ជ្រុង ហើយជ្រុងទល់មុខស្មើគ្នា។" },
        { tier: 2, kind: "strategy-nudge", textKm: "គូរបណ្ដោយ ៣ ចន្លោះ និងទទឹង ១ ឬ ២ ចន្លោះ។" },
        { tier: 3, kind: "worked-step", textKm: "ប៉ះ (១,១) → (១,៤) → (៣,៤) → (៣,១) → (១,១)!" },
      ],
      explanationKm: "ចតុកោណកែងមានមុំកែងទាំង ៤ និងជ្រុងឈមស្មើគ្នា។",
    },
  },
  {
    id: "play-sym-butterfly",
    subMode: "symmetry",
    titleKm: "មេអំបៅស៊ីមេទ្រី",
    step: {
      id: "play-sym-butterfly",
      type: "geometry-draw",
      stage: "iconic",
      promptKm: "លាបពណ៌ស្លាបមេអំបៅខាងស្ដាំ ឱ្យឆ្លុះស៊ីមេទ្រីនឹងខាងឆ្វេង!",
      config: {
        mode: "symmetry-mirror",
        gridRows: 4,
        gridCols: 4,
        templateLeftCells: ["0,0", "1,0", "1,1", "2,0", "2,1", "3,0"],
        inkColor: "#db2777",
      },
      solution: {
        requireSymmetryMirror: true,
      },
      hints: [
        { tier: 1, kind: "visual-cue", textKm: "មើលបន្ទាត់កញ្ចក់ចំកណ្ដាល។" },
        { tier: 2, kind: "strategy-nudge", textKm: "ជួរឈរទី ១ ឆ្លុះទៅទី ៤ ហើយទី ២ ឆ្លុះទៅទី ៣។" },
        { tier: 3, kind: "worked-step", textKm: "លាបជួរឈរទី ៤ ទាំងអស់ និងជួរឈរទី ៣ ត្រង់ជួរ ២ និង ៣!" },
      ],
      explanationKm: "ស្លាបមេអំបៅទាំងពីរឆ្លុះស៊ីមេទ្រីគ្នាយ៉ាងស្អាត!",
    },
  },
  {
    id: "play-sym-lotus",
    subMode: "symmetry",
    titleKm: "ផ្កាឈូកស៊ីមេទ្រី",
    step: {
      id: "play-sym-lotus",
      type: "geometry-draw",
      stage: "iconic",
      promptKm: "លាបពណ៌ត្របកផ្កាឈូកខាងស្ដាំ ឱ្យឆ្លុះស៊ីមេទ្រីស្មើគ្នា!",
      config: {
        mode: "symmetry-mirror",
        gridRows: 4,
        gridCols: 4,
        templateLeftCells: ["0,1", "1,0", "1,1", "2,1", "3,0", "3,1"],
        inkColor: "#db2777",
      },
      solution: {
        requireSymmetryMirror: true,
      },
      hints: [
        { tier: 1, kind: "visual-cue", textKm: "រាប់ចម្ងាយប្រឡោះពីបន្ទាត់កញ្ចក់ក្រហម។" },
        { tier: 2, kind: "strategy-nudge", textKm: "ជួរឈរទី ២ ឆ្លុះទៅទី ៣ ហើយទី ១ ឆ្លុះទៅទី ៤។" },
        { tier: 3, kind: "worked-step", textKm: "លាបជួរឈរទី ៣ ទាំង ៤ ប្រឡោះ និងជួរឈរទី ៤ ត្រង់ជួរ ២ និង ៤!" },
      ],
      explanationKm: "ផ្កាឈូករីកឆ្លុះស៊ីមេទ្រីទាំងសងខាង!",
    },
  },
  {
    id: "play-sym-prasat",
    subMode: "symmetry",
    titleKm: "កំពូលប្រាសាទស៊ីមេទ្រី",
    step: {
      id: "play-sym-prasat",
      type: "geometry-draw",
      stage: "iconic",
      promptKm: "លាបពណ៌ជ្រុងប្រាសាទខាងស្ដាំ ឱ្យឆ្លុះស៊ីមេទ្រីនឹងខាងឆ្វេង!",
      config: {
        mode: "symmetry-mirror",
        gridRows: 4,
        gridCols: 4,
        templateLeftCells: ["0,1", "1,1", "2,0", "2,1", "3,0", "3,1"],
        inkColor: "#d97706",
      },
      solution: {
        requireSymmetryMirror: true,
      },
      hints: [
        { tier: 1, kind: "visual-cue", textKm: "កំពូលប្រាសាទតូចខាងលើ ហើយជើងប្រាសាទធំខាងក្រោម។" },
        { tier: 2, kind: "strategy-nudge", textKm: "ឆ្លុះប្រឡោះម្ដងមួយជួរពីលើចុះក្រោម។" },
        { tier: 3, kind: "worked-step", textKm: "លាបជួរឈរទី ៣ ទាំង ៤ ប្រឡោះ និងជួរឈរទី ៤ ត្រង់ជួរ ៣ និង ៤!" },
      ],
      explanationKm: "ស្ថាបត្យកម្មប្រាសាទខ្មែរមានស៊ីមេទ្រីយ៉ាងស្រស់ស្អាត!",
    },
  },
];

interface ClockPlayPuzzle {
  id: string;
  routineKm: string;
  step: ClockTimeStep;
}

const CLOCK_PLAY_PUZZLES: ClockPlayPuzzle[] = [
  {
    id: "play-clock-school",
    routineKm: "ទៅសាលារៀនពេលព្រឹក",
    step: {
      id: "play-clock-school",
      type: "clock-time",
      stage: "concrete",
      promptKm: "កង្កែបតូចត្រូវចូលរៀននៅម៉ោង ៧:០០ ព្រឹក — កំណត់នាឡិកាជូនវាណា៎!",
      config: {
        initialHour: 5,
        initialMinute: 0,
        minuteStep: 15,
        showDigitalReadout: true,
        periodLabelKm: "ពេលព្រឹក",
      },
      solution: { expectedHour: 7, expectedMinute: 0 },
      hints: [
        { tier: 1, kind: "visual-cue", textKm: "ទ្រនិចខ្លីនៅ ៧ និងវែងនៅ ១២។" },
        { tier: 2, kind: "strategy-nudge", textKm: "បន្ថែម ២ ម៉ោងពី ៥:០០។" },
        { tier: 3, kind: "worked-step", textKm: "ចុច +១ ម៉ោង ២ ដង!" },
      ],
      explanationKm: "កង្កែបតូចទៅដល់សាលាម៉ោង ៧:០០ ទាន់ពេលបេះបិទ!",
    },
  },
  {
    id: "play-clock-recess",
    routineKm: "សម្រាកលេងនៅសាលា",
    step: {
      id: "play-clock-recess",
      type: "clock-time",
      stage: "iconic",
      promptKm: "ម៉ោង ៩:៣០ ដល់ពេលសម្រាកលេងជាមួយមិត្តភក្ដិ — កំណត់ម៉ោង ៩:៣០!",
      config: {
        initialHour: 9,
        initialMinute: 0,
        minuteStep: 15,
        showDigitalReadout: true,
        periodLabelKm: "ពេលព្រឹក",
      },
      solution: { expectedHour: 9, expectedMinute: 30 },
      hints: [
        { tier: 1, kind: "visual-cue", textKm: "៣០ នាទីជាកន្លះម៉ោង។" },
        { tier: 2, kind: "strategy-nudge", textKm: "ជ្រើស :៣០ នាទី។" },
        { tier: 3, kind: "worked-step", textKm: "ប៉ះប៊ូតុង :៣០!" },
      ],
      explanationKm: "ម៉ោង ៩:៣០ ហើយ — តោះទៅលេងលោតអន្ទាក់!",
    },
  },
  {
    id: "play-clock-lunch",
    routineKm: "ញ៉ាំបាយថ្ងៃត្រង់",
    step: {
      id: "play-clock-lunch",
      type: "clock-time",
      stage: "iconic",
      promptKm: "ម៉ោង ១២:១៥ ដល់ពេលញ៉ាំសម្លកកូរ — កំណត់ម៉ោង ១២:១៥!",
      config: {
        initialHour: 11,
        initialMinute: 0,
        minuteStep: 15,
        showDigitalReadout: true,
        periodLabelKm: "ថ្ងៃត្រង់",
      },
      solution: { expectedHour: 12, expectedMinute: 15 },
      hints: [
        { tier: 1, kind: "visual-cue", textKm: "១៥ នាទីទ្រនិចវែងនៅលេខ ៣។" },
        { tier: 2, kind: "strategy-nudge", textKm: "ឡើងម៉ោងដល់ ១២ និងនាទី :១៥។" },
        { tier: 3, kind: "worked-step", textKm: "ចុច +១ ម៉ោង និងប៉ះ :១៥!" },
      ],
      explanationKm: "ឆ្ងាញ់ណាស់! ម៉ោង ១២:១៥ ដល់ពេលបាយថ្ងៃត្រង់ហើយ!",
    },
  },
  {
    id: "play-clock-garden",
    routineKm: "ស្រោចសួនផ្កាឈូក",
    step: {
      id: "play-clock-garden",
      type: "clock-time",
      stage: "symbolic",
      promptKm: "ម៉ោង ៤:៤៥ រសៀលដល់ពេលស្រោចសួនស្វាយ — កំណត់ម៉ោង ៤:៤៥!",
      config: {
        initialHour: 3,
        initialMinute: 30,
        minuteStep: 15,
        showDigitalReadout: true,
        periodLabelKm: "ពេលរសៀល",
      },
      solution: { expectedHour: 4, expectedMinute: 45 },
      hints: [
        { tier: 1, kind: "visual-cue", textKm: "៤៥ នាទីទ្រនិចវែងនៅលេខ ៩។" },
        { tier: 2, kind: "strategy-nudge", textKm: "បង្កើនម៉ោងដល់ ៤ និងប៉ះ :៤៥។" },
        { tier: 3, kind: "worked-step", textKm: "ចុច +១ ម៉ោង និង :៤៥!" },
      ],
      explanationKm: "ម៉ោង ៤:៤៥ ល្ងាច ផ្កាឈូករីកស្រស់ស្អាតណាស់!",
    },
  },
];

export function PlayStudioClient() {
  const { numeralPref, audioEnabled } = useLearner();
  const [activeMode, setActiveMode] = useState<
    "market" | "krama" | "frog" | "scale" | "draw" | "clock"
  >("market");

  // 1. Market Stall state
  const [orderIdx, setOrderIdx] = useState<number>(0);
  const [packedCount, setPackedCount] = useState<number>(0);
  const [notesOnTray, setNotesOnTray] = useState<number[]>([]);
  const [marketStatus, setMarketStatus] = useState<{
    ok: boolean;
    messageKm: string;
  } | null>(null);
  const [customersServed, setCustomersServed] = useState<number>(0);

  // 2. Krama Pattern Weaver state
  const [loomSlots, setLoomSlots] = useState<Array<string | null>>(() =>
    Array.from({ length: 8 }, () => null)
  );
  const [selectedColorId, setSelectedColorId] = useState<string>("red");
  const [kramaChecked, setKramaChecked] = useState<boolean>(false);

  // 3. Frog Pond Target Jump state
  const [frogPuzzleIdx, setFrogPuzzleIdx] = useState<number>(0);
  const [frogPos, setFrogPos] = useState<number>(FROG_PUZZLES[0].start);
  const [frogJumps, setFrogJumps] = useState<number>(0);
  const [frogWonCount, setFrogWonCount] = useState<number>(0);

  // 4. Mystery Balance Scale state
  const [scalePuzzleIdx, setScalePuzzleIdx] = useState<number>(0);
  const [chosenStone, setChosenStone] = useState<number | null>(null);
  const [scaleSolvedCount, setScaleSolvedCount] = useState<number>(0);

  // 5. Math Drawing Studio state
  const [drawSubMode, setDrawSubMode] = useState<"shapes" | "symmetry">(
    "shapes"
  );
  const [drawChallengeIdx, setDrawChallengeIdx] = useState<number>(0);
  const [drawAnswer, setDrawAnswer] = useState<
    Extract<StepAnswer, { type: "geometry-draw" }>
  >({ type: "geometry-draw", edges: [], paintedCells: [] });
  const [drawStatus, setDrawStatus] = useState<{
    ok: boolean;
    messageKm: string;
  } | null>(null);
  const [drawSolvedCount, setDrawSolvedCount] = useState<number>(0);

  const filteredDrawChallenges = useMemo(
    () => DRAW_STUDIO_CHALLENGES.filter((c) => c.subMode === drawSubMode),
    [drawSubMode]
  );
  const currentDrawChallenge =
    filteredDrawChallenges[drawChallengeIdx % filteredDrawChallenges.length] ??
    DRAW_STUDIO_CHALLENGES[0];

  // 6. Frog's Daily Clock state
  const [clockPuzzleIdx, setClockPuzzleIdx] = useState<number>(0);
  const [clockAnswer, setClockAnswer] = useState<
    Extract<StepAnswer, { type: "clock-time" }>
  >({
    type: "clock-time",
    hour: CLOCK_PLAY_PUZZLES[0].step.config.initialHour,
    minute: CLOCK_PLAY_PUZZLES[0].step.config.initialMinute,
  });
  const [clockStatus, setClockStatus] = useState<{
    ok: boolean;
    messageKm: string;
  } | null>(null);
  const [clockSolvedCount, setClockSolvedCount] = useState<number>(0);
  const currentClockPuzzle =
    CLOCK_PLAY_PUZZLES[clockPuzzleIdx % CLOCK_PLAY_PUZZLES.length];

  const currentOrder = MARKET_ORDERS[orderIdx % MARKET_ORDERS.length];
  const traySumKhr = notesOnTray.reduce((s, n) => s + n, 0);
  const kramaAnalysis = useMemo(
    () => detectKramaPattern(loomSlots),
    [loomSlots]
  );

  const currentFrogPuzzle = FROG_PUZZLES[frogPuzzleIdx % FROG_PUZZLES.length];
  const frogReachedTarget = frogPos === currentFrogPuzzle.target;

  const currentScalePuzzle =
    MYSTERY_SCALE_PUZZLES[scalePuzzleIdx % MYSTERY_SCALE_PUZZLES.length];
  const scaleLeftTotal = currentScalePuzzle.knownLeft + (chosenStone ?? 0);
  const scaleBalanced =
    chosenStone !== null && scaleLeftTotal === currentScalePuzzle.rightTotal;

  // Market Stall handlers
  const handleAddFruit = () => {
    if (packedCount >= 8) return;
    const next = packedCount + 1;
    setPackedCount(next);
    setMarketStatus(null);
    playScaleNote(next - 1, audioEnabled);
  };

  const handleRemoveFruit = () => {
    if (packedCount <= 0) return;
    setPackedCount((c) => c - 1);
    setMarketStatus(null);
  };

  const handleAddNote = (note: number) => {
    setNotesOnTray((prev) => [...prev, note]);
    setMarketStatus(null);
    playScaleNote(Math.min(8, notesOnTray.length + 2), audioEnabled);
  };

  const handleServeOrder = () => {
    const countOk = packedCount === currentOrder.quantity;
    const moneyOk = traySumKhr === currentOrder.totalKhr;

    if (countOk && moneyOk) {
      playSuccessChime(audioEnabled);
      setCustomersServed((c) => c + 1);
      setMarketStatus({
        ok: true,
        messageKm: `«អរគុណច្រើនណាកូន!» ${currentOrder.customerKm} ពេញចិត្តណាស់ — គ្រប់ ${currentOrder.quantity} និង ${currentOrder.totalKhr.toLocaleString("en-US")}៛ ត្រឹមត្រូវ!`,
      });
      return;
    }

    playGentleNudgeChime(audioEnabled);
    if (!countOk) {
      setMarketStatus({
        ok: false,
        messageKm:
          packedCount < currentOrder.quantity
            ? `នៅខ្វះ${currentOrder.itemNameKm}បន្តិចទៀត! ភ្ញៀវកម្ម៉ង់ ${currentOrder.quantity} ណា៎។`
            : `លើស${currentOrder.itemNameKm}បន្តិចហើយ! ភ្ញៀវកម្ម៉ង់តែ ${currentOrder.quantity} ទេណា៎។`,
      });
    } else {
      setMarketStatus({
        ok: false,
        messageKm:
          traySumKhr < currentOrder.totalKhr
            ? `ផ្លែឈើគ្រប់ហើយ! ប៉ុន្តែប្រាក់លើថាសនៅខ្វះដល់ ${currentOrder.totalKhr.toLocaleString("en-US")}៛ ណា៎។`
            : `ផ្លែឈើគ្រប់ហើយ! ប៉ុន្តែប្រាក់លើថាសលើស ${currentOrder.totalKhr.toLocaleString("en-US")}៛ ហើយ សាកដកចេញខ្លះវិញណា៎។`,
      });
    }
  };

  const handleNextCustomer = () => {
    setOrderIdx((i) => (i + 1) % MARKET_ORDERS.length);
    setPackedCount(0);
    setNotesOnTray([]);
    setMarketStatus(null);
  };

  // Krama Weaver handlers
  const handleWeaveSlot = (slotIdx: number) => {
    const colorObj = KRAMA_COLORS.find((c) => c.id === selectedColorId);
    setLoomSlots((prev) =>
      prev.map((val, i) => (i === slotIdx ? selectedColorId : val))
    );
    setKramaChecked(false);
    if (colorObj) {
      playScaleNote(colorObj.idx + 3, audioEnabled);
    }
  };

  const handleWeaveNext = () => {
    const firstEmpty = loomSlots.findIndex((s) => s === null);
    if (firstEmpty === -1) return;
    handleWeaveSlot(firstEmpty);
  };

  const handleApplyPreset = (preset: "AB" | "ABC" | "AABB") => {
    const map =
      preset === "AB"
        ? ["red", "blue", "red", "blue", "red", "blue", "red", "blue"]
        : preset === "ABC"
          ? ["red", "blue", "gold", "red", "blue", "gold", "red", "blue"]
          : ["red", "red", "gold", "gold", "red", "red", "gold", "gold"];
    setLoomSlots(map);
    setKramaChecked(true);
    playPatternMelody(
      map.map((id) => KRAMA_COLORS.find((c) => c.id === id)?.idx ?? 0),
      audioEnabled
    );
  };

  const handlePlayMelody = () => {
    const indices = loomSlots
      .filter((s): s is string => Boolean(s))
      .map((id) => KRAMA_COLORS.find((c) => c.id === id)?.idx ?? 0);
    if (indices.length > 0) {
      playPatternMelody(indices, audioEnabled);
    }
  };

  const handleCheckKrama = () => {
    setKramaChecked(true);
    if (kramaAnalysis.isRepeating) {
      playSuccessChime(audioEnabled);
    } else {
      playGentleNudgeChime(audioEnabled);
    }
  };

  // Frog Pond Jump handlers
  const handleFrogJump = (delta: number) => {
    if (frogReachedTarget) return;
    const nextPos = Math.max(0, Math.min(20, frogPos + delta));
    setFrogPos(nextPos);
    setFrogJumps((j) => j + 1);
    if (nextPos === currentFrogPuzzle.target) {
      playSuccessChime(audioEnabled);
      setFrogWonCount((w) => w + 1);
    } else {
      playWaterPlop(audioEnabled);
    }
  };

  const handleNextFrogPuzzle = () => {
    const nextIdx = (frogPuzzleIdx + 1) % FROG_PUZZLES.length;
    setFrogPuzzleIdx(nextIdx);
    setFrogPos(FROG_PUZZLES[nextIdx].start);
    setFrogJumps(0);
  };

  // Mystery Balance Scale handlers
  const handlePickStone = (val: number) => {
    setChosenStone(val);
    const leftSum = currentScalePuzzle.knownLeft + val;
    if (leftSum === currentScalePuzzle.rightTotal) {
      playSuccessChime(audioEnabled);
      setScaleSolvedCount((c) => c + 1);
    } else {
      playScaleNote(Math.min(10, val), audioEnabled);
    }
  };

  const handleNextScalePuzzle = () => {
    setScalePuzzleIdx((i) => (i + 1) % MYSTERY_SCALE_PUZZLES.length);
    setChosenStone(null);
  };

  // Drawing Studio handlers
  const handleSwitchDrawSubMode = (nextSub: "shapes" | "symmetry") => {
    setDrawSubMode(nextSub);
    setDrawChallengeIdx(0);
    setDrawAnswer({ type: "geometry-draw", edges: [], paintedCells: [] });
    setDrawStatus(null);
  };

  const handleCheckDrawing = () => {
    const res = gradeStep(currentDrawChallenge.step, drawAnswer);
    if (res.isCorrect) {
      playSuccessChime(audioEnabled);
      setDrawSolvedCount((c) => c + 1);
      setDrawStatus({
        ok: true,
        messageKm: `អស្ចារ្យណាស់! ${currentDrawChallenge.step.explanationKm}`,
      });
    } else {
      playGentleNudgeChime(audioEnabled);
      setDrawStatus({
        ok: false,
        messageKm: res.feedbackKm || "សាកពិនិត្យរូបគូរម្ដងទៀតណា៎!",
      });
    }
  };

  const handleNextDrawChallenge = () => {
    setDrawChallengeIdx((i) => (i + 1) % filteredDrawChallenges.length);
    setDrawAnswer({ type: "geometry-draw", edges: [], paintedCells: [] });
    setDrawStatus(null);
  };

  // Frog's Daily Clock handlers
  const handleCheckClock = () => {
    const res = gradeStep(currentClockPuzzle.step, clockAnswer);
    if (res.isCorrect) {
      playSuccessChime(audioEnabled);
      setClockSolvedCount((c) => c + 1);
      setClockStatus({
        ok: true,
        messageKm: `អស្ចារ្យ! ${currentClockPuzzle.step.explanationKm}`,
      });
    } else {
      playGentleNudgeChime(audioEnabled);
      setClockStatus({
        ok: false,
        messageKm: res.feedbackKm || "សាកពិនិត្យទ្រនិចនាឡិកាម្ដងទៀតណា៎!",
      });
    }
  };

  const handleNextClockPuzzle = () => {
    const nextIdx = (clockPuzzleIdx + 1) % CLOCK_PLAY_PUZZLES.length;
    setClockPuzzleIdx(nextIdx);
    const nextCfg = CLOCK_PLAY_PUZZLES[nextIdx].step.config;
    setClockAnswer({
      type: "clock-time",
      hour: nextCfg.initialHour,
      minute: nextCfg.initialMinute,
    });
    setClockStatus(null);
  };

  const scaleDiff = scaleLeftTotal - currentScalePuzzle.rightTotal;
  const scaleTilt = scaleDiff === 0 ? 0 : scaleDiff > 0 ? -8 : 8;

  return (
    <div className="app-page-with-rail min-h-dvh bg-canvas flex flex-col">
      <header className="sticky top-0 z-20 border-b-2 border-[#c9c2b2] bg-surface/95 backdrop-blur px-3 py-2.5">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-2">
          <Link
            href="/learn"
            className="khmer-chip pill-3d [--pill-edge:#c9c2b2] inline-flex items-center rounded-xl border-2 border-[#c9c2b2] bg-surface px-3 text-sm font-bold text-ink hover:bg-surface-subtle"
          >
            ← ផ្លូវរៀន
          </Link>
          <div className="flex items-center gap-1.5">
            <AudioToggle />
            <NumeralToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-3 py-5 pb-12">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xs font-extrabold text-[#13429E]">
              លេង និងស្វែងយល់ • គ្មានម៉ោងរាប់ថយក្រោយ
            </p>
            <h1 className="text-2xl font-bold text-ink">
              ក្ដារលេងគណិតសប្បាយៗ
            </h1>
          </div>
          <Link
            href="/garden"
            className="khmer-chip pill-3d candy-leaf inline-flex items-center rounded-full border-2 border-[#148F56] bg-[#22C57B] px-3.5 text-xs font-extrabold text-[#0D2B1D]"
          >
            ទៅសួនគណិត →
          </Link>
        </div>

        {/* 6 Tactile 3D Candy Game Mode Cards */}
        <nav
          aria-label="ជ្រើសរើសហ្គេមគណិត"
          className="grid grid-cols-2 sm:grid-cols-3 gap-2.5"
        >
          <button
            type="button"
            data-testid="play-tab-market"
            aria-pressed={activeMode === "market"}
            onClick={() => setActiveMode("market")}
            className={`khmer-chip btn-3d rounded-2xl border-2 px-3 py-2.5 text-sm font-extrabold transition-colors ${
              activeMode === "market"
                ? "candy-tangerine border-[#C85A14] bg-[#FF8C42] text-[#1E2A4A]"
                : "border-[#C85A14] [--btn-edge:#C85A14] bg-surface text-ink hover:bg-[#FFEDE0]"
            }`}
          >
            ហាងផ្លែឈើខ្មែរ
          </button>
          <button
            type="button"
            data-testid="play-tab-krama"
            aria-pressed={activeMode === "krama"}
            onClick={() => setActiveMode("krama")}
            className={`khmer-chip btn-3d rounded-2xl border-2 px-3 py-2.5 text-sm font-extrabold transition-colors ${
              activeMode === "krama"
                ? "candy-berry border-[#9E1943] bg-[#D62860] text-white"
                : "border-[#9E1943] [--btn-edge:#9E1943] bg-surface text-ink hover:bg-[#FFE3EC]"
            }`}
          >
            ត្បាញក្រមាគណិត
          </button>
          <button
            type="button"
            data-testid="play-tab-frog"
            aria-pressed={activeMode === "frog"}
            onClick={() => setActiveMode("frog")}
            className={`khmer-chip btn-3d rounded-2xl border-2 px-3 py-2.5 text-sm font-extrabold transition-colors ${
              activeMode === "frog"
                ? "candy-leaf border-[#148F56] bg-[#22C57B] text-[#0D2B1D]"
                : "border-[#148F56] [--btn-edge:#148F56] bg-surface text-ink hover:bg-[#E3FBEF]"
            }`}
          >
            កង្កែបលោតដល់ផ្កាឈូក
          </button>
          <button
            type="button"
            data-testid="play-tab-scale"
            aria-pressed={activeMode === "scale"}
            onClick={() => setActiveMode("scale")}
            className={`khmer-chip btn-3d rounded-2xl border-2 px-3 py-2.5 text-sm font-extrabold transition-colors ${
              activeMode === "scale"
                ? "candy-sun border-[#C89600] bg-[#FFD23F] text-[#1E2A4A]"
                : "border-[#C89600] [--btn-edge:#C89600] bg-surface text-ink hover:bg-[#FFF3BF]"
            }`}
          >
            ជញ្ជីងអាថ៌កំបាំង
          </button>
          <button
            type="button"
            data-testid="play-tab-draw"
            aria-pressed={activeMode === "draw"}
            onClick={() => setActiveMode("draw")}
            className={`khmer-chip btn-3d rounded-2xl border-2 px-3 py-2.5 text-sm font-extrabold transition-colors ${
              activeMode === "draw"
                ? "candy-ocean border-[#13429E] bg-[#1D5FD6] text-white"
                : "border-[#13429E] [--btn-edge:#13429E] bg-surface text-ink hover:bg-[#E5F0FF]"
            }`}
          >
            គូររូបគណិត
          </button>
          <button
            type="button"
            data-testid="play-tab-clock"
            aria-pressed={activeMode === "clock"}
            onClick={() => setActiveMode("clock")}
            className={`khmer-chip btn-3d rounded-2xl border-2 px-3 py-2.5 text-sm font-extrabold transition-colors ${
              activeMode === "clock"
                ? "candy-grape border-[#5620B8] bg-[#7C3AED] text-white"
                : "border-[#5620B8] [--btn-edge:#5620B8] bg-surface text-ink hover:bg-[#F0E7FF]"
            }`}
          >
            នាឡិកាកង្កែបតូច
          </button>
        </nav>

        {/* MODE 1: Cambodian Market Stall */}
        {activeMode === "market" && (
          <section
            data-testid="market-stall-panel"
            className="rounded-3xl border border-border bg-surface p-4 sm:p-5 shadow-xs space-y-4"
          >
            <div className="flex items-start gap-3 rounded-2xl border border-border bg-canvas p-3.5">
              <MascotFrog
                mood={marketStatus?.ok ? "happy" : "curious"}
                size={48}
              />
              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-bold text-accent">
                    ភ្ញៀវ៖ {currentOrder.customerKm}
                  </p>
                  <span
                    data-testid="market-served-count"
                    className="rounded-full bg-success-soft px-2.5 py-0.5 text-xs font-bold text-success"
                  >
                    បានលក់ជូន៖ {formatDisplayNumber(customersServed, numeralPref)} នាក់
                  </span>
                </div>
                <p
                  data-testid="market-order-prompt"
                  className="text-base font-bold text-ink"
                >
                  {formatTextNumerals(
                    `«សុំទិញ${currentOrder.itemNameKm} ${currentOrder.quantity} (មួយថ្លៃ ${currentOrder.unitPriceKhr.toLocaleString("en-US")}៛ — សរុប ${currentOrder.totalKhr.toLocaleString("en-US")}៛)»`,
                    numeralPref
                  )}
                </p>
              </div>
            </div>

            <CelebrationBurst active={Boolean(marketStatus?.ok)} />

            <div className="rounded-2xl border border-border bg-canvas p-3 space-y-3">
              <div className="flex items-center justify-between text-sm font-bold text-ink">
                <span>ថាសរៀប{currentOrder.itemNameKm}៖</span>
                <span data-testid="market-packed-count" className="text-accent">
                  {formatDisplayNumber(packedCount, numeralPref)} /{" "}
                  {formatDisplayNumber(currentOrder.quantity, numeralPref)}
                </span>
              </div>

              <svg
                viewBox="0 0 320 74"
                className="w-full max-w-[340px] mx-auto h-auto select-none"
                role="img"
                aria-label={`ថាសមាន${currentOrder.itemNameKm} ${formatDisplayNumber(packedCount, numeralPref)}`}
              >
                <rect
                  x={4}
                  y={6}
                  width={312}
                  height={62}
                  rx={16}
                  fill="#fffbeb"
                  stroke="#d97706"
                  strokeWidth={2}
                />
                {Array.from({ length: packedCount }).map((_, idx) => {
                  const cx = 32 + idx * 36;
                  const cy = 37;
                  if (currentOrder.itemType === "lotus") {
                    return (
                      <g key={idx}>
                        <ellipse cx={cx} cy={cy} rx={10} ry={13} fill="#f472b6" stroke="#be185d" strokeWidth={1.5} />
                        <circle cx={cx} cy={cy + 2} r={3.5} fill="#facc15" />
                      </g>
                    );
                  }
                  if (currentOrder.itemType === "orange") {
                    return (
                      <circle key={idx} cx={cx} cy={cy} r={13} fill="#fb923c" stroke="#c2410c" strokeWidth={1.8} />
                    );
                  }
                  return (
                    <ellipse
                      key={idx}
                      cx={cx}
                      cy={cy}
                      rx={13}
                      ry={10.5}
                      transform={`rotate(-18 ${cx} ${cy})`}
                      fill="#f59e0b"
                      stroke="#b45309"
                      strokeWidth={1.8}
                    />
                  );
                })}
              </svg>

              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  data-testid="market-fruit-dec"
                  disabled={packedCount <= 0 || Boolean(marketStatus?.ok)}
                  onClick={handleRemoveFruit}
                  className="manipulative-target rounded-xl border border-border bg-surface px-4 text-base font-bold text-ink disabled:opacity-40"
                >
                  −{formatDisplayNumber(1, numeralPref)}
                </button>
                <button
                  type="button"
                  data-testid="market-fruit-inc"
                  disabled={packedCount >= 8 || Boolean(marketStatus?.ok)}
                  onClick={handleAddFruit}
                  className="manipulative-target rounded-xl bg-amber-700 px-5 text-base font-bold text-white disabled:opacity-40"
                >
                  +{formatDisplayNumber(1, numeralPref)} {currentOrder.itemNameKm}
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-canvas p-3 space-y-2.5">
              <div className="flex items-center justify-between text-sm font-bold text-ink">
                <span>ប្រាក់រៀលលើថាស៖</span>
                <span data-testid="market-tray-sum" className="text-accent">
                  {formatDisplayNumber(
                    traySumKhr.toLocaleString("en-US"),
                    numeralPref
                  )}
                  ៛
                </span>
              </div>

              {notesOnTray.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {notesOnTray.map((note, idx) => (
                    <button
                      key={`${note}-${idx}`}
                      type="button"
                      disabled={Boolean(marketStatus?.ok)}
                      onClick={() =>
                        setNotesOnTray((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="khmer-chip rounded-xl border border-emerald-700 bg-emerald-50 px-2.5 text-xs font-bold text-emerald-900"
                    >
                      {formatDisplayNumber(
                        note.toLocaleString("en-US"),
                        numeralPref
                      )}
                      ៛ ✕
                    </button>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                {BANKNOTES.map((note) => (
                  <button
                    key={note}
                    type="button"
                    data-testid={`market-note-${note}`}
                    disabled={Boolean(marketStatus?.ok)}
                    onClick={() => handleAddNote(note)}
                    className="manipulative-target rounded-xl border-2 border-border bg-surface px-3 text-sm font-bold text-ink hover:border-accent hover:bg-accent-soft disabled:opacity-45"
                  >
                    +
                    {formatDisplayNumber(
                      note.toLocaleString("en-US"),
                      numeralPref
                    )}
                    ៛
                  </button>
                ))}
              </div>
            </div>

            {marketStatus && (
              <div
                data-testid="market-feedback"
                role="status"
                aria-live="polite"
                className={`rounded-2xl border-2 p-3.5 text-sm font-bold ${
                  marketStatus.ok
                    ? "border-success bg-success-soft text-ink"
                    : "border-hint bg-hint-soft text-ink"
                }`}
              >
                {formatTextNumerals(marketStatus.messageKm, numeralPref)}
              </div>
            )}

            <div className="flex gap-2.5">
              {!marketStatus?.ok ? (
                <button
                  type="button"
                  data-testid="market-serve-btn"
                  onClick={handleServeOrder}
                  className="khmer-chip btn-3d candy-ocean flex-1 rounded-2xl border-2 border-[#13429E] bg-[#1D5FD6] px-5 py-3 text-base font-extrabold text-white hover:bg-[#1751BA]"
                >
                  ប្រគល់ជូនភ្ញៀវ
                </button>
              ) : (
                <button
                  type="button"
                  data-testid="market-next-btn"
                  onClick={handleNextCustomer}
                  className="khmer-chip btn-3d candy-leaf flex-1 rounded-2xl border-2 border-[#148F56] bg-[#22C57B] px-5 py-3 text-base font-extrabold text-[#0D2B1D]"
                >
                  ទទួលភ្ញៀវបន្ទាប់ →
                </button>
              )}
            </div>
          </section>
        )}

        {/* MODE 2: Krama Pattern Weaver */}
        {activeMode === "krama" && (
          <section
            data-testid="krama-weaver-panel"
            className="rounded-3xl border border-border bg-surface p-4 sm:p-5 shadow-xs space-y-4"
          >
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-ink">
                ត្បាញក្រមាគណិតដោយខ្លួនឯង!
              </h2>
              <p className="text-xs text-ink-muted">
                ជ្រើសរើសពណ៌សូត្រ រួចប៉ះប្រឡោះទាំង ៨ ដើម្បីបង្កើតលំនាំ AB, ABC ឬ AABB រួចស្ដាប់ភ្លេងក្រមា!
              </p>
            </div>

            <CelebrationBurst
              active={kramaChecked && kramaAnalysis.isRepeating}
            />

            <div className="rounded-2xl border border-border bg-canvas p-3 grid grid-cols-4 gap-2">
              {loomSlots.map((colorId, idx) => {
                const cObj = KRAMA_COLORS.find((c) => c.id === colorId);
                return (
                  <button
                    key={idx}
                    type="button"
                    data-testid={`krama-slot-${idx}`}
                    onClick={() => handleWeaveSlot(idx)}
                    className="manipulative-target flex h-16 w-full items-center justify-center rounded-xl border-2 border-border bg-surface p-1 shadow-xs hover:border-accent"
                  >
                    <span className="sr-only">
                      {cObj
                        ? `ប្រឡោះទី ${idx + 1} ពណ៌ ${cObj.labelKm}`
                        : `ប្រឡោះទំនេរទី ${idx + 1}`}
                    </span>
                    {cObj ? (
                      <svg
                        viewBox="0 0 44 44"
                        className="h-12 w-12"
                        aria-hidden="true"
                      >
                        <rect x={2} y={2} width={40} height={40} rx={8} fill={cObj.fill} />
                        <line x1={2} y1={14} x2={42} y2={14} stroke={cObj.stripe} strokeWidth={3} />
                        <line x1={2} y1={30} x2={42} y2={30} stroke={cObj.stripe} strokeWidth={3} />
                        <line x1={14} y1={2} x2={14} y2={42} stroke={cObj.stripe} strokeWidth={2.5} />
                        <line x1={30} y1={2} x2={30} y2={42} stroke={cObj.stripe} strokeWidth={2.5} />
                      </svg>
                    ) : (
                      <span className="text-base font-bold text-ink-muted" aria-hidden="true">
                        {formatDisplayNumber(idx + 1, numeralPref)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-4 gap-2">
              {KRAMA_COLORS.map((c) => {
                const active = selectedColorId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    data-testid={`krama-color-${c.id}`}
                    aria-pressed={active}
                    onClick={() => {
                      setSelectedColorId(c.id);
                      playScaleNote(c.idx + 3, audioEnabled);
                    }}
                    className={`manipulative-target flex flex-col items-center justify-center gap-1 rounded-2xl border-2 p-2 text-xs font-bold ${
                      active
                        ? "border-accent bg-accent-soft text-ink ring-2 ring-accent/30"
                        : "border-border bg-surface text-ink"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className="h-6 w-6 rounded-full"
                      style={{ backgroundColor: c.fill }}
                    />
                    <span>{c.labelKm}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                data-testid="krama-weave-next-btn"
                onClick={handleWeaveNext}
                className="khmer-chip rounded-xl border border-accent bg-accent-soft px-3.5 text-xs font-bold text-accent"
              >
                + ដាក់ប្រឡោះបន្ទាប់
              </button>
              <button
                type="button"
                data-testid="krama-preset-ab"
                onClick={() => handleApplyPreset("AB")}
                className="khmer-chip rounded-xl border border-border bg-surface px-3 text-xs font-semibold text-ink"
              >
                គំរូ AB
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset("ABC")}
                className="khmer-chip rounded-xl border border-border bg-surface px-3 text-xs font-semibold text-ink"
              >
                គំរូ ABC
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoomSlots(Array.from({ length: 8 }, () => null));
                  setKramaChecked(false);
                }}
                className="khmer-chip rounded-xl border border-border bg-surface-subtle px-3 text-xs font-semibold text-ink-muted"
              >
                សម្អាត
              </button>
            </div>

            {kramaChecked && (
              <div
                data-testid="krama-result-panel"
                role="status"
                aria-live="polite"
                className={`rounded-2xl border-2 p-3.5 text-sm font-bold ${
                  kramaAnalysis.isRepeating
                    ? "border-success bg-success-soft text-ink"
                    : "border-hint bg-hint-soft text-ink"
                }`}
              >
                {formatTextNumerals(kramaAnalysis.messageKm, numeralPref)}
              </div>
            )}

            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                data-testid="krama-check-btn"
                onClick={handleCheckKrama}
                className="khmer-chip flex-1 rounded-2xl bg-accent px-4 py-3 text-sm font-bold text-white shadow-xs hover:bg-accent-hover"
              >
                ពិនិត្យលំនាំក្រមា
              </button>
              <button
                type="button"
                data-testid="krama-play-melody-btn"
                onClick={handlePlayMelody}
                className="khmer-chip rounded-2xl border-2 border-success bg-success-soft px-4 py-3 text-sm font-bold text-success"
              >
                ស្ដាប់ភ្លេងក្រមា
              </button>
            </div>
          </section>
        )}

        {/* MODE 3: Frog Pond Target Jump */}
        {activeMode === "frog" && (
          <section
            data-testid="frog-jump-panel"
            className="rounded-3xl border border-border bg-surface p-4 sm:p-5 shadow-xs space-y-4"
          >
            <div className="flex items-start gap-3 rounded-2xl border border-border bg-canvas p-3.5">
              <MascotFrog
                mood={frogReachedTarget ? "happy" : "curious"}
                size={46}
              />
              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-bold text-accent">
                    នាំកង្កែបលោតដល់ផ្កាឈូកមាស!
                  </p>
                  <span className="rounded-full bg-success-soft px-2.5 py-0.5 text-xs font-bold text-success">
                    ជោគជ័យ៖ {formatDisplayNumber(frogWonCount, numeralPref)} ដង
                  </span>
                </div>
                <p className="text-base font-bold text-ink">
                  ចាប់ផ្ដើមពីលេខ{" "}
                  <strong className="text-accent">
                    {formatDisplayNumber(currentFrogPuzzle.start, numeralPref)}
                  </strong>{" "}
                  → គោលដៅលេខ{" "}
                  <strong className="text-success">
                    {formatDisplayNumber(currentFrogPuzzle.target, numeralPref)}
                  </strong>
                </p>
              </div>
            </div>

            <CelebrationBurst active={frogReachedTarget} />

            {/* Visual Pond Progress SVG (0..20, Safari-safe) */}
            <div className="rounded-2xl border border-border bg-sky-50 p-3 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-ink">
                <span data-testid="frog-current-pos">
                  ទីតាំងកង្កែប៖ {formatDisplayNumber(frogPos, numeralPref)}
                </span>
                <span>
                  ចំនួនលោត៖ {formatDisplayNumber(frogJumps, numeralPref)}
                </span>
              </div>

              <svg
                viewBox="0 0 320 96"
                className="w-full h-auto select-none"
                role="img"
                aria-label={`កង្កែបនៅលេខ ${formatDisplayNumber(frogPos, numeralPref)} ក្នុងគោលដៅលេខ ${formatDisplayNumber(currentFrogPuzzle.target, numeralPref)}`}
              >
                <rect x={0} y={0} width={320} height={96} rx={14} fill="#bae6fd" />
                <line x1={18} y1={60} x2={302} y2={60} stroke="#0284c7" strokeWidth={4} strokeLinecap="round" />

                {/* 0, 10, 20 landmark pads */}
                {[0, 5, 10, 15, 20].map((v) => {
                  const x = 18 + (v / 20) * 284;
                  return (
                    <g key={v}>
                      <line x1={x} y1={52} x2={x} y2={68} stroke="#0369a1" strokeWidth={2.5} />
                      <text x={x} y={84} textAnchor="middle" fontSize={12} fontWeight={700} fill="#0c4a6e">
                        {formatDisplayNumber(v, numeralPref)}
                      </text>
                    </g>
                  );
                })}

                {/* Glowing golden lotus target */}
                {(() => {
                  const tx = 18 + (currentFrogPuzzle.target / 20) * 284;
                  return (
                    <g>
                      <ellipse cx={tx} cy={60} rx={15} ry={7} fill="#4ade80" stroke="#15803d" strokeWidth={1.5} />
                      <circle cx={tx} cy={47} r={10} fill="#facc15" stroke="#b45309" strokeWidth={2} />
                      <text x={tx} y={28} textAnchor="middle" fontSize={12} fontWeight={700} fill="#92400e">
                        {formatDisplayNumber(currentFrogPuzzle.target, numeralPref)}
                      </text>
                    </g>
                  );
                })()}

                {/* Hopping Frog */}
                {(() => {
                  const fx = 18 + (frogPos / 20) * 284;
                  return (
                    <g>
                      <circle cx={fx} cy={46} r={13} fill="#22c55e" stroke="#15803d" strokeWidth={2} />
                      <circle cx={fx - 5} cy={35} r={4} fill="#22c55e" stroke="#15803d" strokeWidth={1.4} />
                      <circle cx={fx + 5} cy={35} r={4} fill="#22c55e" stroke="#15803d" strokeWidth={1.4} />
                      <circle cx={fx - 5} cy={35} r={1.6} fill="#111827" />
                      <circle cx={fx + 5} cy={35} r={1.6} fill="#111827" />
                    </g>
                  );
                })()}
              </svg>
            </div>

            {/* Jump lily-pad buttons (>= 56x56px) */}
            <div className="grid grid-cols-4 gap-2">
              {([-1, 1, 2, 5] as const).map((delta) => (
                <button
                  key={delta}
                  type="button"
                  data-testid={`frog-jump-${delta < 0 ? "m1" : `p${delta}`}`}
                  disabled={frogReachedTarget}
                  onClick={() => handleFrogJump(delta)}
                  className={`manipulative-target rounded-2xl border-2 px-2 text-base font-bold transition-colors disabled:opacity-45 ${
                    delta < 0
                      ? "border-border bg-surface text-ink"
                      : "border-accent bg-accent-soft text-accent hover:bg-accent hover:text-white"
                  }`}
                >
                  {delta > 0 ? "+" : "−"}
                  {formatDisplayNumber(Math.abs(delta), numeralPref)}
                </button>
              ))}
            </div>

            {frogReachedTarget ? (
              <div
                data-testid="frog-win-banner"
                role="status"
                className="rounded-2xl border-2 border-success bg-success-soft p-3.5 text-center space-y-2.5"
              >
                <p className="text-base font-bold text-ink">
                  អស្ចារ្យ! កង្កែបតូចលោតដល់ផ្កាឈូកលេខ{" "}
                  {formatDisplayNumber(currentFrogPuzzle.target, numeralPref)} ហើយ!
                </p>
                <button
                  type="button"
                  data-testid="frog-next-btn"
                  onClick={handleNextFrogPuzzle}
                  className="khmer-chip rounded-2xl bg-success px-5 py-2.5 text-sm font-bold text-white"
                >
                  លេងស្រះបន្ទាប់ →
                </button>
              </div>
            ) : (
              <p className="text-xs text-ink-muted text-center">
                គន្លឹះ៖ {formatTextNumerals(currentFrogPuzzle.hintKm, numeralPref)}
              </p>
            )}
          </section>
        )}

        {/* MODE 4: Mystery Balance Scale */}
        {activeMode === "scale" && (
          <section
            data-testid="mystery-scale-panel"
            className="rounded-3xl border border-border bg-surface p-4 sm:p-5 shadow-xs space-y-4"
          >
            <div className="flex items-start gap-3 rounded-2xl border border-border bg-canvas p-3.5">
              <MascotFrog
                mood={scaleBalanced ? "happy" : "curious"}
                size={46}
              />
              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-bold text-accent">
                    រកលេខអាថ៌កំបាំងក្នុងប្រអប់មាស!
                  </p>
                  <span className="rounded-full bg-success-soft px-2.5 py-0.5 text-xs font-bold text-success">
                    ដោះស្រាយ៖ {formatDisplayNumber(scaleSolvedCount, numeralPref)}
                  </span>
                </div>
                <p className="text-base font-bold text-ink">
                  {formatTextNumerals(
                    `ប្រអប់ ? + ${currentScalePuzzle.knownLeft} = ${currentScalePuzzle.rightTotal}`,
                    numeralPref
                  )}
                </p>
              </div>
            </div>

            <CelebrationBurst active={scaleBalanced} />

            {/* Tilting Mystery Balance SVG */}
            <div className="rounded-2xl border border-border bg-canvas p-3">
              <svg
                viewBox="0 0 320 160"
                className="w-full max-w-[360px] mx-auto h-auto select-none"
                role="img"
                aria-label={`ជញ្ជីងអាថ៌កំបាំង៖ ខាងឆ្វេង ${formatDisplayNumber(scaleLeftTotal, numeralPref)} និងខាងស្ដាំ ${formatDisplayNumber(currentScalePuzzle.rightTotal, numeralPref)}`}
              >
                <polygon points="160,86 136,144 184,144" fill="#d6cfc2" stroke="#78716c" strokeWidth={2} />
                <rect x={112} y={142} width={96} height={10} rx={5} fill="#78716c" />

                <g transform={`rotate(${scaleTilt} 160 88)`}>
                  <line
                    x1={42}
                    y1={88}
                    x2={278}
                    y2={88}
                    stroke={scaleBalanced ? "#15803d" : "#374151"}
                    strokeWidth={6}
                    strokeLinecap="round"
                  />

                  {/* Left pan: Mystery Box + Known */}
                  <rect x={18} y={34} width={104} height={52} rx={12} fill="#fffbeb" stroke="#d97706" strokeWidth={2} />
                  <rect x={26} y={42} width={40} height={36} rx={8} fill={scaleBalanced ? "#dcfce7" : "#fef08a"} stroke="#b45309" strokeWidth={2} />
                  <text x={46} y={66} textAnchor="middle" fontSize={18} fontWeight={700} fill="#92400e">
                    {chosenStone !== null
                      ? formatDisplayNumber(chosenStone, numeralPref)
                      : "?"}
                  </text>
                  <text x={94} y={66} textAnchor="middle" fontSize={16} fontWeight={700} fill="#1f2937">
                    +{formatDisplayNumber(currentScalePuzzle.knownLeft, numeralPref)}
                  </text>

                  {/* Right pan: Target Total */}
                  <rect x={198} y={34} width={104} height={52} rx={12} fill="#eff6ff" stroke="#2563eb" strokeWidth={2} />
                  <text x={250} y={67} textAnchor="middle" fontSize={24} fontWeight={700} fill="#1d4ed8">
                    {formatDisplayNumber(currentScalePuzzle.rightTotal, numeralPref)}
                  </text>
                </g>

                <circle cx={160} cy={88} r={7} fill="#ffffff" stroke="#374151" strokeWidth={2.5} />
              </svg>
            </div>

            {/* Number stones 1..9 (>= 56x56px each) */}
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((stone) => {
                const isPicked = chosenStone === stone;
                return (
                  <button
                    key={stone}
                    type="button"
                    data-testid={`scale-stone-${stone}`}
                    aria-pressed={isPicked}
                    onClick={() => handlePickStone(stone)}
                    className={`manipulative-target rounded-2xl border-2 text-lg font-bold transition-colors ${
                      isPicked && scaleBalanced
                        ? "border-success bg-success text-white"
                        : isPicked
                          ? "border-hint bg-hint-soft text-hint-ink"
                          : "border-border bg-surface text-ink hover:border-accent hover:bg-accent-soft"
                    }`}
                  >
                    {formatDisplayNumber(stone, numeralPref)}
                  </button>
                );
              })}
            </div>

            {scaleBalanced ? (
              <div
                data-testid="scale-win-banner"
                role="status"
                className="rounded-2xl border-2 border-success bg-success-soft p-3.5 text-center space-y-2.5"
              >
                <p className="text-base font-bold text-ink">
                  {formatTextNumerals(
                    `ពូកែណាស់! ${chosenStone} + ${currentScalePuzzle.knownLeft} = ${currentScalePuzzle.rightTotal} — ជញ្ជីងស្មើគ្នាហើយ!`,
                    numeralPref
                  )}
                </p>
                <button
                  type="button"
                  data-testid="scale-next-btn"
                  onClick={handleNextScalePuzzle}
                  className="khmer-chip rounded-2xl bg-success px-5 py-2.5 text-sm font-bold text-white"
                >
                  ជញ្ជីងបន្ទាប់ →
                </button>
              </div>
            ) : (
              chosenStone !== null && (
                <p
                  role="status"
                  className="rounded-xl bg-hint-soft px-3.5 py-2 text-center text-xs font-bold text-hint-ink"
                >
                  {scaleLeftTotal < currentScalePuzzle.rightTotal
                    ? `ខាងឆ្វេងបាន ${formatDisplayNumber(scaleLeftTotal, numeralPref)} នៅស្រាលជាង ${formatDisplayNumber(currentScalePuzzle.rightTotal, numeralPref)} — សាករើសលេខធំជាងនេះបន្តិចណា៎!`
                    : `ខាងឆ្វេងបាន ${formatDisplayNumber(scaleLeftTotal, numeralPref)} ធ្ងន់ជាង ${formatDisplayNumber(currentScalePuzzle.rightTotal, numeralPref)} — សាករើសលេខតូចជាងនេះបន្តិចណា៎!`}
                </p>
              )
            )}
          </section>
        )}

        {/* MODE 5: Math Drawing Studio (Geoboard Shapes + Cambodian Symmetry Art) */}
        {activeMode === "draw" && (
          <section
            data-testid="draw-studio-panel"
            className="rounded-3xl border border-border bg-surface p-4 sm:p-5 shadow-xs space-y-4"
          >
            <div className="flex items-start gap-3 rounded-2xl border border-border bg-canvas p-3.5">
              <MascotFrog
                mood={drawStatus?.ok ? "happy" : "curious"}
                size={46}
              />
              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-bold text-accent">
                    {formatTextNumerals(
                      currentDrawChallenge.titleKm,
                      numeralPref
                    )}
                  </p>
                  <span
                    data-testid="play-draw-solved-count"
                    className="rounded-full bg-success-soft px-2.5 py-0.5 text-xs font-bold text-success"
                  >
                    បានគូរជោគជ័យ៖{" "}
                    {formatDisplayNumber(drawSolvedCount, numeralPref)} រូប
                  </span>
                </div>
                <p
                  data-testid="play-draw-prompt"
                  className="text-base font-bold text-ink"
                >
                  {formatTextNumerals(
                    currentDrawChallenge.step.promptKm,
                    numeralPref
                  )}
                </p>
              </div>
            </div>

            {/* Sub-mode switcher: Geoboard Shapes vs Symmetry Mirror Art */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                data-testid="play-draw-sub-shapes"
                aria-pressed={drawSubMode === "shapes"}
                onClick={() => handleSwitchDrawSubMode("shapes")}
                className={`khmer-chip rounded-2xl border-2 px-3 py-2 text-xs font-bold transition-colors ${
                  drawSubMode === "shapes"
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-border bg-surface text-ink-muted hover:text-ink"
                }`}
              >
                គូររូបធរណីមាត្រ
              </button>
              <button
                type="button"
                data-testid="play-draw-sub-symmetry"
                aria-pressed={drawSubMode === "symmetry"}
                onClick={() => handleSwitchDrawSubMode("symmetry")}
                className={`khmer-chip rounded-2xl border-2 px-3 py-2 text-xs font-bold transition-colors ${
                  drawSubMode === "symmetry"
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-border bg-surface text-ink-muted hover:text-ink"
                }`}
              >
                គូរសិល្បៈស៊ីមេទ្រី
              </button>
            </div>

            <CelebrationBurst active={Boolean(drawStatus?.ok)} />

            <GeometryDraw
              key={`${currentDrawChallenge.id}-${drawChallengeIdx}`}
              step={currentDrawChallenge.step}
              numeralPref={numeralPref}
              disabled={Boolean(drawStatus?.ok)}
              onAnswerChange={(ans) => {
                setDrawAnswer(ans);
                setDrawStatus(null);
              }}
            />

            {drawStatus && (
              <div
                data-testid="play-draw-feedback"
                role="status"
                aria-live="polite"
                className={`rounded-2xl border-2 p-3.5 text-sm font-bold ${
                  drawStatus.ok
                    ? "border-success bg-success-soft text-ink"
                    : "border-hint bg-hint-soft text-ink"
                }`}
              >
                {formatTextNumerals(drawStatus.messageKm, numeralPref)}
              </div>
            )}

            <div className="flex flex-wrap gap-2.5">
              {!drawStatus?.ok ? (
                <button
                  type="button"
                  data-testid="play-draw-check-btn"
                  onClick={handleCheckDrawing}
                  className="khmer-chip btn-3d candy-ocean flex-1 rounded-2xl border-2 border-[#13429E] bg-[#1D5FD6] px-5 py-3 text-base font-extrabold text-white hover:bg-[#1751BA]"
                >
                  ពិនិត្យរូបគូរ
                </button>
              ) : (
                <button
                  type="button"
                  data-testid="play-draw-next-btn"
                  onClick={handleNextDrawChallenge}
                  className="khmer-chip btn-3d candy-leaf flex-1 rounded-2xl border-2 border-[#148F56] bg-[#22C57B] px-5 py-3 text-base font-extrabold text-[#0D2B1D]"
                >
                  រូបបន្ទាប់ →
                </button>
              )}
              <Link
                href="/learn/g05-drawing-shapes-and-symmetry"
                className="khmer-chip btn-3d [--btn-edge:#c9c2b2] inline-flex items-center justify-center rounded-2xl border-2 border-[#c9c2b2] bg-surface px-4 py-3 text-xs font-bold text-ink hover:bg-surface-subtle"
              >
                មេរៀនគូររូប →
              </Link>
            </div>
          </section>
        )}

        {/* MODE 6: Frog's Daily Clock */}
        {activeMode === "clock" && (
          <section
            data-testid="clock-game-panel"
            className="rounded-3xl border border-border bg-surface p-4 sm:p-5 shadow-xs space-y-4"
          >
            <div className="flex items-start gap-3 rounded-2xl border border-border bg-canvas p-3.5">
              <MascotFrog
                mood={clockStatus?.ok ? "happy" : "curious"}
                size={46}
              />
              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-bold text-accent">
                    កាលវិភាគ៖ {currentClockPuzzle.routineKm}
                  </p>
                  <span className="rounded-full bg-success-soft px-2.5 py-0.5 text-xs font-bold text-success">
                    កំណត់ត្រូវ៖{" "}
                    {formatDisplayNumber(clockSolvedCount, numeralPref)} ដង
                  </span>
                </div>
                <p className="text-base font-bold text-ink">
                  {formatTextNumerals(
                    currentClockPuzzle.step.promptKm,
                    numeralPref
                  )}
                </p>
              </div>
            </div>

            <CelebrationBurst active={Boolean(clockStatus?.ok)} />

            <ClockTime
              key={`${currentClockPuzzle.id}-${clockPuzzleIdx}`}
              step={currentClockPuzzle.step}
              numeralPref={numeralPref}
              disabled={Boolean(clockStatus?.ok)}
              onAnswerChange={(ans) => {
                setClockAnswer(ans);
                setClockStatus(null);
              }}
            />

            {clockStatus && (
              <div
                data-testid="play-clock-feedback"
                role="status"
                aria-live="polite"
                className={`rounded-2xl border-2 p-3.5 text-sm font-bold ${
                  clockStatus.ok
                    ? "border-success bg-success-soft text-ink"
                    : "border-hint bg-hint-soft text-ink"
                }`}
              >
                {formatTextNumerals(clockStatus.messageKm, numeralPref)}
              </div>
            )}

            <div className="flex flex-wrap gap-2.5">
              {!clockStatus?.ok ? (
                <button
                  type="button"
                  data-testid="play-clock-check-btn"
                  onClick={handleCheckClock}
                  className="khmer-chip btn-3d candy-ocean flex-1 rounded-2xl border-2 border-[#13429E] bg-[#1D5FD6] px-5 py-3 text-base font-extrabold text-white hover:bg-[#1751BA]"
                >
                  ពិនិត្យម៉ោង
                </button>
              ) : (
                <button
                  type="button"
                  data-testid="play-clock-next-btn"
                  onClick={handleNextClockPuzzle}
                  className="khmer-chip btn-3d candy-leaf flex-1 rounded-2xl border-2 border-[#148F56] bg-[#22C57B] px-5 py-3 text-base font-extrabold text-[#0D2B1D]"
                >
                  ម៉ោងបន្ទាប់ →
                </button>
              )}
              <Link
                href="/learn/t01-telling-time-khmer-clock"
                className="khmer-chip btn-3d [--btn-edge:#c9c2b2] inline-flex items-center justify-center rounded-2xl border-2 border-[#c9c2b2] bg-surface px-4 py-3 text-xs font-bold text-ink hover:bg-surface-subtle"
              >
                មេរៀននាឡិកា →
              </Link>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
