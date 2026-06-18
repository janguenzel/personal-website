"use client";

import { Fragment } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/provider";
import { localePath } from "@/lib/nav";
import { Typewriter } from "@/components/ui/Typewriter";
import type { Locale } from "@/lib/i18n/config";

export type FastfetchRow = { label: string; value: string; href?: string };

const ASCII = [
  "      .--.      ",
  "     |o_o |     ",
  "     |:_/ |     ",
  "    //   \\ \\    ",
  "   (|     | )   ",
  "  /'\\_   _/`\\   ",
  "  \\___)=(___/   ",
];

export function Fastfetch({
  locale,
  name,
  rows,
}: {
  locale: Locale;
  name: string;
  rows: FastfetchRow[];
}) {
  const { t } = useI18n();

  return (
    <section className="text-sm">
      <div className="flex flex-col gap-6 sm:flex-row sm:gap-10">
        <pre aria-hidden className="shrink-0 text-accent leading-tight glitch">
          {ASCII.join("\n")}
        </pre>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
          {rows.map((r) => (
            <Fragment key={r.label}>
              <dt className="text-accent">{r.label}</dt>
              <dd className="min-w-0 break-words text-fg">
                {r.href ? (
                  <a href={r.href} className="hover:underline">
                    {r.value}
                  </a>
                ) : (
                  r.value
                )}
              </dd>
            </Fragment>
          ))}
        </dl>
      </div>

      <div className="mt-8 max-w-2xl space-y-3">
        <h1 className="text-lg text-fg">
          <span className="text-accent" aria-hidden>
            ❯{" "}
          </span>
          <Typewriter text={t("home.greeting", { name })} />
        </h1>
        <p className="text-muted">{t("home.intro")}</p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href={localePath(locale, "about")}
            className="border border-accent px-3 py-1.5 text-accent transition-colors hover:bg-accent hover:text-bg"
          >
            {t("home.ctaAbout")}
          </Link>
          <Link
            href={localePath(locale, "projects")}
            className="border border-border px-3 py-1.5 text-muted transition-colors hover:text-fg"
          >
            {t("home.ctaProjects")}
          </Link>
          <Link
            href={localePath(locale, "board")}
            className="border border-border px-3 py-1.5 text-muted transition-colors hover:text-fg"
          >
            {t("home.ctaBoard")}
          </Link>
        </div>
        <p className="pt-4 text-xs text-muted">{t("fastfetch.hint")}</p>
      </div>
    </section>
  );
}
