"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { AdminPostEditor } from "@/components/admin/post-editor";

function resolveSlugFromParams(params: { slug?: string | string[] }) {
  if (typeof params.slug === "string") {
    return params.slug;
  }
  if (Array.isArray(params.slug)) {
    return params.slug[0];
  }
  return "";
}

export default function AdminEditPostPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  const params = useParams<{ slug: string | string[] }>();
  const slug = resolveSlugFromParams(params);

  if (!slug) {
    return (
      <p className="rounded-md border border-border bg-surface px-4 py-3 text-sm text-body">
        유효한 slug를 찾을 수 없습니다.
      </p>
    );
  }

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
        <h2 className="text-2xl font-semibold text-heading">글 수정</h2>
      </div>
      <AdminPostEditor mode="edit" slug={slug} />
    </div>
  );
}
