// i18n configuration — English (default/fallback) + German.
// Locales drive the [locale] route segment; see proxy.ts for redirection.

export const locales = ["en", "de"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  en: "English",
  de: "Deutsch",
};

/** Territory-qualified values for the Open Graph `og:locale` tag. */
export const ogLocales: Record<Locale, string> = {
  en: "en_US",
  de: "de_DE",
};

/** Type guard that narrows an arbitrary string to a supported Locale. */
export function hasLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** The "other" locale — handy for the language toggle. */
export function otherLocale(locale: Locale): Locale {
  return locale === "en" ? "de" : "en";
}
