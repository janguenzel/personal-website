"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { useUiStore } from "@/lib/store/useUiStore";

// Konami / `matrix` easter egg. Canvas + requestAnimationFrame (off the main
// React render path). Decorative, so aria-hidden; Esc closes it (see useHotkeys).
export function MatrixRain() {
  const on = useUiStore((s) => s.matrix);
  const setMatrix = useUiStore((s) => s.setMatrix);
  const reduced = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!on || reduced) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const fontSize = 14;
    let columns = 0;
    let drops: number[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      columns = Math.floor(canvas.width / fontSize);
      drops = new Array(columns).fill(1);
    };
    resize();
    window.addEventListener("resize", resize);

    const glyphs =
      "アイウエオカキクケコサシスセソ0123456789ABCDEFｱｲｳｴｵﾞﾟ".split("");
    let raf = 0;

    // Advance one step every STEP_MS regardless of the display's actual refresh
    // rate. We accumulate elapsed time and drain it in fixed steps, so the rain
    // falls at a consistent perceived speed on 60/120/144Hz. ~45 steps/sec is a
    // touch slower than a 60Hz frame loop, for a calmer fall.
    const STEP_MS = 1000 / 45;
    // Cap accrued time so a backgrounded tab / long stall can't spiral into a
    // burst of catch-up steps when it resumes.
    const MAX_ACCUM_MS = STEP_MS * 5;
    let lastTime = 0;
    let accumulator = 0;

    const step = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const accent =
        getComputedStyle(document.documentElement)
          .getPropertyValue("--accent")
          .trim() || "#22c55e";
      ctx.fillStyle = accent;
      ctx.font = `${fontSize}px monospace`;
      for (let i = 0; i < drops.length; i++) {
        const text = glyphs[Math.floor(Math.random() * glyphs.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += 1;
      }
    };

    const draw = (time: number) => {
      if (lastTime === 0) lastTime = time;
      accumulator = Math.min(accumulator + (time - lastTime), MAX_ACCUM_MS);
      lastTime = time;
      while (accumulator >= STEP_MS) {
        step();
        accumulator -= STEP_MS;
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [on, reduced]);

  if (!on) return null;

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[60] bg-black/90"
      onClick={() => setMatrix(false)}
    >
      {!reduced ? (
        <canvas ref={canvasRef} className="h-full w-full" />
      ) : (
        <div className="flex h-full items-center justify-center text-accent">
          matrix mode (paused — reduced motion)
        </div>
      )}
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setMatrix(false)}
        className="absolute right-4 top-4 border border-accent px-2 py-1 text-xs text-accent"
      >
        esc
      </button>
    </div>
  );
}
