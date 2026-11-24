import { stripZwsp } from "@/lib/khmer/numerals";

export interface ZwspFinding {
  path: string;
  count: number;
  isIdentifier: boolean;
}

export interface ZwspAuditResult {
  totalZwspCount: number;
  blockingCount: number;
  findings: ZwspFinding[];
}

const IDENTIFIER_KEY_NAMES = new Set([
  "id",
  "pathId",
  "topicSlug",
  "type",
  "stage",
  "moeysGradeRef",
  "correctOptionId",
  "expectedShapeId",
  "expectedOperator",
  "highlightTargetId",
]);

function walkValue(
  value: unknown,
  currentPath: string,
  keyName: string,
  findings: ZwspFinding[]
): void {
  if (typeof value === "string") {
    const matches = value.match(/\u200B/g);
    if (matches && matches.length > 0) {
      findings.push({
        path: currentPath || "(root)",
        count: matches.length,
        isIdentifier:
          IDENTIFIER_KEY_NAMES.has(keyName) ||
          currentPath.includes("expectedSlotValues"),
      });
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, idx) => {
      walkValue(item, `${currentPath}[${idx}]`, keyName, findings);
    });
    return;
  }

  if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const nextPath = currentPath ? `${currentPath}.${k}` : k;
      walkValue(v, nextPath, k, findings);
    }
  }
}

/**
 * Audits any parsed lesson JSON object for U+200B (ZWSP) characters,
 * distinguishing blocking identifier pollution from advisory text occurrences.
 */
export function auditLessonObjectZwsp(obj: unknown): ZwspAuditResult {
  const findings: ZwspFinding[] = [];
  walkValue(obj, "", "", findings);

  const totalZwspCount = findings.reduce((sum, f) => sum + f.count, 0);
  const blockingCount = findings
    .filter((f) => f.isIdentifier)
    .reduce((sum, f) => sum + f.count, 0);

  return {
    totalZwspCount,
    blockingCount,
    findings,
  };
}

/**
 * Strips all U+200B characters cleanly from a raw JSON string.
 */
export function stripAllZwspFromJson(rawJson: string): string {
  return stripZwsp(rawJson);
}
