# Sfx lab animation plans

Plans produced from the `find-animation-opportunities` sweep of `/sfx`, written with the `improve-animations` plan template. **Read-only advisor output** — executors implement one plan at a time.

**Source commit:** `9d471c4`  
**Primary file:** `src/components/sfx/SfxDashboard.tsx`  
**Stack:** React 19, `motion/react`, tokens in `src/lib/motion.ts` (`easeOut`, `durations`)

## Plans

| # | File | Title | Severity | Status | Depends on |
| --- | --- | --- | --- | --- | --- |
| 001 | `001-sfx-copy-status-toast.md` | Animate copy-status feedback | MEDIUM | TODO | — |
| 002 | `002-sfx-shimmer-panel.md` | Animate shimmer controls open/close | MEDIUM | TODO | — |
| 003 | `003-sfx-layer-list-presence.md` | Animate layer list add/remove | MEDIUM | TODO | — |
| 004 | `004-sfx-toolbar-contextual-buttons.md` | Animate toolbar Reset/Delete | LOW | TODO | — |
| 005 | `005-sfx-mute-banner.md` | Animate mute toolbar banner | LOW | TODO | 001 (shared status slot) |
| 006 | `006-sfx-empty-drafts-delight.md` | Empty drafts → first chip | LOW | TODO | — |

## Recommended execution order

1. **001** — highest leverage; establishes status `AnimatePresence` + `easeOut` / `durations` imports / `reducedMotion` in `SfxDashboard`.
2. **005** — same toolbar status region as 001; do immediately after.
3. **002** — isolated shimmer block; copies existing layer accordion pattern.
4. **003** — layer list Presence; keep accordion internals untouched.
5. **004** — toolbar contextual buttons; optional sibling `layout` on stable actions.
6. **006** — Custom rail empty state; independent of canvas work.

## Shared conventions (all plans)

- Ease enter/exit: `easeOut = [0.165, 0.84, 0.44, 1]` from `@/lib/motion` **or** local `panelEase = [0.16, 1, 0.3, 1]` for accordion-height (002 matches accordion).
- Durations: UI enter `0.2s`, exit/fast `0.15s`, toolbar chrome enter `0.16s`.
- Springs: press `stiffness: 420, damping: 28`; layout `stiffness: 420, damping: 32`.
- Never `scale(0)`; floor `scale: 0.97` when scaling.
- Always branch with `useReducedMotion()` — keep opacity, drop travel/scale/layout.
- No new dependencies.
- Verify with `npm run lint`.

## Handoff

Implement with any agent via: execute plan file `plans/00N-….md` (one at a time). After each, mark its **Status** `DONE` in the plan file and in this table. Run `improve-animations reconcile` (or re-read this folder) if `SfxDashboard.tsx` drifts past `9d471c4`.
