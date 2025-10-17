import { cn } from "@/utils/cls-util";
import { Component, ComponentProps, createEffect, createSignal, JSX, mergeProps, splitProps } from "solid-js";

type SliderProps = Omit<ComponentProps<"input">, "type" | "onChange" | "onInput"> & {
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  onInput?: (value: number) => void;
  trackClass?: string;
  processTrackClass?: string;
  thumbClass?: string;
};

export const Slider: Component<SliderProps> = (props) => {
  const mergedProps = mergeProps(
    {
      value: props.min ?? 0,
      min: 0,
      max: 100,
      step: 1,
      disabled: false,
      showValue: false,
      class: "",
      trackClass: "",
      processTrackClass: "",
      thumbClass: "",
    },
    props,
  );

  const [local, inputProps] = splitProps(mergedProps, [
    "value",
    "min",
    "max",
    "step",
    "disabled",
    "class",
    "trackClass",
    "processTrackClass",
    "thumbClass",
    "onChange",
    "onInput",
  ]);

  const [internalValue, setInternalValue] = createSignal(
    local.value > local.min && local.value < local.max ? local.value : local.min,
  );
  const [isFocused, setIsFocused] = createSignal(false);

  // Derived signals
  const min = () => local.min ?? 0;
  const max = () => local.max ?? 100;
  const step = () => local.step ?? 1;
  const progressPercentage = () => ((internalValue() - min()) / (max() - min())) * 100;

  //////////// Effect /////////////
  createEffect(() => {
    setInternalValue(local.value ?? 0);
  });

  // Event handlers
  const handleInput: JSX.EventHandler<HTMLInputElement, InputEvent> = (e) => {
    const newValue = parseFloat(e.currentTarget.value);
    setInternalValue(newValue);
    local.onInput?.(newValue);
  };

  const handleChange: JSX.EventHandler<HTMLInputElement, Event> = (e) => {
    const newValue = parseFloat(e.currentTarget.value);
    setInternalValue(newValue);
    local.onChange?.(newValue);
  };

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  return (
    <div class={`relative w-full ${local.class || ""}`}>
      {/* Hidden native input */}
      <input
        {...inputProps}
        type="range"
        min={min()}
        max={max()}
        step={step()}
        value={internalValue()}
        disabled={props.disabled}
        onInput={handleInput}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        class={cn("absolute z-10 h-full w-full opacity-0", local.disabled ? "pointer-events-none" : "cursor-pointer")}
        aria-valuemin={min()}
        aria-valuemax={max()}
        aria-valuenow={internalValue()}
      />

      {/* Custom track */}
      <div class="relative flex h-4 w-full items-center">
        {/* Full track */}
        <div class={cn("absolute h-1.5 w-full rounded-full bg-gray-300", local.trackClass)} />

        {/* Progress track */}
        <div
          class={cn(
            "absolute h-1.5 rounded-full",
            local.disabled ? "bg-blue-200" : "bg-blue-600",
            local.processTrackClass,
          )}
          style={{ width: `${progressPercentage()}%` }}
        />

        {/* Thumb with focus styles */}
        <div
          class={cn(
            "absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 bg-white shadow-sm transition-all duration-100",
            {
              "border-blue-500": local.disabled,
              "border-blue-600": !local.disabled && !isFocused(),
              "border-blue-800 ring-4 ring-blue-200": !local.disabled && isFocused(),
            },
            local.thumbClass,
          )}
          style={{ left: `calc(${progressPercentage()}% - 8px)` }}
        />
      </div>
    </div>
  );
};
