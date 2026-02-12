"use client";

import { useEffect, useRef, useState } from "react";
import {
  CircleDot,
  Zap,
  Sparkles,
  Terminal,
  Flower2,
  Palette,
  Check,
} from "lucide-react";
import { useVisualTheme } from "@/components/providers/visual-theme-provider";
import { VISUAL_THEMES, type VisualThemeId } from "@/lib/visual-theme";

const iconMap = {
  CircleDot,
  Zap,
  Sparkles,
  Terminal,
  Flower2,
} as const;

export function ThemeSelector() {
  const { visualTheme, setVisualTheme } = useVisualTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("keydown", handleEsc);
      return () => document.removeEventListener("keydown", handleEsc);
    }
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--theme-radius-md)] text-subtle hover:text-foreground hover:bg-surface-hover active:scale-95 transition-all duration-150"
        aria-label="테마 선택"
        aria-expanded={open}
      >
        <Palette className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-44 origin-top-right overflow-hidden rounded-[var(--theme-radius-lg)] border-[length:var(--theme-border-width)] border-border bg-background shadow-[var(--theme-shadow)] backdrop-blur-[var(--theme-glass-blur)]">
          <div className="p-1">
            {VISUAL_THEMES.map((theme) => {
              const Icon = iconMap[theme.icon];
              const isActive = visualTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => {
                    setVisualTheme(theme.id as VisualThemeId);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-[var(--theme-radius-md)] px-2.5 py-2 text-sm transition-all duration-150 ${
                    isActive
                      ? "bg-muted text-heading font-medium"
                      : "text-body hover:bg-surface-hover hover:text-heading"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="flex-1 text-left">{theme.label}</span>
                  {isActive && (
                    <Check className="h-3.5 w-3.5 shrink-0 text-accent" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
