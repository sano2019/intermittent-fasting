export type Lang = "en";

let dict: Record<string, string> = {};

export async function loadLang(lang: Lang = "en") {
  const res = await fetch(`/src/i18n/${lang}.json`);
  dict = await res.json();
}

export function t(key: string, vars?: Record<string, string | number>): string {
  let s = dict[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.replace(`{${k}}`, String(v));
    }
  }
  return s;
}
