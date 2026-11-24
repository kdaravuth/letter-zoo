import { describe, expect, it } from "vitest";
import {
  formatDisplayNumber,
  formatTextNumerals,
  normalizeNumericInput,
  stripZwsp,
  toArabicDigits,
  toKhmerDigits,
} from "@/lib/khmer/numerals";

describe("Khmer numeral conversion and ZWSP normalization", () => {
  it("converts Arabic digits to Khmer digits accurately", () => {
    expect(toKhmerDigits(0)).toBe("០");
    expect(toKhmerDigits(1234567890)).toBe("១២៣៤៥៦៧៨៩០");
    expect(toKhmerDigits("8 + 5 = 13")).toBe("៨ + ៥ = ១៣");
  });

  it("converts Khmer digits to Arabic digits accurately", () => {
    expect(toArabicDigits("០")).toBe("0");
    expect(toArabicDigits("១២៣៤៥៦៧៨៩០")).toBe("1234567890");
    expect(toArabicDigits("៨ + ៥ = ១៣")).toBe("8 + 5 = 13");
  });

  it("formats numbers and embedded numerals in Khmer text by preference", () => {
    expect(formatDisplayNumber(15, "km")).toBe("១៥");
    expect(formatDisplayNumber(15, "latn")).toBe("15");
    expect(formatDisplayNumber("១៥", "latn")).toBe("15");

    const prompt = "ដារ៉ាមានស្វាយ ៨ ផ្លែ និង ៥ ផ្លែ";
    expect(formatTextNumerals(prompt, "latn")).toBe(
      "ដារ៉ាមានស្វាយ 8 ផ្លែ និង 5 ផ្លែ"
    );
    expect(
      formatTextNumerals("ដារ៉ាមានស្វាយ 8 ផ្លែ និង 5 ផ្លែ", "km")
    ).toBe(prompt);
  });

  it("strips U+200B ZWSP characters without touching visible Khmer text", () => {
    const withZwsp = "សួន\u200Bគណិត\u200B១៣";
    expect(stripZwsp(withZwsp)).toBe("សួនគណិត១៣");
    expect(stripZwsp("១\u200B៣")).toBe("១៣");
  });

  it("normalizes Khmer, Arabic, mixed, and ZWSP-containing numeric inputs identically", () => {
    expect(normalizeNumericInput(13)).toBe(13);
    expect(normalizeNumericInput("13")).toBe(13);
    expect(normalizeNumericInput("១៣")).toBe(13);
    expect(normalizeNumericInput("១\u200B៣")).toBe(13);
    expect(normalizeNumericInput("\u200B 1\u200B3 \u200B")).toBe(13);
    expect(normalizeNumericInput("១,០០០")).toBe(1000);
    expect(normalizeNumericInput("1\u20605")).toBe(15);
    expect(normalizeNumericInput("-7")).toBe(-7);
    expect(normalizeNumericInput("៣.៥")).toBe(3.5);
  });

  it("returns null for non-numeric or empty inputs", () => {
    expect(normalizeNumericInput("")).toBeNull();
    expect(normalizeNumericInput("\u200B   ")).toBeNull();
    expect(normalizeNumericInput("ស្វាយ")).toBeNull();
    expect(normalizeNumericInput(Number.NaN)).toBeNull();
  });
});
