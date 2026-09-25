// Profile mechanism at store depth (altitude fix) — not inline in render
export type Theme = "calm" | "data";
export function loadTheme(): Theme {
  try { const p = JSON.parse(localStorage.getItem("profile") || "{}"); return (p.theme === "calm" || p.theme === "data") ? p.theme : "calm"; } catch { return "calm"; }
}
export function saveTheme(t: Theme) { try { const p = JSON.parse(localStorage.getItem("profile") || "{}"); p.theme = t; localStorage.setItem("profile", JSON.stringify(p)); } catch (e) {} }
