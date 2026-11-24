import { describe, expect, it } from "vitest";
import { buildReviewQueue } from "@/lib/math/reviewQueue";
import {
  getDailyProgressKey,
  getDailyPuzzleForDate,
  type DailyPuzzleItem,
} from "@/lib/curriculum/daily";
import type { LessonDocumentV1 } from "@/lib/curriculum/schema";

const mockLesson = (id: string, order: number): LessonDocumentV1 => ({
  schemaVersion: "1.0",
  id,
  pathId: "early-foundations",
  order,
  moeysGradeRef: "G1",
  topicSlug: "number-sense",
  titleKm: `មេរៀន ${order}`,
  subtitleKm: "សេចក្ដីសង្ខេប",
  estimatedMinutes: 6,
  learningObjectiveKm: "គោលបំណងរៀន",
  steps: [],
});

describe("Leitner due-review queue", () => {
  const now = new Date("2026-11-23T12:00:00.000Z");
  const lessons = [
    mockLesson("l01", 1),
    mockLesson("l02", 2),
    mockLesson("l03", 3),
    mockLesson("l04", 4),
  ];

  it("separates overdue due lessons from upcoming ones and sorts oldest due first", () => {
    const queue = buildReviewQueue(
      lessons,
      {
        l01: {
          lessonId: "l01",
          masteryTier: "familiar",
          leitnerBox: 2,
          nextReviewAt: "2026-11-22T00:00:00.000Z", // 1.5 days overdue
          accuracyPct: 85,
          completedAt: "2026-11-20T00:00:00.000Z",
        },
        l02: {
          lessonId: "l02",
          masteryTier: "proficient",
          leitnerBox: 1,
          nextReviewAt: "2026-11-20T00:00:00.000Z", // 3.5 days overdue (oldest!)
          accuracyPct: 100,
          completedAt: "2026-11-19T00:00:00.000Z",
        },
        l03: {
          lessonId: "l03",
          masteryTier: "familiar",
          leitnerBox: 2,
          nextReviewAt: "2026-11-26T00:00:00.000Z", // upcoming (+3 days)
          accuracyPct: 80,
          completedAt: "2026-11-23T00:00:00.000Z",
        },
        l04: {
          lessonId: "l04",
          masteryTier: "not_started",
          leitnerBox: 1,
          nextReviewAt: null,
          accuracyPct: 0,
          completedAt: null,
        },
      },
      now
    );

    expect(queue.due.map((i) => i.lesson.id)).toEqual(["l02", "l01"]);
    expect(queue.upcoming.map((i) => i.lesson.id)).toEqual(["l03"]);
  });
});

describe("Daily visual puzzle deterministic selector", () => {
  const puzzles = ["p1", "p2", "p3"].map(
    (id) =>
      ({
        id,
        titleKm: id,
        subtitleKm: id,
        topicSlug: "number-sense",
        estimatedMinutes: 2,
      }) as DailyPuzzleItem
  );

  it("picks the same puzzle for the same date and rotates across consecutive days", () => {
    const a1 = getDailyPuzzleForDate(puzzles, "2026-11-23");
    const a2 = getDailyPuzzleForDate(puzzles, "2026-11-23");
    const nextDay = getDailyPuzzleForDate(puzzles, "2026-11-24");

    expect(a1?.id).toBe(a2?.id);
    expect(nextDay?.id).not.toBe(a1?.id);
    expect(getDailyProgressKey("2026-11-23")).toBe("daily:2026-11-23");
  });
});
