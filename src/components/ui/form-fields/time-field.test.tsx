import { simulateBeforeInput } from "@/utils/testing-utils";
import { render, screen } from "@solidjs/testing-library";
import { describe, expect, it, vi } from "vitest";
import { TimeField } from "./time-field";

describe("TimeField Component", () => {
  it("renders the label and required indicator", () => {
    render(() => <TimeField label="Test Label" required={true} />);
    expect(screen.getByText("Test Label")).toBeInTheDocument();
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("renders TimePicker when useTimePicker is true", () => {
    render(() => <TimeField useTimePicker={true} />);
    expect(screen.getByRole("button", { name: /chooseTime/i })).toBeInTheDocument();
  });

  it("renders TimeInput when useTimePicker is false", () => {
    render(() => <TimeField useTimePicker={false} />);
    expect(screen.queryByRole("button", { name: /chooseTime/i })).not.toBeInTheDocument();
  });

  it("displays an error message when error prop is provided", () => {
    render(() => <TimeField error="This is an error" name="time" />);
    expect(screen.getByText("This is an error")).toBeInTheDocument();
  });

  it("applies red border when error is present", () => {
    render(() => <TimeField error="This is an error" />);
    const input = screen.getByTestId("time-input-container");
    expect(input).toHaveClass("border-red-500");
  });

  it("calls onInput handler when input changes", async () => {
    const onInputMock = vi.fn();
    render(() => <TimeField onInput={onInputMock} />);
    const hourInput = screen.getByRole("spinbutton", { name: /hour/i });
    simulateBeforeInput(hourInput, "12");
    const minuteInput = screen.getByRole("spinbutton", { name: /minute/i });
    simulateBeforeInput(minuteInput, "59");
    expect(onInputMock).toHaveBeenCalled();
  });
});
