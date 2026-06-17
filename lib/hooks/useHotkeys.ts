"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { activeIndex, allNav, localePath, primaryNav } from "@/lib/nav";
import { useUiStore } from "@/lib/store/useUiStore";
import { otherLocale, type Locale } from "@/lib/i18n/config";

// The one place keyboard shortcuts are defined. Browser-reserved combos
// (⌘/Ctrl+T/W/N/1–9, Ctrl+Tab) are deliberately avoided

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || el.isContentEditable;
}

export function useHotkeys(locale: Locale): void {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let gArmed = false;
    let gTimer: ReturnType<typeof setTimeout> | undefined;
    let konami: string[] = [];

    const go = (index: number) => {
      const clamped = (index + primaryNav.length) % primaryNav.length;
      router.push(localePath(locale, primaryNav[clamped].segment));
    };
    const current = () => {
      const i = activeIndex(pathname, locale);
      return i === -1 ? 0 : i;
    };

    const onKey = (e: KeyboardEvent) => {
      const store = useUiStore.getState();
      const mod = e.metaKey || e.ctrlKey;
      const key = e.key;

      // Global combos work even while typing.
      if (mod && key.toLowerCase() === "k") {
        e.preventDefault();
        store.togglePalette();
        return;
      }
      if (mod && key.toLowerCase() === "j") {
        e.preventDefault();
        store.toggleTheme();
        return;
      }
      if (e.ctrlKey && key === ".") {
        e.preventDefault();
        store.cycleScheme();
        return;
      }
      if (key === "Escape") {
        store.closeOverlays();
        if (store.matrix) store.setMatrix(false);
        return;
      }

      if (isTypingTarget(e.target)) return; // don't hijack typing

      // Konami easter egg.
      konami = [...konami, key].slice(-KONAMI.length);
      if (KONAMI.every((k, i) => k.toLowerCase() === (konami[i] ?? "").toLowerCase())) {
        store.toggleMatrix();
        konami = [];
        return;
      }

      if (e.ctrlKey && key === "]") {
        e.preventDefault();
        go(current() + 1);
        return;
      }
      if (e.ctrlKey && key === "[") {
        e.preventDefault();
        go(current() - 1);
        return;
      }
      if (e.shiftKey && key === "ArrowRight") {
        e.preventDefault();
        go(current() + 1);
        return;
      }
      if (e.shiftKey && key === "ArrowLeft") {
        e.preventDefault();
        go(current() - 1);
        return;
      }
      if (key === "g") {
        gArmed = true;
        clearTimeout(gTimer);
        gTimer = setTimeout(() => (gArmed = false), 800);
        return;
      }
      if (gArmed && /^[1-9]$/.test(key)) {
        gArmed = false;
        go(Number(key) - 1);
        return;
      }
      if (key === "?") {
        e.preventDefault();
        store.openHelp();
        return;
      }
      // Quick language swap with "L" — preserve the current page across locales
      // (works on secondary routes too, not just primary tabs).
      if (key.toLowerCase() === "l" && !mod) {
        const seg =
          allNav.find((n) => pathname === localePath(locale, n.segment))
            ?.segment ?? "";
        router.push(localePath(otherLocale(locale), seg));
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(gTimer);
    };
  }, [router, pathname, locale]);
}
