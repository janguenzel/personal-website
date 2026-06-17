// Theme model.
//
// Two axes, both applied as attributes on <html>, persisted to localStorage, and
// re-applied before paint by the no-FOUC inline script in app/[locale]/layout.tsx:
//   - data-theme:  "light" | "dark"          (light/dark mode)
//   - data-scheme: one of SCHEMES below       (accent colour flavour)
//
// The actual colour values live as CSS custom properties in app/globals.css.
// Components only ever reference the tokens (bg/fg/accent/...), never raw hex.

export const THEMES = ["dark", "light"] as const;
export type Theme = (typeof THEMES)[number];
export const DEFAULT_THEME: Theme = "dark";

export const SCHEMES = [
  { id: "green", label: "green phosphor" },
  { id: "amber", label: "amber crt" },
  { id: "cyan", label: "ice cyan" },
  { id: "magenta", label: "synthwave" },
] as const;

export type SchemeId = (typeof SCHEMES)[number]["id"];
export const DEFAULT_SCHEME: SchemeId = "green";

export const THEME_STORAGE_KEY = "theme";
export const SCHEME_STORAGE_KEY = "scheme";

export function isTheme(value: string | undefined): value is Theme {
  return value === "light" || value === "dark";
}

export function isScheme(value: string | undefined): value is SchemeId {
  return SCHEMES.some((s) => s.id === value);
}

export function nextScheme(current: SchemeId): SchemeId {
  const index = SCHEMES.findIndex((s) => s.id === current);
  return SCHEMES[(index + 1) % SCHEMES.length].id;
}
