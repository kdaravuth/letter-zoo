import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function expectNoWcag22Violations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations).toEqual([]);
}

async function expectAllManipulativeTargetsAtLeast56px(page: Page) {
  const targets = page.locator(".manipulative-target");
  const count = await targets.count();
  expect(count).toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {
    const el = targets.nth(i);
    if (!(await el.isVisible())) continue;
    const box = await el.boundingBox();
    expect(box, `Target index ${i} should have a bounding box`).not.toBeNull();
    expect(
      box!.width,
      `Target index ${i} width (${box!.width}) must be >= 56px`
    ).toBeGreaterThanOrEqual(56);
    expect(
      box!.height,
      `Target index ${i} height (${box!.height}) must be >= 56px`
    ).toBeGreaterThanOrEqual(56);
  }
}

test.describe("Soun Kanit (សួនគណិត) E2E (360x800 Mobile)", () => {
  test("Khmer typography, onboarding -> learning path -> Lesson 7 tap-to-place, numeral toggle, 3-tier hints, touch targets, and WCAG 2.2 AA", async ({
    page,
  }) => {
    // 1. Landing page + Khmer typography & WCAG 2.2 AA check
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "km");

    const typoMetrics = await page.evaluate(() => {
      const style = window.getComputedStyle(document.documentElement);
      const fontSize = parseFloat(style.fontSize);
      const lineHeight = parseFloat(style.lineHeight);
      const letterSpacing = style.letterSpacing;
      return { ratio: lineHeight / fontSize, letterSpacing };
    });
    expect(typoMetrics.ratio).toBeGreaterThanOrEqual(1.65);
    expect(["0px", "normal"]).toContain(typoMetrics.letterSpacing);

    await expectNoWcag22Violations(page);

    // 2. Navigate to guest onboarding
    await page.getByTestId("cta-start-onboarding").click();
    await expect(page).toHaveURL(/\/onboarding$/);
    await expectNoWcag22Violations(page);

    await page.getByTestId("nickname-input").fill("ដារ៉ា");
    await page.getByTestId("avatar-mango").click();
    await page.getByTestId("age-7").click();
    await page.getByTestId("onboarding-submit-btn").click();

    // 3. Learning Path Dashboard
    await expect(page).toHaveURL(/\/learn$/);
    await expect(page.getByRole("heading", { name: "ដារ៉ា" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "គ្រឹះគណិតវិទ្យាថ្នាក់ដំបូង" })
    ).toBeVisible();
    await expectNoWcag22Violations(page);

    // 4. Open Lesson 7 (Making 10 & Teens)
    await page.getByTestId("lesson-card-l07-making-ten").click();
    await expect(page).toHaveURL(/\/learn\/l07-making-ten$/);

    // Verify default Khmer numerals and >= 56x56 touch targets
    await expect(page.getByTestId("step-prompt")).toContainText("៨");
    await expect(page.getByTestId("counting-in-frame-badge")).toContainText("៨");
    await expectAllManipulativeTargetsAtLeast56px(page);
    await expectNoWcag22Violations(page);

    // 5. Wrong answer triggers non-punitive feedback & 3-tier hint progression
    await page.getByTestId("check-answer-btn").click();
    await expect(page.getByTestId("feedback-panel")).toBeVisible();
    await expect(page.getByTestId("feedback-panel")).toContainText("ជិតត្រូវហើយ");
    await expectNoWcag22Violations(page);

    // Reveal 3 tiers of hints sequentially
    await page.getByTestId("hint-btn").click();
    await expect(page.getByTestId("hint-tier-1")).toBeVisible();
    await page.getByTestId("hint-btn").click();
    await expect(page.getByTestId("hint-tier-2")).toBeVisible();
    await page.getByTestId("hint-btn").click();
    await expect(page.getByTestId("hint-tier-3")).toBeVisible();
    await expectNoWcag22Violations(page);

    // 6. Tap-to-place first mango (zero dragging): 8 -> 9 in frame
    await page.getByTestId("outside-token-0").click();
    await page.getByTestId("frame-slot-8").click();
    await expect(page.getByTestId("counting-in-frame-badge")).toContainText("៩");

    // 7. Mid-lesson numeral toggle (១២៣ -> 123) preserves active step state (9 in frame!)
    await page.locator('[data-testid="numeral-toggle"]:visible').click();
    await expect(page.getByTestId("step-prompt")).toContainText("8");
    await expect(page.getByTestId("counting-in-frame-badge")).toContainText("9");
    await expect(page.getByTestId("counting-outside-badge")).toContainText("4");

    // Toggle back to Khmer numerals (123 -> ១២៣) and verify state still preserved
    await page.locator('[data-testid="numeral-toggle"]:visible').click();
    await expect(page.getByTestId("counting-in-frame-badge")).toContainText("៩");

    // 8. Tap-to-place second mango: 9 -> 10 in frame (3 outside, total 13)
    await page.getByTestId("outside-token-0").click();
    await page.getByTestId("frame-slot-9").click();
    await expect(page.getByTestId("counting-in-frame-badge")).toContainText("១០");

    await page.getByTestId("check-answer-btn").click();
    await expect(page.getByTestId("step-explanation")).toBeVisible();
    await expectNoWcag22Violations(page);
    await page.getByTestId("continue-btn").click();

    // 9. Step 2: Number Line (9 + 6 via 10 = 15) — tap-to-place only!
    await expect(page.getByTestId("step-counter")).toContainText("២ / ៣");
    await expectAllManipulativeTargetsAtLeast56px(page);
    await expectNoWcag22Violations(page);

    await page.getByTestId("tick-10").click();
    await expect(page.getByTestId("number-line-value-badge")).toContainText("១០");
    await page.getByTestId("tick-15").click();
    await expect(page.getByTestId("number-line-value-badge")).toContainText("១៥");

    await page.getByTestId("check-answer-btn").click();
    await expect(page.getByTestId("step-explanation")).toBeVisible();
    await page.getByTestId("continue-btn").click();

    // 10. Step 3: Scenario Choice (7 + 5 = 7 + 3 + 2 = 12)
    await expect(page.getByTestId("step-counter")).toContainText("៣ / ៣");
    await expectAllManipulativeTargetsAtLeast56px(page);
    await expectNoWcag22Violations(page);

    await page.getByTestId("choice-option-opt-a").click();
    await page.getByTestId("check-answer-btn").click();
    await expect(page.getByTestId("step-explanation")).toBeVisible();
    await page.getByTestId("continue-btn").click();

    // 11. Calm completion summary
    await expect(page.getByTestId("lesson-summary")).toBeVisible();
    await expect(page.getByTestId("summary-mastery-tier")).toBeVisible();
    await expectNoWcag22Violations(page);
  });

  test("Offline mode completes lesson steps and persists mastery to IndexedDB", async ({
    page,
    context,
  }) => {
    // Load Lesson 7 while online
    await page.goto("/learn/l07-making-ten");
    await expect(page.getByTestId("step-prompt")).toBeVisible();

    // Switch browser context offline mid-lesson
    await context.setOffline(true);

    // Complete Step 1 offline via tap-to-place
    await page.getByTestId("outside-token-0").click();
    await page.getByTestId("frame-slot-8").click();
    await page.getByTestId("outside-token-0").click();
    await page.getByTestId("frame-slot-9").click();
    await page.getByTestId("check-answer-btn").click();
    await expect(page.getByTestId("continue-btn")).toBeVisible();
    await page.getByTestId("continue-btn").click();

    // Complete Step 2 offline (9 -> 10 -> 15)
    await page.getByTestId("tick-10").click();
    await page.getByTestId("tick-15").click();
    await page.getByTestId("check-answer-btn").click();
    await expect(page.getByTestId("continue-btn")).toBeVisible();
    await page.getByTestId("continue-btn").click();

    // Complete Step 3 offline
    await page.getByTestId("choice-option-opt-a").click();
    await page.getByTestId("check-answer-btn").click();
    await expect(page.getByTestId("continue-btn")).toBeVisible();
    await page.getByTestId("continue-btn").click();

    // Summary shows up offline
    await expect(page.getByTestId("lesson-summary")).toBeVisible();

    // Verify IndexedDB actually contains saved progress & outbox entry
    const idbCheck = await page.evaluate(async () => {
      return new Promise<{ progressCount: number; outboxCount: number; savedLessonId: string | null }>(
        (resolve, reject) => {
          const req = window.indexedDB.open("konleuh-kanit-db", 1);
          req.onerror = () => reject(req.error);
          req.onsuccess = () => {
            const db = req.result;
            const tx = db.transaction(["progress", "syncOutbox"], "readonly");
            const pReq = tx.objectStore("progress").getAll();
            const oReq = tx.objectStore("syncOutbox").getAll();
            tx.oncomplete = () => {
              const pList = pReq.result as Array<{ lessonId: string; masteryTier: string }>;
              const oList = oReq.result as unknown[];
              const l7 = pList.find((item) => item.lessonId === "l07-making-ten");
              resolve({
                progressCount: pList.length,
                outboxCount: oList.length,
                savedLessonId: l7?.lessonId ?? null,
              });
            };
          };
        }
      );
    });

    expect(idbCheck.progressCount).toBeGreaterThanOrEqual(1);
    expect(idbCheck.savedLessonId).toBe("l07-making-ten");
    expect(idbCheck.outboxCount).toBeGreaterThanOrEqual(1);

    // Restore online status cleanly
    await context.setOffline(false);
  });

  test("Milestone 2: 10-lesson path, 4 new SVG primitives (L3, L9, L10), >=56px targets, mastery badges, and WCAG 2.2 AA", async ({
    page,
  }) => {
    // 1. Verify all 10 lessons & mastery badges on /learn
    await page.goto("/learn");
    await expect(page.getByTestId("mastery-badges-section")).toBeVisible();
    const lessonIds = [
      "l01-counting-1-5",
      "l02-zero-and-ten-frame",
      "l03-comparing-numbers",
      "l04-number-line-0-10",
      "l05-addition-to-10",
      "l06-subtraction-within-10",
      "l07-making-ten",
      "l08-tens-and-ones-99",
      "l09-patterns-and-shapes",
      "l10-riel-money-and-halves",
    ];
    for (const id of lessonIds) {
      await expect(page.getByTestId(`lesson-card-${id}`)).toBeVisible();
    }
    await expectNoWcag22Violations(page);

    // 2. Lesson 3 (comparison-balance: >, <, balance 6=6)
    await page.goto("/learn/l03-comparing-numbers");
    await expectAllManipulativeTargetsAtLeast56px(page);
    await expectNoWcag22Violations(page);
    await page.getByTestId("compare-op-gt").click();
    await page.getByTestId("check-answer-btn").click();
    await page.getByTestId("continue-btn").click();

    await expectAllManipulativeTargetsAtLeast56px(page);
    await page.getByTestId("compare-op-lt").click();
    await page.getByTestId("check-answer-btn").click();
    await page.getByTestId("continue-btn").click();

    await expectAllManipulativeTargetsAtLeast56px(page);
    await page.getByTestId("balance-add-2").click();
    await expect(page.getByTestId("balance-right-total")).toContainText("៦");
    await page.getByTestId("check-answer-btn").click();
    await page.getByTestId("continue-btn").click();
    await expect(page.getByTestId("lesson-summary")).toBeVisible();

    // 3. Lesson 9 (pattern-sequence krama + fraction-bar-shape 2D + array-groups + skip counting)
    await page.goto("/learn/l09-patterns-and-shapes");
    await expectAllManipulativeTargetsAtLeast56px(page);
    await expectNoWcag22Violations(page);
    // Tap-to-place krama pattern: red -> slot 0, blue -> slot 1
    await page.getByTestId("pattern-tile-red").click();
    await page.getByTestId("pattern-slot-0").click();
    await page.getByTestId("pattern-tile-blue").click();
    await page.getByTestId("pattern-slot-1").click();
    await page.getByTestId("check-answer-btn").click();
    await page.getByTestId("continue-btn").click();

    // Step 2: 2D shape identify (triangle)
    await expectAllManipulativeTargetsAtLeast56px(page);
    await expectNoWcag22Violations(page);
    await page.getByTestId("shape-option-shape-tri").click();
    await page.getByTestId("check-answer-btn").click();
    await page.getByTestId("continue-btn").click();

    // Step 3: array-groups (2 x 3 = 6, starts at 1 x 2)
    await expectAllManipulativeTargetsAtLeast56px(page);
    await expectNoWcag22Violations(page);
    await page.getByTestId("array-rows-inc").click();
    await page.getByTestId("array-cols-inc").click();
    await expect(page.getByTestId("array-product-badge")).toContainText("៦");
    await page.getByTestId("check-answer-btn").click();
    await page.getByTestId("continue-btn").click();

    // Step 4: skip counting 2, 4, 6, 8
    await expectAllManipulativeTargetsAtLeast56px(page);
    await page.getByTestId("pattern-tile-8").click();
    await page.getByTestId("pattern-slot-0").click();
    await page.getByTestId("check-answer-btn").click();
    await page.getByTestId("continue-btn").click();
    await expect(page.getByTestId("lesson-summary")).toBeVisible();

    // 4. Lesson 10 (banknote-builder + fraction-bar-shape 1/2 and 2/4 = 1/2)
    await page.goto("/learn/l10-riel-money-and-halves");
    await expectAllManipulativeTargetsAtLeast56px(page);
    await expectNoWcag22Violations(page);
    await page.getByTestId("banknote-500").click();
    await page.getByTestId("banknote-500").click();
    await page.getByTestId("check-answer-btn").click();
    await page.getByTestId("continue-btn").click();

    await page.getByTestId("choice-option-opt-500").click();
    await page.getByTestId("check-answer-btn").click();
    await page.getByTestId("continue-btn").click();

    // Step 3: Shade 1/2
    await expectAllManipulativeTargetsAtLeast56px(page);
    await expectNoWcag22Violations(page);
    await page.getByTestId("fraction-part-0").click();
    await page.getByTestId("check-answer-btn").click();
    await page.getByTestId("continue-btn").click();

    // Step 4: Shade 2/4 (= 1/2)
    await expectAllManipulativeTargetsAtLeast56px(page);
    await expectNoWcag22Violations(page);
    await page.getByTestId("fraction-part-0").click();
    await page.getByTestId("fraction-part-1").click();
    await page.getByTestId("check-answer-btn").click();
    await page.getByTestId("continue-btn").click();
    await expect(page.getByTestId("lesson-summary")).toBeVisible();

    // 5. Return to /learn and verify earned mastery badges unlocked!
    await page.goto("/learn");
    await expect(page.getByTestId("badge-first-step")).toHaveAttribute(
      "data-earned",
      "true"
    );
    await expect(page.getByTestId("badge-pattern-explorer")).toHaveAttribute(
      "data-earned",
      "true"
    );
    await expect(page.getByTestId("badge-riel-fraction-pro")).toHaveAttribute(
      "data-earned",
      "true"
    );
    await expectNoWcag22Violations(page);
  });

  test("Milestone 3: Khmer audio read-aloud toggle, /daily visual puzzle, and /review Leitner due queue (WCAG 2.2 AA)", async ({
    page,
  }) => {
    // 1. Audio read-aloud button & persistent toggle in LessonPlayer
    await page.goto("/learn/l01-counting-1-5");
    const readBtn = page.getByTestId("audio-read-btn");
    const audioToggle = page.locator('[data-testid="audio-toggle"]:visible');
    await expect(readBtn).toBeVisible();
    await expect(audioToggle).toHaveAttribute("aria-pressed", "true");
    await readBtn.click();
    await expectNoWcag22Violations(page);

    // Toggle audio off and verify read button disables & persists across reload
    await audioToggle.click();
    await expect(audioToggle).toHaveAttribute("aria-pressed", "false");
    await expect(readBtn).toBeDisabled();
    await page.reload();
    await expect(
      page.locator('[data-testid="audio-toggle"]:visible')
    ).toHaveAttribute("aria-pressed", "false");
    // Re-enable audio
    await page.locator('[data-testid="audio-toggle"]:visible').click();
    await expect(
      page.locator('[data-testid="audio-toggle"]:visible')
    ).toHaveAttribute("aria-pressed", "true");

    // 2. Daily Visual Puzzle (/daily) renders decoupled puzzle with WCAG 2.2 AA & >=56px targets
    await page.goto("/daily");
    await expect(page.getByTestId("daily-prompt")).toBeVisible();
    await expect(page.getByTestId("audio-read-btn")).toBeVisible();
    await expectAllManipulativeTargetsAtLeast56px(page);
    await expectNoWcag22Violations(page);

    // Reveal a hint calmly on /daily
    await page.getByTestId("daily-hint-btn").click();
    await expect(page.getByTestId("daily-hint-drawer")).toBeVisible();

    // 3. Automated Leitner due-review queue (/review) surfaces overdue lessons from IndexedDB
    await page.goto("/learn");
    await expect(page.getByTestId("daily-puzzle-card")).toBeVisible();
    await expect(page.getByTestId("review-queue-card")).toBeVisible();

    // Seed a guest profile + overdue lesson in IndexedDB
    await page.evaluate(async () => {
      const profileId = "review-test-student";
      window.localStorage.setItem("konleuh-kanit:active-profile-id", profileId);
      await new Promise<void>((resolve, reject) => {
        const req = window.indexedDB.open("konleuh-kanit-db", 1);
        req.onerror = () => reject(req.error);
        req.onsuccess = () => {
          const db = req.result;
          const tx = db.transaction(["profiles", "progress"], "readwrite");
          tx.objectStore("profiles").put({
            id: profileId,
            displayName: "សុខា",
            avatarId: "lotus",
            ageYears: 7,
            gradeLevel: 1,
            numeralPreference: "km",
            audioEnabled: true,
            weeklyGoalDays: 3,
            activeDates: ["2026-11-23"],
            totalXp: 40,
            createdAt: "2026-11-20T00:00:00.000Z",
            updatedAt: "2026-11-23T00:00:00.000Z",
          });
          tx.objectStore("progress").put({
            id: `${profileId}:l07-making-ten`,
            studentId: profileId,
            lessonId: "l07-making-ten",
            masteryTier: "familiar",
            leitnerBox: 2,
            nextReviewAt: "2020-01-01T00:00:00.000Z",
            accuracyPct: 85,
            hintsUsed: 1,
            attemptsCount: 1,
            completedStepIds: ["l07-s1-concrete", "l07-s2-iconic-line", "l07-s3-symbolic-explain"],
            completedAt: "2019-12-30T00:00:00.000Z",
            updatedAt: "2019-12-30T00:00:00.000Z",
          });
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        };
      });
    });

    await page.goto("/review");
    await expect(
      page.getByTestId("due-review-item-l07-making-ten")
    ).toBeVisible();
    await expectNoWcag22Violations(page);
  });

  test("Milestone 4: Unrestricted Grades 3-5 Geometry & Decimals paths and PIN/math-gated /parent dashboard (WCAG 2.2 AA)", async ({
    page,
  }) => {
    // 1. Switch paths freely on /learn
    await page.goto("/learn");
    await page.getByTestId("path-tab-geometry-foundations").click();
    await expect(
      page.getByTestId("lesson-card-g02-grid-area-arrays")
    ).toBeVisible();
    await page.getByTestId("path-tab-fractions-and-decimals").click();
    await expect(
      page.getByTestId("lesson-card-f03-comparing-decimals")
    ).toBeVisible();
    await expectNoWcag22Violations(page);

    // 2. Open Grade 5 Decimals lesson (0.5 > 0.35 worked-error-check)
    await page.getByTestId("lesson-card-f03-comparing-decimals").click();
    await expect(page).toHaveURL(/\/learn\/f03-comparing-decimals$/);
    await expectAllManipulativeTargetsAtLeast56px(page);
    await expectNoWcag22Violations(page);

    // 3. Unlock Parent Progress Dashboard with Khmer numerals "៥៦" (7 x 8 = 56)
    await page.goto("/parent");
    await expectNoWcag22Violations(page);
    await page.getByTestId("parent-gate-input").fill("៥៦");
    await page.getByTestId("parent-unlock-btn").click();
    await expect(page.getByTestId("parent-dashboard-content")).toBeVisible();
    await expectNoWcag22Violations(page);
  });

  test("Milestone 5: Authenticated Khmer Admin Content Studio with live validation, ZWSP sanitizer, preview, and publish (WCAG 2.2 AA)", async ({
    page,
  }) => {
    await page.goto("/admin");
    await expectNoWcag22Violations(page);

    // 1. Authenticate with default local studio passcode
    await page.getByTestId("admin-passcode-input").fill("soun-admin");
    await page.getByTestId("admin-login-btn").click();
    await expect(page.getByTestId("admin-studio-workspace")).toBeVisible();
    await expect(page.getByTestId("admin-validation-status")).toContainText(
      "Schema ត្រឹមត្រូវ"
    );
    await expect(page.getByTestId("admin-live-preview")).toBeVisible();
    await expectNoWcag22Violations(page);

    // 2. Inject stray U+200B into JSON and verify audit + one-tap sanitizer
    const editor = page.getByTestId("admin-json-editor");
    const original = await editor.inputValue();
    await editor.fill(original.replace('"titleKm": "', '"titleKm": "\u200B'));
    await expect(page.getByTestId("admin-strip-zwsp-btn")).toBeVisible();
    await page.getByTestId("admin-strip-zwsp-btn").click();
    await expect(page.getByTestId("admin-zwsp-status")).toContainText("០");

    // 3. Publish validated lesson via Server Action
    await page.getByTestId("admin-publish-btn").click();
    await expect(page.getByTestId("admin-publish-result")).toBeVisible();
    await expectNoWcag22Violations(page);
  });

  test("Milestone 6: Living Khmer Garden (/garden) and Market Stall + Krama Weaver (/play) at 360x800 (WCAG 2.2 AA)", async ({
    page,
  }) => {
    // 1. Living Khmer Garden (/garden)
    await page.goto("/learn");
    await page.getByTestId("garden-card").click();
    await expect(page).toHaveURL(/\/garden$/);
    await expectAllManipulativeTargetsAtLeast56px(page);
    await expectNoWcag22Violations(page);

    await page.getByTestId("garden-count-mango-btn").click();
    await expect(page.getByTestId("garden-status-message")).toContainText("១");
    await page.getByTestId("garden-hop-frog-btn").click();
    await page.getByTestId("garden-bloom-lotus-btn").click();
    await expectNoWcag22Violations(page);

    // 2. Interactive Play Studio (/play) — Cambodian Market Stall
    await page.goto("/play");
    await expect(page.getByTestId("market-stall-panel")).toBeVisible();
    await expectAllManipulativeTargetsAtLeast56px(page);
    await expectNoWcag22Violations(page);

    // Order 1 asks for 2 mangoes totaling 1,000៛
    await page.getByTestId("market-fruit-inc").click();
    await page.getByTestId("market-fruit-inc").click();
    await page.getByTestId("market-note-500").click();
    await page.getByTestId("market-note-500").click();
    await page.getByTestId("market-serve-btn").click();
    await expect(page.getByTestId("market-feedback")).toContainText("អរគុណ");
    await expect(page.getByTestId("market-next-btn")).toBeVisible();

    // 3. Switch to Krama Pattern Weaver & weave an AB pattern
    await page.getByTestId("play-tab-krama").click();
    await expect(page.getByTestId("krama-weaver-panel")).toBeVisible();
    await expectAllManipulativeTargetsAtLeast56px(page);
    await page.getByTestId("krama-preset-ab").click();
    await page.getByTestId("krama-check-btn").click();
    await expect(page.getByTestId("krama-result-panel")).toContainText("AB");
    await expectNoWcag22Violations(page);

    // 4. Switch to Frog Pond Target Jump (3 -> 10 via +5, +2)
    await page.getByTestId("play-tab-frog").click();
    await expect(page.getByTestId("frog-jump-panel")).toBeVisible();
    await expectAllManipulativeTargetsAtLeast56px(page);
    await page.getByTestId("frog-jump-p5").click();
    await page.getByTestId("frog-jump-p2").click();
    await expect(page.getByTestId("frog-win-banner")).toBeVisible();
    await expectNoWcag22Violations(page);

    // 5. Switch to Mystery Balance Scale (? + 3 = 8 -> stone 5)
    await page.getByTestId("play-tab-scale").click();
    await expect(page.getByTestId("mystery-scale-panel")).toBeVisible();
    await expectAllManipulativeTargetsAtLeast56px(page);
    await page.getByTestId("scale-stone-5").click();
    await expect(page.getByTestId("scale-win-banner")).toBeVisible();
    await expectNoWcag22Violations(page);

    // 6. Verify 4th path (Multiplication, Division & Algebra) on /learn
    await page.goto("/learn");
    await page.getByTestId("path-tab-multiplication-and-algebra").click();
    await expect(
      page.getByTestId("lesson-card-m03-balance-scale-algebra")
    ).toBeVisible();
    await expectNoWcag22Violations(page);
  });

  test("Milestone 7: Geometry Drawing Lesson (g05) and /play Drawing Studio at 360x800 (WCAG 2.2 AA)", async ({
    page,
  }) => {
    // 1. Open Lesson g05 (Geometry Drawing & Symmetry)
    await page.goto("/learn/g05-drawing-shapes-and-symmetry");
    await expect(page.getByTestId("draw-status-badge")).toBeVisible();
    await expectAllManipulativeTargetsAtLeast56px(page);
    await expectNoWcag22Violations(page);

    // Step 1: Draw a closed triangle by tapping pegs
    await page.getByTestId("draw-peg-0-0").click();
    await page.getByTestId("draw-peg-0-2").click();
    await page.getByTestId("draw-peg-2-1").click();
    await page.getByTestId("draw-peg-0-0").click();
    await page.getByTestId("check-answer-btn").click();
    await expect(page.getByTestId("continue-btn")).toBeVisible();
    await page.getByTestId("continue-btn").click();

    // Step 2: Draw a closed square
    await page.getByTestId("draw-peg-0-0").click();
    await page.getByTestId("draw-peg-0-2").click();
    await page.getByTestId("draw-peg-2-2").click();
    await page.getByTestId("draw-peg-2-0").click();
    await page.getByTestId("draw-peg-0-0").click();
    await page.getByTestId("check-answer-btn").click();
    await expect(page.getByTestId("continue-btn")).toBeVisible();
    await page.getByTestId("continue-btn").click();

    // Step 3: Mirror-symmetry butterfly wing painting
    await expectAllManipulativeTargetsAtLeast56px(page);
    await expectNoWcag22Violations(page);
    for (const id of [
      "draw-cell-0-3",
      "draw-cell-1-3",
      "draw-cell-1-2",
      "draw-cell-2-3",
      "draw-cell-2-2",
      "draw-cell-3-3",
    ]) {
      await page.getByTestId(id).click();
    }
    await page.getByTestId("check-answer-btn").click();
    await expect(page.getByTestId("continue-btn")).toBeVisible();
    await page.getByTestId("continue-btn").click();

    // Step 4: Paint exact area = 6 square units
    for (const id of [
      "draw-cell-0-0",
      "draw-cell-0-1",
      "draw-cell-0-2",
      "draw-cell-1-0",
      "draw-cell-1-1",
      "draw-cell-1-2",
    ]) {
      await page.getByTestId(id).click();
    }
    await page.getByTestId("check-answer-btn").click();
    await expect(page.getByTestId("continue-btn")).toBeVisible();
    await page.getByTestId("continue-btn").click();
    await expect(page.getByTestId("lesson-summary")).toBeVisible();
    await expectNoWcag22Violations(page);

    // 2. Open /play -> Drawing Studio tab -> complete Geoboard triangle + Butterfly symmetry
    await page.goto("/play");
    await page.getByTestId("play-tab-draw").click();
    await expect(page.getByTestId("draw-studio-panel")).toBeVisible();
    await expectAllManipulativeTargetsAtLeast56px(page);
    await expectNoWcag22Violations(page);

    await page.getByTestId("draw-peg-0-0").click();
    await page.getByTestId("draw-peg-0-2").click();
    await page.getByTestId("draw-peg-2-1").click();
    await page.getByTestId("draw-peg-0-0").click();
    await page.getByTestId("play-draw-check-btn").click();
    await expect(page.getByTestId("play-draw-next-btn")).toBeVisible();

    await page.getByTestId("play-draw-sub-symmetry").click();
    await expectAllManipulativeTargetsAtLeast56px(page);
    for (const id of [
      "draw-cell-0-3",
      "draw-cell-1-3",
      "draw-cell-1-2",
      "draw-cell-2-3",
      "draw-cell-2-2",
      "draw-cell-3-3",
    ]) {
      await page.getByTestId(id).click();
    }
    await page.getByTestId("play-draw-check-btn").click();
    await expect(page.getByTestId("play-draw-next-btn")).toBeVisible();
    await expectNoWcag22Violations(page);
  });

  test("Milestone 8: Persistent Khmer Navigation Menus, Interactive Filter, and 5 New Lessons (g06, g07, l11, f05, m05) at 360x800 (WCAG 2.2 AA)", async ({
    page,
  }) => {
    // 1. Verify persistent bottom navigation menu across hubs
    await page.goto("/learn");
    await expect(page.getByTestId("app-bottom-nav")).toBeVisible();
    await expectNoWcag22Violations(page);

    await page.getByTestId("nav-tab-play").click();
    await expect(page).toHaveURL(/\/play$/);
    await expect(page.getByTestId("app-bottom-nav")).toBeVisible();
    await expectNoWcag22Violations(page);

    await page.getByTestId("nav-tab-garden").click();
    await expect(page).toHaveURL(/\/garden$/);
    await expectNoWcag22Violations(page);

    // 2. Open expandable More Menu and jump to /review
    await page.getByTestId("nav-more-btn").click();
    await expect(page.getByTestId("nav-more-menu")).toBeVisible();
    await expectNoWcag22Violations(page);
    await page.getByTestId("nav-more-link-review").click();
    await expect(page).toHaveURL(/\/review$/);
    await expectNoWcag22Violations(page);

    // 3. Return to /learn via bottom nav and filter for interactive drawing lessons
    await page.getByTestId("nav-tab-learn").click();
    await expect(page).toHaveURL(/\/learn$/);
    await page.getByTestId("filter-mode-drawing").click();
    await expect(
      page.getByTestId("lesson-card-g06-rectangles-and-area-design")
    ).toBeVisible();
    await expect(
      page.getByTestId("lesson-card-g07-angkor-symmetry-and-shapes")
    ).toBeVisible();
    await expect(
      page.getByTestId("lesson-card-f05-halves-quarters-and-draw-fractions")
    ).toBeVisible();
    await expect(
      page.getByTestId("lesson-card-m05-skip-counting-and-mystery-puzzles")
    ).toBeVisible();
    await expectNoWcag22Violations(page);

    // 4. Launch Lesson g06 -> verify global bottom nav auto-hides in focus mode and complete Step 1 (rectangle)
    await page
      .getByTestId("lesson-card-g06-rectangles-and-area-design")
      .click();
    await expect(page).toHaveURL(/\/learn\/g06-rectangles-and-area-design$/);
    await expect(page.getByTestId("app-bottom-nav")).toHaveCount(0);
    await expectAllManipulativeTargetsAtLeast56px(page);
    await expectNoWcag22Violations(page);

    await page.getByTestId("draw-peg-0-0").click();
    await page.getByTestId("draw-peg-0-3").click();
    await page.getByTestId("draw-peg-2-3").click();
    await page.getByTestId("draw-peg-2-0").click();
    await page.getByTestId("draw-peg-0-0").click();
    await page.getByTestId("check-answer-btn").click();
    await expect(page.getByTestId("continue-btn")).toBeVisible();

    // 5. Verify l11 and m05 render cleanly at 360x800 with >= 56px targets
    await page.goto("/learn/l11-khmer-market-change-and-place-value");
    await expectAllManipulativeTargetsAtLeast56px(page);
    await expectNoWcag22Violations(page);

    await page.goto("/learn/m05-skip-counting-and-mystery-puzzles");
    await expectAllManipulativeTargetsAtLeast56px(page);
    await expectNoWcag22Violations(page);
  });

  test("Milestone 9: ClockTime (t01), DataChart (t03), /play Frog Clock, Lesson Scratchpad, Spoken Hints, and Printable Certificate at 360x800 (WCAG 2.2 AA)", async ({
    page,
  }) => {
    // 1. Open 5th path (Time, Measurement & Data) on /learn and launch t01
    await page.goto("/learn");
    await page.getByTestId("path-tab-time-measurement-data").click();
    await expect(
      page.getByTestId("lesson-card-t01-telling-time-khmer-clock")
    ).toBeVisible();
    await expect(
      page.getByTestId("lesson-card-t03-market-bar-charts")
    ).toBeVisible();
    await expectNoWcag22Violations(page);

    // 2. Lesson t01: Test Scratchpad + Spoken Hints + ClockTime (5:00 -> 7:00)
    await page.getByTestId("lesson-card-t01-telling-time-khmer-clock").click();
    await expect(page).toHaveURL(/\/learn\/t01-telling-time-khmer-clock$/);
    await expectAllManipulativeTargetsAtLeast56px(page);
    await expectNoWcag22Violations(page);

    // Toggle on-screen scratchpad and add tally dots without resetting clock state
    await page.getByTestId("scratchpad-toggle-btn").click();
    await expect(page.getByTestId("lesson-scratchpad-panel")).toBeVisible();
    await page.getByTestId("scratchpad-tally-btn").click();
    await expectNoWcag22Violations(page);

    // Reveal hint tier 1 and verify spoken Khmer hint button
    await page.getByTestId("hint-btn").click();
    await expect(page.getByTestId("hint-audio-btn-1")).toBeVisible();
    await expectNoWcag22Violations(page);

    // Set 5:00 -> 7:00 (+1 hour twice) and check explanation audio button
    await page.getByTestId("clock-hour-inc").click();
    await page.getByTestId("clock-hour-inc").click();
    await expect(page.getByTestId("clock-digital-readout")).toContainText("០៧:០០");
    await page.getByTestId("check-answer-btn").click();
    await expect(page.getByTestId("explanation-audio-btn")).toBeVisible();
    await expect(page.getByTestId("continue-btn")).toBeVisible();

    // 3. Lesson t03: DataChart (build mango=6, orange=4 -> read tallest lotus)
    await page.goto("/learn/t03-market-bar-charts");
    await expectAllManipulativeTargetsAtLeast56px(page);
    await expectNoWcag22Violations(page);
    for (let i = 0; i < 5; i++) {
      await page.getByTestId("chart-inc-mango").click();
    }
    for (let i = 0; i < 3; i++) {
      await page.getByTestId("chart-inc-orange").click();
    }
    await page.getByTestId("check-answer-btn").click();
    await expect(page.getByTestId("continue-btn")).toBeVisible();
    await page.getByTestId("continue-btn").click();

    await expectAllManipulativeTargetsAtLeast56px(page);
    await page.getByTestId("chart-select-lotus").click();
    await page.getByTestId("check-answer-btn").click();
    await expect(page.getByTestId("continue-btn")).toBeVisible();
    await expectNoWcag22Violations(page);

    // 4. Play Studio -> 6th tab Frog's Daily Clock (5:00 -> 7:00)
    await page.goto("/play");
    await page.getByTestId("play-tab-clock").click();
    await expect(page.getByTestId("clock-game-panel")).toBeVisible();
    await expectAllManipulativeTargetsAtLeast56px(page);
    await page.getByTestId("clock-hour-inc").click();
    await page.getByTestId("clock-hour-inc").click();
    await page.getByTestId("play-clock-check-btn").click();
    await expect(page.getByTestId("play-clock-next-btn")).toBeVisible();
    await expectNoWcag22Violations(page);

    // 5. Printable Offline Khmer Achievement Certificate in /garden
    await page.goto("/garden");
    await page.getByTestId("open-certificate-btn").click();
    await expect(page.getByTestId("certificate-preview")).toBeVisible();
    await expect(page.getByTestId("print-certificate-btn")).toBeVisible();
    await expectNoWcag22Violations(page);
  });

  test("Milestone 10: Mobile Touch UX, Scroll-Safe Tap Targets, Non-Crushing Header, Drag-Paint Symmetry, Wobble-Tap & Zero Overflow at 360x800", async ({
    page,
  }) => {
    const expectZeroHorizontalOverflow = async (label: string) => {
      const metrics = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        innerWidth: window.innerWidth,
      }));
      expect(
        metrics.scrollWidth,
        `${label} should not overflow horizontally (${metrics.scrollWidth} > ${metrics.innerWidth})`
      ).toBeLessThanOrEqual(metrics.innerWidth);
    };

    // 1. Verify zero horizontal overflow across primary hub routes at 360x800
    for (const route of ["/", "/learn", "/play", "/garden", "/daily", "/review", "/parent", "/admin"]) {
      await page.goto(route);
      await expectZeroHorizontalOverflow(route);
    }

    // 2. Verify LessonPlayer header never crushes or overlaps on 360px phones (even with "បិទសំឡេង")
    await page.goto("/learn/l07-making-ten");
    await expectZeroHorizontalOverflow("/learn/l07-making-ten");

    // Toggle audio off ("បិទសំឡេង" is wider than "សំឡេង")
    await page.getByTestId("audio-toggle").click();
    await expect(page.getByTestId("audio-toggle")).toContainText("បិទសំឡេង");
    await expectZeroHorizontalOverflow("/learn/l07-making-ten (audio off)");

    const exitBox = await page.getByTestId("lesson-exit-btn").boundingBox();
    const audioBox = await page.getByTestId("audio-toggle").boundingBox();
    const numBox = await page.getByTestId("numeral-toggle").boundingBox();
    const stepBox = await page.getByTestId("step-counter").boundingBox();
    expect(exitBox).not.toBeNull();
    expect(audioBox).not.toBeNull();
    expect(numBox).not.toBeNull();
    expect(stepBox).not.toBeNull();
    // Row 1 controls must not overlap horizontally, and step counter sits cleanly on Row 2 below Row 1
    expect(exitBox!.x + exitBox!.width).toBeLessThanOrEqual(audioBox!.x + 1);
    expect(audioBox!.x + audioBox!.width).toBeLessThanOrEqual(numBox!.x + 1);
    expect(stepBox!.y).toBeGreaterThanOrEqual(exitBox!.y + exitBox!.height - 2);

    // 3. Verify touch-action separation: tap buttons use manipulation, draggable tokens use none
    const checkBtnTouchAction = await page
      .getByTestId("check-answer-btn")
      .evaluate((el) => window.getComputedStyle(el).touchAction);
    expect(checkBtnTouchAction).toBe("manipulation");

    const tokenTouchAction = await page
      .getByTestId("outside-token-0")
      .evaluate((el) => window.getComputedStyle(el).touchAction);
    expect(tokenTouchAction).toBe("none");

    // 4. CountingStage: slight finger drift (8px) during tap still selects token, and pointercancel recovers
    const tok0 = page.getByTestId("outside-token-0");
    const tokBox = await tok0.boundingBox();
    expect(tokBox).not.toBeNull();
    const cx = tokBox!.x + tokBox!.width / 2;
    const cy = tokBox!.y + tokBox!.height / 2;

    await tok0.dispatchEvent("pointerdown", {
      pointerId: 1,
      clientX: cx,
      clientY: cy,
      isPrimary: true,
    });
    await tok0.dispatchEvent("pointermove", {
      pointerId: 1,
      clientX: cx + 6,
      clientY: cy + 5,
      isPrimary: true,
    });
    await tok0.dispatchEvent("pointerup", {
      pointerId: 1,
      clientX: cx + 6,
      clientY: cy + 5,
      isPrimary: true,
    });
    await expect(tok0).toHaveAttribute("aria-pressed", "true");

    // Simulate pointercancel during drag and verify token remains interactive
    await tok0.dispatchEvent("pointerdown", {
      pointerId: 2,
      clientX: cx,
      clientY: cy,
      isPrimary: true,
    });
    await tok0.dispatchEvent("pointermove", {
      pointerId: 2,
      clientX: cx,
      clientY: cy - 80,
      isPrimary: true,
    });
    await tok0.dispatchEvent("pointercancel", {
      pointerId: 2,
      clientX: cx,
      clientY: cy - 80,
      isPrimary: true,
    });
    await page.getByTestId("frame-slot-8").click();
    await expect(page.getByTestId("counting-in-frame-badge")).toContainText("៩");

    // 5. PlaceValueBlocks (l08): verify non-overlapping >=56px targets and zero horizontal overflow
    await page.goto("/learn/l08-tens-and-ones-99");
    await expectZeroHorizontalOverflow("/learn/l08-tens-and-ones-99");
    await expectAllManipulativeTargetsAtLeast56px(page);
    const removeTenBox = await page.getByTestId("pv-remove-ten").boundingBox();
    const addTenBox = await page.getByTestId("pv-add-ten").boundingBox();
    expect(removeTenBox).not.toBeNull();
    expect(addTenBox).not.toBeNull();
    expect(removeTenBox!.x + removeTenBox!.width).toBeLessThanOrEqual(
      addTenBox!.x + 1
    );
    await expectNoWcag22Violations(page);

    // 6. GeometryDraw (Play Studio -> Symmetry mode): continuous single-finger drag paints multiple cells
    await page.goto("/play");
    await page.getByTestId("play-tab-draw").click();
    await page.getByTestId("play-draw-sub-symmetry").click();
    await expectZeroHorizontalOverflow("/play (draw symmetry)");

    const cell03 = page.getByTestId("draw-cell-0-3");
    const cell13 = page.getByTestId("draw-cell-1-3");
    const box03 = await cell03.boundingBox();
    const box13 = await cell13.boundingBox();
    expect(box03).not.toBeNull();
    expect(box13).not.toBeNull();

    await cell03.dispatchEvent("pointerdown", {
      pointerId: 5,
      clientX: box03!.x + box03!.width / 2,
      clientY: box03!.y + box03!.height / 2,
      isPrimary: true,
    });
    const drawSvg = page.locator('[aria-label="ក្ដារគូររូបគណិត"]');
    await drawSvg.dispatchEvent("pointermove", {
      pointerId: 5,
      clientX: box13!.x + box13!.width / 2,
      clientY: box13!.y + box13!.height / 2,
      isPrimary: true,
    });
    await drawSvg.dispatchEvent("pointerup", {
      pointerId: 5,
      clientX: box13!.x + box13!.width / 2,
      clientY: box13!.y + box13!.height / 2,
      isPrimary: true,
    });

    await expect(cell03).toHaveAttribute("aria-pressed", "true");
    await expect(cell13).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId("draw-area-badge")).toContainText("២");
    await expectNoWcag22Violations(page);
  });

  test("Milestone 11: Playful Tactile 3D Kid UI, Mascot Prompt Bubble, Sprouting Bud, Treat Time, Direct-Touch Garden, Crayon Swatches & 1024x768 Landscape Workspace (WCAG 2.2 AA)", async ({
    page,
  }) => {
    // 1. Candy-colored 3D lesson tiles & 1-3 star mastery indicators on 360x800 mobile
    await page.goto("/learn");
    const firstCard = page.getByTestId("lesson-card-l01-counting-1-5");
    await expect(firstCard).toHaveAttribute("data-candy", "sun");
    await expect(page.getByTestId("mastery-stars-l01-counting-1-5")).toBeVisible();
    await expectNoWcag22Violations(page);

    // 2. Direct-Touch Living Garden Habitat (/garden) & All Garden Friends Collection Grid
    await page.goto("/garden");
    await expectAllManipulativeTargetsAtLeast56px(page);
    await expect(page.getByTestId("garden-collection-grid")).toBeVisible();
    await expect(page.getByTestId("garden-friend-pond-frog")).toHaveAttribute(
      "data-unlocked",
      "true"
    );
    await expect(page.getByTestId("garden-friend-emerald-turtle")).toHaveAttribute(
      "data-unlocked",
      "false"
    );

    // Tap directly on the SVG pond frog, mangoes, lotus flowers, and butterflies
    await page.getByTestId("garden-canvas-frog").click();
    await expect(page.getByTestId("garden-speech-bubble")).toContainText("ប្ល៊ុប");
    await expect(page.getByTestId("garden-floating-heart")).toBeVisible();

    await page.getByTestId("garden-canvas-mango").click();
    await expect(page.getByTestId("garden-speech-bubble")).toContainText("ស្វាយទុំ");
    await expect(page.getByTestId("garden-status-message")).toContainText("១");

    await page.getByTestId("garden-canvas-lotus").click();
    await expect(page.getByTestId("garden-speech-bubble")).toContainText("ផ្កាឈូករីក");

    await page.getByTestId("garden-canvas-butterfly").click();
    await expect(page.getByTestId("garden-speech-bubble")).toContainText("មេអំបៅ");
    await expectNoWcag22Violations(page);

    // 3. Play Studio (/play) circular lifted crayon swatches
    await page.goto("/play");
    await page.getByTestId("play-tab-draw").click();
    const pinkCrayon = page.getByTestId("draw-crayon-pink");
    await expect(pinkCrayon).toBeVisible();
    await pinkCrayon.click();
    await expect(pinkCrayon).toHaveAttribute("aria-pressed", "true");
    await expectNoWcag22Violations(page);

    // 4. Switch to 1024x768 landscape tablet/desktop viewport: verify left side rail nav & 2-column lesson workspace
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto("/learn");
    const navRailBox = await page.getByTestId("app-bottom-nav").boundingBox();
    expect(navRailBox).not.toBeNull();
    expect(navRailBox!.x).toBeLessThanOrEqual(4);
    expect(navRailBox!.width).toBeLessThanOrEqual(120);
    expect(navRailBox!.height).toBeGreaterThanOrEqual(700);
    await expectNoWcag22Violations(page);

    // Open Lesson 7 on 1024x768 landscape and verify side-by-side 2-column workspace + sprouting bud meter
    await page.goto("/learn/l07-making-ten");
    await expect(page.getByTestId("mascot-prompt-bubble")).toBeVisible();
    await expect(page.getByTestId("step-dot-indicator")).toBeVisible();
    await expect(page.getByTestId("sprouting-bud-meter")).toHaveAttribute(
      "data-stage",
      "1"
    );
    await expect(page.getByTestId("step-dot-1")).toHaveAttribute(
      "data-status",
      "active"
    );

    const boardBox = await page.getByTestId("lesson-math-board").boundingBox();
    const bubbleBox = await page.getByTestId("mascot-prompt-bubble").boundingBox();
    expect(boardBox).not.toBeNull();
    expect(bubbleBox).not.toBeNull();
    // Math board sits in left column; mascot prompt bubble & controls sit in right column
    expect(boardBox!.x + boardBox!.width).toBeLessThanOrEqual(bubbleBox!.x + 4);
    await expectNoWcag22Violations(page);

    // Complete Step 1 and verify step dot 1 marks completed & sprouting bud advances stage
    await page.getByTestId("outside-token-0").click();
    await page.getByTestId("frame-slot-8").click();
    await page.getByTestId("outside-token-0").click();
    await page.getByTestId("frame-slot-9").click();
    await page.getByTestId("check-answer-btn").click();
    await expect(page.getByTestId("step-dot-1")).toHaveAttribute(
      "data-status",
      "completed"
    );
    await expect(page.getByTestId("sprouting-bud-meter")).toHaveAttribute(
      "data-stage",
      "2"
    );
    await expect(page.getByTestId("mascot-celebration-pill")).toBeVisible();
    await page.getByTestId("continue-btn").click();

    // Complete Step 2 & Step 3 to reach "Treat Time" celebration
    await page.getByTestId("tick-10").click();
    await page.getByTestId("tick-15").click();
    await page.getByTestId("check-answer-btn").click();
    await page.getByTestId("continue-btn").click();

    await page.getByTestId("choice-option-opt-a").click();
    await page.getByTestId("check-answer-btn").click();
    await page.getByTestId("continue-btn").click();

    // 5. Verify interactive "Treat Time" frog-feeding celebration (0 -> 3 hearts + golden crown)
    await expect(page.getByTestId("lesson-summary")).toBeVisible();
    await expect(page.getByTestId("treat-time-stage")).toBeVisible();
    await expect(page.getByTestId("treat-hearts")).toHaveAttribute(
      "data-filled",
      "0"
    );

    const feedBtn = page.getByTestId("feed-mascot-btn");
    await feedBtn.click();
    await expect(page.getByTestId("treat-hearts")).toHaveAttribute(
      "data-filled",
      "1"
    );
    await feedBtn.click();
    await expect(page.getByTestId("treat-hearts")).toHaveAttribute(
      "data-filled",
      "2"
    );
    await feedBtn.click();
    await expect(page.getByTestId("treat-hearts")).toHaveAttribute(
      "data-filled",
      "3"
    );
    await expect(page.getByTestId("mascot-crown")).toBeVisible();
    await expectNoWcag22Violations(page);
  });

  test("Milestone 12: 360x640 Short Mobile Sticky Action Dock, Same-Frame Synchronous Touch Drag/Tap, and Clean Service Worker Precache (WCAG 2.2 AA)", async ({
    page,
    request,
  }) => {
    // 1. Verify /sw.js precache manifest never includes raw bracketed route literals like /learn/[lessonId]
    const swRes = await request.get("/sw.js");
    expect(swRes.ok()).toBe(true);
    const swText = await swRes.text();
    expect(swText).not.toContain("/learn/[lessonId]");
    expect(swText).not.toContain("/learn/%5BlessonId%5D");

    // 2. Emulate a compact 360x640 mobile phone viewport (typical mobile browser with address/nav bars visible)
    await page.setViewportSize({ width: 360, height: 640 });
    await page.goto("/learn");
    await page.getByTestId("lesson-card-l07-making-ten").click();
    await expect(page).toHaveURL(/\/learn\/l07-making-ten$/);

    // 3. Verify sticky bottom action dock keeps Check Answer & Hint buttons inside the 640px mobile viewport without scrolling
    const checkBtn = page.getByTestId("check-answer-btn");
    await expect(checkBtn).toBeVisible();
    const checkBox = await checkBtn.boundingBox();
    expect(checkBox).not.toBeNull();
    expect(
      checkBox!.y + checkBox!.height,
      `Sticky check button bottom (${checkBox!.y + checkBox!.height}) must sit inside 640px mobile viewport`
    ).toBeLessThanOrEqual(640);
    await expectNoWcag22Violations(page);

    // 4. Same-frame synchronous touch drag on CountingStage (pointerdown -> pointermove -> pointerup in one JS turn)
    await page.evaluate(() => {
      const tok = document.querySelector(
        '[data-testid="outside-token-0"]'
      ) as SVGGElement | null;
      const slot = document.querySelector(
        '[data-testid="frame-slot-8"]'
      ) as SVGGElement | null;
      if (!tok || !slot) throw new Error("Missing token or slot");
      const tokRect = tok.getBoundingClientRect();
      const slotRect = slot.getBoundingClientRect();
      const startX = tokRect.left + tokRect.width / 2;
      const startY = tokRect.top + tokRect.height / 2;
      const endX = slotRect.left + slotRect.width / 2;
      const endY = slotRect.top + slotRect.height / 2;

      tok.dispatchEvent(
        new PointerEvent("pointerdown", {
          bubbles: true,
          pointerId: 11,
          clientX: startX,
          clientY: startY,
          isPrimary: true,
        })
      );
      tok.dispatchEvent(
        new PointerEvent("pointermove", {
          bubbles: true,
          pointerId: 11,
          clientX: endX,
          clientY: endY,
          isPrimary: true,
        })
      );
      tok.dispatchEvent(
        new PointerEvent("pointerup", {
          bubbles: true,
          pointerId: 11,
          clientX: endX,
          clientY: endY,
          isPrimary: true,
        })
      );
    });
    await expect(page.getByTestId("counting-in-frame-badge")).toContainText("៩");

    // 5. Same-frame synchronous stroke on LessonScratchpad
    await page.getByTestId("scratchpad-toggle-btn").click();
    await expect(page.getByTestId("lesson-scratchpad-panel")).toBeVisible();
    await page.evaluate(() => {
      const padSvg = document.querySelector(
        '[data-testid="lesson-scratchpad-panel"] svg'
      ) as SVGSVGElement | null;
      if (!padSvg) throw new Error("Missing scratchpad svg");
      const r = padSvg.getBoundingClientRect();
      padSvg.dispatchEvent(
        new PointerEvent("pointerdown", {
          bubbles: true,
          pointerId: 12,
          clientX: r.left + 30,
          clientY: r.top + 30,
        })
      );
      padSvg.dispatchEvent(
        new PointerEvent("pointermove", {
          bubbles: true,
          pointerId: 12,
          clientX: r.left + 90,
          clientY: r.top + 60,
        })
      );
      padSvg.dispatchEvent(
        new PointerEvent("pointerup", {
          bubbles: true,
          pointerId: 12,
          clientX: r.left + 90,
          clientY: r.top + 60,
        })
      );
    });
    await expect(
      page.locator('[data-testid="lesson-scratchpad-panel"] svg polyline')
    ).toHaveCount(1);
    await page.getByTestId("scratchpad-toggle-btn").click();

    // Complete Step 1 and advance to Step 2 (NumberLine)
    await page.getByTestId("outside-token-0").click();
    await page.getByTestId("frame-slot-9").click();
    await page.getByTestId("check-answer-btn").click();
    const continueBtn = page.getByTestId("continue-btn");
    await expect(continueBtn).toBeVisible();
    const continueBox = await continueBtn.boundingBox();
    expect(continueBox).not.toBeNull();
    expect(continueBox!.y + continueBox!.height).toBeLessThanOrEqual(640);
    await continueBtn.click();

    // 6. Same-frame synchronous marker drag on NumberLine (Step 2: 9 -> 10)
    await page.evaluate(() => {
      const marker = document.querySelector(
        '[data-testid="number-line-marker"]'
      ) as SVGGElement | null;
      const tick10 = document.querySelector(
        '[data-testid="tick-10"]'
      ) as SVGGElement | null;
      if (!marker || !tick10) throw new Error("Missing marker or tick-10");
      const mRect = marker.getBoundingClientRect();
      const tRect = tick10.getBoundingClientRect();
      marker.dispatchEvent(
        new PointerEvent("pointerdown", {
          bubbles: true,
          pointerId: 15,
          clientX: mRect.left + mRect.width / 2,
          clientY: mRect.top + mRect.height / 2,
        })
      );
      marker.dispatchEvent(
        new PointerEvent("pointermove", {
          bubbles: true,
          pointerId: 15,
          clientX: tRect.left + tRect.width / 2,
          clientY: tRect.top + tRect.height / 2,
        })
      );
      marker.dispatchEvent(
        new PointerEvent("pointerup", {
          bubbles: true,
          pointerId: 15,
          clientX: tRect.left + tRect.width / 2,
          clientY: tRect.top + tRect.height / 2,
        })
      );
    });
    await expect(page.getByTestId("number-line-value-badge")).toContainText(
      "១០"
    );
    await expectNoWcag22Violations(page);
  });
});
