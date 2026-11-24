import { describe, expect, it } from "vitest";
import {
  auditLessonObjectZwsp,
  stripAllZwspFromJson,
} from "@/lib/khmer/zwspAudit";

describe("ZWSP (U+200B) audit and sanitizer", () => {
  it("reports zero findings on clean lesson objects", () => {
    const res = auditLessonObjectZwsp({
      id: "l01-counting-1-5",
      titleKm: "រាប់ចំនួន ១ ដល់ ៥",
    });
    expect(res.totalZwspCount).toBe(0);
    expect(res.blockingCount).toBe(0);
    expect(res.findings).toEqual([]);
  });

  it("flags blocking U+200B in identifiers and counts advisory prose occurrences", () => {
    const dirty = {
      id: "l01-\u200Bcounting",
      titleKm: "រាប់\u200Bចំនួន",
      steps: [
        {
          id: "s1",
          solution: { expectedSlotValues: ["red\u200B"] },
        },
      ],
    };
    const res = auditLessonObjectZwsp(dirty);
    expect(res.totalZwspCount).toBe(3);
    expect(res.blockingCount).toBe(2);
    expect(res.findings.length).toBe(3);

    const cleanedJson = stripAllZwspFromJson(JSON.stringify(dirty));
    const reAudit = auditLessonObjectZwsp(JSON.parse(cleanedJson));
    expect(reAudit.totalZwspCount).toBe(0);
    expect(reAudit.blockingCount).toBe(0);
  });
});
