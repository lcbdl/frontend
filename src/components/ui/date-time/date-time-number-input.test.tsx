import { simulateBeforeInput } from "@/utils/testing-utils";
import { cleanup, fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DateTimeNumberInput } from "./date-time-number-input";

beforeEach(() => {
  vi.resetModules();
  cleanup();
});

describe("NumberInput Component", () => {
  it("should render with default pattern when no value is provided", () => {
    render(() => <DateTimeNumberInput type="day" min={1} max={31} pattern="DD" />);
    const input = screen.getByRole("spinbutton");
    expect(input.textContent).toBe("DD");
  });

  it("should display padded value when value is provided", () => {
    render(() => <DateTimeNumberInput type="day" min={1} max={31} pattern="DD" value={5} />);
    const input = screen.getByRole("spinbutton");
    expect(input.textContent).toBe("05");
  });

  it("should handle numeric input", async () => {
    const onChange = vi.fn();
    render(() => <DateTimeNumberInput type="day" min={1} max={31} pattern="DD" onChange={onChange} />);
    const input = screen.getByRole("spinbutton");

    fireEvent.focus(input);
    simulateBeforeInput(input, "1");

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(1);
      expect(input.textContent).toBe("01");
    });
  });

  it("should reject non-numeric input", async () => {
    const onChange = vi.fn();
    render(() => <DateTimeNumberInput type="day" min={1} max={31} pattern="DD" onChange={onChange} />);
    const input = screen.getByRole("spinbutton");

    fireEvent.focus(input);
    simulateBeforeInput(input, "A");
    await waitFor(() => {
      expect(onChange).not.toHaveBeenCalled();
      expect(input.textContent).toBe("DD");
    });
  });

  it("should handle backspace/delete", async () => {
    const onChange = vi.fn();
    render(() => <DateTimeNumberInput type="day" min={1} max={31} pattern="DD" value={15} onChange={onChange} />);
    const input = screen.getByRole("spinbutton");

    fireEvent.focus(input);
    simulateBeforeInput(input, "");

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(undefined);
      expect(input.textContent).toBe("DD");
    });
  });

  it("should handle paste event with valid numbers", async () => {
    const onChange = vi.fn();
    render(() => <DateTimeNumberInput type="day" min={1} max={31} pattern="DD" onChange={onChange} />);
    const input = screen.getByRole("spinbutton");

    fireEvent.focus(input);
    fireEvent.paste(input, {
      clipboardData: { getData: () => "25" },
    });
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(25);
      expect(input.textContent).toBe("25");
    });
  });

  it("should reject paste event with non-numeric data", () => {
    const onChange = vi.fn();
    render(() => <DateTimeNumberInput type="day" min={1} max={31} pattern="DD" onChange={onChange} />);
    const input = screen.getByRole("spinbutton");

    fireEvent.focus(input);
    fireEvent.paste(input, {
      clipboardData: { getData: () => "AB" },
    });

    expect(onChange).not.toHaveBeenCalled();
    expect(input.textContent).toBe("DD");
  });

  it("should handle arrow key increments", async () => {
    const onChange = vi.fn();
    render(() => <DateTimeNumberInput type="day" min={1} max={31} pattern="DD" value={15} onChange={onChange} />);
    const input = screen.getByRole("spinbutton");

    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: "ArrowUp" });
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(16);
      expect(input.textContent).toBe("16");
    });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(15);
      expect(input.textContent).toBe("15");
    });
  });

  it("should respect min/max bounds with arrow keys", async () => {
    const onChange = vi.fn();
    render(() => <DateTimeNumberInput type="day" min={1} max={31} pattern="DD" value={1} onChange={onChange} />);
    const input = screen.getByRole("spinbutton");

    fireEvent.focus(input);
    // Try to go below min
    fireEvent.keyDown(input, { key: "ArrowDown" });
    await waitFor(() => {
      expect(onChange).not.toHaveBeenCalledWith(0);
      expect(input.textContent).toBe("01");
    });

    // Set to max and try to go above
    simulateBeforeInput(input, "31");
    fireEvent.keyDown(input, { key: "ArrowUp" });
    await waitFor(() => {
      expect(onChange).not.toHaveBeenCalledWith(32);
      expect(input.textContent).toBe("31");
    });
  });

  it("should handle navigation keys without changing value", () => {
    const onChange = vi.fn();
    render(() => <DateTimeNumberInput type="day" min={1} max={31} pattern="DD" value={15} onChange={onChange} />);
    const input = screen.getByRole("spinbutton");

    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: "ArrowLeft" });
    fireEvent.keyDown(input, { key: "ArrowRight" });
    fireEvent.keyDown(input, { key: "Tab" });
    fireEvent.keyDown(input, { key: "Home" });
    fireEvent.keyDown(input, { key: "End" });

    expect(onChange).not.toHaveBeenCalled();
    expect(input.textContent).toBe("15");
  });

  it("should select all text on focus", () => {
    render(() => <DateTimeNumberInput type="day" min={1} max={31} pattern="DD" value={15} />);
    const input = screen.getByRole("spinbutton");

    const selectNodeContentsMock = vi.fn();
    const mockRange = { selectNodeContents: selectNodeContentsMock };
    const mockSelection = { removeAllRanges: vi.fn(), addRange: vi.fn() };

    vi.spyOn(document, "createRange").mockImplementation(() => mockRange as any);
    vi.spyOn(window, "getSelection").mockImplementation(() => mockSelection as any);

    fireEvent.focus(input);

    expect(document.createRange).toHaveBeenCalled();
    expect(mockRange.selectNodeContents).toHaveBeenCalledWith(input);
    expect(mockSelection.removeAllRanges).toHaveBeenCalled();
    expect(mockSelection.addRange).toHaveBeenCalledWith(mockRange);
  });

  it("should trigger focus in/out callbacks", () => {
    const onFocusIn = vi.fn();
    const onFocusOut = vi.fn();
    render(() => (
      <DateTimeNumberInput type="day" min={1} max={31} pattern="DD" onFocusIn={onFocusIn} onFocusOut={onFocusOut} />
    ));
    const input = screen.getByRole("spinbutton");

    fireEvent.focusIn(input);
    expect(onFocusIn).toHaveBeenCalled();

    fireEvent.focusOut(input);
    expect(onFocusOut).toHaveBeenCalled();
  });
});
