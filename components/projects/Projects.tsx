"use client";

import { useI18n } from "@/lib/i18n/provider";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { Typewriter } from "@/components/ui/Typewriter";
import type { Project } from "@/content/projects";
import type { Locale } from "@/lib/i18n/config";

// The /projects tab. On-theme list of projects that reveals top-to-bottom on
// open, matching the /about page. Every effect is gated on useReducedMotion():
// when the user opts out we render the final state directly (no reveal classes,
// no stagger delays). The reveal helper increments a counter in source order so
// the stagger flows down the page.
export function Projects({
  locale,
  projects,
}: {
  locale: Locale;
  projects: Project[];
}) {
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

  return (
    <section className="text-sm">
      <header {...reveal("mb-6")}>
        <h1 className="text-accent">{t("projects.heading")}</h1>
        <p className="text-muted">
          $ <Typewriter text={t("projects.command")} />
        </p>
      </header>

      {projects.length === 0 ? (
        <p {...reveal("text-muted")}>{t("projects.empty")}</p>
      ) : (
        <ul className="space-y-4">
          {projects.map((p) => (
            <li
              key={p.slug}
              {...reveal(
                "rounded border border-border bg-surface p-4 transition-colors hover:border-accent",
              )}
            >
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-accent" aria-hidden>
                  {p.featured ? "★" : "›"}
                </span>
                <h2 className="text-fg">{p.name}</h2>
                <span className="text-xs text-muted">{p.year}</span>
                {p.featured ? (
                  <span className="text-xs text-accent">
                    {t("projects.featured")}
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-muted">{p.description[locale]}</p>
              <p className="mt-2 text-xs text-muted">
                {t("projects.stack")}: {p.stack.join(" · ")}
              </p>
              <div className="mt-2 flex gap-4 text-xs">
                {p.repo ? (
                  <a
                    href={p.repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    {t("projects.repo")} ↗
                  </a>
                ) : null}
                {p.url ? (
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    {t("projects.live")} ↗
                  </a>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      <p {...reveal("mt-8 border-t border-border pt-4 text-xs text-muted")}>
        <span className="text-accent" aria-hidden>
          #{" "}
        </span>
        {t("projects.privateNote")}
      </p>
    </section>
  );
}
