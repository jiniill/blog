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

/** 서버 컴포넌트에서 locale을 읽을 수 있도록 request 헤더에 추가합니다. */
function withLocaleHeader(request: NextRequest, locale: Locale) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-locale", locale);
  return { request: { headers: requestHeaders } };
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (shouldSkipRouting(pathname)) {
    return NextResponse.next();
  }

  const localeFromPath = getLocaleFromPath(pathname);
  if (localeFromPath) {
    const response = NextResponse.next(withLocaleHeader(request, localeFromPath));
    return withLocaleCookie(response, localeFromPath);
  }

  const locale = detectLocale(request);
  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;

  const response = NextResponse.rewrite(rewriteUrl, withLocaleHeader(request, locale));
  return withLocaleCookie(response, locale);
}

export const config = {
  matcher: [
    "/((?!api|_next|admin|static|feed\\.xml|sitemap\\.xml|robots\\.txt|.*\\..*).*)",
  ],
};
