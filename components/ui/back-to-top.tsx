"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// 사용자가 본문을 충분히 읽은 뒤에만 버튼을 보여 시야 방해를 줄입니다.
const SHOW_BUTTON_SCROLL_Y = 300;

function resolveScrollBehavior() {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  return prefersReducedMotion ? "auto" : "smooth";
}

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // 스크롤 위치에 따라 버튼 표시 여부를 갱신합니다.
  useEffect(() => {
    let rafId = 0;

    const updateVisibility = () => {
      setIsVisible(window.scrollY >= SHOW_BUTTON_SCROLL_Y);
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateVisibility);
    };

    updateVisibility();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // 우하단 고정 버튼을 렌더링합니다.
  return (
    <button
      type="button"
      aria-label="맨 위로 이동"
      onClick={() =>
        window.scrollTo({ top: 0, behavior: resolveScrollBehavior() })
      }
      className={cn(
        "back-to-top fixed right-6 bottom-6 z-40 inline-flex h-11 w-11 items-center justify-center rounded-full border-[length:var(--theme-border-width)] border-border bg-surface text-heading shadow-[var(--theme-shadow)] transition-opacity duration-200 motion-reduce:transition-none",
        isVisible ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <ArrowUp className="h-4 w-4" />
    </button>
  );
}
