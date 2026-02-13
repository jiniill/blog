import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteConfig } from "@/lib/site-config";
import {
  getAdjacentPublishedPosts,
  getPublishedPostBySlug,
  getPublishedPosts,
  getPostsBySeries,
} from "@/lib/posts";
import { Container } from "@/components/layout/container";
import { PostHeader } from "@/components/blog/post-header";
import { PostBody } from "@/components/blog/post-body";
import { Comments } from "@/components/blog/comments";
import { PostNav } from "@/components/blog/post-nav";
import { SeriesNav } from "@/components/blog/series-nav";
import { CodeBlockCopy } from "@/components/mdx/code-block-copy";
import { SubscribeCta } from "@/components/subscribe/subscribe-cta";
import { TableOfContents } from "@/components/blog/table-of-contents";
import { ReadingProgress } from "@/components/blog/reading-progress";
import { BackToTop } from "@/components/ui/back-to-top";
import { HeadingCopyWrapper } from "@/components/blog/heading-copy-wrapper";

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
  const postsInSeries = post.series ? getPostsBySeries(post.series) : [];

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
    <>
      <ReadingProgress />
      <Container className="py-16">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <article className="relative" data-post-article>
          <PostHeader post={post} />
          {post.series && postsInSeries.length > 0 && (
            <SeriesNav
              seriesName={post.series}
              currentSlug={post.slug}
              posts={postsInSeries}
            />
          )}
          {post.toc.length > 0 && <TableOfContents items={post.toc} />}
          <CodeBlockCopy>
            <HeadingCopyWrapper>
              <div className="mt-10">
                <PostBody code={post.body} />
              </div>
            </HeadingCopyWrapper>
          </CodeBlockCopy>
        </article>
        <SubscribeCta />
        <PostNav prev={prevPost} next={nextPost} />
        <Comments />
        <BackToTop />
      </Container>
    </>
  );
}
