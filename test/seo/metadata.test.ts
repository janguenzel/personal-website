import { describe, expect, it } from "vitest";
import { buildMetadata } from "@/lib/seo/metadata";
import { site } from "@/lib/site";

describe("buildMetadata", () => {
  const base = {
    locale: "en" as const,
    segment: "about",
    title: "About",
    description: "Who I am.",
  };

  it("builds an absolute, suffixed title", () => {
    const meta = buildMetadata(base);
    expect(meta.title).toEqual({ absolute: `About — ${site.name}` });
  });

  it("sets a canonical URL and hreflang alternates incl. x-default", () => {
    const meta = buildMetadata(base);
    expect(meta.alternates?.canonical).toBe(`${site.url}/en/about`);
    expect(meta.alternates?.languages).toMatchObject({
      en: `${site.url}/en/about`,
      de: `${site.url}/de/about`,
      "x-default": `${site.url}/en/about`,
    });
  });

  it("mirrors title/description into OpenGraph + Twitter", () => {
    const meta = buildMetadata(base);
    expect(meta.openGraph?.title).toBe(`About — ${site.name}`);
    expect(meta.openGraph?.locale).toBe("en_US");
    expect((meta.twitter as { card?: string })?.card).toBe(
      "summary_large_image",
    );
  });

  it("omits robots by default and emits noindex when requested", () => {
    expect(buildMetadata(base).robots).toBeUndefined();
    expect(buildMetadata({ ...base, noindex: true }).robots).toEqual({
      index: false,
      follow: true,
    });
  });

  it("uses the locale root URL for the empty segment", () => {
    const meta = buildMetadata({ ...base, segment: "" });
    expect(meta.alternates?.canonical).toBe(`${site.url}/en`);
  });
});
