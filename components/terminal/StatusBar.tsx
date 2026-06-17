"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/provider";
import { useUiStore } from "@/lib/store/useUiStore";
import { otherLocale, type Locale } from "@/lib/i18n/config";
import { allNav, localePath, secondaryNav } from "@/lib/nav";
import { site, socials } from "@/lib/site";
import { VisitorCounter } from "./VisitorCounter";

function Btn({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="rounded border border-border px-1.5 py-0.5 text-muted hover:border-accent hover:text-accent"
    >
      {children}
    </button>
  );
}

export function StatusBar({ locale }: { locale: Locale }) {
  const { t } = useI18n();
  const pathname = usePathname();
  const theme = useUiStore((s) => s.theme);
  const scheme = useUiStore((s) => s.scheme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);
  const cycleScheme = useUiStore((s) => s.cycleScheme);
  const toggleCrt = useUiStore((s) => s.toggleCrt);
  const togglePalette = useUiStore((s) => s.togglePalette);
  const openHelp = useUiStore((s) => s.openHelp);

  const [clock, setClock] = useState("");
  useEffect(() => {
    const tick = () =>
      setClock(
        new Date().toLocaleTimeString(locale, {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [locale]);

  const other = otherLocale(locale);
  const segment =
    allNav.find((n) => pathname === localePath(locale, n.segment))?.segment ?? "";
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface-2 text-xs">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-1.5 text-muted">
        <span className="text-accent">
          {site.user}@{site.host}
        </span>
        <span suppressHydrationWarning>{clock}</span>
        <div className="ml-auto flex items-center gap-1.5">
          <Btn label={t("shell.themeToggle")} onClick={toggleTheme}>
            {theme === "dark" ? "◐ dark" : "◑ light"}
          </Btn>
          <Btn label={t("shell.schemeCycle")} onClick={cycleScheme}>
            ▦ {scheme}
          </Btn>
          <Btn label="Toggle CRT scanlines" onClick={toggleCrt}>
            ▤ crt
          </Btn>
          <Link
            href={localePath(other, segment)}
            hrefLang={other}
            aria-label={t("shell.langToggle")}
            className="rounded border border-border px-1.5 py-0.5 text-muted hover:border-accent hover:text-accent"
          >
            {locale.toUpperCase()}→{other.toUpperCase()}
          </Link>
          <Btn label={t("shell.openPalette")} onClick={togglePalette}>
            ⌘K
          </Btn>
          <Btn label={t("shell.help")} onClick={openHelp}>
            ?
          </Btn>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border px-3 py-1 text-muted">
        {secondaryNav.map((n) => (
          <Link
            key={n.key}
            href={localePath(locale, n.segment)}
            className="hover:text-accent"
          >
            {t(`nav.${n.key}`)}
          </Link>
        ))}
        {socials.github ? (
          <a
            href={socials.github}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent"
          >
            {t("footer.source")}
          </a>
        ) : null}
        <VisitorCounter />
        <span className="ml-auto">
          {t("footer.rights", { year: String(year), name: site.name })}
        </span>
      </div>
    </footer>
  );
}
