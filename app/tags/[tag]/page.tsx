import type { Metadata } from "next";
import { posts } from "#velite";
import { Container } from "@/components/layout/container";
import { PostCard } from "@/components/blog/post-card";

interface TagPageProps {
  params: Promise<{ tag: string }>;
}

export async function generateStaticParams() {
  const tags = new Set<string>();
  posts
    .filter((p) => p.published)
    .forEach((post) => post.tags.forEach((tag) => tags.add(tag)));
  return Array.from(tags).map((tag) => ({ tag }));
}

export async function generateMetadata({
  params,
}: TagPageProps): Promise<Metadata> {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  return {
    title: `#${decoded}`,
    description: `"${decoded}" 태그가 달린 글 목록`,
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  const filtered = posts
    .filter((p) => p.published && p.tags.includes(decoded))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Container className="py-16">
      <h1 className="text-3xl font-bold tracking-tight">#{decoded}</h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        {filtered.length}개의 글
      </p>
      <div className="mt-10 space-y-10">
        {filtered.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </Container>
  );
}
