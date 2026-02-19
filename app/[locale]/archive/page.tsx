import type { Post } from "@/lib/velite";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { getSortedPublishedPosts } from "@/lib/posts";
import { siteConfig } from "@/lib/site-config";
import { isValidLocale, type Locale } from "@/lib/i18n/types";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildLocaleAlternates, buildLocalePath } from "@/lib/seo";
import { toDate } from "@/lib/utils";

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

function ArchiveYearSection({
  year,
  posts,
  yearSuffix,
}: ArchiveYearGroup & { yearSuffix: string }) {
  return (
    <section key={year}>
      <h2 className="text-2xl font-bold tracking-tight">
        {year}
        {yearSuffix}
      </h2>
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

interface ArchivePageProps {
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
}: ArchivePageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  if (!isValidLocale(rawLocale)) return {};
  const t = getDictionary(rawLocale);
  const canonicalPath = buildLocalePath(rawLocale, "/archive");

  return {
    title: t.archive.title,
    description: t.archive.description,
    alternates: {
      canonical: canonicalPath,
      ...buildLocaleAlternates("/archive"),
    },
    openGraph: { url: `${siteConfig.url}${canonicalPath}` },
  };
}

export default async function ArchivePage({ params }: ArchivePageProps) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const t = getDictionary(locale);
  const groupedPosts = groupPostsByYear(getSortedPublishedPosts(locale));

  return (
    <Container className="py-16">
      <h1 className="text-3xl font-bold tracking-tight">{t.archive.title}</h1>
      {groupedPosts.length > 0 ? (
        <div className="mt-10 space-y-12">
          {groupedPosts.map((group) => (
            <ArchiveYearSection
              key={group.year}
              year={group.year}
              posts={group.posts}
              yearSuffix={t.archive.yearSuffix}
            />
          ))}
        </div>
      ) : (
        <p className="mt-10 text-sm text-subtle">{t.archive.noPosts}</p>
      )}
    </Container>
  );
}
