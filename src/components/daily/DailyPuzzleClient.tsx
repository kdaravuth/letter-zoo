"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  getDailyProgressKey,
  getDailyPuzzleForDate,
  type DailyPuzzleItem,
} from "@/lib/curriculum/daily";
import { gradeStep, type GradeResult, type StepAnswer } from "@/lib/math/grader";
import {
  formatDisplayNumber,
  formatTextNumerals,
} from "@/lib/khmer/numerals";
import { useLearner } from "@/components/providers/LearnerProvider";
import { NumeralToggle } from "@/components/ui/NumeralToggle";
import { AudioReadButton, AudioToggle } from "@/components/ui/AudioReadButton";
import { ActivityRenderer } from "@/components/activities/ActivityRenderer";
import {
  playGentleNudgeChime,
  playHintChime,
  playSuccessChime,
} from "@/lib/audio/chimes";

interface DailyPuzzleClientProps {
  puzzles: DailyPuzzleItem[];
}

function getLocalTodayIso(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function DailyPuzzleClient({ puzzles }: DailyPuzzleClientProps) {
  const {
    numeralPref,
    audioEnabled,
    progressByLesson,
    recordDailyPuzzleCompleted,
  } = useLearner();

  const [todayIso, setTodayIso] = useState<string>("2026-11-23");
  const [activePuzzleIndex, setActivePuzzleIndex] = useState<number>(0);
  const [answer, setAnswer] = useState<StepAnswer | null>(null);
  const [gradeResult, setGradeResult] = useState<GradeResult | null>(null);
  const [revealedHints, setRevealedHints] = useState<number>(0);
  const [xpAwarded, setXpAwarded] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (!active) return;
      const iso = getLocalTodayIso();
      setTodayIso(iso);
      const selected = getDailyPuzzleForDate(puzzles, iso);
      if (selected) {
        const idx = puzzles.findIndex((p) => p.id === selected.id);
        if (idx >= 0) setActivePuzzleIndex(idx);
      }
    });
    return () => {
      active = false;
    };
  }, [puzzles]);

  const puzzle = puzzles[activePuzzleIndex] ?? puzzles[0];
  const isSolved = Boolean(gradeResult?.isCorrect);
  const alreadyCompletedToday = Boolean(
    progressByLesson[getDailyProgressKey(todayIso)]?.completedAt
  );

  const handleAnswerChange = useCallback((next: StepAnswer) => {
    setAnswer(next);
    setGradeResult((prev) => (prev && !prev.isCorrect ? null : prev));
  }, []);

  const handleCheck = async () => {
    if (!puzzle || !answer || isSolved) return;
    const res = gradeStep(puzzle.step, answer);
    setGradeResult(res);

    if (res.isCorrect) {
      playSuccessChime(audioEnabled);
      const saved = await recordDailyPuzzleCompleted({
        dateIso: todayIso,
        puzzleId: puzzle.id,
      });
      setXpAwarded(saved.xpEarned);
    } else {
      playGentleNudgeChime(audioEnabled);
    }
  };

  const handleTryAnother = () => {
    if (puzzles.length <= 1) return;
    setActivePuzzleIndex((idx) => (idx + 1) % puzzles.length);
    setAnswer(null);
    setGradeResult(null);
    setRevealedHints(0);
    setXpAwarded(null);
  };

  if (!puzzle) {
    return null;
  }

  const activeHighlight =
    revealedHints > 0
      ? puzzle.step.hints[revealedHints - 1]?.highlightTargetId
      : undefined;

  return (
    <div className="min-h-dvh bg-canvas flex flex-col">
      <header className="sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur px-3 py-2.5">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-2">
          <Link
            href="/learn"
            className="khmer-chip inline-flex items-center rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-ink hover:bg-surface-subtle"
          >
            ← ផ្លូវរៀន
          </Link>
          <div className="flex items-center gap-1.5">
            <AudioToggle />
            <NumeralToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-3 py-5 pb-12">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-bold text-accent">
              លំហាត់ប្រចាំថ្ងៃ • ប្រហែល{" "}
              {formatDisplayNumber(puzzle.estimatedMinutes, numeralPref)} នាទី
            </p>
            <h1 className="text-xl font-bold text-ink">
              {formatTextNumerals(puzzle.titleKm, numeralPref)}
            </h1>
          </div>
          {alreadyCompletedToday && (
            <span
              data-testid="daily-completed-badge"
              className="rounded-full border border-success bg-success-soft px-3 py-1 text-xs font-bold text-success"
            >
              បានបញ្ចប់ថ្ងៃនេះ
            </span>
          )}
        </div>

        <section className="rounded-3xl border border-border bg-surface p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p
              data-testid="daily-prompt"
              className="flex-1 min-w-[200px] text-base sm:text-lg font-bold text-ink"
            >
              {formatTextNumerals(puzzle.step.promptKm, numeralPref)}
            </p>
            <AudioReadButton
              textKm={puzzle.step.promptKm}
              audioUrl={puzzle.step.audioUrl}
            />
          </div>

          <ActivityRenderer
            step={puzzle.step}
            numeralPref={numeralPref}
            highlightTargetId={activeHighlight}
            disabled={isSolved}
            onAnswerChange={handleAnswerChange}
          />
        </section>

        {gradeResult && (
          <section
            data-testid="daily-feedback"
            role="status"
            aria-live="polite"
            className={`rounded-2xl border-2 p-4 space-y-2 ${
              gradeResult.isCorrect
                ? "border-success bg-success-soft text-ink"
                : "border-hint bg-hint-soft text-ink"
            }`}
          >
            <p className="text-base font-bold">
              {formatTextNumerals(gradeResult.feedbackKm, numeralPref)}
            </p>
            {gradeResult.isCorrect && (
              <>
                <p className="text-sm text-ink">
                  {formatTextNumerals(puzzle.step.explanationKm, numeralPref)}
                </p>
                {xpAwarded !== null && xpAwarded > 0 && (
                  <p className="text-xs font-bold text-success">
                    +{formatDisplayNumber(xpAwarded, numeralPref)} XP ពិន្ទុគំនិតប្រចាំថ្ងៃ!
                  </p>
                )}
              </>
            )}
          </section>
        )}

        {revealedHints > 0 && (
          <section
            data-testid="daily-hint-drawer"
            className="rounded-2xl border border-hint bg-hint-soft/80 p-4 space-y-2"
          >
            {puzzle.step.hints.slice(0, revealedHints).map((h) => (
              <div
                key={h.tier}
                className="rounded-xl border border-border bg-surface p-3 text-sm text-ink"
              >
                <p className="text-xs font-bold text-hint-ink">
                  ជំនួយទី {formatDisplayNumber(h.tier, numeralPref)}
                </p>
                <p>{formatTextNumerals(h.textKm, numeralPref)}</p>
              </div>
            ))}
          </section>
        )}

        <div
          data-testid="daily-action-dock"
          className="sticky bottom-[calc(4.75rem+env(safe-area-inset-bottom))] min-[900px]:static z-20 -mx-3 border-t-2 border-[#c9c2b2] bg-surface/95 backdrop-blur px-3 py-2.5 min-[900px]:mx-0 min-[900px]:border-0 min-[900px]:bg-transparent min-[900px]:p-0 flex flex-wrap items-center gap-3"
        >
          {!isSolved ? (
            <>
              <button
                type="button"
                data-testid="daily-check-btn"
                onClick={() => void handleCheck()}
                className="khmer-chip btn-3d candy-ocean flex-1 rounded-2xl border-2 border-[#13429E] bg-[#1D5FD6] px-5 py-3 text-base font-extrabold text-white hover:bg-[#1751BA]"
              >
                ពិនិត្យចម្លើយ
              </button>
              <button
                type="button"
                data-testid="daily-hint-btn"
                disabled={revealedHints >= puzzle.step.hints.length}
                onClick={() => {
                  playHintChime(audioEnabled);
                  setRevealedHints((c) => c + 1);
                }}
                className="khmer-chip btn-3d [--btn-edge:#c9c2b2] rounded-2xl border-2 border-[#c9c2b2] bg-surface px-4 py-3 text-sm font-bold text-ink hover:bg-surface-subtle disabled:opacity-45"
              >
                សុំជំនួយ
              </button>
            </>
          ) : (
            <>
              <Link
                href="/learn"
                data-testid="daily-return-btn"
                className="khmer-chip btn-3d candy-leaf flex-1 inline-flex items-center justify-center rounded-2xl border-2 border-[#148F56] bg-[#22C57B] px-5 py-3 text-base font-extrabold text-[#0D2B1D]"
              >
                ត្រឡប់ទៅផ្លូវរៀន
              </Link>
              <button
                type="button"
                data-testid="daily-next-puzzle-btn"
                onClick={handleTryAnother}
                className="khmer-chip btn-3d [--btn-edge:#c9c2b2] rounded-2xl border-2 border-[#c9c2b2] bg-surface px-4 py-3 text-sm font-semibold text-ink hover:bg-surface-subtle"
              >
                សាកល្បងលំហាត់មួយទៀត
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
