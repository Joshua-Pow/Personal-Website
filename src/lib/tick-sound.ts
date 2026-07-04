const TICK_SOUND_MUTED_KEY = "counter-tick-muted";
const tickSoundListeners = new Set<() => void>();

export function subscribeTickSoundMuted(onStoreChange: () => void) {
  tickSoundListeners.add(onStoreChange);
  return () => {
    tickSoundListeners.delete(onStoreChange);
  };
}

export function getTickSoundMutedSnapshot() {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(TICK_SOUND_MUTED_KEY) === "true";
  } catch {
    return false;
  }
}

export function getTickSoundMutedServerSnapshot() {
  return false;
}

export function setTickSoundMuted(muted: boolean) {
  try {
    localStorage.setItem(TICK_SOUND_MUTED_KEY, String(muted));
  } catch {
    // Ignore storage access errors (private browsing, etc.)
  }
  tickSoundListeners.forEach((listener) => listener());
}

export function toggleTickSoundMuted() {
  setTickSoundMuted(!getTickSoundMutedSnapshot());
}
