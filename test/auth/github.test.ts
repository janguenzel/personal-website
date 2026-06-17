import { afterEach, describe, expect, it, vi } from "vitest";
import {
  exchangeCodeForToken,
  fetchGitHubUser,
  getAuthorizeUrl,
  getRedirectUri,
  OAUTH_STATE_COOKIE,
} from "@/lib/auth/github";

// github.ts is the hand-rolled GitHub OAuth web flow (no SDK). The URL builders
// are pure; the token exchange and user fetch hit the network, so we stub the
// global fetch to cover both the happy path and the failure → null path.
function jsonResponse(body: unknown, ok = true): Response {
  return {
    ok,
    json: async () => body,
  } as unknown as Response;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("OAuth URL builders", () => {
  it("derives the callback redirect URI from the site URL", () => {
    const uri = getRedirectUri();
    expect(uri.endsWith("/api/auth/callback")).toBe(true);
    expect(uri.startsWith("http")).toBe(true);
  });

  it("builds an authorize URL with the expected params", () => {
    const url = new URL(getAuthorizeUrl("csrf-state-123"));
    expect(url.origin + url.pathname).toBe(
      "https://github.com/login/oauth/authorize",
    );
    expect(url.searchParams.get("scope")).toBe("read:user");
    expect(url.searchParams.get("state")).toBe("csrf-state-123");
    expect(url.searchParams.get("allow_signup")).toBe("true");
    expect(url.searchParams.get("redirect_uri")).toBe(getRedirectUri());
  });

  it("exposes a stable CSRF state cookie name", () => {
    expect(OAUTH_STATE_COOKIE).toBe("gh_oauth_state");
  });
});

describe("exchangeCodeForToken", () => {
  it("returns the access token on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({ access_token: "gho_abc" })),
    );
    await expect(exchangeCodeForToken("code")).resolves.toBe("gho_abc");
  });

  it("returns null when GitHub responds with an error status", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({}, false)));
    await expect(exchangeCodeForToken("code")).resolves.toBeNull();
  });

  it("returns null when the response omits an access token", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ error: "bad" })));
    await expect(exchangeCodeForToken("code")).resolves.toBeNull();
  });
});

describe("fetchGitHubUser", () => {
  it("maps the GitHub user payload to a SessionUser", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({
          id: 7,
          login: "octocat",
          name: "The Octocat",
          avatar_url: "https://example.com/a.png",
        }),
      ),
    );
    await expect(fetchGitHubUser("token")).resolves.toEqual({
      id: 7,
      login: "octocat",
      name: "The Octocat",
      avatar: "https://example.com/a.png",
    });
  });

  it("returns null when the user request fails", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({}, false)));
    await expect(fetchGitHubUser("token")).resolves.toBeNull();
  });
});
