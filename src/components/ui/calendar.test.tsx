import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import dayjs from "dayjs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CalendarEvent } from "./calendar.tsx";

/**
 * | Feature          | vi.mock()	                             | vi.doMock()                                 |
 * |------------------|------------------------------------------|---------------------------------------------|
 * | When it runs     | Hoisted to the top of the file           | Runs at runtime, exactly where it's written |
 * | Use case         | Static/global mocks (same for all tests) | Dynamic/mock-per-test scenarios             |
 * | Caching behavior | Cached on first import                   | Must be used before importing the module    |
 * | Flexibility      | Less flexible                            | Super flexible                              |
 */

beforeEach(() => {
  vi.resetModules();
  cleanup();
});

describe("Calendar", () => {
  it("renders current month and weekdays", async () => {
    const { Calendar } = await import("./calendar.tsx");

    render(() => <Calendar events={[]} />);

    const now = dayjs().format("MMMM YYYY");
    expect(screen.getByText(now)).toBeInTheDocument();

    const weekdays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

    weekdays.forEach((day) => {
      expect(screen.getByText(`calendar.weekday.${day}.shortLabel`)).toBeInTheDocument();
    });
  });

  it("navigates to next and previous month", async () => {
    const { Calendar } = await import("./calendar.tsx");
    render(() => <Calendar events={[]} />);

    const current = dayjs();
    const prevBtn = screen.getByLabelText("calendar.prevMonth");
    const nextBtn = screen.getByLabelText("calendar.nextMonth");

    fireEvent.click(nextBtn);
    expect(screen.getByText(current.add(1, "month").format("MMMM YYYY"))).toBeInTheDocument();

    fireEvent.click(prevBtn);
    fireEvent.click(prevBtn);
    expect(screen.getByText(current.subtract(1, "month").format("MMMM YYYY"))).toBeInTheDocument();
  });

  it("shows popover when clicking a day with event", async () => {
    const { Calendar } = await import("./calendar.tsx");
    const today = dayjs().startOf("day");

    const events: CalendarEvent[] = [
      {
        eventId: 1,
        title: "Important Meeting",
        location: "HQ",
        organizer: "Alice",
        description: "Yearly planning",
        start: today.toISOString(),
        end: today.add(1, "hour").toISOString(),
        requestor: { requestorId: "1" },
      },
    ];

    render(() => <Calendar events={events} />);

    // Click the day cell that contains the event
    const dayCell = screen.getByText(String(today.date()));
    fireEvent.click(dayCell);

    // Assert the event popover is now visible
    expect(screen.getByText("Important Meeting")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument(); // From your PopoverContent
  });

  it("shows popover when tabbing into a day with focus trigger", async () => {
    const { Calendar } = await import("./calendar.tsx");
    vi.mock("dayjs", async () => {
      const actual = await vi.importActual<typeof dayjs>("dayjs");
      return {
        ...actual,
        default: () => (actual as any).default("2025-01-15"), // Always return fixed date
      };
    });
    const today = dayjs().startOf("day");

    const events: CalendarEvent[] = [
      {
        eventId: 1,
        title: "Focus-triggered Event",
        location: "Office",
        organizer: "Charlie",
        description: "Strategy sync",
        start: today.toISOString(),
        end: today.add(2, "hour").toISOString(),
        requestor: { requestorId: "2" },
      },
    ];

    render(() => <Calendar events={events} />);

    const dayCell = screen.getByText(String(today.date()));

    // Simulate tabbing to the day (focus event)
    fireEvent.focusIn(dayCell);

    // Assert popover appears
    expect(screen.getByText("Focus-triggered Event")).toBeInTheDocument();
  });

  it("renders French UI labels when default language is fr", async () => {
    // Mock i18n to simulate French language
    vi.doMock("@/i18n", () => ({
      default: {
        language: "fr",
        t: (key: string) => {
          const map: Record<string, string> = {
            "calendar.prevMonth": "Précédent",
            "calendar.nextMonth": "Prochain",
            "calendar.weekday.sunday.label": "Dim",
            "calendar.weekday.monday.label": "Lun",
            "calendar.weekday.tuesday.label": "Mar",
            "calendar.weekday.wednesday.label": "Mer",
            "calendar.weekday.thursday.label": "Jeu",
            "calendar.weekday.friday.label": "Ven",
            "calendar.weekday.sunday.shortLabel": "Di",
            "calendar.weekday.monday.shortLabel": "Lu",
            "calendar.weekday.tuesday.shortLabel": "Ma",
            "calendar.weekday.wednesday.shortLabel": "Me",
            "calendar.weekday.thursday.shortLabel": "Je",
            "calendar.weekday.friday.shortLabel": "Ve",
            "calendar.weekday.saturday.shortLabel": "Sa",
            "calendar.weekday.sunday.value": "Dimanche",
            "calendar.weekday.monday.value": "Lundi",
            "calendar.weekday.tuesday.value": "Mardi",
            "calendar.weekday.wednesday.value": "Mercredi",
            "calendar.weekday.thursday.value": "Jeudi",
            "calendar.weekday.friday.value": "Vendredi",
            "calendar.weekday.saturday.value": "Samedi",
            "calendar.location": "FR-Location",
            "calendar.organizer": "FR-Organizer",
            "calendar.description": "FR_Description",
            "common.to": "à",
          };
          return map[key] || key;
        },
      },
    }));

    const { Calendar } = await import("./calendar.tsx");

    // This assumes i18n is initialized with fr in your actual setup
    render(() => <Calendar events={[]} />);

    // Replace with actual translated key output
    expect(screen.getByLabelText("Précédent")).toBeInTheDocument();
    expect(screen.getByText("Lu")).toBeInTheDocument(); // If you render days of week
  });
});
