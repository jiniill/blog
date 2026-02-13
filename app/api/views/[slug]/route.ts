import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getSupabaseClient } from "@/lib/supabase";

export const runtime = "edge";

const VALID_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_SLUG_LENGTH = 200;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 30;

interface RateLimitEntry {
  requests: number[];
  expiresAt: number;
}

const edgeGlobal = globalThis as typeof globalThis & {
  __viewRateLimiter?: Map<string, RateLimitEntry>;
};
const rateLimitStore = edgeGlobal.__viewRateLimiter ?? new Map();
edgeGlobal.__viewRateLimiter = rateLimitStore;

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  /* 요청 파라미터를 검증합니다. */
  const { slug } = await params;

  if (!slug || slug.length > MAX_SLUG_LENGTH || !VALID_SLUG.test(slug)) {
    return NextResponse.json(
      { error: "유효하지 않은 slug입니다." },
      { status: 400 },
    );
  }

  /* 헤더 우선순위에 따라 클라이언트 IP를 해석합니다. */
  const headerStore = await headers();
  const ip = resolveClientIp(headerStore);
  const ipHash = await hashIp(ip);

  /* Edge 런타임에서는 격리 인스턴스 단위로만 제한이 적용됩니다(분산 미지원). */
  if (isRateLimited(ipHash)) {
    return NextResponse.json(
      { error: "요청이 너무 많습니다." },
      { status: 429 },
    );
  }

  /* 조회수 증가 RPC를 호출합니다. */
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

function resolveClientIp(headerStore: Headers): string {
  const realIp = headerStore.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  const forwarded = headerStore.get("x-forwarded-for");
  const forwardedIp = forwarded?.split(",")[0]?.trim();
  if (forwardedIp) return forwardedIp;

  return "unknown";
}

function isRateLimited(ipHash: string): boolean {
  /* 만료된 엔트리를 먼저 정리합니다. */
  const now = Date.now();
  cleanupExpiredEntries(now);

  /* 첫 요청이면 바로 기록하고 통과시킵니다. */
  const entry = rateLimitStore.get(ipHash);
  if (!entry) {
    rateLimitStore.set(ipHash, {
      requests: [now],
      expiresAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return false;
  }

  /* 슬라이딩 윈도우(최근 60초) 구간의 요청만 유지합니다. */
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const recentRequests = entry.requests.filter(
    (requestedAt: number) => requestedAt > windowStart,
  );

  /* 허용량을 넘겼으면 현재 요청을 차단합니다. */
  if (recentRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
    entry.requests = recentRequests;
    entry.expiresAt = recentRequests[0] + RATE_LIMIT_WINDOW_MS;
    return true;
  }

  /* 허용량 이내면 현재 요청을 반영하고 통과시킵니다. */
  recentRequests.push(now);
  entry.requests = recentRequests;
  entry.expiresAt = now + RATE_LIMIT_WINDOW_MS;
  return false;
}

function cleanupExpiredEntries(now: number) {
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.expiresAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}

async function hashIp(ip: string): Promise<string> {
  const data = new TextEncoder().encode(ip);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
