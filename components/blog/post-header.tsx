import type { Post } from "#velite";
import { formatDate } from "@/lib/utils";
import { getReadingTimeLabelByWordCount } from "@/lib/reading-time";
import { TagBadge } from "./tag-badge";

export function PostHeader({ post }: { post: Post }) {
  const readingTimeLabel = getReadingTimeLabelByWordCount(post.metadata.wordCount);

  return (
    <header className="space-y-4">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        {post.title}
      </h1>
      <div className="flex items-center gap-3 text-sm text-subtle">
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        {readingTimeLabel && <span>{readingTimeLabel}</span>}
      </div>
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
      )}
    </header>
  );
}
