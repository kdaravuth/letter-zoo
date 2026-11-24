export interface KramaPatternAnalysis {
  isComplete: boolean;
  isRepeating: boolean;
  patternCode: string | null; // e.g. "AB", "ABB", "ABC", "AABB", "AAAA"
  period: number | null;
  messageKm: string;
}

const LETTERS = ["A", "B", "C", "D"] as const;

/**
 * Analyzes an 8-slot woven Krama sequence to detect clean repeating math patterns
 * (e.g. AB, ABB, ABC, AABB, AAAA) and returns joyful Khmer pedagogical feedback.
 */
export function detectKramaPattern(
  slots: Array<string | null>
): KramaPatternAnalysis {
  if (slots.length === 0 || slots.some((s) => !s)) {
    return {
      isComplete: false,
      isRepeating: false,
      patternCode: null,
      period: null,
      messageKm: "សូមបំពេញពណ៌ទាំង ៨ ប្រឡោះសិន ដើម្បីពិនិត្យលំនាំក្រមារបស់អ្នក!",
    };
  }

  const filled = slots as string[];
  const uniqueColors = new Set(filled);

  // Assign canonical letters A, B, C, D by first appearance
  const toCanonicalCode = (unit: string[]): string => {
    const map = new Map<string, string>();
    let next = 0;
    return unit
      .map((color) => {
        if (!map.has(color)) {
          map.set(color, LETTERS[next % LETTERS.length]);
          next++;
        }
        return map.get(color)!;
      })
      .join("");
  };

  if (uniqueColors.size === 1) {
    return {
      isComplete: true,
      isRepeating: true,
      patternCode: "AAAA",
      period: 1,
      messageKm:
        "ក្រមាពណ៌តែមួយស្អាតណាស់! សាកប្រើ ២ ឬ ៣ ពណ៌ឆ្លាស់គ្នាដើម្បីបង្កើតលំនាំ AB ឬ ABC ផងណា៎!",
    };
  }

  // Check smallest repeating period 2..4 across the full length
  for (let period = 2; period <= 4; period++) {
    let matches = true;
    for (let i = period; i < filled.length; i++) {
      if (filled[i] !== filled[i % period]) {
        matches = false;
        break;
      }
    }
    if (matches) {
      const unit = filled.slice(0, period);
      const code = toCanonicalCode(unit);
      return {
        isComplete: true,
        isRepeating: true,
        patternCode: code,
        period,
        messageKm: `អស្ចារ្យណាស់! អ្នកបានត្បាញលំនាំក្រមាគណិតប្រភេទ «${code}» ដែលកើតឡើងដដែលៗយ៉ាងស្អាត!`,
      };
    }
  }

  return {
    isComplete: true,
    isRepeating: false,
    patternCode: null,
    period: null,
    messageKm:
      "ក្រមានេះមានពណ៌ចម្រុះស្រស់ស្អាត! បើចង់បានលំនាំគណិតដដែលៗ សាកដាក់ពណ៌ឆ្លាស់ដូច ក្រហម–ខៀវ–ក្រហម–ខៀវ (AB) ណា៎!",
  };
}
