# IF PWA — session fix reference (2026-09-23)

Context: history-view redesign blocked until `/frontend-design` evaluation; dots overflow (`92b354.png`); `t('days.*')` + `toLocaleDateString` combined; build `e906d78`/`ed91f64`.

## i18n: accurate days + translation (main.ts:403)
- Problem: `toLocaleDateString('en-GB')` serves `Mon`/`Wed` (ignores `Profile.lang`=`sv`/`vi`/`nl`).
- Fix: IIFE per row: `new Date(...).getDay()` → `['sun','mon',...][index]` → `t('days.'+key)`. Fallback `toLocaleDateString('en-GB',{weekday:'short'})` if `t` missing or key absent.
- Translation files (verified present): `en.json` (`mon`..`sun`), `sv.json` (`mån`..`sön`), `nl.json` (`ma`..`zo`), `vi.json` (`T2`..`CN`).
- Line length `<80` chars; sentence-case `.label`; amber `#c7bfae` only (no red); indicators green `#7fbf7f` (active) / amber `#c7bfae` (missed) / gray `#eae8e0` (default).

## Weekly dots overflow (style.css:250)
- `.weekly-row { gap:36px; ... }` causes 7-day row to exceed container (image `92b354`).
- Patch: `.weekly-row { display:flex; justify-content:center; gap:8px; margin-top:14px; flex-wrap:wrap; }`.
- Keeps `.indicator.active` / `.indicator.missed` / `.indicator` colors; `.label` sentence-case; `min-width:24px` per `.week-day`.

## Partial-state indicator (not yet applied; deferred)
- Binary `completed` insufficient: `targetMs` per pattern (`16:8`=57600ms, `OMAD`≥24h, `5:2`=defer); green dot only at/above target; amber partial; gray zero (`durationMs==0`). Not implemented — user said `"lets discuss the fasting forms after this issue"`; adapter (`fast-records-v1`) preserved; `git revert` preserved.

## Workflow / design rules (from `/frontend-design` feedback)
- Rounded: card `1.25rem`, inputs/buttons/select `0.75rem`.
- Vertical `Cancel` / `Save`; `btn-secondary` (`#c7bfae`) for adjust-start; selection boxes (`start`/`end`) always below `Pattern:` / `Start:` / `End:` labels.
- Never red (`#c7bfae` amber only); user-triggered motion; active voice (`Save changes`); `<80` char line length.
- Reversible: `git revert ed91f64` or `e906d78`; adapter preserved; no adapter-level fixDefinition.
