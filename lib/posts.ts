import { posts, type Post } from "#velite";
import { toDateTimestamp } from "@/lib/utils";

interface PublishedPostIndex {
  publishedPosts: Post[];
  sortedPosts: Post[];
  postsBySlug: Map<string, Post>;
  postsByTag: Map<string, Post[]>;
  tagCounts: Array<[string, number]>;
  adjacentPostsBySlug: Map<string, { prevPost?: Post; nextPost?: Post }>;
}

let cachedPublishedPostIndex: PublishedPostIndex | null = null;

function sortByDateDesc(postItems: Post[]): Post[] {
  return [...postItems].sort((firstPost, secondPost) => {
    const firstDate = toDateTimestamp(firstPost.date);
    const secondDate = toDateTimestamp(secondPost.date);
    if (firstDate !== secondDate) {
      return secondDate - firstDate;
    }

    return firstPost.slug.localeCompare(secondPost.slug, "ko");
  });
}

function addPostToTagBucket(
  postsByTag: Map<string, Post[]>,
  tag: string,
  post: Post,
) {
  const taggedPosts = postsByTag.get(tag);
  if (taggedPosts) {
    taggedPosts.push(post);
    return;
  }

  postsByTag.set(tag, [post]);
}

function buildPostsByTag(sortedPosts: Post[]) {
  const postsByTag = new Map<string, Post[]>();

  sortedPosts.forEach((post) => {
    post.tags.forEach((tag) => {
      addPostToTagBucket(postsByTag, tag, post);
    });
  });

  return postsByTag;
}

function buildTagCounts(postsByTag: Map<string, Post[]>) {
  return Array.from(postsByTag.entries())
    .map(([tag, taggedPosts]) => [tag, taggedPosts.length] as [string, number])
    .sort((firstTag, secondTag) => {
      if (firstTag[1] !== secondTag[1]) {
        return secondTag[1] - firstTag[1];
      }

      return firstTag[0].localeCompare(secondTag[0], "ko");
    });
}

function buildAdjacentPostsBySlug(sortedPosts: Post[]) {
  const adjacentPostsBySlug = new Map<
    string,
    { prevPost?: Post; nextPost?: Post }
  >();

  sortedPosts.forEach((post, index) => {
    adjacentPostsBySlug.set(post.slug, {
      prevPost: sortedPosts[index + 1],
      nextPost: sortedPosts[index - 1],
    });
  });

  return adjacentPostsBySlug;
}

function createPublishedPostIndex(): PublishedPostIndex {
  const publishedPosts = posts.filter((post) => post.published);
  const sortedPosts = sortByDateDesc(publishedPosts);
  const postsBySlug = new Map(publishedPosts.map((post) => [post.slug, post]));
  const postsByTag = buildPostsByTag(sortedPosts);

  return {
    publishedPosts,
    sortedPosts,
    postsBySlug,
    postsByTag,
    tagCounts: buildTagCounts(postsByTag),
    adjacentPostsBySlug: buildAdjacentPostsBySlug(sortedPosts),
  };
}

function getPublishedPostIndex() {
  if (!cachedPublishedPostIndex) {
    cachedPublishedPostIndex = createPublishedPostIndex();
  }

  return cachedPublishedPostIndex;
}

export function getPublishedPosts(): Post[] {
  return getPublishedPostIndex().publishedPosts;
}

export function getSortedPublishedPosts(): Post[] {
  return getPublishedPostIndex().sortedPosts;
}

export function getRecentPublishedPosts(limit: number): Post[] {
  return getSortedPublishedPosts().slice(0, limit);
}

export function getPublishedPostBySlug(slug: string): Post | undefined {
  return getPublishedPostIndex().postsBySlug.get(slug);
}

export function getAdjacentPublishedPosts(slug: string): {
  prevPost?: Post;
  nextPost?: Post;
} {
  return getPublishedPostIndex().adjacentPostsBySlug.get(slug) ?? {};
}

export function getPublishedPostsByTag(tag: string): Post[] {
  return getPublishedPostIndex().postsByTag.get(tag) ?? [];
}

export function getPublishedTags(): string[] {
  return getPublishedPostIndex().tagCounts.map(([tag]) => tag);
}

export function getPublishedTagCounts(): Array<[string, number]> {
  return getPublishedPostIndex().tagCounts;
}
