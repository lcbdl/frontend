import { fireEvent, render, screen } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TimePicker } from "./time-picker";

// Timer setup
beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllTimers();
});

afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
});

describe("TimePicker", () => {
  it("renders the TimePicker component", () => {
    render(() => <TimePicker value="12:30" onChange={vi.fn()} />);
    expect(screen.getByDisplayValue("12:30")).toBeInTheDocument();
  });

  it("opens the time picker when the clock button is clicked", async () => {
    render(() => <TimePicker value="12:30" onChange={vi.fn()} />);
    const clockButton = screen.getByRole("button", { name: /chooseTime/i });
    fireEvent.click(clockButton);
    expect(screen.getByRole("region", { name: /chooseTime/i })).toBeInTheDocument();
  });

  it("closes the time picker when clicking outside", async () => {
    render(() => <TimePicker value="12:30" onChange={vi.fn()} />);
    const clockButton = screen.getByRole("button", { name: /chooseTime/i });
    fireEvent.click(clockButton);
    expect(screen.getByRole("region", { name: /chooseTime/i })).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    vi.advanceTimersByTime(300); // Allow time for the click event to propagate
    expect(screen.queryByRole("region", { name: /chooseTime/i })).not.toBeInTheDocument();
  });

  it("calls onChange with the selected time", async () => {
    const handleChange = vi.fn();
    render(() => <TimePicker value="12:30" onChange={handleChange} />);
    const clockButton = screen.getByRole("button", { name: /chooseTime/i });
    fireEvent.click(clockButton);

    const hourButton = screen.getByRole("button", { name: /hour: 14/i });
    fireEvent.click(hourButton);

    const minuteButton = screen.getByRole("button", { name: /minute: 45/i });
    fireEvent.click(minuteButton);

    const okButton = screen.getByRole("button", { name: /ok/i });
    fireEvent.click(okButton);
    expect(handleChange).toHaveBeenCalledOnce();
    expect(handleChange).toHaveBeenCalledWith("14:45");
  });

  it("resets to the previous time when cancel is clicked", async () => {
    const handleChange = vi.fn();
    render(() => <TimePicker value="12:30" onChange={handleChange} />);
    const clockButton = screen.getByRole("button", { name: /chooseTime/i });
    fireEvent.click(clockButton);

    const hourButton = screen.getByRole("button", { name: /hour: 14/i });
    fireEvent.click(hourButton);

    const minuteButton = screen.getByRole("button", { name: /minute: 45/i });
    fireEvent.click(minuteButton);

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(screen.getByDisplayValue("12:30")).toBeInTheDocument();
    expect(handleChange).not.toHaveBeenCalled();
  });

  it("changes time, but does not trigger onChange when changes value prop externally", async () => {
    const handleChange = vi.fn();
    render(() => {
      const [value, setValue] = createSignal("01:12");
      return (
        <>
          <TimePicker value={value()} onChange={handleChange} />
          <button type="button" onClick={() => setValue("12:25")}>
            Change
          </button>
        </>
      );
    });
    // expect(screen.getByDisplayValue("01:12")).toBeInTheDocument();
    expect(handleChange).not.toHaveBeenCalled();
    const changeButton = screen.getByRole("button", { name: "Change" });
    const hiddenInput = screen.getByTestId("time-input");

    expect(hiddenInput).toHaveValue("01:12");

    console.log(changeButton);
    fireEvent.click(changeButton);

    expect(hiddenInput).toHaveValue("12:25");
    expect(handleChange).not.toHaveBeenCalled();
  });

  it("handles keyboard navigation in the time picker", async () => {
    render(() => <TimePicker value="12:30" onChange={vi.fn()} />);
    const clockButton = screen.getByRole("button", { name: /chooseTime/i });
    fireEvent.click(clockButton);

    const hourButton = screen.getByRole("button", { name: /hour: 12/i });
    hourButton.focus();

    fireEvent.keyDown(hourButton, { key: "ArrowDown" });
    expect(screen.getByRole("button", { name: /hour: 13/i })).toHaveFocus();

    fireEvent.keyDown(hourButton, { key: "ArrowUp" });
    expect(screen.getByRole("button", { name: /hour: 12/i })).toHaveFocus();

    fireEvent.keyDown(hourButton, { key: "Home" });
    expect(screen.getByRole("button", { name: /hour: 00/i })).toHaveFocus();

    fireEvent.keyDown(hourButton, { key: "End" });
    expect(screen.getByRole("button", { name: /hour: 23/i })).toHaveFocus();

    const minuteButton = screen.getByRole("button", { name: /minute: 30/i });
    minuteButton.focus();

    fireEvent.keyDown(minuteButton, { key: "ArrowDown" });
    expect(screen.getByRole("button", { name: /minute: 31/i })).toHaveFocus();

    fireEvent.keyDown(minuteButton, { key: "ArrowUp" });
    expect(screen.getByRole("button", { name: /minute: 30/i })).toHaveFocus();

    fireEvent.keyDown(minuteButton, { key: "Home" });
    expect(screen.getByRole("button", { name: /minute: 00/i })).toHaveFocus();

    fireEvent.keyDown(minuteButton, { key: "End" });
    expect(screen.getByRole("button", { name: /minute: 59/i })).toHaveFocus();

    fireEvent.keyDown(minuteButton, { key: "Escape" });
    vi.advanceTimersByTime(300); // Allow time for the click event to propagate
    expect(screen.queryByRole("region", { name: /chooseTime/i })).not.toBeInTheDocument();
  });
});
