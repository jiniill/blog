import { siteConfig } from "@/lib/site-config";

const RESEND_API_URL = "https://api.resend.com/emails";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY 환경 변수가 설정되지 않았습니다.");
  }

  const from =
    process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html, text }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend API 오류 (${response.status}): ${body}`);
  }

  return response.json();
}

export function getWelcomeEmail(unsubscribeToken: string) {
  const unsubscribeUrl = `${siteConfig.url}/api/unsubscribe?token=${unsubscribeToken}`;
  const blogName = siteConfig.title;

  const html = `<!DOCTYPE html>
<html lang="ko">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:8px;border:1px solid #e5e7eb">
    <tr>
      <td style="padding:40px 32px;text-align:center">
        <h1 style="margin:0 0 16px;font-size:24px;color:#111827">${blogName}</h1>
        <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#374151">
          구독해 주셔서 감사합니다!<br>
          새로운 글이 발행되면 이메일로 알려드릴게요.
        </p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
        <p style="margin:0;font-size:12px;color:#9ca3af">
          더 이상 받고 싶지 않으시면
          <a href="${unsubscribeUrl}" style="color:#6b7280;text-decoration:underline">구독 취소</a>할 수 있습니다.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `${blogName}

구독해 주셔서 감사합니다!
새로운 글이 발행되면 이메일로 알려드릴게요.

구독 취소: ${unsubscribeUrl}`;

  return {
    subject: `${blogName} 구독을 환영합니다!`,
    html,
    text,
  };
}
