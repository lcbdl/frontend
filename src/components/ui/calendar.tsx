import i18n from "@/i18n/index.ts";
import { cn } from "@/utils/cls-util.ts";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/fr";

import { Component, createEffect, createSignal, For, Show } from "solid-js";
import { Popover, PopoverContent, PopoverTrigger } from "./popover.tsx";

export interface CalendarDay {
  day: number;
  date: Dayjs;
  isOtherMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

export interface CalendarEvent {
  eventId: number;
  title?: string;
  location?: string;
  organizer?: string;
  description?: string;
  start?: string;
  end?: string;
  lang?: string;
  requestor: {
    requestorId: string;
    firstName?: string;
    lastName?: string;
  };
}

export interface CalendarProps {
  events: CalendarEvent[];
}
const DATE_FORMAT = i18n.language === "en" ? "MMMM D, YYYY" : "D MMMM YYYY";
const DATE_TIME_FORMAT = i18n.language === "en" ? "MMMM D, YYYY HH:mm" : "D MMMM YYYY HH:mm";
const TODAY = dayjs().locale(i18n.language).startOf("day");

export const Calendar: Component<CalendarProps> = (props) => {
  const lang = i18n.language;

  const weekdays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"].map((day) => ({
    label: i18n.t(`calendar.weekday.${day}.label`),
    value: i18n.t(`calendar.weekday.${day}.value`),
    shortLabel: i18n.t(`calendar.weekday.${day}.shortLabel`),
  }));
  const [currentDate, setCurrentDate] = createSignal<Dayjs>(dayjs());
  const [weeks, setWeeks] = createSignal<CalendarDay[][]>([]);

  const findEventsOnDate = (renderDate: Dayjs, events: CalendarEvent[]) => {
    return events.filter((event) => {
      let startTime = event.start ? dayjs(event.start.replace(/[+-]\d{4}$/, "")) : undefined;
      startTime = startTime?.set("hour", 0);
      startTime = startTime?.set("minute", 0);
      startTime = startTime?.set("second", 0);
      startTime = startTime?.set("millisecond", 0);
      let endTime = event.end ? dayjs(event.end.replace(/[+-]\d{4}$/, "")) : undefined;
      endTime = endTime?.set("hour", 23);
      endTime = endTime?.set("minute", 59);
      endTime = endTime?.set("second", 59);
      endTime = endTime?.set("millisecond", 999);
      return (
        !!startTime &&
        !!endTime &&
        (startTime.isSame(renderDate, "day") || startTime.isBefore(renderDate, "day")) &&
        (endTime.isSame(renderDate, "day") || endTime.isAfter(renderDate, "day"))
      );
    });
  };

  // Updates the calendar grid
  const updateDays = (events: CalendarEvent[], date: Dayjs = currentDate()) => {
    // get the first day of the month and the last day of the month
    const startOfMonth = date.startOf("month");
    const endOfMonth = date.endOf("month");
    // get the weekday of the first day of the month
    const startWeekday = startOfMonth.day(); // 0 = Sunday, 6 = Saturday

    const prevMonth = date.subtract(1, "month");
    const prevMonthNumOfDays = prevMonth.daysInMonth();

    let daysArray: CalendarDay[] = [];

    // Fill previous month's days
    for (let i = startWeekday - 1; i >= 0; i--) {
      dayjs().locale(lang);
      const thisDate = prevMonth.date(prevMonthNumOfDays - i);
      daysArray.push({
        day: prevMonthNumOfDays - i,
        date: thisDate,
        isOtherMonth: true,
        isToday: thisDate.isSame(TODAY, "day"),
        events: findEventsOnDate(thisDate, events),
      });
    }

    // Fill current month's days
    for (let i = 1; i <= endOfMonth.date(); i++) {
      const thisDate = date.date(i);
      daysArray.push({
        day: i,
        date: thisDate,
        isOtherMonth: false,
        isToday: thisDate.isSame(TODAY, "day"),
        events: findEventsOnDate(thisDate, events),
      });
    }

    // Fill next month's days to complete the last row
    const remainingDays = (7 - (daysArray.length % 7)) % 7;
    for (let i = 1; i <= remainingDays; i++) {
      const thisDate = date.add(1, "month").date(i);
      date.date(i);
      daysArray.push({
        day: i,
        date: thisDate,
        isOtherMonth: true,
        isToday: thisDate.isSame(TODAY, "day"),
        events: findEventsOnDate(thisDate, events),
      });
    }

    // Group into weeks (chunks of 7)
    const weeksArray: CalendarDay[][] = [];
    for (let i = 0; i < daysArray.length; i += 7) {
      weeksArray.push(daysArray.slice(i, i + 7));
    }
    setWeeks(weeksArray);
  };

  createEffect(() => {
    updateDays(props.events, currentDate());
  });

  // Navigating between months
  const prevMonth = () => {
    const newDate = currentDate().subtract(1, "month");
    setCurrentDate(newDate);
    updateDays(props.events, newDate);
  };

  const nextMonth = () => {
    const newDate = currentDate().add(1, "month");
    setCurrentDate(newDate);
    updateDays(props.events, newDate);
  };

  return (
    <div class="mx-auto bg-white" role="region" aria-labelledby="calendar-label">
      <div class="flex items-center justify-between">
        <button
          class="flex flex-none cursor-pointer items-center justify-center rounded-md bg-white p-1.5 text-gray-600 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-800"
          onClick={prevMonth}
          aria-label={i18n.t("calendar.prevMonth")}
        >
          <span class="sr-only">{i18n.t("calendar.prevMonth")}</span>
          <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              fill-rule="evenodd"
              d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
        <div id="calendar-label" class="flex-auto text-center text-base font-semibold text-gray-900">
          {currentDate().locale(lang).format("MMMM YYYY")}
        </div>
        <button
          class="flex flex-none cursor-pointer items-center justify-center rounded-md bg-white p-1.5 text-gray-600 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-800"
          onClick={nextMonth}
          aria-label={i18n.t("calendar.nextMonth")}
        >
          <span class="sr-only">{i18n.t("calendar.nextMonth")}</span>
          <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              fill-rule="evenodd"
              d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>

      <div class="w-full" role="grid">
        <div role="rowgroup">
          <div class="grid grid-cols-7" role="row">
            <For each={weekdays}>
              {(day) => (
                <div
                  role="columnheader"
                  class="py-2 text-center text-xs leading-6 font-semibold text-gray-500"
                  aria-label={day.label}
                >
                  {day.shortLabel}
                </div>
              )}
            </For>
          </div>
        </div>

        <div role="rowgroup">
          <For each={weeks()}>
            {(week, rowIndex) => (
              <div class="grid grid-cols-7" role="row">
                <For each={week}>
                  {(cell, colIndex) => (
                    <div
                      role="gridcell"
                      aria-disabled={cell.isOtherMonth ? "true" : "false"}
                      aria-label={cell.date.locale(lang).format(DATE_FORMAT)}
                      class={cn(
                        "flex flex-1 items-center justify-center p-2 text-center text-sm outline-1 outline-gray-300 hover:bg-gray-100",
                        {
                          "rounded-tl-md": rowIndex() === 0 && colIndex() === 0,
                          "rounded-tr-md": rowIndex() === 0 && colIndex() === 6,
                          "rounded-bl-md": rowIndex() === weeks().length - 1 && colIndex() === 0,
                          "rounded-br-md": rowIndex() === weeks().length - 1 && colIndex() === 6,
                          "text-gray-900": !cell.isToday && !cell.isOtherMonth,
                          "text-gray-400": cell.isOtherMonth,
                          "bg-gray-50": cell.isOtherMonth,
                          "bg-white": !cell.isToday && !cell.isOtherMonth,
                          "hover:bg-gray-200": !cell.isOtherMonth && !cell.isToday,
                        },
                      )}
                    >
                      <Show when={cell.events.length > 0}>
                        <Popover triggerTypes={["click", "focus"]}>
                          <PopoverTrigger>
                            <div
                              role="button"
                              tabIndex={0}
                              class="flex items-center justify-center underline focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-inset"
                            >
                              <span
                                class={cn("flex h-7 w-7 items-center justify-center", {
                                  "text-white": cell.isToday && !cell.isOtherMonth,
                                  "bg-gray-900": cell.isToday && !cell.isOtherMonth,
                                  "rounded-full": cell.isToday,
                                  "bg-gray-200": cell.isToday && cell.isOtherMonth,
                                  "text-gray-600": cell.isToday && cell.isOtherMonth,
                                })}
                              >
                                {cell.day}
                              </span>
                            </div>
                          </PopoverTrigger>
                          <PopoverContent class="max-h-[350px] w-[340px] overflow-y-auto">
                            <EventContent events={cell.events} date={cell.date} isOtherMonth={cell.isOtherMonth} />
                          </PopoverContent>
                        </Popover>
                      </Show>
                      <Show when={cell.events.length === 0}>
                        <span
                          class={cn("flex h-7 w-7 items-center justify-center", {
                            "text-white": cell.isToday && !cell.isOtherMonth,
                            "bg-gray-900": cell.isToday && !cell.isOtherMonth,
                            "rounded-full": cell.isToday && !cell.isOtherMonth,
                          })}
                        >
                          {cell.day}
                        </span>
                      </Show>
                    </div>
                  )}
                </For>
              </div>
            )}
          </For>
        </div>
      </div>
    </div>
  );
};

const EventContent = (props: { date: Dayjs; isOtherMonth: boolean; events?: CalendarEvent[] }) => {
  return (
    <For each={props.events || []}>
      {(event) => {
        const startTime = event.start ? dayjs(event.start.replace(/[+-]\d{4}$/, "")) : null;
        const endTime = event.end ? dayjs(event.end.replace(/[+-]\d{4}$/, "")) : null;
        let langProp = {};
        if (event.lang && event.lang != null && event.lang != i18n.language) {
          langProp = { lang: event.lang };
        }

        let schedule;
        if (!!startTime && !!endTime) {
          if (startTime.isSame(endTime, "day")) {
            schedule = (
              <>
                {startTime.format(DATE_FORMAT)} {startTime.format("HH:mm")} {i18n.t("common.to")}{" "}
                {endTime.format("HH:mm")}
              </>
            );
          } else {
            schedule = (
              <>
                {startTime.format(DATE_TIME_FORMAT)} {i18n.t("common.to")}
                <br />
                {endTime.format(DATE_TIME_FORMAT)}
              </>
            );
          }
        }
        return (
          <div class="max-h-[200px] overflow-y-auto text-left whitespace-break-spaces">
            <div class="text-l bg-[#296eb3] px-2 py-1 font-bold text-white">{event.title}</div>
            <div class="px-2 pt-1">{schedule}</div>
            <div class="px-2">
              <span class="font-bold">{i18n.t("sharedCalendar.fields.location")} </span>
              <span {...langProp}>{event.location}</span>
            </div>
            <div class="px-2">
              <span class="font-bold">{i18n.t("sharedCalendar.fields.organizer")} </span>
              <span {...langProp}>{event.organizer}</span>
            </div>
            <div class="px-2">
              <div class="font-bold">{i18n.t("sharedCalendar.fields.description")}</div>
              <div {...langProp} class="text-wrap">
                {event.description}
              </div>
            </div>
          </div>
        );
      }}
    </For>
  );
};
