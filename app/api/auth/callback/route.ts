import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import {
  OAUTH_STATE_COOKIE,
  exchangeCodeForToken,
  fetchGitHubUser,
} from "@/lib/auth/github";
import {
  SESSION_COOKIE,
  createSessionToken,
  sessionCookieOptions,
} from "@/lib/auth/session";
import { defaultLocale, hasLocale } from "@/lib/i18n/config";
import { localePath } from "@/lib/nav";
import { site } from "@/lib/site";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const returnedState = url.searchParams.get("state");

  const store = await cookies();
  const stored = store.get(OAUTH_STATE_COOKIE)?.value ?? "";
  const [savedState, savedLocale] = stored.split(":");
  const locale = hasLocale(savedLocale ?? "") ? savedLocale : defaultLocale;
  const boardUrl = `${site.url}${localePath(locale, "board")}`;

  store.delete(OAUTH_STATE_COOKIE);

  // Verify the CSRF state before doing anything with the code.
  if (!code || !returnedState || !savedState || returnedState !== savedState) {
    return NextResponse.redirect(boardUrl);
  }

  // Any unexpected failure here (e.g. a missing AUTH_SECRET, a GitHub outage)
  // must degrade to the board with an error flag rather than a raw 500.
  try {
    const token = await exchangeCodeForToken(code);
    if (!token) return NextResponse.redirect(`${boardUrl}?auth=error`);

    const user = await fetchGitHubUser(token);
    if (!user) return NextResponse.redirect(`${boardUrl}?auth=error`);

    const session = await createSessionToken(user);
    store.set(SESSION_COOKIE, session, sessionCookieOptions);

    return NextResponse.redirect(boardUrl);
  } catch (err) {
    console.error("[auth/callback] sign-in failed:", err);
    return NextResponse.redirect(`${boardUrl}?auth=error`);
  }
}
