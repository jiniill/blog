import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteConfig } from "@/lib/site-config";
import { decodeRouteParam } from "@/lib/route-params";
import {
  getAdjacentPublishedPosts,
  getPublishedPostBySlug,
  getPublishedPosts,
  getPostsBySeries,
  getRelatedPosts,
  getTranslationForPost,
} from "@/lib/posts";
import {
  isValidLocale,
  locales,
  type Locale,
} from "@/lib/i18n/types";
import { Container } from "@/components/layout/container";
import { PostHeader } from "@/components/blog/post-header";
import { PostBody } from "@/components/blog/post-body";
import { Comments } from "@/components/blog/comments";
import { PostNav } from "@/components/blog/post-nav";
import { SeriesNav } from "@/components/blog/series-nav";
import { CodeBlockCopy } from "@/components/mdx/code-block-copy";
import { FootnoteTooltip } from "@/components/mdx/footnote-tooltip";
import { SubscribeCta } from "@/components/subscribe/subscribe-cta";
import { TableOfContents } from "@/components/blog/table-of-contents";
import { ReadingProgress } from "@/components/blog/reading-progress";
import { BackToTop } from "@/components/ui/back-to-top";
import { HeadingCopyWrapper } from "@/components/blog/heading-copy-wrapper";
import { RelatedPosts } from "@/components/blog/related-posts";

interface PostPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

function resolveLocale(rawLocale: string): Locale | undefined {
  if (isValidLocale(rawLocale)) {
    return rawLocale;
  }

  return undefined;
}

export async function generateStaticParams() {
  return locales.flatMap((locale) =>
    getPublishedPosts(locale).map((post) => ({ locale, slug: post.slug })),
  );
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  /* 요청 경로에서 로캘과 slug를 해석합니다. */
  const { locale: rawLocale, slug } = await params;
  const locale = resolveLocale(rawLocale);
  if (!locale) return {};

  /* 게시글 존재 여부를 확인하고 canonical URL을 계산합니다. */
  const normalizedSlug = decodeRouteParam(slug);
  const post = getPublishedPostBySlug(locale, normalizedSlug);
  if (!post) return {};
  const canonicalPath = post.permalink;
  const canonicalUrl = `${siteConfig.url}${canonicalPath}`;

  /* 번역 게시글이 있으면 hreflang alternates를 구성합니다. */
  const ogLocale = locale === "ko" ? "ko_KR" : "en_US";
  const translation = getTranslationForPost(normalizedSlug, locale);

  const alternateLanguages: Record<string, string> = {};
  if (translation) {
    const otherLocale = locale === "ko" ? "en" : "ko";
    alternateLanguages[otherLocale] =
      `${siteConfig.url}/${otherLocale}/blog/${normalizedSlug}`;
  }
  alternateLanguages[locale] = `${siteConfig.url}${post.permalink}`;

  /* 게시글 상세 메타데이터를 반환합니다. */
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      locale: ogLocale,
      publishedTime: post.date,
      modifiedTime: post.updated,
      url: canonicalUrl,
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
    alternates: {
      canonical: canonicalPath,
      languages: alternateLanguages,
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { locale: rawLocale, slug } = await params;
  const locale = resolveLocale(rawLocale);
  if (!locale) notFound();

  const normalizedSlug = decodeRouteParam(slug);
  const post = getPublishedPostBySlug(locale, normalizedSlug);
  if (!post) notFound();

  const { prevPost, nextPost } = getAdjacentPublishedPosts(
    locale,
    normalizedSlug,
  );
  const postsInSeries = post.series
    ? getPostsBySeries(locale, post.series)
    : [];

  const hasTranslation = !!getTranslationForPost(normalizedSlug, locale);
  const relatedPosts = getRelatedPosts(locale, post.slug, post.tags);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    inLanguage: locale,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    author: {
      "@type": "Person",
      name: siteConfig.author.name,
      url: siteConfig.author.github,
    },
    url: `${siteConfig.url}${post.permalink}`,
  };

  return (
    <>
      <ReadingProgress />
      <Container className="py-16">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <article className="relative" data-post-article data-has-translation={hasTranslation}>
          <PostHeader post={post} locale={locale} />
          {post.series && postsInSeries.length > 0 && (
            <SeriesNav
              seriesName={post.series}
              currentSlug={post.slug}
              posts={postsInSeries}
              locale={locale}
            />
          )}
          {post.toc.length > 0 && (
            <TableOfContents items={post.toc} locale={locale} />
          )}
          <FootnoteTooltip>
            <CodeBlockCopy>
              <HeadingCopyWrapper>
                <div className="mt-10">
                  <PostBody code={post.body} />
                </div>
              </HeadingCopyWrapper>
            </CodeBlockCopy>
          </FootnoteTooltip>
        </article>
        <RelatedPosts posts={relatedPosts} locale={locale} />
        <SubscribeCta locale={locale} />
        <PostNav prev={prevPost} next={nextPost} locale={locale} />
        <Comments locale={locale} />
        <BackToTop locale={locale} />
      </Container>
    </>
  );
}
