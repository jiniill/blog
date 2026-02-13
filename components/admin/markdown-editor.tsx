"use client";

import { useEffect, useState, type KeyboardEvent } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

const PREVIEW_DEBOUNCE_MS = 300;
const EDITOR_MIN_HEIGHT_PX = 500;
const EDITOR_TEXTAREA_CLASS_NAME =
  "w-full resize-y rounded-md border border-border bg-surface p-3 font-mono text-sm text-body outline-none transition focus:ring-2 focus:ring-accent";

type EditorViewMode = "split" | "editor" | "preview";

interface MarkdownEditorProps {
  content: string;
  onContentChange: (value: string) => void;
}

interface ViewModeButtonProps {
  label: string;
  value: EditorViewMode;
  currentValue: EditorViewMode;
  onSelect: (value: EditorViewMode) => void;
}

function useDebouncedContent(content: string) {
  const [debouncedContent, setDebouncedContent] = useState(content);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedContent(content);
    }, PREVIEW_DEBOUNCE_MS);
    return () => window.clearTimeout(timeoutId);
  }, [content]);

  return debouncedContent;
}

function ViewModeButton({ label, value, currentValue, onSelect }: ViewModeButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={cn(
        "rounded-md px-3 py-1 text-xs transition",
        currentValue === value
          ? "bg-accent text-accent-fg"
          : "bg-surface text-subtle hover:text-heading",
      )}
    >
      {label}
    </button>
  );
}

function EditorPane({
  content,
  isSplitView,
  onContentChange,
}: {
  content: string;
  isSplitView: boolean;
  onContentChange: (value: string) => void;
}) {
  function handleEditorKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Tab") return;
    event.preventDefault();

    const cursorStart = event.currentTarget.selectionStart;
    const cursorEnd = event.currentTarget.selectionEnd;
    const nextContent = `${content.slice(0, cursorStart)}  ${content.slice(cursorEnd)}`;
    onContentChange(nextContent);

    requestAnimationFrame(() => {
      const nextCursor = cursorStart + 2; // 이유: 탭 입력을 스페이스 2칸으로 대체합니다.
      event.currentTarget.setSelectionRange(nextCursor, nextCursor);
    });
  }

  return (
    <div className={cn("p-4", isSplitView && "md:w-1/2 md:border-r md:border-border")}>
      <textarea
        value={content}
        onChange={(event) => onContentChange(event.target.value)}
        onKeyDown={handleEditorKeyDown}
        spellCheck={false}
        className={EDITOR_TEXTAREA_CLASS_NAME}
        style={{ minHeight: EDITOR_MIN_HEIGHT_PX }}
      />
    </div>
  );
}

function PreviewPane({ content, isSplitView }: { content: string; isSplitView: boolean }) {
  return (
    <div className={cn("bg-background p-4", isSplitView && "md:w-1/2")}>
      <div
        className="overflow-y-auto rounded-md border border-border bg-background p-4"
        style={{ minHeight: EDITOR_MIN_HEIGHT_PX }}
      >
        <article className="prose max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content || "미리보기 내용이 없습니다."}
          </ReactMarkdown>
        </article>
      </div>
    </div>
  );
}

export function MarkdownEditor({ content, onContentChange }: MarkdownEditorProps) {
  const [viewMode, setViewMode] = useState<EditorViewMode>("split");
  const debouncedContent = useDebouncedContent(content);
  const isSplitView = viewMode === "split";
  const showEditor = isSplitView || viewMode === "editor";
  const showPreview = isSplitView || viewMode === "preview";

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-heading">에디터 / 미리보기</h2>
        <div className="flex items-center gap-1">
          <ViewModeButton label="분할" value="split" currentValue={viewMode} onSelect={setViewMode} />
          <ViewModeButton label="에디터" value="editor" currentValue={viewMode} onSelect={setViewMode} />
          <ViewModeButton
            label="미리보기"
            value="preview"
            currentValue={viewMode}
            onSelect={setViewMode}
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row">
        {showEditor && (
          <EditorPane content={content} isSplitView={isSplitView} onContentChange={onContentChange} />
        )}
        {showPreview && <PreviewPane content={debouncedContent} isSplitView={isSplitView} />}
      </div>
    </section>
  );
}
