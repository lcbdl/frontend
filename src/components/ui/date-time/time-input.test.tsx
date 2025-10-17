import { simulateBeforeInput } from "@/utils/testing-utils";
import { fireEvent, render } from "@solidjs/testing-library";
import { describe, expect, it, vi } from "vitest";
import { TimeInput } from "./time-input";

describe("TimeInput", () => {
  it("renders correctly with default props", () => {
    const { getByTestId } = render(() => <TimeInput />);
    const container = getByTestId("time-input-container");
    expect(container).toBeInTheDocument();
  });

  it("displays the correct initial value when provided", () => {
    const { getByTestId } = render(() => <TimeInput value="12:30" />);
    const input = getByTestId("time-input") as HTMLInputElement;
    expect(input.value).toBe("12:30");
  });

  it("calls onChange when time is updated", () => {
    const onChange = vi.fn();
    const { getByLabelText } = render(() => <TimeInput value="12:30" onChange={onChange} />);

    const hourInput = getByLabelText("calendar.hour") as HTMLInputElement;
    simulateBeforeInput(hourInput, "13");

    expect(onChange).toHaveBeenCalledWith("13:30");
  });

  it("handles invalid time values gracefully", () => {
    const { getByTestId } = render(() => <TimeInput value="invalid" />);
    const input = getByTestId("time-input") as HTMLInputElement;
    expect(input.value).toBe("");
  });

  it("disables the input when the disabled prop is true", () => {
    const { getByTestId } = render(() => <TimeInput disabled />);
    const input = getByTestId("time-input") as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it("handles focus and blur events correctly", () => {
    const onFocus = vi.fn();
    const { getByLabelText } = render(() => <TimeInput onFocus={onFocus} />);

    const hourInput = getByLabelText("calendar.hour") as HTMLInputElement;
    fireEvent.focus(hourInput);

    expect(onFocus).toHaveBeenCalled();
  });

  it("updates the minute value correctly", () => {
    const onChange = vi.fn();
    const { getByLabelText } = render(() => <TimeInput value="12:30" onChange={onChange} />);

    const minuteInput = getByLabelText("calendar.minute") as HTMLInputElement;
    simulateBeforeInput(minuteInput, "45");

    expect(onChange).toHaveBeenCalledWith("12:45");
  });

  it("renders custom class when provided", () => {
    const { getByTestId } = render(() => <TimeInput class="custom-class" />);
    const container = getByTestId("time-input-container");
    expect(container).toHaveClass("custom-class");
  });

  it("focuses the previous input when ArrowLeft is pressed", () => {
    const { getByLabelText } = render(() => <TimeInput value="12:30" />);

    const minuteInput = getByLabelText("calendar.minute") as HTMLInputElement;
    const hourInput = getByLabelText("calendar.hour") as HTMLInputElement;

    fireEvent.keyDown(minuteInput, { key: "ArrowLeft" });

    expect(document.activeElement).toBe(hourInput);
  });

  it("focuses the next input when ArrowRight is pressed", () => {
    const { getByLabelText } = render(() => <TimeInput value="12:30" />);

    const hourInput = getByLabelText("calendar.hour") as HTMLInputElement;
    const minuteInput = getByLabelText("calendar.minute") as HTMLInputElement;

    fireEvent.keyDown(hourInput, { key: "ArrowRight" });

    expect(document.activeElement).toBe(minuteInput);
  });
});
