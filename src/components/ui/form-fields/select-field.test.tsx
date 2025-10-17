import { fireEvent, render } from "@solidjs/testing-library";
import { describe, expect, it, vi } from "vitest";
import { SelectField, SelectFieldProps } from "./select-field";

// Common props reused in most tests
const defaultProps: SelectFieldProps = {
  label: "Pick a color",
  options: [
    { label: "Red", value: "#FF0000" },
    { label: "Green", value: "#00FF00" },
    { label: "Blue", value: "#0000FF" },
  ],
  value: "",
  onChange: vi.fn(),
};

describe("SelectField", () => {
  // Test: Renders select field with label and all options
  it("renders label and all options", () => {
    const { getByLabelText, getByText } = render(() => <SelectField {...defaultProps} />);
    const select = getByLabelText("Pick a color") as HTMLSelectElement;

    expect(select).toBeInTheDocument();
    expect(getByText("Red")).toBeInTheDocument();
    expect(getByText("Green")).toBeInTheDocument();
    expect(getByText("Blue")).toBeInTheDocument();
  });

  // Test: Calls onChange with selected value (single-select)
  it("calls onChange with selected value in single-select mode", async () => {
    const onChange = vi.fn();
    const multiProps = {
      ...defaultProps,
      multiple: false,
      value: "",
      onChange,
    };

    const { getByRole, container } = render(() => <SelectField {...multiProps} />);

    const button = getByRole("button");
    await fireEvent.click(button);
    const options = container.querySelectorAll('[role="option"]');
    const redOption = Array.from(options).find((opt) => opt.textContent === "Red");
    if (!redOption) throw new Error("Red option not found");
    await fireEvent.click(redOption);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("#FF0000");
  });

  // Test: Displays an error and sets accessibility attributes when error is passed
  it("displays an error message and sets aria attributes when error is provided", () => {
    const { getByText, getByLabelText } = render(() => <SelectField {...defaultProps} error="Selection is required" />);

    const select = getByLabelText("Pick a color") as HTMLSelectElement;
    expect(select.getAttribute("aria-invalid")).toBe("true");
    expect(getByText("Selection is required")).toBeInTheDocument();
  });

  // Test: Adds asterisk and ARIA when required
  it("applies required asterisk and aria-required when required is true", () => {
    const { getByText, getByLabelText } = render(() => <SelectField {...defaultProps} required />);

    const select = getByLabelText(/pick a color/i) as HTMLSelectElement;
    expect(select.getAttribute("aria-required")).toBe("true");
    expect(getByText("*")).toBeInTheDocument(); // Asterisk appears in label
  });

  // Test: Select field respects the disabled attribute
  it("renders with disabled state", () => {
    const { getByLabelText } = render(() => <SelectField {...defaultProps} disabled />);

    const select = getByLabelText("Pick a color") as HTMLSelectElement;
    expect(select.disabled).toBe(true);
  });

  // Test: Placeholder option appears when no value is selected and required
  it("shows placeholder option when no value is selected", () => {
    const { getByText } = render(() => <SelectField {...defaultProps} required />);
    const placeholder = getByText("Select an option");
    expect(placeholder).toBeInTheDocument();
  });

  // Test: The selected value is correctly reflected in the DOM
  it("marks selected value correctly", () => {
    const { getByLabelText } = render(() => <SelectField {...defaultProps} value="#FF0000" multiple={false} />);
    const select = getByLabelText("Pick a color") as HTMLSelectElement;
    expect(select.value).toBe("#FF0000");
  });

  // Test: Select field can be focused using keyboard (important for WCAG - Keyboard Accessibility)
  it("can be focused via keyboard", async () => {
    const { getByLabelText } = render(() => <SelectField {...defaultProps} />);
    const select = getByLabelText("Pick a color") as HTMLSelectElement;
    select.focus();
    expect(document.activeElement).toBe(select);
  });

  // Test: Label is properly associated with the select element via htmlFor and id (important for WCAG)
  it("label is associated with select via htmlFor/id", () => {
    const { container } = render(() => <SelectField {...defaultProps} />);
    const label = container.querySelector("label");
    const select = container.querySelector("select");
    expect(label?.getAttribute("for")).toBe(select?.id);
  });

  // Test: Multi-select - renders selected pills and calls onChange with updated values
  it("handles multiple selections correctly", async () => {
    const onChange = vi.fn();
    const multiProps = { ...defaultProps, multiple: true, value: [], onChange };

    const { container, getByRole } = render(() => <SelectField {...multiProps} />);

    // Open dropdown
    const button = getByRole("button");
    await fireEvent.click(button);

    // Get all option divs with role="option"
    const options = container.querySelectorAll('[role="option"]');

    // Click "Red" option
    const redOption = Array.from(options).find((opt) => opt.textContent === "Red");
    if (redOption) await fireEvent.click(redOption);

    expect(onChange).toHaveBeenCalledWith(["#FF0000"]);

    // Click "Green" option
    const greenOption = Array.from(options).find((opt) => opt.textContent === "Green");
    if (greenOption) await fireEvent.click(greenOption);

    expect(onChange).toHaveBeenCalledWith(["#00FF00"]);
  });

  // Test: Multi-select - renders pills correctly for selected options
  it("displays selected options as pills in multi-select mode", () => {
    const multiProps: SelectFieldProps = {
      ...defaultProps,
      multiple: true,
      value: ["#FF0000", "#00FF00"],
      onChange: vi.fn(),
    };

    const { container } = render(() => <SelectField {...multiProps} />);

    // Select the pills container — adjust the selector to match your actual pills container
    const pillsContainer = container.querySelector("div.flex.flex-wrap");
    if (!pillsContainer) throw new Error("Pills container not found");

    const pills = Array.from(pillsContainer.querySelectorAll("span, div")).map((el) => el.textContent);

    expect(pills).toContain("Red");
    expect(pills).toContain("Green");
  });

  // Test: Multi-select - hidden native <select> includes correct option values
  it("renders correct <option> elements in hidden <select multiple>", () => {
    const value = ["#00FF00", "#0000FF"];
    const { container } = render(() => <SelectField {...defaultProps} multiple value={value} onChange={vi.fn()} />);

    const hiddenSelect = container.querySelector("select[multiple]") as HTMLSelectElement;
    const optionValues = Array.from(hiddenSelect.options).map((opt) => opt.value);

    // Assert that all expected values are present in the <option> list
    expect(optionValues).toEqual(expect.arrayContaining(value));
  });
});
