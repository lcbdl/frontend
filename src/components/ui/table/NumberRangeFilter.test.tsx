import { fireEvent, render, screen } from "@solidjs/testing-library";
import { describe, expect, it, vi } from "vitest";
import { NumberRangeFilter, RangeOption } from "./NumberRangeFilter";

const options: RangeOption[] = [
  { id: "1", label: "0 - 10", min: 0, max: 10 },
  { id: "2", label: "11 - 20", min: 11, max: 20 },
  { id: "3", label: "21 - 30", min: 21, max: 30 },
];

describe("<NumberRangeFilter />", () => {
  it("renders all filter options", () => {
    const mockOnChange = vi.fn();

    render(() => <NumberRangeFilter filterValue={[]} filterOptions={options} onChange={mockOnChange} />);

    options.forEach((option) => {
      expect(screen.getByLabelText(option.label)).toBeInTheDocument();
    });
  });

  it("checks checkboxes based on filterValue", () => {
    const mockOnChange = vi.fn();

    render(() => <NumberRangeFilter filterValue={[options[1]]} filterOptions={options} onChange={mockOnChange} />);

    expect(screen.getByLabelText("11 - 20")).toBeChecked();
    expect(screen.getByLabelText("0 - 10")).not.toBeChecked();
  });

  it("calls onChange with added range when checkbox is checked", async () => {
    const mockOnChange = vi.fn();

    render(() => <NumberRangeFilter filterValue={[]} filterOptions={options} onChange={mockOnChange} />);

    const checkbox = screen.getByLabelText("0 - 10");
    await fireEvent.click(checkbox);

    expect(mockOnChange).toHaveBeenCalledWith([options[0]]);
  });

  it("calls onChange with removed range when checkbox is unchecked", async () => {
    const mockOnChange = vi.fn();

    render(() => (
      <NumberRangeFilter filterValue={[options[0], options[1]]} filterOptions={options} onChange={mockOnChange} />
    ));

    const checkbox = screen.getByLabelText("0 - 10");
    await fireEvent.click(checkbox); // uncheck

    expect(mockOnChange).toHaveBeenCalledWith([options[1]]);
  });

  it("does not crash if no filterOptions are provided", () => {
    const mockOnChange = vi.fn();

    render(() => <NumberRangeFilter filterValue={[]} onChange={mockOnChange} />);

    expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
  });
});
