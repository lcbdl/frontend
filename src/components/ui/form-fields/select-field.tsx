import { cn } from "@/utils/cls-util";
import type { ComponentProps, JSX } from "solid-js";
import { For, Show, createSignal, createUniqueId, onCleanup, splitProps } from "solid-js";
import { ShowError } from "../ShowError";

type SelectFieldOption = {
  label: string;
  value: string;
};

export type SelectFieldProps = Omit<ComponentProps<"select"> & ComponentProps<"input">, "value" | "onChange"> & {
  label?: string;
  name?: string;
  value: string[] | string;
  onChange: (value: string[] | string) => void;
  options: SelectFieldOption[];
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  multiple?: boolean;
};

export function SelectField(props: SelectFieldProps): JSX.Element {
  // Split props into controlled and pass-through props
  const [local, selectProps] = splitProps(props, [
    "label",
    "name",
    "value",
    "onChange",
    "options",
    "placeholder",
    "error",
    "required",
    "disabled",
    "multiple",
  ]);

  const id = createUniqueId();
  const errorId = `${id}-error`;

  const [open, setOpen] = createSignal(false);

  let dropdownRef: HTMLDivElement | undefined;
  let selectRef: HTMLSelectElement | undefined;

  // Handle native select change event (keeps <select> value in sync)
  const handleChange = (e: Event) => {
    if (local.disabled) return;
    const target = e.currentTarget as HTMLSelectElement;

    // For multiple select, collect all selected values
    const selected = local.multiple ? Array.from(target.selectedOptions, (opt) => opt.value) : target.value;

    local.onChange?.(selected);
  };

  /**
   * Handle option click in the custom dropdown list.
   * Updates native <select> element and calls onChange.
   */
  function onOptionClick(value: string) {
    if (local.disabled) return;

    if (local.multiple) {
      if (!Array.isArray(local.value)) return;

      const current = local.value || [];
      const updated = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];

      if (selectRef) {
        Array.from(selectRef.options).forEach((option) => {
          option.selected = updated.includes(option.value);
        });
        // Dispatch native input event for SolidJS reactivity
        selectRef.dispatchEvent(new Event("input", { bubbles: true }));
      }

      local.onChange(updated);
    } else {
      if (!selectRef) return;

      selectRef.value = value;
      Array.from(selectRef.options).forEach((option) => {
        option.selected = option.value === value;
      });
      selectRef.dispatchEvent(new Event("input", { bubbles: true }));

      local.onChange(value);
      setOpen(false); // Close dropdown after selection in single-select mode
    }
  }

  // Close dropdown when clicking outside of it
  const onClickOutside = (e: MouseEvent) => {
    if (!dropdownRef?.contains(e.target as Node)) {
      setOpen(false);
    }
  };
  document.addEventListener("mousedown", onClickOutside);
  onCleanup(() => document.removeEventListener("mousedown", onClickOutside));

  return (
    <div class="relative mb-4 w-full" ref={dropdownRef}>
      {/* Label */}
      <Show when={local.label}>
        <label for={id} class="block text-sm font-medium text-nowrap text-gray-700">
          {local.label}
          {local.required && <span class="ml-0.5"> *</span>}
        </label>
      </Show>

      {/* Native select element - hidden but controlled */}
      <select
        {...selectProps}
        id={id}
        name={local.name}
        multiple={local.multiple}
        disabled={local.disabled}
        ref={selectRef}
        value={local.value}
        onChange={handleChange}
        aria-invalid={!!local.error}
        aria-describedby={local.error ? errorId : undefined}
        aria-required={local.required ? "true" : undefined}
        class="sr-only"
      >
        <For each={local.options}>{(option) => <option value={option.value}>{option.label}</option>}</For>
      </select>

      {/* Custom dropdown button showing selected option(s) as pills */}
      <button
        type="button"
        class={cn(
          "relative mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-left text-sm shadow-sm focus:ring-2 focus:outline-none disabled:pointer-events-none disabled:bg-gray-100 disabled:opacity-70",
          { "border-red-500": !!local.error },
        )}
        disabled={local.disabled}
        onClick={() => setOpen(!open())}
        aria-haspopup="listbox"
        aria-expanded={open()}
        aria-labelledby={id}
      >
        {/* Selected pills or placeholder */}
        <div class="flex min-h-[1.5rem] flex-wrap gap-1">
          <Show
            when={local.multiple ? Array.isArray(local.value) && local.value.length > 0 : !!local.value}
            fallback={
              <span class="text-gray-400">
                {local.placeholder || (local.multiple ? "Select options" : "Select an option")}
              </span>
            }
          >
            <For
              each={
                local.multiple
                  ? local.options.filter((opt) => Array.isArray(local.value) && local.value.includes(opt.value))
                  : local.options.filter((opt) => opt.value === local.value)
              }
            >
              {(opt) => (
                <span class="inline-flex items-center rounded-full px-0 py-0.5 text-xs font-medium">{opt.label}</span>
              )}
            </For>
          </Show>
        </div>

        {/* Dropdown arrow icon */}
        <div class="pointer-events-none absolute top-1/2 right-3 flex -translate-y-1/2 items-center">
          <svg
            class="h-4 w-4 text-gray-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Dropdown menu with options */}
      <Show when={open()}>
        <div
          role="listbox"
          class="absolute z-40 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 text-sm shadow-lg"
          tabindex={-1}
        >
          <For each={local.options}>
            {(option) => {
              // Determine if option is selected based on single or multi select
              const isSelected = () => {
                return local.multiple
                  ? Array.isArray(local.value) && local.value.includes(option.value)
                  : option.value === local.value;
              };

              return (
                <div
                  role="option"
                  aria-selected={isSelected()}
                  class={cn(
                    "cursor-pointer px-4 py-2 select-none",
                    isSelected() ? "bg-sky-100 font-semibold text-sky-700" : "hover:bg-sky-100",
                  )}
                  onClick={() => onOptionClick(option.value)}
                >
                  {option.label}
                </div>
              );
            }}
          </For>
        </div>
      </Show>

      {/* Error message */}
      <Show when={local.error}>
        <ShowError errorId={errorId} error={local.error} />
      </Show>
    </div>
  );
}
