# 003 — Animate sfx layer list add/remove

- **Status**: TODO
- **Commit**: `9d471c4`
- **Severity**: MEDIUM
- **Category**: Missed opportunities (Preventing a jarring change + Spatial consistency)
- **Estimated scope**: 1 file (`src/components/sfx/SfxDashboard.tsx`), small–medium

## Problem

**Add layer** / **Remove** mounts and unmounts `LayerEditor` cards with no list presence or layout bridge. Sibling cards jump. Accordion open/close inside a card already animates; list membership does not.

```tsx
/* src/components/sfx/SfxDashboard.tsx:747–766 — current */
{recipe.layers.map((layer, index) => (
  <LayerEditor
    key={`${selection.kind}-${selection.name}-layer-${index}`}
    layer={layer}
    index={index}
    defaultOpen={index === 0 || recipe.layers.length <= 2}
    onChange={(nextLayer) => { ... }}
    onRemove={() => {
      if (recipe.layers.length <= 1) return;
      updateRecipe({
        ...recipe,
        layers: recipe.layers.filter((_, i) => i !== index),
      });
    }}
  />
))}
```

## Target

| Concern | Values |
| --- | --- |
| List wrapper | `AnimatePresence initial={false}` around the `.map` |
| Enter | `{ opacity: 0, y: 6 }` → `{ opacity: 1, y: 0 }` |
| Exit | `{ opacity: 0, y: -4 }` |
| Enter duration | `0.2` (`durations.ui`) |
| Exit duration | `0.15` (`durations.fast`) |
| Ease | `[0.165, 0.84, 0.44, 1]` (`easeOut` from `@/lib/motion`) **or** existing `panelEase` `[0.16, 1, 0.3, 1]` — pick **one** and use it for both enter and exit; prefer `easeOut` import for list items |
| Layout spring (siblings) | `{ type: "spring", stiffness: 420, damping: 32 }` on `layout` |
| Reduced motion | Opacity only (no `y`, no `layout` animation — use `layout={false}` or skip `layout` when reduced) |

**Do not** use `scale(0)`. Optional enter scale floor if desired: `scale: 0.97` only (never below 0.95).

Keep existing keys for this plan (`…-layer-${index}`). Note in verification that removing a **middle** layer may remount later indices (pre-existing key strategy); prioritize feel for append + remove-last.

## Repo conventions to follow

- Springs already in file: `tapSpring = { type: "spring", stiffness: 420, damping: 28 }` (line 61). Layout spring uses **damping: 32** (slightly less bounce than press).
- Accordion exemplar for Presence: lines 278–293.
- Import `durations` + `easeOut` from `@/lib/motion` if plan 001 has not already.

## Steps

1. Change `LayerEditor`’s root wrapper from `<div className="sfx-lab-layer">` to a `motion.div` that accepts optional presence props **or** wrap each instance at the call site.

   **Preferred (call site, fewer API changes):**
   ```tsx
   <AnimatePresence initial={false}>
     {recipe.layers.map((layer, index) => (
       <motion.div
         key={`${selection.kind}-${selection.name}-layer-${index}`}
         layout={!reducedMotion}
         initial={
           reducedMotion ? { opacity: 0 } : { opacity: 0, y: 6 }
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
         transition={{
           duration: 0.2,
           ease: easeOut,
           layout: { type: "spring", stiffness: 420, damping: 32 },
         }}
       >
         <LayerEditor
           key={/* remove duplicate key from LayerEditor — key stays on motion.div */}
           layer={layer}
           index={index}
           ...
         />
       </motion.div>
     ))}
   </AnimatePresence>
   ```

2. Move the React `key` to the `motion.div` wrapper; do **not** leave a second key on `LayerEditor`.

3. Ensure `LayerEditor` root remains `className="sfx-lab-layer"` (styles unchanged).

4. Do not change accordion chevron / body animation inside `LayerEditor`.

## Boundaries

- Do NOT change layer DSP fields or Add layer recipe defaults.
- Do NOT introduce stable layer IDs unless required for Presence bugs — out of scope unless remove-middle is broken badly; if so, STOP and report.
- Do NOT animate sound-rail chips or selection changes.
- Do NOT add dependencies.

## Verification

- **Mechanical**: `npm run lint` passes.
- **Feel check** (`/sfx`):
  1. **Add layer** — new card enters with slight downward settle (~200ms); existing cards spring into place.
  2. **Remove** on the last layer (when >1) — card exits upward/fade (~150ms); remaining cards lay out smoothly.
  3. Spam Add/Remove — no stuck opacity; interruptible.
  4. Expand/collapse chevron still works and is unchanged in feel.
  5. `prefers-reduced-motion` — opacity only; no vertical travel / layout spring.
- **Done when**: add/remove no longer hard-cuts; accordion internals untouched; lint clean.
