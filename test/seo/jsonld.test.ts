import { describe, expect, it } from "vitest";
import {
  PERSON_ID,
  WEBSITE_ID,
  breadcrumbSchema,
  collectionPageSchema,
  graph,
  personSchema,
  profilePageSchema,
  webPageSchema,
  websiteSchema,
} from "@/lib/seo/jsonld";
import { getProjects } from "@/content/projects";
import { site } from "@/lib/site";

describe("jsonld builders", () => {
  it("anchors the Person node by @id and lists social profiles", () => {
    const person = personSchema();
    expect(person["@type"]).toBe("Person");
    expect(person["@id"]).toBe(PERSON_ID);
    expect(person.url).toBe(site.url);
    expect(Array.isArray(person.sameAs)).toBe(true);
    // sameAs only contains truthy absolute URLs (empty socials filtered out).
    for (const url of person.sameAs as string[]) {
      expect(url).toBeTruthy();
    }
  });

  it("publishes the WebSite from the Person @id with the right locale", () => {
    const ws = websiteSchema("de");
    expect(ws["@type"]).toBe("WebSite");
    expect(ws["@id"]).toBe(WEBSITE_ID);
    expect(ws.inLanguage).toBe("de");
    expect(ws.url).toBe(`${site.url}/de`);
    expect(ws.publisher).toEqual({ "@id": PERSON_ID });
  });

  it("links the ProfilePage to the Person", () => {
    const pp = profilePageSchema("en");
    expect(pp["@type"]).toBe("ProfilePage");
    expect(pp.url).toBe(`${site.url}/en/about`);
    expect(pp.mainEntity).toEqual({ "@id": PERSON_ID });
  });

  it("builds a WebPage linked to the WebSite", () => {
    const wp = webPageSchema("en", "board", "board", "A guestbook.");
    expect(wp["@type"]).toBe("WebPage");
    expect(wp.url).toBe(`${site.url}/en/board`);
    expect(wp.isPartOf).toEqual({ "@id": WEBSITE_ID });
  });

  it("maps every project into the CollectionPage ItemList", () => {
    const projects = getProjects();
    const page = collectionPageSchema("en", projects);
    expect(page["@type"]).toBe("CollectionPage");
    const list = page.mainEntity as {
      "@type": string;
      itemListElement: Array<{
        position: number;
        item: Record<string, unknown>;
      }>;
    };
    expect(list["@type"]).toBe("ItemList");
    expect(list.itemListElement).toHaveLength(projects.length);
    list.itemListElement.forEach((entry, i) => {
      expect(entry.position).toBe(i + 1);
      expect(entry.item["@type"]).toBe("SoftwareSourceCode");
      expect(entry.item.name).toBe(projects[i].name);
      expect(entry.item.description).toBe(projects[i].description.en);
    });
  });

  it("builds a two-step breadcrumb with absolute item URLs", () => {
    const bc = breadcrumbSchema("en", "about", "about");
    expect(bc["@type"]).toBe("BreadcrumbList");
    const items = bc.itemListElement as Array<{
      position: number;
      name: string;
      item: string;
    }>;
    expect(items).toHaveLength(2);
    expect(items[0].item).toBe(`${site.url}/en`);
    expect(items[1].item).toBe(`${site.url}/en/about`);
    expect(items[1].name).toBe("about");
  });

  it("wraps nodes in a single @graph document", () => {
    const doc = graph(websiteSchema("en"), personSchema());
    expect(doc["@context"]).toBe("https://schema.org");
    expect(doc["@graph"]).toHaveLength(2);
  });
});
