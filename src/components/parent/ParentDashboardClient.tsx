"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { LearningPathMeta } from "@/lib/curriculum/loader";
import { useLearner } from "@/components/providers/LearnerProvider";
import { NumeralToggle } from "@/components/ui/NumeralToggle";
import { AchievementCertificate } from "@/components/ui/AchievementCertificate";
import {
  formatDisplayNumber,
  formatTextNumerals,
  normalizeNumericInput,
} from "@/lib/khmer/numerals";
import { buildParentReport } from "@/lib/math/parentReport";

interface ParentDashboardClientProps {
  paths: LearningPathMeta[];
}

const PARENT_PIN_KEY = "konleuh-kanit:parent-pin";
const MATH_GATE_ANSWER = 56; // 7 × 8 = 56

export function ParentDashboardClient({ paths }: ParentDashboardClientProps) {
  const { profile, profiles, progressByLesson, numeralPref, switchProfile } =
    useLearner();

  const [savedPin, setSavedPin] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState<boolean>(false);
  const [gateInput, setGateInput] = useState<string>("");
  const [gateError, setGateError] = useState<string>("");
  const [newPinInput, setNewPinInput] = useState<string>("");
  const [pinSavedMsg, setPinSavedMsg] = useState<string>("");
  const [nowDate, setNowDate] = useState<Date | null>(null);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (!active) return;
      try {
        const stored = window.localStorage.getItem(PARENT_PIN_KEY);
        if (stored) setSavedPin(stored);
      } catch {
        // ignore
      }
      setNowDate(new Date());
    });
    return () => {
      active = false;
    };
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const numeric = normalizeNumericInput(gateInput);

    if (savedPin) {
      const normalizedPin = normalizeNumericInput(savedPin);
      if (numeric !== null && normalizedPin !== null && numeric === normalizedPin) {
        setUnlocked(true);
        setGateError("");
        return;
      }
      setGateError("លេខកូដ PIN មិនត្រឹមត្រូវទេ សូមសាកល្បងម្ដងទៀត។");
      return;
    }

    if (numeric === MATH_GATE_ANSWER) {
      setUnlocked(true);
      setGateError("");
      return;
    }

    setGateError("ចម្លើយមិនទាន់ត្រូវទេ សូមគណនា ៧ × ៨ ម្ដងទៀតណា៎!");
  };

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    const num = normalizeNumericInput(newPinInput);
    if (num === null || newPinInput.trim().length < 4) {
      setPinSavedMsg("សូមបញ្ចូលលេខ PIN ៤ ខ្ទង់!");
      return;
    }
    const clean = String(num).padStart(4, "0").slice(0, 4);
    try {
      window.localStorage.setItem(PARENT_PIN_KEY, clean);
      setSavedPin(clean);
      setNewPinInput("");
      setPinSavedMsg("បានរក្សាទុកលេខកូដ PIN របស់អាណាព្យាបាលដោយជោគជ័យ!");
    } catch {
      setPinSavedMsg("មិនអាចរក្សាទុក PIN បានទេ។");
    }
  };

  const report = useMemo(() => {
    if (!nowDate) return null;
    return buildParentReport(paths, progressByLesson, nowDate);
  }, [paths, progressByLesson, nowDate]);

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
        {!unlocked ? (
          <section className="rounded-3xl border border-border bg-surface p-6 shadow-xs space-y-5">
            <div className="space-y-1">
              <p className="text-xs font-bold text-accent">
                សម្រាប់ឪពុកម្ដាយ ឬអាណាព្យាបាល
              </p>
              <h1 className="text-2xl font-bold text-ink">
                ផ្ទាំងតាមដានវឌ្ឍនភាពកុមារ
              </h1>
              <p className="text-sm text-ink-muted">
                {savedPin
                  ? "សូមបញ្ចូលលេខកូដ PIN ៤ ខ្ទង់របស់អ្នកដើម្បីបើកមើលរបាយការណ៍។"
                  : formatTextNumerals(
                      "ដើម្បីបញ្ជាក់ថាជាអាណាព្យាបាល សូមគណនា៖ ៧ × ៨ = ?",
                      numeralPref
                    )}
              </p>
            </div>

            <form onSubmit={handleUnlock} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="parent-gate-input"
                  className="block text-sm font-bold text-ink"
                >
                  {savedPin ? "លេខកូដ PIN (លេខខ្មែរ ឬអារ៉ាប់)" : "ចម្លើយ (លេខខ្មែរ ឬអារ៉ាប់)"}
                </label>
                <input
                  id="parent-gate-input"
                  data-testid="parent-gate-input"
                  type="text"
                  inputMode="numeric"
                  value={gateInput}
                  onChange={(e) => setGateInput(e.target.value)}
                  placeholder={savedPin ? "ឧ. ១២៣៤ ឬ 1234" : "ឧ. ៥៦ ឬ 56"}
                  className="w-full min-h-[48px] rounded-2xl border-2 border-border bg-canvas px-4 py-2.5 text-base text-ink focus:border-accent focus:outline-none"
                />
              </div>

              {gateError && (
                <p
                  data-testid="parent-gate-error"
                  role="status"
                  className="rounded-xl border border-hint bg-hint-soft px-3.5 py-2 text-sm font-semibold text-hint-ink"
                >
                  {gateError}
                </p>
              )}

              <button
                type="submit"
                data-testid="parent-unlock-btn"
                className="khmer-chip w-full rounded-2xl bg-accent px-5 py-3 text-base font-bold text-white shadow-xs hover:bg-accent-hover"
              >
                បើកមើលរបាយការណ៍
              </button>
            </form>
          </section>
        ) : (
          <div data-testid="parent-dashboard-content" className="space-y-5">
            {/* Child selector & overview */}
            <section className="rounded-3xl border border-border bg-surface p-5 shadow-xs space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-accent">
                    របាយការណ៍អាណាព្យាបាល
                  </p>
                  <h1 className="text-2xl font-bold text-ink">
                    {profile ? profile.displayName : "សិស្សសួនគណិត"}
                  </h1>
                  {profile && (
                    <p className="text-xs text-ink-muted">
                      អាយុ {formatDisplayNumber(profile.ageYears, numeralPref)} ឆ្នាំ • ថ្នាក់ទី{" "}
                      {formatDisplayNumber(profile.gradeLevel, numeralPref)} • ថ្ងៃសកម្មសរុប{" "}
                      {formatDisplayNumber(profile.activeDates.length, numeralPref)} ថ្ងៃ
                    </p>
                  )}
                </div>

                {profiles.length > 1 && (
                  <div className="flex flex-wrap gap-1.5">
                    {profiles.map((p) => (
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
                )}
              </div>

              {report && (
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="rounded-2xl border border-border bg-canvas p-3 text-center">
                    <p className="text-xs text-ink-muted">មេរៀនបានបញ្ចប់</p>
                    <p className="mt-1 text-lg font-bold text-ink">
                      {formatDisplayNumber(report.totalCompletedLessons, numeralPref)} /{" "}
                      {formatDisplayNumber(report.totalAvailableLessons, numeralPref)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border bg-canvas p-3 text-center">
                    <p className="text-xs text-ink-muted">ចំណុចខ្លាំង</p>
                    <p className="mt-1 text-lg font-bold text-success">
                      {formatDisplayNumber(report.strengths.length, numeralPref)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border bg-canvas p-3 text-center">
                    <p className="text-xs text-ink-muted">គួររំលឹកបន្ថែម</p>
                    <p className="mt-1 text-lg font-bold text-hint-ink">
                      {formatDisplayNumber(report.practiceRecommended.length, numeralPref)}
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* Per-path progress */}
            {report && (
              <section className="rounded-3xl border border-border bg-surface p-5 shadow-xs space-y-3">
                <h2 className="text-lg font-bold text-ink">
                  វឌ្ឍនភាពតាមផ្លូវរៀននីមួយៗ
                </h2>
                <div className="space-y-3">
                  {report.pathSummaries.map((ps) => {
                    const pct =
                      ps.totalLessons > 0
                        ? Math.round((ps.completedLessons / ps.totalLessons) * 100)
                        : 0;
                    return (
                      <div
                        key={ps.pathId}
                        className="rounded-2xl border border-border bg-canvas p-3.5 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2 text-sm font-bold text-ink">
                          <span>{formatTextNumerals(ps.titleKm, numeralPref)}</span>
                          <span className="text-accent">
                            {formatDisplayNumber(ps.completedLessons, numeralPref)} /{" "}
                            {formatDisplayNumber(ps.totalLessons, numeralPref)}
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-surface-subtle overflow-hidden">
                          <div
                            className="h-full rounded-full bg-accent"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Strengths & Practice Needs */}
            {report && (
              <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-3xl border border-border bg-surface p-4 space-y-2.5">
                  <h2 className="text-base font-bold text-success">
                    ចំណុចខ្លាំងរបស់កុមារ
                  </h2>
                  {report.strengths.length === 0 ? (
                    <p className="text-xs text-ink-muted">
                      កុមារទើបតែចាប់ផ្ដើម — ចំណុចខ្លាំងនឹងបង្ហាញពេលបញ្ចប់មេរៀនដំបូង!
                    </p>
                  ) : (
                    <ul className="space-y-1.5 text-sm text-ink">
                      {report.strengths.map(({ lesson, accuracyPct }) => (
                        <li
                          key={lesson.id}
                          className="rounded-xl bg-success-soft px-3 py-2 flex items-center justify-between gap-2"
                        >
                          <span>{formatTextNumerals(lesson.titleKm, numeralPref)}</span>
                          <strong className="text-xs text-success">
                            {formatDisplayNumber(accuracyPct, numeralPref)}%
                          </strong>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="rounded-3xl border border-border bg-surface p-4 space-y-2.5">
                  <h2 className="text-base font-bold text-hint-ink">
                    មេរៀនគួរអនុវត្តបន្ថែម
                  </h2>
                  {report.practiceRecommended.length === 0 ? (
                    <p className="text-xs text-ink-muted">
                      គ្មានមេរៀនណាដែលត្រូវការអនុវត្តបន្ទាន់ទេ — អស្ចារ្យណាស់!
                    </p>
                  ) : (
                    <ul className="space-y-1.5 text-sm text-ink">
                      {report.practiceRecommended.map(({ lesson, reasonKm }) => (
                        <li
                          key={lesson.id}
                          className="rounded-xl bg-hint-soft px-3 py-2 space-y-0.5"
                        >
                          <p className="font-semibold">
                            {formatTextNumerals(lesson.titleKm, numeralPref)}
                          </p>
                          <p className="text-xs text-hint-ink">{reasonKm}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            )}

            {/* Printable Offline Khmer Achievement Certificate */}
            <AchievementCertificate />

            {/* Optional custom 4-digit caregiver PIN */}
            <section className="no-print rounded-3xl border border-border bg-surface p-5 shadow-xs space-y-3">
              <h2 className="text-base font-bold text-ink">
                កំណត់លេខកូដ PIN ផ្ទាល់ខ្លួន (ជម្រើសបន្ថែម)
              </h2>
              <form
                onSubmit={handleSavePin}
                className="flex flex-wrap items-center gap-2"
              >
                <label htmlFor="new-pin-input" className="sr-only">
                  លេខកូដ PIN ៤ ខ្ទង់ថ្មី
                </label>
                <input
                  id="new-pin-input"
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value)}
                  placeholder="បញ្ចូល ៤ ខ្ទង់ (ឧ. ១២៣៤)"
                  className="flex-1 min-w-[180px] min-h-[44px] rounded-xl border border-border bg-canvas px-3 text-sm text-ink"
                />
                <button
                  type="submit"
                  className="khmer-chip rounded-xl border border-accent bg-accent-soft px-4 text-xs font-bold text-accent hover:bg-accent hover:text-white"
                >
                  រក្សាទុក PIN
                </button>
              </form>
              {pinSavedMsg && (
                <p className="text-xs font-semibold text-success">
                  {pinSavedMsg}
                </p>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
