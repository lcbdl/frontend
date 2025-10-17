import { render, screen } from "@solidjs/testing-library";
import { describe, expect, it } from "vitest";
import { TextField, TextFieldProps } from "./text-field";

describe("TextField Component", () => {
  const defaultProps: TextFieldProps = {
    type: "text",
    name: "test-field",
    label: "Test Label",
    value: "",
    error: "",
    required: false,
    disabled: false,
  };

  it("renders the label when provided", () => {
    render(() => <TextField {...defaultProps} />);
    expect(screen.getByText("Test Label")).toBeInTheDocument();
  });

  it("does not render the label when not provided", () => {
    render(() => <TextField {...{ ...defaultProps, label: undefined }} />);
    expect(screen.queryByText("Test Label")).not.toBeInTheDocument();
  });

  it("renders the required asterisk when required is true", () => {
    render(() => <TextField {...{ ...defaultProps, required: true }} />);
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("renders the error message when error is provided", () => {
    const errorMessage = "This field is required.";
    render(() => <TextField {...{ ...defaultProps, error: errorMessage }} />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it("does not render the error message when error is not provided", () => {
    render(() => <TextField {...defaultProps} />);
    expect(screen.queryByText("This field is required.")).not.toBeInTheDocument();
  });

  it("applies the error class when error is provided", () => {
    const errorMessage = "This field is required.";
    render(() => <TextField {...{ ...defaultProps, error: errorMessage }} />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveClass("border-red-500");
  });

  it("does not apply the error class when error is not provided", () => {
    render(() => <TextField {...defaultProps} />);
    const input = screen.getByRole("textbox");
    expect(input).not.toHaveClass("border-red-500");
  });

  it("renders the input with the correct attributes", () => {
    render(() => <TextField {...defaultProps} />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("id", "test-field");
    expect(input).toHaveAttribute("aria-invalid", "false");
    expect(input).toHaveAttribute("aria-disabled", "false");
    expect(input).toHaveAttribute("aria-errormessage", "test-field-error");
  });

  it("renders the input as disabled when disabled is true", () => {
    render(() => <TextField {...{ ...defaultProps, disabled: true }} />);
    const input = screen.getByRole("textbox");
    expect(input).toBeDisabled();
  });

  it("renders the input with the correct value", () => {
    render(() => <TextField {...{ ...defaultProps, value: "Test Value" }} />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("Test Value");
  });
});
