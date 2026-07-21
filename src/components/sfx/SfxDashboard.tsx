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
  play,
  playRecipe,
  sounds,
  type NoiseLayer,
  type SoundLayer,
  type SoundName,
  type SoundRecipe,
  type ToneLayer,
} from "@/lib/sfx";
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
  "sfx-lab-field min-h-11 w-full px-2.5 py-2 text-sm focus:outline-none sm:min-h-0 sm:py-1.5";
const labelClass = "sfx-lab-label mb-1 block text-[11px] font-medium uppercase";
const btnClass =
  "sfx-lab-btn min-h-9 px-3 py-1.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_oklch,var(--sfx-gold)_45%,transparent)] disabled:cursor-not-allowed sm:min-h-0 sm:px-3.5";
const btnAccentClass =
  "sfx-lab-btn-play min-h-9 px-3.5 py-1.5 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_oklch,var(--sfx-poppy)_40%,transparent)] sm:min-h-0 sm:px-4";

/** Snappy UI spring — interruptible hover/press feedback (100–250ms feel). */
const tapSpring = { type: "spring" as const, stiffness: 420, damping: 28 };
/** Accordion chevron — same spring family as toolbar buttons. */
const chevronSpring = { type: "spring" as const, stiffness: 420, damping: 28 };
const panelEase = [0.16, 1, 0.3, 1] as const;

function slugifyName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

type LabButtonProps = Omit<ComponentProps<typeof motion.button>, "children"> & {
  variant?: "secondary" | "play";
  children: React.ReactNode;
};

function LabButton({
  variant = "secondary",
  className,
  children,
  disabled,
  ...props
}: LabButtonProps) {
  const reducedMotion = useReducedMotion();
  const inert = Boolean(disabled || reducedMotion);

  return (
    <motion.button
      {...props}
      type="button"
      disabled={disabled}
      className={cn(
        variant === "play" ? btnAccentClass : btnClass,
        className
      )}
      whileHover={inert ? undefined : { y: -1.5, scale: 1.03 }}
      whileTap={inert ? undefined : { y: 0, scale: 0.96 }}
      transition={tapSpring}
      data-sfx-press
      data-sfx-release
    >
      {children}
    </motion.button>
  );
}

type SoundChipProps = {
  active: boolean;
  label: string;
  onSelect: () => void;
};

function SoundChip({ active, label, onSelect }: SoundChipProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      className={cn(
        "sfx-lab-sound flex min-h-11 w-full items-center justify-between gap-2 px-2.5 py-2 text-left text-sm sm:min-h-0 sm:py-1.5",
        active && "sfx-lab-sound-active"
      )}
      whileHover={reducedMotion ? undefined : { x: 2, scale: 1.01 }}
      whileTap={reducedMotion ? undefined : { scale: 0.96 }}
      transition={tapSpring}
      data-sfx-press
      data-sfx-release
      onClick={onSelect}
    >
      <span className="font-medium">{label}</span>
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
  defaultOpen = true,
}: {
  layer: SoundLayer;
  index: number;
  onChange: (layer: SoundLayer) => void;
  onRemove: () => void;
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
          className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg text-left"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          whileHover={reducedMotion ? undefined : { x: 1 }}
          whileTap={reducedMotion ? undefined : { scale: 0.98 }}
          transition={tapSpring}
        >
          <motion.span
            className="inline-flex size-6 shrink-0 items-center justify-center text-[var(--sfx-ink)]"
            animate={{ rotate: open ? 90 : 0 }}
            transition={reducedMotion ? { duration: 0 } : chevronSpring}
            aria-hidden
          >
            <svg
              viewBox="0 0 24 24"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 6l6 6-6 6" />
            </svg>
          </motion.span>
          <span className="text-xs font-semibold text-[var(--sfx-ink)]">
            Layer {index + 1}
          </span>
          <span className="truncate text-[11px] text-[var(--sfx-ink-soft)]">
            {summary}
          </span>
        </motion.button>
        <LabButton onClick={onRemove}>Remove</LabButton>
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


  return (
    <div className="pb-6">
      <div className="sfx-lab-toolbar sticky top-3 z-20 mb-4 border px-2.5 py-2 backdrop-blur-md supports-[backdrop-filter]:bg-[color-mix(in_oklch,var(--sfx-linen)_78%,transparent)] sm:top-4 sm:mb-5 sm:px-3 sm:py-2.5">
        <div className="sfx-lab-toolbar-actions grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap sm:items-center sm:gap-2">
          <LabButton
            variant="play"
            className="col-span-2 sm:col-auto"
            onClick={preview}
          >
            Play preview
          </LabButton>
          <LabButton onClick={createNew}>New sound</LabButton>
          <LabButton onClick={duplicateAsDraft}>Duplicate</LabButton>
          <LabButton onClick={saveDraft} disabled={!slugifyName(draftName)}>
            Save draft
          </LabButton>
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
          <LabButton onClick={copyTs}>
            <span className="sm:hidden">Copy TS</span>
            <span className="hidden sm:inline">Copy as TypeScript</span>
          </LabButton>
        </div>
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
      </div>

      <div className="grid items-start gap-5 md:grid-cols-[13rem_minmax(0,1fr)]">
        <aside className="sfx-lab-rail p-3 md:sticky md:top-[6.75rem] md:max-h-[calc(100dvh-7.5rem)] md:overflow-y-auto">
          <div className="space-y-5">
            <section>
              <h2 className="sfx-lab-section-label mb-2 text-[11px] font-semibold uppercase">
                Built-ins
              </h2>
              <ul className="space-y-0.5">
                {sounds.map((name) => (
                  <li key={name}>
                    <SoundChip
                      label={name}
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
              <h2 className="sfx-lab-section-label mb-2 text-[11px] font-semibold uppercase">
                Custom
              </h2>
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
                        active={
                          selection.kind === "draft" && selection.name === name
                        }
                        onSelect={() => {
                          loadDraft(name);
                          const draft = drafts[name];
                          if (draft) playRecipe(draft.recipe);
                        }}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </aside>

        <div className="sfx-lab-canvas min-w-0 space-y-4 p-4 sm:p-5">
          <div className="space-y-2">
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
            {selection.kind === "builtin" && (
              <p className="text-xs text-[var(--sfx-ink-soft)]">
                {SOUND_BLURBS[selection.name]}
              </p>
            )}
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
              <h3 className="sfx-lab-section-label text-[11px] font-semibold uppercase">
                Layers
              </h3>
              <LabButton
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
                Add layer
              </LabButton>
            </div>
            {recipe.layers.map((layer, index) => (
              <LayerEditor
                key={`${selection.kind}-${selection.name}-layer-${index}`}
                layer={layer}
                index={index}
                defaultOpen={index === 0 || recipe.layers.length <= 2}
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
            ))}
          </div>

          <div className="sfx-lab-layer space-y-3 p-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="sfx-lab-section-label text-[11px] font-semibold uppercase">
                Shimmer
              </h3>
              {recipe.shimmer ? (
                <LabButton
                  onClick={() => {
                    updateRecipe({
                      masterGain: recipe.masterGain,
                      layers: recipe.layers,
                    });
                  }}
                >
                  Remove
                </LabButton>
              ) : (
                <LabButton
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
                  Add shimmer
                </LabButton>
              )}
            </div>
            {recipe.shimmer && (
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
            )}
          </div>

          <label className="block">
            <span className={labelClass}>TypeScript export</span>
            <textarea
              className={cn(
                fieldClass,
                "min-h-32 font-mono text-[11px] leading-relaxed"
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
