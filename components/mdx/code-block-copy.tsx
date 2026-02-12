"use client";

import { useEffect } from "react";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CodeBlockCopy() {
  useEffect(() => {
    const pres = document.querySelectorAll("pre");
    pres.forEach((pre) => {
      if (pre.querySelector("[data-copy-btn]")) return;

      const wrapper = document.createElement("div");
      wrapper.className = "relative";
      pre.parentNode?.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);

      const btn = document.createElement("button");
      btn.setAttribute("data-copy-btn", "true");
      btn.className =
        "absolute right-2 top-2 rounded-md bg-zinc-700/50 p-1.5 text-zinc-300 opacity-0 transition-opacity hover:bg-zinc-700 group-hover:opacity-100";
      btn.style.opacity = "0";
      btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;

      wrapper.addEventListener("mouseenter", () => {
        btn.style.opacity = "1";
      });
      wrapper.addEventListener("mouseleave", () => {
        btn.style.opacity = "0";
      });

      btn.addEventListener("click", async () => {
        const code = pre.textContent || "";
        await navigator.clipboard.writeText(code);
        btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`;
        setTimeout(() => {
          btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;
        }, 2000);
      });

      wrapper.appendChild(btn);
    });
  }, []);

  return null;
}
