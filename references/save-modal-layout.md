# Save-modal (`#fast-save-modal`) design reference

Session: 2026-09-23 — `/frontend-design` advise + build applied to `#fast-save-modal` (the `Confirm Fast` card in the image, NOT the adjust-time modal).

Confirmed working layout (verified via `npm run build`, exit 0; image `composer_2026-09-23_05-01-09-763_e5e83b.png`):
- Overlay: `position:fixed; inset:0; background:rgba(0,0,0,0.55); z-index:60; align-items:center; justify-content:center;` (vertically centered).
- Card: `padding:1.5rem; max-width:340px; width:92%;`.
- Fields/select: `min-height:48px; font-size:1.05rem; padding:0.5rem;`.
- Buttons: vertical stack (`flex-direction:column; gap:0.75rem; align-items:stretch; margin-top:1.25rem;`), 48px, `Cancel` first, `Save` (amber `var(--accent)`) second.
- Tokens: amber `#c7bfae`; `.label` sentence-case; no red; `<80` chars; user-triggered motion.
- Separate flows preserved: save-flow (`#fast-save-modal`) ≠ history (`#fast-history-modal`) ≠ delete (`#delete-confirm-modal`). Key `fast-records-v1`. `CLOUD_SYNC_ENABLED = false`. Reversible (`git revert`).
