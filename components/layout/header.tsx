"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { SearchTrigger } from "@/components/search/search-trigger";
import { SubscribeModal } from "@/components/subscribe/subscribe-modal";
import { ThemeSelector } from "@/components/ui/theme-selector";
import { Container } from "./container";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const pathname = usePathname();
  const mobileMenuId = "mobile-navigation";
  const navRef = useRef<HTMLElement>(null);
  const [indicator, setIndicator] = useState<{
    left: number;
    width: number;
  } | null>(null);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  /* 활성 링크 위치를 측정하여 슬라이딩 인디케이터를 배치합니다. */
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const activeEl = nav.querySelector<HTMLElement>("[data-active=true]");
    if (!activeEl) {
      setIndicator(null);
      return;
    }

    setIndicator({
      left: activeEl.offsetLeft,
      width: activeEl.offsetWidth,
    });
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b-[length:var(--theme-border-width)] border-header-border bg-header-bg backdrop-blur-[var(--theme-glass-blur)]">
      <Container className="flex h-16 items-center justify-between">
        {/* 로고 */}
        <Link href="/" className="text-lg font-bold tracking-tight">
          Blog
        </Link>

        {/* 데스크톱: 필 형태 중앙 내비게이션 */}
        <nav
          ref={navRef}
          className="relative hidden items-center gap-1 rounded-full border border-border bg-muted px-1.5 py-1 sm:flex"
        >
          {/* iOS 스타일 슬라이딩 인디케이터 */}
          {indicator && (
            <span
              className="pointer-events-none absolute top-1 bottom-1 rounded-full bg-background shadow-sm transition-all duration-300 ease-out"
              style={{ left: indicator.left, width: indicator.width }}
            />
          )}

          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                prefetch={false}
                data-active={active}
                className={`relative z-10 rounded-full px-4 py-1.5 text-sm transition-colors duration-200 ${
                  active
                    ? "font-semibold text-heading"
                    : "font-medium text-body hover:text-heading"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* 데스크톱: 우측 액션 */}
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1 sm:flex">
            <SearchTrigger />
            <ThemeSelector />
          </div>
          <button
            type="button"
            onClick={() => setSubscribeOpen(true)}
            className="hidden rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-fg shadow-lg transition-all hover:opacity-90 sm:inline-flex"
          >
            Subscribe
          </button>
          <SubscribeModal
            isOpen={subscribeOpen}
            onClose={() => setSubscribeOpen(false)}
          />

          {/* 모바일: 햄버거 */}
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--theme-radius-md)] transition-colors hover:bg-surface-hover sm:hidden"
            aria-expanded={mobileOpen}
            aria-controls={mobileMenuId}
            aria-label={mobileOpen ? "메뉴 닫기" : "메뉴 열기"}
          >
            {mobileOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </button>
        </div>
      </Container>

      {/* 모바일 메뉴 */}
      {mobileOpen && (
        <nav id={mobileMenuId} className="border-t border-border sm:hidden">
          <Container className="flex flex-col gap-2 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`rounded-[var(--theme-radius-md)] px-3 py-2 text-sm transition-colors ${
                  isActive(link.href)
                    ? "bg-muted font-semibold text-heading"
                    : "text-body hover:bg-surface-hover"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex items-center gap-2 border-t border-border pt-3">
              <SearchTrigger />
              <ThemeSelector />
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  setSubscribeOpen(true);
                }}
                className="ml-auto rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-accent-fg transition-opacity hover:opacity-90"
              >
                Subscribe
              </button>
            </div>
          </Container>
        </nav>
      )}
    </header>
  );
}
