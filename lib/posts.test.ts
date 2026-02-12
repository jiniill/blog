import { describe, expect, it } from "vitest";
import {
  getAdjacentPublishedPosts,
  getPublishedPosts,
  getPublishedPostsByTag,
  getPublishedTagCounts,
  getSortedPublishedPosts,
} from "@/lib/posts";
import { toDateTimestamp } from "@/lib/utils";

describe("lib/posts 인덱스 유틸", () => {
  it("공개된 글만 반환한다", () => {
    expect(getPublishedPosts().every((post) => post.published)).toBe(true);
  });

  it("공개 글 목록을 최신 날짜 순으로 정렬한다", () => {
    const sortedPosts = getSortedPublishedPosts();

    for (let index = 1; index < sortedPosts.length; index += 1) {
      const prevDate = toDateTimestamp(sortedPosts[index - 1].date);
      const currentDate = toDateTimestamp(sortedPosts[index].date);
      expect(prevDate).toBeGreaterThanOrEqual(currentDate);
    }
  });

  it("태그 카운트와 태그별 글 목록 수가 일치한다", () => {
    getPublishedTagCounts().forEach(([tag, count]) => {
      expect(getPublishedPostsByTag(tag).length).toBe(count);
    });
  });

  it("인접 글 정보가 정렬 결과와 동일한 순서를 따른다", () => {
    const sortedPosts = getSortedPublishedPosts();
    if (sortedPosts.length < 2) {
      return;
    }

    const currentPost = sortedPosts[1];
    const adjacentPosts = getAdjacentPublishedPosts(currentPost.slug);
    expect(adjacentPosts.nextPost?.slug).toBe(sortedPosts[0].slug);
    expect(adjacentPosts.prevPost?.slug).toBe(sortedPosts[2]?.slug);
  });
});
