import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

// The file backend resolves its data path from process.cwd() at module load and
// only picks the Neon backend when a Postgres connection string is set. We chdir
// into a throwaway temp dir and clear those env vars *before* importing the
// store, so the tests exercise the real file backend against an isolated
// visits.json.
let store: typeof import("@/lib/visits/store");
let tmp: string;
let originalCwd: string;

beforeAll(async () => {
  originalCwd = process.cwd();
  tmp = await fs.mkdtemp(path.join(os.tmpdir(), "visits-test-"));
  process.chdir(tmp);
  delete process.env.DATABASE_URL;
  delete process.env.POSTGRES_URL;
  store = await import("@/lib/visits/store");
});

afterAll(async () => {
  process.chdir(originalCwd);
  await fs.rm(tmp, { recursive: true, force: true });
});

beforeEach(async () => {
  await fs.rm(path.join(tmp, ".data"), { recursive: true, force: true });
});

describe("visits store", () => {
  it("starts at zero when nothing is persisted", async () => {
    expect(await store.getVisits()).toBe(0);
  });

  it("increments and returns the new total", async () => {
    expect(await store.recordVisit()).toBe(1);
    expect(await store.recordVisit()).toBe(2);
    expect(await store.getVisits()).toBe(2);
  });

  it("persists the count across reads (monotonic)", async () => {
    await store.recordVisit();
    await store.recordVisit();
    await store.recordVisit();
    expect(await store.getVisits()).toBe(3);
    // getVisits must not mutate.
    expect(await store.getVisits()).toBe(3);
  });
});
