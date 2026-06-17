import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  NotFoundTerminal,
  type NotFoundOption,
} from "@/components/terminal/NotFoundTerminal";

const options: NotFoundOption[] = [
  { label: "Home", href: "/en" },
  { label: "About Me", href: "/en/about" },
  { label: "Projects", href: "/en/projects" },
];

function renderTerminal() {
  return render(
    <NotFoundTerminal
      promptLabel="visitor@jan-guenzel"
      errorLabel="404 Page Not Found"
      chooseLabel="choose a page where you want to go"
      hint="use ↑/↓ to pick a destination, ↵ to go"
      options={options}
      fallbackUrl="https://jan-guenzel.de"
    />,
  );
}

describe("NotFoundTerminal", () => {
  it("renders the failed curl command against the current URL", () => {
    renderTerminal();
    // jsdom's default location stands in for the visitor's actual URL.
    expect(
      screen.getByText(/curl -X GET http:\/\/localhost/),
    ).toBeInTheDocument();
    expect(screen.getByText("visitor@jan-guenzel")).toBeInTheDocument();
  });

  it("shows the 404 error as an alert", () => {
    renderTerminal();
    expect(screen.getByRole("alert")).toHaveTextContent("404 Page Not Found");
  });

  it("exposes destinations as a labelled listbox with the first selected", () => {
    renderTerminal();
    const listbox = screen.getByRole("listbox", {
      name: "choose a page where you want to go",
    });
    expect(listbox).toBeInTheDocument();
    const opts = screen.getAllByRole("option");
    expect(opts).toHaveLength(3);
    expect(opts[0]).toHaveAttribute("aria-selected", "true");
  });

  it("moves the selection with arrow keys (clamped at the ends)", () => {
    renderTerminal();
    const listbox = screen.getByRole("listbox");
    fireEvent.keyDown(listbox, { key: "ArrowDown" });
    let opts = screen.getAllByRole("option");
    expect(opts[1]).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(listbox, { key: "ArrowUp" });
    fireEvent.keyDown(listbox, { key: "ArrowUp" });
    opts = screen.getAllByRole("option");
    expect(opts[0]).toHaveAttribute("aria-selected", "true");
  });

  it("focuses the list on mount so arrows work without clicking first", async () => {
    renderTerminal();
    const listbox = screen.getByRole("listbox");
    await waitFor(() => expect(listbox).toHaveFocus());
  });

  it("tracks the active option via aria-activedescendant", () => {
    renderTerminal();
    const listbox = screen.getByRole("listbox");
    const opts = screen.getAllByRole("option");
    expect(listbox).toHaveAttribute("aria-activedescendant", opts[0].id);

    fireEvent.keyDown(listbox, { key: "ArrowDown" });
    expect(listbox).toHaveAttribute("aria-activedescendant", opts[1].id);
  });
});
