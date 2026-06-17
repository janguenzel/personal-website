import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { I18nProvider, useI18n, useT } from "@/lib/i18n/provider";

const dict = {
  home: { greeting: "Hi {name}" },
} as unknown as Dictionary;

function wrapper({ children }: { children: ReactNode }) {
  return (
    <I18nProvider locale="en" dict={dict}>
      {children}
    </I18nProvider>
  );
}

describe("I18nProvider", () => {
  it("exposes locale, dict and a bound translator", () => {
    const { result } = renderHook(() => useI18n(), { wrapper });
    expect(result.current.locale).toBe("en");
    expect(result.current.t("home.greeting", { name: "Jan" })).toBe("Hi Jan");
  });

  it("useT returns the interpolating translator", () => {
    const { result } = renderHook(() => useT(), { wrapper });
    expect(result.current("home.greeting", { name: "Ada" })).toBe("Hi Ada");
  });

  it("throws when used outside a provider", () => {
    expect(() => renderHook(() => useI18n())).toThrow(
      /must be used within an I18nProvider/,
    );
  });
});
