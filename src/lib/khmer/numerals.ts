export type NumeralPreference = "km" | "latn";

const KHMER_DIGITS = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"] as const;

const KHMER_TO_ARABIC_MAP: Record<string, string> = {
  "០": "0",
  "១": "1",
  "២": "2",
  "៣": "3",
  "៤": "4",
  "៥": "5",
  "៦": "6",
  "៧": "7",
  "៨": "8",
  "៩": "9",
};

/**
 * Strips all U+200B (Zero-Width Space) characters safely before comparison,
 * search, or mathematical grading.
 */
export function stripZwsp(input: string): string {
  return input.replace(/\u200B/g, "");
}

/**
 * Converts ASCII digits (0-9) to Khmer digits (០-៩).
 */
export function toKhmerDigits(value: string | number): string {
  const str = String(value);
  return str.replace(/[0-9]/g, (digit) => KHMER_DIGITS[Number(digit)] ?? digit);
}

/**
 * Converts Khmer digits (០-៩) to ASCII/Hindu-Arabic digits (0-9).
 */
export function toArabicDigits(value: string | number): string {
  const str = String(value);
  return str.replace(/[០-៩]/g, (digit) => KHMER_TO_ARABIC_MAP[digit] ?? digit);
}

/**
 * Formats a numeric value or numeric string according to the learner's
 * numeral preference ("km" default, or "latn").
 */
export function formatDisplayNumber(
  value: number | string,
  pref: NumeralPreference = "km"
): string {
  const clean = stripZwsp(String(value));
  return pref === "km" ? toKhmerDigits(clean) : toArabicDigits(clean);
}

/**
 * Formats all digits inside arbitrary Khmer text to match the active numeral preference
 * while preserving all non-digit Khmer Unicode characters and U+2060 Word Joiners.
 */
export function formatTextNumerals(
  text: string,
  pref: NumeralPreference = "km"
): string {
  return pref === "km" ? toKhmerDigits(text) : toArabicDigits(text);
}

/**
 * Normalizes a string or number containing Khmer or Arabic digits (and possible
 * stray U+200B ZWSP characters or thousands separators) into a canonical finite number.
 * Returns null if the input cannot be parsed as a valid number.
 */
export function normalizeNumericInput(input: string | number): number | null {
  if (typeof input === "number") {
    return Number.isFinite(input) ? input : null;
  }

  const cleaned = stripZwsp(input)
    .replace(/\u2060/g, "")
    .replace(/,/g, "")
    .trim();

  if (!cleaned) {
    return null;
  }

  const arabic = toArabicDigits(cleaned);
  if (!/^[+-]?(\d+\.?\d*|\.\d+)$/.test(arabic)) {
    return null;
  }

  const parsed = Number(arabic);
  return Number.isFinite(parsed) ? parsed : null;
}
