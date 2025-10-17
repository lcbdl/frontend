import { cn } from "@/utils/cls-util";
import type { ComponentProps } from "solid-js";
import { For, Show, createUniqueId, splitProps } from "solid-js";
import { ShowError } from "../ShowError";

export type CheckboxFieldProps = Omit<ComponentProps<"input">, "type" | "value" | "checked" | "onChange"> & {
  label?: string;
  options?: { label: string; value: string }[];
  value: boolean | string[];
  onChange: (value: boolean | string[]) => void;
  error?: string;
};

export function CheckboxField(props: CheckboxFieldProps) {
  // Split out props for easier logic vs native input spread
  const [local, inputProps] = splitProps(props, [
    "label",
    "options",
    "value",
    "onChange",
    "error",
    "required",
    "disabled",
    "name",
  ]);

  const id = createUniqueId(); // Unique base ID for inputs
  const errorId = `${id}-error`; // Used for aria-describedby

  // Handle checkbox change for single and multi-select cases
  const handleChange = (e: Event) => {
    if (local.disabled) return;
    const target = e.currentTarget as HTMLInputElement;
    const optionValue = target.value;
    const checked = target.checked;

    if (Array.isArray(props.value)) {
      const currentValue = props.value;
      const newValue = checked
        ? [...currentValue, optionValue] // Add the option value if checked
        : currentValue.filter((val) => val !== optionValue); // Remove if unchecked
      props.onChange(newValue);
    } else {
      props.onChange(checked);
    }
  };

  return (
    <div class="flex flex-col">
      {/* Optional Label (used above input or group) */}
      <Show when={local.label}>
        <label
          for={!Array.isArray(props.value) ? id : undefined}
          class="block text-sm font-medium text-nowrap text-gray-700"
        >
          {local.label} {local.required && <span>*</span>}
        </label>
      </Show>

      {/* If array: render a group of checkboxes, else: single checkbox */}
      <Show
        when={Array.isArray(props.value)}
        fallback={
          <div class="flex items-center gap-2">
            <input
              {...inputProps}
              id={id}
              name={local.name}
              type="checkbox"
              disabled={local.disabled}
              checked={props.value as boolean}
              onChange={handleChange}
              aria-invalid={!!local.error}
              aria-describedby={local.error ? errorId : undefined}
              aria-required={local.required ? "true" : undefined}
              class={cn(
                "mt-1 h-4 w-4 rounded border border-gray-300 text-sky-600 shadow focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-white focus:outline-none",
                "disabled:pointer-events-none disabled:bg-gray-100 disabled:opacity-70",
                { "border-red-500": local.error },
              )}
            />
            <label for={id} class="text-sm text-gray-700">
              {local.label}
            </label>
          </div>
        }
      >
        <div
          class="flex flex-col gap-2"
          id={id}
          role="group"
          aria-invalid={!!local.error}
          aria-describedby={local.error ? errorId : undefined}
        >
          {/* Render checkbox for each option */}
          <For each={local.options}>
            {(option) => {
              const checkboxId = `${id}-${option.value}`;
              return (
                <div class="flex items-center gap-2">
                  <input
                    {...inputProps}
                    id={checkboxId}
                    name={local.name}
                    type="checkbox"
                    value={option.value}
                    disabled={local.disabled}
                    checked={(props.value as string[]).includes(option.value)}
                    onChange={handleChange}
                    aria-invalid={!!local.error}
                    aria-describedby={local.error ? errorId : undefined}
                    aria-required={local.required ? "true" : undefined}
                    class={cn(
                      "h-4 w-4 rounded border border-gray-300 text-sky-600 shadow focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-white focus:outline-none",
                      "disabled:pointer-events-none disabled:opacity-70",
                      { "border-red-500": local.error },
                    )}
                  />
                  <label for={checkboxId} class="text-sm text-gray-700">
                    {option.label}
                  </label>
                </div>
              );
            }}
          </For>
        </div>
      </Show>

      <Show when={local.error}>
        <ShowError errorId={errorId} error={local.error} />
      </Show>
    </div>
  );
}
