"use client";

import Link from "next/link";
import { notFound, useSearchParams } from "next/navigation";
import { AdminPostEditor } from "@/components/admin/post-editor";
import { defaultLocale, isValidLocale } from "@/lib/i18n/types";

const LOCALE_DISPLAY: Record<string, string> = {
  ko: "한국어",
  en: "English",
};

export default function AdminNewPostPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  const searchParams = useSearchParams();
  const rawLocale = searchParams.get("locale") ?? defaultLocale;
  const locale = isValidLocale(rawLocale) ? rawLocale : defaultLocale;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link
          href="/admin"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface text-subtle transition hover:bg-surface-hover hover:text-heading"
          aria-label="글 목록으로 돌아가기"
        >
          &larr;
        </Link>
        <h2 className="text-2xl font-semibold text-heading">새 글 작성</h2>
        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-heading">
          {LOCALE_DISPLAY[locale] ?? locale}
        </span>
      </div>
      <AdminPostEditor mode="create" locale={locale} />
    </div>
  );
}
