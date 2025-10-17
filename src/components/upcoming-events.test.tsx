import { fireEvent, render, screen } from "@solidjs/testing-library";
import { describe, expect, it, vi } from "vitest";
import { CalendarEvent } from "./ui/calendar";
import { UpcomingEvents, UpcomingEventsProps } from "./upcoming-events";

describe("UpcomingEvents", () => {
  const mockDeleteEvent = vi.fn();

  const mockEvents: CalendarEvent[] = [
    {
      eventId: 1,
      title: "Event 1",
      start: "2025-04-15T00:00:00Z",
      end: "2025-04-17T00:00:00Z",
      location: "Location 1",
      organizer: "Organizer 1",
      requestor: {
        requestorId: "1",
        firstName: "first name",
        lastName: "last name",
      },
    },
    {
      eventId: 2,
      title: "Event 2",
      start: "2025-05-01T10:00:00Z",
      end: "2025-05-01T12:00:00Z",
      location: "Location 2",
      organizer: "Organizer 2",
      requestor: {
        requestorId: "1",
        firstName: "first name",
        lastName: "last name",
      },
    },
  ];

  const renderComponent = (props: Partial<UpcomingEventsProps> = {}) => {
    const defaultProps: UpcomingEventsProps = {
      events: mockEvents,
      onDelete: mockDeleteEvent,
    };
    return render(() => <UpcomingEvents {...defaultProps} {...props} />);
  };

  it("renders the list of events", () => {
    renderComponent();

    expect(screen.getByText("sharedCalendar.upcomingEventsTitle")).toBeInTheDocument();
    expect(screen.getByText("Event 1")).toBeInTheDocument();
    expect(screen.getByText("Event 2")).toBeInTheDocument();
  });

  it("calls deleteEvent with the correct event ID when delete button is clicked", () => {
    renderComponent();

    const deleteButtons = screen.getAllByRole("button", { name: /sharedCalendar.delete/i });
    expect(deleteButtons).toHaveLength(2);

    fireEvent.click(deleteButtons[0]);
    expect(mockDeleteEvent).toHaveBeenCalledWith(1);

    fireEvent.click(deleteButtons[1]);
    expect(mockDeleteEvent).toHaveBeenCalledWith(2);
  });

  it("renders correctly with an empty list of events", () => {
    renderComponent({ events: [] });

    expect(screen.getByText("sharedCalendar.upcomingEventsTitle")).toBeInTheDocument();
    expect(screen.queryByText("Event 1")).not.toBeInTheDocument();
    expect(screen.queryByText("Event 2")).not.toBeInTheDocument();
  });
});
// filepath: /workspaces/sdp/external/src/main/frontend/src/components/upcoming-events.test.tsx

describe("UpcomingEvents", () => {
  const mockDeleteEvent = vi.fn();

  const mockEvents: CalendarEvent[] = [
    {
      eventId: 1,
      title: "Event 1",
      start: "2025-04-15T00:00:00Z",
      end: "2025-04-17T00:00:00Z",
      location: "Location 1",
      organizer: "Organizer 1",
      requestor: {
        requestorId: "1",
        firstName: "first name",
        lastName: "last name",
      },
    },
    {
      eventId: 2,
      title: "Event 2",
      start: "2025-05-01T00:00:00Z",
      end: "2025-05-02T00:00:00Z",
      location: "Location 2",
      organizer: "Organizer 2",
      requestor: {
        requestorId: "1",
        firstName: "first name",
        lastName: "last name",
      },
    },
  ];

  const renderComponent = (props: Partial<UpcomingEventsProps> = {}) => {
    const defaultProps: UpcomingEventsProps = {
      events: mockEvents,
      onDelete: mockDeleteEvent,
    };
    return render(() => <UpcomingEvents {...defaultProps} {...props} />);
  };

  it("renders the list of events", () => {
    renderComponent();

    expect(screen.getByText("sharedCalendar.upcomingEventsTitle")).toBeInTheDocument();
    expect(screen.getByText("Event 1")).toBeInTheDocument();
    expect(screen.getByText("Event 2")).toBeInTheDocument();
  });

  it("calls deleteEvent when the delete button is clicked", () => {
    renderComponent();

    const deleteButtons = screen.getAllByRole("button", { name: /sharedCalendar.delete/i });
    expect(deleteButtons).toHaveLength(2);

    fireEvent.click(deleteButtons[0]);
    expect(mockDeleteEvent).toHaveBeenCalledWith(1);

    fireEvent.click(deleteButtons[1]);
    expect(mockDeleteEvent).toHaveBeenCalledWith(2);
  });

  it("renders correctly when no events are provided", () => {
    renderComponent({ events: [] });

    expect(screen.getByText("sharedCalendar.upcomingEventsTitle")).toBeInTheDocument();
    expect(screen.queryByText("Event 1")).not.toBeInTheDocument();
    expect(screen.queryByText("Event 2")).not.toBeInTheDocument();
  });
});
