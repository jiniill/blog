import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { posts } from "#velite";
import { siteConfig } from "@/lib/site-config";
import { Container } from "@/components/layout/container";
import { PostHeader } from "@/components/blog/post-header";
import { PostBody } from "@/components/blog/post-body";
import { Comments } from "@/components/blog/comments";
import { PostNav } from "@/components/blog/post-nav";
import { CodeBlockCopy } from "@/components/mdx/code-block-copy";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

function getPostBySlug(slug: string) {
  return posts.find((p) => p.slug === slug && p.published);
}

export async function generateStaticParams() {
  return posts
    .filter((p) => p.published)
    .map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.updated,
      url: `${siteConfig.url}${post.permalink}`,
      tags: post.tags,
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const sortedPosts = posts
    .filter((p) => p.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const currentIndex = sortedPosts.findIndex((p) => p.slug === slug);
  const prevPost = sortedPosts[currentIndex + 1];
  const nextPost = sortedPosts[currentIndex - 1];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    author: {
      "@type": "Person",
      name: siteConfig.author.name,
      url: siteConfig.author.github,
    },
    url: `${siteConfig.url}${post.permalink}`,
  };

  return (
    <Container className="py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <article>
        <PostHeader post={post} />
        <CodeBlockCopy>
          <div className="mt-10">
            <PostBody code={post.body} />
          </div>
        </CodeBlockCopy>
      </article>
      <PostNav prev={prevPost} next={nextPost} />
      <Comments />
    </Container>
  );
}
