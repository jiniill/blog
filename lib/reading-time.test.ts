import { describe, expect, it } from "vitest";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { getReadingTimeLabel, getReadingTimeMinutes } from "@/lib/reading-time";

const readingTimeDict = dictionaries.ko.readingTime;

describe("getReadingTimeMinutes", () => {
  it("한국어만 있는 경우 글자 수 기준으로 계산한다", () => {
    expect(getReadingTimeMinutes(500, 0)).toBe(1);
    expect(getReadingTimeMinutes(1500, 0)).toBe(3);
  });

  it("영어만 있는 경우 단어 수 기준으로 계산한다", () => {
    expect(getReadingTimeMinutes(0, 265)).toBe(1);
    expect(getReadingTimeMinutes(0, 795)).toBe(3);
  });

  it("한국어+영어 혼합 시 합산한다", () => {
    // 250/500 + 133/265 ≈ 1.002 → ceil = 2
    expect(getReadingTimeMinutes(250, 133)).toBe(2);
  });

  it("최소 1분을 반환한다", () => {
    expect(getReadingTimeMinutes(1, 0)).toBe(1);
  });
});

describe("getReadingTimeLabel", () => {
  it("내용이 없으면 라벨을 반환하지 않는다", () => {
    expect(getReadingTimeLabel(0, 0, readingTimeDict)).toBeNull();
  });

  it("1분 이하: 짧게 읽기", () => {
    expect(getReadingTimeLabel(400, 0, readingTimeDict)).toBe("짧게 읽기");
  });

  it("2-3분: 가볍게 읽기", () => {
    expect(getReadingTimeLabel(1000, 0, readingTimeDict)).toBe("가볍게 읽기");
    expect(getReadingTimeLabel(1500, 0, readingTimeDict)).toBe("가볍게 읽기");
  });

  it("4-6분: 천천히 읽기", () => {
    expect(getReadingTimeLabel(2000, 0, readingTimeDict)).toBe("천천히 읽기");
    expect(getReadingTimeLabel(3000, 0, readingTimeDict)).toBe("천천히 읽기");
  });

  it("7분 이상: 깊이 읽기", () => {
    expect(getReadingTimeLabel(4000, 0, readingTimeDict)).toBe("깊이 읽기");
  });
});
