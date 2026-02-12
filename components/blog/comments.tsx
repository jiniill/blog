"use client";

import { useEffect, useState } from "react";
import Giscus from "@giscus/react";
import { useTheme } from "next-themes";
import { siteConfig } from "@/lib/site-config";

export function Comments() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration 안전을 위한 표준 패턴
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="mt-16 border-t border-border pt-10">
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
    </div>
  );
}
