import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Post } from "@/lib/velite";
import type { Locale } from "@/lib/i18n/types";
import { getDictionary } from "@/lib/i18n/get-dictionary";

interface PostNavProps {
  prev: Post | undefined;
  next: Post | undefined;
  locale: Locale;
}

export function PostNav({ prev, next, locale }: PostNavProps) {
  if (!prev && !next) return null;

  const t = getDictionary(locale);

  return (
    <nav className="post-nav mt-16 flex items-stretch gap-4 border-t border-border pt-8">
      {prev ? (
        <Link
          href={prev.permalink}
          className="group flex flex-1 flex-col items-start gap-1 rounded-[var(--theme-radius-lg)] border-[length:var(--theme-border-width)] border-border p-4 hover:bg-surface-hover shadow-[var(--theme-shadow)] hover:shadow-[var(--theme-shadow-hover)] transition-all"
        >
          <span className="flex items-center gap-1 text-xs text-subtle">
            <ChevronLeft className="h-3 w-3" />
            {t.post.prevPost}
          </span>
          <span className="text-sm font-medium group-hover:underline">
            {prev.title}
          </span>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
      {next ? (
        <Link
          href={next.permalink}
          className="group flex flex-1 flex-col items-end gap-1 rounded-[var(--theme-radius-lg)] border-[length:var(--theme-border-width)] border-border p-4 hover:bg-surface-hover shadow-[var(--theme-shadow)] hover:shadow-[var(--theme-shadow-hover)] transition-all"
        >
          <span className="flex items-center gap-1 text-xs text-subtle">
            {t.post.nextPost}
            <ChevronRight className="h-3 w-3" />
          </span>
          <span className="text-sm font-medium group-hover:underline">
            {next.title}
          </span>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
    </nav>
  );
}
