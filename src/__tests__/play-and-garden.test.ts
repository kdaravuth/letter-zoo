import { describe, expect, it } from "vitest";
import { computeGardenState } from "@/lib/math/garden";
import { detectKramaPattern } from "@/lib/math/kramaPattern";

describe("Living Khmer Garden growth logic", () => {
  it("seeds a welcoming starter garden even before any lesson is finished", () => {
    const g = computeGardenState({});
    expect(g.mangoCount).toBe(2);
    expect(g.lotusCount).toBe(1);
    expect(g.butterflyCount).toBe(1);
  });

  it("grows mangoes, lotuses, and butterflies from completed lessons & daily puzzles", () => {
    const g = computeGardenState({
      "l01-counting-1-5": {
        lessonId: "l01-counting-1-5",
        masteryTier: "familiar",
      },
      "l07-making-ten": {
        lessonId: "l07-making-ten",
        masteryTier: "proficient",
      },
      "g01-shapes-and-sides": {
        lessonId: "g01-shapes-and-sides",
        masteryTier: "familiar",
      },
      "daily:2026-11-23": {
        lessonId: "daily:2026-11-23",
        masteryTier: "mastered",
      },
    });

    expect(g.mangoCount).toBe(4); // 2 starter + 2 Early Foundations
    expect(g.lotusCount).toBe(3); // 1 starter + 1 Geometry + 1 Daily
    expect(g.butterflyCount).toBeGreaterThanOrEqual(3); // 1 starter + >=2 badges
  });
});

describe("Krama repeating pattern detector", () => {
  it("detects AB, ABC, and AABB repeating patterns accurately", () => {
    const ab = detectKramaPattern([
      "red",
      "blue",
      "red",
      "blue",
      "red",
      "blue",
      "red",
      "blue",
    ]);
    expect(ab.isRepeating).toBe(true);
    expect(ab.patternCode).toBe("AB");

    const abc = detectKramaPattern([
      "gold",
      "green",
      "red",
      "gold",
      "green",
      "red",
      "gold",
      "green",
    ]);
    expect(abc.isRepeating).toBe(true);
    expect(abc.patternCode).toBe("ABC");

    const aabb = detectKramaPattern([
      "blue",
      "blue",
      "red",
      "red",
      "blue",
      "blue",
      "red",
      "red",
    ]);
    expect(aabb.isRepeating).toBe(true);
    expect(aabb.patternCode).toBe("AABB");
  });

  it("handles incomplete or freeform non-repeating weaves calmly", () => {
    const incomplete = detectKramaPattern(["red", null, "red", "blue"]);
    expect(incomplete.isComplete).toBe(false);
    expect(incomplete.isRepeating).toBe(false);

    const freeform = detectKramaPattern([
      "red",
      "blue",
      "gold",
      "green",
      "red",
      "red",
      "blue",
      "gold",
    ]);
    expect(freeform.isComplete).toBe(true);
    expect(freeform.isRepeating).toBe(false);
  });
});
