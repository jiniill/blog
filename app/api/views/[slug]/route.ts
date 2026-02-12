import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getSupabaseClient } from "@/lib/supabase";

export const runtime = "edge";

const VALID_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_SLUG_LENGTH = 200;

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  if (!slug || slug.length > MAX_SLUG_LENGTH || !VALID_SLUG.test(slug)) {
    return NextResponse.json(
      { error: "유효하지 않은 slug입니다." },
      { status: 400 },
    );
  }

  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";
  const ipHash = await hashIp(ip);

  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc("increment_view_count", {
    page_slug: slug,
    viewer_ip_hash: ipHash,
  });

  if (error) {
    console.error("조회수 증가 실패:", error.message);
    return NextResponse.json(
      { error: "조회수를 기록할 수 없습니다." },
      { status: 502 },
    );
  }

  return NextResponse.json({ count: data ?? 0 });
}

async function hashIp(ip: string): Promise<string> {
  const data = new TextEncoder().encode(ip);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
