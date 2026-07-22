# 005 — Animate sfx mute toolbar banner

- **Status**: DONE
- **Commit**: `9d471c4`
- **Severity**: LOW
- **Category**: Missed opportunities (State indication)
- **Estimated scope**: 1 file (`src/components/sfx/SfxDashboard.tsx`), small
- **Depends on**: Prefer completing **001** first (shared status slot / `AnimatePresence` mounting rules)

## Problem

The muted notice under the sticky toolbar snaps in and out when the speaker toggle changes mute state.

```tsx
/* src/components/sfx/SfxDashboard.tsx:615–619 — current */
{muted && (
  <p className="sfx-lab-muted rounded-lg px-2.5 py-1 text-[11px] leading-snug sm:rounded-xl sm:px-3 sm:py-1.5 sm:text-xs">
    Sound is muted. Use the speaker toggle to unmute previews.
  </p>
)}
```

## Target

Same toast vocabulary as plan 001, but enter from the **toolbar edge** (slight upward origin):

| Phase | Full motion | Reduced motion |
| --- | --- | --- |
| initial | `{ opacity: 0, y: -4 }` | `{ opacity: 0 }` |
| animate | `{ opacity: 1, y: 0 }` | `{ opacity: 1 }` |
| exit | `{ opacity: 0, y: -4 }` (same edge) | `{ opacity: 0 }` |
| enter duration | `0.2` | `0.15` |
| exit duration | `0.15` | `0.15` |
| ease | `[0.165, 0.84, 0.44, 1]` (`easeOut`) | same |

Symmetric enter/exit path (same edge) is required — do not exit downward if entering from above.

## Repo conventions to follow

- Plan 001 copy-status pattern (sibling under the toolbar).
- `TickSoundToggle` + `subscribeTickSoundMuted` already drive `muted` in this component — do not change mute store logic.
- CSS class `sfx-lab-muted` stays on the element for paint/border.

## Steps

1. After plan 001’s status slot exists, convert the mute `<p>` to:
   ```tsx
   <AnimatePresence initial={false}>
     {muted && (
       <motion.p
         key="mute-banner"
         className="sfx-lab-muted rounded-lg px-2.5 py-1 text-[11px] leading-snug sm:rounded-xl sm:px-3 sm:py-1.5 sm:text-xs"
         initial={
           reducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }
         }
         animate={{ opacity: 1, y: 0 }}
         exit={
           reducedMotion
             ? { opacity: 0, transition: { duration: 0.15, ease: easeOut } }
             : {
                 opacity: 0,
                 y: -4,
                 transition: { duration: 0.15, ease: easeOut },
               }
         }
         transition={{ duration: 0.2, ease: easeOut }}
       >
         Sound is muted. Use the speaker toggle to unmute previews.
       </motion.p>
     )}
   </AnimatePresence>
   ```

2. **Mounting rule**: `AnimatePresence` for mute must remain mounted while exit runs. Do **not** wrap both mute Presence and its parent in `{muted && (` such that Presence unmounts immediately. Preferred structure under the toolbar:
   ```tsx
   <div className="mt-1.5 space-y-1 sm:mt-2">
     <AnimatePresence initial={false}>
       {muted && <motion.p key="mute-banner" ... />}
     </AnimatePresence>
     <AnimatePresence initial={false}>
       {copyStatus && <motion.p key="copy-status" ... />}
     </AnimatePresence>
   </div>
   ```
   Always render this `div` **or** use one shared `AnimatePresence` with both conditional children (also fine). If the outer `div` is always rendered, hide empty gap with `empty:hidden` / conditional `mt-*` only when `muted || copyStatus || exiting` — simplest acceptable: always keep the `mt-1.5` div when either flag is true OR Presence is animating; if gap flickers, always render the div with `min-h-0`.

3. Do not change `TickSoundToggle` animation.

## Boundaries

- Do NOT restyle the banner beyond motion props.
- Do NOT change copy-status copy/strings.
- Do NOT add dependencies.
- If plan 001 already introduced a shared Presence wrapper, extend it instead of nesting conflicting wrappers — STOP and reconcile rather than double-wrapping awkwardly.

## Verification

- **Mechanical**: `npm run lint` passes.
- **Feel check** (`/sfx`):
  1. Mute via speaker — banner enters from above (~200ms).
  2. Unmute — banner exits upward/fade (~150ms), same edge.
  3. With copy status visible, mute toggle does not kill copy Presence.
  4. Reduced motion — opacity only.
- **Done when**: mute banner no longer hard-cuts; exit uses the same edge as enter; lint clean.
