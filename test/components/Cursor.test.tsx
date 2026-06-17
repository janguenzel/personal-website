import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Cursor } from "@/components/ui/Cursor";

describe("Cursor", () => {
  it("is decorative (aria-hidden) and carries the blink class", () => {
    const { container } = render(<Cursor />);
    const span = container.querySelector("span");
    expect(span).toHaveAttribute("aria-hidden");
    expect(span).toHaveClass("cursor-blink");
  });

  it("merges an extra className", () => {
    const { container } = render(<Cursor className="extra-class" />);
    expect(container.querySelector("span")).toHaveClass("extra-class");
  });
});
