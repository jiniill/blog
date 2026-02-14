"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n/types";
import { getDictionary } from "@/lib/i18n/get-dictionary";

const SKELETON_ROW_COUNT = 5;

interface PopularPostMeta {
  title: string;
  permalink: string;
}

interface PopularPostItem {
  slug: string;
  count: number;
}

interface PopularResponse {
  items?: PopularPostItem[];
}

interface PopularPostsProps {
  postsBySlug: Record<string, PopularPostMeta>;
  locale: Locale;
}

function normalizePopularItems(payload: PopularResponse) {
  if (!Array.isArray(payload.items)) return [];
  return payload.items;
}

function buildPopularList(
  items: PopularPostItem[],
  postsBySlug: Record<string, PopularPostMeta>,
) {
  return items.flatMap((item) => {
    const post = postsBySlug[item.slug];
    if (!post) return [];

    return [{ ...item, ...post }];
  });
}

function renderSkeletonRows() {
  return (
    <ol className="space-y-3">
      {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
        <li key={index} className="flex items-center gap-3">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border text-xs font-semibold text-subtle">
            {index + 1}
          </span>
          <span className="skeleton-glow inline-block h-4 w-44 rounded" />
        </li>
      ))}
    </ol>
  );
}

function usePopularPostItems() {
  const [items, setItems] = useState<PopularPostItem[] | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/popular", { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((payload: PopularResponse) => {
        setItems(normalizePopularItems(payload));
      })
      .catch((error) => {
        if (error?.name !== "AbortError") {
          setHasError(true);
          setItems([]);
        }
      });

    return () => controller.abort();
  }, []);

  return { items, hasError };
}

export function PopularPosts({ postsBySlug, locale }: PopularPostsProps) {
  const { items, hasError } = usePopularPostItems();
  const t = getDictionary(locale);

  const popularPosts = useMemo(() => {
    if (!items) return [];
    return buildPopularList(items, postsBySlug);
  }, [items, postsBySlug]);

  if (items === null) return renderSkeletonRows();

  if (hasError || popularPosts.length === 0) {
    return (
      <p className="text-sm text-subtle">{t.home.noPopularPosts}</p>
    );
  }

  const intlLocale = locale === "ko" ? "ko-KR" : "en-US";

  return (
    <ol className="space-y-2">
      {popularPosts.map((post, index) => (
        <li key={post.slug}>
          <Link
            href={post.permalink}
            prefetch={false}
            className="flex items-center gap-3 rounded-[var(--theme-radius-md)] px-2 py-2 transition-colors hover:bg-surface-hover"
          >
            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border text-xs font-semibold text-subtle">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-heading">
                {post.title}
              </p>
              <p className="text-xs text-subtle">
                {t.home.views.replace(
                  "{count}",
                  post.count.toLocaleString(intlLocale),
                )}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ol>
  );
}
