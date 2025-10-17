import { fireEvent, render, screen } from "@solidjs/testing-library";
import { beforeEach, describe, expect, it } from "vitest";
import { Popover, PopoverContent, PopoverTrigger } from "./popover.tsx";

describe("Popover", () => {
  beforeEach(() => {
    // Clean up any open popovers or global state
    document.body.innerHTML = "";
  });

  it("throws error if not given exactly two children", () => {
    expect(() =>
      render(() => (
        //@ts-expect-error expected error when there is only one child component.
        <Popover>
          <PopoverTrigger>Trigger</PopoverTrigger>
        </Popover>
      )),
    ).toThrow("Popover component must have exactly 2 children");
  });

  it("opens on click and displays content", async () => {
    render(() => (
      <Popover triggerTypes="click" title="Popover Title">
        <PopoverTrigger>Click me</PopoverTrigger>
        <PopoverContent>Popover content</PopoverContent>
      </Popover>
    ));

    const trigger = screen.getByText("Click me");

    expect(screen.queryByText("Popover content")).not.toBeInTheDocument();

    fireEvent.click(trigger);

    expect(await screen.findByText("Popover content")).toBeInTheDocument();
    expect(screen.getByText("Popover Title")).toBeInTheDocument();
  });

  it("closes when close button is clicked", async () => {
    render(() => (
      <Popover triggerTypes="click">
        <PopoverTrigger>Click me</PopoverTrigger>
        <PopoverContent>Content to hide</PopoverContent>
      </Popover>
    ));

    fireEvent.click(screen.getByText("Click me"));
    expect(await screen.findByText("Content to hide")).toBeInTheDocument();

    const closeButton = screen.getByRole("button", { name: "common.close" });
    fireEvent.click(closeButton);

    expect(screen.queryByText("Content to hide")).not.toBeInTheDocument();
  });

  it("opens on focus", async () => {
    render(() => (
      <Popover triggerTypes="focus">
        <PopoverTrigger>Focus me</PopoverTrigger>
        <PopoverContent>Popover on focus</PopoverContent>
      </Popover>
    ));

    const trigger = screen.getByText("Focus me");
    fireEvent.focusIn(trigger);

    expect(await screen.findByText("Popover on focus")).toBeInTheDocument();
  });

  it("opens and closes on hover", async () => {
    render(() => (
      <Popover triggerTypes="hover">
        <PopoverTrigger>Hover me</PopoverTrigger>
        <PopoverContent>Popover on hover</PopoverContent>
      </Popover>
    ));

    const trigger = screen.getByText("Hover me");

    fireEvent.mouseEnter(trigger);
    expect(await screen.findByText("Popover on hover")).toBeInTheDocument();

    fireEvent.mouseLeave(trigger);
    expect(screen.queryByText("Popover on hover")).not.toBeInTheDocument();
  });

  it("closes on Escape key", async () => {
    render(() => (
      <Popover triggerTypes="click">
        <PopoverTrigger>Click to open</PopoverTrigger>
        <PopoverContent>Will close on ESC</PopoverContent>
      </Popover>
    ));

    fireEvent.click(screen.getByText("Click to open"));
    expect(await screen.findByText("Will close on ESC")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByText("Will close on ESC")).not.toBeInTheDocument();
  });
});
