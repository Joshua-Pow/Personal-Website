"use client";

import { useEffect } from "react";
import { useSyncExternalStore } from "react";
import { bind, setEnabled } from "@/lib/sfx";
import {
  getTickSoundMutedServerSnapshot,
  getTickSoundMutedSnapshot,
  subscribeTickSoundMuted,
} from "@/lib/tick-sound";

/**
 * Wires declarative `data-sfx-*` listeners once and keeps the sfx engine
 * enabled state in sync with the existing tick-sound mute preference.
 */
export function SfxProvider({ children }: { children: React.ReactNode }) {
  const muted = useSyncExternalStore(
    subscribeTickSoundMuted,
    getTickSoundMutedSnapshot,
    getTickSoundMutedServerSnapshot
  );

  useEffect(() => {
    bind();
  }, []);

  useEffect(() => {
    setEnabled(!muted);
  }, [muted]);

  return children;
}
