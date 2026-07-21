"use client";

import { useCallback, useMemo, useState } from "react";
import { useSyncExternalStore } from "react";
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
  "w-full rounded-md border border-black/10 bg-white/80 px-2 py-1.5 text-sm text-on-surface shadow-sm focus:border-accent-bright focus:outline-none focus:ring-1 focus:ring-accent-bright/40";
const labelClass = "mb-1 block text-[11px] font-medium uppercase tracking-wide text-subtle";
const btnClass =
  "rounded-md border border-black/10 bg-elevated px-2.5 py-1.5 text-xs font-medium text-on-surface transition-colors hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-40";
const btnAccentClass =
  "rounded-md bg-accent-bright px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-40";

function slugifyName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
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
}: {
  layer: SoundLayer;
  index: number;
  onChange: (layer: SoundLayer) => void;
  onRemove: () => void;
}) {
  const setTone = (patch: Partial<ToneLayer>) => {
    if (layer.kind !== "tone") return;
    onChange({ ...layer, ...patch });
  };

  const setNoise = (patch: Partial<NoiseLayer>) => {
    if (layer.kind !== "noise") return;
    onChange({ ...layer, ...patch });
  };

  return (
    <div className="space-y-3 rounded-lg border border-black/8 bg-white/50 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-on-surface">
          Layer {index + 1}
        </p>
        <button type="button" className={btnClass} onClick={onRemove}>
          Remove
        </button>
      </div>

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

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
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
          onChange={(peak) => onChange({ ...layer, peak: peak ?? layer.peak })}
        />
      </div>

      {layer.kind === "tone" ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
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
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
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
                filterFrequency: filterFrequency ?? layer.filterFrequency,
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
    <div className="space-y-6 pb-16">
      {muted && (
        <p className="rounded-md border border-accent-bright/30 bg-accent-bright/10 px-3 py-2 text-sm text-on-surface">
          Sound is muted. Use the metronome toggle above to unmute previews and
          site cues.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button type="button" className={btnAccentClass} onClick={preview}>
          Play preview
        </button>
        <button type="button" className={btnClass} onClick={createNew}>
          New sound
        </button>
        <button type="button" className={btnClass} onClick={duplicateAsDraft}>
          Duplicate
        </button>
        <button
          type="button"
          className={btnClass}
          onClick={saveDraft}
          disabled={!slugifyName(draftName)}
        >
          Save draft
        </button>
        {selection.kind === "builtin" && dirty && (
          <button type="button" className={btnClass} onClick={resetBuiltin}>
            Reset to builtin
          </button>
        )}
        {selection.kind === "draft" && drafts[selection.name] && (
          <button type="button" className={btnClass} onClick={deleteDraft}>
            Delete draft
          </button>
        )}
        <button type="button" className={btnClass} onClick={copyTs}>
          Copy as TypeScript
        </button>
      </div>

      {copyStatus && (
        <p className="text-xs text-subtle" role="status">
          {copyStatus}
          {dirty ? " · unsaved edits" : ""}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[11rem_minmax(0,1fr)]">
        <div className="space-y-4">
          <section>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-subtle">
              Built-ins
            </h2>
            <ul className="space-y-1">
              {sounds.map((name) => (
                <li key={name}>
                  <button
                    type="button"
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                      selection.kind === "builtin" && selection.name === name
                        ? "bg-accent-bright/15 text-accent-hover"
                        : "hover:bg-elevated"
                    )}
                    onClick={() => {
                      loadBuiltin(name);
                      play(name);
                    }}
                  >
                    <span className="font-medium">{name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-subtle">
              Drafts
            </h2>
            {draftNames.length === 0 ? (
              <p className="text-xs text-subtle">No local drafts yet.</p>
            ) : (
              <ul className="space-y-1">
                {draftNames.map((name) => (
                  <li key={name}>
                    <button
                      type="button"
                      className={cn(
                        "flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                        selection.kind === "draft" && selection.name === name
                          ? "bg-accent-bright/15 text-accent-hover"
                          : "hover:bg-elevated"
                      )}
                      onClick={() => {
                        loadDraft(name);
                        const draft = drafts[name];
                        if (draft) playRecipe(draft.recipe);
                      }}
                    >
                      <span className="font-medium">{name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="space-y-4">
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
              <p className="text-xs text-subtle">
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
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-subtle">
                Layers
              </h3>
              <button
                type="button"
                className={btnClass}
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
              </button>
            </div>
            {recipe.layers.map((layer, index) => (
              <LayerEditor
                key={index}
                layer={layer}
                index={index}
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

          <div className="space-y-3 rounded-lg border border-black/8 bg-white/50 p-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-subtle">
                Shimmer
              </h3>
              {recipe.shimmer ? (
                <button
                  type="button"
                  className={btnClass}
                  onClick={() => {
                    updateRecipe({
                      masterGain: recipe.masterGain,
                      layers: recipe.layers,
                    });
                  }}
                >
                  Remove
                </button>
              ) : (
                <button
                  type="button"
                  className={btnClass}
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
                </button>
              )}
            </div>
            {recipe.shimmer && (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
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
              className={cn(fieldClass, "min-h-40 font-mono text-[11px] leading-relaxed")}
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
