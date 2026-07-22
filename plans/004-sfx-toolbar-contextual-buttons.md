# 004 — Animate sfx toolbar contextual actions

- **Status**: DONE
- **Commit**: `9d471c4`
- **Severity**: LOW
- **Category**: Missed opportunities (State indication + Preventing a jarring change)
- **Estimated scope**: 1 file (`src/components/sfx/SfxDashboard.tsx`), small

## Problem

**Reset to builtin** / **Delete draft** mount and unmount inside the sticky toolbar grid, reflowing neighbors with no enter/exit or layout transition.

```tsx
/* src/components/sfx/SfxDashboard.tsx:596–607 — current */
{selection.kind === "builtin" && dirty && (
  <LabButton onClick={resetBuiltin}>
    <span className="sm:hidden">Reset</span>
    <span className="hidden sm:inline">Reset to builtin</span>
  </LabButton>
)}
{selection.kind === "draft" && drafts[selection.name] && (
  <LabButton onClick={deleteDraft}>
    <span className="sm:hidden">Delete</span>
    <span className="hidden sm:inline">Delete draft</span>
  </LabButton>
)}
```

Parent: `.sfx-lab-toolbar-actions` at line 583 (`grid` / `sm:flex`).

## Target

| Concern | Values |
| --- | --- |
| Enter | `{ opacity: 0, scale: 0.97 }` → `{ opacity: 1, scale: 1 }` |
| Exit | `{ opacity: 0, scale: 0.97 }` |
| Enter duration | `0.16` (160ms — button UI budget) |
| Exit duration | `0.12`–`0.15` (use `0.15` / `durations.fast`) |
| Ease | `[0.165, 0.84, 0.44, 1]` (`easeOut`) |
| Layout | `layout` on entering buttons + stable siblings so the grid reflows with spring `{ type: "spring", stiffness: 420, damping: 32 }` |
| Reduced motion | Opacity only; no scale; no layout spring |

**Never** `scale(0)`. No bounce on toolbar chrome (damping ≥ 32).

## Repo conventions to follow

- `LabButton` already uses `motion.button` with `whileHover` / `whileTap` and `tapSpring` (lines 77–105). Prefer wrapping contextual buttons in `AnimatePresence` + passing `layout` via `className`/`layout` prop if `LabButton` is extended.
- Press feedback must remain: do not remove `whileTap` scale 0.96.

## Steps

1. Extend `LabButton` to forward Motion presence-friendly props already in `ComponentProps<typeof motion.button>` — it already spreads `...props` onto `motion.button`, so `layout`, `initial`, `animate`, `exit`, and `transition` can be passed from the call site **without** changing `LabButton` internals, as long as they don’t conflict with `whileHover`/`whileTap`. Verify the spread order: `{...props}` currently comes **before** `whileHover` — presence props on the call site via `...props` work.

2. Wrap the two contextual buttons (only) in:
   ```tsx
   <AnimatePresence initial={false}>
     {selection.kind === "builtin" && dirty && (
       <LabButton
         key="reset-builtin"
         layout={!reducedMotion}
         initial={
           reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97 }
         }
         animate={{ opacity: 1, scale: 1 }}
         exit={
           reducedMotion
             ? { opacity: 0, transition: { duration: 0.15, ease: easeOut } }
             : {
                 opacity: 0,
                 scale: 0.97,
                 transition: { duration: 0.15, ease: easeOut },
               }
         }
         transition={{
           duration: 0.16,
           ease: easeOut,
           layout: { type: "spring", stiffness: 420, damping: 32 },
         }}
         onClick={resetBuiltin}
       >
         ...
       </LabButton>
     )}
     {selection.kind === "draft" && drafts[selection.name] && (
       <LabButton
         key="delete-draft"
         layout={!reducedMotion}
         initial={...same as reset...}
         animate={{ opacity: 1, scale: 1 }}
         exit={...same as reset...}
         transition={...same as reset...}
         onClick={deleteDraft}
       >
         ...
       </LabButton>
     )}
   </AnimatePresence>
   ```

3. Add `layout={!reducedMotion}` to the **stable** toolbar `LabButton`s (Play, New, Duplicate, Save, Copy) so they smoothly make room — **or** only layout the contextual ones if sibling layout causes jank. Feel-check: if laying out all buttons feels busy, layout contextual only.

4. Ensure `reducedMotion` is available in `SfxDashboard` (shared with plans 001–003).

## Boundaries

- Do NOT change Play preview behavior or button visual styles (squircle CSS).
- Do NOT hold-to-confirm Delete in this plan.
- Do NOT animate the mute/copy status region (plans 001 / 005).
- Do NOT add dependencies.
- If `LabButton` prop conflicts prevent `initial`/`exit`, wrap each contextual control in `motion.div` with the presence props and keep `LabButton` inside — acceptable fallback.

## Verification

- **Mechanical**: `npm run lint` passes.
- **Feel check** (`/sfx`):
  1. Edit a builtin (dirty) — **Reset** fades/scales in over ~160ms; neighbors reflow without a hard jump.
  2. Click Reset — button exits (~150ms) when dirty clears.
  3. Save a draft / select a draft — **Delete** enters the same way; deleting removes it smoothly.
  4. Reduced motion — opacity only.
  5. Confirm press spring on Play / Reset still feels snappy (not softened by layout spring).
- **Done when**: contextual actions no longer pop the toolbar grid; lint clean.
