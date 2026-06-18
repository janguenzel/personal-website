"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

export type NotFoundOption = { label: string; href: string };

// Read the live browser URL without a hydration mismatch or a sync setState in
// an effect (rule #7): the server snapshot is a sensible fallback (the site
// origin), and React swaps in window.location.href on the client after mount.
function useCurrentUrl(fallback: string): string {
  return useSyncExternalStore(
    () => () => {},
    () => window.location.href,
    () => fallback,
  );
}

// Terminal-styled 404 rendered by the locale-aware not-found boundary
// (app/[locale]/not-found.tsx), which a catch-all route under [locale] triggers
// for unmatched paths. Navigation uses plain anchors + window.location so it
// stays self-contained and robust regardless of the surrounding providers. The
// page reads like a failed `curl` against the URL the visitor actually tried,
// followed by a selectable list of real routes.
export function NotFoundTerminal({
  promptLabel,
  errorLabel,
  chooseLabel,
  hint,
  options,
  fallbackUrl,
}: {
  /** Shell prompt prefix, e.g. "visitor@jan-guenzel". */
  promptLabel: string;
  /** The error line, e.g. "404 Page Not Found". */
  errorLabel: string;
  /** Prompt above the destination list, e.g. "choose a page where you want to go". */
  chooseLabel: string;
  /** Keyboard hint shown under the list. */
  hint: string;
  options: NotFoundOption[];
  /** URL rendered during SSR before the client reads window.location. */
  fallbackUrl: string;
}) {
  const url = useCurrentUrl(fallbackUrl);
  const [active, setActive] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const baseId = useId();
  const optionId = (i: number) => `${baseId}-opt-${i}`;

  // Move keyboard focus onto the listbox on mount so the visitor can pick a
  // destination with ↑/↓/↵ without clicking first. Deferred to a macrotask so it
  // runs after hydration makes the element interactive (a hard load lands focus
  // on <body> otherwise); `preventScroll` keeps the viewport from jumping. This
  // is a DOM call, not a setState, so it's fine in an effect (rule #7).
  useEffect(() => {
    const id = window.setTimeout(
      () => containerRef.current?.focus({ preventScroll: true }),
      0,
    );
    return () => window.clearTimeout(id);
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = options[active];
      if (target) window.location.href = target.href;
    }
  };

  return (
    <section className="text-sm">
      {/* The command the visitor's navigation effectively ran. */}
      <p className="break-all font-mono">
        <span className="text-prompt" aria-hidden>
          {promptLabel}
        </span>
        <span className="text-muted" aria-hidden>
          {" "}
          ${" "}
        </span>
        <span className="text-fg">curl -X GET {url}</span>
      </p>

      {/* The error it returned. */}
      <p role="alert" className="mt-1 text-danger">
        <span aria-hidden>✗ </span>
        {errorLabel}
      </p>

      <p className="mt-6 text-muted">{chooseLabel}:</p>

      <div
        ref={containerRef}
        role="listbox"
        aria-label={chooseLabel}
        aria-activedescendant={optionId(active)}
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="mt-1 max-w-sm rounded outline-none focus-visible:ring-1 focus-visible:ring-accent"
      >
        {options.map((opt, i) => (
          <a
            key={opt.href}
            id={optionId(i)}
            href={opt.href}
            role="option"
            aria-selected={i === active}
            tabIndex={-1}
            onMouseEnter={() => setActive(i)}
            className={`flex items-center gap-2 px-3 py-1.5 ${
              i === active ? "bg-surface-2 text-accent" : "text-muted"
            }`}
          >
            <span aria-hidden>{i === active ? "❯" : " "}</span>
            <span>{opt.label}</span>
          </a>
        ))}
      </div>

      <p className="mt-4 text-xs text-muted">{hint}</p>
    </section>
  );
}
