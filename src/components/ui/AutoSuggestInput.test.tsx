// AutoSuggestInput.test.tsx
import { createTestWrapper } from "@/utils/TestWrapper";
import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AutoSuggestInput, AutoSuggestInputProps } from "./AutoSuggestInput";

// Mock the debounce function
vi.mock("@solid-primitives/scheduled", () => ({
  debounce: (fn: (...args: any[]) => void, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    };
  },
}));

// Mock the cn utility
vi.mock("@/utils/cls-util", () => ({
  cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(" "),
}));

describe("AutoSuggestInput", () => {
  const mockFetchFn = vi.fn();
  const mockOnSelect = vi.fn();

  const defaultProps: AutoSuggestInputProps = {
    fetchFn: mockFetchFn,
    onSelect: mockOnSelect,
    placeholder: "Type to search...",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("renders input with correct attributes", () => {
    render(() => <AutoSuggestInput {...defaultProps} />, {
      wrapper: createTestWrapper(),
    });

    const input = screen.getByRole("combobox");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("aria-autocomplete", "list");
    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(input).toHaveAttribute("autocomplete", "off");
    expect(input).toHaveAttribute("placeholder", "Type to search...");
  });

  it("shows dropdown when typing", async () => {
    mockFetchFn.mockResolvedValue(["apple", "banana", "cherry"]);

    render(() => <AutoSuggestInput {...defaultProps} />, {
      wrapper: createTestWrapper(),
    });

    const input = screen.getByRole("combobox");
    fireEvent.input(input, { target: { value: "app" } });

    vi.advanceTimersByTime(400);
    // Wait for debounce and query
    await waitFor(() => {
      expect(mockFetchFn).toHaveBeenCalledWith("app", 10);
    });

    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
      expect(screen.getByText("apple")).toBeInTheDocument();
      expect(screen.getByText("banana")).toBeInTheDocument();
      expect(screen.getByText("cherry")).toBeInTheDocument();
    });
  });

  it("handles keyboard navigation with arrow keys", async () => {
    mockFetchFn.mockResolvedValue(["apple", "banana", "cherry"]);

    render(() => <AutoSuggestInput {...defaultProps} />, {
      wrapper: createTestWrapper(),
    });

    const input = screen.getByRole("combobox");
    fireEvent.input(input, { target: { value: "app" } });

    vi.advanceTimersByTime(400);
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    // Arrow down should focus first item
    fireEvent.keyDown(input, { key: "ArrowDown" });

    await waitFor(() => {
      const firstOption = screen.getByText("apple").closest("li");
      expect(firstOption).toHaveClass("bg-blue-100");
    });

    // Arrow down again should focus second item
    fireEvent.keyDown(input, { key: "ArrowDown" });

    await waitFor(() => {
      const secondOption = screen.getByText("banana").closest("li");
      expect(secondOption).toHaveClass("bg-blue-100");
    });

    // Arrow up should go back to first item
    fireEvent.keyDown(input, { key: "ArrowUp" });

    await waitFor(() => {
      const firstOption = screen.getByText("apple").closest("li");
      expect(firstOption).toHaveClass("bg-blue-100");
    });
  });

  it("wraps around when navigating with arrow keys", async () => {
    mockFetchFn.mockResolvedValue(["apple", "banana", "cherry"]);

    render(() => <AutoSuggestInput {...defaultProps} />, {
      wrapper: createTestWrapper(),
    });

    const input = screen.getByRole("combobox");
    fireEvent.input(input, { target: { value: "app" } });

    vi.advanceTimersByTime(400);

    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    // Navigate to last item
    fireEvent.keyDown(input, { key: "ArrowDown" }); // apple
    fireEvent.keyDown(input, { key: "ArrowDown" }); // banana
    fireEvent.keyDown(input, { key: "ArrowDown" }); // cherry

    // Arrow down should wrap to first item
    fireEvent.keyDown(input, { key: "ArrowDown" });

    await waitFor(() => {
      const firstOption = screen.getByText("apple").closest("li");
      expect(firstOption).toHaveClass("bg-blue-100");
    });

    // Arrow up should wrap to last item
    fireEvent.keyDown(input, { key: "ArrowUp" });

    await waitFor(() => {
      const lastOption = screen.getByText("cherry").closest("li");
      expect(lastOption).toHaveClass("bg-blue-100");
    });
  });

  it("selects item on Enter key", async () => {
    mockFetchFn.mockResolvedValue(["apple", "banana", "cherry"]);

    render(() => <AutoSuggestInput {...defaultProps} />, {
      wrapper: createTestWrapper(),
    });

    const input = screen.getByRole("combobox");
    fireEvent.input(input, { target: { value: "app" } });

    vi.advanceTimersByTime(400);

    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    // Focus first item and select with Enter
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(mockOnSelect).toHaveBeenCalledWith("apple");
    expect(input).toHaveValue("apple");

    // Dropdown should be closed
    await waitFor(() => {
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
  });

  it("selects item on click", async () => {
    mockFetchFn.mockResolvedValue(["apple", "banana", "cherry"]);

    render(() => <AutoSuggestInput {...defaultProps} />, {
      wrapper: createTestWrapper(),
    });

    const input = screen.getByRole("combobox");
    fireEvent.input(input, { target: { value: "app" } });

    vi.advanceTimersByTime(400);

    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("banana"));

    expect(mockOnSelect).toHaveBeenCalledWith("banana");
    expect(input).toHaveValue("banana");

    // Dropdown should be closed
    await waitFor(() => {
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
  });

  it("closes dropdown on Escape key", async () => {
    mockFetchFn.mockResolvedValue(["apple", "banana", "cherry"]);

    render(() => <AutoSuggestInput {...defaultProps} />, {
      wrapper: createTestWrapper(),
    });

    const input = screen.getByRole("combobox");
    fireEvent.input(input, { target: { value: "app" } });

    vi.advanceTimersByTime(400);

    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    fireEvent.keyDown(input, { key: "Escape" });

    await waitFor(() => {
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
  });

  it("handles controlled value prop", () => {
    render(() => <AutoSuggestInput {...defaultProps} value="initial value" />, {
      wrapper: createTestWrapper(),
    });

    const input = screen.getByRole("combobox");
    expect(input).toHaveValue("initial value");
  });

  it("updates internal value when value prop changes", () => {
    let setValue: (value: string) => void;
    const TestComponent = () => {
      const [value, setValueState] = createSignal("initial");
      setValue = setValueState;
      return <AutoSuggestInput {...defaultProps} value={value()} />;
    };

    render(() => <TestComponent />, {
      wrapper: createTestWrapper(),
    });

    const input = screen.getByRole("combobox");
    expect(input).toHaveValue("initial");

    // Update the value prop
    setValue!("updated");

    expect(input).toHaveValue("updated");
  });

  it("renders hidden input for form submission when name is provided", () => {
    render(() => <AutoSuggestInput {...defaultProps} name="test-field" value="test value" />, {
      wrapper: createTestWrapper(),
    });

    const hiddenInput = document.querySelector('input[type="hidden"][name="test-field"]');
    expect(hiddenInput).toBeInTheDocument();
    expect(hiddenInput).toHaveValue("test value");
  });

  it("does not render hidden input when name is not provided", () => {
    render(() => <AutoSuggestInput {...defaultProps} value="test value" />, {
      wrapper: createTestWrapper(),
    });

    const hiddenInput = document.querySelector('input[type="hidden"]');
    expect(hiddenInput).not.toBeInTheDocument();
  });

  it("handles disabled state", () => {
    render(() => <AutoSuggestInput {...defaultProps} disabled />, {
      wrapper: createTestWrapper(),
    });

    const input = screen.getByRole("combobox");
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute("aria-disabled", "true");
  });

  it("applies custom class name", () => {
    render(() => <AutoSuggestInput {...defaultProps} class="custom-class" />, {
      wrapper: createTestWrapper(),
    });

    const input = screen.getByRole("combobox");
    expect(input).toHaveClass("custom-class");
  });

  it("applies custom id", () => {
    render(() => <AutoSuggestInput {...defaultProps} id="custom-id" />, {
      wrapper: createTestWrapper(),
    });

    const input = screen.getByRole("combobox");
    expect(input).toHaveAttribute("id", "custom-id");

    const container = input.closest("div");
    expect(container).toHaveAttribute("id", "custom-id");
  });

  it("clears input on blur when no item was selected", async () => {
    render(() => <AutoSuggestInput {...defaultProps} />, {
      wrapper: createTestWrapper(),
    });

    const input = screen.getByRole("combobox");
    fireEvent.input(input, { target: { value: "invalid" } });
    vi.advanceTimersByTime(400);
    fireEvent.blur(input);
    vi.advanceTimersByTime(400);

    // Wait for the timeout in handleOnBlur
    await waitFor(() => {
      expect(input).toHaveValue("");
    });
  });

  it("keeps input value on blur when item was selected", async () => {
    mockFetchFn.mockResolvedValue(["apple", "banana", "cherry"]);

    render(() => <AutoSuggestInput {...defaultProps} />, {
      wrapper: createTestWrapper(),
    });

    const input = screen.getByRole("combobox");
    fireEvent.input(input, { target: { value: "app" } });
    vi.advanceTimersByTime(400);
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    // Select an item
    fireEvent.click(screen.getByText("apple"));

    // Blur the input
    fireEvent.blur(input);
    vi.advanceTimersByTime(400);
    // Value should remain
    expect(input).toHaveValue("apple");
  });

  it("does not show dropdown when results are empty", async () => {
    mockFetchFn.mockResolvedValue([]);

    render(() => <AutoSuggestInput {...defaultProps} />, {
      wrapper: createTestWrapper(),
    });

    const input = screen.getByRole("combobox");
    fireEvent.input(input, { target: { value: "xyz" } });
    vi.advanceTimersByTime(400);
    await waitFor(() => {
      expect(mockFetchFn).toHaveBeenCalledWith("xyz", 10);
    });

    // Should not show dropdown for empty results
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("ignores keyboard events when no results", () => {
    render(() => <AutoSuggestInput {...defaultProps} />, {
      wrapper: createTestWrapper(),
    });

    const input = screen.getByRole("combobox");

    // These should not throw errors
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowUp" });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(mockOnSelect).not.toHaveBeenCalled();
  });

  it("prevents default on mouse down to avoid blur", async () => {
    mockFetchFn.mockResolvedValue(["apple", "banana", "cherry"]);

    render(() => <AutoSuggestInput {...defaultProps} />, {
      wrapper: createTestWrapper(),
    });

    const input = screen.getByRole("combobox");
    fireEvent.input(input, { target: { value: "app" } });
    vi.advanceTimersByTime(400);
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    const option = screen.getByText("apple");
    const mouseDownEvent = new MouseEvent("mousedown", { bubbles: true });
    const preventDefaultSpy = vi.spyOn(mouseDownEvent, "preventDefault");

    fireEvent(option, mouseDownEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it("closes dropdown on outside click", async () => {
    mockFetchFn.mockResolvedValue(["apple", "banana", "cherry"]);

    render(
      () => (
        <div>
          <AutoSuggestInput {...defaultProps} id="test-input" />
          <div data-testid="outside">Outside element</div>
        </div>
      ),
      {
        wrapper: createTestWrapper(),
      },
    );

    const input = screen.getByRole("combobox");
    fireEvent.input(input, { target: { value: "app" } });
    vi.advanceTimersByTime(400);
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    // Click outside
    fireEvent.click(screen.getByTestId("outside"));

    await waitFor(() => {
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
  });

  it("resets selectedFromList flag when typing", async () => {
    mockFetchFn.mockResolvedValue(["apple", "banana", "cherry"]);

    render(() => <AutoSuggestInput {...defaultProps} />, {
      wrapper: createTestWrapper(),
    });

    const input = screen.getByRole("combobox");

    // First, select an item
    fireEvent.input(input, { target: { value: "app" } });
    vi.advanceTimersByTime(400);
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("apple"));
    vi.advanceTimersByTime(400);
    expect(input).toHaveValue("apple");

    // Now type something else
    fireEvent.input(input, { target: { value: "ban" } });
    vi.advanceTimersByTime(400);
    // Blur should now clear the input since selectedFromList is reset
    fireEvent.blur(input);
    vi.advanceTimersByTime(400);
    await waitFor(() => {
      expect(input).toHaveValue("");
    });
  });
});
