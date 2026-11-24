import { describe, expect, it } from "vitest";
import { computeMasteryBadges } from "@/lib/math/badges";

describe("Calm informational mastery badges", () => {
  it("starts with 0 earned badges for a brand new learner", () => {
    const badges = computeMasteryBadges({});
    expect(badges.length).toBe(5);
    expect(badges.every((b) => !b.earned)).toBe(true);
  });

  it("unlocks milestone badges as lessons reach familiar or higher", () => {
    const badges = computeMasteryBadges({
      "l01-counting-1-5": {
        lessonId: "l01-counting-1-5",
        masteryTier: "familiar",
      },
      "l07-making-ten": {
        lessonId: "l07-making-ten",
        masteryTier: "proficient",
      },
      "l09-patterns-and-shapes": {
        lessonId: "l09-patterns-and-shapes",
        masteryTier: "mastered",
      },
      "l10-riel-money-and-halves": {
        lessonId: "l10-riel-money-and-halves",
        masteryTier: "familiar",
      },
      "l03-comparing-numbers": {
        lessonId: "l03-comparing-numbers",
        masteryTier: "familiar",
      },
    });

    expect(badges.every((b) => b.earned)).toBe(true);
  });

  it("does not award completion badges for attempted-only progress", () => {
    const badges = computeMasteryBadges({
      "l07-making-ten": {
        lessonId: "l07-making-ten",
        masteryTier: "attempted",
      },
    });
    expect(badges.every((b) => !b.earned)).toBe(true);
  });
});
