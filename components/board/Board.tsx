"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/provider";
import {
  MAX_MESSAGE_LENGTH,
  POST_COOLDOWN_MS,
  type BoardMessage,
  type BoardStats,
} from "@/lib/board/types";
import type { SessionUser } from "@/lib/auth/session";
import type { Locale } from "@/lib/i18n/config";

// Where an unauthenticated draft is parked across the GitHub OAuth round-trip.
const DRAFT_KEY = "board:draft";

function formatDuration(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function Board({
  locale,
  user,
  authConfigured,
  initialMessages,
  initialStats,
}: {
  locale: Locale;
  user: SessionUser | null;
  authConfigured: boolean;
  initialMessages: BoardMessage[];
  initialStats: BoardStats;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [messages, setMessages] = useState(initialMessages);
  const [stats, setStats] = useState(initialStats);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);

  // Cooldown: epoch-ms when the user may post again (null = free to post).
  // `now` ticks once a second only while a cooldown is active, to drive the
  // countdown without a permanent timer.
  const [nextAllowedAt, setNextAllowedAt] = useState<number | null>(null);
  const [now, setNow] = useState(0);

  // Edit state.
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const remaining = nextAllowedAt ? nextAllowedAt - now : 0;
  const onCooldown = remaining > 0;

  // On mount: restore any draft saved before the login round-trip, and seed the
  // cooldown from the user's most recent post. setState lives in a timeout (not
  // the effect body) per the project's no-sync-setState-in-effects rule.
  useEffect(() => {
    if (!user) return;
    const id = setTimeout(() => {
      const draft =
        typeof window !== "undefined" ? localStorage.getItem(DRAFT_KEY) : null;
      if (draft) {
        localStorage.removeItem(DRAFT_KEY);
        setText(draft);
        setDraftRestored(true);
      }
      const mine = initialMessages.filter((m) => m.userId === user.id);
      if (mine.length > 0) {
        const latest = Math.max(
          ...mine.map((m) => new Date(m.createdAt).getTime()),
        );
        const next = latest + POST_COOLDOWN_MS;
        if (next > Date.now()) {
          setNextAllowedAt(next);
          setNow(Date.now());
        }
      }
    }, 0);
    return () => clearTimeout(id);
  }, [user, initialMessages]);

  // Tick the countdown while a cooldown is pending.
  useEffect(() => {
    if (!nextAllowedAt) return;
    // `now` is seeded wherever nextAllowedAt is set, so we only need the tick.
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [nextAllowedAt]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = text.trim();
    if (!value) return setError(t("board.errors.empty"));
    if (value.length > MAX_MESSAGE_LENGTH) {
      return setError(t("board.errors.tooLong", { max: MAX_MESSAGE_LENGTH }));
    }

    // Not signed in yet: stash the draft and send the user through GitHub. They
    // come back to the board with the draft restored, ready to hit send.
    if (!user) {
      localStorage.setItem(DRAFT_KEY, value);
      window.location.href = `/api/auth/login?locale=${locale}`;
      return;
    }

    if (onCooldown) {
      return setError(
        t("board.errors.rateLimited", { time: formatDuration(remaining) }),
      );
    }

    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/board", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: value }),
      });
      if (res.status === 429) {
        const data = (await res.json()) as { retryAfter?: number };
        const retry = (data.retryAfter ?? POST_COOLDOWN_MS / 1000) * 1000;
        setNextAllowedAt(Date.now() + retry);
        setNow(Date.now());
        setError(
          t("board.errors.rateLimited", { time: formatDuration(retry) }),
        );
        return;
      }
      if (!res.ok) {
        setError(
          res.status === 401
            ? t("board.errors.unauthorized")
            : t("board.errors.failed"),
        );
        return;
      }
      const data = (await res.json()) as {
        message: BoardMessage;
        stats: BoardStats;
      };
      setMessages((prev) => [data.message, ...prev]);
      setStats(data.stats);
      setText("");
      setDraftRestored(false);
      setNextAllowedAt(Date.now() + POST_COOLDOWN_MS);
      setNow(Date.now());
    } catch {
      setError(t("board.errors.failed"));
    } finally {
      setSending(false);
    }
  }

  async function saveEdit(id: string) {
    const value = editText.trim();
    if (!value) return setError(t("board.errors.empty"));
    if (value.length > MAX_MESSAGE_LENGTH) {
      return setError(t("board.errors.tooLong", { max: MAX_MESSAGE_LENGTH }));
    }
    setSavingEdit(true);
    setError(null);
    try {
      const res = await fetch(`/api/board/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: value }),
      });
      if (!res.ok) {
        setError(
          res.status === 404
            ? t("board.errors.notFound")
            : t("board.errors.failed"),
        );
        return;
      }
      const data = (await res.json()) as { message: BoardMessage };
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? data.message : m)),
      );
      setEditingId(null);
      setEditText("");
    } catch {
      setError(t("board.errors.failed"));
    } finally {
      setSavingEdit(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm(t("board.confirmDelete"))) return;
    setError(null);
    try {
      const res = await fetch(`/api/board/${id}`, { method: "DELETE" });
      if (!res.ok) {
        setError(
          res.status === 404
            ? t("board.errors.notFound")
            : t("board.errors.failed"),
        );
        return;
      }
      const data = (await res.json()) as { stats: BoardStats };
      setMessages((prev) => prev.filter((m) => m.id !== id));
      setStats(data.stats);
    } catch {
      setError(t("board.errors.failed"));
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <section className="text-sm">
      <header className="mb-4">
        <h1 className="text-accent">{t("board.heading")}</h1>
        <p className="text-muted">{t("board.subtitle")}</p>
        <p className="mt-2 flex flex-wrap gap-4 text-xs text-muted">
          <span>{t("board.messagesCount", { count: stats.total })}</span>
          <span className="text-accent">
            {t("board.usersCount", { count: stats.uniqueUsers })}
          </span>
        </p>
      </header>

      <div className="mb-6 rounded border border-border bg-surface p-3">
        {!authConfigured ? (
          <p className="text-muted">{t("board.authDisabled")}</p>
        ) : (
          <form onSubmit={submit}>
            <div className="mb-2 flex items-center justify-between text-xs text-muted">
              {user ? (
                <>
                  <span className="flex items-center gap-2">
                    <Image
                      src={user.avatar}
                      alt=""
                      width={20}
                      height={20}
                      className="rounded-full"
                    />
                    {t("board.signedInAs", { login: user.login })}
                  </span>
                  <button
                    type="button"
                    onClick={logout}
                    className="hover:text-accent"
                  >
                    {t("board.signOut")}
                  </button>
                </>
              ) : (
                <span>{t("board.loginToSend")}</span>
              )}
            </div>

            <label htmlFor="board-input" className="sr-only">
              {t("board.placeholder")}
            </label>
            <textarea
              id="board-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={MAX_MESSAGE_LENGTH}
              rows={3}
              placeholder={t("board.placeholder")}
              className="w-full resize-none bg-transparent text-fg outline-none placeholder:text-muted"
            />

            {draftRestored ? (
              <p className="mt-1 text-xs text-accent">
                {t("board.draftRestored")}
              </p>
            ) : null}

            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="text-xs text-muted">
                {user && onCooldown
                  ? t("board.cooldown", { time: formatDuration(remaining) })
                  : t("board.charCount", {
                      count: text.length,
                      max: MAX_MESSAGE_LENGTH,
                    })}
              </span>
              <button
                type="submit"
                disabled={sending || (user ? onCooldown : false)}
                className="border border-accent px-3 py-1 text-accent transition-colors hover:bg-accent hover:text-bg disabled:opacity-50"
              >
                {!user
                  ? t("board.signInAndSend")
                  : sending
                    ? t("board.sending")
                    : t("board.send")}
              </button>
            </div>
            {error ? (
              <p role="alert" className="mt-2 text-xs text-danger">
                {error}
              </p>
            ) : null}
          </form>
        )}
      </div>

      {messages.length === 0 ? (
        <p className="text-muted">{t("board.empty")}</p>
      ) : (
        <ul className="space-y-3">
          {messages.map((m) => {
            const mine = user?.id === m.userId;
            const editing = editingId === m.id;
            return (
              <li key={m.id} className="flex gap-3 border-b border-border pb-3">
                <Image
                  src={m.avatar}
                  alt=""
                  width={28}
                  height={28}
                  className="mt-0.5 h-7 w-7 rounded-full"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-2 text-xs">
                    <a
                      href={`https://github.com/${m.login}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline"
                    >
                      @{m.login}
                    </a>
                    {m.name ? (
                      <span className="text-muted">{m.name}</span>
                    ) : null}
                    {mine ? (
                      <span className="text-accent">[{t("board.you")}]</span>
                    ) : null}
                    <time
                      dateTime={m.createdAt}
                      suppressHydrationWarning
                      className="text-muted"
                    >
                      {new Date(m.createdAt).toLocaleString(locale)}
                    </time>
                    {m.editedAt ? (
                      <span className="text-muted">({t("board.edited")})</span>
                    ) : null}
                  </div>

                  {editing ? (
                    <div className="mt-1">
                      <label htmlFor={`edit-${m.id}`} className="sr-only">
                        {t("board.edit")}
                      </label>
                      <textarea
                        id={`edit-${m.id}`}
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        maxLength={MAX_MESSAGE_LENGTH}
                        rows={3}
                        className="w-full resize-none rounded border border-border bg-bg p-2 text-fg outline-none"
                      />
                      <div className="mt-1 flex gap-3 text-xs">
                        <button
                          type="button"
                          onClick={() => saveEdit(m.id)}
                          disabled={savingEdit}
                          className="text-accent hover:underline disabled:opacity-50"
                        >
                          {savingEdit ? t("board.saving") : t("board.save")}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(null);
                            setEditText("");
                          }}
                          className="text-muted hover:text-fg"
                        >
                          {t("board.cancel")}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="mt-1 whitespace-pre-wrap break-words text-fg">
                        {m.text}
                      </p>
                      {mine ? (
                        <div className="mt-1 flex gap-3 text-xs">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(m.id);
                              setEditText(m.text);
                              setError(null);
                            }}
                            className="text-muted hover:text-accent"
                          >
                            {t("board.edit")}
                          </button>
                          <button
                            type="button"
                            onClick={() => remove(m.id)}
                            className="text-muted hover:text-danger"
                          >
                            {t("board.delete")}
                          </button>
                        </div>
                      ) : null}
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
