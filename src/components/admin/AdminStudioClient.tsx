"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  LessonDocumentV1Schema,
  type LessonDocumentV1,
} from "@/lib/curriculum/schema";
import {
  auditLessonObjectZwsp,
  stripAllZwspFromJson,
} from "@/lib/khmer/zwspAudit";
import {
  publishLessonAction,
  verifyAdminPasscode,
  type PublishLessonResult,
} from "@/app/actions/lessons";
import { useLearner } from "@/components/providers/LearnerProvider";
import { NumeralToggle } from "@/components/ui/NumeralToggle";
import { ActivityRenderer } from "@/components/activities/ActivityRenderer";
import {
  formatDisplayNumber,
  formatTextNumerals,
} from "@/lib/khmer/numerals";
import type { StepAnswer } from "@/lib/math/grader";

interface AdminStudioClientProps {
  initialLessons: LessonDocumentV1[];
}

export function AdminStudioClient({ initialLessons }: AdminStudioClientProps) {
  const { numeralPref } = useLearner();

  const [passcode, setPasscode] = useState<string>("");
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>("");
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  const [selectedId, setSelectedId] = useState<string>(
    initialLessons[0]?.id ?? ""
  );
  const [rawJson, setRawJson] = useState<string>(() =>
    initialLessons[0] ? JSON.stringify(initialLessons[0], null, 2) : "{}"
  );
  const [status, setStatus] = useState<"draft" | "published">("published");
  const [previewStepIndex, setPreviewStepIndex] = useState<number>(0);
  const [previewAnswer, setPreviewAnswer] = useState<StepAnswer | null>(null);
  const [publishResult, setPublishResult] =
    useState<PublishLessonResult | null>(null);
  const [publishing, setPublishing] = useState<boolean>(false);

  const analysis = useMemo(() => {
    let parsed: unknown = null;
    try {
      parsed = JSON.parse(rawJson);
    } catch (err) {
      return {
        syntaxError:
          err instanceof Error ? err.message : "Invalid JSON syntax",
        schemaErrors: [] as string[],
        validLesson: null as LessonDocumentV1 | null,
        zwsp: { totalZwspCount: 0, blockingCount: 0, findings: [] },
      };
    }

    const zwsp = auditLessonObjectZwsp(parsed);
    const zodRes = LessonDocumentV1Schema.safeParse(parsed);

    if (!zodRes.success) {
      return {
        syntaxError: null,
        schemaErrors: zodRes.error.issues.map(
          (i) => `${i.path.join(".") || "root"}: ${i.message}`
        ),
        validLesson: null,
        zwsp,
      };
    }

    return {
      syntaxError: null,
      schemaErrors: [] as string[],
      validLesson: zodRes.data,
      zwsp,
    };
  }, [rawJson]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    try {
      const res = await verifyAdminPasscode(passcode);
      if (res.ok) {
        setAuthenticated(true);
      } else {
        setAuthError("លេខកូដសម្ងាត់មិនត្រឹមត្រូវទេ (លំនាំដើម៖ soun-admin)។");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSelectLesson = (id: string) => {
    setSelectedId(id);
    const found = initialLessons.find((l) => l.id === id);
    if (found) {
      setRawJson(JSON.stringify(found, null, 2));
      setPreviewStepIndex(0);
      setPreviewAnswer(null);
      setPublishResult(null);
    }
  };

  const handleStripZwsp = () => {
    setRawJson((prev) => stripAllZwspFromJson(prev));
    setPublishResult(null);
  };

  const handlePublish = async () => {
    setPublishing(true);
    setPublishResult(null);
    try {
      const res = await publishLessonAction({
        passcode,
        status,
        rawJson,
      });
      setPublishResult(res);
    } finally {
      setPublishing(false);
    }
  };

  const handleDownloadJson = () => {
    const filename = `${analysis.validLesson?.id ?? "lesson-draft"}.json`;
    const blob = new Blob([rawJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activePreviewStep =
    analysis.validLesson?.steps[previewStepIndex] ??
    analysis.validLesson?.steps[0] ??
    null;

  return (
    <div className="min-h-dvh bg-canvas flex flex-col">
      <header className="sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2">
          <Link
            href="/learn"
            className="khmer-chip inline-flex items-center rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-ink hover:bg-surface-subtle"
          >
            ← ផ្លូវរៀន
          </Link>
          <NumeralToggle />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-5 px-4 py-6 pb-12">
        {!authenticated ? (
          <section className="mx-auto w-full max-w-md rounded-3xl border border-border bg-surface p-6 shadow-xs space-y-5">
            <div className="space-y-1">
              <p className="text-xs font-bold text-accent">
                ស្ទូឌីយោគ្រប់គ្រងមេរៀន (Admin Studio)
              </p>
              <h1 className="text-2xl font-bold text-ink">
                ចូលប្រើស្ទូឌីយោនិពន្ធមេរៀន
              </h1>
              <p className="text-sm text-ink-muted">
                ផ្ទៀងផ្ទាត់ Schema, ពិនិត្យ U+200B (ZWSP), មើលគំរូផ្ទាល់ និងផ្សាយមេរៀនទៅ PostgreSQL។
              </p>
            </div>

            <form onSubmit={(e) => void handleLogin(e)} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="admin-passcode-input"
                  className="block text-sm font-bold text-ink"
                >
                  លេខកូដសម្ងាត់ស្ទូឌីយោ
                </label>
                <input
                  id="admin-passcode-input"
                  data-testid="admin-passcode-input"
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="បញ្ចូលលេខកូដសម្ងាត់"
                  className="w-full min-h-[48px] rounded-2xl border-2 border-border bg-canvas px-4 py-2.5 text-base text-ink focus:border-accent focus:outline-none"
                />
                <p className="text-xs text-ink-muted">
                  សម្រាប់ការសាកល្បងមូលដ្ឋាន៖ <code>soun-admin</code>
                </p>
              </div>

              {authError && (
                <p
                  data-testid="admin-auth-error"
                  role="status"
                  className="rounded-xl border border-hint bg-hint-soft px-3.5 py-2 text-sm font-semibold text-hint-ink"
                >
                  {authError}
                </p>
              )}

              <button
                type="submit"
                data-testid="admin-login-btn"
                disabled={authLoading}
                className="khmer-chip w-full rounded-2xl bg-accent px-5 py-3 text-base font-bold text-white shadow-xs hover:bg-accent-hover disabled:opacity-50"
              >
                ចូលស្ទូឌីយោ
              </button>
            </form>
          </section>
        ) : (
          <div data-testid="admin-studio-workspace" className="space-y-5">
            {/* Top Toolbar */}
            <section className="rounded-3xl border border-border bg-surface p-5 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-ink">
                    ស្ទូឌីយោនិពន្ធមេរៀនសួនគណិត
                  </h1>
                  <p className="text-xs text-ink-muted">
                    មេរៀនសរុប{" "}
                    {formatDisplayNumber(initialLessons.length, numeralPref)}{" "}
                    • Zod LessonDocumentV1Schema + ពិនិត្យ U+200B
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <label htmlFor="admin-lesson-select" className="sr-only">
                    ជ្រើសរើសមេរៀនដើម្បីកែសម្រួល
                  </label>
                  <select
                    id="admin-lesson-select"
                    data-testid="admin-lesson-select"
                    value={selectedId}
                    onChange={(e) => handleSelectLesson(e.target.value)}
                    className="w-full sm:w-auto max-w-full min-h-[44px] rounded-xl border border-border bg-canvas px-3 text-sm font-semibold text-ink"
                  >
                    {initialLessons.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.id} — {l.titleKm}
                      </option>
                    ))}
                  </select>

                  <label htmlFor="admin-status-select" className="sr-only">
                    ស្ថានភាពផ្សាយ
                  </label>
                  <select
                    id="admin-status-select"
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as "draft" | "published")
                    }
                    className="w-full sm:w-auto max-w-full min-h-[44px] rounded-xl border border-border bg-canvas px-3 text-sm font-semibold text-ink"
                  >
                    <option value="published">ផ្សាយ (Published)</option>
                    <option value="draft">ព្រាង (Draft)</option>
                  </select>
                </div>
              </div>

              {/* Validation & ZWSP Status Strip */}
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-canvas p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    data-testid="admin-validation-status"
                    className={`rounded-full border px-3 py-1 text-xs font-bold ${
                      analysis.validLesson
                        ? "border-success bg-success-soft text-success"
                        : "border-hint bg-hint-soft text-hint-ink"
                    }`}
                  >
                    {analysis.validLesson
                      ? "✓ Schema ត្រឹមត្រូវ ១០០%"
                      : "មានកំហុស Schema / JSON"}
                  </span>

                  <span
                    data-testid="admin-zwsp-status"
                    className={`rounded-full border px-3 py-1 text-xs font-bold ${
                      analysis.zwsp.totalZwspCount === 0
                        ? "border-success/40 bg-success-soft text-success"
                        : "border-hint bg-hint-soft text-hint-ink"
                    }`}
                  >
                    U+200B (ZWSP):{" "}
                    {formatDisplayNumber(
                      analysis.zwsp.totalZwspCount,
                      numeralPref
                    )}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {analysis.zwsp.totalZwspCount > 0 && (
                    <button
                      type="button"
                      data-testid="admin-strip-zwsp-btn"
                      onClick={handleStripZwsp}
                      className="khmer-chip rounded-xl border border-hint bg-hint-soft px-3 text-xs font-bold text-hint-ink"
                    >
                      សម្អាត U+200B
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleDownloadJson}
                    className="khmer-chip rounded-xl border border-border bg-surface px-3 text-xs font-semibold text-ink hover:bg-surface-subtle"
                  >
                    ទាញយក JSON
                  </button>

                  <button
                    type="button"
                    data-testid="admin-publish-btn"
                    disabled={
                      publishing ||
                      !analysis.validLesson ||
                      analysis.zwsp.blockingCount > 0
                    }
                    onClick={() => void handlePublish()}
                    className="khmer-chip rounded-xl bg-accent px-4 text-xs font-bold text-white shadow-xs hover:bg-accent-hover disabled:opacity-45"
                  >
                    {publishing ? "កំពុងរក្សាទុក..." : "ផ្សាយមេរៀន"}
                  </button>
                </div>
              </div>

              {publishResult && (
                <div
                  data-testid="admin-publish-result"
                  role="status"
                  className={`rounded-2xl border-2 p-3 text-sm font-semibold ${
                    publishResult.ok
                      ? "border-success bg-success-soft text-ink"
                      : "border-hint bg-hint-soft text-ink"
                  }`}
                >
                  {publishResult.messageKm}
                </div>
              )}

              {(analysis.syntaxError || analysis.schemaErrors.length > 0) && (
                <div
                  data-testid="admin-errors-panel"
                  className="rounded-2xl border border-hint bg-hint-soft p-3 text-xs text-hint-ink space-y-1"
                >
                  {analysis.syntaxError && <p>JSON: {analysis.syntaxError}</p>}
                  {analysis.schemaErrors.map((err, i) => (
                    <p key={i}>• {err}</p>
                  ))}
                </div>
              )}
            </section>

            {/* Split Editor + Live Interactive Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <section className="rounded-3xl border border-border bg-surface p-4 shadow-xs space-y-2">
                <label
                  htmlFor="admin-json-editor"
                  className="block text-sm font-bold text-ink"
                >
                  កូដមេរៀន JSON (LessonDocumentV1)
                </label>
                <textarea
                  id="admin-json-editor"
                  data-testid="admin-json-editor"
                  value={rawJson}
                  onChange={(e) => {
                    setRawJson(e.target.value);
                    setPublishResult(null);
                  }}
                  rows={22}
                  spellCheck={false}
                  className="w-full rounded-2xl border border-border bg-canvas p-3 font-mono text-xs text-ink leading-relaxed focus:border-accent focus:outline-none"
                />
              </section>

              <section
                data-testid="admin-live-preview"
                className="rounded-3xl border border-border bg-surface p-4 shadow-xs space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-base font-bold text-ink">
                    មើលគំរូអន្តរកម្មផ្ទាល់
                  </h2>
                  {analysis.validLesson && (
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.validLesson.steps.map((s, idx) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setPreviewStepIndex(idx);
                            setPreviewAnswer(null);
                          }}
                          className={`khmer-chip rounded-xl border px-3 text-xs font-bold ${
                            previewStepIndex === idx
                              ? "border-accent bg-accent text-white"
                              : "border-border bg-canvas text-ink"
                          }`}
                        >
                          ជំហាន {formatDisplayNumber(idx + 1, numeralPref)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {activePreviewStep ? (
                  <div className="rounded-2xl border border-border bg-canvas p-4 space-y-4">
                    <p className="text-base font-bold text-ink">
                      {formatTextNumerals(
                        activePreviewStep.promptKm,
                        numeralPref
                      )}
                    </p>
                    <ActivityRenderer
                      step={activePreviewStep}
                      numeralPref={numeralPref}
                      onAnswerChange={setPreviewAnswer}
                    />
                    {previewAnswer && (
                      <p className="text-xs text-ink-muted">
                        ប្រភេទឧបករណ៍៖ <code>{previewAnswer.type}</code>
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-ink-muted">
                    កែសម្រួល JSON ឱ្យត្រឹមត្រូវតាម Schema ដើម្បីមើលគំរូផ្ទាល់។
                  </p>
                )}
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
