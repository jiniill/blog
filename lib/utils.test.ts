import { describe, expect, it } from "vitest";
import { formatDate, toDate, toDateTimestamp } from "@/lib/utils";

describe("lib/utils 날짜 유틸", () => {
  it("YYYY-MM-DD 포맷은 타임존과 무관하게 동일한 날짜를 출력한다", () => {
    expect(formatDate("2026-02-12")).toBe("2026년 2월 12일");
  });

  it("YYYY-MM-DD 입력은 UTC 기준 자정 타임스탬프로 변환한다", () => {
    expect(toDateTimestamp("2026-02-12")).toBe(
      Date.parse("2026-02-12T00:00:00.000Z"),
    );
  });

  it("시간 정보가 포함된 ISO 문자열은 원래 시각을 유지한다", () => {
    const isoDateTime = "2026-02-12T10:30:00.000Z";
    expect(toDate(isoDateTime).toISOString()).toBe(isoDateTime);
  });
});
