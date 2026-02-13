"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TocEntry {
  title: string;
  url: string;
  items: TocEntry[];
}

/** 중첩된 TOC 엔트리에서 모든 ID를 평탄화 */
function flattenIds(items: TocEntry[]): string[] {
  return items.flatMap((item) => [
    item.url.slice(1),
    ...flattenIds(item.items),
  ]);
}

export function TableOfContents({ items }: { items: TocEntry[] }) {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const ids = flattenIds(items);
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (elements.length === 0) return;

    let rafId = 0;

    function onScroll() {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const scrollY = window.scrollY + 100;
        let current = "";
        for (const el of elements) {
          if (el.offsetTop <= scrollY) current = el.id;
        }
        setActiveId(current);
      });
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, [items]);

  if (items.length === 0) return null;

  return (
    <aside
      className="hidden xl:block absolute -right-4 top-0 h-full w-56 translate-x-full"
      aria-label="목차"
    >
      <nav className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-subtle">
          목차
        </p>
        <TocList items={items} activeId={activeId} depth={0} />
      </nav>
    </aside>
  );
}

function TocList({
  items,
  activeId,
  depth,
}: {
  items: TocEntry[];
  activeId: string;
  depth: number;
}) {
  return (
    <ul className={cn("space-y-1", depth > 0 && "pl-3")}>
      {items.map((item) => {
        const id = item.url.slice(1);
        const isActive = activeId === id;

        return (
          <li key={item.url}>
            <a
              href={item.url}
              className={cn(
                "block py-0.5 text-[13px] leading-relaxed transition-colors",
                isActive
                  ? "font-medium text-heading"
                  : "text-subtle hover:text-body",
              )}
            >
              {item.title}
            </a>
            {item.items.length > 0 && (
              <TocList
                items={item.items}
                activeId={activeId}
                depth={depth + 1}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}
