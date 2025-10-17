import { CheckboxField } from "@/components/ui/form-fields/checkbox-field";
import { fireEvent, render, screen } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vitest";

describe("CheckboxField", () => {
  // Test: single checkbox behaves correctly when value is a boolean
  it("renders a single checkbox when value is boolean", () => {
    const handleChange = vi.fn();

    render(() => <CheckboxField label="Accept terms" value={false} onChange={handleChange} name="terms" />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();

    // Simulate click, expect `onChange` to be called with `true`
    fireEvent.click(checkbox);
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  // Test: multiple checkboxes render and toggle correctly with string[] value
  it("renders multiple checkboxes when value is an array", () => {
    const options = [
      { label: "Option A", value: "a" },
      { label: "Option B", value: "b" },
    ];

    const [value, setValue] = createSignal<string[]>(["a"]);
    const handleChange = vi.fn((val) => setValue(val));

    render(() => (
      <CheckboxField label="Choose options" options={options} value={value()} onChange={handleChange} name="options" />
    ));

    const checkboxes = screen.getAllByRole("checkbox");

    expect(checkboxes.length).toBe(2);
    expect(checkboxes[0]).toBeChecked(); // 'a' should be checked
    expect(checkboxes[1]).not.toBeChecked(); // 'b' should not be

    // Simulate checking 'Option B'
    fireEvent.click(checkboxes[1]);
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenNthCalledWith(1, ["a", "b"]);

    // Simulate unchecking 'Option A'
    fireEvent.click(checkboxes[0]);
    expect(handleChange).toHaveBeenCalledTimes(2);
    expect(handleChange).toHaveBeenNthCalledWith(2, ["b"]);
  });

  // Test: error message is shown and associated ARIA props are applied
  it("displays error message and applies accessibility attributes", () => {
    render(() => (
      <CheckboxField label="Accept terms" value={false} onChange={() => {}} error="You must accept" name="terms" />
    ));

    const checkbox = screen.getByRole("checkbox");
    const errorText = screen.getByText("You must accept");

    expect(checkbox).toHaveAttribute("aria-invalid", "true");
    expect(checkbox).toHaveAttribute("aria-describedby", errorText.getAttribute("id"));
    expect(errorText).toBeInTheDocument();
  });

  // Test: label includes asterisk if the field is required
  it("shows label and asterisk if required", () => {
    render(() => <CheckboxField label="Agree to rules" value={false} onChange={() => {}} required name="rules" />);

    // Get all labels by their text content
    const labels = screen.queryAllByText("Agree to rules");

    // Find the label that contains the asterisk (*)
    const requiredLabel = labels.find((label) => label.textContent?.includes("*"));

    // Check that the required label with asterisk exists
    expect(requiredLabel).toBeInTheDocument();

    // Ensure the label text contains the asterisk
    expect(requiredLabel?.textContent).toContain("*");
  });

  // Test: disabled checkbox cannot be interacted with
  it("respects disabled state", () => {
    const handleChange = vi.fn();

    render(() => (
      <CheckboxField label="Disabled checkbox" value={false} onChange={handleChange} disabled name="disabled" />
    ));

    const checkbox = screen.getByRole("checkbox");

    expect(checkbox).toBeDisabled();

    // Should not call onChange when disabled
    fireEvent.click(checkbox);

    // Ensure handleChange was not called
    expect(handleChange).not.toHaveBeenCalled();
  });

  // Test: label is associated correctly with input (WCAG)
  it("associates label with checkbox input correctly", () => {
    const label = "Test label";
    render(() => <CheckboxField label={label} value={false} onChange={() => {}} name="test" />);

    const checkbox = screen.getByRole("checkbox");
    const labelElements = screen.queryAllByText(label);
    const labelElement = labelElements[0]; // Select the first label
    expect(labelElement).toHaveAttribute("for", checkbox.id);
  });
});
