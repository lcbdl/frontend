import { simulateBeforeInput } from "@/utils/testing-utils";
import { cleanup, fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DateInput } from "./date-input";

beforeEach(() => {
  vi.resetModules();
  cleanup();
});

describe("DateInput Component", () => {
  it("should render with label and inputs", () => {
    render(() => <DateInput pattern="YYYY-MM-DD" />);

    expect(screen.getByTestId("date-input")).toBeInTheDocument();
    expect(screen.getByRole("spinbutton", { name: /year/i })).toBeInTheDocument();
    expect(screen.getByRole("spinbutton", { name: /month/i })).toBeInTheDocument();
    expect(screen.getByRole("spinbutton", { name: /day/i })).toBeInTheDocument();
  });

  it("should handle valid date input and trigger onChange", async () => {
    const onChange = vi.fn();
    render(() => <DateInput pattern="YYYY-MM-DD" onChange={onChange} />);

    const yearInput = screen.getByRole("spinbutton", { name: /year/i });
    const monthInput = screen.getByRole("spinbutton", { name: /month/i });
    const dayInput = screen.getByRole("spinbutton", { name: /day/i });

    // Simulate user typing
    fireEvent.focus(yearInput);
    simulateBeforeInput(yearInput, "2023");
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith("2023-MM-DD");
    });

    fireEvent.focus(monthInput);
    simulateBeforeInput(monthInput, "12");
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith("2023-12-DD");
    });

    fireEvent.focus(dayInput);
    simulateBeforeInput(dayInput, "25");
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith("2023-12-25");
    });
  });

  it("should handle invalid month input", async () => {
    render(() => <DateInput pattern="YYYY-MM-DD" />);

    const monthInput = screen.getByRole("spinbutton", { name: /month/i });

    fireEvent.focus(monthInput);
    simulateBeforeInput(monthInput, "13"); // Invalid month
    await waitFor(() => {
      expect(monthInput.textContent).not.toBe("13");
    });
  });

  it("should handle invalid day input based on month", async () => {
    render(() => <DateInput pattern="YYYY-MM-DD" />);

    const yearInput = screen.getByRole("spinbutton", { name: /year/i });
    const monthInput = screen.getByRole("spinbutton", { name: /month/i });
    const dayInput = screen.getByRole("spinbutton", { name: /day/i });

    // Set year to 2000
    fireEvent.focus(yearInput);
    simulateBeforeInput(yearInput, "2000");
    // Set month to February
    fireEvent.focus(monthInput);
    simulateBeforeInput(monthInput, "2");
    // Try to set day to 31 (invalid for February)
    fireEvent.focus(dayInput);
    simulateBeforeInput(dayInput, "31");
    await waitFor(() => {
      expect(dayInput.textContent).not.toBe("31");
    });
  });

  it("should handle keyboard navigation between fields", () => {
    render(() => <DateInput pattern="YYYY-MM-DD" />);

    const yearInput = screen.getByRole("spinbutton", { name: /year/i });
    const monthInput = screen.getByRole("spinbutton", { name: /month/i });
    const dayInput = screen.getByRole("spinbutton", { name: /day/i });

    fireEvent.focus(yearInput);
    fireEvent.keyDown(yearInput, { key: "ArrowRight" });

    expect(document.activeElement).toBe(monthInput);

    fireEvent.keyDown(monthInput, { key: "ArrowRight" });
    expect(document.activeElement).toBe(dayInput);

    fireEvent.keyDown(dayInput, { key: "ArrowLeft" });
    expect(document.activeElement).toBe(monthInput);
  });

  it("should handle arrow key increments", async () => {
    render(() => <DateInput pattern="YYYY-MM-DD" />);

    const yearInput = screen.getByRole("spinbutton", { name: /year/i });

    fireEvent.focus(yearInput);
    fireEvent.keyDown(yearInput, { key: "ArrowUp" });
    await waitFor(() => {
      expect(yearInput.textContent).toBe("0001"); // Default min is 1
    });

    simulateBeforeInput(yearInput, "2023");
    fireEvent.keyDown(yearInput, { key: "ArrowUp" });
    await waitFor(() => {
      expect(yearInput.textContent).toBe("2024");
    });

    fireEvent.keyDown(yearInput, { key: "ArrowDown" });
    await waitFor(() => {
      expect(yearInput.textContent).toBe("2023");
    });
  });

  it("should update hidden input value", async () => {
    render(() => <DateInput pattern="YYYY-MM-DD" name="testDate" />);

    const yearInput = screen.getByRole("spinbutton", { name: /year/i });
    const monthInput = screen.getByRole("spinbutton", { name: /month/i });
    const dayInput = screen.getByRole("spinbutton", { name: /day/i });
    const hiddenInput = screen.getByTestId("date-input");

    fireEvent.focus(yearInput);
    simulateBeforeInput(yearInput, "2023");

    fireEvent.focus(monthInput);
    simulateBeforeInput(monthInput, "12");

    fireEvent.focus(dayInput);
    simulateBeforeInput(dayInput, "25");

    await waitFor(() => {
      expect(hiddenInput).toHaveValue("2023-12-25");
    });
  });

  it("should update internal date value when value property changes", async () => {
    render(() => {
      const [value, setValue] = createSignal("");
      return (
        <>
          <DateInput pattern="YYYY-MM-DD" value={value()} name="testDate" />
          <button type="button" onClick={() => setValue("2023-12-25")}>
            Change
          </button>
        </>
      );
    });

    const changeButton = screen.getByRole("button", { name: "Change" });
    const hiddenInput = screen.getByTestId("date-input");

    expect(hiddenInput).not.toHaveValue();

    console.log(changeButton);
    fireEvent.click(changeButton);

    await waitFor(() => {
      expect(hiddenInput).toHaveValue("2023-12-25");
    });
  });
});
