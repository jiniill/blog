"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { siteConfig } from "@/lib/site-config";

const Giscus = dynamic(() => import("@giscus/react"), {
  ssr: false,
});

export function Comments() {
  // 댓글 렌더링 제어 상태 준비
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [shouldLoadComments, setShouldLoadComments] = useState(false);
  const commentsRef = useRef<HTMLDivElement>(null);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration 안전을 위한 표준 패턴
  useEffect(() => setMounted(true), []);

  // 댓글 컴포넌트는 뷰포트 근처에 도달했을 때만 로드
  useEffect(() => {
    const target = commentsRef.current;
    if (!target || shouldLoadComments) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoadComments(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "320px 0px",
      },
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [shouldLoadComments]);

  // 뷰포트 진입 전에는 플레이스홀더만 노출
  return (
    <div ref={commentsRef} className="mt-16 border-t border-border pt-10">
      {mounted && shouldLoadComments ? (
        <Giscus
          repo={siteConfig.giscus.repo}
          repoId={siteConfig.giscus.repoId}
          category={siteConfig.giscus.category}
          categoryId={siteConfig.giscus.categoryId}
          mapping="pathname"
          reactionsEnabled="1"
          emitMetadata="0"
          inputPosition="top"
          theme={resolvedTheme === "dark" ? "dark" : "light"}
          lang="ko"
          loading="lazy"
        />
      ) : (
        <p className="text-sm text-subtle">댓글 영역을 불러오는 중입니다.</p>
      )}
    </div>
  );
}
