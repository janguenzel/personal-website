// About-page content. Forkers: edit this file — it's the only place the bio
// lives. Prose is bilingual (en/de) so the /about route stays fully translated,
// exactly like content/projects.ts. Structural labels (headings, the fake
// command, the section titles) live in the i18n dictionaries instead.

import type { Locale } from "@/lib/i18n/config";

export type Localized = Record<Locale, string>;

export type TimelineEntry = {
  /** Year or range, shown as the "commit" marker in the git-log timeline. */
  when: string;
  title: Localized;
  body: Localized;
};

export type Skill = {
  name: string;
  /** Proficiency 0–100, drives the terminal-style usage bar. */
  level: number;
  /** Roughly how long I've used it — shown next to the bar. */
  since: number;
};

// My birthday. The age in the intro is *computed* from this so it never goes
// stale — no need to bump a number every September.
const BIRTH_DATE = new Date(2001, 8, 25); // 25 Sep 2001 (month is 0-indexed)

/** Whole years between `date` and `now`, accounting for the month/day. */
function yearsSince(date: Date, now: Date = new Date()): number {
  let years = now.getFullYear() - date.getFullYear();
  const beforeBirthday =
    now.getMonth() < date.getMonth() ||
    (now.getMonth() === date.getMonth() && now.getDate() < date.getDate());
  if (beforeBirthday) years--;
  return years;
}

const age = yearsSince(BIRTH_DATE);

/** "How I am" — a few short personality paragraphs. */
export const intro: Localized[] = [
  {
    en: `I’m Jan, ${age} years old and a developer based in Germany. A large part of my work happens in quiet, focused sessions where I work alone and dive deep into problems. Just as important, however, is the exchange with a small circle of long-time friends and collaborators, with whom I develop ideas further and challenge them critically. This balance between concentrated solo work and collaborative reflection with people I trust is what defines my way of working.`,
    de: `Ich bin Jan, ${age} Jahre alt und als Entwickler in Deutschland tätig. Ein großer Teil meiner Arbeit entsteht in ruhigen, fokussierten Phasen, in denen ich alleine an Projekten arbeite und tief in Probleme eintauche. Genauso wichtig ist mir aber der Austausch mit einem kleinen Kreis langjähriger Freunde und Kollegen, mit denen ich Ideen weiterentwickle und kritisch hinterfrage. Dieses Pendeln zwischen konzentriertem Arbeiten und gemeinsamer Reflexion prägt meine Arbeitsweise maßgeblich.`,
  },
  {
    en: "What drives me is actually quite simple: trying new things, learning from them, and moving forward. I enjoy exploring different tools and approaches and don’t hesitate to dive into unfamiliar territory. I care more about testing things in practice than staying in a comfort zone for too long. Along the way, I often end up running several small experiments in parallel that gradually evolve over time.",
    de: "Was mich antreibt, ist eigentlich ganz simpel: Neues ausprobieren, daraus lernen und weitermachen. Ich probiere gerne unterschiedliche Tools und Ansätze aus und arbeite mich auch ohne langes Zögern in unbekannte Dinge ein. Mir ist wichtiger, Dinge praktisch zu testen, als lange in der Komfortzone zu bleiben. Dabei entstehen oft mehrere kleine Experimente parallel, die sich Schritt für Schritt weiterentwickeln.",
  },
];

/** "How I started coding and why." */
export const origin: Localized[] = [
  {
    en: "Like for many people in tech, it all started pretty unspectacularly with video games. One in particular quickly became more than just a way to pass the time: Minecraft in Java. At first, it was just playing, hopping between servers, building worlds, and hanging out with friends. But what really pulled me in was the ability to completely reshape the game through mods — both on the client and server side. Pretty much everything was up for change.",
    de: "Wie bei vielen in der Tech-Welt hat alles ziemlich unspektakulär mit Computerspielen angefangen. Ein Spiel hat dabei aber schnell mehr gemacht als nur Zeit vertreiben: Minecraft in Java. Erst war es nur spielen, Server wechseln, eigene Welten bauen und mit Freunden unterwegs sein. Aber der eigentliche Reiz lag darin, dass man das Spiel mit Mods komplett umbauen konnte – auf Client- und Serverseite, so ziemlich alles war veränderbar.",
  },
  {
    en: "The only issue was: no mod ever did exactly what I had in mind. It was always “close enough,” but never quite there. So I started following YouTube tutorials and building my own mods from scratch — all in Java. That’s how I actually learned the language, not through structured courses, but by trying to build things that didn’t exist yet. At some point, the tutorials became unnecessary, and StackOverflow became a very regular part of my life instead.",
    de: "Das Problem war nur: Keine Mod hat jemals genau das gemacht, was ich im Kopf hatte. Es war immer „fast richtig“, aber eben nie ganz. Also habe ich angefangen, mir YouTube-Tutorials zu geben und eigene Mods zu bauen – komplett in Java. So habe ich die Sprache gelernt, nicht über Kurse, sondern indem ich versucht habe, Dinge umzusetzen, die es so noch nicht gab. Irgendwann wurden die Tutorials überflüssig, und dafür hat StackOverflow einen festen Platz in meinem Alltag bekommen.",
  },
  {
    en: "Then came the moment where all those mods suddenly needed to store data — players, progress, states, and all kinds of chaos. So I had to learn a database. MySQL was the obvious choice back then, so I picked that up too. Since then, the same pattern has basically repeated itself: I have an idea, I hit a limit, and I learn whatever I need to push past it — sometimes intentionally, sometimes by running headfirst into the wall, but so far, it’s worked surprisingly well.",
    de: "Und dann kam der Punkt, an dem die ganzen Mods plötzlich Daten speichern wollten – Spieler, Fortschritte, Zustände und alles mögliche Chaos. Also musste eine Datenbank her. MySQL war damals die offensichtliche Wahl, also habe ich mir das auch noch beigebracht. Seitdem zieht sich im Grunde immer dasselbe Muster durch: Ich habe eine Idee, stoße an Grenzen und lerne genau das, was ich brauche, um sie trotzdem umzusetzen – manchmal geplant, manchmal eher mit dem Kopf durch die Wand, aber bisher erstaunlich erfolgreich.",
  },
];

/** "How I developed" — a git-log-style journey. Newest first. */
export const timeline: TimelineEntry[] = [
  {
    when: "now",
    title: {
      en: "finishing my CS degree while building a company",
      de: "Studium kurz vor dem Abschluss — und eine eigene Firma nebenbei",
    },
    body: {
      en: "I’m currently focused on completing my Bachelor’s in Computer Science while deepening my understanding of the theoretical foundations behind it. The program regularly pulls me into deep dives — most recently into machine learning, where I explored the Netflix Prize and recommender systems in a written paper. Alongside that, I’m growing my own company in data automation, which keeps the practical side constantly active. Depending on the context, I either work alone when deep focus is needed or collaborate closely with friends when shared thinking leads to better outcomes.",
      de: "Aktuell liegt mein Fokus darauf, meinen Bachelor in Informatik abzuschließen und dabei die theoretischen Grundlagen wirklich tief zu verstehen. Das Studium führt mich dabei regelmäßig in intensive Deep Dives – zuletzt etwa im Bereich Machine Learning, wo ich eine Arbeit über den Netflix Prize und Recommender-Systeme geschrieben habe. Parallel dazu baue ich meine eigene Firma im Bereich Datenautomatisierung weiter aus, wodurch die praktische Seite durchgehend präsent bleibt. Je nach Situation arbeite ich allein, wenn Fokus gefragt ist, oder im engen Austausch mit Freunden, wenn gemeinsame Perspektiven besser voranbringen.",
    },
  },
  {
    when: "2022",
    title: {
      en: "agency work for well-known clients",
      de: "Agenturarbeit für bekannte Kunden",
    },
    body: {
      en: "Built websites and web applications for established German brands, alongside a long-running lead management and distribution platform. I worked with a roughly 20-person development team, mostly based in India, and coordinated the software building and integration process between the client and the engineering team. I also acted as the main technical bridge, ensuring alignment between product vision and implementation.",
      de: "Entwicklung von Websites und Web-Anwendungen für bekannte deutsche Marken sowie einer langlaufenden Plattform zur Lead-Verwaltung und -Verteilung. Dabei habe ich mit einem rund 20-köpfigen, größtenteils in Indien ansässigen Entwicklungsteam zusammengearbeitet und den Software-Build- und Integrationsprozess zwischen Kunde und Engineering-Team koordiniert. Zusätzlich war ich die zentrale technische Schnittstelle und habe so Produktvision und Umsetzung zusammengeführt.",
    },
  },
  {
    when: "2021",
    title: {
      en: "early agency experience — learning by doing",
      de: "erste Agenturerfahrung — Lernen im echten Projekt",
    },
    body: {
      en: "Joined an agency and spent my first year deeply involved in a project called TrainYourTown, initially as the second developer and later taking over parts of the system. It was a fast-paced introduction to modern stacks — React Native, TypeScript, NestJS, microservices, MongoDB, and cloud infrastructure like Firebase, all at once.",
      de: "Einstieg in eine Agentur und mein erstes Jahr intensiv an der App TrainYourTown gearbeitet, zunächst als zweiter Entwickler und später mit Übernahme von Teilen des Systems. Ein sehr schneller Einstieg in moderne Technologien — React Native, TypeScript, NestJS, Microservices, MongoDB und Cloud-Infrastruktur wie Firebase, alles gleichzeitig.",
    },
  },
  {
    when: "2019",
    title: {
      en: "CS-focused high school & first real engineering teamwork",
      de: "Informatik-Schwerpunkt am Gymnasium & erste echte Teamprojekte",
    },
    body: {
      en: "Transferred to a computer-science focused high school where I revisited Java with a much deeper understanding of data structures and algorithmic complexity. Together with two classmates, I completed an internship building fleet management software using Angular, a Spring Boot backend, Docker, and OpenShift.",
      de: "Wechsel auf ein Gymnasium mit Informatik-Schwerpunkt, wo ich Java erneut mit deutlich tieferem Verständnis für Datenstrukturen und Zeitkomplexität gelernt habe. Gemeinsam mit zwei Mitschülern habe ich ein Praktikum absolviert und eine Flottensteuerungs-Software entwickelt – mit Angular, Spring-Boot-Backend, Docker und OpenShift.",
    },
  },
  {
    when: "2016",
    title: {
      en: "first steps into web development",
      de: "erste Schritte in der Webentwicklung",
    },
    body: {
      en: "Started experimenting with HTML, CSS, and JavaScript, building simple beginner websites with Bootstrap. Two things became obvious quickly: building for the web is fun, and visual design is not where my strengths lie.",
      de: "Erste Experimente mit HTML, CSS und JavaScript und Bau einfacher Webseiten mit Bootstrap. Zwei Dinge wurden schnell klar: Webentwicklung macht Spaß — und visuelles Design gehört nicht zu meinen Stärken.",
    },
  },
  {
    when: "2014",
    title: {
      en: "first Java code through Minecraft mods",
      de: "erste Java-Erfahrung durch Minecraft-Mods",
    },
    body: {
      en: "Everything started with Minecraft modding in Java — driven by the need to change how the game worked beyond what existing mods allowed. That curiosity eventually led me to MySQL as I began storing and managing data behind my creations.",
      de: "Alles begann mit Minecraft-Modding in Java — aus dem Wunsch heraus, das Spiel über bestehende Mods hinaus zu verändern. Diese Neugier führte mich später zu MySQL, um die Daten hinter meinen eigenen Projekten zu speichern und zu verwalten.",
    },
  },
];

/** "Which languages" — rendered as terminal usage bars. */
export const skills: Skill[] = [
  { name: "TypeScript", level: 90, since: 2020 },
  { name: "Java", level: 85, since: 2014 },
  { name: "React / React Native", level: 88, since: 2021 },
  { name: "Node / NestJS", level: 82, since: 2021 },
  { name: "MongoDB", level: 75, since: 2021 },
  { name: "SQL", level: 78, since: 2015 },
];

/** Closing note — what I'm into right now / off the keyboard. */
export const now: Localized[] = [
  {
    en: "Right now, most of my energy goes into the final stretch of my Computer Science degree — that’s the clear priority. Alongside that, I’m building my own company, focused on automating repetitive and time-consuming data work that tends to drain people’s day. At its core, the pattern hasn’t really changed since my Minecraft days: find something worth building, learn whatever is missing along the way, and ship it. And yes — I use Arch, btw.",
    de: "Aktuell liegt mein Fokus auf der letzten Etappe meines Informatikstudiums – das hat klar Priorität. Parallel dazu baue ich meine eigene Firma weiter aus, mit dem Ziel, repetitive und zeitraubende Datenarbeit zu automatisieren und damit echte Entlastung im Alltag zu schaffen. Im Kern ist das Muster seit den Minecraft-Zeiten ziemlich unverändert geblieben: etwas finden, das sich zu bauen lohnt, genau das lernen, was dafür fehlt, und es dann umsetzen. Und ja — ich nutze Arch, btw.",
  },
];
