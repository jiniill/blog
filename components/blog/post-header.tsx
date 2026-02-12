import type { Post } from "#velite";
import { formatDate } from "@/lib/utils";
import { TagBadge } from "./tag-badge";

export function PostHeader({ post }: { post: Post }) {
  return (
    <header className="space-y-4">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        {post.title}
      </h1>
      <div className="flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        {post.metadata.readingTime > 0 && (
          <span>{Math.ceil(post.metadata.readingTime)}분 읽기</span>
        )}
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
