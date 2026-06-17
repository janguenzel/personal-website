import "server-only";
import type { Locale } from "./config";

// Lazy-loaded dictionaries — only the requested locale ships to the server bundle.
const dictionaries = {
  en: () => import("./dictionaries/en.json").then((m) => m.default),
  de: () => import("./dictionaries/de.json").then((m) => m.default),
};

/** The dictionary shape is derived from the English source of truth. */
export type Dictionary = Awaited<ReturnType<(typeof dictionaries)["en"]>>;

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  const load = dictionaries[locale] ?? dictionaries.en;
  return (await load()) as Dictionary;
}
