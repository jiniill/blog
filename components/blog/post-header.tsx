import type { Post } from "@/lib/velite";
import { formatDate } from "@/lib/utils";
import { getReadingTimeLabel } from "@/lib/reading-time";
import { TagBadge } from "./tag-badge";
import { ViewCounter } from "./view-counter";

export function PostHeader({ post }: { post: Post }) {
  const readingTimeLabel = getReadingTimeLabel(
    post.metadata.charCount,
    post.metadata.wordCount,
  );

  return (
    <header className="space-y-4">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        {post.title}
      </h1>
      <div className="flex items-center gap-1.5 text-sm text-subtle">
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        {readingTimeLabel && (
          <>
            <span aria-hidden="true">&middot;</span>
            <span>{readingTimeLabel}</span>
          </>
        )}
        <ViewCounter slug={post.slug} />
      </div>
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
      )}
      {(post.author || post.sourceTitle || post.references.length > 0) && (
        <div className="text-sm text-subtle space-y-0.5">
          {post.author && (
            <p>
              <span className="font-medium">저자:</span> {post.author}
            </p>
          )}
          {post.sourceTitle && (
            <p>
              <span className="font-medium">원문:</span>{" "}
              {post.sourceUrl ? (
                <a
                  href={post.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-foreground"
                >
                  {post.sourceTitle}
                </a>
              ) : (
                post.sourceTitle
              )}
            </p>
          )}
          {post.references.length > 0 && (
            <div className="space-y-0.5">
              {post.references.map((ref, index) => (
                <p key={index}>
                  <span className="font-medium">참고:</span>{" "}
                  <a
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 hover:text-foreground"
                  >
                    {ref.title}
                  </a>
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
