"use client";

import { AnimatedMetric } from "@/components/sfx/AnimatedMetric";
import { cn } from "@/lib/utils/cn";

export function SliderField({
  label,
  hint,
  value,
  onChange,
  min,
  max,
  step,
  format = (n) => String(n),
  /** Fixed character width — keep stable so digit-count changes never reflow. */
  valueWidthCh,
}: {
  label: string;
  hint: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  format?: (value: number) => string;
  valueWidthCh: number;
}) {
  const widthCh = valueWidthCh;

  return (
    <label className="sfx-lab-slider block">
      <span className="mb-1 flex items-baseline justify-between gap-2">
        <span className="sfx-lab-label mb-0">{label}</span>
        <AnimatedMetric
          value={value}
          format={format}
          widthCh={widthCh}
          min={min}
          max={max}
        />
      </span>
      <input
        type="range"
        className="sfx-lab-range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <span className="sfx-lab-hint mt-1 block">{hint}</span>
    </label>
  );
}

export function ChoiceField<T extends string>({
  label,
  hint,
  value,
  options,
  onChange,
}: {
  label: string;
  hint: string;
  value: T;
  options: readonly { value: T; title: string; cue?: string }[];
  onChange: (value: T) => void;
}) {
  const groupId = `sfx-choice-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <fieldset className="sfx-lab-choice">
      <legend className="sfx-lab-label">{label}</legend>
      <p className="sfx-lab-hint mb-2">{hint}</p>
      <div
        className="flex flex-wrap gap-1.5"
        role="radiogroup"
        aria-labelledby={groupId}
      >
        <span id={groupId} className="sr-only">
          {label}
        </span>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              className={cn(
                "sfx-lab-choice-option",
                selected && "sfx-lab-choice-option-active"
              )}
              onClick={() => onChange(option.value)}
            >
              <span className="sfx-lab-choice-title">{option.title}</span>
              {option.cue ? (
                <span className="sfx-lab-choice-cue">{option.cue}</span>
              ) : null}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
