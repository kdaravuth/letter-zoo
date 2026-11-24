import {
  pgTable,
  text,
  integer,
  timestamp,
  jsonb,
  pgEnum,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import type { LessonDocumentV1 } from "@/lib/curriculum/schema";

export const masteryTierEnum = pgEnum("mastery_tier", [
  "not_started",
  "attempted",
  "familiar",
  "proficient",
  "mastered",
]);

export const studentProfiles = pgTable("student_profiles", {
  id: text("id").primaryKey(),
  displayName: text("display_name").notNull(),
  avatarId: text("avatar_id").notNull().default("lotus"),
  ageYears: integer("age_years").notNull(),
  gradeLevel: integer("grade_level").notNull(), // 1-6 advisory, never locks paths
  numeralPreference: text("numeral_preference").notNull().default("km"), // "km" | "latn"
  audioEnabled: integer("audio_enabled").notNull().default(1),
  weeklyGoalDays: integer("weekly_goal_days").notNull().default(3),
  totalXp: integer("total_xp").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const lessons = pgTable(
  "lessons",
  {
    id: text("id").primaryKey(),
    pathId: text("path_id").notNull(),
    sortOrder: integer("sort_order").notNull(),
    moeysGradeRef: text("moeys_grade_ref").notNull(),
    topicSlug: text("topic_slug").notNull(),
    titleKm: text("title_km").notNull(),
    contentVersion: integer("content_version").notNull().default(1),
    status: text("status").notNull().default("published"), // "draft" | "published"
    payload: jsonb("payload").$type<LessonDocumentV1>().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("lessons_path_order_idx").on(t.pathId, t.sortOrder)]
);

export const studentLessonProgress = pgTable(
  "student_lesson_progress",
  {
    id: text("id").primaryKey(),
    studentId: text("student_id")
      .notNull()
      .references(() => studentProfiles.id, { onDelete: "cascade" }),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    masteryTier: masteryTierEnum("mastery_tier")
      .notNull()
      .default("not_started"),
    leitnerBox: integer("leitner_box").notNull().default(1),
    nextReviewAt: timestamp("next_review_at", { withTimezone: true }),
    accuracyPct: integer("accuracy_pct").notNull().default(0),
    hintsUsed: integer("hints_used").notNull().default(0),
    attemptsCount: integer("attempts_count").notNull().default(0),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("student_lesson_unique_idx").on(t.studentId, t.lessonId),
    index("student_review_due_idx").on(t.studentId, t.nextReviewAt),
  ]
);

export type StudentProfileRow = typeof studentProfiles.$inferSelect;
export type LessonRow = typeof lessons.$inferSelect;
export type StudentLessonProgressRow =
  typeof studentLessonProgress.$inferSelect;
