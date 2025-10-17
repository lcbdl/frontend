import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { Component } from "solid-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SnackbarProvider, SnackbarVariantType, useSnackbar } from "./snackbar.tsx";

// Timer setup
beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllTimers();
});

afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
});

// Helper component
const SnackbarTester: Component<{ options?: Parameters<ReturnType<typeof useSnackbar>["open"]>[0] }> = (props) => {
  const { open } = useSnackbar();
  return <button onClick={() => open(props.options || { message: "Default message" })}>Show Snackbar</button>;
};

const renderWithProvider = (options?: Parameters<ReturnType<typeof useSnackbar>["open"]>[0]) =>
  render(() => (
    <SnackbarProvider>
      <SnackbarTester options={options} />
    </SnackbarProvider>
  ));

describe("Snackbar", () => {
  it("renders and displays message", () => {
    renderWithProvider({ message: "Test Message" });
    fireEvent.click(screen.getByText("Show Snackbar"));
    expect(screen.getByText("Test Message")).toBeVisible();
  });

  it("auto-hides after specified duration", async () => {
    renderWithProvider({ message: "Auto-hide message", autoHideDuration: 3000 });
    fireEvent.click(screen.getByText("Show Snackbar"));

    expect(screen.getByText("Auto-hide message")).toBeVisible();
    vi.advanceTimersByTime(3500); // Wait for more time to allow animation.

    await waitFor(() => {
      expect(screen.queryByText("Auto-hide message")).not.toBeInTheDocument();
    });
  });

  it("closes when Escape key is pressed", async () => {
    renderWithProvider({ message: "Escape to close" });
    fireEvent.click(screen.getByText("Show Snackbar"));
    expect(screen.getByText("Escape to close")).toBeVisible();

    fireEvent.keyDown(window, { key: "Escape" });

    // Advance timers by the duration of the animation delay
    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(screen.queryByText("Escape to close")).not.toBeInTheDocument();
    });
  });

  it("focuses close button on Tab key press", async () => {
    renderWithProvider({ message: "Tab to focus" });
    fireEvent.click(screen.getByText("Show Snackbar"));

    const closeButton = screen.getByRole("button", { name: /close/i });
    expect(closeButton).not.toHaveFocus();

    fireEvent.keyDown(window, { key: "Tab" });

    await waitFor(() => {
      expect(closeButton).toHaveFocus();
    });
  });

  it.each([
    ["success", "bg-green-600"],
    ["error", "bg-red-600"],
    ["info", "bg-blue-600"],
    ["warning", "bg-yellow-500"],
    ["unknown", "bg-gray-700"], // fallback
  ] as const)("applies correct background color for variant '%s'", async (variant, expectedClass) => {
    renderWithProvider({ message: `Variant ${variant}`, variant: variant as SnackbarVariantType });

    fireEvent.click(screen.getByText("Show Snackbar"));

    const snackbar = screen.queryByRole("alert") || screen.queryByRole("status");
    expect(snackbar?.className).toContain(expectedClass);
  });

  it.each([
    [{ horizontal: "left", vertical: "top" }, "left-4", "top-4"],
    [{ horizontal: "right", vertical: "bottom" }, "right-4", "bottom-4"],
    [{ horizontal: "center", vertical: "center" }, "left-1/2", "bottom-4"], // center uses default bottom
  ] as const)("positions snackbar correctly for anchorOrigin %j", async (anchorOrigin, expectedX, expectedY) => {
    renderWithProvider({ message: "Position Test", anchorOrigin });

    fireEvent.click(screen.getByText("Show Snackbar"));

    const snackbar = screen.queryByRole("alert") || screen.queryByRole("status");
    expect(snackbar?.className).toContain(expectedX);
    expect(snackbar?.className).toContain(expectedY);
  });
});
