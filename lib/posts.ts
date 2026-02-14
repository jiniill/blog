import type { Locale } from "@/lib/i18n/types";
import { posts, type Post } from "@/lib/velite";
import { decodeRouteParam } from "@/lib/route-params";
import { toDateTimestamp } from "@/lib/utils";

interface PublishedPostIndex {
  publishedPosts: Post[];
  sortedPosts: Post[];
  postsBySlug: Map<string, Post>;
  postsByTag: Map<string, Post[]>;
  postsBySeries: Map<string, Post[]>;
  tagCounts: Array<[string, number]>;
  adjacentPostsBySlug: Map<string, { prevPost?: Post; nextPost?: Post }>;
}

const cachedPublishedPostIndices = new Map<Locale, PublishedPostIndex>();

function sortByDateDesc(postItems: Post[]): Post[] {
  return [...postItems].sort((firstPost, secondPost) => {
    const firstDate = toDateTimestamp(firstPost.date);
    const secondDate = toDateTimestamp(secondPost.date);
    if (firstDate !== secondDate) {
      return secondDate - firstDate;
    }

    return firstPost.slug.localeCompare(secondPost.slug);
  });
}

function compareByDateAscWithSlug(firstPost: Post, secondPost: Post) {
  const firstDate = toDateTimestamp(firstPost.date);
  const secondDate = toDateTimestamp(secondPost.date);
  if (firstDate !== secondDate) {
    return firstDate - secondDate;
  }

  return firstPost.slug.localeCompare(secondPost.slug);
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

function addPostToSeriesBucket(postsBySeries: Map<string, Post[]>, post: Post) {
  if (!post.series) {
    return;
  }

  const seriesPosts = postsBySeries.get(post.series);
  if (seriesPosts) {
    seriesPosts.push(post);
    return;
  }

  postsBySeries.set(post.series, [post]);
}

function sortBySeriesOrder(postsInSeries: Post[]): Post[] {
  return [...postsInSeries].sort((firstPost, secondPost) => {
    const firstOrder = firstPost.seriesOrder ?? Number.POSITIVE_INFINITY;
    const secondOrder = secondPost.seriesOrder ?? Number.POSITIVE_INFINITY;
    if (firstOrder !== secondOrder) {
      return firstOrder - secondOrder;
    }

    return compareByDateAscWithSlug(firstPost, secondPost);
  });
}

function buildPostsByTag(sortedPosts: Post[]) {
  const postsByTag = new Map<string, Post[]>();

  for (const post of sortedPosts) {
    for (const tag of post.tags) {
      addPostToTagBucket(postsByTag, tag, post);
    }
  }

  return postsByTag;
}

function buildPostsBySeries(sortedPosts: Post[]) {
  const postsBySeries = new Map<string, Post[]>();

  for (const post of sortedPosts) {
    addPostToSeriesBucket(postsBySeries, post);
  }

  postsBySeries.forEach((seriesPosts, seriesName) => {
    postsBySeries.set(seriesName, sortBySeriesOrder(seriesPosts));
  });

  return postsBySeries;
}

function buildTagCounts(postsByTag: Map<string, Post[]>) {
  return Array.from(postsByTag.entries())
    .map(([tag, taggedPosts]) => [tag, taggedPosts.length] as [string, number])
    .sort((firstTag, secondTag) => {
      if (firstTag[1] !== secondTag[1]) {
        return secondTag[1] - firstTag[1];
      }

      return firstTag[0].localeCompare(secondTag[0]);
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

function createPublishedPostIndex(locale: Locale): PublishedPostIndex {
  const publishedPosts = posts.filter(
    (post) => post.published && post.locale === locale,
  );
  const sortedPosts = sortByDateDesc(publishedPosts);
  const postsBySlug = new Map(publishedPosts.map((post) => [post.slug, post]));
  const postsByTag = buildPostsByTag(sortedPosts);
  const postsBySeries = buildPostsBySeries(sortedPosts);

  return {
    publishedPosts,
    sortedPosts,
    postsBySlug,
    postsByTag,
    postsBySeries,
    tagCounts: buildTagCounts(postsByTag),
    adjacentPostsBySlug: buildAdjacentPostsBySlug(sortedPosts),
  };
}

function getPublishedPostIndex(locale: Locale) {
  const cachedIndex = cachedPublishedPostIndices.get(locale);
  if (cachedIndex) {
    return cachedIndex;
  }

  const nextIndex = createPublishedPostIndex(locale);
  cachedPublishedPostIndices.set(locale, nextIndex);
  return nextIndex;
}

function normalizeLookupValue(value: string): string {
  return decodeRouteParam(value);
}

function getTranslationLocale(locale: Locale): Locale {
  return locale === "ko" ? "en" : "ko";
}

export function getPublishedPosts(locale: Locale): Post[] {
  return getPublishedPostIndex(locale).publishedPosts;
}

export function getSortedPublishedPosts(locale: Locale): Post[] {
  return getPublishedPostIndex(locale).sortedPosts;
}

export function getRecentPublishedPosts(locale: Locale, limit: number): Post[] {
  return getSortedPublishedPosts(locale).slice(0, limit);
}

export function getPublishedPostBySlug(
  locale: Locale,
  slug: string,
): Post | undefined {
  return getPublishedPostIndex(locale).postsBySlug.get(normalizeLookupValue(slug));
}

export function getAdjacentPublishedPosts(locale: Locale, slug: string): {
  prevPost?: Post;
  nextPost?: Post;
} {
  return (
    getPublishedPostIndex(locale).adjacentPostsBySlug.get(normalizeLookupValue(slug)) ??
    {}
  );
}

export function getPublishedPostsByTag(locale: Locale, tag: string): Post[] {
  return getPublishedPostIndex(locale).postsByTag.get(normalizeLookupValue(tag)) ?? [];
}

export function getPostsBySeries(locale: Locale, seriesName: string): Post[] {
  return getPublishedPostIndex(locale).postsBySeries.get(normalizeLookupValue(seriesName)) ?? [];
}

export function getPublishedTags(locale: Locale): string[] {
  return getPublishedPostIndex(locale).tagCounts.map(([tag]) => tag);
}

export function getPublishedTagCounts(locale: Locale): Array<[string, number]> {
  return getPublishedPostIndex(locale).tagCounts;
}

export function getTranslationForPost(
  slug: string,
  currentLocale: Locale,
): Post | undefined {
  const translationLocale = getTranslationLocale(currentLocale);
  return getPublishedPostBySlug(translationLocale, slug);
}
