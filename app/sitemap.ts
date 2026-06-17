import type { MetadataRoute } from "next";
import { defaultLocale, locales } from "@/lib/i18n/config";
import { allNav, localePath } from "@/lib/nav";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  // Skip pages marked noindex (legal pages) — they shouldn't be in the sitemap.
  return allNav.filter((item) => !item.noindex).flatMap((item) => {
    const languages: Record<string, string> = {};
    for (const l of locales) {
      languages[l] = `${site.url}${localePath(l, item.segment)}`;
    }
    languages["x-default"] = `${site.url}${localePath(defaultLocale, item.segment)}`;
    return locales.map((locale) => ({
      url: `${site.url}${localePath(locale, item.segment)}`,
      lastModified: now,
      changeFrequency: item.segment === "board" ? "daily" : "monthly",
      priority: item.segment === "" ? 1 : 0.7,
      alternates: { languages },
    }));
  });
}
