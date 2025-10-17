import { render, screen } from "@solidjs/testing-library";
import { describe, expect, it } from "vitest";
import { DateField } from "./date-field";

describe("DateField Component", () => {
  it("renders the label correctly", () => {
    render(() => <DateField label="Test Label" />);
    expect(screen.getByText("Test Label")).toBeInTheDocument();
  });

  it("renders the required asterisk when required is true", () => {
    render(() => <DateField label="Test Label" required />);
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("renders the error message when error is provided", () => {
    render(() => <DateField error="This is an error" />);
    expect(screen.getByText("This is an error")).toBeInTheDocument();
  });

  it("applies the red border class when there is an error", () => {
    render(() => <DateField error="This is an error" />);
    const input = screen.getByTestId("date-input-container");
    expect(input).toHaveClass("border-red-500");
  });

  it("renders the Date Picker when useDatePicker is true", () => {
    render(() => <DateField useDatePicker={true} />);
    expect(screen.getByRole("spinbutton", { name: "calendar.year" })).toBeInTheDocument();
    expect(screen.getByLabelText("calendar.chooseDate")).toBeInTheDocument();
  });

  it("renders the DateInput component when useDatePicker is false", () => {
    render(() => <DateField useDatePicker={false} />);
    expect(screen.getByTestId("date-input")).toBeInTheDocument();
  });

  it("associates the label with the input field via the id", () => {
    render(() => <DateField label="Test Label" />);
    const label = screen.getByText("Test Label");
    const input = screen.getByTestId("date-input-container");
    expect(label).toHaveAttribute("for", input.id);
  });
});
