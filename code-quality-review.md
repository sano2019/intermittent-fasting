Q-REVIEW: react-app / main.tsx + ProfilePage.tsx
File:line references below. Focus: redundancy, naming, string typing, nesting, type bypasses, copy-paste.

=== REDUNDANT STATE / DUPLICATE STORAGE ===
main.tsx:19  profilePattern state ("Custom") duplicates localStorage "profile-pattern" and Profile.pattern.
main.tsx:150 profileTheme state ("calm") duplicates "profile-theme" localStorage key AND profile.theme JSON.
main.tsx:171-180 theme sync effect reads "profile-theme" twice (lines 177, 173) — same value set twice.
ProfilePage.tsx:20 viewTheme is same concept as main.tsx profileTheme; different name = naming split.
main.tsx:183 p.theme = profileTheme writes back into "profile" JSON, duplicating dedicated key.
main.tsx:49-51 timer-hours derived from profilePattern (same ternary repeated at 92-97, 28, 51, 93-96).
ProfilePage.tsx:56-76 init reads both "profile-pattern" and profile.pattern (line 66) — duplicate sources.

=== NAMING INCONSISTENCIES ===
main.tsx:19 profilePattern vs ProfilePage.tsx:21 pattern (same concept, different names).
main.tsx:150 profileTheme vs ProfilePage.tsx:20 viewTheme.
main.tsx:16 calAccum vs key "cal-accum" (camelCase state vs kebab-case storage key).
main.tsx:17 lightDate vs key "light-date".
main.tsx:76 timerBaseKey (unclear; just increments on event; no semantic link to timer base).
ProfilePage.tsx:32 name uses default "You"; Profile interface uses name — inconsistent semantics.
main.tsx:205 adapter stub named adapter but uses any types (line 215, 218).
ProfilePage.tsx:261 grid label says "View" but controls theme; below it pattern buttons have no label grouping.

=== STRINGLY-TYPED VALUES (raw strings vs enum/const) ===
main.tsx:19 "Custom" hard-coded (7 occurrences total); should use FastingPattern / constant.
main.tsx:150 "calm" / "data" (3 and 1 occurrences); types.ts defines pattern enum but theme is untyped string.
main.tsx:124-125 is5_2 uses raw "5:2" comparison against both state and storage.
ProfilePage.tsx:62 themeStr compares to raw "calm" / "data" (line 62) with no enum.
ProfilePage.tsx:263-268 view theme buttons use raw "calm" / "data" in onClick and style conditionals.
ProfilePage.tsx:281 pattern buttons use raw keys; PATTERNS array uses "as const" (good), but saveProfile writes raw string to storage.
ProfilePage.tsx:196 langMap uses string keys; loadLang receives `code as any` bypassing any typed interface.
main.tsx:518 profilePattern === "Custom" in JSX (same string literal used for display and logic branching).
main.tsx:829 profileTheme === "calm" condition for weekly overview card.
main.tsx:1679 profileTheme === "data" for statistics block.

=== NESTED CONDITIONALS ===
main.tsx:86-121 tick loop: nested mode branch (line 113), nested Math.floor/min/max (lines 104-112), nested Date parsing inside tick.
main.tsx:729-774 start/stop timer handler: nested if/else with localStorage reads, Date formatting strings, multiple state setters.
ProfilePage.tsx:385-593 picker modal: nested picker state + wheel button mapping + onClick closures.
ProfilePage.tsx:470-567 time picker wheel buttons nested inside two column divs with scroll snap styles.
main.tsx:113-115 time formatting: mode ternary nested inside Math.floor inside String.padStart chain.

=== TYPE-SYSTEM BYPASSES (as any / non-null assertion) ===
main.tsx:215 adapter.save parameter typed `any`.
main.tsx:218 adapter.filter uses `(x: any)` instead of typed entry.
main.tsx:223 (window as any).adapter assignment.
main.tsx:224 (window as any).fmtMs.
main.tsx:1245 rec: any (record typed any in save modal).
main.tsx:1381 pageItems.map uses (r: any, i: number) — unnecessary any when r is known from JSON.parse.
ProfilePage.tsx:198 loadLang(code as any) — type bypass.
ProfilePage.tsx:545 setPicker({ ...picker!, m }) — non-null assertion (`!`) on picker.
ProfilePage.tsx:489 picker?.h conditional access with no null guard before use (line 489-491 uses `picker` inside map but relies on outer closure non-null assumption).

=== COPY-PASTE / NEAR-DUPLICATE BLOCKS ===
main.tsx:49-51 and 92-97: same `profileStr === "OMAD" ? "24" : profileStr === "16:8" ? "16" : "16"` ternary duplicated.
main.tsx:173-177 and 171-180: theme sync reads same localStorage key twice in same effect.
main.tsx:743-764: save start/end formatting duplicated in save handler and adjust handler (lines 795-804 localFmt).
main.tsx:658-710: subtract/add hour buttons are nearly identical except `+1`/`-1` and `min/max` direction.
ProfilePage.tsx:262-269: calm/data theme buttons are copy-paste with only text/style differences.
ProfilePage.tsx:344-383 and 608-648: start/end time input blocks near-duplicate (input, clock button, picker modal).
ProfilePage.tsx:470-509 and 518-567: hour/minute wheel structures nearly identical.
main.tsx:1228-1300 save/close buttons in save modal copy-paste from adjust modal buttons (same border/bg patterns).

=== AI SLOP PATTERNS (unnecessary comments, redundant null checks) ===
main.tsx:3 token comment (design doc duplication, not code help).
main.tsx:22 comment "Read profile + adapter non-destructively (no legacy change)" — obvious from code.
main.tsx:35 comment `/* do NOT setRunning—start state should be false */` unnecessary; code clearly skips setRunning.
main.tsx:72 `/* ignore */` empty catch comment.
main.tsx:205 adapter comment over-describes obvious stub.
main.tsx:301 comment `// Button reset via DOM-style (mirrors legacy) — use state for color in JSX below` explains inline behavior.
main.tsx:934 comment for adjust modal duplicates JSX aria-label.
ProfilePage.tsx:3-4 design comments that duplicate CSS/styling info.
ProfilePage.tsx:385 comment `/* iPhone-style time picker modal — triggered by clock icon */` obvious from JSX.
main.tsx:790 `running &&` guard with nested button — simple conditional styled inline.
main.tsx:1249-1250 conditional `if (savePattern === "5:2") rec.kcal = 0;` — redundant zero assignment (default is 0 anyway since `kcal` is not set otherwise, and 0 assignment does nothing new).
main.tsx:1196-1204 duration calculation uses IIFE inside JSX (`() => { try { ... } catch { ... } }`) — over-engineered inline expression.
ProfilePage.tsx:66 `if (p.pattern) setPattern(p.pattern);` redundant when p.pattern is already truthy by prior parse.
ProfilePage.tsx:71-75 `fast-hours` parsing splits string manually; should use a typed parser.

=== PARAMETER SPRAWL ===
main.tsx:206 adapter inline object defines loadProfile, loadAll, save (any), delete — no interface import despite types.ts defining StorageAdapter.
ProfilePage.tsx:196 langMap defined inside onChange handler; should be module-level constant.
ProfilePage.tsx:259 grid column label "View" is ambiguous; no aria grouping between theme and pattern grids.
main.tsx:150-197 profile-related state variables (profileTheme, profilePattern, showSave, profileOpen, showHistory, savedMsg, editRecordId, showDeleteConfirm, deleteConfirmId, historyPage, saveStart, saveEnd, savePattern, saveMealTime, adjustModalOpen, adjustBaseStr) — 14 state variables in single component without grouping/reducers.
ProfilePage.tsx:20-54 picker state + openPicker/closePicker/setPickerTime — 4 functions for single picker state.

=== STRUCTURED FINDINGS SUMMARY ===
- Redundant theme storage: profileTheme (state) + profile-theme (localStorage) + profile.theme (JSON) = 3 copies (main.tsx:150,171,183; ProfilePage.tsx:20,61,263).
- String constants not centralized: 7 "Custom", 3 "calm", 1 "data" in main.tsx; 4 in ProfilePage.tsx.
- Pattern ternary copied 3+ times (main.tsx:28,49-51,92-97,518,768,1244).
- `as any` / `any` used 7 times in main.tsx + 2 times in ProfilePage.tsx.
- Near-duplicate time picker blocks in ProfilePage.tsx (start/end inputs + wheels).
- Redundant null checks and empty catch comments across both files.
- ProfilePage.tsx uses different state name (`viewTheme`) for same feature (`profileTheme`).
- Storage adapter in main.tsx ignores typed interface from types.ts (line 29-36), using inline `any` instead.
