import "server-only";

// Legal / imprint details, read SERVER-SIDE ONLY from non-public env vars so the
// repo stays forkable and your real name + address never get committed to git.
// These are rendered into the (server-only, dynamic) /imprint and /privacy pages.
//
// Set them in .env.local (local) or your host's env (production). See .env.example.

function env(key: string, fallback = ""): string {
  return (process.env[key] ?? "").trim() || fallback;
}

export type ImprintData = {
  name: string;
  street: string;
  city: string;
  country: string;
  email: string;
  phone: string;
  vatId: string;
  /** Whether real legal data has been provided (vs. placeholder fallbacks). */
  configured: boolean;
};

export function getImprint(): ImprintData {
  const name = env("IMPRINT_NAME");
  return {
    name: name || "Your Name",
    street: env("IMPRINT_STREET", "Example Street 1"),
    city: env("IMPRINT_CITY", "12345 Example City"),
    country: env("IMPRINT_COUNTRY", "Germany"),
    email: env("IMPRINT_EMAIL", env("NEXT_PUBLIC_SITE_EMAIL", "mail@example.com")),
    phone: env("IMPRINT_PHONE"),
    vatId: env("IMPRINT_VAT_ID"),
    configured: Boolean(name),
  };
}
