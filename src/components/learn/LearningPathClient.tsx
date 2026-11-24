"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { LearningPathMeta } from "@/lib/curriculum/loader";
import { useLearner } from "@/components/providers/LearnerProvider";
import { NumeralToggle } from "@/components/ui/NumeralToggle";
import { BrandLogo } from "@/components/ui/BrandLogo";
import {
  formatDisplayNumber,
  formatTextNumerals,
} from "@/lib/khmer/numerals";
import { MASTERY_LABELS_KM, type MasteryTier } from "@/lib/math/mastery";
import { computeMasteryBadges } from "@/lib/math/badges";
import { buildReviewQueue } from "@/lib/math/reviewQueue";
import { getDailyProgressKey } from "@/lib/curriculum/daily";
import { cacheLessons } from "@/lib/storage/idb";

interface LearningPathClientProps {
  paths: LearningPathMeta[];
}

const MASTERY_BADGE_STYLE: Record<MasteryTier, string> = {
  not_started: "border-[#c9c2b2] bg-surface-subtle text-ink-muted",
  attempted: "border-[#C89600] bg-[#FFF3BF] text-[#1E2A4A]",
  familiar: "border-[#13429E] bg-[#E5F0FF] text-[#13429E]",
  proficient: "border-[#148F56] bg-[#E3FBEF] text-[#0D2B1D]",
  mastered: "border-[#148F56] bg-[#15803d] text-white",
};

const MASTERY_STAR_COUNT: Record<MasteryTier, number> = {
  not_started: 0,
  attempted: 1,
  familiar: 1,
  proficient: 2,
  mastered: 3,
};

const CANDY_THEMES = [
  {
    name: "sun",
    className: "candy-sun",
    badgeBg: "bg-[#FFD23F]",
    badgeText: "text-[#1E2A4A]",
    badgeBorder: "border-[#C89600]",
    cardBorder: "border-[#C89600]",
    tileEdge: "[--tile-edge:#C89600]",
    btnEdge: "[--btn-edge:#C89600]",
  },
  {
    name: "ocean",
    className: "candy-ocean",
    badgeBg: "bg-[#1D5FD6]",
    badgeText: "text-white",
    badgeBorder: "border-[#13429E]",
    cardBorder: "border-[#13429E]",
    tileEdge: "[--tile-edge:#13429E]",
    btnEdge: "[--btn-edge:#13429E]",
  },
  {
    name: "leaf",
    className: "candy-leaf",
    badgeBg: "bg-[#22C57B]",
    badgeText: "text-[#0D2B1D]",
    badgeBorder: "border-[#148F56]",
    cardBorder: "border-[#148F56]",
    tileEdge: "[--tile-edge:#148F56]",
    btnEdge: "[--btn-edge:#148F56]",
  },
  {
    name: "berry",
    className: "candy-berry",
    badgeBg: "bg-[#D62860]",
    badgeText: "text-white",
    badgeBorder: "border-[#9E1943]",
    cardBorder: "border-[#9E1943]",
    tileEdge: "[--tile-edge:#9E1943]",
    btnEdge: "[--btn-edge:#9E1943]",
  },
  {
    name: "tangerine",
    className: "candy-tangerine",
    badgeBg: "bg-[#FF8C42]",
    badgeText: "text-[#1E2A4A]",
    badgeBorder: "border-[#C85A14]",
    cardBorder: "border-[#C85A14]",
    tileEdge: "[--tile-edge:#C85A14]",
    btnEdge: "[--btn-edge:#C85A14]",
  },
  {
    name: "grape",
    className: "candy-grape",
    badgeBg: "bg-[#7C3AED]",
    badgeText: "text-white",
    badgeBorder: "border-[#5620B8]",
    cardBorder: "border-[#5620B8]",
    tileEdge: "[--tile-edge:#5620B8]",
    btnEdge: "[--btn-edge:#5620B8]",
  },
] as const;

function countActiveDaysThisWeek(
  activeDates: string[],
  cutoffIso: string | null
): number {
  if (!cutoffIso) return 0;
  return activeDates.filter((d) => d >= cutoffIso).length;
}

export function LearningPathClient({ paths }: LearningPathClientProps) {
  const {
    profile,
    profiles,
    progressByLesson,
    numeralPref,
    isOnline,
    pendingSyncCount,
    switchProfile,
  } = useLearner();

  const [selectedPathId, setSelectedPathId] = useState<string>(
    paths[0]?.id ?? "early-foundations"
  );
  const [activityFilter, setActivityFilter] = useState<
    "path" | "drawing" | "all"
  >("path");
  const [offlineCached, setOfflineCached] = useState<boolean>(false);
  const [weekCutoffIso, setWeekCutoffIso] = useState<string | null>(null);
  const [todayDate, setTodayDate] = useState<{ iso: string; now: Date } | null>(
    null
  );

  const allLessons = useMemo(
    () => paths.flatMap((p) => p.lessons),
    [paths]
  );

  // Cache all lessons locally in IndexedDB and compute current week cutoff on client
  useEffect(() => {
    let active = true;
    void cacheLessons(allLessons).then(() => {
      if (!active) return;
      const now = new Date();
      const cutoff = new Date(now);
      cutoff.setDate(now.getDate() - 6);
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, "0");
      const d = String(now.getDate()).padStart(2, "0");
      setWeekCutoffIso(cutoff.toISOString().slice(0, 10));
      setTodayDate({ iso: `${y}-${m}-${d}`, now });
      setOfflineCached(true);
    });
    return () => {
      active = false;
    };
  }, [allLessons]);

  const activePath =
    paths.find((p) => p.id === selectedPathId) ?? paths[0];

  const visibleLessons = useMemo(() => {
    if (activityFilter === "drawing") {
      return allLessons.filter((l) =>
        l.steps.some((s) => s.type === "geometry-draw")
      );
    }
    if (activityFilter === "all") {
      return allLessons;
    }
    return activePath?.lessons ?? [];
  }, [activityFilter, allLessons, activePath]);

  const drawingLessonsCount = useMemo(
    () =>
      allLessons.filter((l) => l.steps.some((s) => s.type === "geometry-draw"))
        .length,
    [allLessons]
  );

  const weeklyGoal = profile?.weeklyGoalDays ?? 3;
  const activeDaysThisWeek = Math.min(
    7,
    countActiveDaysThisWeek(profile?.activeDates ?? [], weekCutoffIso)
  );
  const completedInActivePath = (activePath?.lessons ?? []).filter((l) => {
    const tier = progressByLesson[l.id]?.masteryTier;
    return tier && tier !== "not_started";
  }).length;
  const badges = computeMasteryBadges(progressByLesson);
  const earnedBadgesCount = badges.filter((b) => b.earned).length;
  const dueReviewCount = todayDate
    ? buildReviewQueue(allLessons, progressByLesson, todayDate.now).due.length
    : 0;
  const dailyDoneToday = todayDate
    ? Boolean(progressByLesson[getDailyProgressKey(todayDate.iso)]?.completedAt)
    : false;

  return (
    <div className="app-page-with-rail min-h-dvh bg-canvas flex flex-col">
      <header className="sticky top-0 z-20 border-b-2 border-[#c9c2b2] bg-surface/95 backdrop-blur px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2">
          <Link
            href="/"
            className="khmer-chip inline-flex items-center gap-2 rounded-xl px-2 text-base font-bold text-ink"
          >
            <BrandLogo size={36} />
            <span>សួនគណិត</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/parent"
              data-testid="parent-dashboard-link"
              className="khmer-chip pill-3d [--pill-edge:#c9c2b2] inline-flex items-center rounded-full border-2 border-[#c9c2b2] bg-surface px-3 text-xs font-bold text-ink hover:bg-surface-subtle"
            >
              ឪពុកម្ដាយ
            </Link>
            <NumeralToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-5 px-4 py-6 pb-12">
        {/* Learner calm summary & weekly rhythm card */}
        <section className="rounded-3xl border-2 border-[#c9c2b2] bg-surface p-5 shadow-[0_6px_0_#c9c2b2,0_10px_24px_rgba(30,42,74,0.06)] space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-ink-muted">
                សូមស្វាគមន៍មករៀន
              </p>
              <h1 className="text-2xl font-bold text-ink">
                {profile ? profile.displayName : "អ្នករៀនសួនគណិត"}
              </h1>
              {profile && (
                <p className="text-xs text-ink-muted">
                  ថ្នាក់ទី {formatDisplayNumber(profile.gradeLevel, numeralPref)} •{" "}
                  ពិន្ទុគំនិត{" "}
                  <strong className="text-accent">
                    {formatDisplayNumber(profile.totalXp, numeralPref)} XP
                  </strong>
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span
                data-testid="offline-readiness-badge"
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                  isOnline
                    ? "border-success/40 bg-success-soft text-success"
                    : "border-hint bg-hint-soft text-hint-ink"
                }`}
              >
                {!isOnline
                  ? "កំពុងប្រើគ្មានអ៊ីនធឺណិត"
                  : offlineCached
                    ? "រួចរាល់សម្រាប់ប្រើគ្មានអ៊ីនធឺណិត"
                    : "កំពុងរៀបចំទុកក្នុងឧបករណ៍"}
              </span>
              {pendingSyncCount > 0 && (
                <span className="rounded-full border border-border bg-surface-subtle px-2.5 py-1 text-xs text-ink-muted">
                  រង់ចាំផ្សារភ្ជាប់៖{" "}
                  {formatDisplayNumber(pendingSyncCount, numeralPref)}
                </span>
              )}
            </div>
          </div>

          {/* Calm weekly rhythm (target 3 active days/week, zero guilt streaks) */}
          <div className="rounded-2xl border border-border bg-canvas p-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-ink">
                ចង្វាក់រៀនប្រចាំសប្ដាហ៍
              </p>
              <p className="text-xs text-ink-muted">
                គោលដៅ {formatDisplayNumber(weeklyGoal, numeralPref)} ថ្ងៃក្នុងមួយសប្ដាហ៍ (សម្រាកថ្ងៃណាក៏បាន មិនដាច់ពិន្ទុទេ)
              </p>
            </div>
            <div className="flex items-center gap-1.5" aria-label="ថ្ងៃរៀនសប្ដាហ៍នេះ">
              {Array.from({ length: weeklyGoal }).map((_, idx) => {
                const filled = idx < activeDaysThisWeek;
                return (
                  <span
                    key={idx}
                    className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold ${
                      filled
                        ? "border-success bg-success text-white"
                        : "border-border bg-surface text-ink-muted"
                    }`}
                  >
                    {formatDisplayNumber(idx + 1, numeralPref)}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Calm informational mastery badges (zero loot boxes / guilt streaks) */}
          <div
            data-testid="mastery-badges-section"
            className="rounded-2xl border border-border bg-canvas p-3.5 space-y-2.5"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-bold text-ink">
                សញ្ញាសម្គាល់ការយល់ដឹង
              </p>
              <span className="text-xs font-semibold text-ink-muted">
                {formatDisplayNumber(earnedBadgesCount, numeralPref)} /{" "}
                {formatDisplayNumber(badges.length, numeralPref)}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  data-testid={`badge-${badge.id}`}
                  data-earned={badge.earned ? "true" : "false"}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                    badge.earned
                      ? "border-success bg-success-soft text-success"
                      : "border-border bg-surface text-ink-muted"
                  }`}
                  title={formatTextNumerals(badge.descriptionKm, numeralPref)}
                >
                  <span aria-hidden="true">{badge.earned ? "★" : "○"}</span>
                  <span>{formatTextNumerals(badge.titleKm, numeralPref)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Multi-child local switcher on shared family devices */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex flex-wrap items-center gap-1.5">
              {profiles.length > 1 &&
                profiles.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => void switchProfile(p.id)}
                    className={`khmer-chip rounded-full border px-3 text-xs font-semibold ${
                      p.id === profile?.id
                        ? "border-accent bg-accent-soft text-accent"
                        : "border-border bg-surface text-ink-muted"
                    }`}
                  >
                    {p.displayName}
                  </button>
                ))}
            </div>
            <Link
              href="/onboarding"
              className="khmer-chip inline-flex items-center rounded-xl border border-border bg-surface px-3 text-xs font-semibold text-ink hover:bg-surface-subtle"
            >
              {profile ? "+ បន្ថែមឈ្មោះកុមារ" : "បង្កើតឈ្មោះរៀន"}
            </Link>
          </div>
        </section>

        {/* Quick calm actions: Daily Puzzle, Leitner Review, Living Garden & Play Studio */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Link
            href="/play"
            data-testid="play-studio-card"
            className="tile-3d [--tile-edge:#C85A14] rounded-3xl border-2 border-[#C85A14] bg-surface p-4 flex items-center justify-between gap-3"
          >
            <div className="space-y-0.5">
              <p className="text-base font-bold text-ink">ក្ដារលេងគណិត</p>
              <p className="text-xs text-ink-muted">
                ហាងផ្លែឈើ ត្បាញក្រមា កង្កែបលោត ជញ្ជីង និងគូររូបគណិត
              </p>
            </div>
            <span className="rounded-full border-2 border-[#C85A14] bg-[#FF8C42] px-3 py-1 text-xs font-extrabold text-[#1E2A4A] shrink-0">
              លេងសប្បាយ
            </span>
          </Link>

          <Link
            href="/garden"
            data-testid="garden-card"
            className="tile-3d [--tile-edge:#148F56] rounded-3xl border-2 border-[#148F56] bg-surface p-4 flex items-center justify-between gap-3"
          >
            <div className="space-y-0.5">
              <p className="text-base font-bold text-ink">សួនគណិតរបស់ខ្ញុំ</p>
              <p className="text-xs text-ink-muted">
                ដើមស្វាយ កង្កែបតូច និងផ្កាឈូករីកតាមការរៀន
              </p>
            </div>
            <span className="rounded-full border-2 border-[#148F56] bg-[#22C57B] px-3 py-1 text-xs font-extrabold text-[#0D2B1D] shrink-0">
              មើលសួន
            </span>
          </Link>

          <Link
            href="/daily"
            data-testid="daily-puzzle-card"
            className="tile-3d [--tile-edge:#13429E] rounded-3xl border-2 border-[#13429E] bg-surface p-4 flex items-center justify-between gap-3"
          >
            <div className="space-y-0.5">
              <p className="text-base font-bold text-ink">លំហាត់ប្រចាំថ្ងៃ</p>
              <p className="text-xs text-ink-muted">
                {dailyDoneToday
                  ? "បានបញ្ចប់លំហាត់ថ្ងៃនេះហើយ!"
                  : `ល្បងគំនិតរូបភាព ${formatDisplayNumber(2, numeralPref)} នាទី`}
              </p>
            </div>
            <span
              className={`rounded-full border-2 px-3 py-1 text-xs font-extrabold shrink-0 ${
                dailyDoneToday
                  ? "border-[#148F56] bg-[#22C57B] text-[#0D2B1D]"
                  : "border-[#13429E] bg-[#1D5FD6] text-white"
              }`}
            >
              {dailyDoneToday ? "រួចរាល់" : "សាកល្បង"}
            </span>
          </Link>

          <Link
            href="/review"
            data-testid="review-queue-card"
            className="tile-3d [--tile-edge:#5620B8] rounded-3xl border-2 border-[#5620B8] bg-surface p-4 flex items-center justify-between gap-3"
          >
            <div className="space-y-0.5">
              <p className="text-base font-bold text-ink">រំលឹកឡើងវិញ</p>
              <p className="text-xs text-ink-muted">
                {dueReviewCount > 0
                  ? `ដល់ពេលរំលឹក ${formatDisplayNumber(dueReviewCount, numeralPref)} មេរៀន`
                  : "តារាងរំលឹកតាមប្រអប់ Leitner"}
              </p>
            </div>
            <span
              className={`rounded-full border-2 px-3 py-1 text-xs font-extrabold shrink-0 ${
                dueReviewCount > 0
                  ? "border-[#C89600] bg-[#FFD23F] text-[#1E2A4A]"
                  : "border-[#5620B8] bg-[#7C3AED] text-white"
              }`}
            >
              {dueReviewCount > 0
                ? `${formatDisplayNumber(dueReviewCount, numeralPref)} មេរៀន`
                : "មើលតារាង"}
            </span>
          </Link>
        </section>

        {/* Unrestricted Multi-Path Selector + Interactive Activity Filter Menu */}
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-bold text-ink-muted">
              ជ្រើសរើសផ្លូវរៀន ឬតម្រងមេរៀនអន្តរកម្ម
            </p>
            <div
              role="group"
              aria-label="តម្រងប្រភេទមេរៀន"
              className="flex flex-wrap gap-1.5"
            >
              <button
                type="button"
                data-testid="filter-mode-path"
                aria-pressed={activityFilter === "path"}
                onClick={() => setActivityFilter("path")}
                className={`khmer-chip pill-3d rounded-full border-2 px-3 text-xs font-extrabold transition-colors ${
                  activityFilter === "path"
                    ? "border-[#C89600] [--pill-edge:#C89600] bg-[#FFD23F] text-[#1E2A4A]"
                    : "border-[#c9c2b2] [--pill-edge:#c9c2b2] bg-surface text-ink-muted hover:text-ink"
                }`}
              >
                តាមផ្លូវរៀន
              </button>
              <button
                type="button"
                data-testid="filter-mode-drawing"
                aria-pressed={activityFilter === "drawing"}
                onClick={() => setActivityFilter("drawing")}
                className={`khmer-chip pill-3d rounded-full border-2 px-3 text-xs font-extrabold transition-colors ${
                  activityFilter === "drawing"
                    ? "border-[#9E1943] [--pill-edge:#9E1943] bg-[#D62860] text-white"
                    : "border-[#c9c2b2] [--pill-edge:#c9c2b2] bg-surface text-ink-muted hover:text-ink"
                }`}
              >
                គូររូប ({formatDisplayNumber(drawingLessonsCount, numeralPref)})
              </button>
              <button
                type="button"
                data-testid="filter-mode-all"
                aria-pressed={activityFilter === "all"}
                onClick={() => setActivityFilter("all")}
                className={`khmer-chip pill-3d rounded-full border-2 px-3 text-xs font-extrabold transition-colors ${
                  activityFilter === "all"
                    ? "border-[#13429E] [--pill-edge:#13429E] bg-[#1D5FD6] text-white"
                    : "border-[#c9c2b2] [--pill-edge:#c9c2b2] bg-surface text-ink-muted hover:text-ink"
                }`}
              >
                ទាំងអស់ ({formatDisplayNumber(allLessons.length, numeralPref)})
              </button>
            </div>
          </div>

          <nav aria-label="ជ្រើសរើសផ្លូវរៀន" className="flex flex-wrap gap-2">
            {paths.map((p, pathIdx) => {
              const isActive =
                activityFilter === "path" && p.id === activePath?.id;
              const candy = CANDY_THEMES[pathIdx % CANDY_THEMES.length];
              return (
                <button
                  key={p.id}
                  type="button"
                  data-testid={`path-tab-${p.id}`}
                  aria-pressed={isActive}
                  onClick={() => {
                    setSelectedPathId(p.id);
                    setActivityFilter("path");
                  }}
                  className={`khmer-chip btn-3d rounded-2xl border-2 px-4 text-sm font-extrabold transition-colors ${
                    isActive
                      ? `${candy.className} ${candy.btnEdge} ${candy.cardBorder} ${candy.badgeBg} ${candy.badgeText}`
                      : "border-[#c9c2b2] [--btn-edge:#c9c2b2] bg-surface text-ink hover:bg-surface-subtle"
                  }`}
                >
                  {formatTextNumerals(p.shortTitleKm, numeralPref)}{" "}
                  <span
                    className={isActive ? candy.badgeText : "text-ink-muted"}
                  >
                    ({formatDisplayNumber(p.lessons.length, numeralPref)})
                  </span>
                </button>
              );
            })}
          </nav>
        </section>

        {/* Active Learning Path Header & Unrestricted Lesson List */}
        {activePath && (
          <section className="space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-ink">
                  {activityFilter === "drawing"
                    ? "មេរៀនគូររូបធរណីមាត្រ ស៊ីមេទ្រី និងផ្ទៃក្រឡា"
                    : activityFilter === "all"
                      ? "មេរៀនអន្តរកម្មទាំងអស់"
                      : formatTextNumerals(activePath.titleKm, numeralPref)}
                </h2>
                <p className="text-sm text-ink-muted">
                  {activityFilter === "drawing"
                    ? "ប៉ះចំណុចគូររូប គូរស៊ីមេទ្រីប្រាសាទខ្មែរ និងលាបពណ៌ផ្ទៃក្រឡាប្រភាគ"
                    : activityFilter === "all"
                      ? "រៀនមេរៀនណាក៏បានដោយសេរី — មិនចាក់សោតាមថ្នាក់រៀនទេ"
                      : formatTextNumerals(activePath.subtitleKm, numeralPref)}
                </p>
              </div>
              <span className="rounded-full border-2 border-[#c9c2b2] bg-surface px-3 py-1 text-xs font-bold text-ink-muted">
                {activityFilter === "path" ? (
                  <>
                    បានរៀន{" "}
                    {formatDisplayNumber(completedInActivePath, numeralPref)} /{" "}
                    {formatDisplayNumber(
                      activePath.lessons.length,
                      numeralPref
                    )}{" "}
                    មេរៀន
                  </>
                ) : (
                  <>
                    បង្ហាញ{" "}
                    {formatDisplayNumber(visibleLessons.length, numeralPref)}{" "}
                    មេរៀន
                  </>
                )}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3.5">
              {visibleLessons.map((lesson, idx) => {
                const prog = progressByLesson[lesson.id];
                const tier: MasteryTier = prog?.masteryTier ?? "not_started";
                const starCount = MASTERY_STAR_COUNT[tier];
                const candy = CANDY_THEMES[idx % CANDY_THEMES.length];
                const gradeNum = lesson.moeysGradeRef.replace("G", "");
                const hasDrawing = lesson.steps.some(
                  (s) => s.type === "geometry-draw"
                );

                return (
                  <Link
                    key={lesson.id}
                    href={`/learn/${lesson.id}`}
                    data-testid={`lesson-card-${lesson.id}`}
                    data-candy={candy.name}
                    className={`group tile-3d ${candy.className} ${candy.tileEdge} rounded-3xl border-2 ${candy.cardBorder} bg-surface p-4 sm:p-5 flex items-start gap-3.5 sm:gap-4`}
                  >
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 ${candy.badgeBorder} ${candy.badgeBg} ${candy.badgeText} shadow-[0_3px_0_var(--candy-edge)] text-lg font-extrabold`}
                    >
                      {formatDisplayNumber(lesson.order, numeralPref)}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-base sm:text-lg font-bold text-ink">
                          {formatTextNumerals(lesson.titleKm, numeralPref)}
                        </h3>
                        <div className="flex items-center gap-1.5">
                          <span
                            data-testid={`mastery-stars-${lesson.id}`}
                            data-stars={String(starCount)}
                            aria-hidden="true"
                            className="inline-flex items-center gap-0.5 text-sm leading-none"
                          >
                            {[1, 2, 3].map((starIdx) => (
                              <span
                                key={starIdx}
                                className={
                                  starIdx <= starCount
                                    ? "text-[#C89600]"
                                    : "text-[#d6d0c4]"
                                }
                              >
                                ★
                              </span>
                            ))}
                          </span>
                          <span
                            data-testid={`mastery-badge-${lesson.id}`}
                            className={`rounded-full border-2 px-2.5 py-0.5 text-xs font-extrabold ${MASTERY_BADGE_STYLE[tier]}`}
                          >
                            {MASTERY_LABELS_KM[tier]}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-ink-muted">
                        {formatTextNumerals(lesson.subtitleKm, numeralPref)}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs font-semibold text-ink-muted">
                        <span>
                          ថ្នាក់ទី {formatDisplayNumber(gradeNum, numeralPref)}
                        </span>
                        <span aria-hidden="true">•</span>
                        <span>
                          ប្រហែល{" "}
                          {formatDisplayNumber(
                            lesson.estimatedMinutes,
                            numeralPref
                          )}{" "}
                          នាទី
                        </span>
                        <span aria-hidden="true">•</span>
                        <span>
                          {formatDisplayNumber(
                            lesson.steps.length,
                            numeralPref
                          )}{" "}
                          ជំហាន
                        </span>
                        {hasDrawing && (
                          <>
                            <span aria-hidden="true">•</span>
                            <span className="rounded-full border border-[#9E1943] bg-[#FFE3EC] px-2 py-0.5 text-[11px] font-extrabold text-[#9E1943]">
                              គូររូបអន្តរកម្ម
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
