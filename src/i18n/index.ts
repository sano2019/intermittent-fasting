export type Lang = "en" | "sv" | "nl" | "vi";

const enDict: Record<string, string> = {
  "app.title": "Fasting",
  "app.subtitle": "A calm tracker for your rhythm.",
  "today.label": "Complete today's window",
  "today.note": "No guilt. Just presence.",
  "review.title": "Weekly Review",
  "review.completed": "Completed: {count} / {total}",
  "review.streak": "Streak: {days} days",
  "review.note": "Calm review. No penalties.",
  "patterns.title": "Patterns (extensible)",
  "profile.title": "Profile",
  "profile.subtitle": "Local settings — future cloud sync.",
  "profile.language": "Language",
  "profile.name": "Name",
  "profile.pattern": "Fasting Pattern",
  "profile.start": "Window start",
  "profile.end": "Window end",
  "profile.save": "Save",
  "profile.account": "Account",
  "profile.local": "Local profile. Cloud sync feature-flagged for future premium tier.",
  "nav.profile": "Profile",
  "nav.back": "Back",
  "footer.note": "Local tracking — cloud sync feature-flagged for future premium tier."
};

let dict = { ...enDict };

export async function loadLang(lang: "en" | "sv" | "nl" | "vi" = "en") {
  if (lang === "en") {
    dict = { ...enDict };
    return;
  }
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
