import Fuse, { type IFuseOptions } from "fuse.js";
import type { Post } from "@/lib/velite";

/* ── 타입 ── */

export interface SearchablePost {
  title: string;
  slug: string;
  description: string;
  tags: string[];
  permalink: string;
  date: string;
}

/* ── 검색 엔진 설정 ── */

const DEFAULT_RESULT_LIMIT = 8;

const POST_SEARCH_OPTIONS: IFuseOptions<SearchablePost> = {
  keys: [
    { name: "title", weight: 0.5 },
    { name: "description", weight: 0.3 },
    { name: "tags", weight: 0.2 },
  ],
  threshold: 0.35,
  ignoreLocation: true,
  minMatchCharLength: 2,
};

/* ── 공개 API ── */

export function toSearchablePosts(posts: Post[]): SearchablePost[] {
  return posts.map((post) => ({
    title: post.title,
    slug: post.slug,
    description: post.description,
    tags: post.tags,
    permalink: post.permalink,
    date: post.date,
  }));
}

export function createPostSearchEngine(posts: SearchablePost[]) {
  return new Fuse(posts, POST_SEARCH_OPTIONS);
}

export function searchPosts(
  engine: Fuse<SearchablePost>,
  allPosts: SearchablePost[],
  query: string,
  limit = DEFAULT_RESULT_LIMIT,
): SearchablePost[] {
  const trimmed = query.trim();
  if (!trimmed) return allPosts.slice(0, limit);

  return engine
    .search(trimmed, { limit })
    .map((result) => result.item);
}
