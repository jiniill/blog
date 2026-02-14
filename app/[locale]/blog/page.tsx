import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { PostCard } from "@/components/blog/post-card";
import { getSortedPublishedPosts } from "@/lib/posts";
import { isValidLocale, type Locale } from "@/lib/i18n/types";
import { getDictionary } from "@/lib/i18n/get-dictionary";

interface BlogPageProps {
  params: Promise<{ locale: string }>;
}

function resolveLocale(rawLocale: string): Locale {
  if (isValidLocale(rawLocale)) {
    return rawLocale;
  }

  notFound();
}

export async function generateMetadata({
  params,
}: BlogPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  if (!isValidLocale(rawLocale)) return {};
  const t = getDictionary(rawLocale);

  return {
    title: t.blog.title,
    description: t.blog.description,
  };
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const t = getDictionary(locale);
  const sortedPosts = getSortedPublishedPosts(locale);

  return (
    <Container className="py-16">
      <h1 className="text-3xl font-bold tracking-tight">{t.blog.title}</h1>
      <div className="mt-10 space-y-10">
        {sortedPosts.length > 0 ? (
          sortedPosts.map((post) => (
            <PostCard key={post.slug} post={post} locale={locale} />
          ))
        ) : (
          <p className="text-sm text-subtle">{t.blog.noPosts}</p>
        )}
      </div>
    </Container>
  );
}
