import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteConfig } from "@/lib/site-config";
import {
  getAdjacentPublishedPosts,
  getPublishedPostBySlug,
  getPublishedPosts,
} from "@/lib/posts";
import { Container } from "@/components/layout/container";
import { PostHeader } from "@/components/blog/post-header";
import { PostBody } from "@/components/blog/post-body";
import { Comments } from "@/components/blog/comments";
import { PostNav } from "@/components/blog/post-nav";
import { CodeBlockCopy } from "@/components/mdx/code-block-copy";
import { SubscribeCta } from "@/components/subscribe/subscribe-cta";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getPublishedPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPublishedPostBySlug(slug);
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
  const post = getPublishedPostBySlug(slug);
  if (!post) notFound();

  const { prevPost, nextPost } = getAdjacentPublishedPosts(slug);

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
      <SubscribeCta />
      <PostNav prev={prevPost} next={nextPost} />
      <Comments />
    </Container>
  );
}
