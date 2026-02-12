import type { Metadata } from "next";
import { posts } from "#velite";
import { Container } from "@/components/layout/container";
import { PostCard } from "@/components/blog/post-card";

export const metadata: Metadata = {
  title: "Blog",
  description: "블로그 글 목록",
};

export default function BlogPage() {
  const sortedPosts = posts
    .filter((p) => p.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Container className="py-16">
      <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
      <div className="mt-10 space-y-10">
        {sortedPosts.length > 0 ? (
          sortedPosts.map((post) => <PostCard key={post.slug} post={post} />)
        ) : (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            아직 작성된 글이 없습니다.
          </p>
        )}
      </div>
    </Container>
  );
}
