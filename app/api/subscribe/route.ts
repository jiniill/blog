import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getSupabaseClient } from "@/lib/supabase";
import { sendEmail, getWelcomeEmail } from "@/lib/resend";

export const runtime = "edge";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 3;

interface RateLimitEntry {
  requests: number[];
  expiresAt: number;
}

const edgeGlobal = globalThis as typeof globalThis & {
  __subscribeRateLimiter?: Map<string, RateLimitEntry>;
};
const rateLimitStore = edgeGlobal.__subscribeRateLimiter ?? new Map();
edgeGlobal.__subscribeRateLimiter = rateLimitStore;

export async function POST(request: Request) {
  /* 요청 본문에서 이메일을 추출하고 검증합니다. */
  let email: string;
  try {
    const body = await request.json();
    email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  } catch {
    return NextResponse.json(
      { error: "잘못된 요청 형식입니다." },
      { status: 400 },
    );
  }

  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json(
      { error: "유효한 이메일 주소를 입력해주세요." },
      { status: 400 },
    );
  }

  /* IP 기반 레이트 리미팅을 적용합니다. */
  const headerStore = await headers();
  const ip = resolveClientIp(headerStore);
  const ipHash = await hashIp(ip);

  if (isRateLimited(ipHash)) {
    return NextResponse.json(
      { error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
      { status: 429 },
    );
  }

  /* Supabase에 구독자를 저장합니다. */
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("subscribers")
    .insert({ email, ip_hash: ipHash })
    .select("unsubscribe_token")
    .single();

  if (error) {
    /* 중복 이메일(unique constraint violation) */
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "이미 구독 중인 이메일입니다." },
        { status: 409 },
      );
    }
    console.error("구독자 저장 실패:", error.message);
    return NextResponse.json(
      { error: "구독 처리 중 오류가 발생했습니다." },
      { status: 502 },
    );
  }

  /* 환영 이메일을 발송합니다. 실패해도 구독은 성공 처리합니다. */
  try {
    const welcome = getWelcomeEmail(data.unsubscribe_token);
    await sendEmail({
      to: email,
      subject: welcome.subject,
      html: welcome.html,
      text: welcome.text,
    });
  } catch (emailError) {
    console.error("환영 이메일 발송 실패:", emailError);
  }

  return NextResponse.json({ success: true });
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
  const now = Date.now();
  cleanupExpiredEntries(now);

  const entry = rateLimitStore.get(ipHash);
  if (!entry) {
    rateLimitStore.set(ipHash, {
      requests: [now],
      expiresAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return false;
  }

  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const recentRequests = entry.requests.filter(
    (requestedAt: number) => requestedAt > windowStart,
  );

  if (recentRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
    entry.requests = recentRequests;
    entry.expiresAt = recentRequests[0] + RATE_LIMIT_WINDOW_MS;
    return true;
  }

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
