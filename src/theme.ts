import { useSyncExternalStore } from 'react';

export type ThemeMode = 'auto' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

const KEY = 'bbj-theme';
// "auto" follows the clock: daytime → light, evening/night → dark.
const DAY_START = 7;
const DAY_END = 19;

function readStored(): ThemeMode {
  if (typeof localStorage === 'undefined') return 'auto';
  const v = localStorage.getItem(KEY);
  return v === 'light' || v === 'dark' || v === 'auto' ? v : 'auto';
}

export function resolve(mode: ThemeMode): ResolvedTheme {
  if (mode !== 'auto') return mode;
  const h = new Date().getHours();
  return h >= DAY_START && h < DAY_END ? 'light' : 'dark';
}

let mode: ThemeMode = readStored();
let resolved: ResolvedTheme = resolve(mode);
const listeners = new Set<() => void>();

function applyToDom(r: ResolvedTheme) {
  const el = document.documentElement;
  el.classList.toggle('light', r === 'light');
  el.style.colorScheme = r;
}

function notify() {
  listeners.forEach((l) => l());
}

function update(r: ResolvedTheme) {
  if (r === resolved) return;
  resolved = r;
  applyToDom(r);
}

export function setThemeMode(next: ThemeMode) {
  mode = next;
  try {
    localStorage.setItem(KEY, next);
  } catch {
    /* ignore (private mode, etc.) */
  }
  update(resolve(next));
  notify();
}

// Apply on import — runs before React renders, so there's no theme flash.
applyToDom(resolved);

// Keep "auto" honest as the hour rolls over.
if (typeof window !== 'undefined') {
  window.setInterval(() => {
    if (mode !== 'auto') return;
    const r = resolve('auto');
    if (r !== resolved) {
      update(r);
      notify();
    }
  }, 60_000);
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

const snapshot = () => `${mode}|${resolved}`;

/** React hook: current mode, resolved theme, and a setter. */
export function useTheme() {
  const snap = useSyncExternalStore(subscribe, snapshot, snapshot);
  const [m, r] = snap.split('|') as [ThemeMode, ResolvedTheme];
  return { mode: m, resolved: r, setMode: setThemeMode };
}
