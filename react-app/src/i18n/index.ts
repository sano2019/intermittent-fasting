export type Lang = "en" | "sv" | "nl" | "vi";

import enDict from "./en.json";
import svDict from "./sv.json";
import nlDict from "./nl.json";
import viDict from "./vi.json";

const dictionaries: Record<Lang, Record<string, string>> = {
  en: enDict,
  sv: svDict,
  nl: nlDict,
  vi: viDict,
};

let dict: Record<string, string> = dictionaries.en;

export function loadLang(lang: Lang = "en") {
  dict = dictionaries[lang] ?? dictionaries.en;
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
