# 006 — Animate empty drafts → first draft chip

- **Status**: TODO
- **Commit**: `9d471c4`
- **Severity**: LOW
- **Category**: Missed opportunities (Delight + Preventing a jarring change)
- **Estimated scope**: 1 file (`src/components/sfx/SfxDashboard.tsx`), small
- **Depends on**: None (rail Custom section only)

## Problem

The Custom rail hard-cuts between the empty copy and the draft list when the first draft is created (or the last draft is deleted).

```tsx
/* src/components/sfx/SfxDashboard.tsx:659–681 — current */
{draftNames.length === 0 ? (
  <p className="px-2 text-xs text-[var(--sfx-ink-soft)]">
    No drafts yet.
  </p>
) : (
  <ul className="space-y-0.5">
    {draftNames.map((name) => (
      <li key={name}>
        <SoundChip
          label={name}
          active={selection.kind === "draft" && selection.name === name}
          onSelect={() => { ... }}
        />
      </li>
    ))}
  </ul>
)}
```

This is a **rare / first-time** beat (empty → created) — the only place in the lab opportunities list that may spend a little delight budget. Still keep UI ≤ 200ms; no bounce party.

## Target

| Element | Motion |
| --- | --- |
| Empty copy exit | `{ opacity: 1 }` → `{ opacity: 0 }`, duration `0.15`, ease `[0.165, 0.84, 0.44, 1]` |
| Empty copy enter (when last draft deleted) | `{ opacity: 0 }` → `{ opacity: 1 }`, duration `0.15`, same ease |
| First / each draft chip enter | `{ opacity: 0, scale: 0.97 }` → `{ opacity: 1, scale: 1 }`, duration `0.2`, ease `easeOut` |
| Draft chip exit (delete last / remove one) | `{ opacity: 0, scale: 0.97 }`, duration `0.15` |
| Reduced motion | Opacity only (no scale) |
| Stagger | **None** on every drafts reload. At most a single chip enter — no 30–80ms list stagger for the full drafts list on page load. |

**Never** `scale(0)`. Do not stagger built-ins. Do not animate on every page visit for an already-populated list beyond Presence defaults for items that mount with the page — use `initial={false}` on `AnimatePresence` so hydration/first paint does not replay enters for existing drafts.

## Repo conventions to follow

- `SoundChip` is already a `motion.button` with hover/tap springs (lines 113–133). Prefer wrapping `<li>` with `motion.li` for presence, leaving `SoundChip` as-is.
- Draft keys already stable: `key={name}`.

## Steps

1. Replace the ternary with a single Custom section body that always mounts Presence:
   ```tsx
   <div className="relative">
     <AnimatePresence initial={false} mode="popLayout">
       {draftNames.length === 0 ? (
         <motion.p
           key="drafts-empty"
           className="px-2 text-xs text-[var(--sfx-ink-soft)]"
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           transition={{ duration: 0.15, ease: easeOut }}
         >
           No drafts yet.
         </motion.p>
       ) : (
         <motion.ul
           key="drafts-list"
           className="space-y-0.5"
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           transition={{ duration: 0.15, ease: easeOut }}
         >
           <AnimatePresence initial={false}>
             {draftNames.map((name) => (
               <motion.li
                 key={name}
                 initial={
                   reducedMotion
                     ? { opacity: 0 }
                     : { opacity: 0, scale: 0.97 }
                 }
                 animate={{ opacity: 1, scale: 1 }}
                 exit={
                   reducedMotion
                     ? { opacity: 0 }
                     : { opacity: 0, scale: 0.97 }
                 }
                 transition={{ duration: 0.2, ease: easeOut }}
               >
                 <SoundChip ... />
               </motion.li>
             ))}
           </AnimatePresence>
         </motion.ul>
       )}
     </AnimatePresence>
   </div>
   ```

2. If nested `AnimatePresence` + ternary on empty/list feels flaky, simpler acceptable variant:
   - Always render the `<ul>` (empty when no drafts).
   - Separately Presence-animate the empty `<p>` when `draftNames.length === 0`.
   - Presence-animate each `motion.li` inside the ul.
   - Empty `<p>` and list can coexist briefly during crossfade — keep both in one `AnimatePresence` with different keys (`drafts-empty` vs each name) **without** wrapping the whole list in a second keyed parent if that double-fades. Prefer: empty paragraph **or** list items as siblings under one Presence:
     ```tsx
     <ul className="space-y-0.5">
       <AnimatePresence initial={false}>
         {draftNames.length === 0 && (
           <motion.li key="drafts-empty" ...>
             <p className="px-2 text-xs ...">No drafts yet.</p>
           </motion.li>
         )}
         {draftNames.map((name) => (
           <motion.li key={name} ...>
             <SoundChip ... />
           </motion.li>
         ))}
       </AnimatePresence>
     </ul>
     ```
   This is the **recommended** structure for the executor (simplest).

3. Keep `SoundChip` press/hover springs unchanged.

4. Do **not** add enter animation to the Built-ins list above.

## Boundaries

- Do NOT celebrate with long springs, confetti, or >300ms motion.
- Do NOT stagger multiple existing drafts on first page load (`initial={false}`).
- Do NOT change draft persistence (`writeDrafts` / localStorage).
- Do NOT add dependencies.

## Verification

- **Mechanical**: `npm run lint` passes.
- **Feel check** (`/sfx`):
  1. With no drafts, empty copy visible.
  2. **New sound** or **Duplicate** + **Save draft** — empty fades out (~150ms); first chip scales in from 0.97 (~200ms).
  3. Reload page with drafts present — chips must **not** replay a stagger/entrance parade (`initial={false}`).
  4. Delete last draft — chip exits; empty copy fades back in.
  5. Reduced motion — opacity only.
- **Done when**: empty↔first-draft no longer hard-cuts; populated load stays quiet; lint clean.
