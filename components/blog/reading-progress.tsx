"use client";

import { useEffect, useRef } from "react";

const ARTICLE_SELECTOR = "[data-post-article]";
const EMPTY_PROGRESS = 0;
const FULL_PROGRESS = 100;

function clampProgress(progress: number) {
  return Math.min(FULL_PROGRESS, Math.max(EMPTY_PROGRESS, progress));
}

function calculateProgress(article: HTMLElement) {
  const articleTop = window.scrollY + article.getBoundingClientRect().top;
  const scrollableDistance = article.offsetHeight - window.innerHeight;

  if (scrollableDistance <= EMPTY_PROGRESS) {
    return window.scrollY >= articleTop ? FULL_PROGRESS : EMPTY_PROGRESS;
  }

  const currentDistance = window.scrollY - articleTop;
  const rawProgress = (currentDistance / scrollableDistance) * FULL_PROGRESS;
  return clampProgress(rawProgress);
}

function setBarScale(bar: HTMLDivElement, progress: number) {
  bar.style.transform = `scaleX(${progress / FULL_PROGRESS})`;
}

export function ReadingProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  // 스크롤/리사이즈에 맞춰 읽기 진행률을 계산합니다.
  useEffect(() => {
    const bar = barRef.current;
    const article = document.querySelector<HTMLElement>(ARTICLE_SELECTOR);
    if (!bar || !article) return;

    let rafId = 0;

    const updateProgress = () => {
      setBarScale(bar, calculateProgress(article));
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // 문서 최상단 고정 진행 바를 렌더링합니다.
  return (
    <div className="reading-progress pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5">
      <div
        ref={barRef}
        className="h-full origin-left bg-accent"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
