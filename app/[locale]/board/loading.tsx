"use client";

import { useI18n } from "@/lib/i18n/provider";

// Instant skeleton for the board route. The page is force-dynamic (per-request
// session + live messages), so this Suspense fallback paints immediately on
// navigation while the server work resolves. Purely structural placeholders
// mirror the real layout (header, composer, message rows) to avoid a layout
// shift on swap. `animate-pulse` is disabled automatically by the global
// prefers-reduced-motion rule in globals.css. The visual blocks are aria-hidden;
// a polite status line announces the load to assistive tech.
function Bar({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-surface-2 ${className}`} />;
}

export default function BoardLoading() {
  const { t } = useI18n();

  return (
    <section className="text-sm" role="status" aria-busy="true">
      <span className="sr-only">{t("board.loading")}</span>

      <div aria-hidden>
        <header className="mb-4">
          <Bar className="h-5 w-32" />
          <Bar className="mt-2 h-3 w-48" />
          <Bar className="mt-3 h-3 w-72 max-w-full" />
          <div className="mt-2 flex gap-4">
            <Bar className="h-3 w-24" />
            <Bar className="h-3 w-28" />
          </div>
        </header>

        <div className="mb-6 rounded border border-border bg-surface p-3">
          <div className="mb-3 flex items-center gap-2">
            <Bar className="h-5 w-5 rounded-full" />
            <Bar className="h-3 w-40" />
          </div>
          <Bar className="h-12 w-full" />
          <div className="mt-2 flex items-center justify-between">
            <Bar className="h-3 w-16" />
            <Bar className="h-7 w-20" />
          </div>
        </div>

        <ul className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="flex gap-3 border-b border-border pb-3">
              <Bar className="mt-0.5 h-7 w-7 rounded-full" />
              <div className="min-w-0 flex-1">
                <Bar className="h-3 w-48 max-w-full" />
                <Bar className="mt-2 h-3 w-full" />
                <Bar className="mt-1 h-3 w-3/4" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
