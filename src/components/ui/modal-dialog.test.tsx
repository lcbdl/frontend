import { fireEvent, render, screen } from "@solidjs/testing-library";
import { describe, expect, it, vi } from "vitest";
import { Modal } from "./modal-dialog";

describe("Modal", () => {
  it("renders correctly when open", () => {
    render(() => (
      <Modal open={true} onClose={() => {}} title="Test Modal">
        <p>Modal Content</p>
      </Modal>
    ));
    expect(screen.findAllByRole("dialog")).toBeTruthy();
    expect(screen.getByText("Test Modal")).toBeInTheDocument();
    expect(screen.getByText("Modal Content")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    const { container } = render(() => (
      <Modal open={false} onClose={() => {}} title="Test Modal">
        <p>Modal Content</p>
      </Modal>
    ));
    expect(container.querySelector('[role="dialog"]')).toBeFalsy();
  });

  it("calls onClose when close button is clicked", async () => {
    const onClose = vi.fn();
    render(() => <Modal open={true} onClose={onClose} showCloseButton={true} />);
    const closeButton = screen.getByLabelText("Close dialog");
    closeButton.click();
    expect(onClose).toHaveBeenCalled();
  });

  it("traps focus within the modal", async () => {
    render(() => (
      <Modal open={true} onClose={() => {}} showCloseButton={false}>
        <button>Button 1</button>
        <button>Button 2</button>
      </Modal>
    ));

    const buttons = screen.getAllByRole("button");
    buttons[0].focus();
    expect(document.activeElement).toBe(buttons[0]);

    // Focus the last button
    buttons[buttons.length - 1].focus();
    expect(document.activeElement).toBe(buttons[buttons.length - 1]);

    // Simulate Tab key press (should wrap to first element)
    fireEvent.keyDown(document, { key: "Tab" });

    // Expect focus to cycle back to first button
    expect(document.activeElement).toBe(buttons[0]);
  });

  it("closes modal on Escape key press", () => {
    const onClose = vi.fn();
    render(() => <Modal open={true} onClose={onClose} />);
    const escapeEvent = new KeyboardEvent("keydown", { key: "Escape" });
    window.dispatchEvent(escapeEvent);
    expect(onClose).toHaveBeenCalled();
  });
});
