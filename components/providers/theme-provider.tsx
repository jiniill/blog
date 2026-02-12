"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { VisualThemeProvider } from "./visual-theme-provider";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <VisualThemeProvider>{children}</VisualThemeProvider>
    </NextThemesProvider>
  );
}
