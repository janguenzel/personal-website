"use client";

import { useI18n } from "@/lib/i18n/provider";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { Typewriter } from "@/components/ui/Typewriter";
import { Cursor } from "@/components/ui/Cursor";
import { intro, origin, timeline, skills, now } from "@/content/about";
import type { Locale } from "@/lib/i18n/config";

// The /about tab. On-theme terminal bio with a typed command line, a git-log
// style timeline and animated proficiency bars. Every effect is gated on
// useReducedMotion(): when the user opts out we render the final state directly
// (no reveal classes, no stagger delays, no bar fill animation). The reveal
// helper increments a counter in source order so the stagger flows top-to-bottom.
export function About({ locale }: { locale: Locale }) {
  const { t } = useI18n();
  const reduced = useReducedMotion();

  let order = 0;
  const reveal = (base = "") => {
    const i = order++;
    if (reduced) return { className: base };
    return {
      className: `${base} reveal`.trim(),
      style: { animationDelay: `${i * 70}ms` },
    };
  };
  const heading = (title: string) => (
    <h2 {...reveal("mb-3 text-accent")}>
      <span className="text-muted" aria-hidden>
        ${" "}
      </span>
      {title}
    </h2>
  );

  return (
    <section className="max-w-2xl text-sm">
      <header {...reveal("mb-8")}>
        <h1 className="glitch text-accent">{t("about.heading")}</h1>
        <p className="text-muted">
          ${" "}
          <Typewriter text={t("about.command")} />
        </p>
      </header>

      <div className="mb-8">
        {heading(t("about.intro.title"))}
        <div className="space-y-3">
          {intro.map((p, i) => (
            <p key={i} {...reveal("text-fg")}>
              {p[locale]}
            </p>
          ))}
        </div>
      </div>

      <div className="mb-8">
        {heading(t("about.origin.title"))}
        <div className="space-y-3">
          {origin.map((p, i) => (
            <p key={i} {...reveal("text-fg")}>
              {p[locale]}
            </p>
          ))}
        </div>
      </div>

      <div className="mb-8">
        {heading(t("about.timeline.title"))}
        <ol className="space-y-4 border-l border-border pl-4">
          {timeline.map((e) => (
            <li key={e.when} {...reveal("relative")}>
              <span
                aria-hidden
                className="absolute -left-[1.31rem] top-1 text-accent"
              >
                ◆
              </span>
              <div className="flex flex-wrap items-baseline gap-2">
                <code className="text-accent">{e.when}</code>
                <span className="text-fg">{e.title[locale]}</span>
              </div>
              <p className="mt-1 text-muted">{e.body[locale]}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="mb-8">
        {heading(t("about.skills.title"))}
        <ul className="space-y-3">
          {skills.map((s) => (
            <li key={s.name} {...reveal()}>
              <div className="flex items-baseline justify-between gap-2 text-xs">
                <span className="text-fg">{s.name}</span>
                <span className="text-muted">
                  {t("about.skillSince", { year: s.since })}
                </span>
              </div>
              <div
                role="meter"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={s.level}
                aria-label={s.name}
                className="mt-1 h-2 w-full overflow-hidden rounded bg-surface-2"
              >
                <div
                  aria-hidden
                  className={`h-full rounded bg-accent ${reduced ? "" : "bar-grow"}`}
                  style={{ width: `${s.level}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-8">
        {heading(t("about.now.title"))}
        <div className="space-y-3">
          {now.map((p, i) => (
            <p key={i} {...reveal("text-fg")}>
              {p[locale]}
            </p>
          ))}
          <p {...reveal("pt-2 text-muted")}>
            {t("about.outro")}
            <Cursor />
          </p>
        </div>
      </div>
    </section>
  );
}
