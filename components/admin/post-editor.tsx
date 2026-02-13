"use client";

import { FrontmatterForm } from "@/components/admin/frontmatter-form";
import { MarkdownEditor } from "@/components/admin/markdown-editor";
import { usePostForm } from "@/hooks/admin/use-post-form";
import { usePostSubmit } from "@/hooks/admin/use-post-submit";

interface AdminPostEditorProps { mode: "create" | "edit"; slug?: string }

export function AdminPostEditor({ mode, slug }: AdminPostEditorProps) {
  const postForm = usePostForm({ mode, slug });
  const postSubmit = usePostSubmit({ mode, getSubmitFormState: postForm.getSubmitFormState });
  const errorMessage = postSubmit.error || postForm.loadError;

  if (postForm.isLoading) return <div className="rounded-xl border border-border bg-surface p-6 text-sm text-body">글 데이터를 불러오는 중입니다...</div>;

  return (
    <form className="space-y-6" onSubmit={postSubmit.handleSubmit}>
      <FrontmatterForm mode={mode} {...postForm} />
      <MarkdownEditor content={postForm.formState.content} onContentChange={postForm.setters.setContent} />
      {errorMessage ? <p className="rounded-md border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-400">{errorMessage}</p> : null}
      <div className="flex justify-end">
        <button type="submit" disabled={postSubmit.isSubmitting} className="rounded-md bg-accent px-5 py-2 text-sm font-semibold text-accent-fg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">{postSubmit.isSubmitting ? "저장 중..." : "저장"}</button>
      </div>
    </form>
  );
}
