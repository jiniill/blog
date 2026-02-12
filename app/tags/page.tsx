import type { Metadata } from "next";
import Link from "next/link";
import { posts } from "#velite";
import { Container } from "@/components/layout/container";

export const metadata: Metadata = {
  title: "Tags",
  description: "태그 목록",
};

function getAllTags() {
  const tagCounts: Record<string, number> = {};
  posts
    .filter((p) => p.published)
    .forEach((post) => {
      post.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
  return Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);
}

export default function TagsPage() {
  const tags = getAllTags();

  return (
    <Container className="py-16">
      <h1 className="text-3xl font-bold tracking-tight">Tags</h1>
      <div className="mt-10 flex flex-wrap gap-3">
        {tags.length > 0 ? (
          tags.map(([tag, count]) => (
            <Link
              key={tag}
              href={`/tags/${tag}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors"
            >
              {tag}
              <span className="text-xs text-zinc-500 dark:text-zinc-500">
                {count}
              </span>
            </Link>
          ))
        ) : (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            태그가 없습니다.
          </p>
        )}
      </div>
    </Container>
  );
}
