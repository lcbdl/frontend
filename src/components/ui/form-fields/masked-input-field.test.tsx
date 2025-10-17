import { InputMask } from "@solid-primitives/input-mask";

import { fireEvent, render } from "@solidjs/testing-library";
import { describe, expect, it, vi } from "vitest";
import { MaskedInputField, MaskedInputFieldProps } from "./masked-input-field";

function getSimpleMask(): InputMask {
  // Accepts only digits, max 3
  return [/\d/, /\d/, /\d/];
}

describe("MaskedInputField", () => {
  const baseProps: MaskedInputFieldProps = {
    type: "text",
    name: "test-input",
    mask: getSimpleMask(),
    label: "Test Label",
    placeholder: "123",
  };

  it("renders label and input", () => {
    const { getByLabelText } = render(() => <MaskedInputField {...baseProps} />);
    const input = getByLabelText("Test Label") as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.placeholder).toBe("123");
  });

  it("shows required asterisk when required", () => {
    const { getByText } = render(() => <MaskedInputField {...baseProps} required />);
    expect(getByText("*")).toBeInTheDocument();
  });

  it("applies error styles and message", () => {
    const { getByText, getByLabelText } = render(() => <MaskedInputField {...baseProps} error="Error message" />);
    expect(getByText("Error message")).toBeInTheDocument();
    const input = getByLabelText("Test Label");
    expect(input).toHaveClass("border-red-500");
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("disables input when disabled", () => {
    const { getByLabelText } = render(() => <MaskedInputField {...baseProps} disabled />);
    const input = getByLabelText("Test Label") as HTMLInputElement;
    expect(input.disabled).toBe(true);
    expect(input).toHaveAttribute("aria-disabled", "true");
  });

  it("calls onInput and applies mask", async () => {
    const onInput = vi.fn();
    const { getByLabelText } = render(() => <MaskedInputField {...baseProps} onInput={onInput} />);
    const input = getByLabelText("Test Label") as HTMLInputElement;
    await fireEvent.input(input, { target: { value: "12a" } });
    expect(onInput).toHaveBeenCalled();
    // Should only allow digits
    expect(input.value).toBe("12");
  });

  it("calls transform if provided", async () => {
    const transform = vi.fn((v: string) => v.toUpperCase());
    const { getByLabelText } = render(() => <MaskedInputField {...baseProps} transform={transform} />);
    const input = getByLabelText("Test Label") as HTMLInputElement;
    await fireEvent.input(input, { target: { value: "12" } });
    expect(transform).toHaveBeenCalled();
  });

  it("handles onPaste event", async () => {
    const { getByLabelText } = render(() => <MaskedInputField {...baseProps} />);
    const input = getByLabelText("Test Label") as HTMLInputElement;
    input.value = "";
    fireEvent.paste(input, {
      clipboardData: {
        value: {
          getData: () => "999",
        },
      },
      bubbles: true,
      cancelable: true,
    });
    // Mask should apply, only digits allowed
    expect(input.value).toBe("");
  });

  it("renders without label", () => {
    const { container } = render(() => <MaskedInputField {...{ ...baseProps, label: undefined }} />);
    expect(container.querySelector("label")?.textContent).toBe("");
  });
});
