import i18n from "@/i18n";
import { cn } from "@/utils/cls-util.ts";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/fr";
import { Calendar as ChevronCalendar, ChevronDown, ChevronLeft, ChevronRight } from "lucide-solid";

import { getFocusableElements } from "@/utils/common-utils";
import {
  Component,
  createEffect,
  createMemo,
  createSignal,
  For,
  mergeProps,
  onCleanup,
  Show,
  splitProps,
} from "solid-js";
import { DateInput, DateInputProps } from "./date-input";

export interface CalendarDay {
  day: number;
  date: Dayjs;
  isOtherMonth: boolean;
}

export type DatePickerProps = DateInputProps & {
  displayFormat?: string;
  inputClass?: string;
};

export const DatePicker: Component<DatePickerProps> = (props) => {
  const finalProps = mergeProps({ pattern: "MM/DD/YYYY", disabled: false, required: false, invalid: false }, props);

  const [local, inputProps] = splitProps(finalProps, [
    "value",
    "pattern",
    "displayFormat",
    "onChange",
    "inputClass",
    "class",
  ]);

  const lang = i18n.language;
  const TODAY = dayjs();

  const weekdays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"].map((day) => ({
    label: i18n.t(`calendar.weekday.${day}.shortLabel`),
    value: i18n.t(`calendar.weekday.${day}.value`),
  }));

  const dateFormat = createMemo(() => local.displayFormat || (i18n.language === "en" ? "MMMM D, YYYY" : "D MMMM YYYY"));

  const isValidDate = (strData: string, pattern: string) => {
    const date = dayjs(strData, pattern);
    return date && date.isValid() && strData === date.format(pattern);
  };

  // Refs
  let yearDivRef: HTMLDivElement | undefined;
  let calendarRef: HTMLDivElement | undefined;
  const dateCellRefs = new Map<string, HTMLButtonElement>();
  let inputEl: HTMLInputElement | undefined = undefined;

  ////////////// Signals ///////////////////
  const [focusedYear, setFocusedYear] = createSignal<number | undefined>();
  const [focusedDate, setFocusedDate] = createSignal<Dayjs | undefined>();
  const [selectedDate, setSelectedDate] = createSignal<string | undefined>(local.value);
  const [showYears, setShowYears] = createSignal(false);
  const [showCalendar, setShowCalendar] = createSignal(false);
  // for navigation
  const [currentDate, setCurrentDate] = createSignal<string>(TODAY.format(local.pattern));
  const [weeks, setWeeks] = createSignal<CalendarDay[][]>([]);
  const [isHiding, setIsHiding] = createSignal(false);

  ////////////// Effects ///////////////////
  //Watch for focusedDate, showCalendar, and showYear changes, and call .focus() when it updates
  createEffect(() => {
    const focused = focusedDate();
    if (focused && showCalendar() && !showYears()) {
      setTimeout(() => {
        const el = dateCellRefs.get(focused.format("YYYY-MM-DD"));
        el?.focus();
      }, 10);
    } else {
      if (yearDivRef) {
        const allYears = Array.from(yearDivRef.querySelectorAll("button"));
        setTimeout(() => {
          if (focusedYear()) {
            allYears.find((b) => b.textContent === focusedYear()?.toString())?.focus();
          } else {
            allYears.find((b) => b.textContent === focusedYear()?.toString())?.focus();
          }
        }, 10);
      }
    }
  });

  // Click outside handler
  createEffect(() => {
    if (showCalendar()) {
      const handleClickOutside = (event: MouseEvent) => {
        if (calendarRef && !calendarRef.contains(event.target as Node)) {
          hideCalendar();
          setShowYears(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      onCleanup(() => {
        document.removeEventListener("mousedown", handleClickOutside);
      });
    }
  });

  // Set initial focus date when calendar opens
  createEffect(() => {
    if (selectedDate() && isValidDate(selectedDate()!, local.pattern)) {
      const dateToFocus = dayjs(selectedDate(), local.pattern);
      setFocusedDate(dateToFocus);
      setFocusedYear(dateToFocus.year());
      setCurrentDate(selectedDate()!);
    } else {
      const dateToFocus = dayjs(currentDate(), local.pattern);
      setFocusedDate(dateToFocus);
      setFocusedYear(dateToFocus.year());
    }
  });

  // update days of the calendar when navigate through months
  createEffect(() => {
    updateDays(dayjs(currentDate(), local.pattern));
  });

  // Scroll to the year when show year selection
  createEffect(() => {
    if (showYears()) {
      scrollToRow();
    }
  });

  // Set selectedDate and current display date if there is initial value
  createEffect(() => {
    if (local.value) {
      setSelectedDate(local.value);
      setCurrentDate(local.value);
    }
  });

  // call onChange if the selectedDate changes
  createEffect(() => {
    if (selectedDate() !== undefined) {
      local.onChange?.(selectedDate()!);
    }
  });

  const handleExpose = (api: { inputEl: HTMLInputElement }) => {
    inputEl = api.inputEl;
  };

  const hideCalendar = () => {
    if (showCalendar()) {
      setIsHiding(true);
      setTimeout(() => {
        setShowCalendar(false);
        setIsHiding(false);
      }, 200);
    }
  };

  // Generate years array to selecting year.
  const years = Array.from({ length: 50 }, (_, i) => Array.from({ length: 4 }, (_, j) => 1900 + i * 4 + j));

  // Updates the calendar grid
  const updateDays = (date: Dayjs = dayjs(currentDate(), local.pattern)) => {
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
      const thisDate = prevMonth.date(prevMonthNumOfDays - i);
      daysArray.push({
        day: prevMonthNumOfDays - i,
        date: thisDate,
        isOtherMonth: true,
      });
    }

    // Fill current month's days
    for (let i = 1; i <= endOfMonth.date(); i++) {
      const thisDate = date.date(i);
      daysArray.push({ day: i, date: thisDate, isOtherMonth: false });
    }

    // Fill next month's days to complete the last row
    const remainingDays = (7 - (daysArray.length % 7)) % 7;
    for (let i = 1; i <= remainingDays; i++) {
      const thisDate = date.add(1, "month").date(i);
      daysArray.push({ day: i, date: thisDate, isOtherMonth: true });
    }

    // Group into weeks (chunks of 7)
    const weeksArray: CalendarDay[][] = [];
    for (let i = 0; i < daysArray.length; i += 7) {
      weeksArray.push(daysArray.slice(i, i + 7));
    }
    setWeeks(weeksArray);
  };

  // Navigating between months
  const prevMonth = () => {
    const currentDayjs = dayjs(currentDate(), local.pattern);
    const newDate = currentDayjs.subtract(1, "month");
    setCurrentDate(newDate.format(local.pattern));
    updateDays(newDate);
    const selectedDayjs = dayjs(selectedDate(), local.pattern);
    if (newDate.isSame(selectedDayjs, "month")) {
      setFocusedDate(selectedDayjs);
    } else {
      setFocusedDate(newDate);
    }
  };

  const nextMonth = () => {
    const currentDayjs = dayjs(currentDate(), local.pattern);
    const newDate = currentDayjs.add(1, "month");
    setCurrentDate(newDate.format(local.pattern));
    updateDays(newDate);
    const selectedDayjs = dayjs(selectedDate(), local.pattern);
    if (newDate.isSame(selectedDayjs, "month")) {
      setFocusedDate(selectedDayjs);
    } else {
      setFocusedDate(newDate);
    }
  };

  const scrollToRow = () => {
    if (yearDivRef) {
      const scrollContainer = yearDivRef as HTMLDivElement;
      const row = scrollContainer.querySelector(".selected") || scrollContainer.querySelector(".current");
      if (row) {
        const containerTop = scrollContainer.getBoundingClientRect().top;
        const rowTop = (row as HTMLElement).getBoundingClientRect().top;
        scrollContainer.scrollTop +=
          rowTop - containerTop - scrollContainer.clientHeight / 2 + (row as HTMLElement).offsetHeight / 2;
      }
    }
  };

  const handleSelectYear = (year: number) => {
    const value = dayjs(currentDate(), local.pattern).set("year", year);
    setCurrentDate(value.format(local.pattern));
    setShowYears(false);
  };

  const handleSelectDate = (date: Dayjs) => {
    const newDateStr = date.format(local.pattern);
    setSelectedDate(newDateStr);
    if (inputEl) {
      inputEl.value = newDateStr;
      inputEl.dispatchEvent(new InputEvent("input", { bubbles: true }));
    }
    hideCalendar();
  };

  const toggleShowCalendar = () => {
    const newValue = !showCalendar();
    setShowCalendar(newValue);
    if (!newValue) {
      setShowYears(false);
    }
  };

  const selectedYear = createMemo(() =>
    selectedDate() === undefined ? undefined : dayjs(selectedDate(), local.pattern).year(),
  );

  const handleCalendarKeyDown = (e: KeyboardEvent) => {
    if (!focusedDate() || !calendarRef) return;

    const current = focusedDate()!;
    const activeEl = document.activeElement as HTMLElement;
    const isCalendarCell = activeEl?.closest("[data-calendar-cell]");
    const isYearCell = activeEl?.closest("[data-year-cell]");
    const currentDayjs = dayjs(currentDate(), local.pattern);
    switch (e.key) {
      case "Tab": {
        const focusables = getFocusableElements(calendarRef);
        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const isShift = e.shiftKey;

        if (isShift && activeEl === first) {
          e.preventDefault();
          (last as HTMLElement).focus();
        } else if (!isShift && activeEl === last) {
          e.preventDefault();
          (first as HTMLElement).focus();
        }
        break;
      }

      case "ArrowLeft":
        if (isCalendarCell) {
          e.preventDefault();
          const newDate = current.subtract(1, "day");
          if (newDate.isSame(currentDayjs, "year") && newDate.isSame(currentDayjs, "month")) {
            setFocusedDate(newDate);
          }
        } else if (isYearCell) {
          let prevYear = (focusedYear() ?? currentDayjs.year()) - 1;
          if (prevYear < 1900) {
            prevYear = 1900;
          }
          setFocusedYear(prevYear);
        }
        break;

      case "ArrowRight":
        if (isCalendarCell) {
          e.preventDefault();
          const newDate = current.add(1, "day");
          if (newDate.isSame(currentDayjs, "year") && newDate.isSame(currentDayjs, "month")) {
            setFocusedDate(newDate);
          }
        } else if (isYearCell) {
          let prevYear = (focusedYear() ?? currentDayjs.year()) + 1;
          if (prevYear > 2099) {
            prevYear = 2099;
          }
          setFocusedYear(prevYear);
        }
        break;

      case "ArrowUp":
        if (isCalendarCell) {
          e.preventDefault();
          const newDate = current.subtract(1, "week");
          if (newDate.isSame(currentDayjs, "year") && newDate.isSame(currentDayjs, "month")) {
            setFocusedDate(newDate);
          }
        } else if (isYearCell) {
          let prevYear = (focusedYear() ?? currentDayjs.year()) - 4;
          if (prevYear < 1900) {
            prevYear = 1900;
          }
          setFocusedYear(prevYear);
        }
        break;

      case "ArrowDown":
        if (isCalendarCell) {
          e.preventDefault();
          const newDate = current.add(1, "week");
          if (newDate.isSame(currentDayjs, "year") && newDate.isSame(currentDayjs, "month")) {
            setFocusedDate(newDate);
          }
        } else if (isYearCell) {
          let prevYear = (focusedYear() ?? currentDayjs.year()) + 4;
          if (prevYear > 2099) {
            prevYear = 2099;
          }
          setFocusedYear(prevYear);
        }
        break;

      case "Enter":
      case " ":
        if (isCalendarCell) {
          e.preventDefault();
          handleSelectDate(current);
        }
        break;

      case "Escape":
        hideCalendar();
        break;
    }
  };

  return (
    <>
      <div class={cn("relative", local.class)}>
        <DateInput
          class={cn("w-full", local.inputClass)}
          {...inputProps}
          value={selectedDate()}
          onChange={(value) => {
            setSelectedDate(value);
          }}
          onFocus={() => hideCalendar()}
          expose={handleExpose}
        />
        <Show when={!inputProps.disabled}>
          <button
            class="absolute top-2 right-2"
            type="button"
            aria-label={i18n.t("calendar.chooseDate")}
            onClick={() => toggleShowCalendar()}
          >
            <ChevronCalendar size={"20px"} class="text-gray-700" />
          </button>
        </Show>

        <Show when={showCalendar() || isHiding()}>
          <div
            ref={(el) => (calendarRef = el)}
            tabIndex={0}
            onKeyDown={handleCalendarKeyDown}
            class={cn(
              "absolute z-40 mx-auto mt-0.5 w-[250px] rounded-sm border border-gray-300 bg-white p-3 text-xs shadow-xl",
              isHiding() ? "animate-slideUp" : "animate-slideDown",
            )}
            role="region"
            aria-labelledby="calendar-label"
          >
            <div class="mb-4 flex items-center justify-between">
              <div class="flex items-center gap-1">
                <p id="calendar-label" class="font-semibold">
                  {dayjs(currentDate(), local.pattern).locale(lang).format("MMMM YYYY")}
                </p>
                <button
                  type="button"
                  aria-label={i18n.t("calendar.showYears")}
                  class="cursor-pointer rounded-full p-1 hover:bg-slate-200"
                  onClick={() => setShowYears((prev) => !prev)}
                >
                  <ChevronDown size="18px" />
                </button>
              </div>
              <div class="flex items-center gap-1">
                <Show when={!showYears()}>
                  <button
                    type="button"
                    class="cursor-pointer rounded-full p-1 hover:bg-slate-200"
                    onClick={prevMonth}
                    aria-label={i18n.t("calendar.prevMonth")}
                  >
                    <ChevronLeft size="18px" />
                  </button>
                  <button
                    type="button"
                    class="cursor-pointer rounded-full p-1 hover:bg-slate-200"
                    onClick={nextMonth}
                    aria-label={i18n.t("calendar.nextMonth")}
                  >
                    <ChevronRight size="18px" />
                  </button>
                </Show>
              </div>
            </div>

            <Show when={showYears()}>
              <div
                class="max-h-[200px] w-full overflow-y-auto"
                role="grid"
                data-testid="select-year-container"
                ref={yearDivRef}
              >
                <div role="rowgroup">
                  <For each={years}>
                    {(row) => (
                      <div class="grid grid-cols-4" role="row">
                        <For each={row}>
                          {(year) => {
                            const isSelectedYear = year === selectedYear();
                            const isCurrentYear = year === TODAY.year();
                            return (
                              <button
                                type="button"
                                class={cn(
                                  "m-1 cursor-pointer rounded-2xl p-1 focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-white focus:outline-none",
                                  {
                                    "bg-sky-800": isSelectedYear,
                                    "text-white": isSelectedYear,
                                    "hover:bg-slate-200": !isSelectedYear,
                                    "opacity-90": isSelectedYear,
                                    "border border-slate-400": isCurrentYear,
                                    selected: isSelectedYear,
                                    current: isCurrentYear,
                                  },
                                )}
                                data-year-cell
                                onClick={() => handleSelectYear(year)}
                              >
                                {year}
                              </button>
                            );
                          }}
                        </For>
                      </div>
                    )}
                  </For>
                </div>
              </div>
            </Show>
            <Show when={!showYears()}>
              <div class="w-full" role="grid" data-testid="select-date-container">
                <div role="rowgroup">
                  <div class="grid grid-cols-7" role="row">
                    <For each={weekdays}>
                      {(day) => (
                        <div
                          role="columnheader"
                          class="flex-1 py-2 text-center font-semibold text-gray-700"
                          aria-label={day.value}
                        >
                          {day.label}
                        </div>
                      )}
                    </For>
                  </div>
                </div>

                <div role="rowgroup">
                  <For each={weeks()}>
                    {(week) => (
                      <div class="grid grid-cols-7" role="row">
                        <For each={week}>
                          {(cell) => {
                            const isSelectedDate = cell.date.format(local.pattern) === selectedDate();
                            const isCurrentDate = cell.date.isSame(TODAY, "date");
                            return (
                              <>
                                <Show when={cell.isOtherMonth}>
                                  <div
                                    role="gridcell"
                                    aria-disabled="true"
                                    class="flex-1 rounded-full bg-white p-2 text-center text-gray-900"
                                    tabIndex="-1"
                                  />
                                </Show>
                                <Show when={!cell.isOtherMonth}>
                                  <button
                                    ref={(el) => {
                                      dateCellRefs.set(cell.date.format("YYYY-MM-DD"), el);
                                    }}
                                    type="button"
                                    aria-disabled={inputProps.disabled}
                                    data-calendar-cell
                                    aria-label={`${isCurrentDate ? i18n.t("calendar.today") + ", " : ""}${cell.date.locale(lang).format(dateFormat())}`}
                                    aria-current={isCurrentDate ? "date" : undefined}
                                    aria-selected={isSelectedDate ? "true" : undefined}
                                    class={cn(
                                      "m-1 w-[25px] flex-1 cursor-pointer rounded-full bg-white p-1 text-center text-gray-900 focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-white focus:outline-none",
                                      {
                                        "bg-sky-800": isSelectedDate,
                                        "text-white": isSelectedDate,
                                        "hover:bg-slate-200": !isSelectedDate,
                                        "hover:opacity-90": isSelectedDate,
                                        "border border-slate-400": isCurrentDate,
                                        selected: isSelectedDate,
                                        current: isCurrentDate,
                                      },
                                    )}
                                    tabIndex={cell.date.isSame(focusedDate(), "date") ? 0 : -1}
                                    onClick={() => handleSelectDate(cell.date)}
                                  >
                                    {cell.day}
                                  </button>
                                </Show>
                              </>
                            );
                          }}
                        </For>
                      </div>
                    )}
                  </For>
                </div>
              </div>
            </Show>
          </div>
        </Show>
      </div>
    </>
  );
};
