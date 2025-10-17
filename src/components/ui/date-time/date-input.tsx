import i18n from "@/i18n";
import { cn } from "@/utils/cls-util";
import { daysInMonth, toOrdinal, zeroPad } from "@/utils/common-utils";
import dayjs from "dayjs";
import { Component, Show, createEffect, createMemo, createSignal, createUniqueId, mergeProps, onMount } from "solid-js";
import { DateTimeNumberInput } from "./date-time-number-input";

const MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

export type DateInputProps = {
  id?: string;
  name?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  invalid?: boolean;
  value?: string;
  class?: string;
  pattern?: string;
  onChange?: (value: string) => void;
  onInput?: (
    e: InputEvent & {
      currentTarget: HTMLInputElement;
      target: HTMLInputElement;
    },
  ) => void;
  onFocus?: (e: FocusEvent) => void;
  expose?: (api: { inputEl: HTMLInputElement }) => void;
};
export const DateInput: Component<DateInputProps> = (props) => {
  const finalProps = mergeProps({ pattern: "MM/DD/YYYY", disabled: false, required: false, invalid: false }, props);

  const id = createUniqueId();

  const dateProp = finalProps.value && finalProps.pattern ? dayjs(finalProps.value, finalProps.pattern) : undefined;

  ////////////////// Signals //////////////////////
  const [day, setDay] = createSignal<number | undefined>(dateProp?.isValid() ? dateProp.date() : undefined);
  const [month, setMonth] = createSignal<number | undefined>(dateProp?.isValid() ? dateProp.month() + 1 : undefined);
  const [year, setYear] = createSignal<number | undefined>(dateProp?.isValid() ? dateProp.year() : undefined);
  const [focused, setFocused] = createSignal(false);

  ////////////////// Effects //////////////////////
  createEffect(() => {
    if (finalProps.value && finalProps.pattern) {
      const ymd = getYearMonthDayFromStringDate(finalProps.value, finalProps.pattern);
      setDay(ymd?.day);
      setMonth(ymd?.month);
      setYear(ymd?.year);
    }
  });

  const getYearMonthDayFromStringDate = (strDate: string, format: string) => {
    const regex = /^(YYYY|MM|DD)([-\/])(MM|DD|YYYY)\2(MM|DD|YYYY)$/;
    const match = format.match(regex);
    if (!match) return undefined;
    const separator = match[2];
    const patternParts = format.split(separator); // e.g., ['YYYY', 'MM', 'DD']
    const dateParts = strDate.split(separator); // e.g., ['2025', '01', '12']

    let year: number | undefined = undefined,
      month: number | undefined = undefined,
      day: number | undefined = undefined;

    patternParts.forEach((part, i) => {
      const val = Number.parseInt(dateParts[i]);
      if (part === "YYYY") year = isNaN(val) ? undefined : val;
      if (part === "MM") month = isNaN(val) ? undefined : val;
      if (part === "DD") day = isNaN(val) ? undefined : val;
    });
    return { year, month, day };
  };

  const parsePattern = (
    pattern: string,
  ): {
    isValidPattern: boolean;
    parts?: {
      type: "year" | "month" | "day";
      min: number;
      max: number;
      label: string;
      value?: number;
      textValue?: string;
      pattern: "YYYY" | "MM" | "DD";
    }[];
    separator?: string;
  } => {
    const regex = /^(YYYY|MM|DD)([-\/])(MM|DD|YYYY)\2(MM|DD|YYYY)$/;
    const match = pattern.match(regex);

    if (!match) return { isValidPattern: false };

    const parts = [match[1], match[3], match[4]];
    const uniqueParts = new Set(parts);
    const isValidPattern = uniqueParts.size === 3;

    return {
      isValidPattern,
      parts: parts.map((p) => {
        if (p === "YYYY")
          return {
            type: "year",
            min: 1,
            max: 2199,
            label: i18n.t("calendar.year"),
            value: year(),
            textValue: year() === undefined ? "" : `${year()}`,
            pattern: "YYYY",
          };
        if (p === "MM")
          return {
            type: "month",
            min: 1,
            max: 12,
            label: i18n.t("calendar.month"),
            value: month(),
            textValue: month() == undefined ? undefined : i18n.t(`calendar.months.${MONTHS[month() ?? 1]}.value`),
            pattern: "MM",
          };
        return {
          type: "day",
          min: 1,
          max: daysInMonth(month(), year()),
          label: i18n.t("calendar.day"),
          value: day(),
          textValue: toOrdinal(day()),
          pattern: "DD",
        };
      }),
      separator: match[2],
    };
  };

  ////////////////// Memos ////////////////////////
  const pattern = createMemo(() => parsePattern(finalProps.pattern));

  const handleDateChange = (type: "year" | "month" | "day", num: number) => {
    const newYear = type === "year" ? num : year();
    const newMonth = type === "month" ? num : month();
    let newDay = type === "day" ? num : day();
    const maxDay = daysInMonth(newMonth, newYear);
    if (newDay !== undefined && newDay > maxDay) {
      newDay = maxDay;
    }
    setYear(newYear);
    setMonth(newMonth);
    setDay(newDay);
    if (inputRef) {
      inputRef.value = dateStrValue();
      inputRef.dispatchEvent(new InputEvent("input", { bubbles: true }));
      inputRef.dispatchEvent(new Event("change", { bubbles: true }));
      finalProps.onChange?.(dateStrValue());
    }
  };

  let inputRef: HTMLInputElement | undefined = undefined;

  onMount(() => {
    if (inputRef) {
      props.expose?.({ inputEl: inputRef });
    }
  });

  const dateStrValue = createMemo(() => {
    const parts = pattern().parts;
    if ((parts?.filter((p) => p.value === undefined).length ?? 0) === 3) {
      return "";
    } else {
      return (
        (parts ?? [])
          .map((p) => (p.value === undefined ? p.pattern : zeroPad(p.value, p.pattern.length)))
          .join(pattern().separator) ?? "-"
      );
    }
  });

  return (
    <div
      aria-labelledby={`${finalProps.id}-label`}
      id={finalProps.id}
      data-testid="date-input-container"
      class={cn(
        "flex w-full appearance-none flex-col rounded border border-gray-300 px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none",
        {
          "ring-2": focused() && !finalProps.disabled,
          "outline-none": focused() && !finalProps.disabled,
          "pointer-events-none bg-gray-100 opacity-70": finalProps.disabled,
        },
        finalProps.class,
      )}
    >
      <Show
        when={pattern().isValidPattern && pattern().parts}
        fallback={<span class="text-red-500">Invalid pattern</span>}
      >
        <span
          id={id}
          class="flex gap-0"
          role="group"
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") {
              e.preventDefault();
              const target = e.target as HTMLSpanElement;
              const prev = target.previousElementSibling;
              if (prev) {
                (prev as HTMLSpanElement).focus();
              }
            } else if (e.key === "ArrowRight") {
              e.preventDefault();
              const target = e.target as HTMLSpanElement;
              const next = target.nextElementSibling;
              if (next) {
                (next as HTMLSpanElement).focus();
              }
            }
          }}
        >
          <DateTimeNumberInput
            type={pattern().parts![0].type}
            disabled={finalProps.disabled}
            tabIndex={0}
            class={cn({
              "after:content-['-']": pattern().separator === "-",
              "after:content-['/']": pattern().separator === "/",
            })}
            min={pattern().parts![0].min}
            max={pattern().parts![0].max}
            label={pattern().parts![0].label}
            value={pattern().parts![0].value}
            textValue={pattern().parts![0].textValue}
            pattern={pattern().parts![0].pattern}
            onChange={(num) => handleDateChange(pattern().parts![0].type, num!)}
            onFocusIn={() => setFocused(true)}
            onFocusOut={() => setFocused(false)}
            onFocus={finalProps.onFocus}
          />
          <DateTimeNumberInput
            type={pattern().parts![1].type}
            disabled={finalProps.disabled}
            class={cn({
              "after:content-['-']": pattern().separator === "-",
              "after:content-['/']": pattern().separator === "/",
            })}
            min={pattern().parts![1].min}
            max={pattern().parts![1].max}
            label={pattern().parts![1].label}
            value={pattern().parts![1].value}
            textValue={pattern().parts![1].textValue}
            pattern={pattern().parts![1].pattern}
            onChange={(num) => handleDateChange(pattern().parts![1].type, num!)}
            onFocusIn={() => setFocused(true)}
            onFocusOut={() => setFocused(false)}
            onFocus={finalProps.onFocus}
          />
          <DateTimeNumberInput
            type={pattern().parts![2].type}
            disabled={finalProps.disabled}
            min={pattern().parts![2].min}
            max={pattern().parts![2].max}
            label={pattern().parts![2].label}
            value={pattern().parts![2].value}
            textValue={pattern().parts![2].textValue}
            pattern={pattern().parts![2].pattern}
            onChange={(num) => handleDateChange(pattern().parts![2].type, num!)}
            onFocusIn={() => setFocused(true)}
            onFocusOut={() => setFocused(false)}
            onFocus={finalProps.onFocus}
          />
        </span>
        <input
          id={`${id}-input`}
          ref={inputRef}
          type="hidden"
          data-testid="date-input"
          tabIndex={-1}
          disabled={finalProps.disabled}
          aria-hidden="true"
          aria-invalid={!!finalProps.invalid}
          aria-disabled={!!finalProps.disabled}
          aria-readonly={!!finalProps.readonly}
          aria-required={!!finalProps.required}
          name={props.name}
          value={dateStrValue()}
          onInput={(e) => {
            finalProps.onInput?.(e);
          }}
        />
      </Show>
    </div>
  );
};
