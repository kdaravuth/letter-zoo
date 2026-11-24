export type MasteryTier =
  | "not_started"
  | "attempted"
  | "familiar"
  | "proficient"
  | "mastered";

export const LEITNER_INTERVAL_DAYS = [1, 2, 4, 8, 16] as const;

export interface CurrentMasteryState {
  masteryTier: MasteryTier;
  leitnerBox: number; // 1..5
  attemptsCount: number;
}

export interface LessonCompletionMetrics {
  accuracyPct: number; // 0..100
  usedTier3Hint: boolean;
  now?: Date;
}

export interface MasteryUpdateResult {
  masteryTier: MasteryTier;
  leitnerBox: number;
  intervalDays: number;
  nextReviewAt: Date;
  attemptsCount: number;
  xpEarned: number;
}

const MASTERY_RANK: Record<MasteryTier, number> = {
  not_started: 0,
  attempted: 1,
  familiar: 2,
  proficient: 3,
  mastered: 4,
};

export function clampLeitnerBox(box: number): number {
  if (!Number.isFinite(box)) return 1;
  return Math.max(1, Math.min(LEITNER_INTERVAL_DAYS.length, Math.round(box)));
}

export function getLeitnerIntervalDays(box: number): number {
  const clamped = clampLeitnerBox(box);
  return LEITNER_INTERVAL_DAYS[clamped - 1];
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date.getTime());
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

/**
 * Pure deterministic 4-tier mastery & 5-box Leitner spaced review scheduler.
 *
 * Transitions:
 * - accuracy < 70% => at least "attempted", box resets to 1 (1 day)
 * - 70%..99% (or 100% with Tier 3 hint) => "familiar" on first completion (box 2, 2 days);
 *   if already familiar and accuracy >= 85% without Tier 3 hint => "proficient" (+1 box)
 * - 100% without Tier 3 hint => "proficient" from not_started/attempted/familiar (+1 box),
 *   or "mastered" when already proficient/mastered (+1 box up to box 5 / 16 days)
 */
export function computeMasteryUpdate(
  current: CurrentMasteryState,
  metrics: LessonCompletionMetrics
): MasteryUpdateResult {
  const now = metrics.now ?? new Date();
  const accuracy = Math.max(0, Math.min(100, Math.round(metrics.accuracyPct)));
  const currentBox = clampLeitnerBox(current.leitnerBox || 1);
  const attemptsCount = Math.max(0, current.attemptsCount) + 1;

  let nextTier: MasteryTier = current.masteryTier;
  let nextBox = currentBox;

  if (accuracy < 70) {
    nextTier =
      MASTERY_RANK[current.masteryTier] < MASTERY_RANK.attempted
        ? "attempted"
        : current.masteryTier;
    nextBox = 1;
  } else if (accuracy === 100 && !metrics.usedTier3Hint) {
    if (
      current.masteryTier === "proficient" ||
      current.masteryTier === "mastered"
    ) {
      nextTier = "mastered";
    } else {
      nextTier = "proficient";
    }
    nextBox = clampLeitnerBox(currentBox + 1);
  } else {
    // 70%..99%, or 100% with Tier 3 hint assistance
    if (
      current.masteryTier === "not_started" ||
      current.masteryTier === "attempted"
    ) {
      nextTier = "familiar";
      nextBox = clampLeitnerBox(Math.max(2, currentBox + 1));
    } else if (
      current.masteryTier === "familiar" &&
      accuracy >= 85 &&
      !metrics.usedTier3Hint
    ) {
      nextTier = "proficient";
      nextBox = clampLeitnerBox(currentBox + 1);
    } else {
      nextTier = current.masteryTier;
      nextBox =
        accuracy >= 85 ? clampLeitnerBox(currentBox + 1) : currentBox;
    }
  }

  const intervalDays = getLeitnerIntervalDays(nextBox);
  const nextReviewAt = addDays(now, intervalDays);

  let xpEarned = 20;
  if (accuracy >= 80) xpEarned += 10;
  if (accuracy === 100 && !metrics.usedTier3Hint) xpEarned += 10;

  return {
    masteryTier: nextTier,
    leitnerBox: nextBox,
    intervalDays,
    nextReviewAt,
    attemptsCount,
    xpEarned,
  };
}

export const MASTERY_LABELS_KM: Record<MasteryTier, string> = {
  not_started: "មិនទាន់រៀន",
  attempted: "បានសាកល្បង",
  familiar: "ស្គាល់គោលគំនិត",
  proficient: "ស្ទាត់ជំនាញ",
  mastered: "ចេះចាំយ៉ាងច្បាស់",
};
