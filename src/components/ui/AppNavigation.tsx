"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface PrimaryNavItem {
  id: string;
  href: string;
  labelKm: string;
  match: (pathname: string) => boolean;
  icon: React.ReactNode;
}

const PRIMARY_ITEMS: PrimaryNavItem[] = [
  {
    id: "learn",
    href: "/learn",
    labelKm: "មេរៀន",
    match: (p) => p === "/learn",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    id: "play",
    href: "/play",
    labelKm: "ក្ដារលេង",
    match: (p) => p.startsWith("/play"),
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x={2} y={6} width={20} height={12} rx={4} />
        <path d="M6 12h4" />
        <path d="M8 10v4" />
        <circle cx={15.5} cy={11} r={1} fill="currentColor" />
        <circle cx={18} cy={13} r={1} fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "garden",
    href: "/garden",
    labelKm: "សួនគណិត",
    match: (p) => p.startsWith("/garden"),
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 22v-9" />
        <path d="M12 13c-4 0-7-3-7-7 4 0 7 3 7 7z" />
        <path d="M12 13c4 0 7-3 7-7-4 0-7 3-7 7z" />
      </svg>
    ),
  },
  {
    id: "daily",
    href: "/daily",
    labelKm: "ប្រចាំថ្ងៃ",
    match: (p) => p.startsWith("/daily"),
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx={12} cy={12} r={4} />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" />
        <path d="m19.07 4.93-1.41 1.41" />
      </svg>
    ),
  },
];

const MORE_MENU_ITEMS = [
  {
    id: "review",
    href: "/review",
    titleKm: "រំលឹកឡើងវិញ",
    subtitleKm: "ប្រអប់រំលឹក Leitner ប្រចាំថ្ងៃ",
  },
  {
    id: "parent",
    href: "/parent",
    titleKm: "ផ្ទាំងឪពុកម្ដាយ",
    subtitleKm: "តាមដានការរៀន និងវឌ្ឍនភាពកូន",
  },
  {
    id: "admin",
    href: "/admin",
    titleKm: "ស្ទូឌីយោមេរៀន",
    subtitleKm: "បង្កើត និងពិនិត្យមេរៀន JSON ខ្មែរ",
  },
  {
    id: "home",
    href: "/",
    titleKm: "ទំព័រដើម",
    subtitleKm: "ត្រឡប់ទៅផ្ទាំងស្វាគមន៍សួនគណិត",
  },
];

export function AppNavigation() {
  const pathname = usePathname() || "/";
  const [moreOpen, setMoreOpen] = useState(false);

  // Auto-hide global menu in distraction-free Lesson Player & Onboarding screens
  const isFocusMode =
    pathname.startsWith("/learn/") || pathname.startsWith("/onboarding");

  useEffect(() => {
    if (!moreOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMoreOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [moreOpen]);

  if (isFocusMode) {
    return null;
  }

  const isMoreActive =
    pathname.startsWith("/review") ||
    pathname.startsWith("/parent") ||
    pathname.startsWith("/admin");

  return (
    <>
      {/* Bottom clearance spacer so fixed nav never obscures focused controls on mobile/portrait */}
      <div
        aria-hidden="true"
        className="app-nav-spacer h-[calc(5.5rem+env(safe-area-inset-bottom))] shrink-0"
      />

      {/* Backdrop when More Menu sheet is open */}
      {moreOpen && (
        <div
          aria-hidden="true"
          onClick={() => setMoreOpen(false)}
          className="fixed inset-0 z-30 bg-ink/20 backdrop-blur-[1px]"
        />
      )}

      {/* Expandable More Menu Sheet */}
      {moreOpen && (
        <nav
          id="nav-more-menu-panel"
          aria-label="ម៉ឺនុយបន្ថែម"
          data-testid="nav-more-menu"
          className="app-nav-more-sheet fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] left-3 right-3 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-full sm:max-w-md z-40 max-h-[70dvh] overflow-y-auto overscroll-contain rounded-3xl border-2 border-[#c9c2b2] bg-surface p-3 shadow-[0_6px_0_#c9c2b2,0_14px_28px_rgba(30,42,74,0.14)] space-y-1.5"
        >
          <div className="flex items-center justify-between px-2 py-1">
            <p className="text-xs font-bold text-ink-muted">
              ម៉ឺនុយទាំងអស់ • សួនគណិត
            </p>
            <button
              type="button"
              data-testid="nav-more-close-btn"
              onClick={() => setMoreOpen(false)}
              className="khmer-chip pill-3d [--pill-edge:#c9c2b2] rounded-xl border-2 border-[#c9c2b2] bg-surface-subtle px-3 text-xs font-bold text-ink"
            >
              បិទ ✕
            </button>
          </div>
          <div className="grid grid-cols-1 gap-1.5">
            {MORE_MENU_ITEMS.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  data-testid={`nav-more-link-${item.id}`}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setMoreOpen(false)}
                  className={`flex min-h-[48px] flex-col justify-center rounded-2xl border-2 px-3.5 py-2 transition-all ${
                    active
                      ? "border-[#C89600] bg-[#FFF1B8] text-[#1E2A4A] shadow-[0_3px_0_#C89600]"
                      : "border-border bg-canvas text-ink hover:border-[#C89600] hover:bg-surface-subtle"
                  }`}
                >
                  <span className="text-sm font-bold">{item.titleKm}</span>
                  <span className="text-xs text-ink-muted">
                    {item.subtitleKm}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      {/* Persistent Mobile Bottom Dock (<900px) / Vertical Left Side Rail (>=900px) */}
      <nav
        aria-label="ម៉ឺនុយមេ"
        data-testid="app-bottom-nav"
        className="app-nav-shell fixed bottom-0 left-0 right-0 sm:bottom-3 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-[calc(100%-2rem)] sm:max-w-xl z-40 border-t-2 sm:border-2 border-[#c9c2b2] bg-surface/95 backdrop-blur sm:rounded-3xl shadow-[0_-4px_16px_rgba(30,42,74,0.06)] px-1.5 pt-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))] sm:py-2"
      >
        <div className="app-nav-items grid grid-cols-5 gap-1">
          {PRIMARY_ITEMS.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.id}
                href={item.href}
                data-testid={`nav-tab-${item.id}`}
                aria-current={active ? "page" : undefined}
                onClick={() => setMoreOpen(false)}
                className={`flex min-h-[48px] min-[900px]:min-h-[60px] flex-col items-center justify-center gap-0.5 rounded-2xl border-2 px-1 py-1 text-[11px] min-[900px]:text-xs font-extrabold transition-all active:translate-y-0.5 ${
                  active
                    ? "border-[#C89600] bg-[#FFF1B8] text-[#1E2A4A] shadow-[0_3px_0_#C89600]"
                    : "border-transparent text-ink hover:bg-surface-subtle hover:border-[#d6d0c4]"
                }`}
              >
                {item.icon}
                <span className="truncate max-w-full">{item.labelKm}</span>
              </Link>
            );
          })}

          <button
            type="button"
            data-testid="nav-more-btn"
            aria-expanded={moreOpen}
            aria-controls={moreOpen ? "nav-more-menu-panel" : undefined}
            onClick={() => setMoreOpen((v) => !v)}
            className={`flex min-h-[48px] min-[900px]:min-h-[60px] flex-col items-center justify-center gap-0.5 rounded-2xl border-2 px-1 py-1 text-[11px] min-[900px]:text-xs font-extrabold transition-all active:translate-y-0.5 ${
              moreOpen || isMoreActive
                ? "border-[#C89600] bg-[#FFF1B8] text-[#1E2A4A] shadow-[0_3px_0_#C89600]"
                : "border-transparent text-ink hover:bg-surface-subtle hover:border-[#d6d0c4]"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1={4} y1={6} x2={20} y2={6} />
              <line x1={4} y1={12} x2={20} y2={12} />
              <line x1={4} y1={18} x2={20} y2={18} />
            </svg>
            <span>ម៉ឺនុយ</span>
          </button>
        </div>
      </nav>
    </>
  );
}
