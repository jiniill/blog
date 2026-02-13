import type { Post } from "#velite";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SeriesNavProps {
  seriesName: string;
  currentSlug: string;
  posts: Post[];
}

function getCurrentSeriesIndex(posts: Post[], currentSlug: string) {
  return posts.findIndex((post) => post.slug === currentSlug);
}

export function SeriesNav({ seriesName, currentSlug, posts }: SeriesNavProps) {
  if (posts.length === 0) {
    return null;
  }

  const currentIndex = getCurrentSeriesIndex(posts, currentSlug);
  const currentOrder = currentIndex >= 0 ? currentIndex + 1 : undefined;
  const heading = currentOrder
    ? `${seriesName} (${currentOrder}/${posts.length})`
    : `${seriesName} (${posts.length})`;

  return (
    <section
      aria-label={`${seriesName} 시리즈 내비게이션`}
      className="mt-8 rounded-[var(--theme-radius-lg)] border-[length:var(--theme-border-width)] border-border bg-muted/40 p-5"
    >
      <p className="text-sm font-semibold text-heading">{heading}</p>
      <ol className="mt-4 space-y-1.5">
        {posts.map((seriesPost, index) => {
          const isCurrent = seriesPost.slug === currentSlug;
          return (
            <li key={seriesPost.slug}>
              <Link
                href={seriesPost.permalink}
                prefetch={false}
                aria-current={isCurrent ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-[var(--theme-radius-sm)] px-2 py-1.5 -mx-2 text-sm transition-colors",
                  isCurrent
                    ? "font-bold text-accent"
                    : "text-body hover:bg-surface-hover hover:text-heading",
                )}
              >
                <span className="w-6 shrink-0 text-xs tabular-nums text-subtle">
                  {index + 1}.
                </span>
                <span className="leading-relaxed">{seriesPost.title}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
