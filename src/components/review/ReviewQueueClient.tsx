"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { LessonDocumentV1 } from "@/lib/curriculum/schema";
import { useLearner } from "@/components/providers/LearnerProvider";
import { NumeralToggle } from "@/components/ui/NumeralToggle";
import { buildReviewQueue } from "@/lib/math/reviewQueue";
import { MASTERY_LABELS_KM } from "@/lib/math/mastery";
import {
  formatDisplayNumber,
  formatTextNumerals,
} from "@/lib/khmer/numerals";

interface ReviewQueueClientProps {
  lessons: LessonDocumentV1[];
}

export function ReviewQueueClient({ lessons }: ReviewQueueClientProps) {
  const { progressByLesson, numeralPref } = useLearner();
  const [nowDate, setNowDate] = useState<Date | null>(null);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (active) setNowDate(new Date());
    });
    return () => {
      active = false;
    };
  }, []);

  const queue = useMemo(() => {
    if (!nowDate) return { due: [], upcoming: [] };
    return buildReviewQueue(lessons, progressByLesson, nowDate);
  }, [lessons, progressByLesson, nowDate]);

  return (
    <div className="min-h-dvh bg-canvas flex flex-col">
      <header className="sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-2">
          <Link
            href="/learn"
            className="khmer-chip inline-flex items-center rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-ink hover:bg-surface-subtle"
          >
            ← ផ្លូវរៀន
          </Link>
          <NumeralToggle />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 px-4 py-6 pb-12">
        <section className="rounded-3xl border border-border bg-surface p-5 shadow-xs space-y-2">
          <h1 className="text-2xl font-bold text-ink">
            តារាងរំលឹកឡើងវិញ (Leitner)
          </h1>
          <p className="text-sm text-ink-muted">
            {formatTextNumerals(
              "ការរំលឹកតាមប្រអប់ ១, ២, ៤, ៨ និង ១៦ ថ្ងៃ ជួយឱ្យចងចាំគោលគំនិតគណិតបានយូរដោយគ្មានសម្ពាធ។",
              numeralPref
            )}
          </p>
        </section>

        {/* Due lessons */}
        <section className="space-y-3" aria-label="មេរៀនដល់ពេលរំលឹក">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink">
              ដល់ពេលរំលឹកថ្ងៃនេះ ({formatDisplayNumber(queue.due.length, numeralPref)})
            </h2>
          </div>

          {queue.due.length === 0 ? (
            <div
              data-testid="review-empty-due"
              className="rounded-2xl border border-border bg-surface p-5 text-center space-y-2"
            >
              <p className="text-base font-bold text-success">
                ល្អណាស់! មិនមានមេរៀនហួសកាលកំណត់រំលឹកទេ
              </p>
              <p className="text-sm text-ink-muted">
                អ្នកអាចរៀនមេរៀនថ្មី ឬសាកល្បងលំហាត់ប្រចាំថ្ងៃ ២ នាទីបាន!
              </p>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                <Link
                  href="/daily"
                  className="khmer-chip inline-flex items-center rounded-xl bg-accent px-4 text-sm font-bold text-white hover:bg-accent-hover"
                >
                  លំហាត់ប្រចាំថ្ងៃ
                </Link>
                <Link
                  href="/learn"
                  className="khmer-chip inline-flex items-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-ink hover:bg-surface-subtle"
                >
                  ទៅផ្លូវរៀន
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {queue.due.map(({ lesson, progress }) => (
                <Link
                  key={lesson.id}
                  href={`/learn/${lesson.id}`}
                  data-testid={`due-review-item-${lesson.id}`}
                  className="rounded-2xl border-2 border-hint bg-surface p-4 shadow-xs hover:bg-hint-soft/40 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <p className="text-base font-bold text-ink">
                      {formatTextNumerals(lesson.titleKm, numeralPref)}
                    </p>
                    <p className="text-xs text-ink-muted">
                      ប្រអប់ Leitner ទី{" "}
                      {formatDisplayNumber(progress.leitnerBox, numeralPref)} •{" "}
                      {MASTERY_LABELS_KM[progress.masteryTier]}
                    </p>
                  </div>
                  <span className="khmer-chip inline-flex items-center rounded-xl bg-accent px-3.5 text-xs font-bold text-white shrink-0">
                    រំលឹកឥឡូវ
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Upcoming / optional early practice */}
        {queue.upcoming.length > 0 && (
          <section className="space-y-3" aria-label="មេរៀននឹងដល់ពេលរំលឹក">
            <h2 className="text-base font-bold text-ink-muted">
              មេរៀនរួចរាល់ — អាចរំលឹកមុនកំណត់ ({formatDisplayNumber(queue.upcoming.length, numeralPref)})
            </h2>
            <div className="grid grid-cols-1 gap-2.5">
              {queue.upcoming.map(({ lesson, progress, daysUntilDue }) => (
                <Link
                  key={lesson.id}
                  href={`/learn/${lesson.id}`}
                  data-testid={`upcoming-review-item-${lesson.id}`}
                  className="rounded-2xl border border-border bg-surface p-4 hover:bg-surface-subtle transition-colors flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-ink">
                      {formatTextNumerals(lesson.titleKm, numeralPref)}
                    </p>
                    <p className="text-xs text-ink-muted">
                      ប្រអប់ទី{" "}
                      {formatDisplayNumber(progress.leitnerBox, numeralPref)} •{" "}
                      រំលឹកក្នុង{" "}
                      {formatDisplayNumber(Math.max(1, daysUntilDue), numeralPref)}{" "}
                      ថ្ងៃទៀត
                    </p>
                  </div>
                  <span className="text-xs font-bold text-accent shrink-0">
                    អនុវត្ត →
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
