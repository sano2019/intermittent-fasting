// themeService.ts — Calm theme management and persistence
import type { FastingTheme } from "../types/fasting";

export const THEME_STORAGE_KEY = "fasting-theme";

export function getInitialTheme(): FastingTheme {
  if (typeof window === "undefined") return "light";
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === "dark" || saved === "light") {
      return saved;
    }
    const legacy = localStorage.getItem("theme");
    if (legacy === "dark" || legacy === "light") {
      return legacy;
    }
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
  } catch {
    // fallback
  }
  return "light";
}

export function applyTheme(theme: FastingTheme) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    localStorage.setItem("theme", theme);
  } catch (e) {
    console.warn("Could not save theme to localStorage:", e);
  }
}
