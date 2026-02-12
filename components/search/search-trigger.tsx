"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { SearchModal } from "@/components/search/search-modal";
import { getSortedPublishedPosts } from "@/lib/posts";
import { toSearchablePosts } from "@/lib/search";

export function SearchTrigger() {
  const [isOpen, setIsOpen] = useState(false);
  const searchablePosts = useMemo(
    () => toSearchablePosts(getSortedPublishedPosts()),
    [],
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

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--theme-radius-md)] text-subtle transition-colors hover:bg-surface-hover hover:text-foreground"
        aria-label="검색 (⌘K)"
      >
        <Search className="h-4 w-4" />
      </button>

      <SearchModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        posts={searchablePosts}
      />
    </>
  );
}
