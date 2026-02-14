import Link from "next/link";
import type { Locale } from "@/lib/i18n/types";

export function TagBadge({ tag, locale }: { tag: string; locale: Locale }) {
  return (
    <Link
      href={`/${locale}/tags/${encodeURIComponent(tag)}`}
      prefetch={false}
      className="inline-block rounded-[var(--theme-radius-sm)] border-[length:var(--theme-border-width)] border-border bg-muted px-2.5 py-0.5 text-xs text-body hover:bg-muted-hover shadow-[var(--theme-shadow)] transition-colors"
    >
      {tag}
    </Link>
  );
}
