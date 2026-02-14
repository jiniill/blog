"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import type { Locale } from "@/lib/i18n/types";

interface SiteChromeProps {
  children: React.ReactNode;
  locale: Locale;
}

export function SiteChrome({ children, locale }: SiteChromeProps) {
  const pathname = usePathname();
  const isAdminPath = pathname.startsWith("/admin");

  if (isAdminPath) {
    return (
      <main className="flex-1">
        {children}
      </main>
    );
  }

  return (
    <div className="contents">
      <Header locale={locale} />
      <main className="flex-1">{children}</main>
      <Footer locale={locale} />
    </div>
  );
}
