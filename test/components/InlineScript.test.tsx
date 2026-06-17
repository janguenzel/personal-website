import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { InlineScript } from "@/components/ui/InlineScript";

// jsdom defines `window`, so this exercises the *client* render path — the one
// that runs on soft navigations (e.g. the language switcher's <Link>). React 19
// only warns about a rendered <script> when its type is an executable JS MIME
// type; emitting `text/plain` keeps the tag inert and silent. See the component
// docstring and the "preventing flash before hydration" Next.js guide.
describe("InlineScript", () => {
  it("renders an inert text/plain script on the client (no warning)", () => {
    const { container } = render(
      <InlineScript id="no-fouc" html="window.__x=1;" />,
    );
    const script = container.querySelector("script");
    expect(script).not.toBeNull();
    expect(script).toHaveAttribute("type", "text/plain");
    expect(script).toHaveAttribute("id", "no-fouc");
    expect(script?.innerHTML).toBe("window.__x=1;");
  });
});
