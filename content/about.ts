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
    en: `I'm Jan, a ${age}-year-old developer from Germany. A lot of the time I'm heads-down on my own, but just as often I'm building something with a small group of friends I've worked with for years. That rhythm — focused solo stretches, then bouncing ideas off people I trust — is exactly how I like to work.`,
    de: `Ich bin Jan, ein ${age} Jahre alter Entwickler aus Deutschland. Oft sitze ich konzentriert für mich allein an etwas, aber genauso oft baue ich zusammen mit ein paar Freunden, mit denen ich seit Jahren arbeite. Genau dieser Rhythmus — konzentrierte Solo-Phasen und dann Ideen mit Leuten austauschen, denen ich vertraue — ist meine Art zu arbeiten.`,
  },
  {
    en: "What keeps me going is simple: try something new, learn from it, keep moving. I'd rather pick up an unfamiliar tool and figure it out the hard way than stay in my comfort zone — so there's almost always some half-finished experiment running in the background.",
    de: "Was mich antreibt, ist simpel: etwas Neues ausprobieren, daraus lernen, weitermachen. Lieber schnappe ich mir ein unbekanntes Tool und beiße mich durch, als in der Komfortzone zu bleiben — deshalb läuft im Hintergrund fast immer irgendein halbfertiges Experiment.",
  },
];

/** "How I started coding and why." */
export const origin: Localized[] = [
  {
    en: "Like a lot of people in tech, my path into computers started with games — and one in particular pointed me toward code: Minecraft, built in Java. You could hop between servers or spin up your own, play with friends, and — the part that really hooked me — bend the game to your will with client- and server-side mods.",
    de: "Wie bei vielen in der Tech-Welt fing mein Weg zum Computer bei Spielen an — und eines im Besonderen brachte mich zum Programmieren: Minecraft, gebaut in Java. Man konnte zwischen Servern springen oder einen eigenen aufsetzen, mit Freunden zocken und — der Teil, der mich wirklich gepackt hat — das Spiel mit client- und serverseitigen Mods nach Belieben verbiegen.",
  },
  {
    en: "The thing was, the mods out there never did quite what I had in mind — there was always something I'd have built differently or added. So I started following YouTube tutorials to make my own. They were all in Java, which is how I picked up the language in the first place: by chasing the mods I could already picture in my head. It took a while, but eventually I didn't need the videos anymore — StackOverflow and I got to know each other very well, though :D.",
    de: "Das Ding war: Die vorhandenen Mods taten nie ganz das, was ich im Kopf hatte — es gab immer etwas, das ich anders gebaut oder ergänzt hätte. Also habe ich angefangen, YouTube-Tutorials zu folgen, um meine eigenen zu bauen. Die waren alle in Java — genau so habe ich die Sprache überhaupt gelernt: indem ich den Mods nachgejagt bin, die ich schon vor Augen hatte. Es hat eine Weile gedauert, aber irgendwann brauchte ich die Videos nicht mehr — StackOverflow und ich haben uns dafür allerdings ziemlich gut kennengelernt :D.",
  },
  {
    en: "Before long I needed somewhere to keep all the player data my mods were generating, so I taught myself MySQL — the go-to recommendation back then. That loop has driven pretty much everything since: I want something to exist, so I learn whatever it takes to build it.",
    de: "Schon bald brauchte ich einen Ort für all die Spielerdaten, die meine Mods erzeugten, also habe ich mir MySQL beigebracht — damals die Standard-Empfehlung. Diese Schleife treibt seitdem im Grunde alles an: Ich will, dass etwas existiert, also lerne ich, was nötig ist, um es zu bauen.",
  },
];

/** "How I developed" — a git-log-style journey. Newest first. */
export const timeline: TimelineEntry[] = [
  {
    when: "now",
    title: {
      en: "finishing my CS degree — and a company on the side",
      de: "Studium auf der Zielgeraden — und nebenbei eine eigene Firma",
    },
    body: {
      en: "My main focus right now is wrapping up a Bachelor's in Computer Science and getting the theory properly under my belt. The degree keeps pulling me into deep dives — most recently machine learning, where I wrote a whole paper on the Netflix Prize and recommender systems more broadly. Alongside it I run my own company focused on data automation, which keeps the hands-on side sharp. Solo when it counts, with friends when it's better that way.",
      de: "Mein Fokus liegt gerade darauf, meinen Bachelor in Informatik abzuschließen und die Theorie sauber zu verinnerlichen. Das Studium zieht mich immer wieder in Deep Dives — zuletzt ins Machine Learning, wo ich eine ganze Arbeit über den Netflix Prize und Recommender-Systeme im Allgemeinen geschrieben habe. Nebenbei führe ich meine eigene Firma mit Fokus auf Datenautomatisierung, was die praktische Seite scharf hält. Allein, wenn es zählt, mit Freunden, wenn es so besser ist.",
    },
  },
  {
    when: "2022",
    title: {
      en: "agency work for names you'd recognise",
      de: "Agenturarbeit für bekannte Namen",
    },
    body: {
      en: "Several websites and web apps for well-known German brands, plus a long-running lead distribution & aggregation platform — a per-employee dashboard where I was the main coordinator between our client and an external dev team in India.",
      de: "Mehrere Websites und Web-Apps für bekannte deutsche Marken, dazu eine langlaufende Plattform zur Lead-Verteilung und -Aggregation — ein Dashboard pro Mitarbeiter, bei dem ich die zentrale Schnittstelle zwischen unserem Kunden und einem externen Dev-Team in Indien war.",
    },
  },
  {
    when: "2021",
    title: {
      en: "thrown in at the deep end at an agency",
      de: "ins kalte Wasser geworfen — bei einer Agentur",
    },
    body: {
      en: "Joined an agency and spent my first year as the second / taking-over dev on an app called TrainYourTown. Getting thrown in at the deep end turned out to be the best thing that could've happened — React Native, TypeScript, NestJS, microservices, MongoDB and cloud providers like Firebase, all at once.",
      de: "Bei einer Agentur eingestiegen und mein erstes Jahr als zweiter bzw. übernehmender Entwickler an einer App namens TrainYourTown verbracht. Ins kalte Wasser geworfen zu werden, war das Beste, was passieren konnte — React Native, TypeScript, NestJS, Microservices, MongoDB und Cloud-Anbieter wie Firebase, alles auf einmal.",
    },
  },
  {
    when: "2019",
    title: {
      en: "CS-focused Gymnasium & first real teamwork",
      de: "Gymnasium mit Info-Schwerpunkt & erste echte Teamarbeit",
    },
    body: {
      en: "Switched to a Gymnasium with a computer-science focus — Java again, but this time a real understanding of data structures and a first taste of time complexity. With two classmates I did an internship building fleet-control software: Angular with a Spring Boot backend, Docker and OpenShift.",
      de: "Auf ein Gymnasium mit Informatik-Schwerpunkt gewechselt — wieder Java, aber diesmal mit echtem Verständnis für Datenstrukturen und einem ersten Gefühl für Zeitkomplexität. Mit zwei Mitschülern habe ich ein Praktikum gemacht und eine Flottensteuerungs-Software gebaut: Angular mit Spring-Boot-Backend, Docker und OpenShift.",
    },
  },
  {
    when: "2016",
    title: {
      en: "a detour into the web",
      de: "ein Abstecher ins Web",
    },
    body: {
      en: "Tried something new with HTML, CSS and JavaScript and put together some beginner sites with Bootstrap. I learned two things fast: the web is fun, and visual design is not my strong suit.",
      de: "Etwas Neues mit HTML, CSS und JavaScript ausprobiert und ein paar Anfänger-Seiten mit Bootstrap zusammengebaut. Zwei Dinge habe ich schnell gelernt: Das Web macht Spaß — und visuelles Design ist nicht meine Stärke.",
    },
  },
  {
    when: "2014",
    title: {
      en: "first lines of Java, for Minecraft",
      de: "erste Zeilen Java, für Minecraft",
    },
    body: {
      en: "Where it all started: writing my own Minecraft mods in Java because no existing one did exactly what I wanted, then picking up MySQL to store the user data behind them.",
      de: "Wo alles begann: eigene Minecraft-Mods in Java schreiben, weil keine vorhandene genau das tat, was ich wollte, und danach MySQL lernen, um die Nutzerdaten dahinter zu speichern.",
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
    en: "Right now most of my energy goes into the last stretch of my CS degree — that's the focus. Around it I run my own company, automating the boring, repetitive data work that eats people's days. The pattern from the Minecraft days hasn't really changed: find something worth building, learn whatever's missing, ship it. And yes — I use Arch, btw.",
    de: "Aktuell fließt der Großteil meiner Energie in die letzte Etappe meines Informatikstudiums — das ist der Fokus. Drumherum führe ich meine eigene Firma und automatiere die langweilige, sich wiederholende Datenarbeit, die Leuten den Tag frisst. Das Muster aus Minecraft-Zeiten hat sich nicht wirklich geändert: etwas finden, das es zu bauen lohnt, lernen, was fehlt, und es ausliefern. Und ja — ich nutze Arch, btw.",
  },
];
