# Quality Review — Intermittent Fasting

Concrete findings with file/line references and proposed fixes.

---

## 1. Redundant state / duplicate adapter files (sprawl)
**File:** `src/storage-adapter.ts` (25 lines) vs `src/storage/local.ts` (50 lines) vs `src/types.ts`
- `storage-adapter.ts` defines its own `StorageAdapter` interface (line 5), `FastRecord` (line 1), and a `LocalStorageAdapter` that conflicts with `local.ts`. The interfaces differ: one uses `date`, the other `startTime`/`endTime`/`durationMs`.
- `main.ts` imports from `local.ts` but also assigns `(window as any).adapter = new LocalStorageAdapter()`; `profile.ts` reads `(window as any).adapter`.
- **Fix:** Delete `src/storage-adapter.ts`. Consolidate adapter definition in `types.ts` (already clean) and `local.ts`. Add a single registry entry in `types.ts`: `export const STORAGE_KEY = "fast-records-v1";` instead of duplicating the literal `"fast-records-v1"` across `local.ts`, `main.ts`, `sw.ts`, and `profile.ts`.

---

## 2. Copy-paste variation (pattern arrays)
**Files:** `src/main.ts` lines 19-24; `src/profile.ts` lines 4-9
- Pattern definitions duplicated with slightly different notes (`"16h fast / 8h window"` vs `"8h eating / 16h fast"`).
- **Fix:** Extract to `src/patterns.ts`:
```ts
export const FASTING_PATTERNS = [
  { key: "16:8", label: "16:8", note: "16h fast / 8h window" },
  ...
] as const;
```
Import in both `main.ts` and `profile.ts`. Eliminates drift.

---

## 3. Stringly-typed (no registry/enforcement)
**File:** `src/main.ts` lines 121-143; `profile.ts` lines 35-38; `i18n/index.ts`
- `localStorage.getItem("profile-pattern")`, `localStorage.getItem("fast-hours")`, `localStorage.getItem("timer-base")` read raw strings with no schema guard. `loadLang` accepts any `string`, not just `Lang`, and uses `??` incorrectly (`dictionaries[lang] ?? dictionaries.en`) rather than validating the key exists.
- `t()` uses untyped `key: string`; no compile-time or runtime registry check.
- **Fix:** Define typed keys:
```ts
export const STORAGE_KEYS = {
  profile: "if_local_profile",
  records: "fast-records-v1",
  timerBase: "timer-base",
  pattern: "profile-pattern",
  hours: "fast-hours",
} as const;
```
Add a `validateProfile(raw: unknown): Profile | null` helper in `local.ts` to guard `loadProfile` instead of `JSON.parse` + `as any`.

---

## 4. Leaky abstraction (adapter pattern broken)
**File:** `src/main.ts` lines 5-6, 121-143, 210-258, 286-290
- `main.ts` imports `LocalStorageAdapter` but then reads `window.localStorage` directly everywhere (`profileRaw`, `timer-base`, `fast-pattern`, `fast-hours`, `fast-records-v1`). The adapter abstraction is decorative — data access leaks to the view layer.
- **Fix:** Make `main.ts` use adapter methods (`window.adapter.loadProfile()`, `window.adapter.loadAll()`) and remove direct `localStorage` reads. If adapter is injected on window for profiling, pass it explicitly: `renderApp(adapter: StorageAdapter)` instead of global mutation.

---

## 5. Redundant comments (AI slop)
**File:** `src/storage-adapter.ts` lines 5-6
```
// server-side (Fly): SQLite file; future OAuth/account table separate
// Note: account/auth (OAuth Google/Apple) requires separate user/auth layer; adapter stays data-layer only
```
These are speculative design docs embedded in code.
- **Fix:** Remove. Design intent belongs in `docs/ADR-01-storage-migration.md` (already exists). Keep code comments to explain why, not what-next.

Similar redundant labels throughout `main.ts` (`// Load user language preference synchronously from profile`, `// Pattern selection`, `// Save`, `// Back link returns to main app view`, `// Frame-based timer for accuracy`). **Fix:** Delete. Function names (`loadLang`, `renderProfile`, `updateTimer`) already describe intent.

---

## 6. Unnecessary `as any` casts (AI slop)
**File:** `src/main.ts` lines 5, 206, 121-122; `profile.ts` lines 63, 92, 104
- `(window as any).adapter`
- `(window as any).setBtnState`
- `loadLang(profile.lang as any)`
- `(selected?.getAttribute("data-pattern") as FastingPattern) ?? "custom"`
- **Fix:** Declare proper interfaces:
```ts
interface WindowExtensions {
  adapter?: StorageAdapter;
  setBtnState?: () => void;
  historyPage?: number;
  deleteConfirmId?: string;
  openFastHistory?: () => void;
}
```
Extend `Window` interface globally (e.g., `declare global { interface Window extends WindowExtensions {} }`) instead of `as any`.

---

## 7. Defensive null-checks / defensive ternaries (AI slop)
**File:** `src/main.ts` lines 66, 121, 144, 162, 166, 177
- `(profileRaw ? JSON.parse(profileRaw) : null)` — defensive without validation; if `profileRaw` is malformed JSON, `JSON.parse` throws unhandled.
- `(adapter?.loadProfile ? ... : null)` at line 215-219: stub always returns `null`. Comment says "stub: adapter.loadProfile async; deferred full profile read" — this is a dead branch.
- Line 162: `if (lblFast) lblFast.textContent = ...` — if label exists, update. But label is always created by the template above; unnecessary guard.
- Line 177-178: `if (!timerTime) return;` inside `requestAnimationFrame`. If the element is removed, the loop continues calling `requestAnimationFrame` without cleanup.
- **Fix:** Replace defensive null-checks with validated schema reads. For `profileRaw`, use a `try/catch` around `JSON.parse` and return a `Profile` or `null`. For the adapter stub at lines 215-219, delete the stub and call `adapter.loadProfile()` properly (async), or remove the dead branch entirely.
Add `cancelAnimationFrame(animFrame)` guard when the timer stops to prevent leaks.

---

## 8. Nested conditionals / ternary chains
**File:** `src/main.ts`
- `eatingEndStr` (lines 124-133): nested IIFE with split/map/Date arithmetic embedded in a ternary.
- `savedPattern` (line 139): nested `||` fallback chain.
- `history` pagination (line 371-390): nested ternary for `prevBtn`/`nextBtn` display logic (`page <= 0 ? ...` inside a conditional).
- `deleteConfirm` (line 407-416): nested `if (!id) return;` with manual array filter.
- **Fix:** Extract `eatingEndStr` to named helper `parseProfileEndTime(profile: Profile | null): string | null`. Replace ternary pagination with explicit `if/else` blocks. Replace nested `deleteConfirm` with adapter method `adapter.delete(id)` (already defined in `StorageAdapter`) instead of raw array mutation.

---

## 9. Parameter sprawl / untyped adapter method
**File:** `src/types.ts` lines 30-36; `local.ts`
- `StorageAdapter.loadProfile()` returns `Promise<any>`. `loadProfile()` takes no parameters, but `profile` is a singleton concept.
- `load()` takes `date: string` but `loadRange()` takes `(start: string, end: string)`. No typed `dateRange` or utility.
- **Fix:** Change `loadProfile` return type from `any` to `Profile | null`. Add `dateRange(start: string, end: string): { start: Date; end: Date }` helper to avoid manual `new Date(...)` conversions scattered through `main.ts` (line 145, 290-293).

---

## 10. CSS copy-paste / duplicate rules
**File:** `src/style.css`
- `.indicator { ... }` and `.indicator.active` / `.indicator.missed` defined at top (line 1-5), but `.indicator` is never used in HTML.
- `.week-day .dot` defined 3 times (lines 252-254, 258-259, 261).
- `.dot` defined twice (lines 1, 269).
- `#history-card` rules (lines 279-281) duplicate styling from `.fast-history-modal` without being referenced in HTML.
- **Fix:** Remove unused `.indicator` and `#history-card` rules. Consolidate `.dot` and `.week-day .dot` to single definitions. Delete redundant `.weekly-labels` / `.weekly-dots` if not used in markup.

---

## 11. Inline onclick / inline event wiring (leaky abstraction)
**File:** `src/main.ts` lines 72-76, 95-99, 242-247, 396-402, 407
- Large inline `onclick` strings with embedded `getElementById` access and `JSON.parse`/`JSON.stringify`. These break TypeScript type safety and mix view and data.
- Example line 76: `onclick="const s=document.getElementById('fast-save-start')?.value||''; ..."`
- **Fix:** Extract these to event-bound functions (like `deleteConfirm`). Replace the inline `onclick` on the save button with `document.getElementById('save-btn')?.addEventListener('click', () => { ... })`. This eliminates the inline script injection and allows TypeScript checking.

---

## 12. `sw.ts` — hardcoded shell list without hash/version
**File:** `src/sw.ts` line 2
- `const SHELL = ["/", "/index.html", "/src/style.css", "/src/main.ts", "/manifest.json"];`
- No version/hash in cache name; `CACHE = "fast-v1"` is fine, but `SHELL` references `/src/main.ts` which is source TypeScript — browsers load compiled JS. Adding `manifest.json` to shell is fine, but `main.ts` won't be served directly in production builds (`vite build` outputs different paths).
- **Fix:** Make `SHELL` configurable at build time or document that it's a dev-only service worker. If intended for production PWA, reference compiled output paths (`/assets/index-*.js`, etc.).

---

## 13. `localStorage` key duplication (redundant state)
**File:** `main.ts` (line 121, 135, 141, 180, 211, 220, 252, 254, 288); `local.ts` (line 3); `sw.ts` (line 1)
- The literal `"fast-records-v1"` appears in 5+ places. The literal `"if_local_profile"` appears in `local.ts` and `profile.ts`.
- **Fix:** Centralize all key constants in `types.ts` (see #1). Reference via constant only.

---

## 14. Profile form submits via `onclick` + `dispatchEvent`
**File:** `profile.ts` line 51
```
<button ... onclick="this.form.dispatchEvent(new Event('submit', {bubbles:true}))">
```
- The button is `type="submit"` but also uses inline `onclick` to manually dispatch submit. Redundant — submit button inside `<form>` automatically submits. The `onclick` is unnecessary and creates a second event path.
- **Fix:** Remove `onclick`. Keep `type="submit"`. The `form.addEventListener('submit', ...)` already handles submission.

---

## 15. Unused imports / dead code
**File:** `src/storage/cloud.ts` — exports `CloudStorageAdapter` interface (empty) and `CLOUD_SYNC_ENABLED` (duplicate of same constant in `main.ts` or `profile.ts`). Not imported anywhere.
- **Fix:** Either implement the adapter skeleton or delete the file and consolidate `CLOUD_SYNC_ENABLED` into a single config file (e.g., `src/config.ts`).

---

## Summary of concrete refactors (recommended order)
1. Delete `src/storage-adapter.ts`; consolidate adapter interface and keys in `types.ts`.
2. Create `src/patterns.ts`; delete duplicate arrays in `main.ts`/`profile.ts`.
3. Declare `StorageKeys` constants; eliminate `as any` for storage reads.
4. Extract `parseProfileEndTime`, `fmtMs`, `dateRange` helpers; simplify nested ternary in `updateTimer`.
5. Replace direct `localStorage` reads in `main.ts` with adapter calls; declare `WindowExtensions` interface.
6. Delete dead adapter stub (`profile = ... ? ... : null`) at `main.ts` 215-219.
7. Replace inline `onclick` strings with event listeners; remove `onclick` from profile save button.
8. Clean `style.css`: remove `.indicator`, duplicate `.dot` rules, unused `#history-card`.
9. Validate JSON reads with `try/catch` instead of defensive `? ... : null`.
10. Consolidate `CLOUD_SYNC_ENABLED` or delete `cloud.ts`.
