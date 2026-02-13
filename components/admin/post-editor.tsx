"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { FrontmatterForm } from "@/components/admin/frontmatter-form";
import { MarkdownEditor } from "@/components/admin/markdown-editor";
import { usePostForm } from "@/hooks/admin/use-post-form";
import { usePostSubmit } from "@/hooks/admin/use-post-submit";

interface AdminPostEditorProps {
  mode: "create" | "edit";
  slug?: string;
}

function EditorSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* 프론트매터 스켈레톤 */}
      <div className="rounded-xl border border-border bg-background p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2 space-y-2">
            <div className="h-4 w-12 rounded bg-muted" />
            <div className="h-9 rounded-md bg-muted" />
          </div>
          <div className="sm:col-span-2 space-y-2">
            <div className="h-4 w-10 rounded bg-muted" />
            <div className="h-9 rounded-md bg-muted" />
          </div>
          <div className="sm:col-span-2 space-y-2">
            <div className="h-4 w-10 rounded bg-muted" />
            <div className="h-20 rounded-md bg-muted" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-10 rounded bg-muted" />
            <div className="h-9 rounded-md bg-muted" />
          </div>
          <div className="flex items-center gap-2 self-end">
            <div className="h-4 w-4 rounded bg-muted" />
            <div className="h-4 w-16 rounded bg-muted" />
          </div>
        </div>
      </div>
      {/* 에디터 스켈레톤 */}
      <div className="rounded-xl border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="h-4 w-28 rounded bg-muted" />
          <div className="flex gap-1">
            <div className="h-6 w-12 rounded-md bg-muted" />
            <div className="h-6 w-14 rounded-md bg-muted" />
            <div className="h-6 w-16 rounded-md bg-muted" />
          </div>
        </div>
        <div className="p-4">
          <div className="h-[300px] rounded-md bg-muted md:h-[500px]" />
        </div>
      </div>
    </div>
  );
}

export function AdminPostEditor({ mode, slug }: AdminPostEditorProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const postForm = usePostForm({ mode, slug });
  const postSubmit = usePostSubmit({ mode, getSubmitFormState: postForm.getSubmitFormState });
  const errorMessage = postSubmit.error || postForm.loadError;

  // Cmd/Ctrl+S 키보드 단축키
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === "s") {
        event.preventDefault();
        formRef.current?.requestSubmit();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (postForm.isLoading) return <EditorSkeleton />;

  return (
    <form ref={formRef} className="space-y-6 pb-20" onSubmit={postSubmit.handleSubmit}>
      <FrontmatterForm mode={mode} {...postForm} />
      <MarkdownEditor content={postForm.formState.content} onContentChange={postForm.setters.setContent} />

      {errorMessage && (
        <p className="rounded-md border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {errorMessage}
        </p>
      )}

      {/* 하단 고정 저장 바 */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            href="/admin"
            className="rounded-md border border-border bg-background px-4 py-2 text-sm text-body transition hover:bg-surface-hover"
          >
            취소
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-subtle sm:inline">
              Ctrl+S로 저장
            </span>
            <button
              type="submit"
              disabled={postSubmit.isSubmitting}
              className="rounded-md bg-accent px-5 py-2 text-sm font-semibold text-accent-fg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {postSubmit.isSubmitting ? "저장 중..." : "저장"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
