# /frontend-design — Confirm Fast save modal

Subject: intermittent fasting.
Distinctive feature: amber `#c7bfae` only, no red; sentence-case `.label`; active `#7fbf7f`, missed `#c7bfae`, pending `#eae8e0`.

Plan:
- Center vertically: `position:fixed; inset:0` + flex centering + backdrop.
- Mobile touch targets: fields `min-height:48px`, buttons `padding:1rem`, vertical `Cancel`/`Save` stack below 420px.
- Spacing: `gap:1.25rem` rows; `line-height:1.55`; one family `var(--font)`; lines `<80` chars.
- Labels `.label` sentence case (`Duration`, `Pattern`, `Start`, `End`).
- Visual identity: calm/minimal amber; no numbered markers; active voice (`Save changes`).
- Motion: user-triggered (open/close); no auto-entrance.
- Empty/failure: direction not mood; explain fix.

Verified colors in `style.css`: `--accent:#c7bfae`, `.indicator.active:#7fbf7f`, `.indicator.missed:#c7bfae`, `.indicator:#eae8e0`. No red present.
