import type { NpCalendarEvent } from "@/types/CalendarEvent.ts";
import { createTestWrapper } from "@/utils/TestWrapper.tsx";
import { render, screen, waitFor } from "@solidjs/testing-library";
import { For } from "solid-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SharedCalendar } from "./shared-calendar.tsx";
import { CalendarEvent, CalendarProps } from "./ui/calendar.tsx";

// Mock the Calendar UI component
vi.mock("./ui/calendar", () => ({
  Calendar: (props: CalendarProps) => (
    <div>
      <For each={props.events}>{(event: CalendarEvent) => <div data-testid="event">{event.title}</div>}</For>
    </div>
  ),
}));

describe("SharedCalendar", () => {
  const mockApi = {
    get: vi.fn(),
    delete: vi.fn(),
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

  it("fetches calendar events and renders them", async () => {
    const mockData: NpCalendarEvent[] = [
      {
        eventId: 1,
        eventTitleFrc: "Événement FR",
        eventTitleEng: "Event EN",
        eventLocation: "Paris",
        eventOrganizer: "Org",
        eventDescription: "Desc",
        startTime: "2025-01-01T10:00:00Z",
        endTime: "2025-01-01T12:00:00Z",
        requestorId: "1",
        locale: "fr",
      },
    ];

    mockApi.get.mockResolvedValueOnce({ data: mockData });

    render(() => <SharedCalendar />, { wrapper: createTestWrapper(mockApi) });

    vi.advanceTimersByTime(400);
    await waitFor(() => {
      expect(screen.getByText("Événement FR")).toBeInTheDocument();
    });

    expect(screen.getAllByTestId("event")).toHaveLength(1);
    expect(mockApi.get).toHaveBeenCalledWith("/responseHub/calendarEvents/status/1");
  });

  it("displays a loading state while fetching calendar events", async () => {
    mockApi.get.mockReturnValueOnce(new Promise(() => {})); // Simulate pending state

    render(() => <SharedCalendar />, { wrapper: createTestWrapper(mockApi) });

    expect(screen.getByTitle(/loading/i)).toBeInTheDocument();
  });

  it("displays an error message if fetching calendar events fails", async () => {
    const errorMessage = "Failed to fetch events";
    mockApi.get.mockRejectedValueOnce(new Error(errorMessage));

    render(() => <SharedCalendar />, { wrapper: createTestWrapper(mockApi) });
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it("displays no events if the API returns an empty list", async () => {
    mockApi.get.mockResolvedValueOnce({ data: [] });

    render(() => <SharedCalendar />, { wrapper: createTestWrapper(mockApi) });

    await waitFor(() => {
      expect(screen.queryByTestId("event")).not.toBeInTheDocument();
    });
  });

  it("shows delete confirmation modal when delete is triggered", async () => {
    const mockData: NpCalendarEvent[] = [
      {
        eventId: 1,
        eventTitleFrc: "Événement FR",
        eventTitleEng: "Event EN",
        eventLocation: "Paris",
        eventOrganizer: "Org",
        eventDescription: "Desc",
        startTime: "2035-01-01T10:00:00Z",
        endTime: "2035-01-01T12:00:00Z",
        requestorId: "1",
        locale: "fr",
      },
    ];

    mockApi.get.mockResolvedValueOnce({ data: mockData });

    render(() => <SharedCalendar />, { wrapper: createTestWrapper(mockApi) });

    await waitFor(() => {
      const allMatching = screen.getAllByText("Événement FR");
      const pElement = allMatching.find((el) => el.tagName.toLowerCase() === "p");
      expect(pElement).toBeInTheDocument();
    });

    const deleteButton = screen.getByLabelText(/delete/i);
    deleteButton.click();

    await waitFor(() => {
      expect(screen.getByText(/deleteConfirmation/i)).toBeInTheDocument();
    });
  });

  it("deletes an event when confirmed", async () => {
    const mockData: NpCalendarEvent[] = [
      {
        eventId: 1,
        eventTitleFrc: "Événement FR",
        eventTitleEng: "Event EN",
        eventLocation: "Paris",
        eventOrganizer: "Org",
        eventDescription: "Desc",
        startTime: "2035-01-01T10:00:00Z",
        endTime: "2035-01-01T12:00:00Z",
        requestorId: "1",
        locale: "fr",
      },
    ];

    mockApi.get.mockResolvedValueOnce({ data: mockData });
    mockApi.delete = vi.fn().mockResolvedValueOnce({});

    render(() => <SharedCalendar />, { wrapper: createTestWrapper(mockApi) });

    await waitFor(() => {
      const allMatching = screen.getAllByText("Événement FR");
      const pElement = allMatching.find((el) => el.tagName.toLowerCase() === "p");
      expect(pElement).toBeInTheDocument();
    });

    const deleteButton = screen.getByLabelText(/delete/i);
    deleteButton.click();

    await waitFor(() => {
      expect(screen.getByText(/deleteConfirmation/i)).toBeInTheDocument();
    });

    const confirmButton = screen.getByText(/ok/i);
    confirmButton.click();

    await waitFor(() => {
      expect(mockApi.delete).toHaveBeenCalledWith("/responseHub/calendarEvents/1");
      expect(screen.queryByText("Événement FR")).not.toBeInTheDocument();
    });
  });

  it("closes the delete confirmation modal when cancel is clicked", async () => {
    const mockData: NpCalendarEvent[] = [
      {
        eventId: 1,
        eventTitleFrc: "Événement FR",
        eventTitleEng: "Event EN",
        eventLocation: "Paris",
        eventOrganizer: "Org",
        eventDescription: "Desc",
        startTime: "2035-01-01T10:00:00Z",
        endTime: "2035-01-01T12:00:00Z",
        requestorId: "1",
        locale: "fr",
      },
    ];

    mockApi.get.mockResolvedValueOnce({ data: mockData });

    render(() => <SharedCalendar />, { wrapper: createTestWrapper(mockApi) });

    await waitFor(() => {
      const allMatching = screen.getAllByText("Événement FR");
      const pElement = allMatching.find((el) => el.tagName.toLowerCase() === "p");
      expect(pElement).toBeInTheDocument();
    });

    const deleteButton = screen.getByLabelText(/delete/i);
    deleteButton.click();

    await waitFor(() => {
      expect(screen.getByText(/deleteConfirmation/i)).toBeInTheDocument();
    });

    const cancelButton = screen.getByText(/cancel/i);
    cancelButton.click();

    await waitFor(() => {
      expect(screen.queryByText(/deleteConfirmation/i)).not.toBeInTheDocument();
    });
  });
});
