import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { PostCard } from "@/components/blog/post-card";
import { getSortedPublishedPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Blog",
  description: "블로그 글 목록",
};

export default function BlogPage() {
  const sortedPosts = getSortedPublishedPosts();

  return (
    <Container className="py-16">
      <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
      <div className="mt-10 space-y-10">
        {sortedPosts.length > 0 ? (
          sortedPosts.map((post) => <PostCard key={post.slug} post={post} />)
        ) : (
          <p className="text-sm text-subtle">
            아직 작성된 글이 없습니다.
          </p>
        )}
      </div>
    </Container>
  );
}
