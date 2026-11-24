"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { LazyMotion, domAnimation } from "motion/react";
import type { NumeralPreference } from "@/lib/khmer/numerals";
import {
  cleanupStaleServiceWorkersAndCaches,
  clearOutboxItems,
  getActiveProfileId,
  getProfile,
  getProgressForStudent,
  getSavedAudioEnabled,
  getSavedNumeralPref,
  listOutboxItems,
  listProfiles,
  saveAudioEnabledLocal,
  saveLessonProgress,
  saveNumeralPrefLocal,
  saveProfile,
  type LocalLessonProgress,
  type LocalStudentProfile,
} from "@/lib/storage/idb";
import { computeMasteryUpdate } from "@/lib/math/mastery";
import { syncOutboxBatch } from "@/app/actions/sync";

export interface LearnerContextValue {
  profile: LocalStudentProfile | null;
  profiles: LocalStudentProfile[];
  progressByLesson: Record<string, LocalLessonProgress>;
  numeralPref: NumeralPreference;
  audioEnabled: boolean;
  isOnline: boolean;
  isHydrated: boolean;
  pendingSyncCount: number;
  setNumeralPref: (pref: NumeralPreference) => Promise<void>;
  toggleNumeralPref: () => Promise<void>;
  toggleAudioEnabled: () => Promise<void>;
  recordDailyPuzzleCompleted: (input: {
    dateIso: string;
    puzzleId: string;
  }) => Promise<{ xpEarned: number }>;
  createGuestProfile: (input: {
    displayName: string;
    avatarId: string;
    ageYears: number;
    gradeLevel: number;
    numeralPreference: NumeralPreference;
  }) => Promise<LocalStudentProfile>;
  switchProfile: (profileId: string) => Promise<void>;
  recordStepCompleted: (lessonId: string, stepId: string) => Promise<void>;
  recordLessonFinished: (input: {
    lessonId: string;
    accuracyPct: number;
    hintsUsed: number;
    usedTier3Hint: boolean;
    completedStepIds: string[];
  }) => Promise<{
    progress: LocalLessonProgress;
    xpEarned: number;
    intervalDays: number;
  }>;
  flushSyncOutbox: () => Promise<void>;
}

const LearnerContext = createContext<LearnerContextValue | null>(null);

function getTodayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function generateLocalId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `guest-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function LearnerProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<LocalStudentProfile | null>(null);
  const [profiles, setProfiles] = useState<LocalStudentProfile[]>([]);
  const [progressByLesson, setProgressByLesson] = useState<
    Record<string, LocalLessonProgress>
  >({});
  const [numeralPref, setNumeralPrefState] = useState<NumeralPreference>("km");
  const [audioEnabled, setAudioEnabledState] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);

  const flushSyncOutbox = useCallback(async () => {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      return;
    }
    try {
      const items = await listOutboxItems();
      setPendingSyncCount(items.length);
      if (items.length === 0) return;

      const result = await syncOutboxBatch(items);
      if (result.syncedIds.length > 0) {
        await clearOutboxItems(result.syncedIds);
        const remaining = await listOutboxItems();
        setPendingSyncCount(remaining.length);
      }
    } catch {
      // Remain resilient offline; outbox stays queued for next reconnect
    }
  }, []);

  const hydrateForProfile = useCallback(
    async (active: LocalStudentProfile | null) => {
      setProfile(active);
      if (!active) {
        setProgressByLesson({});
        return;
      }
      setNumeralPrefState(active.numeralPreference);
      saveNumeralPrefLocal(active.numeralPreference);
      setAudioEnabledState(active.audioEnabled);
      saveAudioEnabledLocal(active.audioEnabled);
      const list = await getProgressForStudent(active.id);
      const map: Record<string, LocalLessonProgress> = {};
      for (const item of list) {
        map[item.lessonId] = item;
      }
      setProgressByLesson(map);
    },
    []
  );

  useEffect(() => {
    let active = true;

    async function init() {
      const savedPref = getSavedNumeralPref();
      const savedAudio = getSavedAudioEnabled();
      if (active) {
        setNumeralPrefState(savedPref);
        setAudioEnabledState(savedAudio);
        setIsOnline(typeof navigator !== "undefined" ? navigator.onLine : true);
      }

      try {
        const allProfiles = await listProfiles();
        const activeId = getActiveProfileId();
        let selected: LocalStudentProfile | undefined;

        if (activeId) {
          selected = await getProfile(activeId);
        }
        if (!selected && allProfiles.length > 0) {
          selected = allProfiles[0];
        }

        if (active) {
          setProfiles(allProfiles);
          await hydrateForProfile(selected ?? null);
          const outbox = await listOutboxItems();
          setPendingSyncCount(outbox.length);
          setIsHydrated(true);
        }

        if (typeof navigator !== "undefined" && navigator.onLine) {
          void flushSyncOutbox();
        }
      } catch {
        if (active) {
          setIsHydrated(true);
        }
      }
    }

    void init();

    const handleOnline = () => {
      setIsOnline(true);
      void flushSyncOutbox();
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if ("serviceWorker" in navigator) {
      if (process.env.NODE_ENV === "production") {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            void reg.update().catch(() => {
              // Ignore update check failure when offline
            });
          })
          .catch(() => {
            // Non-blocking SW registration
          });
      } else {
        void cleanupStaleServiceWorkersAndCaches({ unregisterAll: true });
      }
    }

    const handleChunkError = (event: ErrorEvent) => {
      const msg = event.message ?? "";
      if (
        msg.includes("ChunkLoadError") ||
        msg.includes("Loading chunk") ||
        msg.includes("Failed to fetch dynamically imported module")
      ) {
        void cleanupStaleServiceWorkersAndCaches({ unregisterAll: true });
      }
    };

    window.addEventListener("error", handleChunkError);

    return () => {
      active = false;
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("error", handleChunkError);
    };
  }, [flushSyncOutbox, hydrateForProfile]);

  const setNumeralPref = useCallback(
    async (pref: NumeralPreference) => {
      setNumeralPrefState(pref);
      saveNumeralPrefLocal(pref);

      if (profile) {
        const updated: LocalStudentProfile = {
          ...profile,
          numeralPreference: pref,
          updatedAt: new Date().toISOString(),
        };
        setProfile(updated);
        setProfiles((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p))
        );
        await saveProfile(updated, true);
        void flushSyncOutbox();
      }
    },
    [profile, flushSyncOutbox]
  );

  const toggleNumeralPref = useCallback(async () => {
    const next: NumeralPreference = numeralPref === "km" ? "latn" : "km";
    await setNumeralPref(next);
  }, [numeralPref, setNumeralPref]);

  const toggleAudioEnabled = useCallback(async () => {
    const next = !audioEnabled;
    setAudioEnabledState(next);
    saveAudioEnabledLocal(next);

    if (profile) {
      const updated: LocalStudentProfile = {
        ...profile,
        audioEnabled: next,
        updatedAt: new Date().toISOString(),
      };
      setProfile(updated);
      setProfiles((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );
      await saveProfile(updated, true);
      void flushSyncOutbox();
    }
  }, [audioEnabled, profile, flushSyncOutbox]);

  const createGuestProfile = useCallback(
    async (input: {
      displayName: string;
      avatarId: string;
      ageYears: number;
      gradeLevel: number;
      numeralPreference: NumeralPreference;
    }) => {
      const nowIso = new Date().toISOString();
      const newProfile: LocalStudentProfile = {
        id: generateLocalId(),
        displayName: input.displayName.trim() || "សិស្សឆ្លាត",
        avatarId: input.avatarId || "lotus",
        ageYears: input.ageYears,
        gradeLevel: input.gradeLevel,
        numeralPreference: input.numeralPreference,
        audioEnabled: true,
        weeklyGoalDays: 3,
        activeDates: [getTodayIsoDate()],
        totalXp: 0,
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      await saveProfile(newProfile, true);
      setProfiles((prev) => [...prev, newProfile]);
      await hydrateForProfile(newProfile);
      const outbox = await listOutboxItems();
      setPendingSyncCount(outbox.length);
      void flushSyncOutbox();
      return newProfile;
    },
    [flushSyncOutbox, hydrateForProfile]
  );

  const ensureActiveProfile = useCallback(async (): Promise<LocalStudentProfile> => {
    if (profile) return profile;
    return createGuestProfile({
      displayName: "សិស្សឆ្លាត",
      avatarId: "lotus",
      ageYears: 7,
      gradeLevel: 1,
      numeralPreference: numeralPref,
    });
  }, [profile, createGuestProfile, numeralPref]);

  const switchProfile = useCallback(
    async (profileId: string) => {
      const target = await getProfile(profileId);
      if (target) {
        await saveProfile(target, false);
        await hydrateForProfile(target);
      }
    },
    [hydrateForProfile]
  );

  const recordStepCompleted = useCallback(
    async (lessonId: string, stepId: string) => {
      const active = await ensureActiveProfile();
      const existing = progressByLesson[lessonId];
      const completedStepIds = Array.from(
        new Set([...(existing?.completedStepIds ?? []), stepId])
      );
      const nowIso = new Date().toISOString();

      const updated: LocalLessonProgress = {
        id: `${active.id}:${lessonId}`,
        studentId: active.id,
        lessonId,
        masteryTier:
          existing?.masteryTier && existing.masteryTier !== "not_started"
            ? existing.masteryTier
            : "attempted",
        leitnerBox: existing?.leitnerBox ?? 1,
        nextReviewAt: existing?.nextReviewAt ?? null,
        accuracyPct: existing?.accuracyPct ?? 0,
        hintsUsed: existing?.hintsUsed ?? 0,
        attemptsCount: existing?.attemptsCount ?? 0,
        completedStepIds,
        completedAt: existing?.completedAt ?? null,
        updatedAt: nowIso,
      };

      await saveLessonProgress(updated, true);
      setProgressByLesson((prev) => ({ ...prev, [lessonId]: updated }));
      const outbox = await listOutboxItems();
      setPendingSyncCount(outbox.length);
    },
    [ensureActiveProfile, progressByLesson]
  );

  const recordLessonFinished = useCallback(
    async (input: {
      lessonId: string;
      accuracyPct: number;
      hintsUsed: number;
      usedTier3Hint: boolean;
      completedStepIds: string[];
    }) => {
      const active = await ensureActiveProfile();
      const existing = progressByLesson[input.lessonId];

      const mastery = computeMasteryUpdate(
        {
          masteryTier: existing?.masteryTier ?? "not_started",
          leitnerBox: existing?.leitnerBox ?? 1,
          attemptsCount: existing?.attemptsCount ?? 0,
        },
        {
          accuracyPct: input.accuracyPct,
          usedTier3Hint: input.usedTier3Hint,
        }
      );

      const nowIso = new Date().toISOString();
      const updatedProgress: LocalLessonProgress = {
        id: `${active.id}:${input.lessonId}`,
        studentId: active.id,
        lessonId: input.lessonId,
        masteryTier: mastery.masteryTier,
        leitnerBox: mastery.leitnerBox,
        nextReviewAt: mastery.nextReviewAt.toISOString(),
        accuracyPct: Math.max(existing?.accuracyPct ?? 0, input.accuracyPct),
        hintsUsed: input.hintsUsed,
        attemptsCount: mastery.attemptsCount,
        completedStepIds: Array.from(
          new Set([
            ...(existing?.completedStepIds ?? []),
            ...input.completedStepIds,
          ])
        ),
        completedAt: nowIso,
        updatedAt: nowIso,
      };

      await saveLessonProgress(updatedProgress, true);
      setProgressByLesson((prev) => ({
        ...prev,
        [input.lessonId]: updatedProgress,
      }));

      const today = getTodayIsoDate();
      const nextActiveDates = Array.from(
        new Set([...(active.activeDates ?? []), today])
      );
      const updatedProfile: LocalStudentProfile = {
        ...active,
        totalXp: active.totalXp + mastery.xpEarned,
        activeDates: nextActiveDates,
        updatedAt: nowIso,
      };

      await saveProfile(updatedProfile, true);
      setProfile(updatedProfile);
      setProfiles((prev) =>
        prev.map((p) => (p.id === updatedProfile.id ? updatedProfile : p))
      );

      const outbox = await listOutboxItems();
      setPendingSyncCount(outbox.length);
      void flushSyncOutbox();

      return {
        progress: updatedProgress,
        xpEarned: mastery.xpEarned,
        intervalDays: mastery.intervalDays,
      };
    },
    [ensureActiveProfile, progressByLesson, flushSyncOutbox]
  );

  const recordDailyPuzzleCompleted = useCallback(
    async (input: { dateIso: string; puzzleId: string }) => {
      const active = await ensureActiveProfile();
      const dailyKey = `daily:${input.dateIso}`;
      const existing = progressByLesson[dailyKey];
      const nowIso = new Date().toISOString();
      const xpEarned = existing?.completedAt ? 0 : 15;

      const updatedProgress: LocalLessonProgress = {
        id: `${active.id}:${dailyKey}`,
        studentId: active.id,
        lessonId: dailyKey,
        masteryTier: "mastered",
        leitnerBox: 5,
        nextReviewAt: null,
        accuracyPct: 100,
        hintsUsed: 0,
        attemptsCount: (existing?.attemptsCount ?? 0) + 1,
        completedStepIds: [input.puzzleId],
        completedAt: nowIso,
        updatedAt: nowIso,
      };

      await saveLessonProgress(updatedProgress, true);
      setProgressByLesson((prev) => ({
        ...prev,
        [dailyKey]: updatedProgress,
      }));

      const today = getTodayIsoDate();
      const nextActiveDates = Array.from(
        new Set([...(active.activeDates ?? []), today])
      );
      const updatedProfile: LocalStudentProfile = {
        ...active,
        totalXp: active.totalXp + xpEarned,
        activeDates: nextActiveDates,
        updatedAt: nowIso,
      };

      await saveProfile(updatedProfile, true);
      setProfile(updatedProfile);
      setProfiles((prev) =>
        prev.map((p) => (p.id === updatedProfile.id ? updatedProfile : p))
      );
      void flushSyncOutbox();

      return { xpEarned };
    },
    [ensureActiveProfile, progressByLesson, flushSyncOutbox]
  );

  const value = useMemo<LearnerContextValue>(
    () => ({
      profile,
      profiles,
      progressByLesson,
      numeralPref,
      audioEnabled,
      isOnline,
      isHydrated,
      pendingSyncCount,
      setNumeralPref,
      toggleNumeralPref,
      toggleAudioEnabled,
      createGuestProfile,
      switchProfile,
      recordStepCompleted,
      recordLessonFinished,
      recordDailyPuzzleCompleted,
      flushSyncOutbox,
    }),
    [
      profile,
      profiles,
      progressByLesson,
      numeralPref,
      audioEnabled,
      isOnline,
      isHydrated,
      pendingSyncCount,
      setNumeralPref,
      toggleNumeralPref,
      toggleAudioEnabled,
      createGuestProfile,
      switchProfile,
      recordStepCompleted,
      recordLessonFinished,
      recordDailyPuzzleCompleted,
      flushSyncOutbox,
    ]
  );

  return (
    <LazyMotion features={domAnimation}>
      <LearnerContext.Provider value={value}>
        {children}
      </LearnerContext.Provider>
    </LazyMotion>
  );
}

export function useLearner(): LearnerContextValue {
  const ctx = useContext(LearnerContext);
  if (!ctx) {
    throw new Error("useLearner must be used within LearnerProvider");
  }
  return ctx;
}
