import { describe, expect, it } from "vitest";
import {
  defaultLocale,
  hasLocale,
  locales,
  otherLocale,
} from "@/lib/i18n/config";

describe("i18n config", () => {
  it("ships en (default) + de", () => {
    expect(locales).toEqual(["en", "de"]);
    expect(defaultLocale).toBe("en");
  });

  it("hasLocale narrows known locales only", () => {
    expect(hasLocale("en")).toBe(true);
    expect(hasLocale("de")).toBe(true);
    expect(hasLocale("fr")).toBe(false);
    expect(hasLocale("")).toBe(false);
  });

  it("otherLocale toggles between the two", () => {
    expect(otherLocale("en")).toBe("de");
    expect(otherLocale("de")).toBe("en");
  });
});
