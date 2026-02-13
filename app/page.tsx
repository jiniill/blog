import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PopularPosts } from "@/components/blog/popular-posts";
import { Container } from "@/components/layout/container";
import { PostCard } from "@/components/blog/post-card";
import { getPublishedPosts, getRecentPublishedPosts } from "@/lib/posts";

export default function Home() {
  /* 최근 글 목록과 인기 글 매핑 데이터를 준비합니다. */
  const recentPosts = getRecentPublishedPosts(5);
  const postsBySlug = Object.fromEntries(
    getPublishedPosts().map((post) => [
      post.slug,
      { title: post.title, permalink: post.permalink },
    ]),
  );

  return (
    <Container className="py-20">
      {/* 소개 섹션 */}
      <section className="space-y-6">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          안녕하세요,
          <br />
          <span className="text-subtle">
            블로그에 오신 걸 환영합니다.
          </span>
        </h1>
        <p className="max-w-lg text-lg text-body">
          개발, 기술, 그리고 다양한 생각을 기록하는 공간입니다.
        </p>
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
        >
          글 보러가기
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* 최근 글 섹션 */}
      <section className="mt-16 space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">최근 글</h2>
        {recentPosts.length > 0 ? (
          <div className="space-y-10">
            {recentPosts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-subtle">
            아직 작성된 글이 없습니다.
          </p>
        )}
      </section>

      {/* 인기 글 섹션 */}
      <section className="mt-16 space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">인기 글</h2>
        <PopularPosts postsBySlug={postsBySlug} />
      </section>
    </Container>
  );
}
