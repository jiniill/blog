export type Locale = "ko" | "en";

export const locales: Locale[] = ["ko", "en"];

export const defaultLocale: Locale = "ko";

export function isValidLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}
