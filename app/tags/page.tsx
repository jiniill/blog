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
              className="inline-flex items-center gap-1.5 rounded-[var(--theme-radius-sm)] border-[length:var(--theme-border-width)] border-border bg-muted px-3 py-1.5 text-sm text-body hover:bg-muted-hover shadow-[var(--theme-shadow)] transition-colors"
            >
              {tag}
              <span className="text-xs text-subtle">
                {count}
              </span>
            </Link>
          ))
        ) : (
          <p className="text-sm text-subtle">
            태그가 없습니다.
          </p>
        )}
      </div>
    </Container>
  );
}
