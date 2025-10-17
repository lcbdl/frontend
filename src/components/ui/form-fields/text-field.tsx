import { cn } from "@/utils/cls-util";
import { ComponentProps, Show, splitProps } from "solid-js";
import { ShowError } from "../ShowError";

export type TextFieldProps = Omit<ComponentProps<"input">, "type"> & {
  type: "text" | "email" | "tel" | "password" | "url" | "date" | "number";
  label?: string;
  error?: string;
};

export function TextField(props: TextFieldProps) {
  const [local, inputProps] = splitProps(props, ["value", "name", "label", "error", "disabled", "required", "class"]);

  return (
    <div class="flex flex-col">
      <Show when={local.label}>
        <label for={local.name} class="block text-sm font-medium text-nowrap text-gray-700">
          {local.label} {local.required && <span>*</span>}
        </label>
      </Show>
      <input
        {...inputProps}
        class={cn(
          "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-xs disabled:pointer-events-none disabled:bg-gray-100 disabled:opacity-70",
          { "border-red-500": local.error },
          local.class,
        )}
        id={local.name}
        disabled={local.disabled}
        value={local.value || ""}
        aria-invalid={!!local.error}
        aria-disabled={!!local.disabled}
        aria-errormessage={`${local.name}-error`}
      />
      <Show when={local.error}>
        <ShowError errorId={`${local.name}-error`} error={local.error} />
      </Show>
    </div>
  );
}
