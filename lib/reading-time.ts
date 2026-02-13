const CJK_CHARS_PER_MINUTE = 500;
const ENGLISH_WORDS_PER_MINUTE = 265;

const READING_TIME_LABELS = [
  { maxMinutes: 1, label: "짧게 읽기" },
  { maxMinutes: 3, label: "가볍게 읽기" },
  { maxMinutes: 6, label: "천천히 읽기" },
] as const;

export function getReadingTimeMinutes(charCount: number, wordCount: number) {
  const cjkMinutes = charCount / CJK_CHARS_PER_MINUTE;
  const englishMinutes = wordCount / ENGLISH_WORDS_PER_MINUTE;
  return Math.max(1, Math.ceil(cjkMinutes + englishMinutes));
}

export function getReadingTimeLabel(charCount: number, wordCount: number) {
  if (charCount <= 0 && wordCount <= 0) {
    return null;
  }

  const minutes = getReadingTimeMinutes(charCount, wordCount);

  const matched = READING_TIME_LABELS.find(
    (bucket) => minutes <= bucket.maxMinutes,
  );

  return matched?.label ?? "깊이 읽기";
}
