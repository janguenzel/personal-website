import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { hasLocale } from "@/lib/i18n/config";
import { buildMetadata } from "@/lib/seo/metadata";
import {
  breadcrumbSchema,
  graph,
  personSchema,
  profilePageSchema,
} from "@/lib/seo/jsonld";
import { About } from "@/components/about/About";
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
    segment: "about",
    title: dict.meta.about.title,
    description: dict.meta.about.description,
  });
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return (
    <>
      <JsonLd
        data={graph(
          profilePageSchema(locale),
          personSchema(),
          breadcrumbSchema(locale, "about", dict.meta.about.title),
        )}
      />
      <About locale={locale} />
    </>
  );
}
