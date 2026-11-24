import type { LessonDocumentV1 } from "@/lib/curriculum/schema";
import type { MasteryTier } from "@/lib/math/mastery";

export interface ReviewProgressEntry {
  lessonId: string;
  masteryTier: MasteryTier;
  leitnerBox: number;
  nextReviewAt: string | null;
  accuracyPct: number;
  completedAt: string | null;
}

export interface ReviewQueueItem {
  lesson: LessonDocumentV1;
  progress: ReviewProgressEntry;
  isDue: boolean;
  daysUntilDue: number; // <= 0 means due or overdue
}

export interface ReviewQueueResult {
  due: ReviewQueueItem[];
  upcoming: ReviewQueueItem[];
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Pure deterministic Leitner due-review queue builder.
 * Surfaces lessons whose nextReviewAt <= now sorted by oldest overdue first,
 * then lowest Leitner box first, without punitive streaks.
 */
export function buildReviewQueue(
  lessons: LessonDocumentV1[],
  progressByLesson: Record<string, ReviewProgressEntry>,
  now: Date = new Date()
): ReviewQueueResult {
  const due: ReviewQueueItem[] = [];
  const upcoming: ReviewQueueItem[] = [];
  const nowMs = now.getTime();

  for (const lesson of lessons) {
    const progress = progressByLesson[lesson.id];
    if (!progress || progress.masteryTier === "not_started") {
      continue;
    }

    if (!progress.nextReviewAt) {
      // Attempted lesson without scheduled review yet belongs in upcoming practice
      upcoming.push({
        lesson,
        progress,
        isDue: false,
        daysUntilDue: 1,
      });
      continue;
    }

    const reviewMs = new Date(progress.nextReviewAt).getTime();
    if (!Number.isFinite(reviewMs)) continue;

    const diffDays = Math.ceil((reviewMs - nowMs) / MS_PER_DAY);
    const isDue = reviewMs <= nowMs;

    const item: ReviewQueueItem = {
      lesson,
      progress,
      isDue,
      daysUntilDue: diffDays,
    };

    if (isDue) {
      due.push(item);
    } else {
      upcoming.push(item);
    }
  }

  due.sort((a, b) => {
    const aTime = a.progress.nextReviewAt
      ? new Date(a.progress.nextReviewAt).getTime()
      : 0;
    const bTime = b.progress.nextReviewAt
      ? new Date(b.progress.nextReviewAt).getTime()
      : 0;
    if (aTime !== bTime) return aTime - bTime;
    return a.progress.leitnerBox - b.progress.leitnerBox;
  });

  upcoming.sort((a, b) => a.daysUntilDue - b.daysUntilDue);

  return { due, upcoming };
}
