import { describe, expect, it } from "vitest";
import de from "@/lib/i18n/dictionaries/de.json";
import en from "@/lib/i18n/dictionaries/en.json";

type Json = Record<string, unknown>;

/** Flatten nested keys into dot-paths, e.g. { a: { b: 1 } } -> ["a.b"]. */
function flatten(obj: Json, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return value && typeof value === "object" && !Array.isArray(value)
      ? flatten(value as Json, path)
      : [path];
  });
}

function emptyValues(obj: Json, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return emptyValues(value as Json, path);
    }
    return typeof value === "string" && value.trim() === "" ? [path] : [];
  });
}

describe("i18n EN/DE parity", () => {
  const enKeys = flatten(en as Json).sort();
  const deKeys = flatten(de as Json).sort();

  it("has no keys missing from German", () => {
    const missing = enKeys.filter((k) => !deKeys.includes(k));
    expect(missing).toEqual([]);
  });

  it("has no extra keys in German", () => {
    const extra = deKeys.filter((k) => !enKeys.includes(k));
    expect(extra).toEqual([]);
  });

  it("has identical key sets in both dictionaries", () => {
    expect(deKeys).toEqual(enKeys);
  });

  it("has no empty string values in either dictionary", () => {
    expect(emptyValues(en as Json)).toEqual([]);
    expect(emptyValues(de as Json)).toEqual([]);
  });
});
