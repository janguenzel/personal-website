import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { NeonQueryFunction } from "@neondatabase/serverless";
import {
  type BoardMessage,
  type BoardStats,
  type NewMessage,
  BOARD_PAGE_SIZE,
  MAX_MESSAGES,
} from "./types";

// Pluggable persistence behind a small CRUD interface:
//   - default: a JSON file under .data/ (works instantly with `npm run dev`, no
//     database required).
//   - production: Neon Postgres (a serverless Postgres provider available in the
//     Vercel Marketplace) via @neondatabase/serverless, used when a connection
//     string is present — Vercel injects DATABASE_URL automatically once a Neon
//     database is connected to the project.
//
// The file backend keeps the board as a single JSON document and does read →
// mutate → write; the Neon backend issues row-level SQL so concurrent writers
// don't clobber each other and stats are computed in the database.

interface Backend {
  list(limit: number): Promise<BoardMessage[]>;
  /**
   * One page of messages, newest-first. When `before` (an ISO createdAt cursor)
   * is given, only messages older than it are returned — this is the
   * infinite-scroll path. Cursor-based (not offset) so a post landing at the top
   * mid-session never shifts the window and duplicates/skips an older message.
   */
  page(limit: number, before?: string): Promise<BoardMessage[]>;
  /**
   * Messages + stats in a single backend round-trip. The board page and the
   * board GET endpoint need both; fetching them together avoids a second file
   * read / Neon query. Stats are exact because inserts cap the table at
   * MAX_MESSAGES, so `limit = MAX_MESSAGES` always returns the full set.
   */
  listWithStats(limit: number): Promise<{
    messages: BoardMessage[];
    stats: BoardStats;
  }>;
  insert(message: BoardMessage): Promise<void>;
  update(
    id: string,
    userId: number,
    text: string,
    editedAt: string,
  ): Promise<BoardMessage | null>;
  remove(id: string, userId: number): Promise<boolean>;
  lastPostAt(userId: number): Promise<string | null>;
  stats(): Promise<BoardStats>;
}

function makeMessage(input: NewMessage): BoardMessage {
  return {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    userId: input.userId,
    login: input.login,
    name: input.name,
    avatar: input.avatar,
    text: input.text,
    createdAt: new Date().toISOString(),
  };
}

// ── File-backed backend (development default) ────────────────────────────────
const DATA_FILE = path.join(process.cwd(), ".data", "board.json");

async function readAll(): Promise<BoardMessage[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as { messages?: BoardMessage[] };
    return parsed.messages ?? [];
  } catch {
    return [];
  }
}

async function writeAll(messages: BoardMessage[]): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify({ messages }, null, 2), "utf8");
}

const fileBackend: Backend = {
  async list(limit) {
    return (await readAll()).slice(0, limit);
  },
  async page(limit, before) {
    // readAll() is already newest-first (insert prepends), so filtering then
    // slicing keeps the newest of the remaining older messages.
    const all = await readAll();
    const older = before ? all.filter((m) => m.createdAt < before) : all;
    return older.slice(0, limit);
  },
  async listWithStats(limit) {
    const all = await readAll();
    return { messages: all.slice(0, limit), stats: computeStats(all) };
  },
  async insert(message) {
    const messages = await readAll();
    await writeAll([message, ...messages].slice(0, MAX_MESSAGES));
  },
  async update(id, userId, text, editedAt) {
    const messages = await readAll();
    const index = messages.findIndex((m) => m.id === id && m.userId === userId);
    if (index === -1) return null;
    const updated: BoardMessage = { ...messages[index], text, editedAt };
    messages[index] = updated;
    await writeAll(messages);
    return updated;
  },
  async remove(id, userId) {
    const messages = await readAll();
    const next = messages.filter((m) => !(m.id === id && m.userId === userId));
    if (next.length === messages.length) return false;
    await writeAll(next);
    return true;
  },
  async lastPostAt(userId) {
    let latest: string | null = null;
    for (const m of await readAll()) {
      if (m.userId !== userId) continue;
      if (!latest || m.createdAt > latest) latest = m.createdAt;
    }
    return latest;
  },
  async stats() {
    return computeStats(await readAll());
  },
};

// ── Neon Postgres backend (production) ───────────────────────────────────────
const DATABASE_URL = (
  process.env.DATABASE_URL ?? process.env.POSTGRES_URL
)?.trim();

// Memoised query client + one-time schema creation. The HTTP driver is loaded
// dynamically so the file-backend path never pulls it in.
let sqlClient: NeonQueryFunction<false, false> | null = null;
let schemaReady: Promise<void> | null = null;

async function getClient(): Promise<NeonQueryFunction<false, false>> {
  if (!sqlClient) {
    const { neon } = await import("@neondatabase/serverless");
    sqlClient = neon(DATABASE_URL!);
  }
  return sqlClient;
}

// Schema setup is only awaited on writes — reads stay off this path so a cold
// board load isn't blocked behind two serialized DDL round-trips. The table is
// created on the first write; reads before then simply degrade to empty (see
// `readQuery`). Memoised, so it runs at most once per process.
async function getSqlForWrite(): Promise<NeonQueryFunction<false, false>> {
  const sql = await getClient();
  schemaReady ??= (async () => {
    await sql`
      CREATE TABLE IF NOT EXISTS board_messages (
        id         text PRIMARY KEY,
        user_id    bigint NOT NULL,
        login      text NOT NULL,
        name       text,
        avatar     text NOT NULL,
        text       text NOT NULL,
        created_at timestamptz NOT NULL,
        edited_at  timestamptz
      )
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS board_messages_created_at_idx
        ON board_messages (created_at DESC)
    `;
  })();
  await schemaReady;
  return sql;
}

// Run a read query, degrading to `fallback` on any error (e.g. the table not
// existing yet on a brand-new database). Mirrors the file backend's `readAll`,
// which already swallows read errors and returns an empty board.
async function readQuery<T>(
  run: (sql: NeonQueryFunction<false, false>) => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await run(await getClient());
  } catch (err) {
    console.warn("[board] read query failed, treating board as empty:", err);
    return fallback;
  }
}

function toIso(value: unknown): string {
  return value instanceof Date ? value.toISOString() : new Date(String(value)).toISOString();
}

// int8 (bigint) and timestamptz come back as strings / Date objects from the pg
// type parsers, so normalise every row back into our BoardMessage shape.
function rowToMessage(r: Record<string, unknown>): BoardMessage {
  return {
    id: String(r.id),
    userId: Number(r.user_id),
    login: String(r.login),
    name: (r.name as string | null) ?? null,
    avatar: String(r.avatar),
    text: String(r.text),
    createdAt: toIso(r.created_at),
    ...(r.edited_at != null ? { editedAt: toIso(r.edited_at) } : {}),
  };
}

const neonBackend: Backend = {
  async list(limit) {
    return readQuery(async (sql) => {
      const rows = await sql`
        SELECT * FROM board_messages ORDER BY created_at DESC LIMIT ${limit}
      `;
      return rows.map(rowToMessage);
    }, []);
  },
  async page(limit, before) {
    return readQuery(async (sql) => {
      const rows = before
        ? await sql`
            SELECT * FROM board_messages
             WHERE created_at < ${before}
             ORDER BY created_at DESC LIMIT ${limit}
          `
        : await sql`
            SELECT * FROM board_messages
             ORDER BY created_at DESC LIMIT ${limit}
          `;
      return rows.map(rowToMessage);
    }, []);
  },
  async listWithStats(limit) {
    // One round-trip: fetch the rows and derive stats from them. With
    // `limit = MAX_MESSAGES` the rows are the whole table (inserts trim to
    // MAX_MESSAGES), so the JS-side counts equal a COUNT(*) in the database.
    return readQuery(
      async (sql) => {
        const rows = await sql`
          SELECT * FROM board_messages ORDER BY created_at DESC LIMIT ${limit}
        `;
        const messages = rows.map(rowToMessage);
        return { messages, stats: computeStats(messages) };
      },
      { messages: [], stats: { total: 0, uniqueUsers: 0 } },
    );
  },
  async insert(message) {
    const sql = await getSqlForWrite();
    await sql`
      INSERT INTO board_messages
        (id, user_id, login, name, avatar, text, created_at)
      VALUES
        (${message.id}, ${message.userId}, ${message.login}, ${message.name},
         ${message.avatar}, ${message.text}, ${message.createdAt})
    `;
    // Keep only the newest MAX_MESSAGES rows.
    await sql`
      DELETE FROM board_messages WHERE id IN (
        SELECT id FROM board_messages ORDER BY created_at DESC OFFSET ${MAX_MESSAGES}
      )
    `;
  },
  async update(id, userId, text, editedAt) {
    const sql = await getSqlForWrite();
    const rows = await sql`
      UPDATE board_messages
         SET text = ${text}, edited_at = ${editedAt}
       WHERE id = ${id} AND user_id = ${userId}
      RETURNING *
    `;
    return rows.length ? rowToMessage(rows[0]) : null;
  },
  async remove(id, userId) {
    const sql = await getSqlForWrite();
    const rows = await sql`
      DELETE FROM board_messages
       WHERE id = ${id} AND user_id = ${userId}
      RETURNING id
    `;
    return rows.length > 0;
  },
  async lastPostAt(userId) {
    return readQuery(async (sql) => {
      const rows = await sql`
        SELECT created_at FROM board_messages
         WHERE user_id = ${userId}
         ORDER BY created_at DESC LIMIT 1
      `;
      return rows.length ? toIso(rows[0].created_at) : null;
    }, null);
  },
  async stats() {
    return readQuery(
      async (sql) => {
        const rows = await sql`
          SELECT count(*)::int AS total,
                 count(DISTINCT user_id)::int AS unique_users
            FROM board_messages
        `;
        return { total: rows[0].total, uniqueUsers: rows[0].unique_users };
      },
      { total: 0, uniqueUsers: 0 },
    );
  },
};

function backend(): Backend {
  return DATABASE_URL ? neonBackend : fileBackend;
}

function computeStats(messages: BoardMessage[]): BoardStats {
  return {
    total: messages.length,
    uniqueUsers: new Set(messages.map((m) => m.userId)).size,
  };
}

// ── Public API ───────────────────────────────────────────────────────────────

export async function listMessages(limit = MAX_MESSAGES): Promise<BoardMessage[]> {
  return backend().list(limit);
}

/** Messages + stats in a single backend round-trip (board page / board GET). */
export async function listMessagesWithStats(
  limit = MAX_MESSAGES,
): Promise<{ messages: BoardMessage[]; stats: BoardStats }> {
  return backend().listWithStats(limit);
}

/**
 * One infinite-scroll page, newest-first. `before` is the ISO createdAt of the
 * oldest message the client already has (omit it for the first page). We fetch
 * one extra row to tell the client whether older messages remain, then trim it.
 */
export async function listMessagesPage(
  limit = BOARD_PAGE_SIZE,
  before?: string,
): Promise<{ messages: BoardMessage[]; hasMore: boolean }> {
  const rows = await backend().page(limit + 1, before);
  const hasMore = rows.length > limit;
  return { messages: hasMore ? rows.slice(0, limit) : rows, hasMore };
}

/** First page + stats for the initial board load (server component / GET). */
export async function listFirstPageWithStats(
  limit = BOARD_PAGE_SIZE,
): Promise<{ messages: BoardMessage[]; stats: BoardStats; hasMore: boolean }> {
  const [page, stats] = await Promise.all([listMessagesPage(limit), getStats()]);
  return { messages: page.messages, stats, hasMore: page.hasMore };
}

export async function addMessage(input: NewMessage): Promise<BoardMessage> {
  const message = makeMessage(input);
  await backend().insert(message);
  return message;
}

/** Edit a message — only if it belongs to `userId`. Returns null otherwise. */
export async function updateMessage(
  id: string,
  userId: number,
  text: string,
): Promise<BoardMessage | null> {
  return backend().update(id, userId, text, new Date().toISOString());
}

/** Delete a message — only if it belongs to `userId`. Returns false otherwise. */
export async function deleteMessage(
  id: string,
  userId: number,
): Promise<boolean> {
  return backend().remove(id, userId);
}

/** ISO timestamp of the user's most recent post, or null — drives the cooldown. */
export async function lastPostAt(userId: number): Promise<string | null> {
  return backend().lastPostAt(userId);
}

export async function getStats(): Promise<BoardStats> {
  return backend().stats();
}

/** Which backend is active (for diagnostics / status bar). */
export const boardBackend: "neon" | "file" = DATABASE_URL ? "neon" : "file";
