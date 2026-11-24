"use client";

import React from "react";
import Link from "next/link";
import { useLearner } from "@/components/providers/LearnerProvider";
import { NumeralToggle } from "@/components/ui/NumeralToggle";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { formatTextNumerals } from "@/lib/khmer/numerals";

export default function HomePage() {
  const { profile, numeralPref } = useLearner();

  return (
    <div className="app-page-with-rail min-h-dvh bg-canvas flex flex-col">
      <header className="sticky top-0 z-20 border-b-2 border-[#c9c2b2] bg-surface/95 backdrop-blur px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <BrandLogo size={40} />
            <div>
              <p className="text-base font-bold text-ink leading-tight">
                សួនគណិត
              </p>
              <p className="text-xs text-ink-muted">Soun Kanit</p>
            </div>
          </div>

          <NumeralToggle />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-8 px-4 py-8">
        <section className="rounded-3xl border-2 border-[#c9c2b2] bg-surface p-6 sm:p-8 shadow-[0_6px_0_#c9c2b2,0_12px_28px_rgba(30,42,74,0.08)] space-y-6">
          <div className="inline-flex items-center rounded-full border-2 border-[#C89600] bg-[#FFF3BF] px-3.5 py-1 text-xs font-bold text-[#1E2A4A]">
            {formatTextNumerals(
              "សម្រាប់កុមារអាយុ ៦ ដល់ ១២ ឆ្នាំ • ប្រើបានទោះគ្មានអ៊ីនធឺណិត",
              numeralPref
            )}
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-bold text-ink">
              រៀនគណិតវិទ្យាដោយមើលឃើញ និងប៉ះផ្ទាល់ដៃ
            </h1>
            <p className="text-base sm:text-lg text-ink-muted">
              {formatTextNumerals(
                "សួនគណិតជួយកុមារកម្ពុជាយល់គណិតវិទ្យាតាមរយៈរូបភាពស្វាយ ផ្កាឈូក ការគូររូបធរណីមាត្រ នាឡិកា និងល្បែងលេងសប្បាយៗ — គ្មានម៉ោងរាប់ថយក្រោយ គ្មានសម្ពាធ។",
                numeralPref
              )}
            </p>
          </div>

          {/* Geometric Studio SVG preview (Safari-safe, zero foreignObject) */}
          <div className="rounded-2xl border border-border bg-canvas p-4">
            <svg
              viewBox="0 0 340 120"
              className="w-full max-w-[420px] mx-auto h-auto"
              role="img"
              aria-label="ឧទាហរណ៍ថាសប្រអប់ ១០ បង្ហាញ ៨ បូក ២ ស្មើ ១០"
            >
              {/* Mini 10-frame */}
              <rect x={8} y={14} width={174} height={92} rx={14} fill="#ffffff" stroke="#d6cfc2" strokeWidth={1.5} />
              {Array.from({ length: 10 }).map((_, idx) => {
                const col = idx % 5;
                const row = Math.floor(idx / 5);
                const x = 18 + col * 32;
                const y = 24 + row * 38;
                const isMango = idx < 8;
                return (
                  <g key={idx}>
                    <rect
                      x={x}
                      y={y}
                      width={26}
                      height={28}
                      rx={6}
                      fill={isMango ? "#fffbeb" : "#eff6ff"}
                      stroke={isMango ? "#fcd34d" : "#93c5fd"}
                      strokeWidth={1.5}
                      strokeDasharray={isMango ? undefined : "4 2"}
                    />
                    {isMango ? (
                      <ellipse
                        cx={x + 13}
                        cy={y + 14}
                        rx={8}
                        ry={6.5}
                        fill="#f59e0b"
                        stroke="#b45309"
                        strokeWidth={1.2}
                      />
                    ) : (
                      <circle cx={x + 13} cy={y + 14} r={6} fill="#3b82f6" opacity={0.85} />
                    )}
                  </g>
                );
              })}

              {/* Visual equation summary */}
              <rect x={200} y={24} width={132} height={72} rx={16} fill="#eff6ff" stroke="#93c5fd" strokeWidth={1.5} />
              <text
                x={266}
                y={55}
                textAnchor="middle"
                fontSize={20}
                fontWeight={700}
                fill="#1d4ed8"
              >
                {formatTextNumerals("៨ + ២ = ១០", numeralPref)}
              </text>
              <text
                x={266}
                y={80}
                textAnchor="middle"
                fontSize={12}
                fontWeight={600}
                fill="#4b5563"
              >
                បង្គ្រប់ ១០ បានយ៉ាងងាយ!
              </text>
            </svg>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {profile ? (
              <>
                <Link
                  href="/learn"
                  data-testid="cta-continue-learning"
                  className="khmer-chip btn-3d candy-ocean flex-1 inline-flex items-center justify-center rounded-2xl border-2 border-[#13429E] bg-[#1D5FD6] px-6 py-3.5 text-base font-extrabold text-white hover:bg-[#1751BA]"
                >
                  បន្តរៀន ({profile.displayName})
                </Link>
                <Link
                  href="/onboarding"
                  data-testid="cta-new-profile"
                  className="khmer-chip btn-3d [--btn-edge:#c9c2b2] inline-flex items-center justify-center rounded-2xl border-2 border-[#c9c2b2] bg-surface px-5 py-3.5 text-base font-bold text-ink hover:bg-surface-subtle"
                >
                  បង្កើតគណនីកុមារថ្មី
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/onboarding"
                  data-testid="cta-start-onboarding"
                  className="khmer-chip btn-3d candy-ocean flex-1 inline-flex items-center justify-center rounded-2xl border-2 border-[#13429E] bg-[#1D5FD6] px-6 py-3.5 text-base font-extrabold text-white hover:bg-[#1751BA]"
                >
                  ចាប់ផ្ដើមរៀនឥឡូវនេះ
                </Link>
                <Link
                  href="/learn"
                  data-testid="cta-browse-path"
                  className="khmer-chip btn-3d [--btn-edge:#c9c2b2] inline-flex items-center justify-center rounded-2xl border-2 border-[#c9c2b2] bg-surface px-5 py-3.5 text-base font-bold text-ink hover:bg-surface-subtle"
                >
                  មើលមេរៀនទាំងអស់
                </Link>
              </>
            )}
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl border-2 border-[#C89600] bg-surface p-4 shadow-[0_4px_0_#C89600] space-y-1">
            <h2 className="text-base font-bold text-ink">ប៉ះ ឬអូសងាយស្រួល</h2>
            <p className="text-sm text-ink-muted">
              ប្រើបានទាំងការប៉ះមួយម្រាមដៃ និងការអូសលើទូរស័ព្ទគ្រប់ប្រភេទ។
            </p>
          </div>
          <div className="rounded-2xl border-2 border-[#148F56] bg-surface p-4 shadow-[0_4px_0_#148F56] space-y-1">
            <h2 className="text-base font-bold text-ink">ជំនួយ ៣ ដំណាក់កាល</h2>
            <p className="text-sm text-ink-muted">
              ណែនាំឱ្យកុមារគិតរកចម្លើយដោយខ្លួនឯង មិនប្រញាប់ មិនដាក់ពិន័យ។
            </p>
          </div>
          <div className="rounded-2xl border-2 border-[#C85A14] bg-surface p-4 shadow-[0_4px_0_#C85A14] space-y-1">
            <h2 className="text-base font-bold text-ink">រៀនបានគ្មានអ៊ីនធឺណិត</h2>
            <p className="text-sm text-ink-muted">
              រក្សាទុកវឌ្ឍនភាពក្នុងឧបករណ៍ភ្លាមៗ សាកសមសម្រាប់គ្រួសារនៅគ្រប់ខេត្ត។
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
