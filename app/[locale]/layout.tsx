import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SiteChrome } from "@/components/layout/site-chrome";
import { isValidLocale, locales } from "@/lib/i18n/types";
import { siteConfig } from "@/lib/site-config";

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
  const { locale } = await params;
  if (!isValidLocale(locale)) {
    return {};
  }

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
      url: siteConfig.url,
      title: siteConfig.title,
      description: siteConfig.description,
      siteName: siteConfig.title,
    },
    alternates: {
      languages: {
        ko: `${siteConfig.url}/ko`,
        en: `${siteConfig.url}/en`,
      },
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
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.lang="${locale}"`,
        }}
      />
      <ThemeProvider>
        <div className="flex min-h-screen flex-col">
          <SiteChrome locale={locale}>{children}</SiteChrome>
        </div>
      </ThemeProvider>
    </>
  );
}
