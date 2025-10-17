import { cn } from "@/utils/cls-util";
import { Component, createUniqueId, mergeProps, Show, splitProps } from "solid-js";
import { DateInput, DateInputProps } from "../date-time/date-input";
import { DatePicker } from "../date-time/date-picker";

export type DateFieldProps = Omit<DateInputProps, "invalid" | "onChange"> & {
  name?: string;
  error?: string;
  label?: string;
  onChange?: (value: string) => void;
  useDatePicker?: boolean;
};
export const DateField: Component<DateFieldProps> = (props) => {
  const finalProps = mergeProps(
    { pattern: "MM/DD/YYYY", disabled: false, required: false, invalid: false, useDatePicker: true },
    props,
  );
  const [local, inputProps] = splitProps(finalProps, ["error", "label", "onInput", "useDatePicker"]);

  const id = createUniqueId();

  return (
    <div class="flex flex-col">
      <label id={`${id}-label`} for={id} class="block text-sm font-medium text-nowrap text-gray-700">
        {local.label} {inputProps.required && <span>*</span>}
      </label>
      <Show
        when={local.useDatePicker}
        fallback={
          <DateInput
            {...inputProps}
            id={id}
            class={cn("mt-1", { "border-red-500": !!local.error })}
            invalid={!!local.error}
            onInput={local.onInput}
          />
        }
      >
        <DatePicker
          {...inputProps}
          id={id}
          class="mt-1"
          inputClass={cn({ "border-red-500": !!local.error })}
          invalid={!!local.error}
          onInput={local.onInput}
        />
      </Show>

      <Show when={!!finalProps.error}>
        <div id={`${finalProps.name}-error`} class="mt-1.5 text-xs text-red-500 italic">
          {finalProps.error}
        </div>
      </Show>
    </div>
  );
};
