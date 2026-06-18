"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n/provider";
import { useUiStore } from "@/lib/store/useUiStore";
import { useFocusTrap } from "@/lib/hooks/useFocusTrap";
import { allNav, localePath } from "@/lib/nav";
import { localeNames, otherLocale, type Locale } from "@/lib/i18n/config";

type Item = {
  id: string;
  label: string;
  hint?: string;
  run: () => void;
};

export function CommandPalette({ locale }: { locale: Locale }) {
  const { t } = useI18n();
  const router = useRouter();
  const open = useUiStore((s) => s.overlay === "palette");
  const close = useUiStore((s) => s.closeOverlays);
  const toggleTheme = useUiStore((s) => s.toggleTheme);
  const cycleScheme = useUiStore((s) => s.cycleScheme);
  const toggleMatrix = useUiStore((s) => s.toggleMatrix);

  const dialogRef = useFocusTrap<HTMLDivElement>(open);
  const listRef = useRef<HTMLUListElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const items: Item[] = useMemo(() => {
    const other = otherLocale(locale);
    const pages: Item[] = allNav.map((n) => ({
      id: `page-${n.key}`,
      label: t(`nav.${n.key}`),
      hint: localePath(locale, n.segment),
      run: () => router.push(localePath(locale, n.segment)),
    }));
    const actions: Item[] = [
      { id: "theme", label: t("palette.toggleTheme"), run: toggleTheme },
      { id: "scheme", label: t("palette.cycleScheme"), run: cycleScheme },
      {
        id: "lang",
        label: t("palette.switchLang", { lang: localeNames[other] }),
        run: () => router.push(localePath(other, "")),
      },
      { id: "matrix", label: t("palette.matrix"), run: toggleMatrix },
    ];
    return [...pages, ...actions];
  }, [locale, t, router, toggleTheme, cycleScheme, toggleMatrix]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.label.toLowerCase().includes(q) ||
        (i.hint ?? "").toLowerCase().includes(q),
    );
  }, [items, query]);

  // Reset transient state at render time (not in an effect) — React's
  // "adjusting state when a prop changes" pattern. Guards prevent loops.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    setQuery("");
    setActive(0);
  }
  const [prevQuery, setPrevQuery] = useState(query);
  if (query !== prevQuery) {
    setPrevQuery(query);
    setActive(0);
  }

  // Keep the highlighted option visible when arrow-key navigation moves it past
  // the scroll viewport. Scrolling the DOM is a post-render side effect, so it
  // belongs in an effect (no setState here, so rule #7 is satisfied).
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector<HTMLElement>(
      '[aria-selected="true"]',
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  if (!open) return null;

  const run = (item?: Item) => {
    if (!item) return;
    close();
    item.run();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(filtered[active]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-[12vh]"
      onClick={close}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={t("shell.openPalette")}
        tabIndex={-1}
        className="w-full max-w-lg overflow-hidden rounded-lg border border-border bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
          <span className="text-accent" aria-hidden>
            ❯
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={t("palette.placeholder")}
            aria-label={t("palette.placeholder")}
            className="w-full bg-transparent text-sm text-fg outline-none placeholder:text-muted"
          />
        </div>
        <ul
          ref={listRef}
          className="max-h-72 overflow-y-auto py-1"
          role="listbox"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted">
              {t("palette.empty")}
            </li>
          ) : (
            filtered.map((item, i) => (
              <li
                key={item.id}
                role="option"
                aria-selected={i === active}
                onMouseEnter={() => setActive(i)}
                onClick={() => run(item)}
                className={`flex cursor-pointer items-center justify-between px-3 py-1.5 text-sm ${
                  i === active ? "bg-surface-2 text-fg" : "text-muted"
                }`}
              >
                <span>{item.label}</span>
                {item.hint ? (
                  <span className="text-xs text-muted">{item.hint}</span>
                ) : null}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
