import { cn } from "@/utils/cls-util";
import { ComponentProps, Show, splitProps } from "solid-js";
import { ShowError } from "../ShowError";

export type TextAreaProps = Omit<ComponentProps<"textarea">, "children"> & {
  label?: string;
  labelClass?: string;
  error?: string;
  maxHeight?: string;
};

export function TextArea(props: TextAreaProps) {
  const [local, textareaProps] = splitProps(props, [
    "value",
    "name",
    "label",
    "error",
    "disabled",
    "required",
    "class",
    "labelClass",
  ]);

  return (
    <div class="flex flex-col">
      <Show when={local.label}>
        <label for={local.name} class={cn("block text-sm font-medium text-nowrap text-gray-700", local.labelClass)}>
          {local.label} {local.required && <span aria-hidden="true">*</span>}
        </label>
      </Show>
      <textarea
        {...textareaProps}
        id={local.name}
        class={cn(
          "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-xs focus:ring-2 focus:outline-none disabled:pointer-events-none disabled:bg-gray-100 disabled:opacity-70",
          { "border-red-500": local.error },
          local.class,
        )}
        disabled={local.disabled}
        value={local.value || ""}
        aria-invalid={!!local.error}
        aria-disabled={!!local.disabled}
        aria-errormessage={local.error ? `${local.name}-error` : undefined}
        required={local.required}
      />
      <Show when={local.error}>
        <ShowError errorId={`${local.name}-error`} error={local.error} />
      </Show>
    </div>
  );
}
