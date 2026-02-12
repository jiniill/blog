import { posts, type Post } from "#velite";

function sortByDateDesc(postItems: Post[]): Post[] {
  return [...postItems].sort((firstPost, secondPost) => {
    const firstDate = new Date(firstPost.date).getTime();
    const secondDate = new Date(secondPost.date).getTime();
    return secondDate - firstDate;
  });
}

export function getPublishedPosts(): Post[] {
  return posts.filter((post) => post.published);
}

export function getSortedPublishedPosts(): Post[] {
  return sortByDateDesc(getPublishedPosts());
}

export function getRecentPublishedPosts(limit: number): Post[] {
  return getSortedPublishedPosts().slice(0, limit);
}

export function getPublishedPostBySlug(slug: string): Post | undefined {
  return getPublishedPosts().find((post) => post.slug === slug);
}

export function getAdjacentPublishedPosts(slug: string): {
  prevPost?: Post;
  nextPost?: Post;
} {
  const sortedPosts = getSortedPublishedPosts();
  const currentIndex = sortedPosts.findIndex((post) => post.slug === slug);
  if (currentIndex < 0) {
    return {};
  }

  return {
    prevPost: sortedPosts[currentIndex + 1],
    nextPost: sortedPosts[currentIndex - 1],
  };
}

export function getPublishedPostsByTag(tag: string): Post[] {
  return getSortedPublishedPosts().filter((post) => post.tags.includes(tag));
}

export function getPublishedTags(): string[] {
  const tagSet = new Set<string>();

  getPublishedPosts().forEach((post) => {
    post.tags.forEach((tag) => {
      tagSet.add(tag);
    });
  });

  return Array.from(tagSet);
}

export function getPublishedTagCounts(): Array<[string, number]> {
  const tagCounts: Record<string, number> = {};

  getPublishedPosts().forEach((post) => {
    post.tags.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  return Object.entries(tagCounts).sort((firstTag, secondTag) => {
    return secondTag[1] - firstTag[1];
  });
}
