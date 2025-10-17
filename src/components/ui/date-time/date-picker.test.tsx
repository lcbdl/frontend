import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import dayjs from "dayjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DatePicker } from "./date-picker";

// Timer setup
beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllTimers();
});

afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
});

describe("DatePicker", () => {
  const mockOnChange = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the input field and calendar button", () => {
    render(() => <DatePicker />);

    expect(screen.getByRole("spinbutton", { name: "calendar.year" })).toBeInTheDocument();
    expect(screen.getByLabelText("calendar.chooseDate")).toBeInTheDocument();
  });

  it("does not render calendar button when disabled", () => {
    render(() => <DatePicker disabled />);

    expect(screen.queryByLabelText("calendar.chooseDate")).not.toBeInTheDocument();
  });

  it("opens calendar when button is clicked", async () => {
    render(() => <DatePicker />);

    fireEvent.click(screen.getByLabelText("calendar.chooseDate"));
    expect(screen.getByRole("region")).toBeInTheDocument();
  });

  it("displays current month by default", async () => {
    const today = dayjs();
    render(() => <DatePicker />);

    fireEvent.click(screen.getByLabelText("calendar.chooseDate"));
    expect(screen.getByRole("region")).toHaveTextContent(today.format("MMMM YYYY"));
  });

  it("displays correct weekdays", async () => {
    render(() => <DatePicker />);

    fireEvent.click(screen.getByLabelText("calendar.chooseDate"));

    await waitFor(() => {
      const weekdays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
      weekdays.forEach((day) => {
        expect(screen.getByText(`calendar.weekday.${day}.shortLabel`)).toBeInTheDocument();
      });
    });
  });

  it("navigates between months", async () => {
    const initialDate = dayjs("2023-05-15");
    render(() => <DatePicker value={initialDate.format("MM/DD/YYYY")} />);

    fireEvent.click(screen.getByLabelText("calendar.chooseDate"));

    // Check initial month
    expect(screen.getByRole("region")).toHaveTextContent("May 2023");

    // Go to next month
    fireEvent.click(screen.getByLabelText("calendar.nextMonth"));
    expect(screen.getByRole("region")).toHaveTextContent("June 2023");

    // Go to previous month
    fireEvent.click(screen.getByLabelText("calendar.prevMonth"));
    expect(screen.getByRole("region")).toHaveTextContent("May 2023");
  });

  it("shows year selection when clicked", async () => {
    render(() => <DatePicker />);

    fireEvent.click(screen.getByLabelText("calendar.chooseDate"));
    fireEvent.click(screen.getByLabelText("calendar.showYears"));

    expect(screen.getByRole("grid")).toBeInTheDocument();
    expect(screen.getAllByRole("row").length).toBeGreaterThan(0);
  });

  it("selects a year from year selection", async () => {
    render(() => <DatePicker />);

    fireEvent.click(screen.getByLabelText("calendar.chooseDate"));
    fireEvent.click(screen.getByLabelText("calendar.showYears"));

    // Find and click year 2025
    const yearButton = screen.getByRole("button", { name: "2025" });
    fireEvent.click(yearButton);

    // Year selection should close and calendar should show selected year
    expect(screen.queryByTestId("select-year-container")).toBeNull();
    expect(screen.getByTestId("select-date-container")).toBeInTheDocument();
  });

  it("selects a date from calendar", async () => {
    render(() => <DatePicker onChange={mockOnChange} />);

    fireEvent.click(screen.getByLabelText("calendar.chooseDate"));

    // Find and click the 15th day of current month
    const days = screen.getAllByRole("button", { name: /\d+/ });
    const fifteenthDay = days.find((day) => day.textContent === "15");

    if (fifteenthDay) {
      fireEvent.click(fifteenthDay);

      // Calendar should close
      vi.advanceTimersByTime(300); // Allow time for the click event to propagate
      expect(screen.queryByRole("region")).not.toBeInTheDocument();

      // onChange should be called with correct date
      const today = dayjs();
      const expectedDate = today.date(15).format("MM/DD/YYYY");
      expect(mockOnChange).toHaveBeenCalledWith(expectedDate);
    }
  });

  it("highlights today's date", async () => {
    const today = dayjs();
    render(() => <DatePicker />);

    fireEvent.click(screen.getByLabelText("calendar.chooseDate"));

    const todayButton = screen.getByRole("button", {
      name: new RegExp(`calendar.today.*${today.format("MMMM D, YYYY")}`),
    });

    expect(todayButton).toHaveClass("border border-slate-400");
  });

  it("highlights selected date", async () => {
    const selectedDate = dayjs("2023-05-15");
    render(() => <DatePicker value={selectedDate.format("MM/DD/YYYY")} />);

    fireEvent.click(screen.getByLabelText("calendar.chooseDate"));

    const selectedButton = screen.getByRole("button", {
      name: selectedDate.format("MMMM D, YYYY"),
    });

    expect(selectedButton).toHaveClass("bg-sky-800");
    expect(selectedButton).toHaveClass("text-white");
    expect(selectedButton).toHaveAttribute("aria-selected");
  });

  it("handles keyboard navigation in calendar", async () => {
    const initialDate = dayjs("2023-05-15");
    render(() => <DatePicker value={initialDate.format("MM/DD/YYYY")} onChange={mockOnChange} />);

    fireEvent.click(screen.getByLabelText("calendar.chooseDate"));
    vi.advanceTimersByTime(500); // Allow time for the calendar to open

    const calendar = screen.getByRole("region");

    // Focus should be on the selected date (15th)
    const fifteenth = screen.getByRole("button", { name: "May 15, 2023" });
    expect(fifteenth).toBeInTheDocument();
    expect(fifteenth.getAttribute("tabindex")).toEqual("0");

    // Navigate right
    fireEvent.keyDown(calendar, { key: "ArrowRight" });
    expect(screen.getByRole("button", { name: "May 16, 2023" }).getAttribute("tabindex")).toEqual("0");

    // Navigate down
    fireEvent.keyDown(calendar, { key: "ArrowDown" });
    expect(screen.getByRole("button", { name: "May 23, 2023" }).getAttribute("tabindex")).toEqual("0");

    // Navigate left
    fireEvent.keyDown(calendar, { key: "ArrowLeft" });
    expect(screen.getByRole("button", { name: "May 22, 2023" }).getAttribute("tabindex")).toEqual("0");

    // Navigate up
    fireEvent.keyDown(calendar, { key: "ArrowUp" });
    expect(screen.getByRole("button", { name: "May 15, 2023" }).getAttribute("tabindex")).toEqual("0");

    // Select with Enter
    fireEvent.keyDown(calendar, { key: "Enter" });
    expect(mockOnChange).toHaveBeenCalled();
  });

  it("closes calendar on Escape key", async () => {
    render(() => <DatePicker />);

    fireEvent.click(screen.getByLabelText("calendar.chooseDate"));
    expect(screen.getByRole("region")).toBeInTheDocument();

    fireEvent.keyDown(screen.getByRole("region"), { key: "Escape" });
    vi.advanceTimersByTime(300); // Allow time for the click event to propagate
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });

  it("updates selected date when input value changes", async () => {
    const renderDatePicker = (value: string) => render(() => <DatePicker value={value} />);
    renderDatePicker("05/15/2023");

    fireEvent.click(screen.getByLabelText("calendar.chooseDate"));
    const dateCell = screen.getByRole("button", { name: "May 15, 2023" });
    expect(dateCell).toBeInTheDocument();
    expect(dateCell).toHaveAttribute("aria-selected");
    renderDatePicker("05/20/2023");
    const dateCell2 = screen.getByRole("button", { name: "May 20, 2023" });
    expect(dateCell2).toBeInTheDocument();
  });
});
