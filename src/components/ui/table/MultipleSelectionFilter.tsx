import { createEffect, createMemo, createSignal, For, Show } from "solid-js";

export type MultipleSelectionFilterOptionType<TValue> = TValue | { label: string; value: TValue };

export type MultipleSelectionFilterProps<TValue> = {
  id: string;
  filterValue: TValue[];
  filterOptions?: MultipleSelectionFilterOptionType<TValue>[];
  onChange: (value: TValue[]) => void;
};

export const MultipleSelectionFilter = <TValue,>(props: MultipleSelectionFilterProps<TValue>) => {
  const options = createMemo(() => props.filterOptions || []);

  const [selectedValues, setSelectedValues] = createSignal<TValue[]>(props.filterValue ?? []);

  createEffect(() => {
    setSelectedValues(props.filterValue ?? []);
  });

  const contains = (val: TValue) => {
    const index = selectedValues().findIndex((item) => item === val);
    return index !== -1;
  };

  const handleOptionChange = (val: TValue, checked: boolean) => {
    let newOptions: TValue[];
    if (checked) {
      newOptions = [...selectedValues(), val];
    } else {
      newOptions = selectedValues().filter((item) => item !== val);
    }
    setSelectedValues(newOptions);
    props.onChange(newOptions);
  };

  return (
    <div class="space-y-4">
      <div class="space-y-2">
        <Show when={options() && options().length > 0}>
          {
            <For each={options()}>
              {(option) => {
                let optionValue: TValue;
                let optionLabel: string;
                if (option !== null && typeof option === "object" && "label" in option && "value" in option) {
                  optionLabel = option.label;
                  optionValue = option.value;
                } else {
                  optionLabel = String(option);
                  optionValue = option;
                }

                return (
                  <div class="flex items-center">
                    <div class="group grid size-4 shrink-0 grid-cols-1">
                      <input
                        id={`${props.id}-${optionValue}`}
                        checked={contains(optionValue)}
                        onChange={(e) => handleOptionChange(optionValue, e.currentTarget.checked)}
                        type="checkbox"
                        class="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-400 bg-white checked:border-sky-600 checked:bg-sky-600 indeterminate:border-sky-600 indeterminate:bg-sky-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                      />
                      <svg
                        class="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                        viewBox="0 0 14 14"
                        fill="none"
                      >
                        <Show when={contains(optionValue)}>
                          <path
                            class="opacity-100"
                            d="M3 8L6 11L11 3.5"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </Show>
                      </svg>
                    </div>

                    <label for={`${props.id}-${optionValue}`} class="ml-2 grow text-sm text-gray-800">
                      {`${optionLabel}`}
                    </label>
                  </div>
                );
              }}
            </For>
          }
        </Show>
      </div>
    </div>
  );
};
