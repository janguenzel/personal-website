import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { NeonQueryFunction } from "@neondatabase/serverless";

// A persistent, monotonically-increasing unique-visitor counter. Unlike the
// board's "distinct posters" stat, this counts *anyone* who loads the site —
// signed in or not — exactly once (uniqueness is enforced at the edge via a
// long-lived cookie; see app/api/visits/route.ts). The count only ever goes up.
//
// Persistence mirrors the board: a .data/ file for dev, Neon Postgres in prod
// when a connection string (DATABASE_URL) is present. On Postgres the increment
// is a single atomic upsert, so concurrent hits can't lose a count.

interface Backend {
  get(): Promise<number>;
  increment(): Promise<number>;
}

// ── File-backed backend (development default) ────────────────────────────────
const DATA_FILE = path.join(process.cwd(), ".data", "visits.json");

async function readFile(): Promise<number> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as { count?: number };
    return Number.isFinite(parsed.count) ? Number(parsed.count) : 0;
  } catch {
    return 0;
  }
}

async function writeFile(count: number): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify({ count }), "utf8");
}

const fileBackend: Backend = {
  get: readFile,
  async increment() {
    const next = (await readFile()) + 1;
    await writeFile(next);
    return next;
  },
};

// ── Neon Postgres backend (production) ───────────────────────────────────────
const DATABASE_URL = (
  process.env.DATABASE_URL ?? process.env.POSTGRES_URL
)?.trim();

let sqlClient: NeonQueryFunction<false, false> | null = null;
let schemaReady: Promise<void> | null = null;

async function getSql(): Promise<NeonQueryFunction<false, false>> {
  if (!sqlClient) {
    const { neon } = await import("@neondatabase/serverless");
    sqlClient = neon(DATABASE_URL!);
  }
  const sql = sqlClient;
  schemaReady ??= (async () => {
    await sql`
      CREATE TABLE IF NOT EXISTS visits (
        id    integer PRIMARY KEY,
        count bigint NOT NULL DEFAULT 0
      )
    `;
  })();
  await schemaReady;
  return sql;
}

const neonBackend: Backend = {
  async get() {
    const sql = await getSql();
    const rows = await sql`SELECT count::int AS count FROM visits WHERE id = 1`;
    return rows.length ? Number(rows[0].count) : 0;
  },
  async increment() {
    const sql = await getSql();
    // Atomic read-and-increment: insert the singleton row or bump it in place.
    const rows = await sql`
      INSERT INTO visits (id, count) VALUES (1, 1)
      ON CONFLICT (id) DO UPDATE SET count = visits.count + 1
      RETURNING count::int AS count
    `;
    return Number(rows[0].count);
  },
};

function backend(): Backend {
  return DATABASE_URL ? neonBackend : fileBackend;
}

/** Current visitor count (does not mutate). */
export async function getVisits(): Promise<number> {
  return backend().get();
}

/** Increment the counter by one and return the new total. */
export async function recordVisit(): Promise<number> {
  return backend().increment();
}
