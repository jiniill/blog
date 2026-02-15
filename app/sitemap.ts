import type { MetadataRoute } from "next";
import { posts } from "@/lib/velite";
import { siteConfig } from "@/lib/site-config";
import { locales } from "@/lib/i18n/types";
import { getPublishedTags } from "@/lib/posts";

/** 모든 로캘에 대해 동일 경로의 hreflang alternates를 생성합니다. */
function buildAlternates(path: string) {
  return {
    languages: Object.fromEntries(
      locales.map((l) => [l, `${siteConfig.url}/${l}${path}`]),
    ),
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  /* 정적 페이지: 홈, 블로그, 아카이브, 태그 목록, 소개 */
  const staticPaths: Array<{ path: string; priority: number }> = [
    { path: "", priority: 1.0 },
    { path: "/blog", priority: 0.9 },
    { path: "/archive", priority: 0.6 },
    { path: "/tags", priority: 0.6 },
    { path: "/about", priority: 0.5 },
  ];

  const staticPages = locales.flatMap((locale) =>
    staticPaths.map(({ path, priority }) => ({
      url: `${siteConfig.url}/${locale}${path}`,
      lastModified: now,
      priority,
      alternates: buildAlternates(path),
    })),
  );

  /* 개별 태그 페이지 */
  const tagPages = locales.flatMap((locale) =>
    getPublishedTags(locale).map((tag) => ({
      url: `${siteConfig.url}/${locale}/tags/${encodeURIComponent(tag)}`,
      lastModified: now,
      priority: 0.5,
      alternates: buildAlternates(`/tags/${encodeURIComponent(tag)}`),
    })),
  );

  /* 개별 포스트 페이지 */
  const publishedPosts = posts.filter((p) => p.published);
  const postUrls = publishedPosts.map((post) => {
    const alternatePost = publishedPosts.find(
      (p) => p.slug === post.slug && p.locale !== post.locale,
    );

    const languages: Record<string, string> = {
      [post.locale]: `${siteConfig.url}${post.permalink}`,
    };
    if (alternatePost) {
      languages[alternatePost.locale] =
        `${siteConfig.url}${alternatePost.permalink}`;
    }

    return {
      url: `${siteConfig.url}${post.permalink}`,
      lastModified: post.updated ?? post.date,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      alternates: { languages },
    };
  });

  return [...staticPages, ...tagPages, ...postUrls];
}
