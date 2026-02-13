"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { FileText, Search, X } from "lucide-react";
import {
  createPostSearchEngine,
  searchPosts,
  type SearchablePost,
} from "@/lib/search";
import { formatDate, cn } from "@/lib/utils";

/* ── 타입 ── */

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  posts: SearchablePost[];
}

type Phase = "closed" | "opening" | "open" | "closing";
type PhaseAction =
  | { type: "OPEN_REQUESTED" }
  | { type: "ANIMATION_ENDED" }
  | { type: "CLOSE_REQUESTED" };

const NO_SELECTION = -1;

/* ── 유틸 ── */

function cycleNext(current: number, max: number) {
  return max < 0 ? NO_SELECTION : current >= max ? 0 : current + 1;
}

function cyclePrev(current: number, max: number) {
  return max < 0 ? NO_SELECTION : current <= 0 ? max : current - 1;
}

function phaseReducer(phase: Phase, action: PhaseAction): Phase {
  /* 열기 요청에 대한 전이를 처리합니다. */
  if (action.type === "OPEN_REQUESTED") {
    if (phase === "closed" || phase === "closing") return "opening";
    return phase;
  }

  /* 닫기 요청에 대한 전이를 처리합니다. */
  if (action.type === "CLOSE_REQUESTED") {
    if (phase === "opening" || phase === "open") return "closing";
    return phase;
  }

  /* 애니메이션 종료 시 최종 상태로 확정합니다. */
  if (action.type === "ANIMATION_ENDED") {
    if (phase === "opening") return "open";
    if (phase === "closing") return "closed";
  }

  return phase;
}

/* ── 컴포넌트 ── */

export function SearchModal({ isOpen, onClose, posts }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(NO_SELECTION);
  const [phase, dispatchPhase] = useReducer(phaseReducer, "closed");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const router = useRouter();

  const engine = useMemo(() => createPostSearchEngine(posts), [posts]);
  const results = useMemo(
    () => searchPosts(engine, posts, query),
    [engine, posts, query],
  );

  const clamped = useMemo(() => {
    if (results.length === 0) return NO_SELECTION;
    if (activeIndex < 0) return 0;
    return Math.min(activeIndex, results.length - 1);
  }, [activeIndex, results.length]);

  /* isOpen 변경에 따라 phase 상태 머신 액션을 디스패치합니다. */
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) dialog.showModal();
      dispatchPhase({ type: "OPEN_REQUESTED" });
    } else {
      dispatchPhase({ type: "CLOSE_REQUESTED" });
    }
  }, [isOpen]);

  /* opening 페이즈에 진입하면 입력창에 포커스를 맞춥니다. */
  useEffect(() => {
    if (phase === "opening") {
      inputRef.current?.focus();
    }
  }, [phase]);

  /* 닫기 요청: 부모에게 isOpen=false를 요청합니다. */
  const requestClose = useCallback(() => {
    if (phase === "closing" || phase === "closed") return;
    onClose();
  }, [phase, onClose]);

  /* 패널 애니메이션 완료 시 phase를 전이합니다. */
  const handlePanelAnimationEnd = useCallback(() => {
    if (phase === "closing") {
      dialogRef.current?.close();
      setQuery("");
      setActiveIndex(NO_SELECTION);
    }

    dispatchPhase({ type: "ANIMATION_ENDED" });
  }, [phase]);

  const navigateTo = useCallback(
    (permalink: string) => {
      router.push(permalink);
      requestClose();
    },
    [requestClose, router],
  );

  /* 활성 항목이 바뀌면 스크롤 뷰포트에 맞춥니다. */
  useEffect(() => {
    if (clamped < 0) return;
    const item = listRef.current?.children[clamped] as HTMLElement | undefined;
    item?.scrollIntoView({ block: "nearest" });
  }, [clamped]);

  /* 키보드 네비게이션을 처리합니다. */
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const lastIndex = results.length - 1;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => cycleNext(i, lastIndex));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => cyclePrev(i, lastIndex));
      return;
    }
    if (e.key === "Enter" && clamped >= 0) {
      e.preventDefault();
      navigateTo(results[clamped].permalink);
    }
  }

  if (phase === "closed") return null;

  const hasQuery = query.trim().length > 0;

  return (
    <dialog
      ref={dialogRef}
      className="search-dialog"
      data-state={phase}
      onCancel={(e) => {
        /* 브라우저 기본 ESC 닫기를 막고 애니메이션 플로우를 탑니다. */
        e.preventDefault();
        requestClose();
      }}
      onClick={(e) => {
        /* backdrop 영역(dialog 자체) 클릭 시 닫습니다. */
        if (e.target === e.currentTarget) requestClose();
      }}
    >
      <div
        className="search-panel w-full max-w-lg overflow-hidden rounded-[var(--theme-radius-lg)] border-[length:var(--theme-border-width)] border-border bg-background shadow-[var(--theme-shadow-hover)]"
        onClick={(e) => e.stopPropagation()}
        onAnimationEnd={handlePanelAnimationEnd}
      >
        {/* 검색 입력 영역 */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-subtle" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(NO_SELECTION);
            }}
            onKeyDown={handleKeyDown}
            placeholder="검색어를 입력하세요..."
            className="w-full bg-transparent text-sm text-foreground placeholder:text-subtle outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setActiveIndex(NO_SELECTION);
                inputRef.current?.focus();
              }}
              className="shrink-0 rounded-[var(--theme-radius-sm)] p-1 text-subtle transition-colors hover:text-foreground"
              aria-label="검색어 지우기"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* 결과 목록 */}
        <div className="max-h-[50vh] overflow-y-auto overscroll-contain p-2">
          {results.length > 0 ? (
            <ul ref={listRef} className="space-y-0.5">
              {results.map((post, index) => {
                const isActive = index === clamped;
                return (
                  <li key={post.slug}>
                    <button
                      type="button"
                      onClick={() => navigateTo(post.permalink)}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-[var(--theme-radius-md)] px-3 py-2.5 text-left transition-colors",
                        isActive
                          ? "bg-muted text-heading"
                          : "text-body hover:bg-surface-hover",
                      )}
                    >
                      <FileText className="mt-0.5 h-4 w-4 shrink-0 text-subtle" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {post.title}
                        </p>
                        <p className="mt-0.5 line-clamp-1 text-xs text-subtle">
                          {post.description}
                        </p>
                        <div className="mt-1 flex items-center gap-2 text-[11px] text-subtle">
                          <time dateTime={post.date}>
                            {formatDate(post.date)}
                          </time>
                          {post.tags.length > 0 && (
                            <span className="truncate">
                              {post.tags.map((t) => `#${t}`).join(" ")}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex flex-col items-center gap-2 py-12 text-subtle">
              <Search className="h-8 w-8 opacity-30" />
              <p className="text-sm">
                {hasQuery
                  ? "검색 결과가 없습니다"
                  : "게시글이 없습니다"}
              </p>
            </div>
          )}
        </div>

        {/* 키보드 힌트 푸터 */}
        <div className="flex items-center gap-4 border-t border-border px-4 py-2 text-[11px] text-subtle">
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-border-muted bg-surface px-1 py-0.5 font-mono text-[10px]">↑↓</kbd>
            이동
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-border-muted bg-surface px-1 py-0.5 font-mono text-[10px]">↵</kbd>
            열기
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-border-muted bg-surface px-1 py-0.5 font-mono text-[10px]">esc</kbd>
            닫기
          </span>
        </div>
      </div>
    </dialog>
  );
}
