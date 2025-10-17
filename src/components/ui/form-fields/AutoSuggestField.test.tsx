// AutoSuggestField.test.tsx
import { createTestWrapper } from "@/utils/TestWrapper";
import { render, screen } from "@solidjs/testing-library";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AutoSuggestField, AutoSuggestFieldProps } from "./AutoSuggestField";

// Mock the cn utility
vi.mock("@/utils/cls-util", () => ({
  cn: (...classes: (string | boolean | undefined | { [key: string]: boolean })[]) => {
    return classes
      .filter(Boolean)
      .map((cls) => {
        if (typeof cls === "object") {
          return Object.entries(cls)
            .filter(([, value]) => value)
            .map(([key]) => key)
            .join(" ");
        }
        return cls;
      })
      .join(" ");
  },
}));

// Mock AutoSuggestInput component
vi.mock("../AutoSuggestInput", () => ({
  AutoSuggestInput: (props: any) => (
    <input
      data-testid="autosuggest-input"
      id={props.id}
      class={props.class}
      value={props.value}
      disabled={props.disabled}
      aria-invalid={props["aria-invalid"]}
      aria-disabled={props["aria-disabled"]}
      aria-errormessage={props["aria-errormessage"]}
      placeholder={props.placeholder}
    />
  ),
}));

// Mock ShowError component
vi.mock("../ShowError", () => ({
  ShowError: (props: { errorId: string; error: string }) => (
    <div data-testid="show-error" id={props.errorId}>
      {props.error}
    </div>
  ),
}));

describe("AutoSuggestField", () => {
  const mockFetchFn = vi.fn();
  const mockOnSelect = vi.fn();

  const defaultProps: AutoSuggestFieldProps = {
    fetchFn: mockFetchFn,
    onSelect: mockOnSelect,
    name: "test-field",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders basic field without label", () => {
    render(() => <AutoSuggestField {...defaultProps} />, {
      wrapper: createTestWrapper(),
    });

    const input = screen.getByTestId("autosuggest-input");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("id", "test-field");

    // Should not render label
    expect(screen.queryByText("Test Field")).not.toBeInTheDocument();
  });

  it("renders field with label", () => {
    render(() => <AutoSuggestField {...defaultProps} label="Search Items" />, {
      wrapper: createTestWrapper(),
    });

    const label = screen.getByText("Search Items");
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute("for", "test-field");

    const input = screen.getByTestId("autosuggest-input");
    expect(input).toBeInTheDocument();
  });

  it("renders required asterisk when required is true", () => {
    render(() => <AutoSuggestField {...defaultProps} label="Search Items" required />, {
      wrapper: createTestWrapper(),
    });

    expect(screen.getByText("Search Items")).toBeInTheDocument();
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("does not render asterisk when required is false", () => {
    render(() => <AutoSuggestField {...defaultProps} label="Search Items" required={false} />, {
      wrapper: createTestWrapper(),
    });

    expect(screen.getByText("Search Items")).toBeInTheDocument();
    expect(screen.queryByText("*")).not.toBeInTheDocument();
  });

  it("renders error message when error is provided", () => {
    render(() => <AutoSuggestField {...defaultProps} error="This field is required" />, {
      wrapper: createTestWrapper(),
    });

    const errorElement = screen.getByTestId("show-error");
    expect(errorElement).toBeInTheDocument();
    expect(errorElement).toHaveTextContent("This field is required");
    expect(errorElement).toHaveAttribute("id", "test-field-error");
  });

  it("does not render error when no error is provided", () => {
    render(() => <AutoSuggestField {...defaultProps} />, {
      wrapper: createTestWrapper(),
    });

    expect(screen.queryByTestId("show-error")).not.toBeInTheDocument();
  });

  it("applies error styling when error is present", () => {
    render(() => <AutoSuggestField {...defaultProps} error="Invalid input" />, {
      wrapper: createTestWrapper(),
    });

    const input = screen.getByTestId("autosuggest-input");
    expect(input).toHaveClass("border-red-500");
  });

  it("applies custom class names", () => {
    render(() => <AutoSuggestField {...defaultProps} class="custom-class" />, {
      wrapper: createTestWrapper(),
    });

    const input = screen.getByTestId("autosuggest-input");
    expect(input).toHaveClass("custom-class");
  });

  it("applies default styling classes", () => {
    render(() => <AutoSuggestField {...defaultProps} />, {
      wrapper: createTestWrapper(),
    });

    const input = screen.getByTestId("autosuggest-input");
    expect(input).toHaveClass("mt-1");
    expect(input).toHaveClass("block");
    expect(input).toHaveClass("w-full");
    expect(input).toHaveClass("rounded-md");
    expect(input).toHaveClass("border");
    expect(input).toHaveClass("border-gray-300");
  });

  it("handles disabled state", () => {
    render(() => <AutoSuggestField {...defaultProps} disabled />, {
      wrapper: createTestWrapper(),
    });

    const input = screen.getByTestId("autosuggest-input");
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute("aria-disabled", "true");
  });

  it("passes value prop to AutoSuggestInput", () => {
    render(() => <AutoSuggestField {...defaultProps} value="test value" />, {
      wrapper: createTestWrapper(),
    });

    const input = screen.getByTestId("autosuggest-input");
    expect(input).toHaveValue("test value");
  });

  it("handles empty value prop", () => {
    render(() => <AutoSuggestField {...defaultProps} value="" />, {
      wrapper: createTestWrapper(),
    });

    const input = screen.getByTestId("autosuggest-input");
    expect(input).toHaveValue("");
  });

  it("handles undefined value prop", () => {
    render(() => <AutoSuggestField {...defaultProps} />, {
      wrapper: createTestWrapper(),
    });

    const input = screen.getByTestId("autosuggest-input");
    expect(input).toHaveValue("");
  });

  it("sets correct aria attributes", () => {
    render(() => <AutoSuggestField {...defaultProps} error="Error message" disabled />, {
      wrapper: createTestWrapper(),
    });

    const input = screen.getByTestId("autosuggest-input");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-disabled", "true");
    expect(input).toHaveAttribute("aria-errormessage", "test-field-error");
  });

  it("sets aria-invalid to false when no error", () => {
    render(() => <AutoSuggestField {...defaultProps} />, {
      wrapper: createTestWrapper(),
    });

    const input = screen.getByTestId("autosuggest-input");
    expect(input).toHaveAttribute("aria-invalid", "false");
  });

  it("passes through other props to AutoSuggestInput", () => {
    render(() => <AutoSuggestField {...defaultProps} placeholder="Search here..." />, {
      wrapper: createTestWrapper(),
    });

    const input = screen.getByTestId("autosuggest-input");
    expect(input).toHaveAttribute("placeholder", "Search here...");
  });

  it("renders complete form field structure", () => {
    render(
      () => (
        <AutoSuggestField
          {...defaultProps}
          label="Product Search"
          required
          error="Please select a valid product"
          value="test"
        />
      ),
      {
        wrapper: createTestWrapper(),
      },
    );

    // Check label with required asterisk
    expect(screen.getByText("Product Search")).toBeInTheDocument();
    expect(screen.getByText("*")).toBeInTheDocument();

    // Check input
    const input = screen.getByTestId("autosuggest-input");
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue("test");
    expect(input).toHaveAttribute("aria-invalid", "true");

    // Check error message
    const error = screen.getByTestId("show-error");
    expect(error).toBeInTheDocument();
    expect(error).toHaveTextContent("Please select a valid product");
  });

  it("maintains proper HTML structure", () => {
    render(() => <AutoSuggestField {...defaultProps} label="Test Label" error="Test Error" />, {
      wrapper: createTestWrapper(),
    });

    const container = screen.getByText("Test Label").closest("div");
    expect(container).toHaveClass("flex", "flex-col");

    // Verify the order of elements
    const elements = container?.children;
    expect(elements?.[0]).toContain(screen.getByText("Test Label"));
    expect(elements?.[1]).toContain(screen.getByTestId("autosuggest-input"));
    expect(elements?.[2]).toContain(screen.getByTestId("show-error"));
  });

  it("handles complex class merging with error state", () => {
    render(() => <AutoSuggestField {...defaultProps} class="custom-border custom-padding" error="Has error" />, {
      wrapper: createTestWrapper(),
    });

    const input = screen.getByTestId("autosuggest-input");
    // Should have default classes, error class, and custom classes
    expect(input).toHaveClass("mt-1");
    expect(input).toHaveClass("border-red-500");
    expect(input).toHaveClass("custom-border");
    expect(input).toHaveClass("custom-padding");
  });
});
