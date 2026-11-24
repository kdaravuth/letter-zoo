import type { LearningPathMeta } from "@/lib/curriculum/loader";
import type { LessonDocumentV1 } from "@/lib/curriculum/schema";
import type { ReviewProgressEntry } from "@/lib/math/reviewQueue";
import { buildReviewQueue } from "@/lib/math/reviewQueue";

export interface ParentPathSummary {
  pathId: string;
  titleKm: string;
  totalLessons: number;
  completedLessons: number;
  averageAccuracyPct: number;
}

export interface ParentProgressReport {
  totalCompletedLessons: number;
  totalAvailableLessons: number;
  strengths: Array<{ lesson: LessonDocumentV1; accuracyPct: number }>;
  practiceRecommended: Array<{
    lesson: LessonDocumentV1;
    reasonKm: string;
  }>;
  pathSummaries: ParentPathSummary[];
}

/**
 * Computes a calm, actionable plain-Khmer caregiver progress report
 * from local IndexedDB progress records.
 */
export function buildParentReport(
  paths: LearningPathMeta[],
  progressByLesson: Record<string, ReviewProgressEntry>,
  now: Date = new Date()
): ParentProgressReport {
  const allLessons = paths.flatMap((p) => p.lessons);
  const dueSet = new Set(
    buildReviewQueue(allLessons, progressByLesson, now).due.map(
      (item) => item.lesson.id
    )
  );

  const strengths: Array<{ lesson: LessonDocumentV1; accuracyPct: number }> = [];
  const practiceRecommended: Array<{
    lesson: LessonDocumentV1;
    reasonKm: string;
  }> = [];

  let totalCompletedLessons = 0;

  const pathSummaries: ParentPathSummary[] = paths.map((path) => {
    let completed = 0;
    let accuracySum = 0;
    let accuracyCount = 0;

    for (const lesson of path.lessons) {
      const prog = progressByLesson[lesson.id];
      if (!prog || prog.masteryTier === "not_started") continue;

      if (prog.masteryTier !== "attempted") {
        completed++;
        totalCompletedLessons++;
      }

      if (prog.accuracyPct > 0 || prog.completedAt) {
        accuracySum += prog.accuracyPct;
        accuracyCount++;
      }

      if (
        prog.masteryTier === "proficient" ||
        prog.masteryTier === "mastered" ||
        prog.accuracyPct >= 85
      ) {
        strengths.push({ lesson, accuracyPct: prog.accuracyPct });
      }

      if (dueSet.has(lesson.id)) {
        practiceRecommended.push({
          lesson,
          reasonKm: "ដល់ពេលរំលឹកឡើងវិញតាមប្រអប់ Leitner",
        });
      } else if (prog.masteryTier === "attempted" || prog.accuracyPct < 80) {
        practiceRecommended.push({
          lesson,
          reasonKm: "គួរអនុវត្តបន្ថែមដើម្បីបង្កើនទំនុកចិត្ត",
        });
      }
    }

    return {
      pathId: path.id,
      titleKm: path.titleKm,
      totalLessons: path.lessons.length,
      completedLessons: completed,
      averageAccuracyPct:
        accuracyCount > 0 ? Math.round(accuracySum / accuracyCount) : 0,
    };
  });

  return {
    totalCompletedLessons,
    totalAvailableLessons: allLessons.length,
    strengths,
    practiceRecommended,
    pathSummaries,
  };
}
