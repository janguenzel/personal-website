import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { hasLocale } from "@/lib/i18n/config";
import { buildMetadata } from "@/lib/seo/metadata";
import { getSession } from "@/lib/auth/session";
import { isGitHubAuthConfigured } from "@/lib/auth/github";
import { listMessagesWithStats } from "@/lib/board/store";
import { Board } from "@/components/board/Board";

// Live data + per-request session → always dynamic.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const loc = hasLocale(locale) ? locale : "en";
  const dict = await getDictionary(loc);
  return buildMetadata({
    locale: loc,
    segment: "board",
    title: dict.meta.board.title,
    description: dict.meta.board.description,
  });
}

export default async function BoardPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ auth?: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  const [{ auth }, user, { messages, stats }] = await Promise.all([
    searchParams,
    getSession(),
    listMessagesWithStats(),
  ]);

  return (
    <Board
      locale={locale}
      user={user}
      authConfigured={isGitHubAuthConfigured}
      authError={auth === "error"}
      initialMessages={messages}
      initialStats={stats}
    />
  );
}
