import { describe, expect, it } from "vitest";
import {
  DEFAULT_SCHEME,
  DEFAULT_THEME,
  SCHEMES,
  type SchemeId,
  isScheme,
  isTheme,
  nextScheme,
} from "@/lib/themes";

describe("themes", () => {
  it("isTheme accepts only light/dark", () => {
    expect(isTheme("dark")).toBe(true);
    expect(isTheme("light")).toBe(true);
    expect(isTheme("sepia")).toBe(false);
    expect(isTheme(undefined)).toBe(false);
  });

  it("isScheme accepts only registered scheme ids", () => {
    expect(isScheme("green")).toBe(true);
    expect(isScheme("magenta")).toBe(true);
    expect(isScheme("teal")).toBe(false);
    expect(isScheme(undefined)).toBe(false);
  });

  it("defaults are valid members of their registries", () => {
    expect(isTheme(DEFAULT_THEME)).toBe(true);
    expect(isScheme(DEFAULT_SCHEME)).toBe(true);
  });

  it("nextScheme cycles through every scheme and wraps around", () => {
    const seen = new Set<string>();
    let current: SchemeId = SCHEMES[0].id;
    for (let i = 0; i < SCHEMES.length; i++) {
      seen.add(current);
      current = nextScheme(current);
    }
    // Visited each scheme exactly once and looped back to the start.
    expect(seen.size).toBe(SCHEMES.length);
    expect(current).toBe(SCHEMES[0].id);
  });
});
