import Link from "next/link";
import type { Post } from "@/lib/velite";
import type { Locale } from "@/lib/i18n/types";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { formatDate } from "@/lib/utils";
import { getReadingTimeLabel } from "@/lib/reading-time";
import { TagBadge } from "./tag-badge";

export function PostCard({ post, locale }: { post: Post; locale: Locale }) {
  const t = getDictionary(locale);
  const readingTimeLabel = getReadingTimeLabel(
    post.metadata.charCount,
    post.metadata.wordCount,
    t.readingTime,
  );

  return (
    <article className="post-card group">
      <Link href={post.permalink} prefetch={false} className="block space-y-3">
        <h3 className="text-xl font-semibold tracking-tight group-hover:underline">
          {post.title}
        </h3>
        <p className="text-sm text-body line-clamp-2">{post.description}</p>
        <div className="flex items-center gap-1.5 text-xs text-subtle">
          <time dateTime={post.date}>{formatDate(post.date, locale)}</time>
          {readingTimeLabel && (
            <>
              <span aria-hidden="true">&middot;</span>
              <span>{readingTimeLabel}</span>
            </>
          )}
        </div>
      </Link>
      {post.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} locale={locale} />
          ))}
        </div>
      )}
    </article>
  );
}
