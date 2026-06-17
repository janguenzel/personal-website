"use client";

import { useI18n } from "@/lib/i18n/provider";
import { useUiStore } from "@/lib/store/useUiStore";
import { useFocusTrap } from "@/lib/hooks/useFocusTrap";

const ROWS: { key: string; keys: string[] }[] = [
  { key: "palette", keys: ["⌘/Ctrl", "K"] },
  { key: "nextTab", keys: ["Ctrl", "]"] },
  { key: "prevTab", keys: ["Ctrl", "["] },
  { key: "jumpTab", keys: ["g", "1–9"] },
  { key: "toggleTheme", keys: ["⌘/Ctrl", "J"] },
  { key: "cycleScheme", keys: ["Ctrl", "."] },
  { key: "help", keys: ["?"] },
  { key: "close", keys: ["Esc"] },
];

export function HelpOverlay() {
  const { t } = useI18n();
  const open = useUiStore((s) => s.overlay === "help");
  const close = useUiStore((s) => s.closeOverlays);
  const dialogRef = useFocusTrap<HTMLDivElement>(open);
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4"
      onClick={close}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={t("help.title")}
        tabIndex={-1}
        className="w-full max-w-md rounded-lg border border-border bg-surface p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-sm text-accent">{t("help.title")}</h2>
        <dl className="space-y-2 text-sm">
          {ROWS.map((row) => (
            <div key={row.key} className="flex items-center justify-between gap-4">
              <dt className="text-muted">{t(`help.${row.key}`)}</dt>
              <dd className="flex gap-1">
                {row.keys.map((k) => (
                  <kbd
                    key={k}
                    className="rounded border border-border bg-surface-2 px-1.5 py-0.5 text-xs text-fg"
                  >
                    {k}
                  </kbd>
                ))}
              </dd>
            </div>
          ))}
        </dl>
        <button
          type="button"
          onClick={close}
          className="mt-5 w-full rounded border border-border py-1.5 text-xs text-muted hover:text-fg"
        >
          {t("help.close")} (Esc)
        </button>
      </div>
    </div>
  );
}
