export const VISUAL_THEMES = [
  { id: "default", label: "클린", icon: "CircleDot" },
  { id: "brutalist", label: "네오브루탈", icon: "Zap" },
  { id: "glass", label: "글래스", icon: "Sparkles" },
  { id: "terminal", label: "터미널", icon: "Terminal" },
  { id: "pastel", label: "파스텔", icon: "Flower2" },
] as const;

export type VisualThemeId = (typeof VISUAL_THEMES)[number]["id"];
export const VISUAL_THEME_STORAGE_KEY = "visual-theme";
export const DEFAULT_VISUAL_THEME: VisualThemeId = "default";
