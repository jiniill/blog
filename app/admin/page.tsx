"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import type { AdminPostListItem } from "@/lib/admin/post-types";

async function readErrorMessage(response: Response) {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error ?? "요청 처리에 실패했습니다.";
  } catch {
    return "요청 처리에 실패했습니다.";
  }
}

export default function AdminPostListPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  // 목록/삭제 상태를 관리합니다.
  const [posts, setPosts] = useState<AdminPostListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingSlug, setDeletingSlug] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // 최초 진입 시 글 목록을 불러옵니다.
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
      if (!isCancelled) {
        setPosts(data.items);
      }
    }

    loadPosts()
      .catch((error: unknown) => {
        if (isCancelled) {
          return;
        }
        const message = error instanceof Error ? error.message : "목록을 불러올 수 없습니다.";
        setErrorMessage(message);
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  async function handleDelete(slug: string) {
    // 사용자 확인 뒤 삭제 API를 호출하고 목록에서 제거합니다.
    if (!window.confirm("정말로 이 글을 삭제하시겠습니까?")) {
      return;
    }

    setDeletingSlug(slug);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/admin/posts/${encodeURIComponent(slug)}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(await readErrorMessage(response));
      }

      setPosts((prevPosts) => prevPosts.filter((post) => post.slug !== slug));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "글 삭제에 실패했습니다.";
      setErrorMessage(message);
    } finally {
      setDeletingSlug("");
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-surface px-4 py-6 text-sm text-body">
        목록을 불러오는 중입니다...
      </div>
    );
  }

  // 데스크톱 전용 테이블 레이아웃으로 목록을 표시합니다.
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-heading">글 목록</h2>
        <Link
          href="/admin/new"
          className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-fg transition hover:opacity-90"
        >
          새 글 작성
        </Link>
      </div>

      {errorMessage && (
        <p className="rounded-md border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {errorMessage}
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-background">
        <table className="w-full table-fixed border-collapse text-left">
          <thead className="bg-surface">
            <tr className="text-xs uppercase tracking-wide text-subtle">
              <th className="w-2/5 px-4 py-3">제목</th>
              <th className="w-1/6 px-4 py-3">날짜</th>
              <th className="w-1/6 px-4 py-3">공개</th>
              <th className="w-1/5 px-4 py-3">태그</th>
              <th className="w-[140px] px-4 py-3">작업</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.slug} className="border-t border-border text-sm text-body">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/edit/${encodeURIComponent(post.slug)}`}
                    className="font-medium text-heading hover:text-link-hover"
                  >
                    {post.title}
                  </Link>
                  <p className="mt-1 text-xs text-subtle">{post.filePath}</p>
                </td>
                <td className="px-4 py-3">{post.date}</td>
                <td className="px-4 py-3">{post.published ? "공개" : "비공개"}</td>
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
                      onClick={() => handleDelete(post.slug)}
                      disabled={deletingSlug === post.slug}
                      className="rounded-md border border-red-400/40 bg-red-500/10 px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingSlug === post.slug ? "삭제 중..." : "삭제"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
