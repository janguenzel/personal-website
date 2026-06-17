import { describe, expect, it } from "vitest";
import {
  activeIndex,
  allNav,
  localePath,
  primaryNav,
  secondaryNav,
} from "@/lib/nav";

describe("nav", () => {
  it("localePath joins locale + segment, root for empty segment", () => {
    expect(localePath("en", "")).toBe("/en");
    expect(localePath("de", "about")).toBe("/de/about");
  });

  it("allNav is primary followed by secondary", () => {
    expect(allNav).toEqual([...primaryNav, ...secondaryNav]);
  });

  it("legal pages in secondaryNav are flagged noindex", () => {
    expect(secondaryNav.every((item) => item.noindex)).toBe(true);
    expect(primaryNav.some((item) => item.noindex)).toBe(false);
  });

  it("activeIndex matches the primary tab for a pathname", () => {
    expect(activeIndex("/en", "en")).toBe(0);
    expect(activeIndex("/en/about", "en")).toBe(1);
    expect(activeIndex("/de/board", "de")).toBe(3);
  });

  it("activeIndex returns -1 for non-primary or mismatched locale", () => {
    expect(activeIndex("/en/imprint", "en")).toBe(-1);
    expect(activeIndex("/de/about", "en")).toBe(-1);
  });
});
