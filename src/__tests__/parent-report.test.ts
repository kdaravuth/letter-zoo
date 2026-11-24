import { describe, expect, it } from "vitest";
import { buildParentReport } from "@/lib/math/parentReport";
import type { LearningPathMeta } from "@/lib/curriculum/loader";
import type { LessonDocumentV1 } from "@/lib/curriculum/schema";

const stubLesson = (id: string, pathId: string, order: number): LessonDocumentV1 => ({
  schemaVersion: "1.0",
  id,
  pathId,
  order,
  moeysGradeRef: "G4",
  topicSlug: "geometry",
  titleKm: `មេរៀន ${id}`,
  subtitleKm: "សេចក្ដីសង្ខេប",
  estimatedMinutes: 8,
  learningObjectiveKm: "គោលបំណង",
  steps: [],
});

describe("Parent progress report analytics", () => {
  const paths: LearningPathMeta[] = [
    {
      id: "geometry-foundations",
      titleKm: "ធរណីមាត្រ",
      shortTitleKm: "ធរណីមាត្រ",
      subtitleKm: "រូបធរណីមាត្រ",
      gradeRangeKm: "ថ្នាក់ ៣–៥",
      lessons: [
        stubLesson("g01", "geometry-foundations", 1),
        stubLesson("g02", "geometry-foundations", 2),
      ],
    },
  ];

  it("classifies strengths and practice recommendations accurately", () => {
    const report = buildParentReport(
      paths,
      {
        g01: {
          lessonId: "g01",
          masteryTier: "proficient",
          leitnerBox: 3,
          nextReviewAt: "2026-12-01T00:00:00.000Z",
          accuracyPct: 100,
          completedAt: "2026-11-23T00:00:00.000Z",
        },
        g02: {
          lessonId: "g02",
          masteryTier: "attempted",
          leitnerBox: 1,
          nextReviewAt: "2026-11-20T00:00:00.000Z",
          accuracyPct: 60,
          completedAt: null,
        },
      },
      new Date("2026-11-23T12:00:00.000Z")
    );

    expect(report.totalCompletedLessons).toBe(1);
    expect(report.totalAvailableLessons).toBe(2);
    expect(report.strengths.map((s) => s.lesson.id)).toEqual(["g01"]);
    expect(report.practiceRecommended.map((p) => p.lesson.id)).toEqual(["g02"]);
  });
});
