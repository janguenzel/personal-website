"use client";

import { useEffect } from "react";
import { useFocusTrap } from "@/lib/hooks/useFocusTrap";

type Props = {
  open: boolean;
  title: string;
  /** Optional secondary line under the title. */
  message?: string;
  confirmLabel: string;
  cancelLabel: string;
  /** Style the confirm action as destructive (danger token) and default focus
   * to Cancel so an accidental Enter doesn't trigger it. */
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

// A small terminal-styled confirmation modal mirroring HelpOverlay: dimmed
// backdrop, bordered surface card, role="dialog"/aria-modal, focus trap,
// click-outside + Esc to cancel. Replaces the native window.confirm().
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  destructive = false,
  onConfirm,
  onCancel,
}: Props) {
  const dialogRef = useFocusTrap<HTMLDivElement>(open);

  // Esc cancels. Bound on the document so it works regardless of focus.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onCancel}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        tabIndex={-1}
        className="w-full max-w-sm rounded-lg border border-border bg-surface p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="confirm-dialog-title"
          className={
            destructive ? "text-sm text-danger" : "text-sm text-accent"
          }
        >
          {title}
        </h2>
        {message ? <p className="mt-2 text-xs text-muted">{message}</p> : null}
        <div className="mt-5 flex justify-end gap-2 text-xs">
          {/* Cancel first → it receives initial focus (safe default). */}
          <button
            type="button"
            onClick={onCancel}
            className="rounded border border-border px-3 py-1.5 text-muted transition-colors hover:text-fg"
          >
            {cancelLabel} (Esc)
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={
              destructive
                ? "rounded border border-danger px-3 py-1.5 text-danger transition-colors hover:bg-danger hover:text-bg"
                : "rounded border border-accent px-3 py-1.5 text-accent transition-colors hover:bg-accent hover:text-bg"
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
