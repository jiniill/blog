import { getSupabaseClient } from "@/lib/supabase";

export const runtime = "edge";

const TOKEN_REGEX = /^[a-f0-9]{64}$/;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function htmlResponse(title: string, message: string, status: number) {
  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>
    body{margin:0;padding:0;min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f9fafb;color:#111827}
    .card{max-width:400px;padding:40px 32px;background:#fff;border-radius:12px;border:1px solid #e5e7eb;text-align:center}
    h1{margin:0 0 12px;font-size:20px}
    p{margin:0;font-size:14px;line-height:1.6;color:#6b7280}
  </style>
</head>
<body>
  <div class="card">
    <h1>${escapeHtml(title)}</h1>
    <p>${message}</p>
  </div>
</body>
</html>`;

  return new Response(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token") ?? "";

  if (!TOKEN_REGEX.test(token)) {
    return htmlResponse(
      "잘못된 요청",
      "유효하지 않은 구독 취소 링크입니다.",
      400,
    );
  }

  const supabase = getSupabaseClient();

  /* 토큰으로 구독자를 조회합니다. */
  const { data, error: selectError } = await supabase
    .from("subscribers")
    .select("id, email, status")
    .eq("unsubscribe_token", token)
    .single();

  if (selectError || !data) {
    return htmlResponse(
      "구독자를 찾을 수 없습니다",
      "이미 구독이 취소되었거나 유효하지 않은 링크입니다.",
      404,
    );
  }

  if (data.status === "unsubscribed") {
    return htmlResponse(
      "이미 구독이 취소되었습니다",
      `${escapeHtml(data.email)} 주소의 구독은 이미 취소된 상태입니다.`,
      200,
    );
  }

  /* 구독 상태를 unsubscribed로 변경합니다. */
  const { error: updateError } = await supabase
    .from("subscribers")
    .update({ status: "unsubscribed", unsubscribed_at: new Date().toISOString() })
    .eq("id", data.id);

  if (updateError) {
    console.error("구독 취소 실패:", updateError.message);
    return htmlResponse(
      "오류가 발생했습니다",
      "구독 취소 처리 중 문제가 생겼습니다. 잠시 후 다시 시도해주세요.",
      500,
    );
  }

  return htmlResponse(
    "구독이 취소되었습니다",
    `${escapeHtml(data.email)} 주소의 구독이 정상적으로 취소되었습니다.`,
    200,
  );
}
