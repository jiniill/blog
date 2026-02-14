import { ImageResponse } from "next/og";
import { getPublishedPostBySlug, getPublishedPosts } from "@/lib/posts";
import { siteConfig } from "@/lib/site-config";
import { decodeRouteParam } from "@/lib/route-params";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Blog post cover";

export function generateStaticParams() {
  return getPublishedPosts().map((post) => ({ slug: post.slug }));
}

/** 필요한 글자만 포함하여 폰트 서브셋 로드 */
async function loadFont(text: string) {
  const uniqueChars = [...new Set(text)].join("");
  const url = `https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&text=${encodeURIComponent(uniqueChars)}&display=swap`;
  const css = await fetch(url).then((r) => r.text());
  const match = css.match(/src: url\((.+?)\)/);
  if (!match) throw new Error("Google Fonts에서 폰트를 찾을 수 없습니다");
  return fetch(match[1]).then((r) => r.arrayBuffer());
}

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const normalizedSlug = decodeRouteParam(slug);
  const post = getPublishedPostBySlug(normalizedSlug);

  if (!post) {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            background: "#09090b",
            color: "#fafafa",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 48,
          }}
        >
          Not Found
        </div>
      ),
      { ...size },
    );
  }

  const allText =
    post.title + post.tags.join("") + siteConfig.title + post.description;
  const fontData = await loadFont(allText);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          padding: 60,
          background: "#09090b",
          color: "#fafafa",
          fontFamily: "Noto Sans KR",
        }}
      >
        {/* 태그 */}
        {post.tags.length > 0 && (
          <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
            {post.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 16,
                  padding: "6px 16px",
                  background: "#27272a",
                  borderRadius: 9999,
                  color: "#a1a1aa",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* 제목 */}
        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            fontSize: post.title.length > 40 ? 44 : 56,
            fontWeight: 700,
            lineHeight: 1.3,
            letterSpacing: "-0.02em",
            wordBreak: "keep-all",
          }}
        >
          {post.title}
        </div>

        {/* 하단 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid #27272a",
            paddingTop: 24,
          }}
        >
          <span style={{ fontSize: 24, fontWeight: 700, color: "#fafafa" }}>
            {siteConfig.title}
          </span>
          <span style={{ fontSize: 18, color: "#71717a" }}>
            {new Date(post.date).toISOString().split("T")[0]}
          </span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Noto Sans KR",
          data: fontData,
          weight: 700,
          style: "normal" as const,
        },
      ],
    },
  );
}
