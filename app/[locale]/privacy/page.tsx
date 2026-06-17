import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { hasLocale } from "@/lib/i18n/config";
import { buildMetadata } from "@/lib/seo/metadata";
import { getImprint } from "@/lib/imprint";

// Reads IMPRINT_* env at request time (controller details) so forks can
// configure it without rebuilds.
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
    segment: "privacy",
    title: dict.meta.privacy.title,
    description: dict.meta.privacy.description,
    noindex: true,
  });
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const p = dict.privacy;
  const im = getImprint();

  // Per-processing sections, each with its purpose + legal basis spelled out.
  const sections = [
    { title: p.hostingTitle, body: p.hostingBody },
    { title: p.cookiesTitle, body: p.cookiesBody },
    { title: p.authTitle, body: p.authBody },
    { title: p.boardTitle, body: p.boardBody },
    { title: p.transfersTitle, body: p.transfersBody },
    { title: p.retentionTitle, body: p.retentionBody },
    { title: p.sslTitle, body: p.sslBody },
  ];

  return (
    <section className="max-w-2xl text-sm">
      <header className="mb-4">
        <h1 className="text-accent">{p.heading}</h1>
        <p className="text-muted">$ {p.command}</p>
      </header>

      <p className="text-muted">{p.intro}</p>
      <p className="mt-2 text-xs text-muted">{p.updated}</p>

      <div className="mt-6 space-y-5">
        {/* Controller — identity + contact, rendered from the server-only IMPRINT_* env. */}
        <article>
          <h2 className="text-fg">› {p.controllerTitle}</h2>
          <p className="mt-1 text-muted">{p.controllerIntro}</p>
          <address className="mt-1 not-italic text-fg">
            {im.name}
            <br />
            {im.street}
            <br />
            {im.city}
            <br />
            {im.country}
          </address>
          <p className="mt-1 text-muted">
            {p.controllerEmailLabel}:{" "}
            <a href={`mailto:${im.email}`} className="text-fg hover:underline">
              {im.email}
            </a>
          </p>
          <p className="mt-1 text-xs text-muted">{p.controllerNote}</p>
        </article>

        {sections.map((s) => (
          <article key={s.title}>
            <h2 className="text-fg">› {s.title}</h2>
            <p className="mt-1 text-muted">{s.body}</p>
          </article>
        ))}

        {/* Data-subject rights — enumerated list + objection + complaint. */}
        <article>
          <h2 className="text-fg">› {p.rightsTitle}</h2>
          <p className="mt-1 text-muted">{p.rightsIntro}</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-muted">
            {p.rightsItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="mt-2 text-muted">{p.rightsObjection}</p>
          <p className="mt-2 text-muted">{p.rightsComplaint}</p>
          <p className="mt-2 text-muted">{p.rightsContact}</p>
        </article>

        <article>
          <h2 className="text-fg">› {p.changesTitle}</h2>
          <p className="mt-1 text-muted">{p.changesBody}</p>
        </article>
      </div>
    </section>
  );
}
