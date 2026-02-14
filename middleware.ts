import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isValidLocale, type Locale } from "@/lib/i18n/types";

const LOCALE_COOKIE_NAME = "NEXT_LOCALE";
const FALLBACK_LOCALE: Locale = "en";

function getLocaleFromPath(pathname: string): Locale | undefined {
  const localeSegment = pathname.split("/")[1];
  return isValidLocale(localeSegment) ? localeSegment : undefined;
}

function getLocaleFromCookie(request: NextRequest): Locale | undefined {
  const cookieLocale = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
  if (!cookieLocale) {
    return undefined;
  }

  return isValidLocale(cookieLocale) ? cookieLocale : undefined;
}

function getLocaleFromCountry(request: NextRequest): Locale | undefined {
  const countryCode = request.headers.get("x-vercel-ip-country");
  if (!countryCode) {
    return undefined;
  }

  return countryCode.toUpperCase() === "KR" ? "ko" : "en";
}

function getLocaleFromAcceptLanguage(request: NextRequest): Locale | undefined {
  const acceptLanguage = request.headers.get("accept-language");
  if (!acceptLanguage) {
    return undefined;
  }

  return acceptLanguage.toLowerCase().includes("ko") ? "ko" : "en";
}

function detectLocale(request: NextRequest): Locale {
  return (
    getLocaleFromCookie(request) ??
    getLocaleFromCountry(request) ??
    getLocaleFromAcceptLanguage(request) ??
    FALLBACK_LOCALE
  );
}

function withLocaleCookie(response: NextResponse, locale: Locale) {
  response.cookies.set({
    name: LOCALE_COOKIE_NAME,
    value: locale,
    path: "/",
  });

  return response;
}

function shouldSkipRouting(pathname: string) {
  if (pathname.startsWith("/api") || pathname.startsWith("/_next")) {
    return true;
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/static")) {
    return true;
  }

  return /\.[^/]+$/.test(pathname);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (shouldSkipRouting(pathname)) {
    return NextResponse.next();
  }

  const localeFromPath = getLocaleFromPath(pathname);
  if (localeFromPath) {
    return withLocaleCookie(NextResponse.next(), localeFromPath);
  }

  const locale = detectLocale(request);
  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;

  return withLocaleCookie(NextResponse.rewrite(rewriteUrl), locale);
}

export const config = {
  matcher: [
    "/((?!api|_next|admin|static|feed\\.xml|sitemap\\.xml|robots\\.txt|.*\\..*).*)",
  ],
};
