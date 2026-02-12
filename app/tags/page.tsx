import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { getPublishedTagCounts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Tags",
  description: "태그 목록",
};

export default function TagsPage() {
  const tags = getPublishedTagCounts();

  return (
    <Container className="py-16">
      <h1 className="text-3xl font-bold tracking-tight">Tags</h1>
      <div className="mt-10 flex flex-wrap gap-3">
        {tags.length > 0 ? (
          /* 태그 목록은 링크가 대량 렌더링되므로 자동 프리패치를 비활성화 */
          tags.map(([tag, count]) => (
            <Link
              key={tag}
              href={`/tags/${encodeURIComponent(tag)}`}
              prefetch={false}
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
