import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, locales } from "@/lib/i18n/config";

// Next.js 16 renamed `middleware` -> `proxy` (nodejs runtime). This redirects any
// locale-less path to a locale-prefixed one, and remembers the language the
// visitor is actually browsing in via a `locale` cookie so later locale-less
// URLs (and the 404) can honour their choice instead of guessing.

const LOCALE_COOKIE = "locale";
const ONE_YEAR = 60 * 60 * 24 * 365;

function isLocale(value: string | undefined): value is (typeof locales)[number] {
  return !!value && (locales as readonly string[]).includes(value);
}

// The visitor's preferred locale for a locale-less path: their last chosen
// language (cookie, set below on every locale-prefixed visit) wins over the
// browser's Accept-Language, which is the fallback for first-time visitors.
function preferredLocale(request: NextRequest): string {
  const fromCookie = request.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(fromCookie)) return fromCookie;

  const header = request.headers.get("accept-language") ?? "";
  for (const part of header.split(",")) {
    const tag = part.split(";")[0]?.trim().toLowerCase() ?? "";
    const base = tag.split("-")[0];
    if (isLocale(base)) return base;
  }
  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const current = locales.find(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );
  if (current) {
    // Remember the language the visitor is actually viewing so locale-less URLs
    // (and the not-found page) can render in their chosen language later.
    const response = NextResponse.next();
    response.cookies.set(LOCALE_COOKIE, current, {
      path: "/",
      maxAge: ONE_YEAR,
      sameSite: "lax",
    });
    return response;
  }

  const locale = preferredLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip API routes, Next internals, and any file with an extension.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|opengraph-image|.*\\..*).*)",
  ],
};
