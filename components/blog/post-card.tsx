import Link from "next/link";
import type { Post } from "#velite";
import { formatDate } from "@/lib/utils";
import { TagBadge } from "./tag-badge";

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="group">
      <Link href={post.permalink} className="block space-y-3">
        <h3 className="text-xl font-semibold tracking-tight group-hover:underline">
          {post.title}
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
          {post.description}
        </p>
        <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-500">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          {post.metadata.readingTime > 0 && (
            <span>{Math.ceil(post.metadata.readingTime)}분 읽기</span>
          )}
        </div>
      </Link>
      {post.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
      )}
    </article>
  );
}
