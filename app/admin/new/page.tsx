"use client";

import { notFound } from "next/navigation";
import { AdminPostEditor } from "@/components/admin/post-editor";

export default function AdminNewPostPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-heading">새 글 작성</h2>
      <AdminPostEditor mode="create" />
    </div>
  );
}
