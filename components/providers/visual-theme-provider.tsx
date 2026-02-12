"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import {
  type VisualThemeId,
  VISUAL_THEME_STORAGE_KEY,
  DEFAULT_VISUAL_THEME,
  VISUAL_THEMES,
} from "@/lib/visual-theme";

interface VisualThemeContextValue {
  visualTheme: VisualThemeId;
  setVisualTheme: (theme: VisualThemeId) => void;
}

const VisualThemeContext = createContext<VisualThemeContextValue | undefined>(
  undefined,
);

function isValidTheme(value: string): value is VisualThemeId {
  return VISUAL_THEMES.some((t) => t.id === value);
}

export function VisualThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [visualTheme, setVisualThemeState] = useState<VisualThemeId>(() => {
    if (typeof window === "undefined") return DEFAULT_VISUAL_THEME;
    const stored = localStorage.getItem(VISUAL_THEME_STORAGE_KEY);
    return stored && isValidTheme(stored) ? stored : DEFAULT_VISUAL_THEME;
  });

  const setVisualTheme = useCallback((theme: VisualThemeId) => {
    setVisualThemeState(theme);
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(VISUAL_THEME_STORAGE_KEY, theme);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = visualTheme;
  }, [visualTheme]);

  return (
    <VisualThemeContext.Provider value={{ visualTheme, setVisualTheme }}>
      {children}
    </VisualThemeContext.Provider>
  );
}

export function useVisualTheme() {
  const ctx = useContext(VisualThemeContext);
  if (!ctx) {
    throw new Error("useVisualTheme must be used within VisualThemeProvider");
  }
  return ctx;
}
