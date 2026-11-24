import {
  formatDisplayNumber,
  normalizeNumericInput,
  type NumeralPreference,
} from "@/lib/khmer/numerals";

/**
 * Normalizes any integer hour to standard 12-hour analog clock range (1..12).
 */
export function normalizeHour12(raw: number): number {
  const mod = ((Math.round(raw) % 12) + 12) % 12;
  return mod === 0 ? 12 : mod;
}

/**
 * Normalizes minutes to 0..59.
 */
export function normalizeMinute(raw: number): number {
  return ((Math.round(raw) % 60) + 60) % 60;
}

/**
 * Formats an analog clock readout like "០៩:៣០" (Khmer) or "09:30" (Arabic).
 */
export function formatClockTime(
  hour: number,
  minute: number,
  numeralPref: NumeralPreference
): string {
  const h = String(normalizeHour12(hour)).padStart(2, "0");
  const m = String(normalizeMinute(minute)).padStart(2, "0");
  return `${formatDisplayNumber(h, numeralPref)}:${formatDisplayNumber(m, numeralPref)}`;
}

/**
 * Grades an analog clock hour/minute answer with Khmer numeral & ZWSP normalization.
 */
export function checkClockMatch(
  expectedHour: number,
  expectedMinute: number,
  rawHour: number | string,
  rawMinute: number | string
): {
  isMatch: boolean;
  hourMatch: boolean;
  minuteMatch: boolean;
  actualHour: number | null;
  actualMinute: number | null;
} {
  const parsedH = normalizeNumericInput(rawHour);
  const parsedM = normalizeNumericInput(rawMinute);
  if (parsedH === null || parsedM === null) {
    return {
      isMatch: false,
      hourMatch: false,
      minuteMatch: false,
      actualHour: null,
      actualMinute: null,
    };
  }
  const actualHour = normalizeHour12(parsedH);
  const actualMinute = normalizeMinute(parsedM);
  const targetH = normalizeHour12(expectedHour);
  const targetM = normalizeMinute(expectedMinute);

  const hourMatch = actualHour === targetH;
  const minuteMatch = actualMinute === targetM;
  return {
    isMatch: hourMatch && minuteMatch,
    hourMatch,
    minuteMatch,
    actualHour,
    actualMinute,
  };
}

/**
 * Grades a bar-chart construction answer comparing each category's height against expected counts.
 */
export function checkDataChartBars(
  expectedBarValues: Record<string, number>,
  actualBarValues: Record<string, number | string>
): {
  isMatch: boolean;
  mismatchedIds: string[];
} {
  const mismatchedIds: string[] = [];
  for (const [id, expected] of Object.entries(expectedBarValues)) {
    const actual = normalizeNumericInput(actualBarValues[id] ?? "");
    if (actual === null || actual !== expected) {
      mismatchedIds.push(id);
    }
  }
  return {
    isMatch: mismatchedIds.length === 0 && Object.keys(expectedBarValues).length > 0,
    mismatchedIds,
  };
}
