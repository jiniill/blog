import type { MetadataRoute } from "next";
import { posts } from "@/lib/velite";
import { siteConfig } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const postUrls = posts
    .filter((p) => p.published)
    .map((post) => ({
      url: `${siteConfig.url}${post.permalink}`,
      lastModified: post.updated ?? post.date,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  return [
    {
      url: siteConfig.url,
      lastModified: new Date().toISOString(),
      priority: 1.0,
    },
    {
      url: `${siteConfig.url}/blog`,
      lastModified: new Date().toISOString(),
      priority: 0.9,
    },
    {
      url: `${siteConfig.url}/about`,
      lastModified: new Date().toISOString(),
      priority: 0.5,
    },
    ...postUrls,
  ];
}
