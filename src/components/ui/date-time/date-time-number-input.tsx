import { cn } from "@/utils/cls-util";
import { zeroPad } from "@/utils/common-utils";
import { Component, createEffect, createMemo, createSignal, createUniqueId } from "solid-js";

export type DateTimeNumberInputProps = {
  type: "month" | "day" | "year" | "hour" | "minute";
  min: number;
  max: number;
  pattern: string;
  label?: string;
  value?: number;
  textValue?: string;
  tabIndex?: number;
  onChange?: (value: number | undefined) => void;
  class?: string;
  onFocusIn?: (e: FocusEvent) => void;
  onFocusOut?: (e: FocusEvent) => void;
  onFocus?: (e: FocusEvent) => void;
  disabled?: boolean;
};

export const DateTimeNumberInput: Component<DateTimeNumberInputProps> = (props) => {
  const id = createUniqueId();
  const [value, setValue] = createSignal<number | undefined>(props.value);

  createEffect(() => {
    setValue(props.value);
  });

  const updateValue = (v: number | undefined) => {
    if (props.disabled) return;
    setValue(v);
    if (props.onChange) {
      props.onChange(v);
    }
  };

  const strValue = createMemo(() => {
    return value() === undefined ? props.pattern : zeroPad(value()!, props.pattern.length);
  });

  let ref: HTMLSpanElement | undefined = undefined;

  return (
    <>
      <span
        id={id}
        ref={(el) => (ref = el)}
        aria-labelledby={id}
        aria-readonly={props.disabled || false}
        aria-valuemin={props.min}
        aria-valuemax={props.max}
        aria-valuetext={props.textValue}
        aria-label={props.label}
        aria-disabled={props.disabled || false}
        aria-valuenow={props.value}
        tabIndex={props.disabled ? -1 : (props.tabIndex ?? -1)}
        contentEditable={!props.disabled}
        role="spinbutton"
        autoCapitalize="off"
        inputMode={props.disabled ? "none" : "numeric"}
        class={cn(
          "border-none bg-white focus:border-none focus:ring-0 focus:outline-none disabled:pointer-events-none disabled:opacity-70",
          {
            "pointer-events-none opacity-70": props.disabled,
          },
          props.class,
        )}
        onFocus={(e) => {
          if (props.disabled) return;
          if (ref) {
            const range = document.createRange();
            range.selectNodeContents(ref);
            const selection = window.getSelection();
            selection?.removeAllRanges();
            selection?.addRange(range);
          }
          props.onFocus?.(e);
        }}
        onFocusIn={(e) => !props.disabled && props.onFocusIn && props.onFocusIn(e)}
        onFocusOut={(e) => !props.disabled && props.onFocusOut && props.onFocusOut(e)}
        onBeforeInput={(e) => {
          if (props.disabled) {
            e.preventDefault();
            return;
          }
          const input = e.data || "";
          if (!/^\d*$/.test(input)) {
            e.preventDefault();
            return;
          }
          if (input === "") {
            // Handle backspace or delete
            updateValue(undefined);
            e.preventDefault();
            return;
          }

          const currentValue = value();
          if (currentValue === undefined) {
            const newValue = input;
            const numeric = parseInt(newValue, 10);
            if (!isNaN(numeric) && numeric >= props.min && numeric <= props.max) {
              updateValue(numeric);
            }
          } else {
            const currentText = currentValue.toString();
            const newText = currentText + input;
            const numeric = parseInt(newText, 10);
            if (!isNaN(numeric) && numeric >= props.min && numeric <= props.max) {
              updateValue(numeric);
            } else {
              const numeric2 = parseInt(input, 10);
              if (!isNaN(numeric2) && numeric2 >= props.min && numeric2 <= props.max) {
                updateValue(numeric2);
              }
            }
          }
          e.preventDefault();
        }}
        onPaste={(e) => {
          if (props.disabled) {
            e.preventDefault();
            return;
          }
          // @ts-expect-error for older browsers
          const paste = (e.clipboardData || window.clipboardData).getData("text");
          const digitsOnly = paste.replace(/\D/g, "").substring(0, props.pattern.length);
          const currentValue = value();
          if (currentValue === undefined) {
            const numeric = parseInt(digitsOnly, 10);
            if (!isNaN(numeric) && numeric >= props.min && numeric <= props.max) {
              updateValue(numeric);
            }
          } else {
            const currentText = currentValue.toString();
            const newText = currentText + digitsOnly;
            const numeric = parseInt(newText, 10);
            if (!isNaN(numeric) && numeric >= props.min && numeric <= props.max) {
              updateValue(numeric);
            } else {
              const numeric2 = parseInt(digitsOnly, 10);
              if (!isNaN(numeric2) && numeric2 >= props.min && numeric2 <= props.max) {
                updateValue(numeric2);
              }
            }
          }
          e.preventDefault();
        }}
        onKeyDown={(e) => {
          if (props.disabled) {
            e.preventDefault();
            return;
          }
          const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Home", "End"];
          if (
            allowedKeys.includes(e.key) ||
            e.ctrlKey ||
            e.metaKey // allow copy/paste/etc
          ) {
            return;
          }

          if (e.key === "ArrowUp") {
            e.preventDefault();
            const newValue = (value() || 0) + 1;
            if (newValue <= props.max) {
              updateValue(newValue);
            }
            return;
          }
          if (e.key === "ArrowDown") {
            e.preventDefault();
            const newValue = (value() || 0) - 1;
            if (newValue >= props.min) {
              updateValue(newValue);
            }
            return;
          }
          // Allow only digits
          if (e.key.length === 1 && !/^\d$/.test(e.key)) {
            e.preventDefault();
          }
        }}
      >
        {strValue()}
      </span>
    </>
  );
};
