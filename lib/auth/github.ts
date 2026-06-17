import "server-only";
import { site } from "@/lib/site";
import type { SessionUser } from "./session";

// GitHub OAuth web flow (no SDK). Register an OAuth App at
// https://github.com/settings/developers with the callback URL below.

const CLIENT_ID = process.env.GITHUB_CLIENT_ID?.trim() ?? "";
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET?.trim() ?? "";

export const isGitHubAuthConfigured = Boolean(CLIENT_ID && CLIENT_SECRET);

export const OAUTH_STATE_COOKIE = "gh_oauth_state";
const CALLBACK_PATH = "/api/auth/callback";

export function getRedirectUri(): string {
  return `${site.url}${CALLBACK_PATH}`;
}

export function getAuthorizeUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: getRedirectUri(),
    scope: "read:user",
    state,
    allow_signup: "true",
  });
  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string): Promise<string | null> {
  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      redirect_uri: getRedirectUri(),
    }),
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { access_token?: string };
  return data.access_token ?? null;
}

export async function fetchGitHubUser(token: string): Promise<SessionUser | null> {
  const res = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "terminal-portfolio",
    },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const u = (await res.json()) as {
    id: number;
    login: string;
    name: string | null;
    avatar_url: string;
  };
  return { id: u.id, login: u.login, name: u.name, avatar: u.avatar_url };
}
