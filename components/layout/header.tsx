"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { SearchTrigger } from "@/components/search/search-trigger";
import { ThemeSelector } from "@/components/ui/theme-selector";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Container } from "./container";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileMenuId = "mobile-navigation";

  return (
    <header className="sticky top-0 z-50 border-b-[length:var(--theme-border-width)] border-header-border bg-header-bg backdrop-blur-[var(--theme-glass-blur)]">
      {/* 로고와 상단 액션 영역을 렌더링합니다. */}
      <Container className="flex h-14 items-center justify-between">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Blog
        </Link>

        <div className="flex items-center gap-2">
          <nav className="hidden items-center gap-6 sm:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-body transition-colors hover:text-link-hover"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <SearchTrigger />
          <ThemeSelector />
          <ThemeToggle />

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--theme-radius-md)] transition-colors hover:bg-surface-hover sm:hidden"
            aria-expanded={mobileOpen}
            aria-controls={mobileMenuId}
            aria-label={mobileOpen ? "메뉴 닫기" : "메뉴 열기"}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </Container>

      {/* 모바일 메뉴가 열렸을 때 링크 목록을 렌더링합니다. */}
      {mobileOpen && (
        <nav id={mobileMenuId} className="border-t border-border sm:hidden">
          <Container className="flex flex-col gap-2 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-[var(--theme-radius-md)] px-3 py-2 text-sm text-body transition-colors hover:bg-surface-hover"
              >
                {link.label}
              </Link>
            ))}
          </Container>
        </nav>
      )}
    </header>
  );
}
