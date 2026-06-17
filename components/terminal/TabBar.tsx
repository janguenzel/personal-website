"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/provider";
import { localePath, primaryNav } from "@/lib/nav";
import type { Locale } from "@/lib/i18n/config";

// Route-based tabs: real <a> links with aria-current="page" (the correct a11y
// pattern for navigation, vs. an in-page role="tablist").
export function TabBar({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <nav
      aria-label={t("nav.ariaLabel")}
      className="flex items-stretch gap-px overflow-x-auto border-b border-border bg-surface-2 text-sm"
    >
      {primaryNav.map((item, i) => {
        const href = localePath(locale, item.segment);
        const active = pathname === href;
        return (
          <Link
            key={item.key}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-2 whitespace-nowrap border-r border-border px-4 py-2 transition-colors ${
              active
                ? "bg-bg text-fg"
                : "text-muted hover:bg-surface hover:text-fg"
            }`}
          >
            <span className="text-accent" aria-hidden>
              {active ? "▌" : "•"}
            </span>
            <span>{t(`nav.${item.key}`)}</span>
            <kbd className="ml-1 hidden text-[10px] text-muted sm:inline">
              g{i + 1}
            </kbd>
          </Link>
        );
      })}
    </nav>
  );
}
