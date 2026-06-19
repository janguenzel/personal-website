import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { hasLocale } from "@/lib/i18n/config";
import { buildMetadata } from "@/lib/seo/metadata";
import {
  breadcrumbSchema,
  collectionPageSchema,
  graph,
} from "@/lib/seo/jsonld";
import { getProjects } from "@/content/projects";
import { Projects } from "@/components/projects/Projects";
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
    segment: "projects",
    title: dict.meta.projects.title,
    description: dict.meta.projects.description,
  });
}

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const projects = getProjects();
  const dict = await getDictionary(locale);

  return (
    <>
      <JsonLd
        data={graph(
          collectionPageSchema(locale, projects),
          breadcrumbSchema(locale, "projects", dict.meta.projects.title),
        )}
      />
      <Projects locale={locale} projects={projects} />
    </>
  );
}
