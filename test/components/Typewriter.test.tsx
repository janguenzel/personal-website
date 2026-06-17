import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Typewriter } from "@/components/ui/Typewriter";

function setReducedMotion(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

describe("Typewriter", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("always exposes the full text to assistive tech", () => {
    setReducedMotion(false);
    const { container } = render(<Typewriter text="Hello" />);
    expect(container.querySelector(".sr-only")).toHaveTextContent("Hello");
  });

  it("renders the full text immediately under reduced motion and fires onDone", () => {
    setReducedMotion(true);
    const onDone = vi.fn();
    vi.useFakeTimers();
    render(<Typewriter text="Instant" onDone={onDone} />);
    act(() => {
      vi.runAllTimers();
    });
    // The animated (aria-hidden) copy already shows the full string.
    expect(screen.getByText("Instant", { selector: "[aria-hidden]" })).toBeInTheDocument();
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it("types out and eventually fires onDone with motion enabled", () => {
    setReducedMotion(false);
    const onDone = vi.fn();
    vi.useFakeTimers();
    render(<Typewriter text="abc" speed={10} onDone={onDone} />);
    act(() => {
      vi.runAllTimers();
    });
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});
