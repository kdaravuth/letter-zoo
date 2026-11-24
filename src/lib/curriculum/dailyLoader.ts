import fs from "node:fs";
import path from "node:path";
import {
  DailyPuzzlePackV1Schema,
  type DailyPuzzleItem,
} from "./daily";

const DAILY_PACK_PATH = path.join(process.cwd(), "content", "daily", "puzzles.json");

export function loadDailyPuzzles(): DailyPuzzleItem[] {
  if (!fs.existsSync(DAILY_PACK_PATH)) {
    return [];
  }
  const raw = fs.readFileSync(DAILY_PACK_PATH, "utf-8");
  const json: unknown = JSON.parse(raw);
  const parsed = DailyPuzzlePackV1Schema.safeParse(json);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new Error(`Invalid daily puzzle pack: ${issues}`);
  }
  return parsed.data.puzzles;
}
