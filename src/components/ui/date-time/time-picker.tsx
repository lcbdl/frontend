import { cn } from "@/utils/cls-util.ts";
import "dayjs/locale/fr";
import { Clock } from "lucide-solid";

import i18next from "@/i18n";
import { getFocusableElements, zeroPad } from "@/utils/common-utils";
import dayjs from "dayjs";
import {
  batch,
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
import { Button } from "../button";
import { isValidTime, TimeInput, TimeInputProps } from "./time-input";

export type TimePickerProps = TimeInputProps & {
  inputClass?: string;
};

export const TimePicker: Component<TimePickerProps> = (props) => {
  const finalProps = mergeProps({ disabled: false, required: false, invalid: false }, props);

  const [local, inputProps] = splitProps(finalProps, ["value", "onChange", "class", "inputClass"]);

  // Refs
  let timePickerRef: HTMLDivElement | undefined;
  let hourDivRef: HTMLDivElement | undefined;
  let minuteDivRef: HTMLDivElement | undefined;
  const hourCellRefs = new Map<string, HTMLButtonElement>();
  const minuteCellRefs = new Map<string, HTMLButtonElement>();
  let inputEl: HTMLInputElement | undefined = undefined;

  ////////////// Signals ///////////////////
  const [selectedTime, setSelectedTime] = createSignal<string>("HH:mm");
  const [hour, setHour] = createSignal<string | undefined>();
  const [minute, setMinute] = createSignal<string | undefined>();
  const [showTimePicker, setShowTimePicker] = createSignal(false);
  const [lastControlledValue, setLastControlledValue] = createSignal<string | undefined>(undefined);
  const [isHiding, setIsHiding] = createSignal(false);

  ////////////// Effects ///////////////////
  // Focus on hour when time-picker opens
  createEffect(() => {
    if (showTimePicker() && hourDivRef) {
      const row = hourDivRef.querySelector(".selected") || hourDivRef.querySelector(".current");
      if (row) {
        const timer = setTimeout(() => {
          (row as HTMLElement).focus();
        }, 10);
        onCleanup(() => {
          clearTimeout(timer);
        });
      }
    }
  });

  // Click outside handler
  createEffect(() => {
    if (showTimePicker()) {
      const handleClickOutside = (event: MouseEvent) => {
        if (timePickerRef && !timePickerRef.contains(event.target as Node)) {
          hideTimePicker();
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      onCleanup(() => {
        document.removeEventListener("mousedown", handleClickOutside);
      });
    }
  });

  // Scroll hour and minute to the middle of the view
  createEffect(() => {
    if (showTimePicker()) {
      if (hourDivRef) scrollToRow(hourDivRef);
      if (minuteDivRef) scrollToRow(minuteDivRef);
    }
  });

  // Set selectedTime if there is initial value
  createEffect(() => {
    if (local.value !== lastControlledValue()) {
      if (local.value && isValidTime(local.value)) {
        batch(() => {
          setSelectedTime(local.value!);
          const [h, m] = local.value!.split(":");
          setHour(h);
          setMinute(m);
        });
      }
    }
    setLastControlledValue(local.value);
  });

  // call onChange if the selectedTime changes
  createEffect(() => {
    if (local.onChange && selectedTime() !== lastControlledValue() && isValidTime(selectedTime())) {
      local.onChange(selectedTime());
    }
  });

  // Generate hours array and minutes array.
  const hours = createMemo(() => Array.from({ length: 24 }, (_, i) => zeroPad(i, 2)));
  const minutes = createMemo(() => Array.from({ length: 60 }, (_, i) => zeroPad(i, 2)));

  const isCurrentHour = (h: string) => h === zeroPad(dayjs().hour(), 2);
  const isCurrentMinute = (m: string) => m === zeroPad(dayjs().minute(), 2);
  const isSelectedHour = (h: string) => h === hour();
  const isSelectedMinute = (m: string) => m === minute();

  const handleExpose = (api: { inputEl: HTMLInputElement }) => {
    inputEl = api.inputEl;
  };

  const toggleTimePicker = () => setShowTimePicker((prev) => !prev);

  const hideTimePicker = () => {
    if (showTimePicker()) {
      setIsHiding(true);
      setTimeout(() => {
        setShowTimePicker(false);
        setIsHiding(false);
      }, 200);
    }
  };

  const scrollToRow = (containerRef: HTMLDivElement) => {
    if (containerRef) {
      const scrollContainer = containerRef as HTMLDivElement;
      const row = scrollContainer.querySelector(".selected") || scrollContainer.querySelector(".current");
      if (row) {
        const containerTop = scrollContainer.getBoundingClientRect().top;
        const rowTop = (row as HTMLElement).getBoundingClientRect().top;
        scrollContainer.scrollTop +=
          rowTop - containerTop - scrollContainer.clientHeight / 2 + (row as HTMLElement).offsetHeight / 2;
      }
    }
  };

  const handleSelectTime = () => {
    const time = `${hour() ?? "HH"}:${minute() ?? "mm"}`;
    if (isValidTime(time) && selectedTime() !== time) {
      setSelectedTime(time);
      if (inputEl) {
        inputEl.value = time;
        inputEl.dispatchEvent(new InputEvent("input", { bubbles: true }));
      }
      hideTimePicker();
    }
  };

  const handleCancelClick = () => {
    hideTimePicker();
    if (isValidTime(selectedTime())) {
      const [h, m] = selectedTime().split(":");
      setHour(h);
      setMinute(m);
    } else {
      setHour(undefined);
      setMinute(undefined);
    }
  };

  const handleTimePickerKeyDown = (e: KeyboardEvent) => {
    if (!timePickerRef) return;

    const activeEl = document.activeElement as HTMLElement;
    switch (e.key) {
      case "Tab": {
        const focusables = getFocusableElements(timePickerRef);
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

      case "ArrowUp":
        e.preventDefault();
        if (activeEl?.hasAttribute("data-hour-cell")) {
          const newHour = zeroPad((Number.parseInt(activeEl.textContent!) - 1 + 24) % 24, 2);
          setHour(newHour);
          hourCellRefs.get(newHour)?.focus();
        } else if (activeEl?.hasAttribute("data-minute-cell")) {
          const newMinute = zeroPad((Number.parseInt(activeEl.textContent!) - 1 + 60) % 60, 2);
          setMinute(newMinute);
          minuteCellRefs.get(newMinute)?.focus();
        }
        break;

      case "ArrowDown":
        e.preventDefault();
        if (activeEl?.hasAttribute("data-hour-cell")) {
          const newHour = zeroPad((Number.parseInt(activeEl.textContent!) + 1) % 24, 2);
          setHour(newHour);
          hourCellRefs.get(newHour)?.focus();
        } else if (activeEl?.hasAttribute("data-minute-cell")) {
          const newMinute = zeroPad((Number.parseInt(activeEl.textContent!) + 1) % 60, 2);
          setMinute(newMinute);
          minuteCellRefs.get(newMinute)?.focus();
        }
        break;
      case "Home":
        e.preventDefault();
        if (activeEl?.hasAttribute("data-hour-cell")) {
          setHour("00");
          hourCellRefs.get("00")?.focus();
        } else if (activeEl?.hasAttribute("data-minute-cell")) {
          setMinute("00");
          minuteCellRefs.get("00")?.focus();
        }
        break;
      case "End":
        e.preventDefault();
        if (activeEl?.hasAttribute("data-hour-cell")) {
          setHour("23");
          hourCellRefs.get("23")?.focus();
        } else if (activeEl?.hasAttribute("data-minute-cell")) {
          setMinute("59");
          minuteCellRefs.get("59")?.focus();
        }
        break;
      case "Enter":
        e.preventDefault();
        handleSelectTime();
        break;
      case " ":
        e.preventDefault();
        if (activeEl?.hasAttribute("data-hour-cell")) {
          const newHour = activeEl.textContent!;
          setHour(newHour);
        } else if (activeEl?.hasAttribute("data-minute-cell")) {
          const newMinute = activeEl.textContent!;
          setMinute(newMinute);
        }
        break;

      case "Escape":
        hideTimePicker();
        break;
    }
  };

  return (
    <>
      <div class={cn("relative", local.class)}>
        <TimeInput
          class={cn("w-full", local.inputClass)}
          {...inputProps}
          value={selectedTime()}
          onChange={(value) => {
            const arr = value.split(":");
            setHour(arr[0]);
            setMinute(arr[1]);
            setSelectedTime(value);
          }}
          onFocus={() => hideTimePicker()}
          expose={handleExpose}
        />
        <Show when={!inputProps.disabled}>
          <button
            class="absolute top-2 right-2 cursor-pointer"
            type="button"
            aria-label={i18next.t("calendar.chooseTime")}
            onClick={() => toggleTimePicker()}
          >
            <Clock size={"20px"} class="text-gray-700" />
          </button>
        </Show>

        <Show when={showTimePicker() || isHiding()}>
          <div
            ref={(el) => (timePickerRef = el)}
            tabIndex={0}
            onKeyDown={handleTimePickerKeyDown}
            class={cn(
              "absolute z-40 mx-auto mt-0.5 w-[150px] rounded-sm border border-gray-300 bg-white p-3 text-xs shadow-xl",
              isHiding() ? "animate-slideUp" : "animate-slideDown",
            )}
            role="region"
            aria-label={i18next.t("calendar.chooseTime")}
          >
            <div class="w-full">
              <div class="grid grid-cols-2">
                <div class="w-full">
                  <div
                    class="flex-1 py-2 text-center font-semibold text-gray-700 select-none"
                    aria-label={i18next.t("calendar.hour")}
                  >
                    {i18next.t("calendar.hour")}
                  </div>
                  <div ref={hourDivRef} class="grid max-h-[200px] grid-cols-1 overflow-y-scroll">
                    <For each={hours()}>
                      {(h) => (
                        <button
                          ref={(el) => {
                            hourCellRefs.set(h, el);
                          }}
                          type="button"
                          aria-disabled={inputProps.disabled}
                          data-hour-cell
                          aria-label={`${i18next.t("calendar.hour")}: ${h}`}
                          aria-selected={isSelectedHour(h)}
                          class={cn(
                            "m-1 w-[25px] flex-1 cursor-pointer rounded-full bg-white p-1 text-center text-gray-900 focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-white focus:outline-none",
                            {
                              "bg-sky-800": isSelectedHour(h),
                              "text-white": isSelectedHour(h),
                              "border border-slate-400": isCurrentHour(h),
                              selected: isSelectedHour(h),
                              current: isCurrentHour(h),
                            },
                            isSelectedHour(h) ? "hover:opacity-90" : "hover:bg-slate-200",
                          )}
                          tabIndex={isSelectedHour(h) ? 0 : hour() === undefined && isCurrentHour(h) ? 0 : -1}
                          onClick={() => setHour(h)}
                        >
                          {h}
                        </button>
                      )}
                    </For>
                  </div>
                </div>
                <div>
                  <div
                    class="flex-1 py-2 text-center font-semibold text-gray-700 select-none"
                    aria-label={i18next.t("calendar.minute")}
                  >
                    {i18next.t("calendar.minute")}
                  </div>
                  <div ref={minuteDivRef} class="grid max-h-[200px] grid-cols-1 overflow-y-scroll">
                    <For each={minutes()}>
                      {(m) => (
                        <button
                          ref={(el) => {
                            minuteCellRefs.set(m, el);
                          }}
                          type="button"
                          aria-disabled={inputProps.disabled}
                          data-minute-cell
                          aria-label={`${i18next.t("calendar.minute")}: ${m}`}
                          aria-selected={isSelectedMinute(m)}
                          class={cn(
                            "m-1 w-[25px] flex-1 cursor-pointer rounded-full bg-white p-1 text-center text-gray-900 focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-white focus:outline-none",
                            {
                              "bg-sky-800": isSelectedMinute(m),
                              "text-white": isSelectedMinute(m),
                              "border border-slate-400": isCurrentMinute(m),
                              selected: isSelectedMinute(m),
                              current: isCurrentMinute(m),
                            },
                            isSelectedMinute(m) ? "hover:opacity-90" : "hover:bg-slate-200",
                          )}
                          tabIndex={isSelectedMinute(m) ? 0 : minute() === undefined && isCurrentMinute(m) ? 0 : -1}
                          onClick={() => setMinute(m)}
                        >
                          {m}
                        </button>
                      )}
                    </For>
                  </div>
                </div>
              </div>
            </div>

            <div class="my-4 flex items-center justify-around">
              <Button size="sm" type="button" disabled={!hour() || !minute()} onClick={() => handleSelectTime()}>
                {i18next.t("common.ok")}
              </Button>
              <Button type="button" size="sm" variant="danger" onClick={() => handleCancelClick()}>
                {i18next.t("common.cancel")}
              </Button>
            </div>
          </div>
        </Show>
      </div>
    </>
  );
};
