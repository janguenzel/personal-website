import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { deleteMessage, getStats, updateMessage } from "@/lib/board/store";
import { MAX_MESSAGE_LENGTH } from "@/lib/board/types";

type Context = { params: Promise<{ id: string }> };

// Edit one of your own messages. Ownership is enforced in the store (the edit
// only applies when the message's userId matches the session). Edits are NOT
// subject to the post cooldown — only brand-new posts are throttled.
export async function PATCH(request: NextRequest, { params }: Context) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;

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

  const message = await updateMessage(id, user.id, text);
  if (!message) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ message });
}

// Delete one of your own messages.
export async function DELETE(_request: NextRequest, { params }: Context) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const ok = await deleteMessage(id, user.id);
  if (!ok) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const stats = await getStats();
  return NextResponse.json({ ok: true, stats });
}
