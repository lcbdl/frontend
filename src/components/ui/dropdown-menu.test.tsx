import { fireEvent, render, screen } from "@solidjs/testing-library";
import { For } from "solid-js";
import { describe, expect, it } from "vitest";
import { DropdownMenu, MenuItemType } from "./dropdown-menu";

describe("DropdownMenu", () => {
  const menuItems: MenuItemType[] = [
    { label: "Item 1", href: "/item1" },
    { label: "Item 2", href: "/item2" },
  ];

  const MenuContent = () => (
    <ul>
      <For each={menuItems}>
        {(item) => (
          <li>
            <a href={item.href}>{item.label}</a>
          </li>
        )}
      </For>
    </ul>
  );

  it("renders trigger as string", () => {
    render(() => (
      <DropdownMenu trigger="Open Menu">
        <MenuContent />
      </DropdownMenu>
    ));
    expect(screen.getByText("Open Menu")).toBeInTheDocument();
  });

  it("renders trigger as JSX element", () => {
    render(() => (
      <DropdownMenu trigger={<span>JSX Trigger</span>}>
        <MenuContent />
      </DropdownMenu>
    ));
    expect(screen.getByText("JSX Trigger")).toBeInTheDocument();
  });

  it("renders trigger as function", () => {
    render(() => (
      <DropdownMenu trigger={() => <span>Function Trigger</span>}>
        <MenuContent />
      </DropdownMenu>
    ));
    expect(screen.getByText("Function Trigger")).toBeInTheDocument();
  });

  it("shows menu content when trigger is clicked", async () => {
    render(() => (
      <DropdownMenu trigger="Open Menu">
        <MenuContent />
      </DropdownMenu>
    ));
    const trigger = screen.getByText("Open Menu");
    fireEvent.click(trigger);
    expect(screen.getByText("Item 1")).toBeVisible();
    expect(screen.getByText("Item 2")).toBeVisible();
  });

  it("hides menu content on mouse leave", async () => {
    render(() => (
      <DropdownMenu trigger="Open Menu">
        <MenuContent />
      </DropdownMenu>
    ));
    const trigger = screen.getByText("Open Menu");
    fireEvent.click(trigger);
    expect(screen.getByText("Item 1")).toBeVisible();

    // Simulate mouse leave on the dropdown-menu container
    const container = trigger.closest(".dropdown-menu")!;
    fireEvent.mouseLeave(container);
    // The content should be hidden (opacity-0, pointer-events-none)
    expect(screen.getByText("Item 1").closest("div")).toHaveClass("opacity-0");
  });

  it("ChevronDown rotates when expanded", async () => {
    render(() => (
      <DropdownMenu trigger="Open Menu">
        <MenuContent />
      </DropdownMenu>
    ));
    const trigger = screen.getByText("Open Menu");
    fireEvent.click(trigger);
    // Find the SVG icon
    const chevron = document.querySelector("svg");
    expect(chevron?.className.baseVal).toContain("rotate-180");
  });

  it("menu content is not visible by default", () => {
    render(() => (
      <DropdownMenu trigger="Open Menu">
        <MenuContent />
      </DropdownMenu>
    ));
    expect(screen.getByText("Item 1").closest("div")).toHaveClass("opacity-0");
  });
});
