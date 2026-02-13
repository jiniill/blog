"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPostEditor } from "@/components/admin/post-editor";

export default function AdminNewPostPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
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
        <h2 className="text-2xl font-semibold text-heading">새 글 작성</h2>
      </div>
      <AdminPostEditor mode="create" />
    </div>
  );
}
