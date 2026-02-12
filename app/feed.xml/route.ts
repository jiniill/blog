import { Feed } from "feed";
import { siteConfig } from "@/lib/site-config";
import { getSortedPublishedPosts } from "@/lib/posts";
import { toDate } from "@/lib/utils";

export async function GET() {
  const feed = new Feed({
    title: siteConfig.title,
    description: siteConfig.description,
    id: siteConfig.url,
    link: siteConfig.url,
    language: "ko",
    copyright: `All rights reserved ${new Date().getFullYear()}, ${siteConfig.author.name}`,
    author: {
      name: siteConfig.author.name,
      link: siteConfig.author.github,
    },
  });

  const sortedPosts = getSortedPublishedPosts();

  for (const post of sortedPosts) {
    feed.addItem({
      title: post.title,
      id: `${siteConfig.url}${post.permalink}`,
      link: `${siteConfig.url}${post.permalink}`,
      description: post.description,
      date: toDate(post.date),
      author: [{ name: siteConfig.author.name }],
    });
  }

  return new Response(feed.rss2(), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
