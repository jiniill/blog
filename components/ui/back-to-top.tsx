"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/types";
import { getDictionary } from "@/lib/i18n/get-dictionary";

const SHOW_BUTTON_SCROLL_Y = 300;

function resolveScrollBehavior() {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  return prefersReducedMotion ? "auto" : "smooth";
}

export function BackToTop({ locale }: { locale: Locale }) {
  const [isVisible, setIsVisible] = useState(false);
  const t = getDictionary(locale);

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

  return (
    <button
      type="button"
      aria-label={t.common.backToTop}
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
