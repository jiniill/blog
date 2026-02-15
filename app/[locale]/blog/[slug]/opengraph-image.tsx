import { ImageResponse } from "next/og";
import { getPublishedPostBySlug, getPublishedPosts } from "@/lib/posts";
import { siteConfig } from "@/lib/site-config";
import { decodeRouteParam } from "@/lib/route-params";
import {
  isValidLocale,
  locales,
  type Locale,
} from "@/lib/i18n/types";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Blog post cover";
const FONT_FAMILY = "Noto Sans KR";
const GOOGLE_FONTS_BASE_URL = "https://fonts.googleapis.com/css2";
const OG_NOT_FOUND_STYLE = {
  display: "flex",
  width: "100%",
  height: "100%",
  background: "#09090b",
  color: "#fafafa",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 48,
};

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    getPublishedPosts(locale).map((post) => ({ locale, slug: post.slug })),
  );
}

function resolveLocale(rawLocale: string): Locale | undefined {
  if (isValidLocale(rawLocale)) {
    return rawLocale;
  }

  return undefined;
}

function createNotFoundImage() {
  return new ImageResponse(
    <div style={OG_NOT_FOUND_STYLE}>Not Found</div>,
    { ...size },
  );
}

type FontWeight = 400 | 700;

const fontCache = new Map<string, Promise<ArrayBuffer>>();

function createUniqueCharacters(text: string): string {
  return [...new Set(text)].join("");
}

async function loadFont(weight: FontWeight, text: string): Promise<ArrayBuffer> {
  // 캐시 키 생성 및 조회
  const uniqueChars = createUniqueCharacters(text);
  const cacheKey = `${weight}:${uniqueChars}`;
  const cached = fontCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const fontPromise = fetchGoogleFont(weight, uniqueChars);
  fontCache.set(cacheKey, fontPromise);

  // 실패 시 오염된 캐시 정리
  try {
    return await fontPromise;
  } catch (error) {
    fontCache.delete(cacheKey);
    throw error;
  }
}

async function fetchGoogleFont(weight: FontWeight, uniqueChars: string): Promise<ArrayBuffer> {
  // Google Fonts CSS 메타데이터 조회
  const cssUrl = `${GOOGLE_FONTS_BASE_URL}?family=Noto+Sans+KR:wght@${weight}&text=${encodeURIComponent(uniqueChars)}&display=swap`;
  const cssResponse = await fetch(cssUrl);

  if (!cssResponse.ok) {
    throw new Error(`Google Fonts CSS 요청 실패: ${cssResponse.status}`);
  }

  const css = await cssResponse.text();
  const match = css.match(/src: url\((.+?)\)/);

  if (!match) {
    throw new Error("Google Fonts에서 폰트 URL을 찾을 수 없습니다");
  }

  // 실제 폰트 바이너리 다운로드
  const fontResponse = await fetch(match[1]);
  if (!fontResponse.ok) {
    throw new Error(`Google Fonts 폰트 요청 실패: ${fontResponse.status}`);
  }

  return fontResponse.arrayBuffer();
}

export default async function OGImage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  const locale = resolveLocale(rawLocale);
  if (!locale) {
    return createNotFoundImage();
  }

  const normalizedSlug = decodeRouteParam(slug);
  const post = getPublishedPostBySlug(locale, normalizedSlug);

  if (!post) {
    return createNotFoundImage();
  }

  const dateText = new Date(post.date).toISOString().split("T")[0];
  const fontTargetText = [post.title, ...post.tags, siteConfig.title, dateText].join(" ");
  const [regularFontData, boldFontData] = await Promise.all([
    loadFont(400, fontTargetText),
    loadFont(700, fontTargetText),
  ]);

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
          fontFamily: FONT_FAMILY,
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
            {dateText}
          </span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: FONT_FAMILY,
          data: regularFontData,
          weight: 400,
          style: "normal" as const,
        },
        {
          name: FONT_FAMILY,
          data: boldFontData,
          weight: 700,
          style: "normal" as const,
        },
      ],
    },
  );
}
