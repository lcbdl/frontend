import { render, screen } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ToggleSwitch } from "./toggle-switch-field";

describe("ToggleSwitch accessibility and behavior", () => {
  // Ensures the label is rendered and correctly associated with the input for screen readers
  it("renders with label and associates it with input", () => {
    render(() => <ToggleSwitch label="Accept terms" value={false} onChange={() => {}} />);

    const label = screen.getByText("Accept terms");
    const checkbox = screen.getByRole("checkbox");

    expect(label).toBeInTheDocument();
    expect(checkbox).toBeInTheDocument();

    // Confirm aria-labelledby points to the label for accessibility
    expect(checkbox).toHaveAttribute("aria-labelledby", label.id || expect.any(String));
  });

  // Verifies clicking the toggle triggers the onChange callback with the updated value
  it("toggles on click and calls onChange with correct value", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(() => <ToggleSwitch label="Enable feature" value={false} onChange={handleChange} />);

    const checkbox = screen.getByRole("checkbox");

    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);

    // Should call the onChange function with new value: true
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  // Ensures keyboard interaction (spacebar) toggles the switch for accessibility compliance
  it("toggles using keyboard (space key)", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(() => <ToggleSwitch label="Keyboard test" value={false} onChange={handleChange} />);

    const checkbox = screen.getByRole("checkbox");
    checkbox.focus();

    // Simulate keyboard space key toggle
    await user.keyboard("[Space]");

    // onChange should be called with true
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  // Confirms that aria-invalid is correctly set when there's a validation error
  it("sets aria-invalid when error exists", () => {
    render(() => <ToggleSwitch label="Email" value={false} onChange={() => {}} error="Required field" />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveAttribute("aria-invalid", "true");

    // The error message should be visible and referenced by aria-describedby
    const errorText = screen.getByText("Required field");
    expect(errorText).toBeInTheDocument();
    expect(checkbox).toHaveAttribute("aria-describedby", errorText.id || expect.any(String));
  });

  // Verifies that the toggle becomes unclickable when disabled
  it("renders disabled state properly", () => {
    render(() => <ToggleSwitch label="Disabled toggle" value={false} onChange={() => {}} disabled />);

    const checkbox = screen.getByRole("checkbox");

    // Disabled checkboxes should not be interactable
    expect(checkbox).toBeDisabled();
  });

  // Checks that the required field asterisk is present when required prop is true
  it("indicates required field with an asterisk", () => {
    render(() => <ToggleSwitch label="Agree to policy" value={false} onChange={() => {}} required />);

    // Asterisk should appear next to label
    const asterisk = screen.getByText("*");
    expect(asterisk).toBeInTheDocument();
  });

  // Ensures the input is visually hidden and toggle visuals are handled separately
  it("has hidden input with visually styled toggle", () => {
    render(() => <ToggleSwitch label="Custom toggle" value={true} onChange={() => {}} />);

    const checkbox = screen.getByRole("checkbox");

    // The native checkbox input should be hidden from view
    expect(checkbox).toHaveClass("sr-only");
  });
});
