import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SiteChrome } from "@/components/layout/site-chrome";
import { isValidLocale, locales } from "@/lib/i18n/types";
import { siteConfig } from "@/lib/site-config";
import { buildLocaleAlternates, buildLocalePath } from "@/lib/seo";

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

interface LocaleMetadataProps {
  params: Promise<{ locale: string }>;
}

function toOpenGraphLocale(locale: "ko" | "en") {
  return locale === "ko" ? "ko_KR" : "en_US";
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LocaleMetadataProps): Promise<Metadata> {
  /* 요청 URL의 로캘 파라미터를 검증합니다. */
  const { locale } = await params;
  if (!isValidLocale(locale)) {
    return {};
  }

  /* 로캘 기준 canonical/OG URL을 구성합니다. */
  const canonicalPath = buildLocalePath(locale);

  /* 레이아웃 기본 메타데이터를 반환합니다. */
  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: siteConfig.title,
      template: `%s | ${siteConfig.title}`,
    },
    description: siteConfig.description,
    openGraph: {
      type: "website",
      locale: toOpenGraphLocale(locale),
      url: `${siteConfig.url}${canonicalPath}`,
      title: siteConfig.title,
      description: siteConfig.description,
      siteName: siteConfig.title,
    },
    twitter: {
      card: "summary_large_image",
      title: siteConfig.title,
      description: siteConfig.description,
    },
    alternates: {
      canonical: canonicalPath,
      ...buildLocaleAlternates(),
      types: {
        "application/rss+xml": `${siteConfig.url}/feed.xml`,
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;
  if (!isValidLocale(locale)) {
    notFound();
  }

  return (
    <ThemeProvider>
      <div className="flex min-h-screen flex-col">
        <SiteChrome locale={locale}>{children}</SiteChrome>
      </div>
    </ThemeProvider>
  );
}
