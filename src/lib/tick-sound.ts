const TICK_SOUND_MUTED_KEY = "counter-tick-muted";
const tickSoundListeners = new Set<() => void>();

export function subscribeAlignedSecondTick(listener: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  let intervalId: number | undefined;
  const msUntilNextSecond = 1000 - (Date.now() % 1000);

  const timeoutId = window.setTimeout(() => {
    listener();
    intervalId = window.setInterval(listener, 1000);
  }, msUntilNextSecond);

  return () => {
    window.clearTimeout(timeoutId);
    if (intervalId !== undefined) {
      window.clearInterval(intervalId);
    }
  };
}

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
