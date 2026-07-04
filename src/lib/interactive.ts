import { cn } from "@/lib/utils/cn";

/** Primary accent links — oklch(60% 0.23 36), AA on light surfaces */
export const linkAccent =
  "font-medium text-accent-bright hover:text-accent-hover underline-offset-2 hover:underline";

/** Muted links (footer, back nav) — bright accent on hover */
export const linkMuted = "text-subtle hover:text-accent-bright";

export function interactiveLink(...classes: Parameters<typeof cn>) {
  return cn(linkAccent, ...classes);
}

export function interactiveMuted(...classes: Parameters<typeof cn>) {
  return cn(linkMuted, ...classes);
}

/** Dotted help-term triggers */
export const wordTrigger =
  "cursor-help rounded-sm border-none bg-transparent p-0 font-inherit text-inherit underline decoration-accent-bright decoration-dotted underline-offset-[3px] transition-[color,text-decoration-color] duration-150 ease-out hover:text-accent-hover hover:decoration-accent-hover motion-reduce:transition-none";
