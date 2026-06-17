"use client";

/** Blinking block cursor (decorative). Stops blinking under reduced motion. */
export function Cursor({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`cursor-blink ml-0.5 inline-block h-[1.05em] w-[0.55ch] translate-y-[0.12em] bg-accent ${className}`}
    />
  );
}
