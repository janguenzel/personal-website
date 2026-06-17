import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { hasLocale } from "@/lib/i18n/config";
import { createTranslator, type Messages } from "@/lib/i18n/translate";
import { buildMetadata } from "@/lib/seo/metadata";
import { site, socials } from "@/lib/site";
import { Fastfetch, type FastfetchRow } from "@/components/fastfetch/Fastfetch";
import { JsonLd } from "@/components/seo/JsonLd";

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
    segment: "",
    title: dict.meta.home.title,
    description: dict.meta.home.description,
  });
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const t = createTranslator(dict as unknown as Messages);

  const years = Math.max(
    0,
    new Date().getFullYear() - new Date(site.codingSince).getFullYear(),
  );

  const L = dict.fastfetch.labels;
  const rows: FastfetchRow[] = [
    { label: L.user, value: `${site.user}@${site.host}` },
    { label: L.os, value: site.distro },
    { label: L.host, value: site.name },
    { label: L.role, value: site.role },
    { label: L.uptime, value: t("fastfetch.uptime", { years }) },
    { label: L.shell, value: site.shell },
    { label: L.editor, value: site.editor },
    { label: L.languages, value: site.languages.join(" · ") },
    { label: L.stack, value: site.stack.join(" · ") },
    { label: L.location, value: site.location },
    { label: L.email, value: site.email, href: socials.email },
    {
      label: L.github,
      value: `@${site.githubUser}`,
      href: socials.github || undefined,
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    jobTitle: site.role,
    url: site.url,
    email: site.email,
    address: { "@type": "PostalAddress", addressCountry: site.location },
    sameAs: [socials.github, socials.twitter, socials.linkedin].filter(Boolean),
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <Fastfetch locale={locale} name={site.name} rows={rows} />
    </>
  );
}
