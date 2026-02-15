"use client";

import { useEffect, useRef } from "react";

const COPY_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;
const CHECK_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`;

export function CodeBlockCopy({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const pres = container.querySelectorAll("pre");
    const cleanups: (() => void)[] = [];

    pres.forEach((pre) => {
      if (pre.querySelector("[data-copy-btn]")) return;

      pre.style.position = "relative";

      /* 코드 블록 상단에 언어 레이블을 표시합니다. */
      const codeEl = pre.querySelector("code[data-language]");
      const lang = codeEl?.getAttribute("data-language");
      if (lang && !pre.parentElement?.querySelector("[data-rehype-pretty-code-title]")) {
        const badge = document.createElement("span");
        badge.setAttribute("data-lang-badge", "true");
        badge.textContent = lang;
        badge.className =
          "absolute left-3 top-2 select-none rounded px-1.5 py-0.5 text-[11px] font-medium leading-none opacity-60";
        badge.style.color = "var(--theme-code-copy-fg)";
        pre.appendChild(badge);
        cleanups.push(() => badge.remove());
      }

      const btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("data-copy-btn", "true");
      btn.setAttribute("aria-label", "코드 복사");
      btn.className =
        "absolute right-2 top-2 rounded-md p-1.5 opacity-0 transition-opacity focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";
      btn.style.backgroundColor = "var(--theme-code-copy-bg)";
      btn.style.color = "var(--theme-code-copy-fg)";
      btn.innerHTML = COPY_ICON;

      const showBtn = () => (btn.style.opacity = "1");
      const hideBtn = () => (btn.style.opacity = "0");
      pre.addEventListener("mouseenter", showBtn);
      pre.addEventListener("mouseleave", hideBtn);

      let timeout: ReturnType<typeof setTimeout> | undefined;
      btn.addEventListener("click", async () => {
        const code = pre.textContent || "";
        await navigator.clipboard.writeText(code);
        btn.innerHTML = CHECK_ICON;
        timeout = setTimeout(() => (btn.innerHTML = COPY_ICON), 2000);
      });

      pre.appendChild(btn);

      cleanups.push(() => {
        clearTimeout(timeout);
        pre.removeEventListener("mouseenter", showBtn);
        pre.removeEventListener("mouseleave", hideBtn);
        btn.remove();
      });
    });

    return () => cleanups.forEach((fn) => fn());
  }, [children]);

  return <div ref={ref}>{children}</div>;
}
