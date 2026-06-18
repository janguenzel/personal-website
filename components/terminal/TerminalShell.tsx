"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/provider";
import { reapplyTheme, useUiStore } from "@/lib/store/useUiStore";
import { useHotkeys } from "@/lib/hooks/useHotkeys";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { allNav, localePath } from "@/lib/nav";
import { site } from "@/lib/site";
import type { Locale } from "@/lib/i18n/config";
import { TabBar } from "./TabBar";
import { StatusBar } from "./StatusBar";
import { CommandPalette } from "./CommandPalette";
import { HelpOverlay } from "./HelpOverlay";
import { MatrixRain } from "@/components/effects/MatrixRain";

// The window chrome that wraps every page: titlebar, tab strip, scrollable body,
// status bar, plus the global overlays. Owns hotkeys + store hydration.
export function TerminalShell({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const { t } = useI18n();
  const pathname = usePathname();
  const hydrate = useUiStore((s) => s.hydrate);
  const watchSystemTheme = useUiStore((s) => s.watchSystemTheme);
  const hydrated = useUiStore((s) => s.hydrated);
  const theme = useUiStore((s) => s.theme);
  const scheme = useUiStore((s) => s.scheme);
  const crt = useUiStore((s) => s.crt);

  useHotkeys(locale);
  useEffect(() => hydrate(), [hydrate]);
  // While no theme is explicitly chosen, track the OS light/dark preference live.
  useEffect(() => watchSystemTheme(), [watchSystemTheme]);

  // Re-assert the chosen theme/scheme onto <html> after every navigation. A soft
  // navigation (e.g. the language switcher) reconciles <html> from an RSC payload
  // without data-theme/data-scheme and can drop the imperatively set attributes,
  // reverting the user's theme. The store survives the navigation, so we restore
  // from it — before paint (layout effect) so there's no flash. Gated on
  // `hydrated` so we never clobber the no-FOUC values with defaults on first load.
  useIsomorphicLayoutEffect(() => {
    if (hydrated) reapplyTheme(theme, scheme);
  }, [pathname, hydrated, theme, scheme]);

  const segment =
    allNav.find((n) => pathname === localePath(locale, n.segment))?.segment ??
    "";
  const path = segment ? `~/${segment}` : "~";

  return (
    <div className="mx-auto flex min-h-dvh max-w-4xl flex-col p-2 sm:p-6">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-2xl">
        <div className="flex items-center border-b border-border bg-surface-2 px-3 py-2">
          <span className="flex gap-1.5" aria-hidden>
            <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
            <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
            <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
          </span>
          <span className="mx-auto truncate px-2 text-xs text-muted">
            {t("shell.windowTitle", { user: site.user, host: site.host, path })}
          </span>
        </div>

        <TabBar locale={locale} />

        <main
          className={`relative flex-1 overflow-y-auto bg-bg p-4 leading-relaxed sm:p-6 ${
            crt ? "crt" : ""
          }`}
        >
          {children}
        </main>

        <StatusBar locale={locale} />
      </div>

      <CommandPalette locale={locale} />
      <HelpOverlay />
      <MatrixRain />
    </div>
  );
}
