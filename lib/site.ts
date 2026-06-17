// Public, forkable site configuration.
//
// Everything here is safe to expose to the browser (it powers SEO tags and the
// fastfetch landing). Fork this repo, set the NEXT_PUBLIC_* env vars (see
// .env.example), and the whole site re-themes around you — no code changes.
//
// Private/legal details (real name, postal address) live in lib/imprint.ts and
// are read server-side only, so they never get committed or shipped to clients.

// NOTE: each NEXT_PUBLIC_* var MUST be read as a *static* member access
// (`process.env.NEXT_PUBLIC_FOO`) — never `process.env[key]`. Next.js only
// inlines public env vars into the client bundle when it can textually match
// the static reference at build time; dynamic lookups are NOT inlined and
// resolve to `undefined` in the browser, causing hydration mismatches between
// the server (real env) and client (fallbacks). See
// node_modules/next/dist/docs/01-app/02-guides/environment-variables.md.
function env(value: string | undefined, fallback = ""): string {
  return (value ?? "").trim() || fallback;
}

function list(value: string | undefined, fallback: string[]): string[] {
  const raw = env(value);
  if (!raw) return fallback;
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export const site = {
  /** Canonical absolute URL, no trailing slash. Used for SEO + OAuth redirects. */
  url: env(process.env.NEXT_PUBLIC_SITE_URL, "http://localhost:3000").replace(
    /\/$/,
    "",
  ),
  /** Display name shown in the title bar / fastfetch / metadata. */
  name: env(process.env.NEXT_PUBLIC_SITE_NAME, "John Doe"),
  /** Shell-style username for the prompt, e.g. visitor@<host>. */
  host: env(process.env.NEXT_PUBLIC_SITE_HOST, "portfolio"),
  user: env(process.env.NEXT_PUBLIC_SITE_USER, "visitor"),
  role: env(process.env.NEXT_PUBLIC_SITE_ROLE, "Software Engineer"),
  location: env(process.env.NEXT_PUBLIC_SITE_LOCATION, "Earth"),
  /** Public contact address shown on the landing page. */
  email: env(process.env.NEXT_PUBLIC_SITE_EMAIL, "john.doe@example.com"),
  githubUser: env(process.env.NEXT_PUBLIC_GITHUB_USER, "octocat"),
  twitterHandle: env(process.env.NEXT_PUBLIC_TWITTER_HANDLE, ""),
  linkedin: env(process.env.NEXT_PUBLIC_LINKEDIN_URL, ""),
  /** Fastfetch flavour text. */
  distro: env(
    process.env.NEXT_PUBLIC_SITE_DISTRO,
    "PortfolioOS 1.0 (terminal edition)",
  ),
  shell: env(process.env.NEXT_PUBLIC_SITE_SHELL, "zsh"),
  editor: env(process.env.NEXT_PUBLIC_SITE_EDITOR, "vscode, neovim"),
  languages: list(process.env.NEXT_PUBLIC_SITE_LANGUAGES, [
    "TypeScript",
    "Rust",
    "Python",
  ]),
  stack: list(process.env.NEXT_PUBLIC_SITE_STACK, [
    "Next.js",
    "React",
    "Node.js",
    "Nest.js",
    "PostgreSQL",
    "Docker",
  ]),
  /** ISO date you started coding — drives the fastfetch "uptime" counter. */
  codingSince: env(process.env.NEXT_PUBLIC_CODING_SINCE, "2015-01-01"),
} as const;

export type SiteConfig = typeof site;

export const socials = {
  github: site.githubUser ? `https://github.com/${site.githubUser}` : "",
  twitter: site.twitterHandle
    ? `https://twitter.com/${site.twitterHandle.replace(/^@/, "")}`
    : "",
  linkedin: site.linkedin,
  email: site.email ? `mailto:${site.email}` : "",
};
