import { cn } from "@/utils/cls-util";
import { zeroPad } from "@/utils/common-utils";
import i18next from "i18next";
import { Component, createEffect, createMemo, createSignal, createUniqueId, mergeProps, onMount } from "solid-js";
import { DateTimeNumberInput } from "./date-time-number-input";

export const isValidTime = (value: string) => {
  const timeRgx = /^(([0|1]\d)|(2[0-3])):([0-5]\d)$/;
  return timeRgx.test(value);
};

export type TimeInputProps = {
  id?: string;
  name?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  invalid?: boolean;
  value?: string;
  class?: string;
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
export const TimeInput: Component<TimeInputProps> = (props) => {
  const finalProps = mergeProps({ disabled: false, required: false, invalid: false }, props);

  const id = createUniqueId();

  ////////////// Signals ///////////////////
  const [hour, setHour] = createSignal<number | undefined>();
  const [minute, setMinute] = createSignal<number | undefined>();
  const [focused, setFocused] = createSignal(false);

  ////////////// Effects ///////////////////
  // sync hour and minute when value property changes
  createEffect(() => {
    if (props.value) {
      const arr = props.value.split(":").map((str) => Number.parseInt(str));
      setHour(isNaN(arr[0]) ? undefined : arr[0]);
      setMinute(isNaN(arr[1]) ? undefined : arr[1]);
    } else {
      setHour(undefined);
      setMinute(undefined);
    }
  });

  onMount(() => {
    if (inputRef) {
      props.expose?.({ inputEl: inputRef });
    }
  });

  const handleTimeChange = (type: "hour" | "minute", num: number) => {
    const newHour = type === "hour" ? num : hour();
    const newMinute = type === "minute" ? num : minute();

    setHour(newHour);
    setMinute(newMinute);
    if (inputRef) {
      inputRef.value = timeStrValue();
      inputRef.dispatchEvent(new InputEvent("input", { bubbles: true }));
      inputRef.dispatchEvent(new Event("change", { bubbles: true }));
    }
    finalProps.onChange?.(timeStrValue());
  };

  /////////// Refs /////////////////////
  let inputRef: HTMLInputElement | undefined = undefined;

  const timeStrValue = createMemo(() => {
    if (hour() === undefined && minute() === undefined) {
      return "";
    } else {
      return `${hour() === undefined ? "HH" : zeroPad(hour()!, 2)}:${minute() === undefined ? "mm" : zeroPad(minute()!, 2)}`;
    }
  });

  return (
    <div
      id={finalProps.id}
      aria-labelledby={`${finalProps.id}-label`}
      data-testid="time-input-container"
      class={cn(
        "flex w-full appearance-none flex-col rounded border border-gray-300 px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none",
        {
          "ring-2": focused() && !finalProps.disabled,
          "pointer-events-none bg-gray-100 opacity-70": finalProps.disabled,
        },
        finalProps.class,
      )}
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
          type="hour"
          disabled={finalProps.disabled}
          tabIndex={0}
          class="after:content-[':']"
          min={0}
          max={23}
          label={i18next.t("calendar.hour")}
          value={hour()}
          textValue={hour() === undefined ? "HH" : zeroPad(hour()!, 2)}
          pattern="HH"
          onChange={(num) => handleTimeChange("hour", num!)}
          onFocusIn={() => setFocused(true)}
          onFocusOut={() => setFocused(false)}
          onFocus={finalProps.onFocus}
        />
        <DateTimeNumberInput
          type="minute"
          disabled={finalProps.disabled}
          min={0}
          max={59}
          label={i18next.t("calendar.minute")}
          value={minute()}
          textValue={minute() === undefined ? "mm" : zeroPad(minute()!, 2)}
          pattern="mm"
          onChange={(num) => handleTimeChange("minute", num!)}
          onFocusIn={() => setFocused(true)}
          onFocusOut={() => setFocused(false)}
          onFocus={finalProps.onFocus}
        />
      </span>
      <input
        id={`${id}-input`}
        ref={inputRef}
        type="hidden"
        data-testid="time-input"
        tabIndex={-1}
        disabled={finalProps.disabled}
        aria-hidden="true"
        aria-invalid={!!finalProps.invalid}
        aria-disabled={!!finalProps.disabled}
        aria-readonly={!!finalProps.readonly}
        aria-required={!!finalProps.required}
        name={props.name}
        value={timeStrValue()}
        onInput={(e) => {
          finalProps.onInput?.(e);
        }}
      />
    </div>
  );
};
