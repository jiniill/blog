"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { notFound } from "next/navigation";
import type { AdminPostListItem } from "@/lib/admin/post-types";
import { defaultLocale, type Locale } from "@/lib/i18n/types";

const LOCALE_LABELS: Record<Locale, string> = {
  ko: "한국어",
  en: "English",
};

function deriveLocaleFromFilePath(filePath: string): Locale {
  const segments = filePath.split("/");
  const postsIndex = segments.indexOf("posts");
  if (postsIndex >= 0 && postsIndex + 1 < segments.length) {
    const candidate = segments[postsIndex + 1];
    if (candidate === "ko" || candidate === "en") return candidate;
  }
  return defaultLocale;
}

async function readErrorMessage(response: Response) {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error ?? "요청 처리에 실패했습니다.";
  } catch {
    return "요청 처리에 실패했습니다.";
  }
}

/** 모바일용 카드 레이아웃 */
function PostCard({
  post,
  deletingSlug,
  onDelete,
}: {
  post: AdminPostListItem;
  deletingSlug: string;
  onDelete: (slug: string) => void;
}) {
  return (
    <div className="space-y-2 rounded-lg border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/admin/edit/${encodeURIComponent(post.slug)}`}
          className="font-medium text-heading hover:text-link-hover"
        >
          {post.title}
        </Link>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${post.published ? "bg-green-500/10 text-green-500" : "bg-muted text-subtle"}`}
        >
          {post.published ? "공개" : "비공개"}
        </span>
      </div>
      <p className="text-xs text-subtle">{post.date}</p>
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {post.tags.map((tag) => (
            <span
              key={`${post.slug}-${tag}`}
              className="rounded-full bg-muted px-2 py-0.5 text-xs text-heading"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2 pt-1">
        <Link
          href={`/admin/edit/${encodeURIComponent(post.slug)}`}
          className="rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-body hover:bg-surface-hover"
        >
          수정
        </Link>
        <button
          type="button"
          onClick={() => onDelete(post.slug)}
          disabled={deletingSlug === post.slug}
          className="rounded-md border border-red-400/40 bg-red-500/10 px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {deletingSlug === post.slug ? "삭제 중..." : "삭제"}
        </button>
      </div>
    </div>
  );
}

/** 데스크톱용 테이블 행 */
function PostTableRow({
  post,
  deletingSlug,
  onDelete,
}: {
  post: AdminPostListItem;
  deletingSlug: string;
  onDelete: (slug: string) => void;
}) {
  return (
    <tr className="border-t border-border text-sm text-body">
      <td className="px-4 py-3">
        <Link
          href={`/admin/edit/${encodeURIComponent(post.slug)}`}
          className="font-medium text-heading hover:text-link-hover"
        >
          {post.title}
        </Link>
      </td>
      <td className="px-4 py-3">{post.date}</td>
      <td className="px-4 py-3">
        <span
          className={`rounded-full px-2 py-0.5 text-xs ${post.published ? "bg-green-500/10 text-green-500" : "bg-muted text-subtle"}`}
        >
          {post.published ? "공개" : "비공개"}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {post.tags.map((tag) => (
            <span
              key={`${post.slug}-${tag}`}
              className="rounded-full bg-muted px-2 py-0.5 text-xs text-heading"
            >
              {tag}
            </span>
          ))}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/edit/${encodeURIComponent(post.slug)}`}
            className="rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs text-body hover:bg-surface-hover"
          >
            수정
          </Link>
          <button
            type="button"
            onClick={() => onDelete(post.slug)}
            disabled={deletingSlug === post.slug}
            className="rounded-md border border-red-400/40 bg-red-500/10 px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deletingSlug === post.slug ? "삭제 중..." : "삭제"}
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function AdminPostListPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  const [posts, setPosts] = useState<AdminPostListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingSlug, setDeletingSlug] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isCancelled = false;

    async function loadPosts() {
      setIsLoading(true);
      setErrorMessage("");

      const response = await fetch("/api/admin/posts");
      if (!response.ok) {
        throw new Error(await readErrorMessage(response));
      }

      const data = (await response.json()) as { items: AdminPostListItem[] };
      if (!isCancelled) setPosts(data.items);
    }

    loadPosts()
      .catch((error: unknown) => {
        if (isCancelled) return;
        const message =
          error instanceof Error
            ? error.message
            : "목록을 불러올 수 없습니다.";
        setErrorMessage(message);
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  async function handleDelete(slug: string) {
    if (!window.confirm("정말로 이 글을 삭제하시겠습니까?")) return;

    setDeletingSlug(slug);
    setErrorMessage("");

    try {
      const response = await fetch(
        `/api/admin/posts/${encodeURIComponent(slug)}`,
        { method: "DELETE" },
      );
      if (!response.ok) throw new Error(await readErrorMessage(response));

      setPosts((prev) => prev.filter((p) => p.slug !== slug));
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "글 삭제에 실패했습니다.";
      setErrorMessage(message);
    } finally {
      setDeletingSlug("");
    }
  }

  const [activeLocale, setActiveLocale] = useState<Locale>(defaultLocale);

  const filteredPosts = useMemo(
    () => posts.filter((post) => deriveLocaleFromFilePath(post.filePath) === activeLocale),
    [posts, activeLocale],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-heading">글 목록</h2>
        <Link
          href={`/admin/new?locale=${activeLocale}`}
          className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-fg transition hover:opacity-90"
        >
          새 글 작성
        </Link>
      </div>

      {/* 언어 탭 */}
      <div className="flex gap-1 rounded-lg border border-border bg-surface p-1">
        {(["ko", "en"] as const).map((locale) => (
          <button
            key={locale}
            type="button"
            onClick={() => setActiveLocale(locale)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeLocale === locale
                ? "bg-accent text-accent-fg"
                : "text-subtle hover:text-heading hover:bg-surface-hover"
            }`}
          >
            {LOCALE_LABELS[locale]}
          </button>
        ))}
      </div>

      {errorMessage && (
        <p className="rounded-md border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {errorMessage}
        </p>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-lg border border-border bg-surface"
            />
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface px-6 py-12 text-center">
          <p className="text-body">{LOCALE_LABELS[activeLocale]} 글이 아직 없습니다.</p>
          <Link
            href={`/admin/new?locale=${activeLocale}`}
            className="mt-3 inline-block text-sm font-medium text-link hover:text-link-hover"
          >
            첫 글을 작성해 보세요
          </Link>
        </div>
      ) : (
        <>
          {/* 모바일: 카드 레이아웃 */}
          <div className="space-y-3 md:hidden">
            {filteredPosts.map((post) => (
              <PostCard
                key={post.slug}
                post={post}
                deletingSlug={deletingSlug}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* 데스크톱: 테이블 레이아웃 */}
          <div className="hidden overflow-hidden rounded-xl border border-border bg-background md:block">
            <table className="w-full table-fixed border-collapse text-left">
              <thead className="bg-surface">
                <tr className="text-xs uppercase tracking-wide text-subtle">
                  <th className="w-2/5 px-4 py-3">제목</th>
                  <th className="w-[100px] px-4 py-3">날짜</th>
                  <th className="w-[80px] px-4 py-3">상태</th>
                  <th className="w-1/5 px-4 py-3">태그</th>
                  <th className="w-[140px] px-4 py-3">작업</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((post) => (
                  <PostTableRow
                    key={post.slug}
                    post={post}
                    deletingSlug={deletingSlug}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
