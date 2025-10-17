import { cn } from "@/utils/cls-util";
import { anyMaskToFn, createInputMask, createMaskPattern, InputMask } from "@solid-primitives/input-mask";
import { ComponentProps, Show, splitProps } from "solid-js";
import { ShowError } from "../ShowError";
import "./mask-pattern.css";

export type MaskedInputFieldProps = Omit<ComponentProps<"input">, "type" | "onInput"> & {
  type: "text" | "email" | "tel" | "password" | "url" | "date" | "number";
  label?: string;
  error?: string;
  mask: InputMask;
  onInput?: (
    e: InputEvent & {
      currentTarget: HTMLInputElement;
      target: HTMLInputElement;
    },
  ) => void;
  transform?: (value: string) => string;
};

export function MaskedInputField(props: MaskedInputFieldProps) {
  const [local, inputProps] = splitProps(props, [
    "value",
    "name",
    "label",
    "error",
    "disabled",
    "required",
    "class",
    "onInput",
    "onPaste",
    "placeholder",
    "mask",
    "transform",
  ]);

  const maskToFn = anyMaskToFn(local.mask);
  const maskHandler = createInputMask((value, selection) => {
    const maskOutput = maskToFn(value, selection);
    if (local.transform) {
      maskOutput[0] = local.transform(maskOutput[0]);
    }
    return maskOutput;
  });

  const maskPattern = createMaskPattern(maskHandler, () => local.placeholder || "");

  const handleOnInput = (
    event: InputEvent & {
      currentTarget: HTMLInputElement;
      target: HTMLInputElement;
    },
  ) => {
    maskPattern(event);
    local.onInput?.(event);
  };

  const handleOnPaste = (event: ClipboardEvent) => {
    maskPattern(event);
  };

  return (
    <div class="flex flex-col">
      <Show when={local.label}>
        <label for={local.name} class="block text-sm font-medium text-nowrap text-gray-700">
          {local.label} {local.required && <span>*</span>}
        </label>
      </Show>
      <div>
        <label for={local.name} />
        <input
          {...inputProps}
          class={cn(
            "mt-1 w-full appearance-none rounded border border-gray-300 px-3 py-2 leading-tight text-gray-700 shadow focus:ring-2 focus:outline-none disabled:pointer-events-none disabled:bg-gray-100 disabled:opacity-70",
            { "border-red-500": local.error },
            local.class,
          )}
          id={local.name}
          disabled={local.disabled}
          value={local.value || ""}
          aria-invalid={!!local.error}
          aria-disabled={!!local.disabled}
          aria-errormessage={`${local.name}-error`}
          placeholder={local.placeholder}
          onInput={handleOnInput}
          onPaste={handleOnPaste}
        />
      </div>
      <Show when={local.error}>
        <ShowError error={local.error} />
      </Show>
    </div>
  );
}
