import type { Metadata } from "next";
import { Fragment } from "react";
import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { hasLocale } from "@/lib/i18n/config";
import { buildMetadata } from "@/lib/seo/metadata";
import { getImprint } from "@/lib/imprint";

// Reads IMPRINT_* env at request time so forks can configure it without rebuilds.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const loc = hasLocale(locale) ? locale : "en";
  const dict = await getDictionary(loc);
  return buildMetadata({
    locale: loc,
    segment: "imprint",
    title: dict.meta.imprint.title,
    description: dict.meta.imprint.description,
    noindex: true,
  });
}

export default async function ImprintPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const im = getImprint();
  const m = dict.imprint;
  const L = m.labels;

  const rows: { label: string; value: string; href?: string }[] = [
    { label: L.name, value: im.name },
    { label: L.address, value: `${im.street}, ${im.city}` },
    { label: L.country, value: im.country },
    { label: L.email, value: im.email, href: `mailto:${im.email}` },
  ];
  if (im.phone) rows.push({ label: L.phone, value: im.phone });

  // Standard German liability / copyright disclaimers (customary in an Impressum).
  const clauses = [
    { title: m.liabilityContentTitle, body: m.liabilityContentBody },
    { title: m.liabilityLinksTitle, body: m.liabilityLinksBody },
    { title: m.copyrightTitle, body: m.copyrightBody },
  ];

  return (
    <section className="max-w-2xl text-sm">
      <header className="mb-4">
        <h1 className="text-accent">{m.heading}</h1>
        <p className="text-muted">$ {m.command}</p>
      </header>

      <p className="text-xs text-muted">{m.legalNote}</p>
      {!im.configured ? (
        <p className="mt-2 text-xs text-danger">{m.notConfigured}</p>
      ) : null}

      <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
        {rows.map((r) => (
          <Fragment key={r.label}>
            <dt className="text-accent">{r.label}</dt>
            <dd className="text-fg">
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

      {im.vatId ? (
        <p className="mt-4">
          <span className="text-accent">{m.vatNote}</span>{" "}
          <span className="text-fg">{im.vatId}</span>
        </p>
      ) : null}

      <article className="mt-6">
        <h2 className="text-fg">› {m.responsibleTitle}</h2>
        <p className="mt-1 text-muted">
          {im.name}, {im.street}, {im.city}
        </p>
      </article>

      <div className="mt-6 space-y-5">
        <article>
          <h2 className="text-fg">› {m.disputeTitle}</h2>
          <p className="mt-1 text-muted">{m.disputeBody}</p>
        </article>
        {clauses.map((c) => (
          <article key={c.title}>
            <h2 className="text-fg">› {c.title}</h2>
            <p className="mt-1 text-muted">{c.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
