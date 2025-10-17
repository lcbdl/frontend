import { cn } from "@/utils/cls-util";
import { Component, createUniqueId, mergeProps, Show, splitProps } from "solid-js";
import { TimeInput, TimeInputProps } from "../date-time/time-input";
import { TimePicker } from "../date-time/time-picker";

export type TimeFieldProps = Omit<TimeInputProps, "invalid"> & {
  name?: string;
  error?: string;
  label?: string;
  useTimePicker?: boolean;
};
export const TimeField: Component<TimeFieldProps> = (props) => {
  const finalProps = mergeProps({ disabled: false, required: false, invalid: false, useTimePicker: true }, props);
  const [local, inputProps] = splitProps(finalProps, ["error", "name", "label", "onInput", "useTimePicker"]);

  const id = createUniqueId();

  return (
    <div class="flex flex-col">
      <label id={`${id}-label`} for={id} class="block text-sm font-medium text-nowrap text-gray-700">
        {local.label} {inputProps.required && <span>*</span>}
      </label>
      <Show
        when={local.useTimePicker}
        fallback={
          <TimeInput
            {...inputProps}
            id={id}
            class={cn("mt-1", { "border-red-500": !!local.error })}
            invalid={!!local.error}
            onInput={local.onInput}
          />
        }
      >
        <TimePicker
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
