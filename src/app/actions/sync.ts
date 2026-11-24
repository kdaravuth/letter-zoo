"use server";

import { z } from "zod";
import { getDb } from "@/db";
import { studentLessonProgress, studentProfiles } from "@/db/schema";

const ProfilePayloadSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1).max(60),
  avatarId: z.string().min(1).max(32),
  ageYears: z.number().int().min(5).max(16),
  gradeLevel: z.number().int().min(1).max(6),
  numeralPreference: z.enum(["km", "latn"]),
  audioEnabled: z.boolean(),
  weeklyGoalDays: z.number().int().min(1).max(7),
  totalXp: z.number().int().min(0),
});

const ProgressPayloadSchema = z.object({
  id: z.string().min(1),
  studentId: z.string().min(1),
  lessonId: z.string().min(1),
  masteryTier: z.enum([
    "not_started",
    "attempted",
    "familiar",
    "proficient",
    "mastered",
  ]),
  leitnerBox: z.number().int().min(1).max(5),
  nextReviewAt: z.string().nullable(),
  accuracyPct: z.number().int().min(0).max(100),
  hintsUsed: z.number().int().min(0),
  attemptsCount: z.number().int().min(0),
  completedAt: z.string().nullable(),
});

const SyncBatchSchema = z.array(
  z.discriminatedUnion("kind", [
    z.object({
      id: z.string().min(1),
      kind: z.literal("profile_upsert"),
      payload: ProfilePayloadSchema,
    }),
    z.object({
      id: z.string().min(1),
      kind: z.literal("progress_upsert"),
      payload: ProgressPayloadSchema,
    }),
  ])
);

export interface SyncBatchResult {
  mode: "postgres" | "local-only";
  syncedIds: string[];
  error?: string;
}

/**
 * Flushes local IndexedDB outbox items to PostgreSQL via Drizzle ORM.
 * When DATABASE_URL is not configured, safely acknowledges local-only mode
 * so offline-first learning and local builds/tests operate seamlessly.
 */
export async function syncOutboxBatch(
  rawItems: unknown
): Promise<SyncBatchResult> {
  const parsed = SyncBatchSchema.safeParse(rawItems);
  if (!parsed.success) {
    return {
      mode: "local-only",
      syncedIds: [],
      error: "Invalid sync payload",
    };
  }

  const db = getDb();
  if (!db) {
    return {
      mode: "local-only",
      syncedIds: parsed.data.map((item) => item.id),
    };
  }

  const syncedIds: string[] = [];

  for (const item of parsed.data) {
    try {
      if (item.kind === "profile_upsert") {
        const p = item.payload;
        await db
          .insert(studentProfiles)
          .values({
            id: p.id,
            displayName: p.displayName,
            avatarId: p.avatarId,
            ageYears: p.ageYears,
            gradeLevel: p.gradeLevel,
            numeralPreference: p.numeralPreference,
            audioEnabled: p.audioEnabled ? 1 : 0,
            weeklyGoalDays: p.weeklyGoalDays,
            totalXp: p.totalXp,
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: studentProfiles.id,
            set: {
              displayName: p.displayName,
              avatarId: p.avatarId,
              ageYears: p.ageYears,
              gradeLevel: p.gradeLevel,
              numeralPreference: p.numeralPreference,
              audioEnabled: p.audioEnabled ? 1 : 0,
              weeklyGoalDays: p.weeklyGoalDays,
              totalXp: p.totalXp,
              updatedAt: new Date(),
            },
          });
        syncedIds.push(item.id);
      } else {
        const pr = item.payload;
        await db
          .insert(studentLessonProgress)
          .values({
            id: pr.id,
            studentId: pr.studentId,
            lessonId: pr.lessonId,
            masteryTier: pr.masteryTier,
            leitnerBox: pr.leitnerBox,
            nextReviewAt: pr.nextReviewAt ? new Date(pr.nextReviewAt) : null,
            accuracyPct: pr.accuracyPct,
            hintsUsed: pr.hintsUsed,
            attemptsCount: pr.attemptsCount,
            completedAt: pr.completedAt ? new Date(pr.completedAt) : null,
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: studentLessonProgress.id,
            set: {
              masteryTier: pr.masteryTier,
              leitnerBox: pr.leitnerBox,
              nextReviewAt: pr.nextReviewAt ? new Date(pr.nextReviewAt) : null,
              accuracyPct: pr.accuracyPct,
              hintsUsed: pr.hintsUsed,
              attemptsCount: pr.attemptsCount,
              completedAt: pr.completedAt ? new Date(pr.completedAt) : null,
              updatedAt: new Date(),
            },
          });
        syncedIds.push(item.id);
      }
    } catch {
      // Keep unsynced items in outbox for retry when backend/schema is ready
    }
  }

  return {
    mode: "postgres",
    syncedIds,
  };
}
