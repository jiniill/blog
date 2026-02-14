"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { SearchModal } from "@/components/search/search-modal";
import { getPublishedTagCounts, getSortedPublishedPosts } from "@/lib/posts";
import type { Locale } from "@/lib/i18n/types";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { toSearchablePosts } from "@/lib/search";

interface SearchTriggerProps {
  locale: Locale;
}

export function SearchTrigger({ locale }: SearchTriggerProps) {
  const t = getDictionary(locale);

  /* 검색 모달 열림 상태와 검색 인덱스 데이터를 준비합니다. */
  const [isOpen, setIsOpen] = useState(false);
  const searchablePosts = useMemo(
    () => toSearchablePosts(getSortedPublishedPosts(locale)),
    [locale],
  );
  const tags = useMemo(
    () => getPublishedTagCounts(locale).map(([tag]) => tag),
    [locale],
  );

  /* Cmd/Ctrl + K 단축키로 검색 모달을 엽니다. */
  useEffect(() => {
    function handleShortcut(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
    }

    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, []);

  /* 트리거 버튼과 검색 모달을 렌더링합니다. */
  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--theme-radius-md)] text-subtle transition-colors hover:bg-surface-hover hover:text-foreground"
        aria-label={t.search.ariaLabel}
      >
        <Search className="h-4 w-4" />
      </button>

      <SearchModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        posts={searchablePosts}
        tags={tags}
        locale={locale}
      />
    </>
  );
}
