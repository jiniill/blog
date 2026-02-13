const HANGUL_RANGE: [number, number] = [0xac00, 0xd7a4];
const CJK_UNIFIED_RANGE: [number, number] = [0x4e00, 0x9fff];
const HIRAGANA_RANGE: [number, number] = [0x3040, 0x309f];
const KATAKANA_RANGE: [number, number] = [0x30a0, 0x30ff];

const CJK_RANGES: [number, number][] = [
  HANGUL_RANGE,
  CJK_UNIFIED_RANGE,
  HIRAGANA_RANGE,
  KATAKANA_RANGE,
];

function isCjkChar(code: number): boolean {
  return CJK_RANGES.some(([from, to]) => code >= from && code < to);
}

const ENGLISH_WORD_REGEX = /[a-zA-Z]+(?:['\u2019][a-zA-Z]+)*/g;

export function countContentChars(plainText: string): {
  charCount: number;
  wordCount: number;
} {
  let cjkCharCount = 0;
  const latinChars: string[] = [];

  for (const char of plainText) {
    const code = char.codePointAt(0) ?? 0;
    if (isCjkChar(code)) {
      cjkCharCount++;
      latinChars.push(" ");
    } else {
      latinChars.push(char);
    }
  }

  const englishWordCount = (latinChars.join("").match(ENGLISH_WORD_REGEX) || [])
    .length;

  return { charCount: cjkCharCount, wordCount: englishWordCount };
}
