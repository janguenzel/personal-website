import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// session.ts imports `cookies` from next/headers at module load; only
// getSession() actually calls it, so a tiny mock keeps the import happy while we
// exercise the pure token sign/verify logic.
vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({ get: () => undefined })),
}));

import {
  createSessionToken,
  verifySessionToken,
  type SessionUser,
} from "@/lib/auth/session";

const user: SessionUser = {
  id: 42,
  login: "octocat",
  name: "The Octocat",
  avatar: "https://example.com/a.png",
};

describe("session tokens", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("round-trips a signed token back to the user", async () => {
    const token = await createSessionToken(user);
    expect(token).toContain(".");
    await expect(verifySessionToken(token)).resolves.toEqual(user);
  });

  it("rejects an undefined or malformed token", async () => {
    await expect(verifySessionToken(undefined)).resolves.toBeNull();
    await expect(verifySessionToken("nodot")).resolves.toBeNull();
    await expect(verifySessionToken("a.")).resolves.toBeNull();
  });

  it("rejects a tampered signature", async () => {
    const token = await createSessionToken(user);
    const [body] = token.split(".");
    await expect(verifySessionToken(`${body}.deadbeef`)).resolves.toBeNull();
  });

  it("rejects a tampered payload", async () => {
    const token = await createSessionToken(user);
    const [, sig] = token.split(".");
    const forged = Buffer.from(
      JSON.stringify({ user: { ...user, id: 1 }, exp: 9999999999 }),
    ).toString("base64url");
    await expect(verifySessionToken(`${forged}.${sig}`)).resolves.toBeNull();
  });

  it("rejects an expired token", async () => {
    const token = await createSessionToken(user);
    // Jump 31 days forward — past the 30-day MAX_AGE.
    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + 31 * 24 * 60 * 60 * 1000);
    await expect(verifySessionToken(token)).resolves.toBeNull();
  });
});
