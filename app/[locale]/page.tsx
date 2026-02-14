import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { PopularPosts } from "@/components/blog/popular-posts";
import { Container } from "@/components/layout/container";
import { PostCard } from "@/components/blog/post-card";
import { getPublishedPosts, getRecentPublishedPosts } from "@/lib/posts";
import { isValidLocale, type Locale } from "@/lib/i18n/types";
import { getDictionary } from "@/lib/i18n/get-dictionary";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

function resolveLocale(rawLocale: string): Locale {
  if (isValidLocale(rawLocale)) {
    return rawLocale;
  }

  notFound();
}

export default async function Home({ params }: HomePageProps) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const t = getDictionary(locale);

  const recentPosts = getRecentPublishedPosts(locale, 5);
  const postsBySlug = Object.fromEntries(
    getPublishedPosts(locale).map((post) => [
      post.slug,
      { title: post.title, permalink: post.permalink },
    ]),
  );

  return (
    <Container className="py-20">
      <section className="space-y-6">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {t.home.greeting}
          <br />
          <span className="text-subtle">{t.home.welcome}</span>
        </h1>
        <p className="max-w-lg text-lg text-body">{t.home.description}</p>
        <Link
          href={`/${locale}/blog`}
          className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
        >
          {t.home.cta}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <section className="mt-16 space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">
          {t.home.recentPosts}
        </h2>
        {recentPosts.length > 0 ? (
          <div className="space-y-10">
            {recentPosts.map((post) => (
              <PostCard key={post.slug} post={post} locale={locale} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-subtle">{t.home.noPosts}</p>
        )}
      </section>

      <section className="mt-16 space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">
          {t.home.popularPosts}
        </h2>
        <PopularPosts postsBySlug={postsBySlug} locale={locale} />
      </section>
    </Container>
  );
}
