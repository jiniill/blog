"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const HEADING_ANCHOR_SELECTOR = "h2 a[href], h3 a[href], h4 a[href]";
const COPY_FEEDBACK_DURATION_MS = 1500;

function toAbsoluteUrl(href: string) {
  return new URL(href, window.location.href).toString();
}

export function HeadingCopyWrapper({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isCopied, setIsCopied] = useState(false);

  // 헤딩 앵커 클릭을 위임 처리해 URL 복사를 수행합니다.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const onHeadingAnchorClick = async (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const headingAnchor = target.closest(
        HEADING_ANCHOR_SELECTOR,
      ) as HTMLAnchorElement | null;
      if (!headingAnchor || !container.contains(headingAnchor)) return;

      const headingHref = headingAnchor.getAttribute("href");
      if (!headingHref) return;

      event.preventDefault();

      try {
        await navigator.clipboard.writeText(toAbsoluteUrl(headingHref));
        setIsCopied(true);
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => setIsCopied(false), COPY_FEEDBACK_DURATION_MS);
      } catch (error) {
        console.error("헤딩 링크 복사에 실패했습니다.", error);
      }
    };

    container.addEventListener("click", onHeadingAnchorClick);

    return () => {
      clearTimeout(timeoutId);
      container.removeEventListener("click", onHeadingAnchorClick);
    };
  }, []);

  // 본문과 복사 완료 토스트를 함께 렌더링합니다.
  return (
    <div ref={containerRef}>
      {children}
      <div
        aria-live="polite"
        className={cn(
          "pointer-events-none fixed top-20 right-4 z-50 rounded-[var(--theme-radius-md)] border border-border bg-surface px-3 py-1.5 text-xs text-heading shadow-[var(--theme-shadow)] transition-opacity duration-200 motion-reduce:transition-none",
          isCopied ? "opacity-100" : "opacity-0",
        )}
      >
        복사됨
      </div>
    </div>
  );
}
