import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getVisits, recordVisit } from "@/lib/visits/store";

// Unique-visitor counter. A visitor is counted once: the first request without
// the `visited` cookie increments the persistent counter and gets the cookie
// (httpOnly, 1 year), so reloads and later visits don't double-count. Works for
// anyone — no sign-in required.
export const dynamic = "force-dynamic";

const VISIT_COOKIE = "visited";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export async function POST() {
  const store = await cookies();
  const seen = store.get(VISIT_COOKIE)?.value === "1";

  const count = seen ? await getVisits() : await recordVisit();

  if (!seen) {
    store.set(VISIT_COOKIE, "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: ONE_YEAR_SECONDS,
    });
  }

  return NextResponse.json({ count });
}
