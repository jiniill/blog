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

      const btn = document.createElement("button");
      btn.setAttribute("data-copy-btn", "true");
      btn.setAttribute("aria-label", "코드 복사");
      btn.className =
        "absolute right-2 top-2 rounded-md bg-zinc-700/50 p-1.5 text-zinc-300 opacity-0 transition-opacity hover:bg-zinc-700";
      btn.innerHTML = COPY_ICON;

      const showBtn = () => (btn.style.opacity = "1");
      const hideBtn = () => (btn.style.opacity = "0");
      pre.addEventListener("mouseenter", showBtn);
      pre.addEventListener("mouseleave", hideBtn);

      let timeout: ReturnType<typeof setTimeout>;
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
  });

  return <div ref={ref}>{children}</div>;
}
