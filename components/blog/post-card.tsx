import Link from "next/link";
import type { Post } from "#velite";
import { formatDate } from "@/lib/utils";
import { TagBadge } from "./tag-badge";

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="post-card group">
      {/* 목록 카드에서는 링크가 다수 노출되므로 자동 프리패치를 비활성화 */}
      <Link href={post.permalink} prefetch={false} className="block space-y-3">
        <h3 className="text-xl font-semibold tracking-tight group-hover:underline">
          {post.title}
        </h3>
        <p className="text-sm text-body line-clamp-2">{post.description}</p>
        <div className="flex items-center gap-3 text-xs text-subtle">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          {post.metadata.readingTime > 0 && (
            <span>{Math.ceil(post.metadata.readingTime)}분 읽기</span>
          )}
        </div>
      </Link>
      {post.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {/* 카드 하단 태그 링크도 다건 렌더링 구간이므로 프리패치 절감 대상 */}
          {post.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
      )}
    </article>
  );
}
