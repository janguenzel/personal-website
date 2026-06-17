import type { Metadata } from "next";
import {
  defaultLocale,
  locales,
  ogLocales,
  type Locale,
} from "@/lib/i18n/config";
import { localePath } from "@/lib/nav";
import { site } from "@/lib/site";

// Per-page metadata with canonical URL + hreflang alternates for every locale.
// The [locale] layout supplies metadataBase + the title template + OG defaults;
// this just fills in page-specific bits that merge on top.

export function buildMetadata({
  locale,
  segment,
  title,
  description,
  noindex = false,
}: {
  locale: Locale;
  segment: string;
  title: string;
  description: string;
  /** Emit `robots: noindex` (e.g. legal pages we don't want in search). */
  noindex?: boolean;
}): Metadata {
  const url = `${site.url}${localePath(locale, segment)}`;
  const languages: Record<string, string> = {};
  for (const l of locales) {
    languages[l] = `${site.url}${localePath(l, segment)}`;
  }
  // x-default for users matching neither locale (Google recommendation).
  languages["x-default"] = `${site.url}${localePath(defaultLocale, segment)}`;
  // absolute title -> consistent suffix on every route, including the index
  // segment (where a parent title.template does not apply).
  const fullTitle = `${title} — ${site.name}`;

  return {
    title: { absolute: fullTitle },
    description,
    ...(noindex
      ? { robots: { index: false, follow: true } }
      : {}),
    alternates: { canonical: url, languages },
    openGraph: {
      type: "website",
      url,
      title: fullTitle,
      description,
      siteName: site.name,
      locale: ogLocales[locale],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
  };
}
