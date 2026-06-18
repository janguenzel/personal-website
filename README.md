# personal-website — Terminal Portfolio

[![CI](https://github.com/janguenzel/personal-website/actions/workflows/ci.yml/badge.svg)](https://github.com/janguenzel/personal-website/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

A personal website written in **Next.js 16** with **Tailwind CSS v4** and **Framer Motion**, dressed
up as a **tabbed terminal emulator**. Every tab is a real route, navigation is keyboard-first with an
interactive prompt and a command palette, and the whole thing is bilingual (English / German),
themeable (dark + light + extra color schemes), and full of tasteful, reduced-motion-safe animation.

## Fork it & make it yours

Like it? **Fork it.** This project is intentionally built to be forkable — nothing personal is
committed to the repo. All public details (name, role, socials, fastfetch text) come from
`NEXT_PUBLIC_*` env vars, and legal/imprint data comes from server-only env vars, so the whole site
re-themes around you without touching a line of code.

It's released under the [MIT License](./LICENSE), so you're free to use, copy, modify, extend,
publish, and distribute it for your own purposes — personal or commercial. Just keep the copyright
notice. Go build your own terminal portfolio. 🚀

And if this made you smile or saved you some time — **drop a ⭐ on the repo**. It costs you one click
and genuinely makes my day. Thank you! 😊

## Getting started

Once you've cloned the repo:

```bash
npm install          # install dependencies

cp .env.example .env # then fill in the values (see "Environment variables" below)

npm run dev          # start the dev server at http://localhost:3000
```

Other useful scripts:

```bash
npm run build        # production build (run this before declaring done)
npm run start        # serve the production build
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm test             # run the Vitest unit + component suite
npm run test:watch   # Vitest in watch mode
npm run test:coverage # coverage report (./coverage)
```

> **Note:** Next.js 16 has breaking changes vs. older versions. The bundled guides under
> `node_modules/next/dist/docs/` are the source of truth.

## Environment variables

Copy `.env.example` to `.env` (local) or set these in your host's environment (production). Everything
has a sensible fallback, so the site runs out of the box — the values below just personalize it and
enable the optional GitHub message board.

### Public site config (`NEXT_PUBLIC_*`)

Safe to expose to the browser. Powers SEO tags, the title bar, and the fastfetch landing.

| Variable                     | Description                                                        | Default                                           |
| ---------------------------- | ------------------------------------------------------------------ | ------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`       | Canonical absolute URL, no trailing slash (SEO + OAuth redirects). | `http://localhost:3000`                           |
| `NEXT_PUBLIC_SITE_NAME`      | Display name in the title bar / metadata.                          | `Jan Henning Günzel`                              |
| `NEXT_PUBLIC_SITE_HOST`      | Shell-style host for the prompt (`user@host`).                     | `jan-guenzel`                                     |
| `NEXT_PUBLIC_SITE_USER`      | Shell-style username for the prompt.                               | `visitor`                                         |
| `NEXT_PUBLIC_SITE_ROLE`      | Your role, shown in fastfetch.                                     | `Software Engineer`                               |
| `NEXT_PUBLIC_SITE_LOCATION`  | Your location, shown in fastfetch.                                 | `Germany`                                         |
| `NEXT_PUBLIC_SITE_EMAIL`     | Public contact address on the landing page.                        | `contact@jan-guenzel.de`                          |
| `NEXT_PUBLIC_GITHUB_USER`    | GitHub username (links + socials).                                 | `janguenzel`                                      |
| `NEXT_PUBLIC_TWITTER_HANDLE` | Twitter/X handle (empty = hidden).                                 | _empty_                                           |
| `NEXT_PUBLIC_LINKEDIN_URL`   | Full LinkedIn profile URL (empty = hidden).                        | _empty_                                           |
| `NEXT_PUBLIC_SITE_DISTRO`    | Fastfetch "OS" flavour text.                                       | `PortfolioOS 1.0 (terminal edition)`              |
| `NEXT_PUBLIC_SITE_SHELL`     | Fastfetch shell value.                                             | `zsh`                                             |
| `NEXT_PUBLIC_SITE_EDITOR`    | Fastfetch editor value.                                            | `vscode, neovim`                                  |
| `NEXT_PUBLIC_SITE_LANGUAGES` | Comma-separated languages for fastfetch.                           | `TypeScript,Rust,Python`                          |
| `NEXT_PUBLIC_SITE_STACK`     | Comma-separated stack for fastfetch.                               | `Next.js,React,Node.js,Nest.js,PostgreSQL,Docker` |
| `NEXT_PUBLIC_CODING_SINCE`   | ISO date you started coding (drives the fastfetch "uptime").       | `2015-01-01`                                      |

### Legal / imprint config (server-only)

Read server-side only and rendered into the `/imprint` and `/privacy` pages (both `noindex`), so your
real name and address never get committed or shipped to clients. Until `IMPRINT_NAME` is set,
placeholder values are shown.

| Variable          | Description                                                      |
| ----------------- | ---------------------------------------------------------------- |
| `IMPRINT_NAME`    | Your legal name. Setting this marks the imprint as "configured". |
| `IMPRINT_STREET`  | Street address.                                                  |
| `IMPRINT_CITY`    | Postal code + city.                                              |
| `IMPRINT_COUNTRY` | Country.                                                         |
| `IMPRINT_EMAIL`   | Contact email (falls back to `NEXT_PUBLIC_SITE_EMAIL`).          |
| `IMPRINT_PHONE`   | Phone number (optional).                                         |
| `IMPRINT_VAT_ID`  | VAT ID (optional).                                               |

### Auth & message board (optional)

The GitHub-authenticated message board only activates when these are set. Leave them empty to run the
site without the board.

| Variable               | Description                                                                                                                                                                                                                   |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AUTH_SECRET`          | Secret used to sign the HMAC-SHA256 session cookie. Use a long random string.                                                                                                                                                 |
| `GITHUB_CLIENT_ID`     | OAuth app client ID ([create one here](https://github.com/settings/developers)).                                                                                                                                              |
| `GITHUB_CLIENT_SECRET` | OAuth app client secret.                                                                                                                                                                                                      |
| `DATABASE_URL`         | Neon Postgres connection string for board + visit storage in production. Auto-injected by Vercel once a Neon database is connected (`POSTGRES_URL` is also accepted); unset, the board uses a local JSON file under `.data/`. |

For the GitHub OAuth app, set the **Authorization callback URL** to
`<NEXT_PUBLIC_SITE_URL>/api/auth/callback`.

## How it works

A bit more detail on what's under the hood:

- **Routing = tabs.** Each terminal "tab" is a real Next.js route under `app/[locale]/…`, not a
  client-only SPA view. `proxy.ts` (Next 16's middleware) redirects locale-less paths to
  `/[locale]/…`, and the `[locale]` layout wraps every page in the terminal chrome (title bar, tab
  strip, status bar). `lib/nav.ts` is the single source of truth for tabs — the TabBar, command
  palette, hotkeys, and sitemap all derive from it.
- **Server-first.** Pages are React Server Components that read locale dictionaries directly.
  Interactive pieces (the shell, board, palette, effects) are client components with a low boundary.
- **Dual navigation.** Click tabs _or_ drive everything from the keyboard: `⌘/Ctrl+K` opens the
  command palette, `Ctrl+]`/`[` switch tabs, `g`+number jumps, `⌘/Ctrl+J` toggles the theme,
  `Ctrl+.` cycles the color scheme, `?` shows help, and `L` swaps the language. (Browser-reserved
  combos are deliberately avoided.)
- **i18n.** Custom, route-based i18n. Every user-facing string is a key present in **both**
  `lib/i18n/dictionaries/en.json` and `de.json`, kept at full parity. German is natural and informal
  ("du").
- **Theming.** All colors are CSS-variable tokens (no inline hex). Light/dark via `data-theme`, four
  named color schemes via `data-scheme`, applied pre-paint by a no-FOUC inline script and persisted
  to localStorage + cookie.
- **Auth & board.** A hand-rolled GitHub OAuth web flow (zero auth deps) sets a signed httpOnly
  session cookie via Web Crypto. The message board lives behind a pluggable backend — a local JSON
  file in dev, Neon Postgres (via `@neondatabase/serverless`) in production — with a per-user post
  cooldown and edit/delete of your own messages.
- **Animation & gimmicks.** A boot-style typewriter intro, blinking block cursor, glitch-on-hover
  ASCII, CRT scanline toggle, matrix rain (Konami code), and `motion` transitions — every effect is
  gated behind `prefers-reduced-motion` and degrades to a calm static fallback.
- **SEO & a11y.** Per-page metadata with canonical + hreflang alternates, a sitemap, robots, per-locale
  OpenGraph images, and JSON-LD. Route tabs are real links with `aria-current`, overlays are proper
  dialogs, focus is visible, and contrast meets WCAG AA in both themes.

### Tech stack

| Concern   | Choice                                               |
| --------- | ---------------------------------------------------- |
| Framework | Next.js 16 (App Router / RSC, Turbopack)             |
| UI        | React 19                                             |
| Language  | TypeScript (strict)                                  |
| Styling   | Tailwind CSS v4 (CSS-first `@theme`, no config file) |
| State     | Zustand                                              |
| Animation | Framer Motion (`motion`) + CSS + canvas              |
| i18n      | Custom, route-based                                  |
| Auth      | Hand-rolled GitHub OAuth (Web Crypto signed cookie)  |
| Storage   | JSON file (dev) / Neon Postgres (prod)               |
| Tests     | Vitest + React Testing Library (jsdom)               |

### Project layout

```
proxy.ts        # Next 16 middleware: locale redirect (cookie/Accept-Language) + locale cookie
app/            # routes (one per terminal tab) + API routes, sitemap, robots, OG images
components/     # terminal shell, fastfetch, board, about, ui, effects
lib/            # i18n, store, hooks, themes, nav, site/imprint config, auth, board
content/        # projects + about bio (the only place to edit your content)
test/           # Vitest unit + component tests
```

Forking? Start with `lib/site.ts` env vars and `content/{projects,about}.ts` — that's where your
identity and work live.

---

Licensed under [MIT](./LICENSE).
