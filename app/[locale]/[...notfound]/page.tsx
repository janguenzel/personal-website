import { notFound } from "next/navigation";

// Catch-all for any path under a locale that doesn't match a real route
// (e.g. /en/does-not-exist). It immediately triggers the locale-aware not-found
// boundary (app/[locale]/not-found.tsx), which renders inside the terminal chrome
// with the right language and clickable destinations. Because proxy.ts redirects
// every locale-less path into a /[locale]/… path first, this also covers bare
// unmatched URLs — so we don't need the experimental `globalNotFound`.
export default function CatchAllNotFound(): never {
  notFound();
}
