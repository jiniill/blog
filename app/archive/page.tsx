import type { Post } from "#velite";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { getSortedPublishedPosts } from "@/lib/posts";
import { toDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Archive",
  description: "연도별 글 아카이브",
};

interface ArchiveYearGroup {
  year: number;
  posts: Post[];
}

function getUtcYear(date: string) {
  return toDate(date).getUTCFullYear();
}

function formatMonthDay(date: string) {
  const parsedDate = toDate(date);
  const month = String(parsedDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(parsedDate.getUTCDate()).padStart(2, "0");
  return `${month}.${day}`;
}

function groupPostsByYear(posts: Post[]): ArchiveYearGroup[] {
  const groupedPosts = new Map<number, Post[]>();

  posts.forEach((post) => {
    const year = getUtcYear(post.date);
    const postsInYear = groupedPosts.get(year);
    if (postsInYear) {
      postsInYear.push(post);
      return;
    }
    groupedPosts.set(year, [post]);
  });

  return Array.from(groupedPosts.entries()).map(([year, yearPosts]) => ({
    year,
    posts: yearPosts,
  }));
}

function ArchiveYearSection({ year, posts }: ArchiveYearGroup) {
  return (
    <section key={year}>
      <h2 className="text-2xl font-bold tracking-tight">{year}년</h2>
      <ul className="mt-5 space-y-2.5">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={post.permalink}
              prefetch={false}
              className="group flex items-baseline gap-3 rounded-[var(--theme-radius-sm)] px-2 py-1.5 -mx-2 hover:bg-surface-hover transition-colors"
            >
              <time
                dateTime={post.date}
                className="w-12 shrink-0 text-xs font-medium text-subtle tabular-nums"
              >
                {formatMonthDay(post.date)}
              </time>
              <span className="text-sm text-body group-hover:text-heading group-hover:underline">
                {post.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function ArchivePage() {
  const groupedPosts = groupPostsByYear(getSortedPublishedPosts());

  return (
    <Container className="py-16">
      <h1 className="text-3xl font-bold tracking-tight">Archive</h1>
      {groupedPosts.length > 0 ? (
        <div className="mt-10 space-y-12">
          {groupedPosts.map((group) => (
            <ArchiveYearSection
              key={group.year}
              year={group.year}
              posts={group.posts}
            />
          ))}
        </div>
      ) : (
        <p className="mt-10 text-sm text-subtle">아직 작성된 글이 없습니다.</p>
      )}
    </Container>
  );
}
