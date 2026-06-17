import { describe, expect, it } from "vitest";
import { getDictionary } from "@/lib/i18n/dictionaries";

// getDictionary lazily imports the JSON source of truth for each locale and
// falls back to English for anything unknown. These tests confirm both locales
// resolve to real, shared-shape dictionaries and that the fallback holds.
describe("getDictionary", () => {
  it("loads the English dictionary", async () => {
    const en = await getDictionary("en");
    expect(en).toBeTypeOf("object");
    expect(Object.keys(en).length).toBeGreaterThan(0);
  });

  it("loads the German dictionary with the same key set as English", async () => {
    const [en, de] = await Promise.all([
      getDictionary("en"),
      getDictionary("de"),
    ]);
    expect(Object.keys(de).sort()).toEqual(Object.keys(en).sort());
  });

  it("falls back to English for an unknown locale", async () => {
    const en = await getDictionary("en");
    // Cast through unknown: the public type only allows known locales, but the
    // runtime guard (`?? dictionaries.en`) protects against anything slipping in.
    const fallback = await getDictionary("xx" as unknown as "en");
    expect(fallback).toEqual(en);
  });
});
