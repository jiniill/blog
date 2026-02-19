import type { Locale } from "@/lib/i18n/types";
import { siteConfig } from "@/lib/site-config";

const DEFAULT_LOCALE: Locale = "ko";

function getLocaleBasePath(locale: Locale) {
  return `/${locale}`;
}

export function buildLocalePath(locale: Locale, path = "") {
  return `${getLocaleBasePath(locale)}${path}`;
}

export function buildLocaleAlternates(path = "") {
  return {
    languages: {
      ko: `${siteConfig.url}${getLocaleBasePath("ko")}${path}`,
      en: `${siteConfig.url}${getLocaleBasePath("en")}${path}`,
      "x-default": `${siteConfig.url}${getLocaleBasePath(DEFAULT_LOCALE)}${path}`,
    },
  };
}
