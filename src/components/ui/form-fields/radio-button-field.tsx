import { cn } from "@/utils/cls-util";
import type { ComponentProps } from "solid-js";
import { For, Show, createUniqueId, splitProps } from "solid-js";
import { ShowError } from "../ShowError";

export type RadioButtonFieldProps = Omit<ComponentProps<"input">, "type" | "value" | "onChange"> & {
  label?: string;
  options: { label: string; value: boolean }[];
  value?: boolean;
  onChange: (value: boolean) => void;
  error?: string;
};

export function RadioButtonField(props: RadioButtonFieldProps) {
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

  const id = createUniqueId();
  const errorId = `${id}-error`;

  // Handle radio button change
  const handleChange = (e: Event) => {
    //if (local.disabled) return;
    const target = e.currentTarget as HTMLInputElement;
    const rawValue = target.value;
    props.onChange(rawValue === "true"); // Convert string to boolean
  };

  return (
    <div class="flex flex-col">
      {/* Optional Label (used above input or group) */}
      <Show when={local.label}>
        <label id={`${id}-label`} class="block text-sm font-medium text-nowrap text-gray-700">
          {local.label} {local.required && <span>*</span>}
        </label>
      </Show>

      {/* Render a group of radio buttons */}
      <div
        class="mt-1 flex flex-col gap-2"
        role="radiogroup"
        aria-labelledby={local.label ? `${id}-label` : undefined}
        aria-invalid={!!local.error}
        aria-describedby={local.error ? errorId : undefined}
      >
        {/* Render radio button for each option */}
        <For each={local.options}>
          {(option) => {
            const radioId = `${id}-${option.value}`;
            return (
              <div class="flex items-center gap-2">
                <input
                  {...inputProps}
                  id={radioId}
                  name={local.name}
                  type="radio"
                  value={String(option.value)}
                  checked={props.value === option.value}
                  onChange={handleChange}
                  disabled={local.disabled}
                  aria-invalid={!!local.error}
                  aria-describedby={local.error ? errorId : undefined}
                  aria-required={local.required ? "true" : undefined}
                  class={cn(
                    "h-4 w-4 rounded-full border border-gray-300 text-sky-600 shadow focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-white focus:outline-none",
                    "disabled:pointer-events-none disabled:bg-gray-100 disabled:opacity-70",
                    { "border-red-500": local.error },
                  )}
                />
                <label for={radioId} class="text-sm text-gray-700">
                  {option.label}
                </label>
              </div>
            );
          }}
        </For>
      </div>

      {/* Error Message */}
      <Show when={local.error}>
        <ShowError errorId={errorId} error={local.error} />
      </Show>
    </div>
  );
}
