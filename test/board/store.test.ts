import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { NewMessage } from "@/lib/board/types";

// The file backend resolves its data path from process.cwd() at module load and
// picks the Neon backend only when a Postgres connection string is set. We chdir
// into a throwaway temp dir and clear those env vars *before* importing the
// store, so the tests exercise the real file backend against an isolated
// board.json.
let store: typeof import("@/lib/board/store");
let tmp: string;
let originalCwd: string;

const base: NewMessage = {
  userId: 1,
  login: "octocat",
  name: "The Octocat",
  avatar: "https://example.com/a.png",
  text: "hello world",
};

beforeAll(async () => {
  originalCwd = process.cwd();
  tmp = await fs.mkdtemp(path.join(os.tmpdir(), "board-test-"));
  process.chdir(tmp);
  delete process.env.DATABASE_URL;
  delete process.env.POSTGRES_URL;
  store = await import("@/lib/board/store");
});

afterAll(async () => {
  process.chdir(originalCwd);
  await fs.rm(tmp, { recursive: true, force: true });
});

beforeEach(async () => {
  // Reset the board between tests.
  await fs.rm(path.join(tmp, ".data"), { recursive: true, force: true });
});

describe("board store (file backend)", () => {
  it("reports the file backend", () => {
    expect(store.boardBackend).toBe("file");
  });

  it("returns an empty list and zeroed stats with no data", async () => {
    expect(await store.listMessages()).toEqual([]);
    expect(await store.getStats()).toEqual({ total: 0, uniqueUsers: 0 });
  });

  it("adds a message and reads it back newest-first", async () => {
    const a = await store.addMessage({ ...base, text: "first" });
    const b = await store.addMessage({ ...base, text: "second" });
    expect(a.id).toBeTruthy();
    expect(a.createdAt).toBeTruthy();
    const list = await store.listMessages();
    expect(list.map((m) => m.text)).toEqual(["second", "first"]);
    expect(list[0].id).toBe(b.id);
  });

  it("counts unique users by GitHub id", async () => {
    await store.addMessage({ ...base, userId: 1 });
    await store.addMessage({ ...base, userId: 1 });
    await store.addMessage({ ...base, userId: 2 });
    expect(await store.getStats()).toEqual({ total: 3, uniqueUsers: 2 });
  });

  it("returns messages and stats together in one call", async () => {
    expect(await store.listMessagesWithStats()).toEqual({
      messages: [],
      stats: { total: 0, uniqueUsers: 0 },
    });
    await store.addMessage({ ...base, userId: 1, text: "first" });
    await store.addMessage({ ...base, userId: 2, text: "second" });
    const { messages, stats } = await store.listMessagesWithStats();
    expect(messages.map((m) => m.text)).toEqual(["second", "first"]);
    expect(stats).toEqual({ total: 2, uniqueUsers: 2 });
  });

  it("respects the limit argument", async () => {
    await store.addMessage({ ...base, text: "a" });
    await store.addMessage({ ...base, text: "b" });
    expect(await store.listMessages(1)).toHaveLength(1);
  });

  it("updates only the owner's message and stamps editedAt", async () => {
    const msg = await store.addMessage(base);
    expect(await store.updateMessage(msg.id, 999, "nope")).toBeNull();
    const updated = await store.updateMessage(msg.id, base.userId, "edited");
    expect(updated?.text).toBe("edited");
    expect(updated?.editedAt).toBeTruthy();
  });

  it("deletes only the owner's message", async () => {
    const msg = await store.addMessage(base);
    expect(await store.deleteMessage(msg.id, 999)).toBe(false);
    expect(await store.deleteMessage(msg.id, base.userId)).toBe(true);
    expect(await store.listMessages()).toEqual([]);
  });

  it("tracks the last post timestamp per user", async () => {
    expect(await store.lastPostAt(1)).toBeNull();
    const msg = await store.addMessage({ ...base, userId: 1 });
    expect(await store.lastPostAt(1)).toBe(msg.createdAt);
    expect(await store.lastPostAt(2)).toBeNull();
  });
});
