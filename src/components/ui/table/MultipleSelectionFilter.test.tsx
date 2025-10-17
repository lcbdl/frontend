import { fireEvent, render, screen } from "@solidjs/testing-library";
import { describe, expect, it, vi } from "vitest";
import { MultipleSelectionFilter } from "./MultipleSelectionFilter";

describe("MultipleSelectionFilter", () => {
  const options = ["Option A", "Option B", "Option C"];

  it("renders all filter options as checkboxes", () => {
    const onChange = vi.fn();

    render(() => <MultipleSelectionFilter id="test" filterValue={[]} filterOptions={options} onChange={onChange} />);

    options.forEach((option) => {
      expect(screen.getByLabelText(option)).toBeInTheDocument();
      expect(screen.getByRole("checkbox", { name: option })).not.toBeChecked();
    });
  });

  it("pre-checks values passed via filterValue", () => {
    const onChange = vi.fn();

    render(() => (
      <MultipleSelectionFilter id="test" filterValue={["Option B"]} filterOptions={options} onChange={onChange} />
    ));

    expect(screen.getByLabelText("Option B")).toBeChecked();
    expect(screen.getByLabelText("Option A")).not.toBeChecked();
    expect(screen.getByLabelText("Option C")).not.toBeChecked();
  });

  it("calls onChange with added value when checkbox is checked", async () => {
    const onChange = vi.fn();

    render(() => <MultipleSelectionFilter id="test" filterValue={[]} filterOptions={options} onChange={onChange} />);

    const checkbox = screen.getByLabelText("Option A");
    await fireEvent.click(checkbox);

    expect(onChange).toHaveBeenCalledWith(["Option A"]);
  });

  it("calls onChange with removed value when checkbox is unchecked", async () => {
    const onChange = vi.fn();

    render(() => (
      <MultipleSelectionFilter
        id="test"
        filterValue={["Option A", "Option B"]}
        filterOptions={options}
        onChange={onChange}
      />
    ));

    const checkbox = screen.getByLabelText("Option A");
    await fireEvent.click(checkbox);

    expect(onChange).toHaveBeenCalledWith(["Option B"]);
  });

  it("renders nothing if filterOptions is empty or undefined", () => {
    const onChange = vi.fn();

    render(() => <MultipleSelectionFilter id="test" filterValue={[]} onChange={onChange} />);

    expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
  });
});
