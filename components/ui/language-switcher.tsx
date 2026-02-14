"use client";

import { usePathname, useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n/types";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { Globe } from "lucide-react";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

interface LanguageSwitcherProps {
  locale: Locale;
}

export function LanguageSwitcher({ locale }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
  const t = getDictionary(locale);
  const targetLocale: Locale = locale === "ko" ? "en" : "ko";

  function handleSwitch() {
    document.cookie = `NEXT_LOCALE=${targetLocale};path=/;max-age=${COOKIE_MAX_AGE};SameSite=Lax`;
    const newPath = pathname.replace(`/${locale}`, `/${targetLocale}`);
    router.push(newPath);
  }

  return (
    <button
      type="button"
      onClick={handleSwitch}
      className="inline-flex h-9 items-center gap-1.5 rounded-[var(--theme-radius-md)] px-2 text-subtle transition-colors hover:bg-surface-hover hover:text-foreground"
      aria-label={t.language.switchTo}
      title={t.language.switchTo}
    >
      <Globe className="h-4 w-4" />
      <span className="text-xs font-medium">{t.language.code}</span>
    </button>
  );
}
