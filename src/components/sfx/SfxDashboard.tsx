"use client";

import {
  useCallback,
  useMemo,
  useState,
  useSyncExternalStore,
  type ComponentProps,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  RECIPES,
  SOUND_BLURBS,
  cloneRecipe,
  createBlankRecipe,
  getSoundVisual,
  play,
  playRecipe,
  sounds,
  type NoiseLayer,
  type SoundLayer,
  type SoundName,
  type SoundRecipe,
  type ToneLayer,
} from "@/lib/sfx";
import { SoundMark } from "@/components/sfx/SoundMark";
import {
  getDraftsServerSnapshot,
  getDraftsSnapshot,
  recipeToTypeScript,
  subscribeDrafts,
  writeDrafts,
  type SfxDraftMap,
} from "@/lib/sfx/drafts";
import {
  getTickSoundMutedServerSnapshot,
  getTickSoundMutedSnapshot,
  subscribeTickSoundMuted,
} from "@/lib/tick-sound";
import { durations, easeOut } from "@/lib/motion";
import { cn } from "@/lib/utils/cn";

type Selection =
  | { kind: "builtin"; name: SoundName }
  | { kind: "draft"; name: string };

const WAVEFORMS: OscillatorType[] = ["sine", "triangle", "square", "sawtooth"];
const FILTER_TYPES: BiquadFilterType[] = [
  "lowpass",
  "highpass",
  "bandpass",
  "notch",
];

const fieldClass =
  "sfx-lab-field min-h-10 w-full px-2.5 py-1.5 text-sm focus:outline-none sm:min-h-0 sm:py-1.5";
const labelClass = "sfx-lab-label mb-1 block";
const btnClass =
  "sfx-lab-btn inline-flex min-h-9 items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_oklch,var(--sfx-gold)_45%,transparent)] disabled:cursor-not-allowed sm:min-h-0 sm:px-3.5";
const btnAccentClass =
  "sfx-lab-btn-play inline-flex min-h-9 items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_oklch,var(--sfx-poppy)_40%,transparent)] sm:min-h-0 sm:px-4";
const btnIconClass =
  "sfx-lab-btn inline-flex size-9 shrink-0 items-center justify-center p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_oklch,var(--sfx-gold)_45%,transparent)] disabled:cursor-not-allowed sm:size-8";

/** Snappy UI spring — interruptible hover/press feedback (100–250ms feel). */
const tapSpring = { type: "spring" as const, stiffness: 420, damping: 28 };
/** Accordion chevron — same spring family as toolbar buttons. */
const chevronSpring = { type: "spring" as const, stiffness: 420, damping: 28 };
const panelEase = [0.16, 1, 0.3, 1] as const;
/** Layout reflow for list/toolbar membership changes. */
const layoutSpring = { type: "spring" as const, stiffness: 420, damping: 32 };

function IconPlus({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={cn("size-3.5", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function IconTrash({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={cn("size-3.5", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 7h16" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <path d="M6.5 7l.8 12.2A1.5 1.5 0 0 0 8.8 21h6.4a1.5 1.5 0 0 0 1.5-1.8L17.5 7" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

function slugifyName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

type LabButtonProps = Omit<ComponentProps<typeof motion.button>, "children"> & {
  variant?: "secondary" | "play" | "icon";
  children: React.ReactNode;
};

function LabButton({
  variant = "secondary",
  className,
  children,
  disabled,
  transition,
  ...props
}: LabButtonProps) {
  const reducedMotion = useReducedMotion();
  const inert = Boolean(disabled || reducedMotion);
  const variantClass =
    variant === "play"
      ? btnAccentClass
      : variant === "icon"
        ? btnIconClass
        : btnClass;

  return (
    <motion.button
      {...props}
      type="button"
      disabled={disabled}
      className={cn(variantClass, className)}
      whileHover={
        inert
          ? undefined
          : variant === "icon"
            ? { scale: 1.04 }
            : { y: -1.5, scale: 1.03 }
      }
      whileTap={inert ? undefined : { y: 0, scale: 0.96 }}
      transition={transition ? { ...tapSpring, ...transition } : tapSpring}
      data-sfx-press
      data-sfx-release
    >
      {children}
    </motion.button>
  );
}

type SoundChipProps = {
  name: string;
  kind: "builtin" | "draft";
  active: boolean;
  onSelect: () => void;
};

function SoundChip({ name, kind, active, onSelect }: SoundChipProps) {
  const reducedMotion = useReducedMotion();
  const visual = getSoundVisual(name, kind);
  const accent = `oklch(62% 0.12 ${visual.hue})`;
  const wash = `oklch(94% 0.035 ${visual.hue})`;
  const washStrong = `oklch(90% 0.055 ${visual.hue})`;

  return (
    <motion.button
      type="button"
      className={cn(
        "sfx-lab-sound flex min-h-11 w-full items-center gap-2.5 px-2 py-1.5 text-left sm:min-h-0 sm:py-1.5",
        active && "sfx-lab-sound-active"
      )}
      style={
        {
          "--sound-accent": accent,
          "--sound-wash": wash,
          "--sound-wash-strong": washStrong,
        } as React.CSSProperties
      }
      whileHover={reducedMotion ? undefined : { x: 2, scale: 1.01 }}
      whileTap={reducedMotion ? undefined : { scale: 0.96 }}
      transition={tapSpring}
      data-sfx-press
      data-sfx-release
      onClick={onSelect}
    >
      <span className="sfx-lab-sound-mark" aria-hidden>
        <SoundMark mark={visual.mark} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="sfx-lab-sound-title block truncate">
          {visual.title}
        </span>
        <span className="sfx-lab-sound-cue block truncate">{visual.cue}</span>
      </span>
    </motion.button>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step,
}: {
  label: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <input
        type="number"
        className={fieldClass}
        value={value ?? ""}
        min={min}
        max={max}
        step={step ?? "any"}
        onChange={(event) => {
          const raw = event.target.value;
          if (raw === "") {
            onChange(undefined);
            return;
          }
          const next = Number(raw);
          if (!Number.isNaN(next)) onChange(next);
        }}
      />
    </label>
  );
}

function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <select
        className={fieldClass}
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function LayerEditor({
  layer,
  index,
  onChange,
  onRemove,
  removeDisabled = false,
  defaultOpen = true,
}: {
  layer: SoundLayer;
  index: number;
  onChange: (layer: SoundLayer) => void;
  onRemove: () => void;
  removeDisabled?: boolean;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  const setTone = (patch: Partial<ToneLayer>) => {
    if (layer.kind !== "tone") return;
    onChange({ ...layer, ...patch });
  };

  const setNoise = (patch: Partial<NoiseLayer>) => {
    if (layer.kind !== "noise") return;
    onChange({ ...layer, ...patch });
  };

  const summary =
    layer.kind === "tone"
      ? `${layer.waveform} · ${Math.round(layer.frequency)}Hz`
      : `${layer.filterType} · ${Math.round(layer.filterFrequency)}Hz`;

  const reducedMotion = useReducedMotion();

  return (
    <div className="sfx-lab-layer">
      <div className="flex items-center gap-2 px-3 py-2">
        <motion.button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-2 rounded-lg text-left"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          whileHover={reducedMotion ? undefined : { x: 1 }}
          whileTap={reducedMotion ? undefined : { scale: 0.98 }}
          transition={tapSpring}
        >
          <motion.span
            className="inline-flex size-5 shrink-0 items-center justify-center text-[var(--sfx-ink-soft)]"
            animate={{ rotate: open ? 90 : 0 }}
            transition={reducedMotion ? { duration: 0 } : chevronSpring}
            aria-hidden
          >
            <svg
              viewBox="0 0 24 24"
              className="size-[1.125rem]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 6l6 6-6 6" />
            </svg>
          </motion.span>
          <span className="sfx-lab-layer-title shrink-0">
            Layer {index + 1}
          </span>
          <span className="sfx-lab-layer-meta min-w-0 truncate">
            {summary}
          </span>
        </motion.button>
        <LabButton
          variant="icon"
          onClick={onRemove}
          disabled={removeDisabled}
          aria-label={`Remove layer ${index + 1}`}
          title="Remove layer"
        >
          <IconTrash />
        </LabButton>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="layer-body"
            initial={
              reducedMotion ? false : { height: 0, opacity: 0 }
            }
            animate={{ height: "auto", opacity: 1 }}
            exit={
              reducedMotion
                ? undefined
                : { height: 0, opacity: 0 }
            }
            transition={{ duration: 0.2, ease: panelEase }}
            className="overflow-hidden"
          >
            <div className="space-y-3 border-t border-[var(--sfx-stroke)] px-3 py-3">
              <SelectField
                label="Kind"
                value={layer.kind}
                options={["tone", "noise"] as const}
                onChange={(kind) => {
                  if (kind === layer.kind) return;
                  if (kind === "tone") {
                    onChange({
                      kind: "tone",
                      waveform: "sine",
                      frequency: 880,
                      attack: layer.attack,
                      decay: layer.decay,
                      peak: layer.peak,
                      offset: layer.offset,
                    });
                  } else {
                    onChange({
                      kind: "noise",
                      filterType: "bandpass",
                      filterFrequency: 2000,
                      filterQ: 1,
                      attack: layer.attack,
                      decay: layer.decay,
                      peak: layer.peak,
                      offset: layer.offset,
                    });
                  }
                }}
              />

              <div className="grid grid-cols-2 gap-2">
                <NumberField
                  label="Offset"
                  value={layer.offset}
                  step={0.001}
                  min={0}
                  onChange={(offset) => onChange({ ...layer, offset })}
                />
                <NumberField
                  label="Attack"
                  value={layer.attack}
                  step={0.001}
                  min={0}
                  onChange={(attack) =>
                    onChange({ ...layer, attack: attack ?? layer.attack })
                  }
                />
                <NumberField
                  label="Decay"
                  value={layer.decay}
                  step={0.001}
                  min={0}
                  onChange={(decay) =>
                    onChange({ ...layer, decay: decay ?? layer.decay })
                  }
                />
                <NumberField
                  label="Peak"
                  value={layer.peak}
                  step={0.001}
                  min={0}
                  max={1}
                  onChange={(peak) =>
                    onChange({ ...layer, peak: peak ?? layer.peak })
                  }
                />
              </div>

              {layer.kind === "tone" ? (
                <div className="grid grid-cols-2 gap-2">
                  <SelectField
                    label="Waveform"
                    value={layer.waveform}
                    options={WAVEFORMS}
                    onChange={(waveform) => setTone({ waveform })}
                  />
                  <NumberField
                    label="Frequency"
                    value={layer.frequency}
                    step={1}
                    min={20}
                    onChange={(frequency) =>
                      setTone({ frequency: frequency ?? layer.frequency })
                    }
                  />
                  <NumberField
                    label="Detune"
                    value={layer.detune}
                    step={1}
                    onChange={(detune) => setTone({ detune })}
                  />
                  <NumberField
                    label="Glide to"
                    value={layer.glideTo}
                    step={1}
                    min={20}
                    onChange={(glideTo) => setTone({ glideTo })}
                  />
                  <NumberField
                    label="Glide time"
                    value={layer.glideTime}
                    step={0.001}
                    min={0}
                    onChange={(glideTime) => setTone({ glideTime })}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <SelectField
                    label="Filter"
                    value={layer.filterType}
                    options={FILTER_TYPES}
                    onChange={(filterType) => setNoise({ filterType })}
                  />
                  <NumberField
                    label="Filter Hz"
                    value={layer.filterFrequency}
                    step={1}
                    min={20}
                    onChange={(filterFrequency) =>
                      setNoise({
                        filterFrequency:
                          filterFrequency ?? layer.filterFrequency,
                      })
                    }
                  />
                  <NumberField
                    label="Filter Q"
                    value={layer.filterQ}
                    step={0.1}
                    min={0}
                    onChange={(filterQ) => setNoise({ filterQ })}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function SfxDashboard() {
  const reducedMotion = useReducedMotion();
  const muted = useSyncExternalStore(
    subscribeTickSoundMuted,
    getTickSoundMutedSnapshot,
    getTickSoundMutedServerSnapshot
  );

  const drafts = useSyncExternalStore(
    subscribeDrafts,
    getDraftsSnapshot,
    getDraftsServerSnapshot
  );

  const [selection, setSelection] = useState<Selection>({
    kind: "builtin",
    name: "tick",
  });
  const [recipe, setRecipe] = useState<SoundRecipe>(() =>
    cloneRecipe(RECIPES.tick)
  );
  const [draftName, setDraftName] = useState("tick");
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  const layoutEnabled = !reducedMotion;

  const persistDrafts = useCallback((next: SfxDraftMap) => {
    writeDrafts(next);
  }, []);

  const loadBuiltin = useCallback((name: SoundName) => {
    setSelection({ kind: "builtin", name });
    setDraftName(name);
    setRecipe(cloneRecipe(RECIPES[name]));
    setDirty(false);
    setCopyStatus(null);
  }, []);

  const loadDraft = useCallback(
    (name: string) => {
      const draft = drafts[name];
      if (!draft) return;
      setSelection({ kind: "draft", name });
      setDraftName(name);
      setRecipe(cloneRecipe(draft.recipe));
      setDirty(false);
      setCopyStatus(null);
    },
    [drafts]
  );

  const updateRecipe = useCallback((next: SoundRecipe) => {
    setRecipe(next);
    setDirty(true);
  }, []);

  const preview = useCallback(() => {
    playRecipe(recipe);
  }, [recipe]);

  const saveDraft = useCallback(() => {
    const name = slugifyName(draftName);
    if (!name) return;
    const next: SfxDraftMap = {
      ...drafts,
      [name]: {
        name,
        recipe: cloneRecipe(recipe),
        updatedAt: Date.now(),
      },
    };
    persistDrafts(next);
    setSelection({ kind: "draft", name });
    setDraftName(name);
    setDirty(false);
    setCopyStatus(`Saved draft “${name}”`);
  }, [draftName, drafts, persistDrafts, recipe]);

  const deleteDraft = useCallback(() => {
    if (selection.kind !== "draft") return;
    const next = { ...drafts };
    delete next[selection.name];
    persistDrafts(next);
    loadBuiltin("tick");
  }, [drafts, loadBuiltin, persistDrafts, selection]);

  const duplicateAsDraft = useCallback(() => {
    const base =
      selection.kind === "builtin" ? selection.name : selection.name;
    let candidate = slugifyName(`${base}-copy`);
    let i = 2;
    while (drafts[candidate] || (sounds as readonly string[]).includes(candidate)) {
      candidate = slugifyName(`${base}-copy-${i}`);
      i += 1;
    }
    setDraftName(candidate);
    setSelection({ kind: "draft", name: candidate });
    setDirty(true);
  }, [drafts, selection]);

  const createNew = useCallback(() => {
    let candidate = "new-sound";
    let i = 2;
    while (drafts[candidate] || (sounds as readonly string[]).includes(candidate)) {
      candidate = `new-sound-${i}`;
      i += 1;
    }
    setSelection({ kind: "draft", name: candidate });
    setDraftName(candidate);
    setRecipe(createBlankRecipe());
    setDirty(true);
    setCopyStatus(null);
  }, [drafts]);

  const resetBuiltin = useCallback(() => {
    if (selection.kind !== "builtin") return;
    setRecipe(cloneRecipe(RECIPES[selection.name]));
    setDirty(false);
  }, [selection]);

  const copyTs = useCallback(async () => {
    const name = slugifyName(draftName) || "custom";
    const snippet = recipeToTypeScript(name, recipe);
    try {
      await navigator.clipboard.writeText(snippet);
      setCopyStatus("Copied TypeScript snippet");
      if (!muted) play("success");
    } catch {
      setCopyStatus("Clipboard blocked — select and copy manually below");
    }
  }, [draftName, muted, recipe]);

  const draftNames = useMemo(
    () => Object.keys(drafts).sort((a, b) => a.localeCompare(b)),
    [drafts]
  );

  const tsSnippet = useMemo(
    () => recipeToTypeScript(slugifyName(draftName) || "custom", recipe),
    [draftName, recipe]
  );

  const selectedVisual = getSoundVisual(
    selection.kind === "builtin" ? selection.name : draftName,
    selection.kind
  );


  return (
    <div className="pb-6">
      <div className="sfx-lab-toolbar sticky top-3 z-20 mb-4 border px-2.5 py-2 backdrop-blur-md supports-[backdrop-filter]:bg-[color-mix(in_oklch,var(--sfx-linen)_78%,transparent)] sm:top-4 sm:mb-5 sm:px-3 sm:py-2.5">
        <div className="sfx-lab-toolbar-actions relative grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap sm:items-center sm:gap-2">
          <LabButton
            variant="play"
            className="col-span-2 sm:col-auto"
            layout={layoutEnabled}
            transition={{ layout: layoutSpring }}
            onClick={preview}
          >
            Play preview
          </LabButton>
          <LabButton
            layout={layoutEnabled}
            transition={{ layout: layoutSpring }}
            onClick={createNew}
          >
            New sound
          </LabButton>
          <LabButton
            layout={layoutEnabled}
            transition={{ layout: layoutSpring }}
            onClick={duplicateAsDraft}
          >
            Duplicate
          </LabButton>
          <LabButton
            layout={layoutEnabled}
            transition={{ layout: layoutSpring }}
            onClick={saveDraft}
            disabled={!slugifyName(draftName)}
          >
            Save draft
          </LabButton>
          {/*
            popLayout: pop exiting Reset/Delete out of flow immediately so
            siblings (e.g. Copy TS) can layout-animate into the freed cell.
            Default sync mode keeps the exiting button in-flow until unmount,
            so Copy TS only snaps after the fade finishes.
          */}
          <AnimatePresence initial={false} mode="popLayout">
            {selection.kind === "builtin" && dirty && (
              <LabButton
                key="reset-builtin"
                layout={layoutEnabled}
                initial={
                  reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97 }
                }
                animate={{ opacity: 1, scale: 1 }}
                exit={
                  reducedMotion
                    ? {
                        opacity: 0,
                        transition: { duration: durations.fast, ease: easeOut },
                      }
                    : {
                        opacity: 0,
                        scale: 0.97,
                        transition: { duration: durations.fast, ease: easeOut },
                      }
                }
                transition={{
                  duration: 0.16,
                  ease: easeOut,
                  layout: layoutSpring,
                }}
                onClick={resetBuiltin}
              >
                <span className="sm:hidden">Reset</span>
                <span className="hidden sm:inline">Reset to builtin</span>
              </LabButton>
            )}
            {selection.kind === "draft" && drafts[selection.name] && (
              <LabButton
                key="delete-draft"
                layout={layoutEnabled}
                initial={
                  reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97 }
                }
                animate={{ opacity: 1, scale: 1 }}
                exit={
                  reducedMotion
                    ? {
                        opacity: 0,
                        transition: { duration: durations.fast, ease: easeOut },
                      }
                    : {
                        opacity: 0,
                        scale: 0.97,
                        transition: { duration: durations.fast, ease: easeOut },
                      }
                }
                transition={{
                  duration: 0.16,
                  ease: easeOut,
                  layout: layoutSpring,
                }}
                onClick={deleteDraft}
              >
                <span className="sm:hidden">Delete</span>
                <span className="hidden sm:inline">Delete draft</span>
              </LabButton>
            )}
          </AnimatePresence>
          <LabButton
            layout={layoutEnabled}
            transition={{ layout: layoutSpring }}
            onClick={copyTs}
          >
            <span className="sm:hidden">Copy TS</span>
            <span className="hidden sm:inline">Copy as TypeScript</span>
          </LabButton>
        </div>
        <AnimatePresence initial={false}>
          {muted && (
            <motion.div
              key="mute-banner"
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
                  ? {
                      opacity: 0,
                      transition: { duration: durations.fast, ease: panelEase },
                    }
                  : {
                      height: 0,
                      opacity: 0,
                      transition: { duration: durations.fast, ease: panelEase },
                    }
              }
              transition={{ duration: durations.ui, ease: panelEase }}
              className="overflow-hidden"
            >
              <p className="sfx-lab-muted mt-1.5 rounded-lg px-2.5 py-1 text-[11px] leading-snug sm:mt-2 sm:rounded-xl sm:px-3 sm:py-1.5 sm:text-xs">
                Sound is muted. Use the speaker toggle to unmute previews.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence initial={false}>
          {copyStatus && (
            <motion.div
              key="copy-status"
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
                  ? {
                      opacity: 0,
                      transition: { duration: durations.fast, ease: panelEase },
                    }
                  : {
                      height: 0,
                      opacity: 0,
                      transition: { duration: durations.fast, ease: panelEase },
                    }
              }
              transition={{
                duration: reducedMotion ? durations.fast : durations.ui,
                ease: panelEase,
              }}
              className="overflow-hidden"
            >
              <p
                role="status"
                className="mt-1.5 text-[11px] text-[var(--sfx-ink-soft)] sm:mt-2 sm:text-xs"
              >
                {copyStatus}
                {dirty ? " · unsaved edits" : ""}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid items-start gap-5 md:grid-cols-[13rem_minmax(0,1fr)]">
        <aside className="sfx-lab-rail p-3 md:sticky md:top-[6.75rem] md:max-h-[calc(100dvh-7.5rem)] md:overflow-y-auto">
          <div className="space-y-5">
            <section>
              <h2 className="sfx-lab-section-label mb-2.5">
                Built-ins
              </h2>
              <ul className="space-y-0.5">
                {sounds.map((name) => (
                  <li key={name}>
                    <SoundChip
                      name={name}
                      kind="builtin"
                      active={
                        selection.kind === "builtin" && selection.name === name
                      }
                      onSelect={() => {
                        loadBuiltin(name);
                        play(name);
                      }}
                    />
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="sfx-lab-section-label mb-2.5">
                Custom
              </h2>
              <ul className="space-y-0.5">
                <AnimatePresence initial={false}>
                  {draftNames.length === 0 && (
                    <motion.li
                      key="drafts-empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: durations.fast, ease: easeOut }}
                    >
                      <p className="px-2 text-xs text-[var(--sfx-ink-soft)]">
                        No drafts yet.
                      </p>
                    </motion.li>
                  )}
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
                      transition={{ duration: durations.ui, ease: easeOut }}
                    >
                      <SoundChip
                        name={name}
                        kind="draft"
                        active={
                          selection.kind === "draft" && selection.name === name
                        }
                        onSelect={() => {
                          loadDraft(name);
                          const draft = drafts[name];
                          if (draft) playRecipe(draft.recipe);
                        }}
                      />
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </section>
          </div>
        </aside>

        <div className="sfx-lab-canvas min-w-0 space-y-4 p-4 sm:p-5">
          <div
            className="flex items-start gap-3"
            style={
              {
                "--sound-accent": `oklch(58% 0.12 ${selectedVisual.hue})`,
                "--sound-wash": `oklch(94% 0.04 ${selectedVisual.hue})`,
              } as React.CSSProperties
            }
          >
            <span
              className="sfx-lab-sound-mark sfx-lab-sound-mark-lg mt-5 shrink-0"
              aria-hidden
            >
              <SoundMark mark={selectedVisual.mark} className="size-4" />
            </span>
            <div className="min-w-0 flex-1 space-y-2">
              <label className="block">
                <span className={labelClass}>Name</span>
                <input
                  className={fieldClass}
                  value={draftName}
                  onChange={(event) => {
                    setDraftName(event.target.value);
                    setDirty(true);
                  }}
                  spellCheck={false}
                />
              </label>
              {selection.kind === "builtin" ? (
                <p className="sfx-lab-blurb">
                  {SOUND_BLURBS[selection.name]}
                </p>
              ) : (
                <p className="sfx-lab-blurb">{selectedVisual.cue}</p>
              )}
            </div>
          </div>

          <NumberField
            label="Master gain"
            value={recipe.masterGain}
            min={0}
            max={2}
            step={0.01}
            onChange={(masterGain) =>
              updateRecipe({
                ...recipe,
                masterGain: masterGain ?? recipe.masterGain,
              })
            }
          />

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="sfx-lab-section-label">
                Layers
              </h3>
              <LabButton
                aria-label="Add layer"
                onClick={() =>
                  updateRecipe({
                    ...recipe,
                    layers: [
                      ...recipe.layers,
                      {
                        kind: "tone",
                        waveform: "sine",
                        frequency: 660,
                        attack: 0.005,
                        decay: 0.12,
                        peak: 0.06,
                      },
                    ],
                  })
                }
              >
                <IconPlus />
                <span>Add</span>
              </LabButton>
            </div>
            {/* Remount Presence per selection so switching sounds doesn't parade enters */}
            <div
              key={`${selection.kind}-${selection.name}-layers`}
              className="space-y-3"
            >
              <AnimatePresence initial={false}>
                {recipe.layers.map((layer, index) => (
                  <motion.div
                    key={`layer-${index}`}
                    layout={layoutEnabled}
                    initial={
                      reducedMotion ? { opacity: 0 } : { opacity: 0, y: 6 }
                    }
                    animate={{ opacity: 1, y: 0 }}
                    exit={
                      reducedMotion
                        ? {
                            opacity: 0,
                            transition: {
                              duration: durations.fast,
                              ease: easeOut,
                            },
                          }
                        : {
                            opacity: 0,
                            y: -4,
                            transition: {
                              duration: durations.fast,
                              ease: easeOut,
                            },
                          }
                    }
                    transition={{
                      duration: durations.ui,
                      ease: easeOut,
                      layout: layoutSpring,
                    }}
                  >
                    <LayerEditor
                      layer={layer}
                      index={index}
                      defaultOpen={index === 0 || recipe.layers.length <= 2}
                      removeDisabled={recipe.layers.length <= 1}
                      onChange={(nextLayer) => {
                        const layers = recipe.layers.slice();
                        layers[index] = nextLayer;
                        updateRecipe({ ...recipe, layers });
                      }}
                      onRemove={() => {
                        if (recipe.layers.length <= 1) return;
                        updateRecipe({
                          ...recipe,
                          layers: recipe.layers.filter((_, i) => i !== index),
                        });
                      }}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="sfx-lab-layer space-y-3 p-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="sfx-lab-section-label">
                Shimmer
              </h3>
              {recipe.shimmer ? (
                <LabButton
                  variant="icon"
                  aria-label="Remove shimmer"
                  title="Remove shimmer"
                  onClick={() => {
                    updateRecipe({
                      masterGain: recipe.masterGain,
                      layers: recipe.layers,
                    });
                  }}
                >
                  <IconTrash />
                </LabButton>
              ) : (
                <LabButton
                  aria-label="Add shimmer"
                  onClick={() =>
                    updateRecipe({
                      ...recipe,
                      shimmer: {
                        delay: 0.1,
                        feedback: 0.2,
                        wet: 0.15,
                        lowpass: 3500,
                      },
                    })
                  }
                >
                  <IconPlus />
                  <span>Add</span>
                </LabButton>
              )}
            </div>
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
                    duration: reducedMotion ? durations.fast : durations.ui,
                    ease: panelEase,
                  }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-2">
                    <NumberField
                      label="Delay"
                      value={recipe.shimmer.delay}
                      step={0.01}
                      min={0}
                      onChange={(delay) =>
                        updateRecipe({
                          ...recipe,
                          shimmer: {
                            ...recipe.shimmer!,
                            delay: delay ?? recipe.shimmer!.delay,
                          },
                        })
                      }
                    />
                    <NumberField
                      label="Feedback"
                      value={recipe.shimmer.feedback}
                      step={0.01}
                      min={0}
                      max={0.95}
                      onChange={(feedback) =>
                        updateRecipe({
                          ...recipe,
                          shimmer: {
                            ...recipe.shimmer!,
                            feedback: feedback ?? recipe.shimmer!.feedback,
                          },
                        })
                      }
                    />
                    <NumberField
                      label="Wet"
                      value={recipe.shimmer.wet}
                      step={0.01}
                      min={0}
                      max={1}
                      onChange={(wet) =>
                        updateRecipe({
                          ...recipe,
                          shimmer: {
                            ...recipe.shimmer!,
                            wet: wet ?? recipe.shimmer!.wet,
                          },
                        })
                      }
                    />
                    <NumberField
                      label="Lowpass"
                      value={recipe.shimmer.lowpass}
                      step={10}
                      min={100}
                      onChange={(lowpass) =>
                        updateRecipe({
                          ...recipe,
                          shimmer: {
                            ...recipe.shimmer!,
                            lowpass: lowpass ?? recipe.shimmer!.lowpass,
                          },
                        })
                      }
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <label className="block">
            <span className={labelClass}>TypeScript export</span>
            <textarea
              className={cn(
                fieldClass,
                "min-h-32 font-mono text-xs leading-relaxed tracking-normal"
              )}
              readOnly
              value={tsSnippet}
              spellCheck={false}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
