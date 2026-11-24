import React from "react";
import { loadDailyPuzzles } from "@/lib/curriculum/dailyLoader";
import { DailyPuzzleClient } from "@/components/daily/DailyPuzzleClient";

export default function DailyPuzzlePage() {
  const puzzles = loadDailyPuzzles();
  return <DailyPuzzleClient puzzles={puzzles} />;
}
