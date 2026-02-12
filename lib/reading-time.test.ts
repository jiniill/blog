import { describe, expect, it } from "vitest";
import { getReadingTimeLabelByWordCount } from "@/lib/reading-time";

describe("lib/reading-time 구간 라벨", () => {
  it("0 이하 단어 수는 라벨을 반환하지 않는다", () => {
    expect(getReadingTimeLabelByWordCount(0)).toBeNull();
  });

  it("1분 이하 구간을 반환한다", () => {
    expect(getReadingTimeLabelByWordCount(264)).toBe("짧게 읽기");
  });

  it("2-3분 구간을 반환한다", () => {
    expect(getReadingTimeLabelByWordCount(265)).toBe("가볍게 읽기");
    expect(getReadingTimeLabelByWordCount(794)).toBe("가볍게 읽기");
  });

  it("4-6분 구간을 반환한다", () => {
    expect(getReadingTimeLabelByWordCount(795)).toBe("천천히 읽기");
    expect(getReadingTimeLabelByWordCount(1589)).toBe("천천히 읽기");
  });

  it("최대 구간 초과 시 7분 이상 라벨을 반환한다", () => {
    expect(getReadingTimeLabelByWordCount(1590)).toBe("깊이 읽기");
  });
});
