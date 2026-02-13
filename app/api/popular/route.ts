import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export const runtime = "edge";

// 홈 화면의 인기 글 영역은 상위 5개까지만 노출합니다.
const POPULAR_POST_LIMIT = 5;
// 인기 글 집계는 실시간 엄격성이 낮아 1시간 CDN 캐시를 허용합니다.
const CACHE_MAX_AGE_SECONDS = 60 * 60;
const CACHE_HEADERS = {
  "Cache-Control": `public, s-maxage=${CACHE_MAX_AGE_SECONDS}`,
};

interface PopularRow {
  slug: string;
  count: number | string | null;
}

function normalizeCount(count: PopularRow["count"]) {
  const numericCount = typeof count === "number" ? count : Number(count ?? 0);
  return Number.isFinite(numericCount) ? numericCount : 0;
}

export async function GET() {
  /* 조회수 집계 테이블에서 상위 slug를 조회합니다. */
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("view_count")
    .select("slug, count")
    .order("count", { ascending: false })
    .limit(POPULAR_POST_LIMIT);

  /* Supabase 조회 실패 시 명시적으로 오류를 반환합니다. */
  if (error) {
    console.error("인기 글 조회 실패:", error.message);
    return NextResponse.json(
      { error: "인기 글을 불러올 수 없습니다." },
      { status: 502, headers: CACHE_HEADERS },
    );
  }

  /* 응답 직렬화를 위해 count 타입을 number로 정규화합니다. */
  const items = (data ?? []).map((row: PopularRow) => ({
    slug: row.slug,
    count: normalizeCount(row.count),
  }));

  return NextResponse.json({ items }, { headers: CACHE_HEADERS });
}
