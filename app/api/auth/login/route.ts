import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import {
  OAUTH_STATE_COOKIE,
  getAuthorizeUrl,
  isGitHubAuthConfigured,
} from "@/lib/auth/github";
import { defaultLocale, hasLocale } from "@/lib/i18n/config";
import { localePath } from "@/lib/nav";
import { site } from "@/lib/site";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const param = url.searchParams.get("locale") ?? defaultLocale;
  const locale = hasLocale(param) ? param : defaultLocale;
  const boardUrl = `${site.url}${localePath(locale, "board")}`;

  if (!isGitHubAuthConfigured) {
    return NextResponse.redirect(boardUrl);
  }

  // Never 500 the login entry point: fall back to the board on any failure.
  try {
    const state = crypto.randomUUID();
    const store = await cookies();
    // Pack the return locale into the state cookie so the callback can use it.
    store.set(OAUTH_STATE_COOKIE, `${state}:${locale}`, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 600,
    });

    return NextResponse.redirect(getAuthorizeUrl(state));
  } catch (err) {
    console.error("[auth/login] failed to start sign-in:", err);
    return NextResponse.redirect(`${boardUrl}?auth=error`);
  }
}
