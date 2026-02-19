import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { PostCard } from "@/components/blog/post-card";
import { getPublishedPostsByTag, getPublishedTags } from "@/lib/posts";
import { siteConfig } from "@/lib/site-config";
import { decodeRouteParam } from "@/lib/route-params";
import {
  isValidLocale,
  locales,
  type Locale,
} from "@/lib/i18n/types";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildLocalePath } from "@/lib/seo";

interface TagPageProps {
  params: Promise<{ locale: string; tag: string }>;
}

export async function generateStaticParams() {
  return locales.flatMap((locale) =>
    getPublishedTags(locale).map((tag) => ({ locale, tag })),
  );
}

export const dynamicParams = false;

function resolveLocale(rawLocale: string): Locale {
  if (isValidLocale(rawLocale)) {
    return rawLocale;
  }

  notFound();
}

export async function generateMetadata({
  params,
}: TagPageProps): Promise<Metadata> {
  /* 요청 파라미터를 로캘/태그 값으로 정규화합니다. */
  const { locale: rawLocale, tag } = await params;
  if (!isValidLocale(rawLocale)) return {};
  const t = getDictionary(rawLocale);
  const normalizedTag = decodeRouteParam(tag);
  const canonicalPath = buildLocalePath(
    rawLocale,
    `/tags/${encodeURIComponent(normalizedTag)}`,
  );

  /* 태그 상세 페이지의 canonical과 공유 URL을 고정합니다. */
  return {
    title: `#${normalizedTag}`,
    description: t.tags.taggedPostsDescription
      .replace("{tag}", normalizedTag),
    alternates: { canonical: canonicalPath },
    openGraph: { url: `${siteConfig.url}${canonicalPath}` },
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const { locale: rawLocale, tag } = await params;
  const locale = resolveLocale(rawLocale);
  const t = getDictionary(locale);
  const normalizedTag = decodeRouteParam(tag);
  const filtered = getPublishedPostsByTag(locale, normalizedTag);
  if (filtered.length === 0) notFound();

  return (
    <Container className="py-16">
      <h1 className="text-3xl font-bold tracking-tight">#{normalizedTag}</h1>
      <p className="mt-2 text-sm text-subtle">
        {t.tags.postCount.replace("{count}", String(filtered.length))}
      </p>
      <div className="mt-10 space-y-10">
        {filtered.map((post) => (
          <PostCard key={post.slug} post={post} locale={locale} />
        ))}
      </div>
    </Container>
  );
}
