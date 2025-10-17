import { fireEvent, render, screen } from "@solidjs/testing-library";
import { Component } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { RadioButtonField } from "./radio-button-field";

describe("<RadioButtonField />", () => {
  const baseProps = {
    label: "Test Question",
    name: "test-radio",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
  };

  it("renders with label and radio options", () => {
    render(() => <RadioButtonField {...baseProps} value={true} onChange={() => {}} />);

    expect(screen.getByText("Test Question")).toBeInTheDocument();
    expect(screen.getByLabelText("Yes")).toBeInTheDocument();
    expect(screen.getByLabelText("No")).toBeInTheDocument();
  });

  it("sets the correct radio as checked", () => {
    render(() => <RadioButtonField {...baseProps} value={false} onChange={() => {}} />);
    expect((screen.getByLabelText("No") as HTMLInputElement).checked).toBe(true);
    expect((screen.getByLabelText("Yes") as HTMLInputElement).checked).toBe(false);
  });

  it("calls onChange with true/false when clicked", async () => {
    const onChange = vi.fn();
    render(() => <RadioButtonField {...baseProps} value={false} onChange={onChange} />);

    fireEvent.click(screen.getByLabelText("Yes"));
    expect(onChange).toHaveBeenCalledWith(true);

    fireEvent.click(screen.getByLabelText("No"));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it("renders error message and applies error styles", () => {
    render(() => <RadioButtonField {...baseProps} value={false} error="This field is required" onChange={() => {}} />);
    expect(screen.getByText("This field is required")).toBeInTheDocument();
    expect(screen.getByRole("radiogroup")).toHaveAttribute("aria-invalid", "true");
  });

  it("respects required and disabled props", () => {
    render(() => <RadioButtonField {...baseProps} value={false} onChange={() => {}} required disabled />);

    const yesInput = screen.getByLabelText("Yes") as HTMLInputElement;
    const noInput = screen.getByLabelText("No") as HTMLInputElement;

    expect(yesInput).toBeDisabled();
    expect(noInput).toBeDisabled();
    expect(yesInput).toHaveAttribute("aria-required", "true");
  });

  it("does not crash when optional props are omitted", () => {
    const MinimalRadio: Component = () => (
      <RadioButtonField options={[{ label: "Yes", value: true }]} onChange={() => {}} />
    );
    render(() => <MinimalRadio />);
    expect(screen.getByLabelText("Yes")).toBeInTheDocument();
  });
});
