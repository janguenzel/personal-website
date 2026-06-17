import { afterEach, describe, expect, it, vi } from "vitest";
import { createTranslator } from "@/lib/i18n/translate";

const dict = {
  meta: { title: "Terminal" },
  home: { greeting: "Hello {name}", count: "{n} messages" },
  nested: { deep: { value: "ok" } },
};

describe("createTranslator", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("resolves a dot-path against a nested dictionary", () => {
    const t = createTranslator(dict);
    expect(t("meta.title")).toBe("Terminal");
    expect(t("nested.deep.value")).toBe("ok");
  });

  it("interpolates {placeholders} from vars", () => {
    const t = createTranslator(dict);
    expect(t("home.greeting", { name: "Jan" })).toBe("Hello Jan");
    expect(t("home.count", { n: 3 })).toBe("3 messages");
  });

  it("leaves unmatched placeholders untouched", () => {
    const t = createTranslator(dict);
    expect(t("home.greeting", { other: "x" })).toBe("Hello {name}");
  });

  it("falls back to the key when missing", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const t = createTranslator(dict);
    expect(t("does.not.exist")).toBe("does.not.exist");
    expect(warn).toHaveBeenCalledWith("[i18n] missing key: does.not.exist");
  });

  it("falls back to the key when the value is not a string", () => {
    const t = createTranslator(dict);
    // `nested` resolves to an object, not a string.
    expect(t("nested")).toBe("nested");
  });
});
