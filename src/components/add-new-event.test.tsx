import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AddEventForm from "./add-new-event";

const labels = {
  title: "Event Title",
  location: "Location",
  organizer: "Organizer",
  startDate: "Start Date",
  startTime: "Start Time",
  endDate: "End Date",
  endTime: "End Time",
  description: "Description",
  submitButton: "Submit",
  cancelButton: "Cancel",
  formTitle: "Create Event",
  formInstructions: "Please fill in the event details below.",
  errors: {
    title: "Title is required",
    location: "Location is required",
    organizer: "Organizer is required",
    startDate: "Start date is required",
    startTime: "Start time is required",
    endDate: "End date is required",
    endTime: "End time is required",
    description: "Description is required",
    formLevel: "Please fix all errors before you may Add Event",
  },
};

describe("AddEventForm", () => {
  const mockSubmit = vi.fn(() => Promise.resolve());
  const mockClose = vi.fn();

  beforeEach(() => {
    mockSubmit.mockClear();
    mockClose.mockClear();
  });

  function setup() {
    return render(() => <AddEventForm onSubmit={mockSubmit} close={mockClose} labels={labels} />);
  }

  it("renders without crashing", () => {
    setup();
    expect(screen.getByText(labels.formTitle)).toBeInTheDocument();
  });

  it("associates all labels with inputs correctly", () => {
    setup();

    // Check all fields are accessible by label
    expect(screen.getByLabelText(new RegExp(labels.title, "i"))).toBeInstanceOf(HTMLInputElement);
    expect(screen.getByLabelText(new RegExp(labels.location, "i"))).toBeInstanceOf(HTMLInputElement);
    expect(screen.getByLabelText(new RegExp(labels.organizer, "i"))).toBeInstanceOf(HTMLInputElement);
    expect(screen.getByLabelText(new RegExp(labels.startDate, "i"))).toBeInTheDocument();
    expect(screen.getByLabelText(new RegExp(labels.startTime, "i"))).toBeInTheDocument();
    expect(screen.getByLabelText(new RegExp(labels.endDate, "i"))).toBeInTheDocument();
    expect(screen.getByLabelText(new RegExp(labels.endTime, "i"))).toBeInTheDocument();
    expect(screen.getByLabelText(new RegExp(labels.description, "i"))).toBeInstanceOf(HTMLTextAreaElement);
  });

  it("shows validation errors on submit", async () => {
    setup();
    const submitButton = screen.getByRole("button", { name: labels.submitButton });

    fireEvent.click(submitButton);

    expect(await screen.findByText(labels.errors.title)).toBeVisible();
    expect(screen.getByText(labels.errors.location)).toBeVisible();
    expect(screen.getByText(labels.errors.organizer)).toBeVisible();
    expect(screen.getByText(labels.errors.startDate)).toBeVisible();
    expect(screen.getByText(labels.errors.endDate)).toBeVisible();
    expect(screen.getByText(labels.errors.description)).toBeVisible();
  });

  it("adds aria-invalid and aria-describedby on invalid fields", async () => {
    setup();

    fireEvent.click(screen.getByRole("button", { name: labels.submitButton }));

    await waitFor(() => {
      const titleInput = screen.getByLabelText(new RegExp(labels.title, "i"));
      expect(titleInput).toHaveAttribute("aria-invalid", "true");
      expect(titleInput).toHaveAttribute("aria-errormessage");

      const describedBy = titleInput.getAttribute("aria-errormessage");
      expect(screen.getByText(labels.errors.title).id).toBe(describedBy);
    });
  });

  it("shows validation errors if end date is before start date", async () => {
    setup();
    await userEvent.type(screen.getByLabelText(/title/i), "Test Event");
    await userEvent.type(screen.getByLabelText(/location/i), "Test Location");
    await userEvent.type(screen.getByLabelText(/organizer/i), "Test Organizer");

    const dateInputs = screen.getAllByTestId("date-input");
    const startDateInput = dateInputs.find((input) => input.getAttribute("name") === "eventStartDate");
    const endDateInput = dateInputs.find((input) => input.getAttribute("name") === "eventEndDate");

    fireEvent.change(startDateInput!, { target: { value: "2025-05-21" } });
    fireEvent.change(endDateInput!, { target: { value: "2025-05-14" } });

    await userEvent.click(screen.getByRole("button", { name: labels.submitButton }));

    expect(await screen.getByText(labels.errors.startDate)).toBeInTheDocument();
    expect(await screen.getByText(labels.errors.endDate)).toBeInTheDocument();

    // onSubmit should NOT have been called
    expect(mockSubmit).not.toHaveBeenCalled();
  });
});
