import { describe, expect, it, vi } from "vitest";
import {
  cleanupStaleServiceWorkersAndCaches,
  getLessonProgress,
  getProfile,
  listProfiles,
  saveLessonProgress,
  saveProfile,
  withStorageTimeout,
  type LocalLessonProgress,
  type LocalStudentProfile,
} from "@/lib/storage/idb";

describe("Mobile Storage & Service Worker Resilience", () => {
  it("resolves fallback value within timeout when a storage promise stalls or rejects", async () => {
    const stalled = new Promise<string>(() => {
      // Never resolves (simulates hung mobile IndexedDB openDB)
    });
    const res1 = await withStorageTimeout(stalled, 40, "fallback-ok");
    expect(res1).toBe("fallback-ok");

    const rejected = Promise.reject(new Error("QuotaExceededError"));
    const res2 = await withStorageTimeout(rejected, 100, "fallback-err");
    expect(res2).toBe("fallback-err");

    const fast = Promise.resolve("fast-value");
    const res3 = await withStorageTimeout(fast, 100, "fallback-unused");
    expect(res3).toBe("fast-value");
  });

  it("persists and reads profiles and lesson progress via in-memory fallback when IndexedDB is unavailable", async () => {
    const sampleProfile: LocalStudentProfile = {
      id: "mobile-mem-student-1",
      displayName: "កុមារឆ្លាត",
      avatarId: "lotus",
      ageYears: 8,
      gradeLevel: 2,
      numeralPreference: "km",
      audioEnabled: true,
      weeklyGoalDays: 3,
      activeDates: ["2026-11-24"],
      totalXp: 30,
      createdAt: "2026-11-24T00:00:00.000Z",
      updatedAt: "2026-11-24T00:00:00.000Z",
    };

    await saveProfile(sampleProfile, false);
    const loadedProfile = await getProfile("mobile-mem-student-1");
    expect(loadedProfile?.displayName).toBe("កុមារឆ្លាត");

    const allProfiles = await listProfiles();
    expect(allProfiles.some((p) => p.id === "mobile-mem-student-1")).toBe(true);

    const sampleProgress: LocalLessonProgress = {
      id: "mobile-mem-student-1:l07-making-ten",
      studentId: "mobile-mem-student-1",
      lessonId: "l07-making-ten",
      masteryTier: "proficient",
      leitnerBox: 3,
      nextReviewAt: "2026-11-28T00:00:00.000Z",
      accuracyPct: 100,
      hintsUsed: 0,
      attemptsCount: 1,
      completedStepIds: ["s1", "s2", "s3"],
      completedAt: "2026-11-24T00:00:00.000Z",
      updatedAt: "2026-11-24T00:00:00.000Z",
    };

    await saveLessonProgress(sampleProgress, false);
    const loadedProgress = await getLessonProgress(
      "mobile-mem-student-1",
      "l07-making-ten"
    );
    expect(loadedProgress?.masteryTier).toBe("proficient");
  });

  it("unregisters stale Service Workers and evicts outdated precache caches cleanly", async () => {
    const unregisterMock = vi.fn().mockResolvedValue(true);
    const deleteCacheMock = vi.fn().mockResolvedValue(true);

    vi.stubGlobal("window", {
      caches: {
        keys: vi
          .fn()
          .mockResolvedValue([
            "serwist-precache-v2-http://localhost:3000/",
            "konleuh-kanit-audio-v1",
          ]),
        delete: deleteCacheMock,
      },
    });

    vi.stubGlobal("navigator", {
      serviceWorker: {
        getRegistrations: vi
          .fn()
          .mockResolvedValue([{ unregister: unregisterMock }]),
      },
    });

    const res = await cleanupStaleServiceWorkersAndCaches({
      unregisterAll: true,
    });
    expect(res.unregistered).toBe(1);
    expect(res.deletedCaches).toBe(1);
    expect(unregisterMock).toHaveBeenCalledTimes(1);
    expect(deleteCacheMock).toHaveBeenCalledWith(
      "serwist-precache-v2-http://localhost:3000/"
    );

    vi.unstubAllGlobals();
  });
});
