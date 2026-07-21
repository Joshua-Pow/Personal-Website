# 001 — Animate sfx lab copy-status feedback

- **Status**: TODO
- **Commit**: `9d471c4`
- **Severity**: MEDIUM
- **Category**: Missed opportunities (Feedback + Preventing a jarring change)
- **Estimated scope**: 1 file (`src/components/sfx/SfxDashboard.tsx`), small

## Problem

After **Copy as TypeScript** / **Copy TS**, the status line mounts and disappears with no enter/exit bridge. The action already plays `success` audio when unmuted, but the visual confirmation teleports.

```tsx
/* src/components/sfx/SfxDashboard.tsx:613–627 — current */
{(muted || copyStatus) && (
  <div className="mt-1.5 space-y-1 sm:mt-2">
    {muted && (
      <p className="sfx-lab-muted rounded-lg px-2.5 py-1 text-[11px] leading-snug sm:rounded-xl sm:px-3 sm:py-1.5 sm:text-xs">
        Sound is muted. Use the speaker toggle to unmute previews.
      </p>
    )}
    {copyStatus && (
      <p className="text-[11px] text-[var(--sfx-ink-soft)] sm:text-xs" role="status">
        {copyStatus}
        {dirty ? " · unsaved edits" : ""}
      </p>
    )}
  </div>
)}
```

`copyStatus` is set in `copyTs` (~557–567) and cleared on some selection changes (e.g. `createNew` sets `setCopyStatus(null)`).

## Target

Animate only the **copy status** `<p role="status">` with `AnimatePresence` (already imported in this file).

| Phase | Values |
| --- | --- |
| Enter initial | `{ opacity: 0, y: 4 }` |
| Enter / animate | `{ opacity: 1, y: 0 }` |
| Exit | `{ opacity: 0, y: 2 }` |
| Enter transition | `{ duration: 0.2, ease: [0.165, 0.84, 0.44, 1] }` (`easeOut` from `@/lib/motion`, aka `durations.ui`) |
| Exit transition | `{ duration: 0.15, ease: [0.165, 0.84, 0.44, 1] }` (`durations.fast`) |
| Reduced motion | Drop `y`; keep opacity. Duration `0.15` both ways. |

Never use `scale(0)`. Do not wrap the mute banner in this plan (see `005`).

## Repo conventions to follow

- Motion library: `motion/react` (`AnimatePresence`, `motion`, `useReducedMotion` already imported).
- Shared easings/durations: `src/lib/motion.ts` — `easeOut`, `durations.ui` (0.2), `durations.fast` (0.15).
- Local panel ease already in file: `panelEase = [0.16, 1, 0.3, 1]` — prefer **importing** `easeOut` + `durations` from `@/lib/motion` for this toast (matches site-wide enter/exit).
- Exemplar accordion enter/exit in the same file:

```tsx
/* src/components/sfx/SfxDashboard.tsx:278–293 — exemplar */
<AnimatePresence initial={false}>
  {open && (
    <motion.div
      key="layer-body"
      initial={reducedMotion ? false : { height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={reducedMotion ? undefined : { height: 0, opacity: 0 }}
      transition={{ duration: 0.2, ease: panelEase }}
      className="overflow-hidden"
    >
```

## Steps

1. In `src/components/sfx/SfxDashboard.tsx`, add:
   ```ts
   import { durations, easeOut } from "@/lib/motion";
   ```
   (merge with any existing imports from that module if present later).

2. Inside `SfxDashboard`, read `useReducedMotion()` once at the top of the component (if not already present on that component — today it is only used inside child components). Store as `reducedMotion`.

3. Replace the copy-status branch so the outer `(muted || copyStatus)` wrapper stays, but `copyStatus` renders through `AnimatePresence`:
   ```tsx
   <AnimatePresence initial={false}>
     {copyStatus && (
       <motion.p
         key="copy-status"
         role="status"
         className="text-[11px] text-[var(--sfx-ink-soft)] sm:text-xs"
         initial={
           reducedMotion ? { opacity: 0 } : { opacity: 0, y: 4 }
         }
         animate={{ opacity: 1, y: 0 }}
         exit={
           reducedMotion
             ? { opacity: 0 }
             : { opacity: 0, y: 2 }
         }
         transition={{
           duration: reducedMotion ? durations.fast : durations.ui,
           ease: easeOut,
           ...( /* optional asymmetric exit */ ),
         }}
       >
         {copyStatus}
         {dirty ? " · unsaved edits" : ""}
       </motion.p>
     )}
   </AnimatePresence>
   ```
   For asymmetric exit timing, prefer:
   ```ts
   transition={{
     duration: durations.ui,
     ease: easeOut,
     opacity: { duration: reducedMotion ? durations.fast : durations.ui },
   }}
   ```
   and on exit override via `exit` + a slightly shorter duration by using:
   ```tsx
   transition={{
     duration: durations.ui,
     ease: easeOut,
   }}
   ```
   with exit duration `durations.fast` via:
   ```tsx
   transition={{
     ease: easeOut,
     opacity: { duration: durations.fast },
     y: { duration: durations.fast },
   }}
   ```
   Simplest acceptable implementation: enter `duration: durations.ui`, and set `exit` transition with `duration: durations.fast` using Motion’s per-element:
   ```tsx
   transition={
     reducedMotion
       ? { duration: durations.fast, ease: easeOut }
       : { duration: durations.ui, ease: easeOut }
   }
   ```
   Feel-check may accept symmetric 200ms; **prefer** exit at `durations.fast` (0.15) if easy — e.g. custom:
   ```tsx
   transition={{ duration: durations.ui, ease: easeOut }}
   ```
   and document feel-check for exit speed. **Required target**: exit ≤ 150ms. Use:
   ```tsx
   transition={{
     duration: durations.ui,
     ease: easeOut,
     exit: { duration: durations.fast },
   }}
   ```
   If Motion version rejects nested `exit` in `transition`, use enter `0.2` / accept exit defaulting to same, then add a comment — but try:
   ```tsx
   <motion.p
     ...
     transition={{ duration: durations.fast, ease: easeOut }}
   />
   ```
   **Canonical required values for the executor**:
   - enter duration **0.2s**, exit duration **0.15s**, ease **`[0.165, 0.84, 0.44, 1]`**.
   - Implementation tip: two transitions via `custom` is unnecessary; use:
     ```tsx
     transition={{ duration: 0.2, ease: easeOut }}
     ```
     for animate, and for exit Motion inherits — to force exit 0.15, set:
     ```tsx
     exit={{
       opacity: 0,
       y: reducedMotion ? 0 : 2,
       transition: { duration: 0.15, ease: easeOut },
     }}
     ```

4. Keep mute banner markup unchanged in this plan.

5. Ensure parent wrapper still gates on `(muted || copyStatus)` so empty space collapses when both are absent. Because `AnimatePresence` needs to stay mounted for exit, **restructure** as:
   ```tsx
   <div className="mt-1.5 space-y-1 sm:mt-2">
     {/* mute left for plan 005 */}
     {muted && ( ... existing p ... )}
     <AnimatePresence initial={false}>
       {copyStatus && ( <motion.p ... /> )}
     </AnimatePresence>
   </div>
   ```
   Only render the outer `div` when `muted || copyStatus` **OR** always render the outer div with `AnimatePresence` inside so exits can run. **Required**: keep `AnimatePresence` mounted while exiting — prefer always rendering:
   ```tsx
   <div className="mt-1.5 space-y-1 sm:mt-2 empty:hidden">
   ```
   or keep conditional parent but put `AnimatePresence` **outside** the conditional:
   ```tsx
   <AnimatePresence initial={false}>
     {copyStatus && <motion.p key="copy-status" ... />}
   </AnimatePresence>
   ```
   placed as a sibling under the toolbar (below the actions row), with mute still conditional nearby. Minimal change that preserves exit: wrap only copy line; parent `(muted || copyStatus)` may cut exit short — **fix**: always render a status slot:
   ```tsx
   <div className="mt-1.5 space-y-1 sm:mt-2">
     {muted && (...)}
     <AnimatePresence initial={false}>
       {copyStatus && (...)}
     </AnimatePresence>
   </div>
   ```
   and use CSS so the slot adds no gap when empty (`:empty` or only apply `mt-*` when content exists). Acceptable approach: keep `{(muted || copyStatus) && (` wrapper **and** accept that clearing copy while muted still works; when clearing copy with no mute, exit may be skipped — then move `AnimatePresence` outside that conditional (preferred).

## Boundaries

- Do NOT change shimmer, layers list, toolbar Reset/Delete, draft empty state, or mute banner motion (plans 002–006).
- Do NOT add dependencies.
- Do NOT change `copyTs` audio behavior or clipboard logic.
- Do NOT introduce `scale(0)` or durations > 300ms.
- If line numbers drifted since `9d471c4`, locate by `role="status"` / `copyStatus` — STOP and report if the status UI was removed.

## Verification

- **Mechanical**: `npm run lint` (eslint + `tsc --noEmit`) passes.
- **Feel check** (`/sfx`):
  1. Unmute, click **Copy TS** — status fades/slides in within ~200ms; does not pop from `scale(0)`.
  2. Trigger `setCopyStatus(null)` (e.g. **New sound**) — status exits in ~150ms toward `y: 2`, not a hard cut (if `AnimatePresence` is mounted correctly).
  3. DevTools → Rendering → `prefers-reduced-motion: reduce` — opacity remains; no vertical slide.
  4. Animations panel at 10% speed — enter starts quickly (ease-out), no sluggish ease-in.
- **Done when**: copy status never hard-cuts on appear; reduced-motion drops `y` only; lint clean.
