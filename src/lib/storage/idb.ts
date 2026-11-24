"use client";

import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { LessonDocumentV1 } from "@/lib/curriculum/schema";
import type { NumeralPreference } from "@/lib/khmer/numerals";
import type { MasteryTier } from "@/lib/math/mastery";

export const DB_NAME = "konleuh-kanit-db";
export const DB_VERSION = 1;

export interface LocalStudentProfile {
  id: string;
  displayName: string;
  avatarId: string;
  ageYears: number;
  gradeLevel: number;
  numeralPreference: NumeralPreference;
  audioEnabled: boolean;
  weeklyGoalDays: number;
  activeDates: string[]; // ISO YYYY-MM-DD strings for calm weekly rhythm
  totalXp: number;
  createdAt: string;
  updatedAt: string;
}

export interface LocalLessonProgress {
  id: string; // `${studentId}:${lessonId}`
  studentId: string;
  lessonId: string;
  masteryTier: MasteryTier;
  leitnerBox: number;
  nextReviewAt: string | null;
  accuracyPct: number;
  hintsUsed: number;
  attemptsCount: number;
  completedStepIds: string[];
  completedAt: string | null;
  updatedAt: string;
}

export type SyncOutboxItem =
  | {
      id: string;
      kind: "profile_upsert";
      payload: LocalStudentProfile;
      createdAt: string;
    }
  | {
      id: string;
      kind: "progress_upsert";
      payload: LocalLessonProgress;
      createdAt: string;
    };

interface KonleuhKanitDB extends DBSchema {
  profiles: {
    key: string;
    value: LocalStudentProfile;
  };
  lessonCache: {
    key: string;
    value: LessonDocumentV1;
  };
  progress: {
    key: string;
    value: LocalLessonProgress;
    indexes: { "by-student": string };
  };
  syncOutbox: {
    key: string;
    value: SyncOutboxItem;
  };
}

let dbPromise: Promise<IDBPDatabase<KonleuhKanitDB> | null> | null = null;
const STORAGE_TIMEOUT_MS = 1500;

// In-memory fallback stores when mobile IndexedDB is unavailable, private-locked, or stalled
const memoryProfiles = new Map<string, LocalStudentProfile>();
const memoryProgress = new Map<string, LocalLessonProgress>();

export async function withStorageTimeout<T>(
  operation: Promise<T>,
  timeoutMs: number,
  fallbackValue: T
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  try {
    const timeoutPromise = new Promise<T>((resolve) => {
      timer = setTimeout(() => {
        resolve(fallbackValue);
      }, timeoutMs);
    });
    return await Promise.race([
      operation.catch(() => fallbackValue),
      timeoutPromise,
    ]);
  } finally {
    if (timer !== null) {
      clearTimeout(timer);
    }
  }
}

export async function cleanupStaleServiceWorkersAndCaches(options?: {
  unregisterAll?: boolean;
}): Promise<{ unregistered: number; deletedCaches: number }> {
  let unregistered = 0;
  let deletedCaches = 0;

  if (typeof window === "undefined") {
    return { unregistered, deletedCaches };
  }

  try {
    if (
      options?.unregisterAll &&
      typeof navigator !== "undefined" &&
      "serviceWorker" in navigator &&
      typeof navigator.serviceWorker.getRegistrations === "function"
    ) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) {
        const ok = await reg.unregister();
        if (ok) unregistered++;
      }
    }
  } catch {
    // Ignore restricted SW environments
  }

  try {
    if (options?.unregisterAll && "caches" in window) {
      const keys = await window.caches.keys();
      for (const key of keys) {
        if (key.includes("serwist-precache") || key.includes("precache")) {
          const ok = await window.caches.delete(key);
          if (ok) deletedCaches++;
        }
      }
    }
  } catch {
    // Ignore restricted CacheStorage environments
  }

  return { unregistered, deletedCaches };
}

function isIndexedDbAvailable(): boolean {
  return typeof window !== "undefined" && "indexedDB" in window;
}

export function getLocalDb(): Promise<IDBPDatabase<KonleuhKanitDB> | null> | null {
  if (!isIndexedDbAvailable()) {
    return null;
  }

  if (!dbPromise) {
    const rawOpen = openDB<KonleuhKanitDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("profiles")) {
          db.createObjectStore("profiles", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("lessonCache")) {
          db.createObjectStore("lessonCache", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("progress")) {
          const progressStore = db.createObjectStore("progress", {
            keyPath: "id",
          });
          progressStore.createIndex("by-student", "studentId");
        }
        if (!db.objectStoreNames.contains("syncOutbox")) {
          db.createObjectStore("syncOutbox", { keyPath: "id" });
        }
      },
      blocked() {
        dbPromise = null;
      },
      blocking() {
        dbPromise = null;
      },
      terminated() {
        dbPromise = null;
      },
    }).catch(() => {
      dbPromise = null;
      return null;
    });

    dbPromise = withStorageTimeout(rawOpen, STORAGE_TIMEOUT_MS, null);
  }

  return dbPromise;
}

const ACTIVE_PROFILE_KEY = "konleuh-kanit:active-profile-id";
const NUMERAL_PREF_KEY = "konleuh-kanit:numeral-preference";
const AUDIO_PREF_KEY = "konleuh-kanit:audio-enabled";

export function getSavedAudioEnabled(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const val = window.localStorage.getItem(AUDIO_PREF_KEY);
    return val === "0" ? false : true;
  } catch {
    return true;
  }
}

export function saveAudioEnabledLocal(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(AUDIO_PREF_KEY, enabled ? "1" : "0");
  } catch {
    // Ignore storage errors
  }
}

export function getSavedNumeralPref(): NumeralPreference {
  if (typeof window === "undefined") return "km";
  try {
    const val = window.localStorage.getItem(NUMERAL_PREF_KEY);
    return val === "latn" ? "latn" : "km";
  } catch {
    return "km";
  }
}

export function saveNumeralPrefLocal(pref: NumeralPreference): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(NUMERAL_PREF_KEY, pref);
  } catch {
    // Ignore storage errors in private browsing
  }
}

export function getActiveProfileId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(ACTIVE_PROFILE_KEY);
  } catch {
    return null;
  }
}

export function setActiveProfileId(id: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ACTIVE_PROFILE_KEY, id);
  } catch {
    // Ignore storage errors
  }
}

export async function listProfiles(): Promise<LocalStudentProfile[]> {
  const db = await getLocalDb();
  if (!db) return Array.from(memoryProfiles.values());
  const list = await withStorageTimeout(
    db.getAll("profiles"),
    STORAGE_TIMEOUT_MS,
    Array.from(memoryProfiles.values())
  );
  for (const p of list) {
    memoryProfiles.set(p.id, p);
  }
  return list;
}

export async function getProfile(
  id: string
): Promise<LocalStudentProfile | undefined> {
  const db = await getLocalDb();
  if (!db) return memoryProfiles.get(id);
  const found = await withStorageTimeout(
    db.get("profiles", id),
    STORAGE_TIMEOUT_MS,
    memoryProfiles.get(id)
  );
  if (found) {
    memoryProfiles.set(found.id, found);
  }
  return found;
}

export async function saveProfile(
  profile: LocalStudentProfile,
  queueSync = true
): Promise<void> {
  memoryProfiles.set(profile.id, profile);
  setActiveProfileId(profile.id);
  saveNumeralPrefLocal(profile.numeralPreference);

  const db = await getLocalDb();
  if (!db) return;
  await withStorageTimeout(
    (async () => {
      const tx = db.transaction(["profiles", "syncOutbox"], "readwrite");
      await tx.objectStore("profiles").put(profile);
      if (queueSync) {
        await tx.objectStore("syncOutbox").put({
          id: `profile:${profile.id}:${Date.now()}`,
          kind: "profile_upsert",
          payload: profile,
          createdAt: new Date().toISOString(),
        });
      }
      await tx.done;
    })(),
    STORAGE_TIMEOUT_MS,
    undefined
  );
}

export async function cacheLessons(lessons: LessonDocumentV1[]): Promise<void> {
  const db = await getLocalDb();
  if (!db || lessons.length === 0) return;
  await withStorageTimeout(
    (async () => {
      const tx = db.transaction("lessonCache", "readwrite");
      for (const lesson of lessons) {
        await tx.store.put(lesson);
      }
      await tx.done;
    })(),
    STORAGE_TIMEOUT_MS,
    undefined
  );
}

export async function getCachedLesson(
  lessonId: string
): Promise<LessonDocumentV1 | undefined> {
  const db = await getLocalDb();
  if (!db) return undefined;
  return withStorageTimeout(
    db.get("lessonCache", lessonId),
    STORAGE_TIMEOUT_MS,
    undefined
  );
}

export async function listCachedLessons(): Promise<LessonDocumentV1[]> {
  const db = await getLocalDb();
  if (!db) return [];
  return withStorageTimeout(
    db.getAll("lessonCache"),
    STORAGE_TIMEOUT_MS,
    []
  );
}

export async function getProgressForStudent(
  studentId: string
): Promise<LocalLessonProgress[]> {
  const fallback = Array.from(memoryProgress.values()).filter(
    (p) => p.studentId === studentId
  );
  const db = await getLocalDb();
  if (!db) return fallback;
  const list = await withStorageTimeout(
    db.getAllFromIndex("progress", "by-student", studentId),
    STORAGE_TIMEOUT_MS,
    fallback
  );
  for (const item of list) {
    memoryProgress.set(item.id, item);
  }
  return list;
}

export async function getLessonProgress(
  studentId: string,
  lessonId: string
): Promise<LocalLessonProgress | undefined> {
  const key = `${studentId}:${lessonId}`;
  const db = await getLocalDb();
  if (!db) return memoryProgress.get(key);
  return withStorageTimeout(
    db.get("progress", key),
    STORAGE_TIMEOUT_MS,
    memoryProgress.get(key)
  );
}

export async function saveLessonProgress(
  progress: LocalLessonProgress,
  queueSync = true
): Promise<void> {
  memoryProgress.set(progress.id, progress);
  const db = await getLocalDb();
  if (!db) return;
  await withStorageTimeout(
    (async () => {
      const tx = db.transaction(["progress", "syncOutbox"], "readwrite");
      await tx.objectStore("progress").put(progress);
      if (queueSync) {
        await tx.objectStore("syncOutbox").put({
          id: `progress:${progress.id}:${Date.now()}`,
          kind: "progress_upsert",
          payload: progress,
          createdAt: new Date().toISOString(),
        });
      }
      await tx.done;
    })(),
    STORAGE_TIMEOUT_MS,
    undefined
  );
}

export async function listOutboxItems(): Promise<SyncOutboxItem[]> {
  const db = await getLocalDb();
  if (!db) return [];
  return withStorageTimeout(
    db.getAll("syncOutbox"),
    STORAGE_TIMEOUT_MS,
    []
  );
}

export async function clearOutboxItems(ids: string[]): Promise<void> {
  const db = await getLocalDb();
  if (!db || ids.length === 0) return;
  await withStorageTimeout(
    (async () => {
      const tx = db.transaction("syncOutbox", "readwrite");
      for (const id of ids) {
        await tx.store.delete(id);
      }
      await tx.done;
    })(),
    STORAGE_TIMEOUT_MS,
    undefined
  );
}
