// Single source of truth for the terminal "tabs". TabBar, the command palette,
// the hotkeys and the sitemap all derive from these lists, so navigation stays
// in sync everywhere. Each tab is a real route under /[locale].

export type NavItem = {
  /** i18n key under `nav.*` and a stable id. */
  key: "home" | "about" | "projects" | "board" | "imprint" | "privacy";
  /** Path segment after the locale; "" means the locale root. */
  segment: string;
  /** Excluded from the sitemap and marked `noindex` (e.g. legal pages). */
  noindex?: boolean;
};

export const primaryNav: NavItem[] = [
  { key: "home", segment: "" },
  { key: "about", segment: "about" },
  { key: "projects", segment: "projects" },
  { key: "board", segment: "board" },
];

export const secondaryNav: NavItem[] = [
  { key: "imprint", segment: "imprint", noindex: true },
  { key: "privacy", segment: "privacy", noindex: true },
];

export const allNav: NavItem[] = [...primaryNav, ...secondaryNav];

export function localePath(locale: string, segment: string): string {
  return segment ? `/${locale}/${segment}` : `/${locale}`;
}

/** Active tab index within primaryNav for a given pathname (-1 if none). */
export function activeIndex(pathname: string, locale: string): number {
  return primaryNav.findIndex(
    (item) => pathname === localePath(locale, item.segment),
  );
}
