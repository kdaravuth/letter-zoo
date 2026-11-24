import { z } from "zod";
import { ActivityStepSchema } from "./schema";

export const DailyPuzzleItemSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  titleKm: z.string().min(2).max(80),
  subtitleKm: z.string().min(2).max(120),
  topicSlug: z.string().min(1),
  estimatedMinutes: z.number().int().min(1).max(5).default(2),
  step: ActivityStepSchema,
});

export const DailyPuzzlePackV1Schema = z.object({
  schemaVersion: z.literal("1.0"),
  puzzles: z.array(DailyPuzzleItemSchema).min(1),
});

export type DailyPuzzleItem = z.infer<typeof DailyPuzzleItemSchema>;
export type DailyPuzzlePackV1 = z.infer<typeof DailyPuzzlePackV1Schema>;

/**
 * Pure deterministic selector returning today's 2-minute visual puzzle
 * from a calendar date string (YYYY-MM-DD). Works identically offline.
 */
export function getDailyPuzzleForDate(
  puzzles: DailyPuzzleItem[],
  dateIso: string
): DailyPuzzleItem | null {
  if (puzzles.length === 0) return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateIso.trim());
  if (!match) {
    return puzzles[0];
  }

  const utcMs = Date.UTC(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3])
  );
  const dayNumber = Math.floor(utcMs / (24 * 60 * 60 * 1000));
  const idx = ((dayNumber % puzzles.length) + puzzles.length) % puzzles.length;
  return puzzles[idx] ?? puzzles[0];
}

export function getDailyProgressKey(dateIso: string): string {
  return `daily:${dateIso}`;
}
