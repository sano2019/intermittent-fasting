# History view / indicator — design advice

Usage: user builds English (`Profile.lang` deferred), never red (`#c7bfae` amber only), `indicator.active` green `#7fbf7f`, `indicator.missed` amber `#c7bfae`, `indicator` gray `#eae8e0`.

## 1. i18n fix (done in `e906d78` patch)
- `toLocaleDateString('en-GB', ...)` / `toLocaleTimeString('en-GB', ...)` — replaces `sv-SE`. Days: `Wed`, `Thu`, `Sun`. Line <80 chars.

## 2. Pattern measurement (what "done" means)
- `16:8` = 16h fast → target `57600000` ms (16*3600*1000).
- `5:2` = 5-day fast cycle, but daily measure unclear — treat same as 24h cycle? Defer; show `pattern pill` regardless.
- `OMAD` = one meal a day → measure window from start of day (00:00) to first meal, or previous meal to current? Suggest: `durationMs` from start to end of recorded window; if that window >= 24h → `OMAD` considered met; else partial.
- `custom` — no target; always partial (amber pill) if `durationMs>0`, else gray.

## 3. Partial-state indicator (replaces binary `completed`)
- Green dot (`indicator.active`) ONLY if `durationMs >= targetMs`.
- Amber dot (`indicator.missed`, partial) if `0 < durationMs < targetMs`.
- Gray dot (`indicator`) if `durationMs == 0` (not started / empty).
- Never binary `done` label; pill shows `"15h / 16h"` so partial is visible at a glance; `done` only shown as tooltip on full green.

## 4. Implementation note (reversible)
- Add `targetMs(r.pattern, r.startTime)` helper; compare to `durationMs`.
- History row: keep `pill` + duration number + indicator; drop `t("status.done")` text; rely on color + pill text. Edit/delete preserved.
- Adapter (`fast-records-v1`) untouched; no adapter-level fix.

Revert: `git revert` last commit; design kept separate from adapter.
