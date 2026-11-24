"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { LessonDocumentV1 } from "@/lib/curriculum/schema";
import { gradeStep, type GradeResult, type StepAnswer } from "@/lib/math/grader";
import { MASTERY_LABELS_KM, type MasteryTier } from "@/lib/math/mastery";
import {
  formatDisplayNumber,
  formatTextNumerals,
} from "@/lib/khmer/numerals";
import { cacheLessons } from "@/lib/storage/idb";
import { useLearner } from "@/components/providers/LearnerProvider";
import { NumeralToggle } from "@/components/ui/NumeralToggle";
import { AudioReadButton, AudioToggle } from "@/components/ui/AudioReadButton";
import { MascotFrog } from "@/components/ui/MascotFrog";
import { CelebrationBurst } from "@/components/ui/CelebrationBurst";
import { ActivityRenderer } from "@/components/activities/ActivityRenderer";
import { LessonScratchpad } from "@/components/lesson/LessonScratchpad";
import {
  playGentleNudgeChime,
  playHintChime,
  playScaleNote,
  playSuccessChime,
} from "@/lib/audio/chimes";

interface LessonPlayerProps {
  lesson: LessonDocumentV1;
}

const STAGE_LABELS_KM: Record<string, string> = {
  concrete: "រូបភាពជាក់ស្ដែង",
  iconic: "គំរូរូបភាព",
  symbolic: "និមិត្តសញ្ញាគណិត",
};

const HINT_KIND_LABELS_KM: Record<string, string> = {
  "visual-cue": "ជំនួយទី ១ • មើលចំណុចសំខាន់",
  "strategy-nudge": "ជំនួយទី ២ • វិធីគិត",
  "worked-step": "ជំនួយទី ៣ • ជំហានណែនាំ",
};

interface SproutingBudMeterProps {
  completedCount: number;
  totalSteps: number;
  numeralPref: "km" | "latn";
}

/**
 * Safari-safe inline SVG sprouting lotus/mango bud indicator that grows
 * with each solved lesson step (zero foreignObject).
 */
function SproutingBudMeter({
  completedCount,
  totalSteps,
  numeralPref,
}: SproutingBudMeterProps) {
  const ratio = totalSteps > 0 ? Math.min(1, completedCount / totalSteps) : 0;
  const growthStage = completedCount + 1;
  const stemTopY = Math.round(28 - ratio * 12);

  return (
    <div
      data-testid="sprouting-bud-meter"
      data-stage={String(growthStage)}
      data-completed={String(completedCount)}
      className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#148F56] bg-[#E3FBEF] px-2.5 py-0.5 text-xs font-extrabold text-[#0D2B1D]"
    >
      <svg
        viewBox="0 0 36 36"
        className="h-6 w-6 shrink-0"
        aria-hidden="true"
      >
        {/* Terracotta pot / pond base */}
        <path
          d="M 10 29 L 26 29 L 24 34 L 12 34 Z"
          fill="#C85A14"
          stroke="#7C2D12"
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
        {/* Growing stem */}
        <path
          d={`M 18 29 Q 18 ${(29 + stemTopY) / 2} 18 ${stemTopY}`}
          fill="none"
          stroke="#15803d"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        {/* Left sprout leaf (always visible from stage 1) */}
        <path
          d="M 18 25 Q 11 23 11 18 Q 16 18 18 24 Z"
          fill="#22c55e"
          stroke="#15803d"
          strokeWidth={1.2}
        />
        {/* Right leaf emerges after first solved step */}
        {completedCount >= 1 && (
          <path
            d="M 18 22 Q 25 20 25 15 Q 20 15 18 21 Z"
            fill="#22c55e"
            stroke="#15803d"
            strokeWidth={1.2}
          />
        )}
        {/* Bud / Lotus bloom at top of stem */}
        {ratio >= 1 ? (
          <g>
            <ellipse
              cx={14}
              cy={stemTopY}
              rx={3.5}
              ry={5.5}
              transform={`rotate(-25 14 ${stemTopY})`}
              fill="#f472b6"
              stroke="#9d174d"
              strokeWidth={1.2}
            />
            <ellipse
              cx={22}
              cy={stemTopY}
              rx={3.5}
              ry={5.5}
              transform={`rotate(25 22 ${stemTopY})`}
              fill="#f472b6"
              stroke="#9d174d"
              strokeWidth={1.2}
            />
            <ellipse
              cx={18}
              cy={stemTopY - 1}
              rx={3.8}
              ry={6}
              fill="#fbcfe8"
              stroke="#9d174d"
              strokeWidth={1.2}
            />
            <circle cx={18} cy={stemTopY + 1} r={2} fill="#FFD23F" />
          </g>
        ) : (
          <circle
            cx={18}
            cy={stemTopY}
            r={completedCount > 0 ? 4.2 : 3.2}
            fill={completedCount > 0 ? "#f472b6" : "#4ade80"}
            stroke={completedCount > 0 ? "#9d174d" : "#15803d"}
            strokeWidth={1.3}
          />
        )}
      </svg>
      <span>
        ពន្លក {formatDisplayNumber(completedCount, numeralPref)}/
        {formatDisplayNumber(totalSteps, numeralPref)}
      </span>
    </div>
  );
}

export function LessonPlayer({ lesson }: LessonPlayerProps) {
  const {
    numeralPref,
    audioEnabled,
    isOnline,
    recordStepCompleted,
    recordLessonFinished,
  } = useLearner();

  const [stepIndex, setStepIndex] = useState<number>(0);
  const [currentAnswer, setCurrentAnswer] = useState<StepAnswer | null>(null);
  const [gradeResult, setGradeResult] = useState<GradeResult | null>(null);
  const [stepAttempts, setStepAttempts] = useState<number>(0);
  const [revealedHintCount, setRevealedHintCount] = useState<number>(0);
  const [scratchpadOpen, setScratchpadOpen] = useState<boolean>(false);

  // Lesson-wide metrics
  const [firstTryCorrectCount, setFirstTryCorrectCount] = useState<number>(0);
  const [totalHintsUsed, setTotalHintsUsed] = useState<number>(0);
  const [usedTier3Hint, setUsedTier3Hint] = useState<boolean>(false);
  const [completedStepIds, setCompletedStepIds] = useState<string[]>([]);

  const [summary, setSummary] = useState<{
    accuracyPct: number;
    masteryTier: MasteryTier;
    xpEarned: number;
    intervalDays: number;
  } | null>(null);
  const [treatsFed, setTreatsFed] = useState<number>(0);
  const [isChomping, setIsChomping] = useState<boolean>(false);

  // Cache lesson payload into IndexedDB immediately for offline durability
  useEffect(() => {
    void cacheLessons([lesson]);
  }, [lesson]);

  const activeStep = lesson.steps[stepIndex];
  const totalSteps = lesson.steps.length;
  const isStepSolved = Boolean(gradeResult?.isCorrect);

  const activeHighlightTargetId =
    revealedHintCount > 0 && activeStep
      ? activeStep.hints[revealedHintCount - 1]?.highlightTargetId
      : undefined;

  const handleAnswerChange = useCallback((answer: StepAnswer) => {
    setCurrentAnswer(answer);
    setGradeResult((prev) => (prev && !prev.isCorrect ? null : prev));
  }, []);

  const handleCheckAnswer = async () => {
    if (!activeStep || !currentAnswer || isStepSolved) return;

    const result = gradeStep(activeStep, currentAnswer);
    const nextAttempts = stepAttempts + 1;
    setStepAttempts(nextAttempts);
    setGradeResult(result);

    if (result.isCorrect) {
      playSuccessChime(audioEnabled);
      if (nextAttempts === 1 && revealedHintCount === 0) {
        setFirstTryCorrectCount((c) => c + 1);
      }
      setCompletedStepIds((prev) =>
        prev.includes(activeStep.id) ? prev : [...prev, activeStep.id]
      );
      await recordStepCompleted(lesson.id, activeStep.id);
    } else {
      playGentleNudgeChime(audioEnabled);
    }
  };

  const handleRevealNextHint = () => {
    if (!activeStep || revealedHintCount >= activeStep.hints.length) return;
    playHintChime(audioEnabled);
    const nextCount = revealedHintCount + 1;
    setRevealedHintCount(nextCount);
    setTotalHintsUsed((h) => h + 1);
    if (nextCount >= 3) {
      setUsedTier3Hint(true);
    }
  };

  const handleContinue = async () => {
    if (!isStepSolved) return;

    if (stepIndex + 1 < totalSteps) {
      setStepIndex((i) => i + 1);
      setCurrentAnswer(null);
      setGradeResult(null);
      setStepAttempts(0);
      setRevealedHintCount(0);
      setScratchpadOpen(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Lesson finished! Compute accuracy & persist to IndexedDB + sync outbox
    const accuracyPct = Math.round((firstTryCorrectCount / totalSteps) * 100);
    const allStepIds = lesson.steps.map((s) => s.id);
    const saved = await recordLessonFinished({
      lessonId: lesson.id,
      accuracyPct,
      hintsUsed: totalHintsUsed,
      usedTier3Hint,
      completedStepIds: Array.from(new Set([...completedStepIds, ...allStepIds])),
    });

    setSummary({
      accuracyPct,
      masteryTier: saved.progress.masteryTier,
      xpEarned: saved.xpEarned,
      intervalDays: saved.intervalDays,
    });
  };

  const handleRestart = () => {
    setStepIndex(0);
    setCurrentAnswer(null);
    setGradeResult(null);
    setStepAttempts(0);
    setRevealedHintCount(0);
    setFirstTryCorrectCount(0);
    setTotalHintsUsed(0);
    setUsedTier3Hint(false);
    setCompletedStepIds([]);
    setTreatsFed(0);
    setIsChomping(false);
    setSummary(null);
  };

  const handleFeedMascot = () => {
    if (treatsFed >= 3) return;
    const nextTreats = treatsFed + 1;
    setTreatsFed(nextTreats);
    setIsChomping(true);
    if (nextTreats >= 3) {
      playSuccessChime(audioEnabled);
    } else {
      playScaleNote(nextTreats * 2 + 3, audioEnabled);
    }
    window.setTimeout(() => {
      setIsChomping(false);
    }, 500);
  };

  if (summary) {
    const isCrowned = treatsFed >= 3;
    return (
      <div className="min-h-dvh bg-canvas flex flex-col">
        <header className="sticky top-0 z-20 border-b-2 border-[#c9c2b2] bg-surface/95 backdrop-blur px-3 sm:px-4 py-2.5">
          <div className="mx-auto flex max-w-xl items-center justify-between gap-2">
            <Link
              href="/learn"
              className="khmer-chip pill-3d [--pill-edge:#c9c2b2] inline-flex items-center rounded-xl border-2 border-[#c9c2b2] bg-surface px-3 text-sm font-bold text-ink hover:bg-surface-subtle"
            >
              ← ផ្លូវរៀន
            </Link>
            <NumeralToggle />
          </div>
        </header>

        <main
          data-testid="lesson-summary"
          className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-6 sm:py-8"
        >
          <section className="w-full rounded-3xl border-2 border-[#c9c2b2] bg-surface p-5 sm:p-6 shadow-[0_6px_0_#c9c2b2,0_14px_28px_rgba(30,42,74,0.08)] text-center space-y-5">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-ink">
                អបអរសាទរ! អ្នកបានបញ្ចប់មេរៀនហើយ
              </h1>
              <p className="text-base text-ink-muted">
                {formatTextNumerals(lesson.titleKm, numeralPref)}
              </p>
            </div>

            {/* Interactive "Treat Time" (បញ្ចុកផ្លែស្វាយកូនកង្កែប!) Celebration Stage */}
            <div
              data-testid="treat-time-stage"
              className="rounded-3xl border-2 border-[#C89600] bg-[#FFF9E2] p-4 space-y-3"
            >
              <p className="text-sm font-extrabold text-[#1E2A4A]">
                {isCrowned
                  ? "កូនកង្កែបឆ្អែតហើយ! ទទួលបានមកុដមាស 👑"
                  : "បញ្ចុកផ្លែស្វាយកូនកង្កែប!"}
              </p>

              <div className="flex flex-col items-center gap-2">
                <MascotFrog
                  mood="happy"
                  size={88}
                  crowned={isCrowned}
                  chomping={isChomping}
                />

                {/* 3 Friendship Hearts */}
                <div
                  data-testid="treat-hearts"
                  data-filled={String(treatsFed)}
                  role="img"
                  aria-label={`បេះដូងមិត្តភាព ${formatDisplayNumber(treatsFed, numeralPref)} ក្នុងចំណោម ${formatDisplayNumber(3, numeralPref)}`}
                  className="inline-flex items-center gap-2 rounded-full border-2 border-[#9E1943] bg-white px-4 py-1"
                >
                  {[0, 1, 2].map((heartIdx) => {
                    const filled = heartIdx < treatsFed;
                    return (
                      <span
                        key={heartIdx}
                        data-testid={`treat-heart-${heartIdx + 1}`}
                        data-filled={filled ? "true" : "false"}
                        aria-hidden="true"
                        className={`text-xl leading-none transition-transform duration-200 ${
                          filled
                            ? "text-[#D62860] scale-110"
                            : "text-[#d6d0c4]"
                        }`}
                      >
                        ♥
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  data-testid="feed-mascot-btn"
                  disabled={isCrowned}
                  onClick={handleFeedMascot}
                  className="manipulative-target khmer-chip btn-3d candy-sun inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-[#C89600] bg-[#FFD23F] px-5 py-2.5 text-sm sm:text-base font-extrabold text-[#1E2A4A] disabled:opacity-65"
                >
                  <svg
                    viewBox="0 0 28 28"
                    className="h-6 w-6 shrink-0"
                    aria-hidden="true"
                  >
                    <ellipse
                      cx={14}
                      cy={16}
                      rx={9}
                      ry={7}
                      transform="rotate(-15 14 16)"
                      fill="#FF8C42"
                      stroke="#9A3412"
                      strokeWidth={1.6}
                    />
                    <path
                      d="M 15 8 Q 20 5 22 9 Q 18 11 15 8 Z"
                      fill="#22C55E"
                      stroke="#15803D"
                      strokeWidth={1.2}
                    />
                  </svg>
                  <span>
                    {isCrowned
                      ? formatTextNumerals("ឆ្អែតហើយ! (៣/៣)", numeralPref)
                      : `បញ្ចុកផ្លែស្វាយ (${formatDisplayNumber(treatsFed, numeralPref)}/${formatDisplayNumber(3, numeralPref)})`}
                  </span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <div className="rounded-2xl border-2 border-[#148F56] bg-[#E3FBEF] p-3">
                <p className="text-xs font-bold text-[#0D2B1D]">កម្រិតស្ទាត់</p>
                <p
                  data-testid="summary-mastery-tier"
                  className="mt-1 text-sm font-extrabold text-[#0D2B1D]"
                >
                  {MASTERY_LABELS_KM[summary.masteryTier]}
                </p>
              </div>
              <div className="rounded-2xl border-2 border-[#C89600] bg-[#FFF3BF] p-3">
                <p className="text-xs font-bold text-[#1E2A4A]">ភាពត្រឹមត្រូវ</p>
                <p className="mt-1 text-base font-extrabold text-[#1E2A4A]">
                  {formatDisplayNumber(summary.accuracyPct, numeralPref)}%
                </p>
              </div>
              <div className="rounded-2xl border-2 border-[#13429E] bg-[#E5F0FF] p-3">
                <p className="text-xs font-bold text-[#13429E]">ពិន្ទុគំនិត</p>
                <p className="mt-1 text-base font-extrabold text-[#13429E]">
                  +{formatDisplayNumber(summary.xpEarned, numeralPref)} XP
                </p>
              </div>
            </div>

            <p className="rounded-2xl border border-[#c9c2b2] bg-surface-subtle px-4 py-3 text-sm text-ink-muted">
              កាលវិភាគរំលឹកឡើងវិញបន្ទាប់៖{" "}
              <strong className="text-ink">
                {formatDisplayNumber(summary.intervalDays, numeralPref)} ថ្ងៃទៀត
              </strong>
              {!isOnline && " (បានរក្សាទុកក្នុងឧបករណ៍ដោយជោគជ័យ)"}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/learn"
                data-testid="back-to-path-btn"
                className="khmer-chip btn-3d candy-ocean flex-1 inline-flex items-center justify-center rounded-2xl border-2 border-[#13429E] bg-[#1D5FD6] px-5 py-3 text-base font-extrabold text-white hover:bg-[#1751BA]"
              >
                ត្រឡប់ទៅផ្លូវរៀន
              </Link>
              <button
                type="button"
                onClick={handleRestart}
                className="khmer-chip btn-3d [--btn-edge:#c9c2b2] inline-flex items-center justify-center rounded-2xl border-2 border-[#c9c2b2] bg-surface px-5 py-3 text-base font-bold text-ink hover:bg-surface-subtle"
              >
                អនុវត្តម្ដងទៀត
              </button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  const completedStepsCount = completedStepIds.length;
  const progressPercent = Math.round(
    ((stepIndex + (isStepSolved ? 1 : 0)) / totalSteps) * 100
  );
  const mascotMood = gradeResult
    ? gradeResult.isCorrect
      ? "happy"
      : "encouraging"
    : "curious";

  return (
    <div className="min-h-dvh bg-canvas flex flex-col">
      {/* Calm distraction-free header (two-row on <sm so 360px phones never crush controls) */}
      <header className="border-b-2 border-[#c9c2b2] bg-surface px-2.5 sm:px-3 py-2 sm:py-2.5">
        <div className="lesson-container-wide mx-auto flex max-w-xl flex-wrap sm:flex-nowrap items-center justify-between gap-x-2 gap-y-1.5">
          <Link
            href="/learn"
            data-testid="lesson-exit-btn"
            className="khmer-chip pill-3d [--pill-edge:#c9c2b2] order-1 shrink-0 whitespace-nowrap inline-flex items-center rounded-xl border-2 border-[#c9c2b2] bg-surface px-2.5 sm:px-3 text-sm font-bold text-ink hover:bg-surface-subtle"
          >
            ចាកចេញ
          </Link>

          <div className="order-2 sm:order-3 flex items-center gap-1.5 shrink-0">
            <AudioToggle />
            <NumeralToggle />
          </div>

          <div className="order-3 sm:order-2 w-full sm:w-auto sm:flex-1 sm:px-1">
            <div className="flex items-center justify-between text-xs font-semibold text-ink-muted mb-1">
              <span data-testid="step-counter">
                ជំហាន {formatDisplayNumber(stepIndex + 1, numeralPref)} /{" "}
                {formatDisplayNumber(totalSteps, numeralPref)}
              </span>
              {!isOnline && (
                <span
                  data-testid="offline-badge"
                  className="rounded-full bg-hint-soft px-2 py-0.5 text-hint-ink"
                >
                  គ្មានអ៊ីនធឺណិត
                </span>
              )}
            </div>
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-surface-subtle"
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="វឌ្ឍនភាពមេរៀន"
            >
              <div
                className="h-full rounded-full bg-[#22C57B] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="lesson-container-wide mx-auto flex w-full max-w-xl flex-1 flex-col gap-3 sm:gap-4 px-2.5 sm:px-3 py-2.5 sm:py-4">
        {/* Lesson title + Concreteness Fading stage chip + Scratchpad toggle */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-bold text-ink-muted">
            {formatTextNumerals(lesson.titleKm, numeralPref)}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              data-testid="scratchpad-toggle-btn"
              aria-pressed={scratchpadOpen}
              onClick={() => setScratchpadOpen((v) => !v)}
              className={`khmer-chip pill-3d rounded-full border-2 px-3 text-xs font-extrabold transition-colors ${
                scratchpadOpen
                  ? "border-[#13429E] [--pill-edge:#13429E] bg-[#1D5FD6] text-white"
                  : "border-[#c9c2b2] [--pill-edge:#c9c2b2] bg-surface text-ink hover:bg-surface-subtle"
              }`}
            >
              {scratchpadOpen ? "បិទក្រដាសព្រាង" : "ក្រដាសព្រាង"}
            </button>
            <span className="rounded-full border-2 border-[#c9c2b2] bg-surface px-3 py-0.5 text-xs font-bold text-ink-muted">
              {STAGE_LABELS_KM[activeStep.stage] ?? activeStep.stage}
            </span>
          </div>
        </div>

        {/* Toggleable On-Screen Doodle Scratchpad (preserves step answer) */}
        {scratchpadOpen && (
          <LessonScratchpad key={activeStep.id} numeralPref={numeralPref} />
        )}

        {/* Responsive Workspace: Single-Column on Mobile (<900px), Two-Column Side-by-Side on Landscape/Desktop (>=900px) */}
        <div
          data-testid="lesson-workspace-grid"
          className="lesson-workspace-grid grid grid-cols-1 gap-3 sm:gap-4 flex-1"
        >
          {/* Persistent Conversational Mascot Prompt Bubble (Top on mobile, Right column row 1 on >=900px) */}
          <section
            data-testid="mascot-prompt-bubble"
            className="lesson-bubble-col order-1 rounded-3xl border-2 border-[#148F56] bg-surface p-3.5 sm:p-4 shadow-[0_5px_0_#148F56] space-y-3"
          >
            <div className="flex items-start gap-3">
              <MascotFrog mood={mascotMood} size={52} />
              <div className="flex-1 min-w-0 space-y-2">
                <h1
                  data-testid="step-prompt"
                  className="text-base sm:text-lg font-bold text-ink"
                >
                  {formatTextNumerals(activeStep.promptKm, numeralPref)}
                </h1>
                {isStepSolved && (
                  <p
                    data-testid="mascot-celebration-pill"
                    className="inline-flex items-center gap-1 rounded-full border border-[#148F56] bg-[#E3FBEF] px-2.5 py-0.5 text-xs font-extrabold text-[#0D2B1D]"
                  >
                    <span>អស្ចារ្យណាស់! ពន្លកសួនលូតលាស់ហើយ</span>
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center justify-end">
              <AudioReadButton
                textKm={activeStep.promptKm}
                audioUrl={activeStep.audioUrl}
              />
            </div>
          </section>

          {/* Interactive Math Board Card (Left column on >=900px) */}
          <section
            data-testid="lesson-math-board"
            className="lesson-board-col order-2 rounded-3xl border-2 border-[#c9c2b2] bg-surface p-3 sm:p-5 shadow-[0_6px_0_#c9c2b2,0_12px_24px_rgba(30,42,74,0.06)] space-y-4"
          >
            {/* Board Header: Circular Numbered Step Dots + Sprouting Bud Meter */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2.5">
              <div
                data-testid="step-dot-indicator"
                role="group"
                aria-label="សញ្ញាជំហានមេរៀន"
                className="flex flex-wrap items-center gap-1.5"
              >
                {lesson.steps.map((step, idx) => {
                  const isCompleted =
                    completedStepIds.includes(step.id) ||
                    idx < stepIndex ||
                    (idx === stepIndex && isStepSolved);
                  const isCurrent = idx === stepIndex && !isCompleted;
                  const status = isCompleted
                    ? "completed"
                    : isCurrent
                      ? "active"
                      : "upcoming";
                  return (
                    <span
                      key={step.id}
                      data-testid={`step-dot-${idx + 1}`}
                      data-status={status}
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-extrabold transition-all ${
                        isCompleted
                          ? "border-[#148F56] bg-[#22C57B] text-[#0D2B1D] shadow-[0_2px_0_#148F56]"
                          : isCurrent
                            ? "border-[#C89600] bg-[#FFD23F] text-[#1E2A4A] shadow-[0_2px_0_#C89600] scale-105"
                            : "border-[#c9c2b2] bg-surface-subtle text-ink-muted"
                      }`}
                    >
                      {formatDisplayNumber(idx + 1, numeralPref)}
                    </span>
                  );
                })}
              </div>

              <SproutingBudMeter
                completedCount={completedStepsCount}
                totalSteps={totalSteps}
                numeralPref={numeralPref}
              />
            </div>

            {/* Single decoupled SVG manipulative renderer */}
            <ActivityRenderer
              step={activeStep}
              numeralPref={numeralPref}
              highlightTargetId={activeHighlightTargetId}
              disabled={isStepSolved}
              onAnswerChange={handleAnswerChange}
            />
          </section>

          {/* Right Column Controls: Feedback & Gated 3-Tier Hints */}
          {(gradeResult || revealedHintCount > 0) && (
            <div
              data-testid="lesson-control-rail"
              className="lesson-controls-col order-3 space-y-3"
            >
              {/* Immediate non-punitive feedback & visual explanation */}
              {gradeResult && (
                <section
                  data-testid="feedback-panel"
                  role="status"
                  aria-live="polite"
                  className={`rounded-3xl border-2 p-3.5 sm:p-4 flex items-start gap-3 ${
                    gradeResult.isCorrect
                      ? "border-[#148F56] bg-[#E3FBEF] text-[#0D2B1D] shadow-[0_4px_0_#148F56]"
                      : "border-[#C89600] bg-[#FFF3BF] text-[#1E2A4A] shadow-[0_4px_0_#C89600]"
                  }`}
                >
                  <MascotFrog
                    mood={gradeResult.isCorrect ? "happy" : "encouraging"}
                    size={46}
                  />
                  <div className="flex-1 space-y-1.5">
                    <p className="text-base font-bold">
                      {formatTextNumerals(gradeResult.feedbackKm, numeralPref)}
                    </p>
                    {gradeResult.isCorrect && (
                      <div className="space-y-2">
                        <p
                          data-testid="step-explanation"
                          className="text-sm text-[#0D2B1D]"
                        >
                          {formatTextNumerals(activeStep.explanationKm, numeralPref)}
                        </p>
                        <AudioReadButton
                          textKm={activeStep.explanationKm}
                          labelKm="ស្តាប់ការពន្យល់"
                          testId="explanation-audio-btn"
                        />
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Gated 3-tier elaborative hint drawer */}
              {revealedHintCount > 0 && (
                <section
                  data-testid="hint-drawer"
                  aria-label="ជំនួយជាដំណាក់កាល"
                  className="rounded-3xl border-2 border-[#C89600] bg-[#FFF9E2] p-3.5 sm:p-4 shadow-[0_4px_0_#C89600] space-y-2.5"
                >
                  {activeStep.hints.slice(0, revealedHintCount).map((hint) => (
                    <div
                      key={hint.tier}
                      data-testid={`hint-tier-${hint.tier}`}
                      className="rounded-2xl bg-surface p-3 border-2 border-[#c9c2b2] space-y-1.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-extrabold text-[#1E2A4A]">
                          {formatTextNumerals(
                            HINT_KIND_LABELS_KM[hint.kind] ?? `ជំនួយទី ${hint.tier}`,
                            numeralPref
                          )}
                        </p>
                        <AudioReadButton
                          textKm={hint.textKm}
                          labelKm="ស្តាប់ជំនួយ"
                          testId={`hint-audio-btn-${hint.tier}`}
                        />
                      </div>
                      <p className="text-sm text-ink">
                        {formatTextNumerals(hint.textKm, numeralPref)}
                      </p>
                    </div>
                  ))}
                </section>
              )}
            </div>
          )}

          {/* Sticky Mobile Bottom Action Dock (<900px) / Right Column Row 3 (>=900px) */}
          <div
            data-testid="lesson-action-dock"
            className="lesson-action-dock-col order-4 sticky bottom-0 z-20 -mx-2.5 sm:-mx-3 border-t-2 border-[#c9c2b2] bg-surface/95 backdrop-blur px-2.5 sm:px-3 pt-2.5 pb-[calc(0.75rem+env(safe-area-inset-bottom))] min-[900px]:mx-0 min-[900px]:border-0 min-[900px]:bg-transparent min-[900px]:p-0 min-[900px]:backdrop-blur-none"
          >
            <CelebrationBurst active={isStepSolved} />
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              {!isStepSolved ? (
                <>
                  <button
                    type="button"
                    data-testid="check-answer-btn"
                    onClick={() => void handleCheckAnswer()}
                    className="khmer-chip btn-3d candy-ocean flex-1 rounded-2xl border-2 border-[#13429E] bg-[#1D5FD6] px-5 py-3 text-base font-extrabold text-white hover:bg-[#1751BA]"
                  >
                    ពិនិត្យចម្លើយ
                  </button>

                  <button
                    type="button"
                    data-testid="hint-btn"
                    disabled={revealedHintCount >= activeStep.hints.length}
                    onClick={handleRevealNextHint}
                    className={`khmer-chip btn-3d rounded-2xl border-2 px-4 py-3 text-sm font-extrabold transition-colors disabled:opacity-45 ${
                      stepAttempts > 0 && revealedHintCount < activeStep.hints.length
                        ? "candy-sun border-[#C89600] bg-[#FFD23F] text-[#1E2A4A]"
                        : "border-[#c9c2b2] [--btn-edge:#c9c2b2] bg-surface text-ink hover:bg-surface-subtle"
                    }`}
                  >
                    {revealedHintCount === 0
                      ? "សុំជំនួយ"
                      : revealedHintCount < activeStep.hints.length
                        ? `សុំជំនួយបន្ថែម (${formatDisplayNumber(revealedHintCount, numeralPref)}/${formatDisplayNumber(activeStep.hints.length, numeralPref)})`
                        : "បានបង្ហាញជំនួយគ្រប់ហើយ"}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  data-testid="continue-btn"
                  onClick={() => void handleContinue()}
                  className="khmer-chip btn-3d candy-leaf w-full rounded-2xl border-2 border-[#148F56] bg-[#22C57B] px-5 py-3.5 text-base font-extrabold text-[#0D2B1D] hover:brightness-105"
                >
                  {stepIndex + 1 < totalSteps ? "បន្តទៅមុខ" : "បញ្ចប់មេរៀន"}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
