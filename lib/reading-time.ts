const AVERAGE_WORD_COUNT_PER_MINUTE = 265;

const READING_TIME_BUCKETS = [
  {
    maxWordCount: AVERAGE_WORD_COUNT_PER_MINUTE - 1,
    label: "짧게 읽기",
  },
  {
    maxWordCount: AVERAGE_WORD_COUNT_PER_MINUTE * 3 - 1,
    label: "가볍게 읽기",
  },
  {
    maxWordCount: AVERAGE_WORD_COUNT_PER_MINUTE * 6 - 1,
    label: "천천히 읽기",
  },
] as const;

export function getReadingTimeLabelByWordCount(wordCount: number) {
  if (wordCount <= 0) {
    return null;
  }

  const matchedBucket = READING_TIME_BUCKETS.find((bucket) => {
    return wordCount <= bucket.maxWordCount;
  });
  if (matchedBucket) {
    return matchedBucket.label;
  }

  return "깊이 읽기";
}
