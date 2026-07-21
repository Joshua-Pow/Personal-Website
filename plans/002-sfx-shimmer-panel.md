# 002 — Animate sfx shimmer controls open/close

- **Status**: TODO
- **Commit**: `9d471c4`
- **Severity**: MEDIUM
- **Category**: Missed opportunities (State indication + Preventing a jarring change)
- **Estimated scope**: 1 file (`src/components/sfx/SfxDashboard.tsx`), small

## Problem

**Add shimmer** / **Remove** hard-swaps the parameter grid with no height/opacity bridge. Layer accordions in the same canvas already animate; shimmer should match.

```tsx
/* src/components/sfx/SfxDashboard.tsx:803–868 — current */
{recipe.shimmer && (
  <div className="grid grid-cols-2 gap-2">
    <NumberField label="Delay" ... />
    <NumberField label="Feedback" ... />
    <NumberField label="Wet" ... />
    <NumberField label="Lowpass" ... />
  </div>
)}
```

Toggle controls live just above at `SfxDashboard.tsx:774–801`.

## Target

Match the layer-body accordion pattern already in this file.

| Phase | Full motion | Reduced motion |
| --- | --- | --- |
| initial | `{ height: 0, opacity: 0 }` | `{ opacity: 0 }` (no height) |
| animate | `{ height: "auto", opacity: 1 }` | `{ opacity: 1 }` |
| exit | `{ height: 0, opacity: 0 }` | `{ opacity: 0 }` |
| transition | `{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }` (`panelEase` already defined at line 64) | `{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }` |

Wrapper must use `className="overflow-hidden"`. Key: `"shimmer-fields"`. `AnimatePresence initial={false}`.

## Repo conventions to follow

- Exemplar (copy this structure):

```tsx
/* src/components/sfx/SfxDashboard.tsx:278–293 */
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

- `panelEase` is already `const panelEase = [0.16, 1, 0.3, 1] as const` at line 64.
- `AnimatePresence` / `motion` / `useReducedMotion` already imported.

## Steps

1. In `SfxDashboard` (the page component, not `LayerEditor`), call `const reducedMotion = useReducedMotion();` if not already added by plan 001.

2. Replace the shimmer conditional block (`{recipe.shimmer && ( <div className="grid...`) with:
   ```tsx
   <AnimatePresence initial={false}>
     {recipe.shimmer && (
       <motion.div
         key="shimmer-fields"
         initial={
           reducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }
         }
         animate={
           reducedMotion
             ? { opacity: 1 }
             : { height: "auto", opacity: 1 }
         }
         exit={
           reducedMotion
             ? { opacity: 0 }
             : { height: 0, opacity: 0 }
         }
         transition={{
           duration: reducedMotion ? 0.15 : 0.2,
           ease: panelEase,
         }}
         className="overflow-hidden"
       >
         <div className="grid grid-cols-2 gap-2">
           {/* existing NumberFields unchanged */}
         </div>
       </motion.div>
     )}
   </AnimatePresence>
   ```

3. Leave Add/Remove shimmer `LabButton`s and their `updateRecipe` handlers unchanged.

## Boundaries

- Do NOT retune layer accordion motion.
- Do NOT change shimmer audio DSP / recipe shape.
- Do NOT add dependencies.
- Do NOT animate the NumberField values themselves.
- If `recipe.shimmer` UI moved since `9d471c4`, find by the “Shimmer” heading — STOP if removed.

## Verification

- **Mechanical**: `npm run lint` passes.
- **Feel check** (`/sfx`, select a sound, scroll to Shimmer):
  1. Click **Add shimmer** — fields expand over ~200ms; no instant pop.
  2. Click **Remove** — fields collapse over ~200ms; siblings below (TypeScript export) do not jump with a hard cut.
  3. Spam Add/Remove — animation retargets / does not keyframe-jump from zero mid-flight (Motion spring/tween interruptibility).
  4. `prefers-reduced-motion: reduce` — opacity only, no height slide.
  5. Animations panel @ 10% — ease-out feel (fast start), not ease-in.
- **Done when**: shimmer grid matches layer accordion motion language; lint clean.
