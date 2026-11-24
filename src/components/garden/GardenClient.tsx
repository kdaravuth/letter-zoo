"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useLearner } from "@/components/providers/LearnerProvider";
import { NumeralToggle } from "@/components/ui/NumeralToggle";
import { AudioToggle } from "@/components/ui/AudioReadButton";
import { CelebrationBurst } from "@/components/ui/CelebrationBurst";
import { AchievementCertificate } from "@/components/ui/AchievementCertificate";
import { computeGardenState } from "@/lib/math/garden";
import {
  playScaleNote,
  playSuccessChime,
  playWaterPlop,
} from "@/lib/audio/chimes";
import {
  formatDisplayNumber,
  formatTextNumerals,
} from "@/lib/khmer/numerals";

const MANGO_SPOTS = [
  { x: 90, y: 88 },
  { x: 122, y: 74 },
  { x: 148, y: 92 },
  { x: 76, y: 112 },
  { x: 112, y: 108 },
  { x: 138, y: 118 },
  { x: 102, y: 66 },
  { x: 162, y: 108 },
  { x: 64, y: 92 },
  { x: 128, y: 96 },
  { x: 86, y: 128 },
  { x: 152, y: 78 },
];

const LOTUS_SPOTS = [
  { x: 74, y: 218 },
  { x: 128, y: 232 },
  { x: 186, y: 214 },
  { x: 242, y: 228 },
  { x: 294, y: 216 },
  { x: 102, y: 248 },
  { x: 214, y: 246 },
  { x: 274, y: 244 },
];

const BUTTERFLY_SPOTS = [
  { x: 232, y: 78, color: "#f472b6" },
  { x: 282, y: 96, color: "#f59e0b" },
  { x: 205, y: 114, color: "#60a5fa" },
  { x: 310, y: 68, color: "#a78bfa" },
  { x: 256, y: 54, color: "#34d399" },
  { x: 185, y: 70, color: "#fb7185" },
];

export function GardenClient() {
  const { profile, progressByLesson, numeralPref, audioEnabled } = useLearner();
  const garden = useMemo(
    () => computeGardenState(progressByLesson),
    [progressByLesson]
  );

  const [countedMangoes, setCountedMangoes] = useState<number>(0);
  const [frogPadIndex, setFrogPadIndex] = useState<number>(0);
  const [lotusBloomed, setLotusBloomed] = useState<boolean>(false);
  const [butterflyFlutter, setButterflyFlutter] = useState<number>(0);
  const [speechBubble, setSpeechBubble] = useState<{
    textKm: string;
    target: "mango" | "frog" | "lotus" | "butterfly";
    tick: number;
  } | null>(null);
  const [gardenMessageKm, setGardenMessageKm] = useState<string>(
    "ប៉ះផ្ទាល់លើផ្លែស្វាយ កូនកង្កែប ផ្កាឈូក ឬមេអំបៅក្នុងសួន ដើម្បីលេងជាមួយមិត្តក្នុងសួន!"
  );

  const triggerSpeechBubble = (
    target: "mango" | "frog" | "lotus" | "butterfly",
    textKm: string
  ) => {
    setSpeechBubble((prev) => ({
      target,
      textKm,
      tick: (prev?.tick ?? 0) + 1,
    }));
  };

  const handleCountMango = () => {
    const next =
      countedMangoes >= garden.mangoCount ? 1 : countedMangoes + 1;
    setCountedMangoes(next);
    triggerSpeechBubble("mango", `ស្វាយទុំផ្អែម! (${next}/${garden.mangoCount})`);
    if (next === garden.mangoCount) {
      playSuccessChime(audioEnabled);
      setGardenMessageKm(
        `ល្អណាស់! ដើមស្វាយរបស់អ្នកមានផ្លែស្វាយទុំសរុប ${garden.mangoCount} ផ្លែ!`
      );
    } else {
      playScaleNote(next - 1, audioEnabled);
      setGardenMessageKm(`រាប់ស្វាយលើដើម៖ ${next} ផ្លែ!`);
    }
  };

  const handleHopFrog = () => {
    const padCount = Math.min(5, Math.max(3, garden.lotusCount));
    const nextPad = (frogPadIndex + 1) % padCount;
    setFrogPadIndex(nextPad);
    playWaterPlop(audioEnabled);
    triggerSpeechBubble("frog", "ប្ល៊ុប! សប្បាយណាស់!");
    setGardenMessageKm(
      `កង្កែបតូចលោតទៅស្លឹកឈូកទី ${nextPad + 1}! ប្ល៊ុប!`
    );
  };

  const handleBloomLotus = () => {
    setLotusBloomed((v) => !v);
    playSuccessChime(audioEnabled);
    triggerSpeechBubble("lotus", "ផ្កាឈូករីកហើយ!");
    setGardenMessageKm(
      `ផ្កាឈូកទាំង ${garden.lotusCount} ទងកំពុងរីកស្រស់ស្អាតលើស្រះ!`
    );
  };

  const handleFlutterButterflies = () => {
    const next = butterflyFlutter + 1;
    setButterflyFlutter(next);
    playScaleNote((next % 7) + 3, audioEnabled);
    triggerSpeechBubble("butterfly", "មេអំបៅហោះលេងសប្បាយ!");
    setGardenMessageKm(
      `មេអំបៅ ${garden.butterflyCount} ក្បាលកំពុងហោះលេងក្នុងសួនគណិត!`
    );
  };

  const activeFrogSpot =
    LOTUS_SPOTS[frogPadIndex % Math.min(LOTUS_SPOTS.length, Math.max(3, garden.lotusCount))];

  const gardenCollection = [
    {
      id: "pond-frog",
      nameKm: "កូនកង្កែបឆ្លាត",
      unlocked: true,
      hearts: 3,
      borderClass: "border-[#148F56] [--tile-edge:#148F56]",
      onTap: handleHopFrog,
      icon: (
        <svg viewBox="0 0 48 48" className="mx-auto h-12 w-12" aria-hidden="true">
          <circle cx={24} cy={26} r={18} fill="#dcfce7" />
          <circle cx={16} cy={16} r={5.5} fill="#22c55e" stroke="#15803d" strokeWidth={1.6} />
          <circle cx={32} cy={16} r={5.5} fill="#22c55e" stroke="#15803d" strokeWidth={1.6} />
          <circle cx={16} cy={16} r={2} fill="#111827" />
          <circle cx={32} cy={16} r={2} fill="#111827" />
          <ellipse cx={24} cy={28} rx={15} ry={11} fill="#22c55e" stroke="#15803d" strokeWidth={1.8} />
          <path d="M 18 29 Q 24 35 30 29" fill="none" stroke="#14532d" strokeWidth={2} strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: "golden-mango",
      nameKm: "ស្វាយទុំផ្អែម",
      unlocked: garden.mangoCount >= 2,
      hearts: Math.min(3, Math.max(1, garden.mangoCount - 1)),
      borderClass: "border-[#C89600] [--tile-edge:#C89600]",
      onTap: handleCountMango,
      icon: (
        <svg viewBox="0 0 48 48" className="mx-auto h-12 w-12" aria-hidden="true">
          <circle cx={24} cy={26} r={18} fill="#FFF3BF" />
          <ellipse cx={24} cy={27} rx={13} ry={10} transform="rotate(-18 24 27)" fill="#FFD23F" stroke="#B45309" strokeWidth={1.8} />
          <path d="M 25 15 Q 32 11 34 16 Q 29 19 25 15 Z" fill="#22C55E" stroke="#15803D" strokeWidth={1.4} />
        </svg>
      ),
    },
    {
      id: "pink-lotus",
      nameKm: "ផ្កាឈូកសន្តិភាព",
      unlocked: garden.lotusCount >= 1,
      hearts: Math.min(3, garden.lotusCount),
      borderClass: "border-[#9E1943] [--tile-edge:#9E1943]",
      onTap: handleBloomLotus,
      icon: (
        <svg viewBox="0 0 48 48" className="mx-auto h-12 w-12" aria-hidden="true">
          <circle cx={24} cy={26} r={18} fill="#FFE3EC" />
          <ellipse cx={24} cy={35} rx={14} ry={5} fill="#4ade80" stroke="#15803d" strokeWidth={1.5} />
          <ellipse cx={17} cy={26} rx={5} ry={9} transform="rotate(-24 17 26)" fill="#f472b6" stroke="#9d174d" strokeWidth={1.4} />
          <ellipse cx={31} cy={26} rx={5} ry={9} transform="rotate(24 31 26)" fill="#f472b6" stroke="#9d174d" strokeWidth={1.4} />
          <ellipse cx={24} cy={24} rx={5.5} ry={10} fill="#fbcfe8" stroke="#9d174d" strokeWidth={1.4} />
        </svg>
      ),
    },
    {
      id: "silk-butterfly",
      nameKm: "មេអំបៅសូត្រមាស",
      unlocked: garden.butterflyCount >= 1,
      hearts: Math.min(3, garden.butterflyCount),
      borderClass: "border-[#C85A14] [--tile-edge:#C85A14]",
      onTap: handleFlutterButterflies,
      icon: (
        <svg viewBox="0 0 48 48" className="mx-auto h-12 w-12" aria-hidden="true">
          <circle cx={24} cy={26} r={18} fill="#FFEDE0" />
          <ellipse cx={17} cy={25} rx={7} ry={5.5} fill="#FF8C42" stroke="#C85A14" strokeWidth={1.4} />
          <ellipse cx={31} cy={25} rx={7} ry={5.5} fill="#FF8C42" stroke="#C85A14" strokeWidth={1.4} />
          <line x1={24} y1={18} x2={24} y2={32} stroke="#1E2A4A" strokeWidth={2.2} strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: "emerald-turtle",
      nameKm: "អណ្ដើកស្រះឈូក",
      unlocked: garden.mangoCount >= 5,
      hearts: 3,
      borderClass: "border-[#13429E] [--tile-edge:#13429E]",
      onTap: handleHopFrog,
      icon: (
        <svg viewBox="0 0 48 48" className="mx-auto h-12 w-12" aria-hidden="true">
          <circle cx={24} cy={26} r={18} fill="#E5F0FF" />
          <ellipse cx={23} cy={27} rx={12} ry={9} fill="#15803d" stroke="#14532d" strokeWidth={1.6} />
          <circle cx={36} cy={25} r={4.5} fill="#4ade80" stroke="#15803d" strokeWidth={1.4} />
        </svg>
      ),
    },
    {
      id: "angkor-kite",
      nameKm: "ខ្លែងឯកសួនគណិត",
      unlocked: garden.lotusCount >= 5,
      hearts: 3,
      borderClass: "border-[#5620B8] [--tile-edge:#5620B8]",
      onTap: handleFlutterButterflies,
      icon: (
        <svg viewBox="0 0 48 48" className="mx-auto h-12 w-12" aria-hidden="true">
          <circle cx={24} cy={26} r={18} fill="#F0E7FF" />
          <polygon points="24,12 35,24 24,36 13,24" fill="#7C3AED" stroke="#5620B8" strokeWidth={1.6} />
        </svg>
      ),
    },
  ];

  return (
    <div className="app-page-with-rail min-h-dvh bg-canvas flex flex-col">
      <header className="sticky top-0 z-20 border-b-2 border-[#c9c2b2] bg-surface/95 backdrop-blur px-3 py-2.5">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-2">
          <Link
            href="/learn"
            className="khmer-chip pill-3d [--pill-edge:#c9c2b2] inline-flex items-center rounded-xl border-2 border-[#c9c2b2] bg-surface px-3 text-sm font-bold text-ink hover:bg-surface-subtle"
          >
            ← ផ្លូវរៀន
          </Link>
          <div className="flex items-center gap-1.5">
            <AudioToggle />
            <NumeralToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-3 py-5 pb-12">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xs font-extrabold text-[#0D2B1D]">
              {garden.gardenLevelKm}
            </p>
            <h1 className="text-2xl font-bold text-ink">
              សួនគណិតរបស់ {profile ? profile.displayName : "អ្នករៀន"}
            </h1>
          </div>
          <Link
            href="/play"
            className="khmer-chip pill-3d candy-ocean inline-flex items-center rounded-full border-2 border-[#13429E] bg-[#1D5FD6] px-3.5 text-xs font-extrabold text-white hover:bg-[#1751BA]"
          >
            ទៅក្ដារលេង →
          </Link>
        </div>

        {/* Living Interactive Cambodian Garden SVG (Safari-safe, zero foreignObject) */}
        <section className="rounded-3xl border-2 border-[#c9c2b2] bg-surface p-3 shadow-[0_6px_0_#c9c2b2,0_12px_24px_rgba(30,42,74,0.06)] space-y-3">
          <CelebrationBurst active={lotusBloomed} />

          {/* Floating Khmer Speech Bubble & Heart on direct tap */}
          {speechBubble && (
            <div className="flex items-center justify-center gap-2">
              <div
                key={`bubble-${speechBubble.tick}`}
                data-testid="garden-speech-bubble"
                data-target={speechBubble.target}
                className="inline-flex items-center gap-2 rounded-full border-2 border-[#C89600] bg-[#FFF3BF] px-4 py-1 text-xs sm:text-sm font-extrabold text-[#1E2A4A] shadow-[0_3px_0_#C89600]"
              >
                <span>{formatTextNumerals(speechBubble.textKm, numeralPref)}</span>
              </div>
              <span
                key={`heart-${speechBubble.tick}`}
                data-testid="garden-floating-heart"
                aria-hidden="true"
                className="inline-block text-lg font-extrabold text-[#D62860] animate-float-up"
              >
                ♥
              </span>
            </div>
          )}

          <div className="w-full overflow-hidden rounded-2xl border-2 border-[#148F56]">
            <svg
              viewBox="0 0 360 272"
              className="w-full h-auto block select-none"
              role="group"
              aria-label={`សួនគណិតមានផ្លែស្វាយ ${formatDisplayNumber(garden.mangoCount, numeralPref)} ផ្លែ និងផ្កាឈូក ${formatDisplayNumber(garden.lotusCount, numeralPref)} ទង`}
            >
              {/* Warm sunrise sky */}
              <rect x={0} y={0} width={360} height={170} fill="#fef3c7" />
              <circle cx={302} cy={46} r={24} fill="#fde047" opacity={0.9} />

              {/* Distant calm silhouette & green hills */}
              <path
                d="M 218 145 L 228 122 L 236 145 M 242 145 L 254 110 L 266 145 M 272 145 L 280 124 L 290 145 Z"
                fill="#e7d7be"
              />
              <ellipse cx={95} cy={176} rx={155} ry={46} fill="#bbf7d0" />
              <ellipse cx={280} cy={178} rx={140} ry={42} fill="#86efac" />

              {/* Tranquil lotus pond */}
              <rect x={0} y={182} width={360} height={90} fill="#bae6fd" />
              <ellipse cx={180} cy={226} rx={156} ry={34} fill="#7dd3fc" />

              {/* Mango tree trunk & canopy (Direct-Touch Interactive Target >=56x56 CSS px) */}
              <g
                data-testid="garden-canvas-mango"
                className="manipulative-target cursor-pointer"
                role="button"
                tabIndex={0}
                aria-label="ប៉ះដើមស្វាយដើម្បីរាប់ផ្លែស្វាយទុំ"
                onClick={handleCountMango}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleCountMango();
                  }
                }}
              >
                <rect
                  x={48}
                  y={40}
                  width={134}
                  height={144}
                  rx={16}
                  fill="transparent"
                />
                <rect x={102} y={120} width={22} height={68} rx={8} fill="#92400e" />
                <circle cx={88} cy={104} r={36} fill="#16a34a" />
                <circle cx={142} cy={102} r={38} fill="#15803d" />
                <circle cx={116} cy={78} r={36} fill="#22c55e" />

                {/* Ripe Golden Mangoes (1 per completed Early Foundations lesson + 2 starters) */}
                {MANGO_SPOTS.slice(0, garden.mangoCount).map((pos, idx) => {
                  const isCounted = idx < countedMangoes;
                  return (
                    <g key={`mango-${idx}`}>
                      <ellipse
                        cx={pos.x}
                        cy={pos.y}
                        rx={isCounted ? 10.5 : 8.5}
                        ry={isCounted ? 8.5 : 7}
                        transform={`rotate(-18 ${pos.x} ${pos.y})`}
                        fill={isCounted ? "#fde047" : "#f59e0b"}
                        stroke={isCounted ? "#b45309" : "#92400e"}
                        strokeWidth={isCounted ? 2.2 : 1.5}
                      />
                    </g>
                  );
                })}
              </g>

              {/* Gentle Butterflies (Direct-Touch Interactive Target >=56x56 CSS px) */}
              <g
                data-testid="garden-canvas-butterfly"
                className="manipulative-target cursor-pointer"
                role="button"
                tabIndex={0}
                aria-label="ប៉ះមេអំបៅដើម្បីឱ្យមេអំបៅហោះលេង"
                onClick={handleFlutterButterflies}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleFlutterButterflies();
                  }
                }}
              >
                <rect
                  x={178}
                  y={42}
                  width={146}
                  height={86}
                  rx={16}
                  fill="transparent"
                />
                {BUTTERFLY_SPOTS.slice(0, garden.butterflyCount).map((b, idx) => {
                  const dy = (butterflyFlutter + idx) % 2 === 0 ? -4 : 4;
                  const dx = (butterflyFlutter + idx) % 2 === 0 ? 3 : -3;
                  return (
                    <g key={`bf-${idx}`} transform={`translate(${dx}, ${dy})`}>
                      <ellipse cx={b.x - 5} cy={b.y} rx={6} ry={4.5} fill={b.color} opacity={0.9} />
                      <ellipse cx={b.x + 5} cy={b.y} rx={6} ry={4.5} fill={b.color} opacity={0.9} />
                      <line x1={b.x} y1={b.y - 4} x2={b.x} y2={b.y + 4} stroke="#374151" strokeWidth={1.8} />
                    </g>
                  );
                })}
              </g>

              {/* Blooming Lotus Pads & Pink Flowers (Direct-Touch Interactive Target >=56x56 CSS px) */}
              <g
                data-testid="garden-canvas-lotus"
                className="manipulative-target cursor-pointer"
                role="button"
                tabIndex={0}
                aria-label="ប៉ះផ្កាឈូកដើម្បីឱ្យផ្កាឈូករីក"
                onClick={handleBloomLotus}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleBloomLotus();
                  }
                }}
              >
                <rect
                  x={44}
                  y={186}
                  width={272}
                  height={78}
                  rx={16}
                  fill="transparent"
                />
                {LOTUS_SPOTS.slice(0, garden.lotusCount).map((pos, idx) => (
                  <g key={`lotus-${idx}`}>
                    <ellipse
                      cx={pos.x}
                      cy={pos.y + 8}
                      rx={20}
                      ry={9}
                      fill="#4ade80"
                      stroke="#15803d"
                      strokeWidth={1.5}
                    />
                    <ellipse
                      cx={pos.x - 6}
                      cy={pos.y}
                      rx={lotusBloomed ? 6.5 : 5}
                      ry={lotusBloomed ? 10 : 8}
                      transform={`rotate(-22 ${pos.x - 6} ${pos.y})`}
                      fill="#f472b6"
                      stroke="#be185d"
                      strokeWidth={1.2}
                    />
                    <ellipse
                      cx={pos.x + 6}
                      cy={pos.y}
                      rx={lotusBloomed ? 6.5 : 5}
                      ry={lotusBloomed ? 10 : 8}
                      transform={`rotate(22 ${pos.x + 6} ${pos.y})`}
                      fill="#f472b6"
                      stroke="#be185d"
                      strokeWidth={1.2}
                    />
                    <ellipse
                      cx={pos.x}
                      cy={pos.y - 2}
                      rx={lotusBloomed ? 6.5 : 5.5}
                      ry={lotusBloomed ? 11 : 9}
                      fill="#fbcfe8"
                      stroke="#be185d"
                      strokeWidth={1.2}
                    />
                    <circle cx={pos.x} cy={pos.y + 2} r={3} fill="#facc15" />
                  </g>
                ))}
              </g>

              {/* Friendly Pond Frog hopping across pads (Direct-Touch Interactive Target >=56x56 CSS px) */}
              {activeFrogSpot && (
                <g
                  data-testid="garden-canvas-frog"
                  className="manipulative-target cursor-pointer"
                  role="button"
                  tabIndex={0}
                  aria-label="ប៉ះកូនកង្កែបដើម្បីឱ្យកង្កែបលោត"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleHopFrog();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                      handleHopFrog();
                    }
                  }}
                >
                  <rect
                    x={Math.max(4, Math.min(280, activeFrogSpot.x - 38))}
                    y={Math.max(162, Math.min(194, activeFrogSpot.y - 46))}
                    width={76}
                    height={76}
                    rx={18}
                    fill="transparent"
                  />
                  <circle
                    cx={activeFrogSpot.x}
                    cy={activeFrogSpot.y - 10}
                    r={12}
                    fill="#22c55e"
                    stroke="#15803d"
                    strokeWidth={1.8}
                  />
                  <circle cx={activeFrogSpot.x - 5} cy={activeFrogSpot.y - 20} r={4} fill="#22c55e" stroke="#15803d" strokeWidth={1.4} />
                  <circle cx={activeFrogSpot.x + 5} cy={activeFrogSpot.y - 20} r={4} fill="#22c55e" stroke="#15803d" strokeWidth={1.4} />
                  <circle cx={activeFrogSpot.x - 5} cy={activeFrogSpot.y - 20} r={1.6} fill="#111827" />
                  <circle cx={activeFrogSpot.x + 5} cy={activeFrogSpot.y - 20} r={1.6} fill="#111827" />
                  <path
                    d={`M ${activeFrogSpot.x - 5} ${activeFrogSpot.y - 8} Q ${activeFrogSpot.x} ${activeFrogSpot.y - 3} ${activeFrogSpot.x + 5} ${activeFrogSpot.y - 8}`}
                    fill="none"
                    stroke="#14532d"
                    strokeWidth={1.6}
                    strokeLinecap="round"
                  />
                </g>
              )}
            </svg>
          </div>

          {/* Live calm interaction message */}
          <p
            data-testid="garden-status-message"
            role="status"
            aria-live="polite"
            className="rounded-2xl bg-canvas border-2 border-[#c9c2b2] px-4 py-2.5 text-center text-sm font-bold text-ink"
          >
            {formatTextNumerals(gardenMessageKm, numeralPref)}
          </p>

          {/* Child-sized >= 56x56px interactive garden play buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              data-testid="garden-count-mango-btn"
              onClick={handleCountMango}
              className="manipulative-target btn-3d candy-sun rounded-2xl border-2 border-[#C89600] bg-[#FFD23F] px-3 py-2.5 text-sm font-extrabold text-[#1E2A4A]"
            >
              រាប់ផ្លែស្វាយ ({formatDisplayNumber(countedMangoes, numeralPref)}/{formatDisplayNumber(garden.mangoCount, numeralPref)})
            </button>

            <button
              type="button"
              data-testid="garden-hop-frog-btn"
              onClick={handleHopFrog}
              className="manipulative-target btn-3d candy-leaf rounded-2xl border-2 border-[#148F56] bg-[#22C57B] px-3 py-2.5 text-sm font-extrabold text-[#0D2B1D]"
            >
              នាំកង្កែបលោត ({formatDisplayNumber(frogPadIndex + 1, numeralPref)})
            </button>

            <button
              type="button"
              data-testid="garden-bloom-lotus-btn"
              onClick={handleBloomLotus}
              className="manipulative-target btn-3d candy-berry rounded-2xl border-2 border-[#9E1943] bg-[#D62860] px-3 py-2.5 text-sm font-extrabold text-white"
            >
              ផ្កាឈូករីក ({formatDisplayNumber(garden.lotusCount, numeralPref)})
            </button>

            <button
              type="button"
              data-testid="garden-butterflies-btn"
              onClick={handleFlutterButterflies}
              className="manipulative-target btn-3d candy-tangerine rounded-2xl border-2 border-[#C85A14] bg-[#FF8C42] px-3 py-2.5 text-sm font-extrabold text-[#1E2A4A]"
            >
              មេអំបៅហោះ ({formatDisplayNumber(garden.butterflyCount, numeralPref)})
            </button>
          </div>
        </section>

        {/* Tactile "All Garden Friends" Collection Grid */}
        <section
          data-testid="garden-collection-grid"
          aria-label="មិត្តក្នុងសួនទាំងអស់"
          className="rounded-3xl border-2 border-[#c9c2b2] bg-surface p-4 shadow-[0_6px_0_#c9c2b2] space-y-3"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base sm:text-lg font-bold text-ink">
              មិត្តក្នុងសួនទាំងអស់
            </h2>
            <span className="rounded-full border-2 border-[#148F56] bg-[#E3FBEF] px-3 py-0.5 text-xs font-extrabold text-[#0D2B1D]">
              {formatDisplayNumber(
                gardenCollection.filter((c) => c.unlocked).length,
                numeralPref
              )}{" "}
              / {formatDisplayNumber(gardenCollection.length, numeralPref)}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {gardenCollection.map((friend) =>
              friend.unlocked ? (
                <button
                  key={friend.id}
                  type="button"
                  data-testid={`garden-friend-${friend.id}`}
                  data-unlocked="true"
                  onClick={friend.onTap}
                  className={`tile-3d ${friend.borderClass} rounded-3xl border-2 bg-surface p-3.5 text-center space-y-1.5 flex flex-col items-center justify-between`}
                >
                  {friend.icon}
                  <p className="text-sm font-extrabold text-ink">
                    {friend.nameKm}
                  </p>
                  <div
                    data-testid={`garden-friend-hearts-${friend.id}`}
                    aria-hidden="true"
                    className="inline-flex items-center gap-1 text-sm leading-none"
                  >
                    {[1, 2, 3].map((hIdx) => (
                      <span
                        key={hIdx}
                        className={
                          hIdx <= friend.hearts
                            ? "text-[#D62860]"
                            : "text-[#d6d0c4]"
                        }
                      >
                        ♥
                      </span>
                    ))}
                  </div>
                </button>
              ) : (
                <div
                  key={friend.id}
                  data-testid={`garden-friend-${friend.id}`}
                  data-unlocked="false"
                  className="rounded-3xl border-2 border-dashed border-[#c9c2b2] bg-surface-subtle p-3.5 text-center space-y-1.5 flex flex-col items-center justify-between"
                >
                  <svg
                    viewBox="0 0 48 48"
                    className="mx-auto h-12 w-12 animate-wobble"
                    aria-hidden="true"
                  >
                    <ellipse
                      cx={24}
                      cy={26}
                      rx={13}
                      ry={16}
                      fill="#fef3c7"
                      stroke="#b45309"
                      strokeWidth={1.8}
                    />
                    <circle cx={20} cy={21} r={2.5} fill="#f59e0b" />
                    <circle cx={28} cy={25} r={3} fill="#f59e0b" />
                    <circle cx={22} cy={32} r={2} fill="#f59e0b" />
                  </svg>
                  <p className="text-sm font-bold text-ink-muted">
                    {friend.nameKm}
                  </p>
                  <p className="text-[11px] font-semibold text-ink-muted">
                    រៀនមេរៀនបន្ថែមដើម្បីដាំ!
                  </p>
                </div>
              )
            )}
          </div>
        </section>

        {/* Growth guide */}
        <section className="rounded-3xl border border-border bg-surface p-4 text-sm text-ink-muted space-y-1.5">
          <h2 className="text-base font-bold text-ink">
            របៀបធ្វើឱ្យសួនគណិតកាន់តែស្រស់ស្អាត
          </h2>
          <p>
            • បញ្ចប់មេរៀន <strong className="text-ink">គ្រឹះថ្នាក់ដំបូង</strong> នីមួយៗ → ដើមស្វាយផ្លែទុំបន្ថែម ១ ផ្លែ!
          </p>
          <p>
            • បញ្ចប់មេរៀន <strong className="text-ink">ធរណីមាត្រ / ប្រភាគ</strong> ឬ <strong className="text-ink">លំហាត់ប្រចាំថ្ងៃ</strong> → ផ្កាឈូករីកថ្មីលើស្រះ!
          </p>
          <p>
            • ទទួលបាន <strong className="text-ink">សញ្ញាសម្គាល់ការយល់ដឹង</strong> → មេអំបៅថ្មីហោះមកលេងក្នុងសួន!
          </p>
        </section>

        {/* Printable Offline Khmer Achievement Certificate */}
        <AchievementCertificate />
      </main>
    </div>
  );
}
