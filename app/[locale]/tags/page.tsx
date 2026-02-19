import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { getPublishedTagCounts } from "@/lib/posts";
import { siteConfig } from "@/lib/site-config";
import { isValidLocale, type Locale } from "@/lib/i18n/types";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildLocaleAlternates, buildLocalePath } from "@/lib/seo";

interface TagsPageProps {
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
}: TagsPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  if (!isValidLocale(rawLocale)) return {};
  const t = getDictionary(rawLocale);
  const canonicalPath = buildLocalePath(rawLocale, "/tags");

  return {
    title: t.tags.title,
    description: t.tags.description,
    alternates: { canonical: canonicalPath, ...buildLocaleAlternates("/tags") },
    openGraph: { url: `${siteConfig.url}${canonicalPath}` },
  };
}

export default async function TagsPage({ params }: TagsPageProps) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const t = getDictionary(locale);
  const tags = getPublishedTagCounts(locale);

  return (
    <Container className="py-16">
      <h1 className="text-3xl font-bold tracking-tight">{t.tags.title}</h1>
      <div className="mt-10 flex flex-wrap gap-3">
        {tags.length > 0 ? (
          tags.map(([tag, count]) => (
            <Link
              key={tag}
              href={`/${locale}/tags/${encodeURIComponent(tag)}`}
              prefetch={false}
              className="inline-flex items-center gap-1.5 rounded-[var(--theme-radius-sm)] border-[length:var(--theme-border-width)] border-border bg-muted px-3 py-1.5 text-sm text-body hover:bg-muted-hover shadow-[var(--theme-shadow)] transition-colors"
            >
              {tag}
              <span className="text-xs text-subtle">{count}</span>
            </Link>
          ))
        ) : (
          <p className="text-sm text-subtle">{t.tags.noTags}</p>
        )}
      </div>
    </Container>
  );
}
