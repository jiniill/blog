"use client";

import { useEffect, useRef } from "react";

/**
 * GFM 각주에 호버 툴팁 + 헤더 오프셋 스크롤을 추가하는 래퍼 컴포넌트.
 * <sup> 앞의 단어/요소까지 호버 영역을 확장하여 사용성을 높입니다.
 */
export function FootnoteTooltip({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const supElements = container.querySelectorAll<HTMLElement>(
      "sup:has([data-footnote-ref])",
    );
    if (supElements.length === 0) return;

    let activeTooltip: HTMLDivElement | null = null;
    let hideTimeout: ReturnType<typeof setTimeout> | undefined;
    const cleanups: (() => void)[] = [];

    function getFootnoteContent(href: string): string {
      const id = href.replace("#", "");
      const li = container!.querySelector(`#${CSS.escape(id)}`);
      if (!li) return "";
      const clone = li.cloneNode(true) as HTMLElement;
      clone
        .querySelectorAll("[data-footnote-backref]")
        .forEach((el) => el.remove());
      return clone.textContent?.trim() || "";
    }

    function removeTooltip() {
      if (activeTooltip) {
        activeTooltip.remove();
        activeTooltip = null;
      }
    }

    function positionTooltip(
      tooltip: HTMLDivElement,
      triggerEl: HTMLElement,
    ) {
      const rect = triggerEl.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      const vw = window.innerWidth;

      let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
      if (left < 8) left = 8;
      if (left + tooltipRect.width > vw - 8) {
        left = vw - tooltipRect.width - 8;
      }

      let top = rect.top - tooltipRect.height - 8 + window.scrollY;
      let above = true;
      if (rect.top - tooltipRect.height - 8 < 80) {
        top = rect.bottom + 8 + window.scrollY;
        above = false;
      }

      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;
      tooltip.classList.add(above ? "above" : "below");
    }

    function showTooltip(anchor: HTMLAnchorElement, triggerEl: HTMLElement) {
      clearTimeout(hideTimeout);
      removeTooltip();

      const href = anchor.getAttribute("href");
      if (!href) return;

      const text = getFootnoteContent(href);
      if (!text) return;

      const tooltip = document.createElement("div");
      tooltip.setAttribute("role", "tooltip");
      tooltip.className = "footnote-tooltip";
      tooltip.textContent = text;

      document.body.appendChild(tooltip);
      activeTooltip = tooltip;

      positionTooltip(tooltip, triggerEl);

      tooltip.addEventListener("mouseenter", () => clearTimeout(hideTimeout));
      tooltip.addEventListener("mouseleave", () => {
        hideTimeout = setTimeout(removeTooltip, 150);
      });
    }

    function scheduleHide() {
      hideTimeout = setTimeout(removeTooltip, 150);
    }

    function scrollToTarget(href: string) {
      const target = container!.querySelector(href);
      if (!target) return;
      const y = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: "smooth" });
    }

    /*
     * 각 <sup>에 대해 앞의 인라인 요소(strong, em, code 등)나
     * 텍스트 노드의 마지막 단어를 함께 감싸서 호버 영역을 확장합니다.
     */
    supElements.forEach((sup) => {
      const anchor = sup.querySelector<HTMLAnchorElement>(
        "[data-footnote-ref]",
      );
      if (!anchor) return;

      const wrapper = document.createElement("span");
      wrapper.className = "footnote-trigger";

      const prev = sup.previousSibling;

      if (prev && prev.nodeType === Node.ELEMENT_NODE) {
        const el = prev as HTMLElement;
        const tag = el.tagName.toLowerCase();
        if (["strong", "em", "code", "a", "b", "i"].includes(tag)) {
          sup.parentNode!.insertBefore(wrapper, el);
          wrapper.appendChild(el);
          wrapper.appendChild(sup);
        } else {
          sup.parentNode!.insertBefore(wrapper, sup);
          wrapper.appendChild(sup);
        }
      } else if (prev && prev.nodeType === Node.TEXT_NODE) {
        const text = prev.textContent || "";
        const match = text.match(/(\S+)\s*$/);
        if (match) {
          const lastWord = match[1];
          const before = text.slice(0, text.length - match[0].length);
          prev.textContent = before;
          const wordNode = document.createTextNode(lastWord);
          sup.parentNode!.insertBefore(wrapper, sup);
          wrapper.appendChild(wordNode);
          wrapper.appendChild(sup);
          cleanups.push(() => {
            prev.textContent = text;
          });
        } else {
          sup.parentNode!.insertBefore(wrapper, sup);
          wrapper.appendChild(sup);
        }
      } else {
        sup.parentNode!.insertBefore(wrapper, sup);
        wrapper.appendChild(sup);
      }

      const onEnter = () => showTooltip(anchor, wrapper);
      const onLeave = () => scheduleHide();
      const onClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest("[data-footnote-ref]")) {
          e.preventDefault();
          const href = anchor.getAttribute("href");
          if (href) scrollToTarget(href);
        }
      };

      wrapper.addEventListener("mouseenter", onEnter);
      wrapper.addEventListener("mouseleave", onLeave);
      wrapper.addEventListener("click", onClick);

      cleanups.push(() => {
        wrapper.removeEventListener("mouseenter", onEnter);
        wrapper.removeEventListener("mouseleave", onLeave);
        wrapper.removeEventListener("click", onClick);
      });
    });

    /* 각주 하단의 backref 클릭 시에도 헤더 높이를 고려합니다 */
    const backrefs = container.querySelectorAll<HTMLAnchorElement>(
      "[data-footnote-backref]",
    );
    backrefs.forEach((backref) => {
      const onClick = (e: MouseEvent) => {
        e.preventDefault();
        const href = backref.getAttribute("href");
        if (href) scrollToTarget(href);
      };
      backref.addEventListener("click", onClick);
      cleanups.push(() => backref.removeEventListener("click", onClick));
    });

    return () => {
      removeTooltip();
      clearTimeout(hideTimeout);
      cleanups.forEach((fn) => fn());
    };
  }, [children]);

  return <div ref={ref}>{children}</div>;
}
