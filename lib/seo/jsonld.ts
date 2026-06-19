// Typed JSON-LD (schema.org) builders, kept framework-agnostic so they're
// trivially unit-testable. Every node reuses the public site config and the
// canonical URL helper, so a fork re-themes the structured data for free.
//
// Nodes share stable `@id` anchors (Person, WebSite) so a page can reference
// them once and link the rest of its graph to them instead of duplicating
// data. Feed the result to <JsonLd data={…} /> (components/seo/JsonLd.tsx).

import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/nav";
import { site, socials } from "@/lib/site";
import type { Project } from "@/content/projects";

type Node = Record<string, unknown>;

/** Stable anchors so cross-references resolve within a single @graph. */
export const PERSON_ID = `${site.url}/#person`;
export const WEBSITE_ID = `${site.url}/#website`;

const abs = (locale: Locale, segment: string) =>
  `${site.url}${localePath(locale, segment)}`;

/** The site owner. Anchored by @id so other nodes can point at it. */
export function personSchema(): Node {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: site.name,
    jobTitle: site.role,
    url: site.url,
    email: site.email,
    address: { "@type": "PostalAddress", addressCountry: site.location },
    sameAs: [socials.github, socials.twitter, socials.linkedin].filter(Boolean),
  };
}

/** The site itself; published by the Person. */
export function websiteSchema(locale: Locale): Node {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: site.name,
    url: abs(locale, ""),
    inLanguage: locale,
    publisher: { "@id": PERSON_ID },
  };
}

/** A generic content page, linked to the WebSite. */
export function webPageSchema(
  locale: Locale,
  segment: string,
  name: string,
  description: string,
): Node {
  return {
    "@type": "WebPage",
    url: abs(locale, segment),
    name,
    description,
    inLanguage: locale,
    isPartOf: { "@id": WEBSITE_ID },
  };
}

/** The /about page — a profile page whose subject is the Person. */
export function profilePageSchema(locale: Locale): Node {
  return {
    "@type": "ProfilePage",
    url: abs(locale, "about"),
    inLanguage: locale,
    mainEntity: { "@id": PERSON_ID },
  };
}

function softwareSourceCode(project: Project, locale: Locale): Node {
  const link = project.url || project.repo;
  const year = project.year.match(/\d{4}/)?.[0];
  return {
    "@type": "SoftwareSourceCode",
    name: project.name,
    description: project.description[locale],
    ...(project.repo ? { codeRepository: project.repo } : {}),
    ...(link ? { url: link } : {}),
    ...(project.stack.length ? { programmingLanguage: project.stack } : {}),
    ...(year ? { dateCreated: year } : {}),
    author: { "@id": PERSON_ID },
  };
}

/** The /projects page — a collection wrapping an ordered ItemList of work. */
export function collectionPageSchema(
  locale: Locale,
  projects: Project[],
): Node {
  return {
    "@type": "CollectionPage",
    url: abs(locale, "projects"),
    inLanguage: locale,
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: projects.map((project, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: softwareSourceCode(project, locale),
      })),
    },
  };
}

/** Home → current page trail. `name` is the localized page label. */
export function breadcrumbSchema(
  locale: Locale,
  segment: string,
  name: string,
): Node {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: site.name,
        item: abs(locale, ""),
      },
      {
        "@type": "ListItem",
        position: 2,
        name,
        item: abs(locale, segment),
      },
    ],
  };
}

/** Wrap one or more nodes into a single @graph document. */
export function graph(...nodes: Node[]): Node {
  return { "@context": "https://schema.org", "@graph": nodes };
}
