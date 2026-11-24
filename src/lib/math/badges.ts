import type { MasteryTier } from "@/lib/math/mastery";

export interface BadgeProgressSnapshot {
  lessonId: string;
  masteryTier: MasteryTier;
}

export interface MasteryBadge {
  id: string;
  titleKm: string;
  descriptionKm: string;
  icon: "sprout" | "ten" | "krama" | "riel" | "star";
  earned: boolean;
}

const COMPLETED_TIERS = new Set<MasteryTier>([
  "familiar",
  "proficient",
  "mastered",
]);

function isLessonCompleted(
  map: Record<string, BadgeProgressSnapshot>,
  lessonId: string
): boolean {
  const entry = map[lessonId];
  return Boolean(entry && COMPLETED_TIERS.has(entry.masteryTier));
}

/**
 * Computes calm, competence-anchored informational mastery badges from
 * local progress. Zero loot boxes, zero virtual currencies, zero guilt streaks.
 */
export function computeMasteryBadges(
  progressByLesson: Record<string, BadgeProgressSnapshot>
): MasteryBadge[] {
  const completedLessons = Object.values(progressByLesson).filter((p) =>
    COMPLETED_TIERS.has(p.masteryTier)
  );

  return [
    {
      id: "first-step",
      titleKm: "ជំហានដំបូង",
      descriptionKm: "បញ្ចប់មេរៀនដំបូងដោយជោគជ័យ",
      icon: "sprout",
      earned: completedLessons.length >= 1,
    },
    {
      id: "making-ten-hero",
      titleKm: "ម្ចាស់បង្គ្រប់ ១០",
      descriptionKm: "ស្ទាត់វិធីបង្គ្រប់ ១០ (មេរៀនទី ៧)",
      icon: "ten",
      earned: isLessonCompleted(progressByLesson, "l07-making-ten"),
    },
    {
      id: "pattern-explorer",
      titleKm: "អ្នករុករកលំនាំ",
      descriptionKm: "យល់លំនាំក្រមា និងរូបធរណីមាត្រ (មេរៀនទី ៩)",
      icon: "krama",
      earned: isLessonCompleted(progressByLesson, "l09-patterns-and-shapes"),
    },
    {
      id: "riel-fraction-pro",
      titleKm: "ជំនាញប្រាក់រៀល និងប្រភាគ",
      descriptionKm: "រៀបចំប្រាក់រៀល និងចំណែកពាក់កណ្តាល (មេរៀនទី ១០)",
      icon: "riel",
      earned: isLessonCompleted(progressByLesson, "l10-riel-money-and-halves"),
    },
    {
      id: "strong-foundations",
      titleKm: "គ្រឹះគណិតរឹងមាំ",
      descriptionKm: "បញ្ចប់មេរៀនយ៉ាងតិច ៥ ក្នុងគ្រឹះថ្នាក់ដំបូង",
      icon: "star",
      earned: completedLessons.length >= 5,
    },
  ];
}
