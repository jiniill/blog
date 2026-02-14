import type { Dictionary } from "@/lib/i18n/get-dictionary";

const CJK_CHARS_PER_MINUTE = 500;
const ENGLISH_WORDS_PER_MINUTE = 265;

const READING_TIME_KEYS = [
  { maxMinutes: 1, key: "short" },
  { maxMinutes: 3, key: "light" },
  { maxMinutes: 6, key: "moderate" },
] as const;

export function getReadingTimeMinutes(charCount: number, wordCount: number) {
  const cjkMinutes = charCount / CJK_CHARS_PER_MINUTE;
  const englishMinutes = wordCount / ENGLISH_WORDS_PER_MINUTE;
  return Math.max(1, Math.ceil(cjkMinutes + englishMinutes));
}

export function getReadingTimeLabel(
  charCount: number,
  wordCount: number,
  readingTimeDict: Dictionary["readingTime"],
) {
  if (charCount <= 0 && wordCount <= 0) {
    return null;
  }

  const minutes = getReadingTimeMinutes(charCount, wordCount);

  const matched = READING_TIME_KEYS.find(
    (bucket) => minutes <= bucket.maxMinutes,
  );

  return readingTimeDict[matched?.key ?? "deep"];
}
