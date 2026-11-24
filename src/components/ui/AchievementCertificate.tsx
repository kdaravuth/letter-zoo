"use client";

import React, { useState } from "react";
import { useLearner } from "@/components/providers/LearnerProvider";
import { computeMasteryBadges } from "@/lib/math/badges";
import {
  formatDisplayNumber,
  formatTextNumerals,
} from "@/lib/khmer/numerals";
import { MascotFrog } from "@/components/ui/MascotFrog";

export function AchievementCertificate() {
  const { profile, progressByLesson, numeralPref } = useLearner();
  const [expanded, setExpanded] = useState<boolean>(false);

  const completedCount = Object.values(progressByLesson).filter(
    (p) => p.masteryTier !== "not_started"
  ).length;
  const masteredCount = Object.values(progressByLesson).filter(
    (p) => p.masteryTier === "mastered" || p.masteryTier === "proficient"
  ).length;
  const badges = computeMasteryBadges(progressByLesson).filter((b) => b.earned);

  const learnerName = profile?.displayName || "អ្នករៀនសួនគណិត";
  const gradeLevel = profile?.gradeLevel ?? 1;
  const totalXp = profile?.totalXp ?? 0;

  return (
    <section className="rounded-3xl border-2 border-amber-700/30 bg-surface p-4 sm:p-5 shadow-xs space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="space-y-0.5">
          <p className="text-xs font-bold text-amber-800">
            វិញ្ញាបនបត្រលើកទឹកចិត្ត • បោះពុម្ពបានគ្មានអ៊ីនធឺណិត
          </p>
          <h2 className="text-base sm:text-lg font-bold text-ink">
            វិញ្ញាបនបត្រកោតសរសើរ សួនគណិត
          </h2>
        </div>

        <button
          type="button"
          data-testid="open-certificate-btn"
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
          className="khmer-chip rounded-2xl bg-amber-700 px-4 text-xs font-bold text-white shadow-xs hover:bg-amber-800"
        >
          {expanded ? "លាក់វិញ្ញាបនបត្រ" : "បើកមើលវិញ្ញាបនបត្រ"}
        </button>
      </div>

      {expanded && (
        <div className="space-y-3">
          {/* Print-ready Khmer Certificate */}
          <div
            data-testid="certificate-preview"
            className="certificate-printable rounded-3xl border-4 border-double border-amber-700 bg-[#fffdf7] p-5 sm:p-7 text-center space-y-4 shadow-sm"
          >
            <div className="flex items-center justify-center gap-3">
              <MascotFrog mood="happy" size={52} />
              <div className="text-left">
                <p className="text-xs font-bold text-amber-800">
                  កម្មវិធីរៀនគណិតវិទ្យាខ្មែរ • សួនគណិត
                </p>
                <h3 className="text-xl sm:text-2xl font-bold text-ink">
                  វិញ្ញាបនបត្រកោតសរសើរ
                </h3>
              </div>
            </div>

            <p className="text-sm text-ink-muted">
              សូមប្រគល់ជូនកុមារដ៏ឆ្លាតវៃ និងឧស្សាហ៍ព្យាយាម
            </p>

            <p className="text-2xl sm:text-3xl font-bold text-accent">
              {learnerName}
            </p>

            <p className="text-xs font-semibold text-ink-muted">
              ថ្នាក់ទី {formatDisplayNumber(gradeLevel, numeralPref)} •{" "}
              បានបង្ហាញការតាំងចិត្តស្វែងយល់គណិតវិទ្យាដោយភាពស្ងប់ស្ងាត់ និងរីករាយ
            </p>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="rounded-2xl border border-amber-700/25 bg-surface p-2.5">
                <p className="text-xs text-ink-muted">មេរៀនបានរៀន</p>
                <p className="text-lg font-bold text-ink">
                  {formatDisplayNumber(completedCount, numeralPref)}
                </p>
              </div>
              <div className="rounded-2xl border border-amber-700/25 bg-surface p-2.5">
                <p className="text-xs text-ink-muted">ស្ទាត់ជំនាញ</p>
                <p className="text-lg font-bold text-success">
                  {formatDisplayNumber(masteredCount, numeralPref)}
                </p>
              </div>
              <div className="rounded-2xl border border-amber-700/25 bg-surface p-2.5">
                <p className="text-xs text-ink-muted">ពិន្ទុគំនិត</p>
                <p className="text-lg font-bold text-accent">
                  {formatDisplayNumber(totalXp, numeralPref)} XP
                </p>
              </div>
            </div>

            {badges.length > 0 && (
              <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                {badges.map((b) => (
                  <span
                    key={b.id}
                    className="rounded-full border border-success bg-success-soft px-3 py-0.5 text-xs font-bold text-success"
                  >
                    ★ {formatTextNumerals(b.titleKm, numeralPref)}
                  </span>
                ))}
              </div>
            )}

            <p className="text-xs text-ink-muted pt-2 border-t border-amber-700/20">
              សួនគណិត (Soun Kanit) • រៀនគណិតដោយមើលឃើញ និងប៉ះផ្ទាល់ដៃ
            </p>
          </div>

          <div className="flex justify-end no-print">
            <button
              type="button"
              data-testid="print-certificate-btn"
              onClick={() => window.print()}
              className="khmer-chip rounded-2xl bg-accent px-5 py-2.5 text-sm font-bold text-white shadow-xs hover:bg-accent-hover"
            >
              បោះពុម្ពវិញ្ញាបនបត្រ
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
