import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  addMessage,
  getStats,
  lastPostAt,
  listMessagesWithStats,
} from "@/lib/board/store";
import { MAX_MESSAGE_LENGTH, POST_COOLDOWN_MS } from "@/lib/board/types";

export async function GET() {
  const { messages, stats } = await listMessagesWithStats();
  return NextResponse.json({ messages, stats });
}

export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { text?: unknown };
  try {
    body = (await request.json()) as { text?: unknown };
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) {
    return NextResponse.json({ error: "empty" }, { status: 422 });
  }
  if (text.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: "too_long" }, { status: 422 });
  }

  // Throttle new posts to one per cooldown window per signed-in user.
  const last = await lastPostAt(user.id);
  if (last) {
    const elapsed = Date.now() - new Date(last).getTime();
    if (elapsed < POST_COOLDOWN_MS) {
      const retryAfter = Math.ceil((POST_COOLDOWN_MS - elapsed) / 1000);
      return NextResponse.json(
        { error: "rate_limited", retryAfter },
        { status: 429, headers: { "Retry-After": String(retryAfter) } },
      );
    }
  }

  const message = await addMessage({
    userId: user.id,
    login: user.login,
    name: user.name,
    avatar: user.avatar,
    text,
  });
  const stats = await getStats();

  return NextResponse.json({ message, stats });
}
