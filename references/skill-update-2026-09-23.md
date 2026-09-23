# Intermittent Fasting Tracker — Skill Update (2026-09-23)

Source session: `/IntermittentFasting` PWA build (commit `789940a`).

## Pattern persistence (new pitfall captured)

- `Profile.pattern` → sync `localStorage` key `profile-pattern`. Read synchronously at `renderApp()` start (`const savedPattern = ... || 'custom';`) — DO NOT rely on async `loadProfile()` for initial HTML interpolation (caused `ReferenceError: savedPattern is not defined` → blank page).
- `FAST_WINDOW_H` branches on `savedPattern`: `OMAD` → 24, `16:8` → 16, else `fast-hours` (default 16).
- Timer controls (`#timer-minus`/`#timer-plus`/`.timer-window`) hidden (`style="display:none"`) when `savedPattern` in `['OMAD','16:8']`.
- Save-modal: `fast-pattern` select pre-selected to `pattern`; `Cancel` clears both `timer-base` and `fast-pattern` and calls `setBtnState()`.

## `grill-with-docs` / `frontend-design` boundary

- `/grill-with-docs`: logic verification ONLY; no documentation writing.
- `/frontend-design`: visualization ONLY (e.g. `omad-visualization.html`); NOT a deliverable app component; discard after review; user must confirm design before build.

## OMAD design (from visualization)

- Same ring clock, fixed 24h, no hour selector (`timer-controls` hidden), meal-time input (type="time") shown ONLY when `pattern === 'OMAD'` (conditional `.modal-inner` append).
- Partial-state dot: green (`#7fbf7f`) full 24h, amber (`#c7bfae`) partial, gray (`#eae8e0`) zero.

## 5:2 design

- No timer component; main-screen: calorie number input + sum pill (`cal-pill`) + info box (`600 cal` men / `500 cal` women). Timer-area replaced by running calorie total.

## Save-modal root-cause fix (re-usable pattern)

- Inline `style="display:none;"` + CSS `.fast-save-modal { display:flex; ... }` conflict = `flex` wins at init. Fix: strip `display:flex` from CSS; clean inline to pure `display:none`; set `"flex"` ONLY in click handler (`line 260`). Never use `"block"` (loses `align-items:center`).

## Recommendation

`hermes curator adopt intermittent-fasting-tracker` — skill is user-owned; autonomous write refused.
