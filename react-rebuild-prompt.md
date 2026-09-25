# React Rebuild — Small-Step Prompt (new session)

Context: Previous `react-app/` deleted after persistent JSX structural errors (`vite:esbuild` regex at line 762, dangling `</div>`, button braces broken). Legacy non-React PWA preserved (`legacy/` untouched); split CSS (`timer.css`, `components.css`) and adapter/store pattern preserved.

Method: Small steps, verify each before next. Use `grill-with-docs` before any code. Use `tdd`. Build = `npm run build` (not `exit 0` alone — troubleshoot with actual `esbuild` output). No rollback of split/CSS removal; no inline-style patches; use mechanism elevation (`store/store/styles loader`) over inline fixes.

Breakdown — ask `grill-with-docs` first on:
1. Component split: timer ring + settings (Profile) + weekly review = separate? History/edit/delete modal = component or inline? (`intermittent-fasting-tracker` adapter/store split guides this)
2. State: adapter interface (`StorageAdapter`) kept; React state hook map per feature; feature-flag cloud (`CLOUD_SYNC_ENABLED = false`).
3. CSS: `timer.css` / `components.css` only; single `btn-light-day` definition (`#fff8f0`, `1.5px`).
4. Build verification: each step must pass `vite build` with zero `esbuild` errors; no false-positive trust.
5. Legacy match: profile link routing (`popstate`), picker (`◴` + input click), `FASTING TIMER` eyebrow, amber `#c7bfae` / green `#7fbf7f`, no red.

Start: load `intermittent-fasting-tracker`, `tdd`, `grill-with-docs`, `simplify-code`. Run `grill-with-docs` for domain-modeling. Then step-by-step: adapter interface → timer ring component → settings/profile → weekly review → history modal → build verify. One commit per feature (`feat:`). Don't proceed past a broken build.
