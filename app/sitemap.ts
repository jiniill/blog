import type { MetadataRoute } from "next";
import { posts } from "@/lib/velite";
import { siteConfig } from "@/lib/site-config";
import { locales } from "@/lib/i18n/types";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  const staticPages = locales.flatMap((locale) => [
    {
      url: `${siteConfig.url}/${locale}`,
      lastModified: now,
      priority: 1.0 as const,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${siteConfig.url}/${l}`]),
        ),
      },
    },
    {
      url: `${siteConfig.url}/${locale}/blog`,
      lastModified: now,
      priority: 0.9 as const,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${siteConfig.url}/${l}/blog`]),
        ),
      },
    },
    {
      url: `${siteConfig.url}/${locale}/about`,
      lastModified: now,
      priority: 0.5 as const,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${siteConfig.url}/${l}/about`]),
        ),
      },
    },
  ]);

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

  return [...staticPages, ...postUrls];
}
