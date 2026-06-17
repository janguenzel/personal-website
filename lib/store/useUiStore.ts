"use client";

import { create } from "zustand";
import {
  type SchemeId,
  type Theme,
  DEFAULT_SCHEME,
  DEFAULT_THEME,
  SCHEME_STORAGE_KEY,
  THEME_STORAGE_KEY,
  isScheme,
  isTheme,
  nextScheme,
} from "@/lib/themes";

type Overlay = "palette" | "help" | null;

type UiState = {
  theme: Theme;
  scheme: SchemeId;
  overlay: Overlay;
  matrix: boolean;
  crt: boolean;
  hydrated: boolean;

  hydrate: () => void;
  watchSystemTheme: () => () => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setScheme: (scheme: SchemeId) => void;
  cycleScheme: () => void;

  openPalette: () => void;
  togglePalette: () => void;
  openHelp: () => void;
  closeOverlays: () => void;

  setMatrix: (on: boolean) => void;
  toggleMatrix: () => void;
  toggleCrt: () => void;
};

function persist(key: string, value: string) {
  if (typeof document === "undefined") return;
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = theme;
  persist(THEME_STORAGE_KEY, theme);
}

function applyScheme(scheme: SchemeId) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.scheme = scheme;
  persist(SCHEME_STORAGE_KEY, scheme);
}

// Re-assert the store's current theme/scheme onto <html>. Called after soft
// navigations (e.g. switching language) where React reconciles <html> from an
// RSC payload that has no data-theme/data-scheme, which would otherwise drop the
// imperatively set attributes and revert the user's chosen theme.
export function reapplyTheme(theme: Theme, scheme: SchemeId) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.scheme = scheme;
}

// The persisted theme, mirroring the no-FOUC inline script's logic: stored value
// wins, otherwise fall back to the OS preference. Used when the dataset on <html>
// is empty because the no-FOUC script never ran (the layout-less 404 error shell,
// which renders <html id="__next_error__"> without our <html>/script).
function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) ?? undefined;
    if (isTheme(stored)) return stored;
  } catch {
    /* ignore */
  }
  if (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-color-scheme: light)").matches
  ) {
    return "light";
  }
  return DEFAULT_THEME;
}

function readStoredScheme(): SchemeId {
  try {
    const stored = localStorage.getItem(SCHEME_STORAGE_KEY) ?? undefined;
    if (isScheme(stored)) return stored;
  } catch {
    /* ignore */
  }
  return DEFAULT_SCHEME;
}

export const useUiStore = create<UiState>((set, get) => ({
  theme: DEFAULT_THEME,
  scheme: DEFAULT_SCHEME,
  overlay: null,
  matrix: false,
  crt: false,
  hydrated: false,

  // Sync store state with whatever the no-FOUC inline script already applied
  // to <html> before paint. Call once on mount. On pages where that script never
  // ran (the layout-less 404 error shell) the dataset is empty, so fall back to
  // the persisted values directly and re-assert them onto <html> — otherwise the
  // store would adopt the dark/green defaults and override the user's theme.
  hydrate: () => {
    if (typeof document === "undefined" || get().hydrated) return;
    const ds = document.documentElement.dataset;
    const theme = isTheme(ds.theme) ? ds.theme : readStoredTheme();
    const scheme = isScheme(ds.scheme) ? ds.scheme : readStoredScheme();
    reapplyTheme(theme, scheme);
    set({ theme, scheme, hydrated: true });
  },

  // Follow the OS colour scheme *live* while the user hasn't explicitly chosen a
  // theme. The no-FOUC script picks the initial light/dark value from
  // prefers-color-scheme on load; this keeps the page in sync if the OS flips
  // afterwards (e.g. macOS auto night mode) — without persisting, so we stay in
  // "follow the browser" mode. Once the user sets a theme (which writes
  // localStorage), we stop following. Mirrors the no-FOUC light-query logic so
  // the no-preference case resolves to DEFAULT_THEME, just like first paint.
  // Returns a cleanup that detaches the listener.
  watchSystemTheme: () => {
    if (typeof window === "undefined" || !window.matchMedia) return () => {};
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => {
      try {
        // An explicit choice was persisted — stop deferring to the OS.
        if (localStorage.getItem(THEME_STORAGE_KEY)) return;
      } catch {
        /* ignore */
      }
      const theme: Theme = mq.matches ? "light" : "dark";
      reapplyTheme(theme, get().scheme); // apply to <html>, don't persist
      set({ theme });
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  },

  setTheme: (theme) => {
    applyTheme(theme);
    set({ theme });
  },
  toggleTheme: () => {
    const theme: Theme = get().theme === "dark" ? "light" : "dark";
    applyTheme(theme);
    set({ theme });
  },
  setScheme: (scheme) => {
    applyScheme(scheme);
    set({ scheme });
  },
  cycleScheme: () => {
    const scheme = nextScheme(get().scheme);
    applyScheme(scheme);
    set({ scheme });
  },

  openPalette: () => set({ overlay: "palette" }),
  togglePalette: () => set({ overlay: get().overlay === "palette" ? null : "palette" }),
  openHelp: () => set({ overlay: "help" }),
  closeOverlays: () => set({ overlay: null }),

  setMatrix: (on) => set({ matrix: on }),
  toggleMatrix: () => set({ matrix: !get().matrix }),
  toggleCrt: () => set({ crt: !get().crt }),
}));
