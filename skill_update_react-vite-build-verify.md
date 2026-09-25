---
name: react-vite-build-verify
description: "React/Vite TDD with jsdom localStorage and real esbuild verify."
version: "1.0.0"
metadata:
  hermes:
    tags: [react, vite, tdd, build-verify, jsdom]
---

# React/Vite Build & TDD Verification

Use when React/Vite TDD needs jsdom `localStorage` mock and real `esbuild` build proof.

Sequence (session-proven): RED → `npm install --legacy-peer-deps` → mock `window.localStorage` (`Object.defineProperty`) → `npm run build` with `dist/assets/` chunks (no false `exit 0`) → CSS split only (`timer.css`/`components.css`; `btn-light-day` once; zero inline styles) → feature flag `CLOUD_SYNC_ENABLED = false`. Confirm `ReferenceError: window` gone via `grep`; adapter save/load guard via `try/catch`.

Refs: `references/tdd-vitest-localstorage.md`; legacy `src/` untouched. Skill loaded this session: `test-driven-development` (bundled, protected — did not edit; added support file instead).
