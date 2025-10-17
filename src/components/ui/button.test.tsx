import { render } from "@solidjs/testing-library";
import { userEvent } from "@testing-library/user-event";
import { beforeEach } from "node:test";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./button.tsx";

describe("Button", () => {
  beforeEach(() => {
    // Clean up any open popovers or global state
    document.body.innerHTML = "";
  });

  it("Render default Button component", async () => {
    const comp = render(() => <Button>OK</Button>);
    const button = comp.getByRole("button");
    expect(button).toHaveClass("focus:ring-white");
  });

  it("Render secondary Button component", async () => {
    const comp = render(() => <Button variant="secondary">OK</Button>);
    const button = comp.getByText("OK");
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("hover:bg-green-800", "bg-green-700");
  });

  it("Render outlined Button component", async () => {
    const comp = render(() => <Button variant="outlined">OK</Button>);
    const button = comp.getByText("OK");
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("text-gray-900");
  });

  it("Button click", async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    const comp = render(() => <Button onClick={fn}>OK</Button>);
    const button = comp.getByText("OK");
    await user.click(button);
    expect(fn).toHaveBeenCalled();
  });
});
