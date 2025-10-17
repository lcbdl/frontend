import { cn } from "@/utils/cls-util";
import type { ComponentProps } from "solid-js";
import { Show, createUniqueId, splitProps } from "solid-js";
import { ShowError } from "../ShowError";

export type ToggleSwitchProps = Omit<
  ComponentProps<"input">,
  "value" | "onInput" | "onBlur" | "type" | "onChange" | "ref"
> & {
  label?: string;
  value?: boolean;
  onChange: (value: boolean) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
};

export function ToggleSwitch(props: ToggleSwitchProps) {
  const [local, inputProps] = splitProps(props, [
    "value",
    "label",
    "onChange",
    "error",
    "required",
    "disabled",
    "name",
  ]);

  const id = createUniqueId();
  const errorId = `${id}-error`;

  // Handle change event for the checkbox
  const handleChange = (e: Event) => {
    const newValue = (e.target as HTMLInputElement).checked;
    local.onChange(newValue); // Propagate change to parent
  };

  return (
    <div class="flex flex-col">
      <Show when={local.label}>
        <label id={`${id}-label`} class="block text-sm font-medium text-nowrap text-gray-700">
          {local.label} {local.required && <span> *</span>}
        </label>
      </Show>

      <label
        for={id}
        class={cn(
          "relative mt-1 inline-flex cursor-pointer items-center",
          "disabled:pointer-events-none disabled:opacity-70",
          local.disabled && "cursor-not-allowed",
        )}
      >
        {/* The input checkbox */}
        <input
          {...inputProps}
          type="checkbox"
          id={id}
          checked={local.value}
          onChange={handleChange}
          disabled={local.disabled}
          aria-checked={local.value}
          aria-labelledby={local.label ? `${id}-label` : undefined}
          aria-describedby={local.error ? errorId : undefined}
          aria-invalid={!!local.error}
          class="sr-only"
        />

        {/* The visible toggle switch */}
        <span
          class={cn(
            "inline-flex h-6 w-11 items-center rounded-full transition-colors",
            local.value ? "bg-sky-600" : "bg-gray-300",
          )}
        >
          <span
            class={cn(
              "h-4 w-4 rounded-full bg-white transition-transform",
              local.value ? "translate-x-6" : "translate-x-1",
            )}
          />
        </span>
      </label>

      <Show when={local.error}>
        <ShowError errorId={errorId} error={local.error} />
      </Show>
    </div>
  );
}
