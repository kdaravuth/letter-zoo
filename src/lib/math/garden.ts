import type { MasteryTier } from "@/lib/math/mastery";
import { computeMasteryBadges } from "@/lib/math/badges";

export interface GardenProgressEntry {
  lessonId: string;
  masteryTier: MasteryTier;
}

export interface GardenState {
  mangoCount: number; // 2 starter + up to 10 from Early Foundations
  lotusCount: number; // 1 starter + up to 7 from Geometry/Fractions/Daily
  butterflyCount: number; // 1 starter + earned badges
  completedLessonsTotal: number;
  dailyPuzzlesCompleted: number;
  gardenLevelKm: string;
}

const COMPLETED_TIERS = new Set<MasteryTier>([
  "familiar",
  "proficient",
  "mastered",
]);

/**
 * Pure deterministic garden growth computation from local IndexedDB progress.
 * Always seeds a warm starter orchard (2 mangoes, 1 lotus, 1 butterfly) so
 * brand-new children can interact and enjoy the garden immediately.
 */
export function computeGardenState(
  progressByLesson: Record<string, GardenProgressEntry>
): GardenState {
  let earlyDone = 0;
  let upperDone = 0;
  let dailyDone = 0;

  for (const entry of Object.values(progressByLesson)) {
    if (!COMPLETED_TIERS.has(entry.masteryTier)) continue;
    if (entry.lessonId.startsWith("daily:")) {
      dailyDone++;
    } else if (entry.lessonId.startsWith("l")) {
      earlyDone++;
    } else {
      upperDone++;
    }
  }

  const badgesEarned = computeMasteryBadges(progressByLesson).filter(
    (b) => b.earned
  ).length;

  const completedLessonsTotal = earlyDone + upperDone;
  const mangoCount = Math.min(12, 2 + earlyDone);
  const lotusCount = Math.min(8, 1 + upperDone + Math.min(3, dailyDone));
  const butterflyCount = Math.min(6, 1 + badgesEarned);

  let gardenLevelKm = "សួនតូចកំពុងលូតលាស់";
  if (completedLessonsTotal >= 10) {
    gardenLevelKm = "សួនគណិតរីកស្គុះស្គាយ";
  } else if (completedLessonsTotal >= 4) {
    gardenLevelKm = "សួនផ្លែឈើស្រស់បំព្រង";
  } else if (completedLessonsTotal >= 1 || dailyDone >= 1) {
    gardenLevelKm = "សួនផ្កាឈូកកំពុងរីក";
  }

  return {
    mangoCount,
    lotusCount,
    butterflyCount,
    completedLessonsTotal,
    dailyPuzzlesCompleted: dailyDone,
    gardenLevelKm,
  };
}
