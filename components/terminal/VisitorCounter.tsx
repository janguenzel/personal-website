"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/provider";

// Site-wide unique-visitor counter. Pings /api/visits on mount, which counts the
// visitor once (cookie-gated, anonymous-friendly) and returns the running total.
// Renders nothing until the count is known, so SSR/CSR stay in sync.
export function VisitorCounter() {
  const { t } = useI18n();
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/visits", { method: "POST" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { count?: number } | null) => {
        if (active && data && typeof data.count === "number") {
          setCount(data.count);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  if (count === null) return null;
  return (
    <span suppressHydrationWarning title={t("footer.visitorsLabel")}>
      <span aria-hidden>◆ </span>
      {t("footer.visitors", { count })}
    </span>
  );
}
