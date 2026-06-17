"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { Cursor } from "./Cursor";

// Types `text` out character by character. Under reduced motion it renders the
// full text immediately (and still fires onDone), so nothing is gated behind
// an animation the user opted out of.
export function Typewriter({
  text,
  speed = 22,
  startDelay = 0,
  cursor = true,
  className = "",
  onDone,
}: {
  text: string;
  speed?: number;
  startDelay?: number;
  cursor?: boolean;
  className?: string;
  onDone?: () => void;
}) {
  const reduced = useReducedMotion();
  const [count, setCount] = useState(0);

  // If `text` changes in place (e.g. locale switch), reset at render time so we
  // never paint the new string sliced to the old length.
  const [prevText, setPrevText] = useState(text);
  if (text !== prevText) {
    setPrevText(text);
    setCount(0);
  }

  useEffect(() => {
    // Reduced motion: reveal everything immediately, still signal completion.
    if (reduced) {
      const id = setTimeout(() => onDone?.(), 0);
      return () => clearTimeout(id);
    }
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    // setState lives inside the timeout callback (not the effect body) so the
    // typing is a real animation, not a synchronous cascade.
    const tick = () => {
      i += 1;
      setCount(i);
      if (i < text.length) {
        timer = setTimeout(tick, speed);
      } else {
        onDone?.();
      }
    };
    const start = setTimeout(() => {
      setCount(0);
      tick();
    }, startDelay);
    return () => {
      clearTimeout(start);
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, reduced]);

  const shown = reduced ? text : text.slice(0, count);
  const finished = reduced || count >= text.length;

  return (
    <span className={className}>
      {/* Full text for assistive tech (real content → gives any wrapping
          heading/label a proper accessible name); animated copy is hidden. */}
      <span className="sr-only">{text}</span>
      <span aria-hidden>{shown}</span>
      {cursor && !finished ? <Cursor /> : null}
    </span>
  );
}
