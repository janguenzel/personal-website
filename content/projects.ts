// Project data. Forkers: edit this file (it's the only place projects live).
// Descriptions are bilingual so the /projects route stays fully translated.

import type { Locale } from "@/lib/i18n/config";

export type Project = {
  slug: string;
  name: string;
  /** Short tagline per locale. */
  description: Record<Locale, string>;
  /** Tech tags, rendered as a terminal-style list. */
  stack: string[];
  /** Primary link (repo or live). */
  url?: string;
  repo?: string;
  /** Year or status badge. */
  year: string;
  /** Marks a highlighted project (sorted first, gets a ★). */
  featured?: boolean;
};

export const projects: Project[] = [
  {
    slug: "personal-website",
    name: "personal-website",
    description: {
      en: "This very website — a personal site that boots, parses commands and feels like a real terminal.",
      de: "Genau diese Website – eine persönliche Seite, die bootet, Befehle versteht und sich wie ein echtes Terminal anfühlt.",
    },
    stack: ["Next.js", "TypeScript", "Tailwind v4", "motion", "Vercel"],
    repo: "https://github.com/janguenzel/personal-website",
    year: "2026",
    featured: true,
  },
  {
    slug: "trello",
    name: "trello",
    description: {
      en: "A fully type-safe Trello REST API wrapper, published as an npm package and generated from an OpenAPI spec.",
      de: "Ein vollständig typsicherer Wrapper für die Trello-REST-API, als npm-Paket veröffentlicht und aus einer OpenAPI-Spec generiert.",
    },
    stack: ["TypeScript", "OpenAPI", "npm", "Atlassian", "REST API"],
    repo: "https://www.npmjs.com/package/@janguenzel/trello",
    year: "2026",
  },
  {
    slug: "trainyourtown",
    name: "TrainYourTown",
    description: {
      en: "Co-authored the cross-platform iOS & Android app and its backend — React Native frontend on a NestJS API, deployed with Dokku, Firebase and MongoDB.",
      de: "Co-Autor der plattformübergreifenden iOS- & Android-App und ihres Backends – React-Native-Frontend auf einer NestJS-API, deployt mit Dokku, Firebase und MongoDB.",
    },
    stack: ["React Native", "NestJS", "MongoDB", "Firebase", "Dokku"],
    repo: "https://trainyourtown.com",
    year: "2022 - 2024",
  },
];

export function getProjects(): Project[] {
  return [...projects].sort(
    (a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)),
  );
}
