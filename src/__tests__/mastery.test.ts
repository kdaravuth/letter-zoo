import { describe, expect, it } from "vitest";
import {
  computeMasteryUpdate,
  LEITNER_INTERVAL_DAYS,
} from "@/lib/math/mastery";

describe("4-tier mastery and 5-box Leitner scheduler", () => {
  const baseDate = new Date("2026-11-23T00:00:00.000Z");

  it("exposes 5-box Leitner intervals [1, 2, 4, 8, 16]", () => {
    expect([...LEITNER_INTERVAL_DAYS]).toEqual([1, 2, 4, 8, 16]);
  });

  it("transitions not_started + 85% accuracy to familiar, box 2, +2 days", () => {
    const res = computeMasteryUpdate(
      { masteryTier: "not_started", leitnerBox: 1, attemptsCount: 0 },
      { accuracyPct: 85, usedTier3Hint: false, now: baseDate }
    );

    expect(res.masteryTier).toBe("familiar");
    expect(res.leitnerBox).toBe(2);
    expect(res.intervalDays).toBe(2);
    expect(res.nextReviewAt.toISOString()).toBe("2026-11-25T00:00:00.000Z");
    expect(res.attemptsCount).toBe(1);
    expect(res.xpEarned).toBe(30);
  });

  it("transitions not_started + 100% without Tier 3 hint to proficient and advances box", () => {
    const res = computeMasteryUpdate(
      { masteryTier: "not_started", leitnerBox: 1, attemptsCount: 0 },
      { accuracyPct: 100, usedTier3Hint: false, now: baseDate }
    );

    expect(res.masteryTier).toBe("proficient");
    expect(res.leitnerBox).toBe(2);
    expect(res.intervalDays).toBe(2);
    expect(res.xpEarned).toBe(40);
  });

  it("caps first-time 100% with Tier 3 hint to familiar rather than proficient", () => {
    const res = computeMasteryUpdate(
      { masteryTier: "not_started", leitnerBox: 1, attemptsCount: 0 },
      { accuracyPct: 100, usedTier3Hint: true, now: baseDate }
    );

    expect(res.masteryTier).toBe("familiar");
    expect(res.leitnerBox).toBe(2);
  });

  it("transitions proficient -> mastered on clean 100% review and advances Leitner box", () => {
    const res = computeMasteryUpdate(
      { masteryTier: "proficient", leitnerBox: 3, attemptsCount: 2 },
      { accuracyPct: 100, usedTier3Hint: false, now: baseDate }
    );

    expect(res.masteryTier).toBe("mastered");
    expect(res.leitnerBox).toBe(4);
    expect(res.intervalDays).toBe(8);
    expect(res.nextReviewAt.toISOString()).toBe("2026-12-01T00:00:00.000Z");
  });

  it("clamps Leitner box at 5 (16 days) and handles low accuracy gently", () => {
    const maxed = computeMasteryUpdate(
      { masteryTier: "mastered", leitnerBox: 5, attemptsCount: 5 },
      { accuracyPct: 100, usedTier3Hint: false, now: baseDate }
    );
    expect(maxed.leitnerBox).toBe(5);
    expect(maxed.intervalDays).toBe(16);

    const low = computeMasteryUpdate(
      { masteryTier: "not_started", leitnerBox: 1, attemptsCount: 0 },
      { accuracyPct: 50, usedTier3Hint: true, now: baseDate }
    );
    expect(low.masteryTier).toBe("attempted");
    expect(low.leitnerBox).toBe(1);
    expect(low.intervalDays).toBe(1);
    expect(low.xpEarned).toBe(20);
  });
});
