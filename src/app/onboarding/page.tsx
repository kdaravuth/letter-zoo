"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLearner } from "@/components/providers/LearnerProvider";
import { NumeralToggle } from "@/components/ui/NumeralToggle";
import {
  formatDisplayNumber,
  formatTextNumerals,
} from "@/lib/khmer/numerals";

const AVATARS = [
  { id: "lotus", labelKm: "ផ្កាឈូក", color: "#f472b6" },
  { id: "mango", labelKm: "ស្វាយទុំ", color: "#f59e0b" },
  { id: "frog", labelKm: "កង្កែបតូច", color: "#22c55e" },
  { id: "star", labelKm: "ផ្កាយភ្លឺ", color: "#3b82f6" },
] as const;

const WARMUP_QUESTIONS = [
  {
    id: "w1",
    promptKm: "តើមានផ្លែស្វាយប៉ុន្មានផ្លែ? (៣ ផ្លែ + ២ ផ្លែ)",
    options: [
      { id: "a", labelKm: "៤ ផ្លែ" },
      { id: "b", labelKm: "៥ ផ្លែ", correct: true },
      { id: "c", labelKm: "៦ ផ្លែ" },
    ],
  },
  {
    id: "w2",
    promptKm: "លេខ ៨ ត្រូវការប៉ុន្មានទៀតដើម្បីបង្គ្រប់ ១០?",
    options: [
      { id: "a", labelKm: "២", correct: true },
      { id: "b", labelKm: "៣" },
      { id: "c", labelKm: "១" },
    ],
  },
  {
    id: "w3",
    promptKm: "តើលេខណាមួយធំជាង ៧?",
    options: [
      { id: "a", labelKm: "៥" },
      { id: "b", labelKm: "៦" },
      { id: "c", labelKm: "៩", correct: true },
    ],
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { numeralPref, createGuestProfile } = useLearner();

  const [displayName, setDisplayName] = useState<string>("");
  const [avatarId, setAvatarId] = useState<string>("lotus");
  const [ageYears, setAgeYears] = useState<number>(7);
  const [gradeLevel, setGradeLevel] = useState<number>(1);
  const [showWarmup, setShowWarmup] = useState<boolean>(false);
  const [warmupIdx, setWarmupIdx] = useState<number>(0);
  const [warmupDone, setWarmupDone] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleAgeSelect = (age: number) => {
    setAgeYears(age);
    const advisoryGrade = Math.max(1, Math.min(6, age - 5));
    setGradeLevel(advisoryGrade);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    try {
      await createGuestProfile({
        displayName: displayName.trim() || "ដារ៉ា",
        avatarId,
        ageYears,
        gradeLevel,
        numeralPreference: numeralPref,
      });
      router.push("/learn");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-dvh bg-canvas flex flex-col">
      <header className="sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur px-4 py-3">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-2">
          <Link
            href="/"
            className="khmer-chip inline-flex items-center rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-ink hover:bg-surface-subtle"
          >
            ← ទំព័រដើម
          </Link>
          <NumeralToggle />
        </div>
      </header>

      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-6">
        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="rounded-3xl border border-border bg-surface p-5 sm:p-6 shadow-xs space-y-6"
        >
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-ink">
              សួស្ដីអ្នករៀនថ្មី!
            </h1>
            <p className="text-sm text-ink-muted">
              មិនបាច់ប្រើអ៊ីមែល ឬពាក្យសម្ងាត់ទេ — បង្កើតឈ្មោះរៀនភ្លាមៗលើឧបករណ៍នេះ។
            </p>
          </div>

          {/* Nickname */}
          <div className="space-y-2">
            <label
              htmlFor="nickname-input"
              className="block text-sm font-bold text-ink"
            >
              ឈ្មោះហៅក្រៅរបស់អ្នក
            </label>
            <input
              id="nickname-input"
              data-testid="nickname-input"
              type="text"
              maxLength={40}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="ឧ. ដារ៉ា ឬ សុខា"
              className="w-full min-h-[48px] rounded-2xl border-2 border-border bg-canvas px-4 py-2.5 text-base text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none"
            />
          </div>

          {/* Avatar picker */}
          <fieldset className="space-y-2">
            <legend className="text-sm font-bold text-ink">
              ជ្រើសរើសរូបតំណាង
            </legend>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {AVATARS.map((av) => {
                const selected = avatarId === av.id;
                return (
                  <button
                    key={av.id}
                    type="button"
                    data-testid={`avatar-${av.id}`}
                    aria-pressed={selected}
                    onClick={() => setAvatarId(av.id)}
                    className={`khmer-chip flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 p-3 text-sm font-semibold transition-colors ${
                      selected
                        ? "border-accent bg-accent-soft text-ink"
                        : "border-border bg-surface text-ink-muted hover:bg-surface-subtle"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className="h-9 w-9 rounded-full"
                      style={{ backgroundColor: av.color }}
                    />
                    <span>{av.labelKm}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* Age (6-12) */}
          <fieldset className="space-y-2">
            <legend className="text-sm font-bold text-ink">
              អាយុ (៦ ដល់ ១២ ឆ្នាំ)
            </legend>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {[6, 7, 8, 9, 10, 11, 12].map((age) => {
                const selected = ageYears === age;
                return (
                  <button
                    key={age}
                    type="button"
                    data-testid={`age-${age}`}
                    aria-pressed={selected}
                    onClick={() => handleAgeSelect(age)}
                    className={`khmer-chip rounded-xl border-2 text-base font-bold transition-colors ${
                      selected
                        ? "border-accent bg-accent text-white"
                        : "border-border bg-surface text-ink hover:bg-surface-subtle"
                    }`}
                  >
                    {formatDisplayNumber(age, numeralPref)}
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* Advisory Grade (1-6, never locks paths) */}
          <fieldset className="space-y-2">
            <legend className="text-sm font-bold text-ink">
              ថ្នាក់រៀន (គ្រាន់តែណែនាំ — អាចរៀនគ្រប់មេរៀន)
            </legend>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[1, 2, 3, 4, 5, 6].map((g) => {
                const selected = gradeLevel === g;
                return (
                  <button
                    key={g}
                    type="button"
                    data-testid={`grade-${g}`}
                    aria-pressed={selected}
                    onClick={() => setGradeLevel(g)}
                    className={`khmer-chip rounded-xl border-2 text-sm font-bold transition-colors ${
                      selected
                        ? "border-accent bg-accent-soft text-accent"
                        : "border-border bg-surface text-ink hover:bg-surface-subtle"
                    }`}
                  >
                    ថ្នាក់ {formatDisplayNumber(g, numeralPref)}
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* Optional 3-question visual warm-up */}
          <div className="rounded-2xl border border-border bg-canvas p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-bold text-ink">
                  កម្តៅសាច់ដុំគំនិត (ជម្រើសបន្ថែម ៣ សំណួរ)
                </p>
                <p className="text-xs text-ink-muted">
                  អាចសាកល្បង ឬរំលងទៅរៀនភ្លាមក៏បាន
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowWarmup((v) => !v)}
                className="khmer-chip rounded-xl border border-border bg-surface px-3 text-xs font-bold text-ink hover:bg-surface-subtle"
              >
                {showWarmup ? "លាក់" : "សាកល្បង"}
              </button>
            </div>

            {showWarmup && !warmupDone && (
              <div className="space-y-3 pt-2 border-t border-border">
                <p className="text-sm font-semibold text-ink">
                  {formatDisplayNumber(warmupIdx + 1, numeralPref)}/
                  {formatDisplayNumber(WARMUP_QUESTIONS.length, numeralPref)}៖{" "}
                  {formatTextNumerals(
                    WARMUP_QUESTIONS[warmupIdx].promptKm,
                    numeralPref
                  )}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {WARMUP_QUESTIONS[warmupIdx].options.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        if (warmupIdx + 1 < WARMUP_QUESTIONS.length) {
                          setWarmupIdx((i) => i + 1);
                        } else {
                          setWarmupDone(true);
                        }
                      }}
                      className="khmer-chip rounded-xl border border-border bg-surface px-3 text-sm font-bold text-ink hover:border-accent hover:bg-accent-soft"
                    >
                      {formatTextNumerals(opt.labelKm, numeralPref)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {warmupDone && (
              <p className="text-sm font-semibold text-success">
                ល្អណាស់! អ្នករួចរាល់សម្រាប់ចាប់ផ្ដើមផ្លូវរៀនហើយ!
              </p>
            )}
          </div>

          <button
            type="submit"
            data-testid="onboarding-submit-btn"
            disabled={isSaving}
            className="khmer-chip w-full rounded-2xl bg-accent px-6 py-3.5 text-base font-bold text-white shadow-xs hover:bg-accent-hover disabled:opacity-50"
          >
            ចូលទៅផ្លូវរៀន
          </button>
        </form>
      </main>
    </div>
  );
}
