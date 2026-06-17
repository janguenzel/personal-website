import { beforeEach, describe, expect, it } from "vitest";
import { reapplyTheme, useUiStore } from "@/lib/store/useUiStore";
import { DEFAULT_SCHEME, DEFAULT_THEME } from "@/lib/themes";

// jsdom provides document.documentElement, so these exercise the real DOM writes.
describe("useUiStore theme persistence across navigation", () => {
  beforeEach(() => {
    delete document.documentElement.dataset.theme;
    delete document.documentElement.dataset.scheme;
    localStorage.clear();
    useUiStore.setState({
      theme: DEFAULT_THEME,
      scheme: DEFAULT_SCHEME,
      hydrated: false,
    });
  });

  it("applies theme/scheme to <html> and localStorage on change", () => {
    useUiStore.getState().setTheme("light");
    useUiStore.getState().setScheme("amber");

    expect(document.documentElement.dataset.theme).toBe("light");
    expect(document.documentElement.dataset.scheme).toBe("amber");
    expect(localStorage.getItem("theme")).toBe("light");
    expect(localStorage.getItem("scheme")).toBe("amber");
  });

  it("hydrate reads attributes the no-FOUC script set, without clobbering them", () => {
    document.documentElement.dataset.theme = "light";
    document.documentElement.dataset.scheme = "cyan";

    useUiStore.getState().hydrate();

    expect(useUiStore.getState().theme).toBe("light");
    expect(useUiStore.getState().scheme).toBe("cyan");
    expect(useUiStore.getState().hydrated).toBe(true);
    // Attributes left untouched.
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(document.documentElement.dataset.scheme).toBe("cyan");
  });

  it("hydrate falls back to localStorage and re-applies it when the dataset is empty", () => {
    // The layout-less 404 error shell renders <html id="__next_error__"> without
    // running the no-FOUC script, so the dataset is empty even though the user
    // picked a theme earlier (persisted in localStorage).
    localStorage.setItem("theme", "light");
    localStorage.setItem("scheme", "amber");

    useUiStore.getState().hydrate();

    expect(useUiStore.getState().theme).toBe("light");
    expect(useUiStore.getState().scheme).toBe("amber");
    expect(useUiStore.getState().hydrated).toBe(true);
    // And it asserts them onto <html> so the 404 shows the chosen theme.
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(document.documentElement.dataset.scheme).toBe("amber");
  });

  it("reapplyTheme restores attributes a soft navigation dropped", () => {
    useUiStore.getState().setTheme("light");
    useUiStore.getState().setScheme("magenta");

    // Simulate a soft navigation reconciling <html> and dropping the
    // imperatively set attributes (the bug being fixed).
    delete document.documentElement.dataset.theme;
    delete document.documentElement.dataset.scheme;

    const { theme, scheme } = useUiStore.getState();
    reapplyTheme(theme, scheme);

    expect(document.documentElement.dataset.theme).toBe("light");
    expect(document.documentElement.dataset.scheme).toBe("magenta");
  });
});

describe("useUiStore watchSystemTheme (follow OS when no theme is set)", () => {
  let listeners: Array<() => void>;
  let mqLightMatches: boolean;
  let removed: number;

  beforeEach(() => {
    delete document.documentElement.dataset.theme;
    delete document.documentElement.dataset.scheme;
    localStorage.clear();
    useUiStore.setState({
      theme: DEFAULT_THEME,
      scheme: DEFAULT_SCHEME,
      hydrated: false,
    });

    // Controllable matchMedia: capture the change handler so tests can flip the
    // OS preference and dispatch a change.
    listeners = [];
    mqLightMatches = false;
    removed = 0;
    window.matchMedia = ((query: string) => ({
      get matches() {
        return query.includes("light") ? mqLightMatches : !mqLightMatches;
      },
      media: query,
      onchange: null,
      addEventListener: (_: string, cb: () => void) => listeners.push(cb),
      removeEventListener: () => {
        removed++;
      },
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;
  });

  const flipOsTo = (theme: "light" | "dark") => {
    mqLightMatches = theme === "light";
    listeners.forEach((cb) => cb());
  };

  it("updates theme + <html> from the OS when no explicit theme is stored", () => {
    useUiStore.getState().watchSystemTheme();

    flipOsTo("light");
    expect(useUiStore.getState().theme).toBe("light");
    expect(document.documentElement.dataset.theme).toBe("light");

    flipOsTo("dark");
    expect(useUiStore.getState().theme).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("does not persist the OS-derived theme (stays in follow mode)", () => {
    useUiStore.getState().watchSystemTheme();
    flipOsTo("light");
    expect(localStorage.getItem("theme")).toBeNull();
  });

  it("ignores OS changes once the user has explicitly chosen a theme", () => {
    useUiStore.getState().setTheme("dark"); // persists "theme"
    useUiStore.getState().watchSystemTheme();

    flipOsTo("light");
    expect(useUiStore.getState().theme).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("returns a cleanup that detaches the listener", () => {
    const cleanup = useUiStore.getState().watchSystemTheme();
    cleanup();
    expect(removed).toBe(1);
  });
});

describe("useUiStore toggles", () => {
  beforeEach(() => {
    delete document.documentElement.dataset.theme;
    delete document.documentElement.dataset.scheme;
    localStorage.clear();
    useUiStore.setState({
      theme: DEFAULT_THEME,
      scheme: DEFAULT_SCHEME,
      hydrated: false,
      overlay: null,
      matrix: false,
      crt: false,
    });
  });

  it("toggleTheme flips between dark and light and applies to <html>", () => {
    useUiStore.setState({ theme: "dark" });
    useUiStore.getState().toggleTheme();
    expect(useUiStore.getState().theme).toBe("light");
    expect(document.documentElement.dataset.theme).toBe("light");

    useUiStore.getState().toggleTheme();
    expect(useUiStore.getState().theme).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("cycleScheme advances and wraps around the schemes", () => {
    const seen = new Set<string>();
    const start = useUiStore.getState().scheme;
    seen.add(start);
    for (let i = 0; i < 8 && useUiStore.getState().scheme !== start; i++) {
      useUiStore.getState().cycleScheme();
      seen.add(useUiStore.getState().scheme);
      if (useUiStore.getState().scheme === start) break;
    }
    // First step must move to a different scheme, and it must apply to <html>.
    useUiStore.setState({ scheme: DEFAULT_SCHEME });
    useUiStore.getState().cycleScheme();
    expect(useUiStore.getState().scheme).not.toBe(DEFAULT_SCHEME);
    expect(document.documentElement.dataset.scheme).toBe(
      useUiStore.getState().scheme,
    );
  });

  it("toggles palette and help overlays and closes them", () => {
    useUiStore.getState().togglePalette();
    expect(useUiStore.getState().overlay).toBe("palette");
    useUiStore.getState().togglePalette();
    expect(useUiStore.getState().overlay).toBeNull();

    useUiStore.getState().openPalette();
    expect(useUiStore.getState().overlay).toBe("palette");
    useUiStore.getState().openHelp();
    expect(useUiStore.getState().overlay).toBe("help");
    useUiStore.getState().closeOverlays();
    expect(useUiStore.getState().overlay).toBeNull();
  });

  it("toggles matrix rain and CRT effects", () => {
    useUiStore.getState().toggleMatrix();
    expect(useUiStore.getState().matrix).toBe(true);
    useUiStore.getState().setMatrix(false);
    expect(useUiStore.getState().matrix).toBe(false);

    useUiStore.getState().toggleCrt();
    expect(useUiStore.getState().crt).toBe(true);
    useUiStore.getState().toggleCrt();
    expect(useUiStore.getState().crt).toBe(false);
  });
});
